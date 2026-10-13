import { LANG, MODULE_ID } from "./constants.mjs";
import { PATTERNS, CATEGORY_MAX, REPUTATION, adjustCheckHtml, kindOfModifier, reputationTier, tierThreshold, tierReached, parseChase, chaseDefaults, chaseRequired, chaseStatus, partyMembers } from "./utils.mjs";
import { parseInfiltration, infiltrationDefaults, infiltrationStatus, currentDC, failThreshold } from "./infiltration.mjs";
import { hackingDefaults, hackingStatus, parseComputer, reduceChecks } from "./hacking.mjs";
import { applyModifiersToGroups, modifierSkills, skillsLabel } from "./modifiers.mjs";

const { JournalEntryPageProseMirrorSheet } = foundry.applications.sheets.journal;

const VIEW_TEMPLATE = `modules/${MODULE_ID}/templates/sheets/subsystem-view.hbs`;

export const SHEET_CLASSES = {
    research: `${MODULE_ID}.ResearchPageSheet`,
    influence: `${MODULE_ID}.InfluencePageSheet`,
    reputation: `${MODULE_ID}.ReputationPageSheet`,
    chases: `${MODULE_ID}.ChasePageSheet`,
    infiltration: `${MODULE_ID}.InfiltrationPageSheet`,
    victory: `${MODULE_ID}.VictoryPageSheet`,
    hacking: `${MODULE_ID}.HackingPageSheet`
};

const pct = (n, max) => (max ? Math.clamp((n / max) * 100, 0, 100) : 0);
const signed = (n) => (n > 0 ? `+${n}` : `${n}`);
const numericThreshold = (token) => Number(token.replace("-", "-"));

export class SubsystemPageSheet extends JournalEntryPageProseMirrorSheet {
    /** @type {"research"|"influence"|"reputation"|"chases"|"infiltration"|"victory"|"hacking"} */
    static SUBSYSTEM = null;

    static PARSE_OPTIONS = {};

    /** @override */
    static VIEW_PARTS = {
        ...JournalEntryPageProseMirrorSheet.VIEW_PARTS,
        content: {
            ...JournalEntryPageProseMirrorSheet.VIEW_PARTS.content,
            template: VIEW_TEMPLATE
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        if (!this.isView) return context;

        const page = this.document;
        const TextEditor = foundry.applications.ux.TextEditor.implementation;
        const html = await TextEditor.enrichHTML(page.text.content ?? "", {
            relativeTo: page,
            secrets: page.isOwner
        });
        const parsed = this._parse(html, page.name);
        Object.assign(context, { subsystem: this.constructor.SUBSYSTEM }, this._prepareView(parsed, this.#state()));
        return context;
    }

    /**
     * @protected
     */
    _parse(html, fallbackName) {
        return SubsystemPageSheet.parse(html, fallbackName, this.constructor.PARSE_OPTIONS);
    }

    #state() {
        const data = game.settings.get(MODULE_ID, "subsystems")[this.constructor.SUBSYSTEM];
        if (!data || this.document.parent?.uuid !== data.journal) return null;
        const state = data.topics[this.document.id];
        if (!game.user.isGM && !state?.discovered) return null;
        return state ?? {};
    }

    /**
     * @param {object} parsed
     * @param {object|null} state
     * @abstract
     */
    _prepareView(parsed, state) {
        throw new Error("Subclasses must implement _prepareView");
    }

    /**
     * @param {string} html
     * @param {string} fallbackName
     * @param {object} options
     * @param {RegExp} options.pattern
     * @param {Function} [options.toThreshold]
     * @param {boolean} [options.collectLocations]
     */
    static parse(html, fallbackName, { pattern, toThreshold = numericThreshold, collectLocations = false } = {}) {
        const template = document.createElement("template");
        template.innerHTML = html;
        const queue = [...template.content.children];
        const firstHeading = queue.find((el) => /^H[1-6]$/.test(el.tagName));

        const thresholds = [];
        const groups = new Map();
        const modifiers = [];
        const locations = [];
        const notes = [];
        const counts = { weakness: 0, resistance: 0 };
        let pendingLabel = null;
        let currentLabel = null;

        const flushPending = () => {
            if (pendingLabel) notes.push(pendingLabel.el.outerHTML);
            pendingLabel = null;
        };
        const consumePending = () => {
            if (pendingLabel) currentLabel = pendingLabel.text;
            pendingLabel = null;
        };
        const sectionLabel = () => pendingLabel?.text || currentLabel || "";
        const isLocationSection = () => collectLocations && /location/i.test(sectionLabel());

        while (queue.length) {
            const el = queue.shift();
            if (el === firstHeading) continue;

            if (el.tagName === "UL" || el.tagName === "OL") {
                if (el.querySelector("a.inline-check") || kindOfModifier(sectionLabel()) || isLocationSection()) {
                    queue.unshift(...[...el.children].map((li) => li.querySelector(":scope > p") ?? li));
                    continue;
                }
            }

            const isHeading = /^H[1-6]$/.test(el.tagName);
            const isText = el.tagName === "P" || el.tagName === "LI";
            const text = el.textContent.trim();
            const bold = isText ? el.querySelector("strong, b") : null;
            const boldText = bold?.textContent.trim() ?? "";
            const leadIn = boldText && text.startsWith(boldText) ? boldText.replace(/[:.]$/, "") : "";

            const match = leadIn && pattern ? leadIn.match(pattern) ?? text.match(pattern) : null;
            if (match) {
                flushPending();
                currentLabel = null;
                const body = el.cloneNode(true);
                body.querySelector("strong, b")?.remove();
                thresholds.push({ threshold: toThreshold(match[1]), token: match[1], html: body.innerHTML.trim() });
                continue;
            }

            const anchors = isText ? [...el.querySelectorAll("a.inline-check")] : [];
            if (anchors.length) {
                const label = leadIn || sectionLabel();
                pendingLabel = null;
                currentLabel = label;
                if (!groups.has(label)) groups.set(label, new Map());
                const checks = groups.get(label);
                anchors.forEach((anchor, i) => {
                    let checkLabel = "";
                    for (let node = anchor.nextSibling; node && node !== anchors[i + 1]; node = node.nextSibling) {
                        checkLabel += node.textContent;
                    }
                    checkLabel = checkLabel.trim().replace(/^[-–—:,]\s*/, "");
                    checks.set(`${anchor.outerHTML}|${checkLabel}`, { html: anchor.outerHTML, label: checkLabel });
                });
                continue;
            }

            if (isHeading || (boldText && boldText === text)) {
                flushPending();
                currentLabel = null;
                pendingLabel = { el, text: text.replace(/[:.]$/, "") };
                continue;
            }

            if (isText && text) {
                const kind = kindOfModifier(leadIn || sectionLabel());
                if (kind) {
                    consumePending();
                    const body = el.cloneNode(true);
                    let plain = text;
                    if (leadIn) {
                        body.querySelector("strong, b")?.remove();
                        plain = text.slice(boldText.length).trim();
                    }
                    const amount = Number(plain.match(/\bby\s+(\d+)/i)?.[1] ?? 2);
                    modifiers.push({ key: `${kind}-${counts[kind]++}`, kind, html: body.innerHTML.trim(), amount, skills: modifierSkills(plain) });
                    continue;
                }

                if (isLocationSection()) {
                    consumePending();
                    locations.push({ key: `location-${locations.length}`, html: el.innerHTML });
                    continue;
                }
            }

            flushPending();
            currentLabel = null;
            notes.push(el.outerHTML);
        }
        flushPending();

        return {
            name: firstHeading?.textContent.trim() || fallbackName,
            notes: notes.join("\n"),
            thresholds: thresholds.sort((a, b) => a.threshold - b.threshold),
            groups: [...groups].map(([rawLabel, checks], i) => {
                const capMatch = rawLabel.match(CATEGORY_MAX);
                const label = capMatch ? rawLabel.replace(capMatch[0], "").trim() : rawLabel;
                return {
                    key: label ? label.slugify({ strict: true }) : `group-${i}`,
                    label,
                    max: capMatch ? Number(capMatch[1]) : null,
                    checks: [...checks.values()]
                };
            }),
            modifiers,
            locations
        };
    }
}

/* -------------------------------------------- */

export class ResearchPageSheet extends SubsystemPageSheet {
    static SUBSYSTEM = "research";
    static PARSE_OPTIONS = { pattern: PATTERNS.research };

    /** @override */
    _prepareView(parsed, state) {
        const max = parsed.thresholds.at(-1)?.threshold ?? 0;
        const points = state ? Math.min(state.points ?? 0, max) : 0;
        const categories = state?.categories ?? {};

        return {
            name: parsed.name,
            notes: parsed.notes,
            checksTitle: "Research Checks",
            thresholdsTitle: "Research Thresholds",
            progress: state && {
                label: `${points} / ${max} RP`,
                fillLeft: 0,
                percent: pct(points, max)
            },
            groups: parsed.groups.map((g) => ({
                ...g,
                cap: g.max ? (state ? `${categories[g.key] ?? 0} / ${g.max} max` : `${g.max} max`) : ""
            })),
            modifiers: [],
            locations: [],
            thresholds: parsed.thresholds.map((t) => ({
                ...t,
                badge: t.threshold,
                tooltip: `${t.threshold} RP`,
                reached: !!state && points >= t.threshold,
                onBar: true,
                pct: pct(t.threshold, max)
            }))
        };
    }
}

/* -------------------------------------------- */

export class VictoryPageSheet extends SubsystemPageSheet {
    static SUBSYSTEM = "victory";
    static PARSE_OPTIONS = { pattern: PATTERNS.victory };

    /** @override */
    _prepareView(parsed, state) {
        const max = parsed.thresholds.at(-1)?.threshold ?? 0;
        const points = state ? Math.min(state.points ?? 0, max) : 0;

        return {
            name: parsed.name,
            notes: parsed.notes,
            checksTitle: "Checks",
            thresholdsTitle: "Victory Point Thresholds",
            progress: state && {
                label: `${points} / ${max} VP`,
                fillLeft: 0,
                percent: pct(points, max)
            },
            groups: parsed.groups.map((g) => ({ ...g, cap: "" })),
            modifiers: [],
            locations: [],
            thresholds: parsed.thresholds.map((t) => ({
                ...t,
                badge: t.threshold,
                tooltip: `${t.threshold} VP`,
                reached: !!state && points >= t.threshold,
                onBar: true,
                pct: pct(t.threshold, max)
            }))
        };
    }
}

/* -------------------------------------------- */

export class InfluencePageSheet extends SubsystemPageSheet {
    static SUBSYSTEM = "influence";
    static PARSE_OPTIONS = { pattern: PATTERNS.influence };

    /** @override */
    _prepareView(parsed, state) {
        const defaultMax = parsed.thresholds.at(-1)?.threshold ?? 0;
        const max = state?.max ?? defaultMax;
        const points = state ? Math.min(state.points ?? 0, max) : 0;
        const active = new Set(state?.active ?? []);

        const modifiers = parsed.modifiers.map((m) => {
            const value = m.kind === "weakness" ? -m.amount : m.amount;
            return {
                ...m,
                value,
                signedLabel: signed(value),
                skillsLabel: skillsLabel(m.skills),
                active: active.has(m.key),
                kindLabel: m.kind === "weakness" ? "Weakness" : "Resistance"
            };
        });

        return {
            name: parsed.name,
            notes: parsed.notes,
            checksTitle: "Checks",
            thresholdsTitle: "Influence Thresholds",
            progress: state && {
                label: `${points} / ${max} Influence`,
                fillLeft: 0,
                percent: pct(points, max)
            },
            groups: applyModifiersToGroups(parsed.groups, modifiers).map((g) => ({ ...g, cap: "" })),
            modifiers,
            locations: [],
            thresholds: parsed.thresholds.map((t) => ({
                ...t,
                badge: t.threshold,
                tooltip: `${t.threshold} Influence`,
                reached: !!state && points >= t.threshold,
                onBar: t.threshold <= max,
                pct: pct(t.threshold, max)
            }))
        };
    }
}

/* -------------------------------------------- */

export class ReputationPageSheet extends SubsystemPageSheet {
    static SUBSYSTEM = "reputation";
    static PARSE_OPTIONS = { pattern: PATTERNS.reputation, toThreshold: tierThreshold, collectLocations: true };

    /** @override */
    _prepareView(parsed, state) {
        const { min, max } = REPUTATION;
        const toPct = (n) => ((Math.clamp(n, min, max) - min) / (max - min)) * 100;

        const completed = new Set(state?.completed ?? []);
        const locations = parsed.locations.map((l) => ({ ...l, completed: completed.has(l.key) }));
        const bonus = locations.filter((l) => l.completed).length;
        const base = state?.points ?? 0;
        const total = state ? Math.clamp(base + bonus, min, max) : 0;
        const currentTier = state ? reputationTier(total) : null;

        const zero = toPct(0);
        const here = toPct(total);

        return {
            name: parsed.name,
            notes: parsed.notes,
            tierKey: currentTier?.toLowerCase(),
            thresholdsTitle: "Reputation",
            locationsTitle: "Locations",
            locationsHint: "+1 reputation each",
            progress: state && {
                label: `${signed(total)} · ${currentTier}`,
                tooltip: `Base ${base} + ${bonus} from locations`,
                fillLeft: Math.min(zero, here),
                percent: Math.abs(here - zero),
                center: true
            },
            groups: parsed.groups.map((g) => ({ ...g, cap: "" })),
            modifiers: [],
            locations,
            // Read top-down like Table 3-2: Revered first, Hunted last
            thresholds: [...parsed.thresholds].reverse().map((t) => {
                const tier = REPUTATION.tiers.find((r) => r.key.toLowerCase() === t.token.toLowerCase());
                const name = tier?.key ?? t.token;
                return {
                    ...t,
                    badge: name,
                    tooltip: name,
                    tierKey: name.toLowerCase(),
                    reached: !!state && tierReached(t.token, total),
                    current: name === currentTier,
                    onBar: true,
                    pct: toPct(t.threshold)
                };
            })
        };
    }
}

/* -------------------------------------------- */

export class ChasePageSheet extends SubsystemPageSheet {
    static SUBSYSTEM = "chases";

    /** @override */
    _parse(html, fallbackName) {
        return parseChase(html, fallbackName);
    }

    /** @override */
    _prepareView(parsed, state) {
        const prefix = `${LANG}.Chases`;
        const isGM = game.user.isGM;
        const count = parsed.obstacles.length;
        const s = state ? { ...chaseDefaults(), ...state } : null;
        const party = s ? Math.min(s.obstacle, count) : -1;
        const opponent = s ? Math.min(s.opponent, count) : -1;
        const hasOpponent = !!s && s.type !== "beatTheClock";

        const obstacles = parsed.obstacles.map((o, i) => {
            const required = chaseRequired(o, s);
            const current = i === party;
            const points = current ? Math.min(s.points, required) : 0;
            return {
                ...o,
                index: i + 1,
                hidden: !!s && !isGM && i > s.revealedThrough,
                unrevealed: !!s && isGM && i > s.revealedThrough,
                cleared: !!s && i < party,
                current,
                party: current,
                opponent: hasOpponent && i === opponent,
                levelLabel: o.level ? game.i18n.format(`${prefix}.Level`, { level: o.level }) : "",
                cpLabel: current ? `${points} / ${required} CP` : `${required} CP`,
                cpPercent: current ? pct(points, required) : 0
            };
        });

        let summary = null;
        if (s) {
            const status = chaseStatus(s, count);
            const limit = s.rounds ?? count;
            summary = {
                statusLabel: game.i18n.format(`${prefix}.Status.${status.key}`, status.data ?? {}),
                statusTone: status.tone,
                roundLabel: s.type === "beatTheClock"
                    ? game.i18n.format(`${prefix}.RoundOf`, { round: s.round, limit })
                    : game.i18n.format(`${prefix}.Round`, { round: s.round }),
                typeLabel: _loc(`${prefix}.Type.${s.type}`)
            };
        }

        return {
            name: parsed.name,
            notes: parsed.intro,
            progress: null,
            groups: [],
            modifiers: [],
            locations: [],
            thresholds: [],
            chase: {
                tracked: !!s,
                summary,
                obstacles,
                finish: {
                    label: _loc(`${prefix}.Finish`),
                    current: !!s && party >= count,
                    party: !!s && party >= count,
                    opponent: hasOpponent && opponent >= count
                }
            }
        };
    }
}

/* -------------------------------------------- */

const INFILTRATION_STATISTICS = new Set([
    "acrobatics", "arcana", "athletics", "computers", "crafting", "deception", "diplomacy",
    "intimidation", "medicine", "nature", "occultism", "performance", "piloting", "religion",
    "society", "stealth", "survival", "thievery", "perception", "fortitude", "reflex", "will"
]);

const initials = (name) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export class InfiltrationPageSheet extends SubsystemPageSheet {
    static SUBSYSTEM = "infiltration";

    /** @override */
    _parse(html, fallbackName) {
        return parseInfiltration(html, fallbackName);
    }

    static #adjustForAwareness(html, { dc, skillDc }) {
        if (!dc && !Object.values(skillDc).some(Boolean)) return html;
        const template = document.createElement("template");
        template.innerHTML = html;
        for (const anchor of template.content.querySelectorAll("a.inline-check")) {
            const slug = anchor.dataset.pf2Check?.toLowerCase()
                ?? anchor.textContent.toLowerCase().match(/[a-z]+/g)?.find((w) => INFILTRATION_STATISTICS.has(w))
                ?? "";
            const delta = dc + (skillDc[slug] ?? 0);
            if (delta) anchor.outerHTML = adjustCheckHtml(anchor.outerHTML, delta);
        }
        return template.innerHTML;
    }

    static #dcLabel({ dc, skillDc }, prefix) {
        const parts = [];
        if (dc) parts.push(game.i18n.format(`${prefix}.DcIncrease`, { dc }));
        const bySize = {};
        for (const [skill, n] of Object.entries(skillDc)) if (n) (bySize[n] ??= []).push(skill.capitalize());
        for (const [n, skills] of Object.entries(bySize)) {
            parts.push(`${skills.join(", ")} ${game.i18n.format(`${prefix}.DcIncrease`, { dc: Number(n) + dc })}`);
        }
        return parts.join(" · ");
    }

    static #thresholdLabel(t, prefix) {
        if (t.html) return t.html;
        if (t.fail) return _loc(`${prefix}.Threshold.Fail`);
        return t.dc
            ? game.i18n.format(`${prefix}.Threshold.DcComplication`, { dc: t.dc })
            : _loc(`${prefix}.Threshold.Complication`);
    }

    /** @override */
    _prepareView(parsed, state) {
        const prefix = `${LANG}.Infiltration`;
        const s = state ? { ...infiltrationDefaults(), ...state } : null;
        const party = s ? partyMembers() : [];
        const partyIds = party.map((a) => a.id);
        const thresholds = parsed.thresholds;
        const fail = failThreshold(thresholds);
        const dcState = s ? currentDC(thresholds, s.ap) : { dc: 0, skillDc: {} };
        const adjust = (html) => InfiltrationPageSheet.#adjustForAwareness(html, dcState);
        const pcState = (id) => s?.pcs[id] ?? { objective: 0, ip: {}, cleared: [] };

        const objectives = parsed.objectives.map((o, i) => {
            const here = party.filter((a) => pcState(a.id).objective === i);
            const allPast = !!s && party.length > 0 && party.every((a) => pcState(a.id).objective > i);
            return {
                index: i + 1,
                name: o.name,
                description: o.description,
                requiredLabel: game.i18n.format(`${prefix}.Required`, {
                    required: Math.min(o.required ?? 1, o.obstacles.length)
                }),
                current: here.length > 0,
                cleared: allPast,
                here: here.map((a) => ({ name: a.name, initials: initials(a.name) })),
                obstacles: o.obstacles.map((ob) => {
                    const group = ob.type === "group";
                    const groupCleared = !!s && group && s.groupCleared.includes(ob.key);
                    const groupIp = s && group ? Math.min(s.group[ob.key] ?? 0, ob.points) : 0;
                    const pips = !s || group ? [] : party.map((a) => {
                        const p = pcState(a.id);
                        const done = p.cleared.includes(ob.key);
                        const value = p.objective === i ? (p.ip[ob.key] ?? 0) : 0;
                        let pipState = "pending";
                        if (done) pipState = "cleared";
                        else if (value > 0) pipState = "partial";
                        else if (p.objective === i) pipState = "none";
                        else if (p.objective > i) pipState = "past";
                        return { name: a.name, initials: initials(a.name), state: pipState };
                    });
                    return {
                        ...ob,
                        group,
                        cleared: groupCleared,
                        typeLabel: _loc(`${prefix}.Type.${ob.type}`),
                        ipLabel: s && group ? `${groupIp} / ${ob.points} IP` : `${ob.points} IP`,
                        pips,
                        checks: ob.checks.map(adjust)
                    };
                })
            };
        });

        const complications = parsed.complications.map((c) => {
            const cs = s?.complications[c.key];
            return {
                ...c,
                active: !!cs?.active && !cs?.resolved,
                resolved: !!cs?.resolved,
                triggerLabel: c.triggerAPs.map((n) => `${n} AP`).join(", "),
                checks: c.checks.map(adjust),
                outcomeList: Object.entries(c.outcomes).map(([k, html]) => ({ label: _loc(`${prefix}.Outcome.${k}`), html }))
            };
        });

        const opportunities = parsed.opportunities.map((p) => ({
            ...p,
            used: !!s && s.opportunities.includes(p.key),
            checks: p.checks.map(adjust)
        }));

        const awareness = thresholds.map((t) => ({
            ap: t.ap,
            label: InfiltrationPageSheet.#thresholdLabel(t, prefix),
            reached: !!s && s.ap >= t.ap,
            fail: t.fail
        }));

        let summary = null;
        if (s) {
            const status = infiltrationStatus(parsed, s, partyIds);
            summary = {
                statusLabel: game.i18n.format(`${prefix}.Status.${status.key}`, status.data ?? {}),
                statusTone: status.tone,
                apLabel: `${s.ap} / ${fail.ap} AP`,
                percent: pct(s.ap, fail.ap),
                marks: thresholds.map((t) => ({ pct: pct(t.ap, fail.ap), reached: s.ap >= t.ap, tooltip: `${t.ap} AP` })),
                edge: s.edge,
                roundLabel: game.i18n.format(`${prefix}.Round`, { round: s.round }),
                dcLabel: InfiltrationPageSheet.#dcLabel(dcState, prefix)
            };
        }

        return {
            name: parsed.name,
            notes: [parsed.intro, parsed.notes].filter(Boolean).join("\n"),
            progress: null,
            groups: [],
            modifiers: [],
            locations: [],
            thresholds: [],
            infiltration: {
                tracked: !!s,
                summary,
                objectives,
                complications,
                opportunities,
                awareness
            }
        };
    }
}

/* -------------------------------------------- */

export class HackingPageSheet extends SubsystemPageSheet {
    static SUBSYSTEM = "hacking";

    /** @override */
    _parse(html, fallbackName) {
        return parseComputer(html, fallbackName);
    }

    /** @override */
    _prepareView(parsed, state) {
        const prefix = `${LANG}.Hacking`;
        const s = state ? { ...hackingDefaults(), ...state } : null;
        const exploited = new Set(s?.exploited ?? []);
        const status = s ? hackingStatus(parsed, s) : null;

        const accessPoints = parsed.accessPoints.map((ap, i) => {
            const { successes = 0, failures = 0 } = s?.points[ap.key] ?? {};
            const vulnerabilities = ap.vulnerabilities.map((v) => ({
                ...v,
                exploited: exploited.has(v.key),
                reductionLabel: `DC -${v.reduction}`
            }));
            const reduction = vulnerabilities.filter((v) => v.exploited).reduce((sum, v) => sum + v.reduction, 0);
            const hacked = !!s && successes >= ap.required;

            return {
                ...ap,
                index: i + 1,
                hacked,
                typeLabel: _loc(`${prefix}.Type.${ap.type}`),
                requiredLabel: s
                    ? `${game.i18n.format(`${prefix}.SuccessesOf`, { successes: Math.min(successes, ap.required), required: ap.required })} · ${game.i18n.format(`${prefix}.Failures`, { failures })}`
                    : game.i18n.format(`${prefix}.SuccessesNeeded`, { required: ap.required }),
                checks: reduceChecks(ap.checks, reduction, ap.minDC),
                reductionLabel: reduction ? `DC -${reduction}` : "",
                minLabel: ap.minDC ? game.i18n.format(`${prefix}.MinDC`, { dc: ap.minDC }) : "",
                vulnerabilities,
                countermeasures: ap.countermeasures.map((cm) => {
                    const cs = s?.countermeasures[cm.key] ?? {};
                    const tone = !s ? "" : cs.disabled ? "disabled" : cs.triggered ? "triggered" : cs.noticed ? "noticed" : "";
                    return {
                        ...cm,
                        tone,
                        stateLabel: tone ? _loc(`${prefix}.CmState.${tone}`) : "",
                        failuresLabel: game.i18n.format(`${prefix}.FailuresThreshold`, { failures: cm.failures })
                    };
                })
            };
        });

        return {
            name: parsed.name,
            notes: parsed.description,
            progress: null,
            groups: [],
            modifiers: [],
            locations: [],
            thresholds: [],
            hacking: {
                tracked: !!s,
                summary: s && {
                    statusLabel: _loc(`${prefix}.Status.${status.key}`),
                    statusTone: status.tone,
                    roundLabel: game.i18n.format(`${prefix}.Round`, { round: s.round })
                },
                accessPoints,
                outcomes: [
                    parsed.outcomes.criticalSuccess && {
                        label: _loc(`${prefix}.Outcome.criticalSuccess`),
                        html: parsed.outcomes.criticalSuccess,
                        reached: !!status?.critical
                    },
                    parsed.outcomes.success && {
                        label: _loc(`${prefix}.Outcome.success`),
                        html: parsed.outcomes.success,
                        reached: !!status?.hacked
                    }
                ].filter(Boolean)
            }
        };
    }
}
