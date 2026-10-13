import { adjustCheckHtml } from "./utils.mjs";
import { LANG } from "./constants.mjs";

/* ==========================================================================
   Infiltration: parsing, state helpers, and view building
   ========================================================================== */

const PREFIX = `${LANG}.Infiltration`;

export const DEFAULT_THRESHOLDS = [
    { ap: 5, dc: 1, skillDc: {}, fail: false, html: "" },
    { ap: 10, dc: 1, skillDc: {}, fail: false, html: "" },
    { ap: 15, dc: 2, skillDc: {}, fail: false, html: "" },
    { ap: 20, dc: 2, skillDc: {}, fail: true, html: "" }
];

const AP_WORD = String.raw`(?:AP|Awareness Points?)\b`;

const DC_STATISTICS = new Set([
    "acrobatics", "arcana", "athletics", "computers", "crafting", "deception", "diplomacy",
    "intimidation", "medicine", "nature", "occultism", "performance", "piloting", "religion",
    "society", "stealth", "survival", "thievery", "perception", "fortitude", "reflex", "will"
]);

const HAS_CHECK = /@Check\[/i;
const IP_TEXT = /^\s*(\d+)\s*(?:IP|Infiltration Points?)\b/i;
const OUTCOMES = {
    "critical success": "criticalSuccess",
    "success": "success",
    "failure": "failure",
    "critical failure": "criticalFailure"
};

const isCheck = (el) => !!el.querySelector("a.inline-check") || HAS_CHECK.test(el.textContent);
const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

function leadIn(el) {
    const bold = el.querySelector("strong, b");
    const boldText = bold?.textContent.trim() ?? "";
    const text = el.textContent.trim();
    if (!boldText || !text.startsWith(boldText)) return null;
    const body = el.cloneNode(true);
    body.querySelector("strong, b")?.remove();
    return {
        label: boldText.replace(/[:.]$/, "").trim(),
        html: body.innerHTML.trim(),
        text: text.slice(boldText.length).trim()
    };
}

function stripLeadIns(el, labels, keepFromCheck) {
    const clone = el.cloneNode(true);
    for (const bold of [...clone.querySelectorAll("strong, b")]) {
        if (labels.test(bold.textContent.trim().replace(/[:.]$/, ""))) bold.remove();
    }
    if (!keepFromCheck) return clone.innerHTML.trim();
    const html = clone.innerHTML;
    const anchorAt = html.search(/<a[^>]*class="[^"]*inline-check|@Check\[/i);
    return (anchorAt > 0 ? html.slice(anchorAt) : html).trim();
}

export function parseAP(html, fallback) {
    const text = String(html ?? "").replace(/<[^>]+>/g, " ");
    const match = text.match(new RegExp(String.raw`(\d+)\s*${AP_WORD}`, "i"));
    return match ? Number(match[1]) : fallback;
}

function parseTriggerAPs(text) {
    return [...text.matchAll(new RegExp(String.raw`(\d+)\s*${AP_WORD}`, "gi"))].map((m) => Number(m[1]));
}

function normalizeThresholds(list) {
    if (!list?.length) return DEFAULT_THRESHOLDS.map((t) => ({ ...t, skillDc: {} }));
    let dc = 0;
    const skillDc = {};
    const out = [...list].sort((a, b) => a.ap - b.ap).map((t) => {
        for (const sentence of t.text.split(/(?<=[.;])\s+/)) {
            const match = sentence.match(/^(.*?)\bDCs?\b[^.]*?(?:by\s*(?:a\s*total\s*of\s*)?|\+)\s*(\d+)/i);
            if (!match) continue;
            const amount = Number(match[2]);
            const total = /total/i.test(sentence);
            const skills = match[1].toLowerCase().split(/[^a-z]+/).filter((w) => DC_STATISTICS.has(w));
            if (skills.length) {
                for (const s of skills) skillDc[s] = total ? amount : (skillDc[s] ?? 0) + amount;
            } else {
                dc = total ? amount : dc + amount;
            }
        }
        return { ap: t.ap, dc, skillDc: { ...skillDc }, fail: /\bfail/i.test(t.text), html: t.html };
    });
    if (!out.some((t) => t.fail)) out.at(-1).fail = true;
    return out;
}

export function parseInfiltration(html, fallbackName) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const queue = [...template.content.children];
    const title = queue.find(isHeading);

    const result = {
        name: title?.textContent.trim() || fallbackName,
        intro: [],
        notes: [],
        objectives: [],
        complications: [],
        opportunities: [],
        thresholds: null
    };

    let section = null;
    let objective = null;
    let item = null;

    while (queue.length) {
        const el = queue.shift();
        if (el === title) continue;

        if (el.tagName === "H2") {
            const text = el.textContent.trim();
            item = null;
            if (/objective/i.test(text)) {
                section = "objective";
                objective = {
                    key: `o${result.objectives.length}`,
                    name: text.replace(/^objective\s*\d*\s*[:\-–—]?\s*/i, "").trim() || text,
                    required: null,
                    description: [],
                    obstacles: []
                };
                result.objectives.push(objective);
            } else if (/complication/i.test(text)) section = "complications";
            else if (/opportunit/i.test(text)) section = "opportunities";
            else if (/awareness/i.test(text)) {
                section = "awareness";
                result.thresholds = [];
            } else {
                section = "other";
                result.notes.push(el.outerHTML);
            }
            continue;
        }

        if (isHeading(el)) {
            const name = el.textContent.trim();
            if (section === "objective") {
                item = {
                    kind: "obstacle",
                    key: `${objective.key}-${objective.obstacles.length}`,
                    name, points: 1, type: "group",
                    checks: [], description: [], criticalFailure: ""
                };
                objective.obstacles.push(item);
            } else if (section === "complications") {
                item = {
                    kind: "complication",
                    key: `c${result.complications.length}`,
                    name, trigger: "", triggerAPs: [], points: null,
                    checks: [], description: [], outcomes: {}
                };
                result.complications.push(item);
            } else if (section === "opportunities") {
                item = {
                    kind: "opportunity",
                    key: `p${result.opportunities.length}`,
                    name, requirements: "",
                    checks: [], description: []
                };
                result.opportunities.push(item);
            } else {
                item = null;
                (section ? result.notes : result.intro).push(el.outerHTML);
            }
            continue;
        }

        if (el.tagName === "UL" || el.tagName === "OL") {
            if (isCheck(el) || section === "awareness") {
                queue.unshift(...[...el.children].map((li) => li.querySelector(":scope > p") ?? li));
                continue;
            }
        }

        const text = el.textContent.trim();
        if (!text) continue;
        const lead = leadIn(el);

        if (section === "awareness") {
            const match = (lead?.label ?? text).match(new RegExp(String.raw`^(\d+)\s*${AP_WORD}`, "i"));
            if (match) {
                const body = lead ? lead.html : el.innerHTML;
                result.thresholds.push({ ap: Number(match[1]), html: body.replace(/^\s*:\s*/, ""), text });
            } else {
                result.notes.push(el.outerHTML);
            }
            continue;
        }

        if (item) {
            const label = lead?.label.toLowerCase() ?? "";

            if (item.kind !== "opportunity") {
                const ipLine = /^(infiltration points?|ip)$/.test(label) ? lead.text : text.match(IP_TEXT) ? text : null;
                if (ipLine) {
                    const head = ipLine.split(/;|\bOvercome\b/i)[0];
                    const points = head.match(/(\d+)/);
                    if (points) item.points = Number(points[1]);
                    const type = head.match(/individual|group/i);
                    if (type && item.kind === "obstacle") item.type = type[0].toLowerCase();
                    if (isCheck(el)) item.checks.push(stripLeadIns(el, /^(infiltration points?|ip|overcome)$/i, true));
                    continue;
                }
            }

            if (item.kind === "complication" && label === "trigger") {
                const triggerText = lead.text.split(/\bOvercome\b/i)[0];
                item.trigger = lead.html.split(/<(?:strong|b)>\s*Overcome/i)[0].trim();
                item.triggerAPs = parseTriggerAPs(triggerText);
                if (isCheck(el)) item.checks.push(stripLeadIns(el, /^(trigger|overcome)$/i, true));
                continue;
            }

            if (isCheck(el)) {
                item.checks.push(lead && /^overcome$/.test(label) ? lead.html : el.innerHTML.trim());
                continue;
            }

            if (lead) {
                if (item.kind === "obstacle" && label === "critical failure") {
                    item.criticalFailure = lead.html;
                    continue;
                }
                if (item.kind === "complication") {
                    if (OUTCOMES[label]) {
                        item.outcomes[OUTCOMES[label]] = lead.html;
                        continue;
                    }
                }
                if (item.kind === "opportunity" && /^requirements?$/.test(label)) {
                    item.requirements = lead.html;
                    continue;
                }
            }
            item.description.push(el.outerHTML);
            continue;
        }

        if (section === "objective") {
            if (lead && /^required$/i.test(lead.label)) {
                objective.required = Number(lead.text.match(/\d+/)?.[0]) || null;
            } else {
                objective.description.push(el.outerHTML);
            }
            continue;
        }

        (section ? result.notes : result.intro).push(el.outerHTML);
    }

    const join = (list) => list.join("\n");
    return {
        ...result,
        intro: join(result.intro),
        notes: join(result.notes),
        objectives: result.objectives.map((o) => ({
            ...o,
            description: join(o.description),
            obstacles: o.obstacles.map((ob) => ({ ...ob, description: join(ob.description) }))
        })),
        complications: result.complications.map((c) => ({ ...c, description: join(c.description) })),
        opportunities: result.opportunities.map((p) => ({ ...p, description: join(p.description) })),
        thresholds: normalizeThresholds(result.thresholds)
    };
}

/* -------------------------------------------- */
/*  State helpers                               */
/* -------------------------------------------- */

export function infiltrationDefaults() {
    return {
        discovered: false, ap: 0, edge: 0, round: 1,
        pcs: {}, group: {}, groupCleared: [],
        complications: {}, opportunities: [],
        reached: [], alerts: []
    };
}

const newPC = () => ({ objective: 0, ip: {}, cleared: [] });

export const failThreshold = (thresholds) => thresholds.find((t) => t.fail) ?? thresholds.at(-1);

/**
 * @returns {{dc: number, skillDc: Record<string, number>}}
 */
export function currentDC(thresholds, ap) {
    const reached = thresholds.filter((t) => ap >= t.ap).at(-1);
    return { dc: reached?.dc ?? 0, skillDc: reached?.skillDc ?? {} };
}

function checkStatistic(anchor) {
    const slug = anchor.dataset.pf2Check ?? "";
    if (slug) return slug.toLowerCase();
    const word = anchor.textContent.toLowerCase().match(/[a-z]+/g)?.find((w) => DC_STATISTICS.has(w));
    return word ?? "";
}

export function applyAP(entry, delta, infil) {
    const fail = failThreshold(infil.thresholds);
    entry.ap = Math.clamp(entry.ap + delta, 0, fail.ap);
    for (const t of infil.thresholds) {
        if (entry.ap >= t.ap && !entry.reached.includes(t.ap)) {
            entry.reached.push(t.ap);
            if (!t.fail) entry.alerts.push(t.ap);
        }
    }
}

function objectiveComplete(infil, entry, pc) {
    const objective = infil.objectives[pc.objective];
    if (!objective) return false;
    const overcome = objective.obstacles.filter((o) =>
        o.type === "group" ? entry.groupCleared.includes(o.key) : pc.cleared.includes(o.key)
    ).length;
    const required = Math.min(objective.required ?? 1, objective.obstacles.length);
    return overcome >= required;
}

export function advancePCs(infil, entry, partyIds) {
    for (const id of partyIds) {
        const pc = (entry.pcs[id] ??= newPC());
        while (pc.objective < infil.objectives.length && objectiveComplete(infil, entry, pc)) {
            pc.objective += 1;
            pc.ip = {};
        }
    }
}

const findObstacle = (infil, key) => infil.objectives.flatMap((o) => o.obstacles).find((o) => o.key === key);

/**
 * @param {"critSuccess"|"success"|"failure"|"critFailure"} result
 */
export function applyResult(infil, entry, key, result, actorId, partyIds) {
    const obstacle = findObstacle(infil, key);
    if (obstacle) {
        if (result === "failure") return applyAP(entry, 1, infil);
        if (result === "critFailure") return applyAP(entry, parseAP(obstacle.criticalFailure, 2), infil);

        const amount = result === "critSuccess" ? 2 : 1;
        if (obstacle.type === "group") {
            if (entry.groupCleared.includes(key)) return;
            entry.group[key] = (entry.group[key] ?? 0) + amount;
            if (entry.group[key] >= obstacle.points) entry.groupCleared.push(key);
        } else {
            if (!actorId) return;
            const pc = (entry.pcs[actorId] ??= newPC());
            if (pc.cleared.includes(key)) return;
            pc.ip[key] = (pc.ip[key] ?? 0) + amount;
            if (pc.ip[key] >= obstacle.points) pc.cleared.push(key);
        }
        return advancePCs(infil, entry, partyIds);
    }

    const complication = infil.complications.find((c) => c.key === key);
    if (!complication) return;
    const state = (entry.complications[key] ??= { active: true, resolved: false, points: 0 });
    const resolve = () => {
        state.active = false;
        state.resolved = true;
    };

    if (result === "failure") {
        applyAP(entry, parseAP(complication.outcomes.failure, 1), infil);
        return resolve();
    }
    if (result === "critFailure") {
        applyAP(entry, parseAP(complication.outcomes.criticalFailure, 2), infil);
        return resolve();
    }
    if (complication.points) {
        state.points += result === "critSuccess" ? 2 : 1;
        if (state.points >= complication.points) resolve();
    } else {
        resolve();
    }
}

export function clearForAll(infil, entry, key, partyIds) {
    const objectiveIndex = infil.objectives.findIndex((o) => o.obstacles.some((ob) => ob.key === key));
    const obstacle = findObstacle(infil, key);
    if (!obstacle) return;
    if (obstacle.type === "group") {
        if (!entry.groupCleared.includes(key)) entry.groupCleared.push(key);
        entry.group[key] = obstacle.points;
    } else {
        for (const id of partyIds) {
            const pc = (entry.pcs[id] ??= newPC());
            if (pc.objective === objectiveIndex && !pc.cleared.includes(key)) pc.cleared.push(key);
        }
    }
    advancePCs(infil, entry, partyIds);
}

export function infiltrationStatus(infil, entry, partyIds) {
    if (!infil.objectives.length) return { key: "NoObjectives", tone: "warning" };
    if (!partyIds.length) return { key: "NoParty", tone: "warning" };
    if (entry.ap >= failThreshold(infil.thresholds).ap) return { key: "Discovered", tone: "bad" };
    const count = infil.objectives.length;
    const positions = partyIds.map((id) => entry.pcs[id]?.objective ?? 0);
    if (positions.every((p) => p >= count)) return { key: "Infiltrated", tone: "good" };
    return { key: "Objective", tone: "neutral", data: { current: Math.min(...positions) + 1, count } };
}

/* -------------------------------------------- */
/*  View building for the Subsystems window     */
/* -------------------------------------------- */

const initials = (name) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function thresholdLabel(t) {
    if (t.html) return t.html;
    if (t.fail) return _loc(`${PREFIX}.Threshold.Fail`);
    return t.dc
        ? game.i18n.format(`${PREFIX}.Threshold.DcComplication`, { dc: t.dc })
        : _loc(`${PREFIX}.Threshold.Complication`);
}

function dcBadge({ dc, skillDc }) {
    const parts = [];
    if (dc) parts.push(game.i18n.format(`${PREFIX}.DcIncrease`, { dc }));
    const bySize = {};
    for (const [skill, n] of Object.entries(skillDc)) if (n) (bySize[n] ??= []).push(skill.capitalize());
    for (const [n, skills] of Object.entries(bySize)) {
        parts.push(`${skills.join(", ")} ${game.i18n.format(`${PREFIX}.DcIncrease`, { dc: Number(n) + dc })}`);
    }
    return parts.join(" · ");
}

/**
 * @param {object} view
 * @param {object} state
 * @param {object} options
 * @param {Actor[]} options.party
 * @param {string|null} options.selectedId
 */
export function buildInfiltrationView(view, state, { party, selectedId }) {
    const thresholds = view.thresholds;
    const fail = failThreshold(thresholds);
    const dcState = currentDC(thresholds, state.ap);
    const anyDc = dcState.dc || Object.values(dcState.skillDc).some(Boolean);
    const adjustAll = (html) => {
        if (!anyDc) return html;
        const template = document.createElement("template");
        template.innerHTML = html;
        for (const a of template.content.querySelectorAll("a.inline-check")) {
            const delta = dcState.dc + (dcState.skillDc[checkStatistic(a)] ?? 0);
            if (delta) a.outerHTML = adjustCheckHtml(a.outerHTML, delta);
        }
        return template.innerHTML;
    };
    const count = view.objectives.length;
    const partyIds = party.map((a) => a.id);
    const status = infiltrationStatus(view, state, partyIds);
    const pcState = (id) => state.pcs[id] ?? newPC();

    const selected = party.find((a) => a.id === selectedId)
        ?? party.find((a) => pcState(a.id).objective < count)
        ?? party[0];

    const roster = party.map((a) => {
        const pc = pcState(a.id);
        const done = pc.objective >= count;
        return {
            id: a.id,
            name: a.name,
            img: a.img,
            selected: a.id === selected?.id,
            done,
            objectiveLabel: done ? "" : `${Math.min(pc.objective + 1, count)}/${count}`
        };
    });

    const selPC = selected ? pcState(selected.id) : null;
    const obj = selPC ? view.objectives[selPC.objective] : null;
    const objective = obj && {
        name: obj.name,
        label: game.i18n.format(`${PREFIX}.ObjectiveOf`, { index: selPC.objective + 1, count }),
        description: obj.description,
        requiredLabel: game.i18n.format(`${PREFIX}.Required`, { required: Math.min(obj.required ?? 1, obj.obstacles.length) }),
        obstacles: obj.obstacles.map((o) => {
            const group = o.type === "group";
            const ip = group ? (state.group[o.key] ?? 0) : (selPC.ip[o.key] ?? 0);
            const cleared = group ? state.groupCleared.includes(o.key) : selPC.cleared.includes(o.key);
            const pips = group ? [] : party
                .filter((a) => pcState(a.id).objective === selPC.objective)
                .map((a) => {
                    const p = pcState(a.id);
                    const done = p.cleared.includes(o.key);
                    const value = p.ip[o.key] ?? 0;
                    return {
                        name: a.name,
                        initials: initials(a.name),
                        state: done ? "cleared" : value > 0 ? "partial" : "none"
                    };
                });
            return {
                ...o,
                group,
                cleared,
                ipLabel: `${Math.min(ip, o.points)} / ${o.points} IP`,
                typeLabel: _loc(`${PREFIX}.Type.${o.type}`),
                pips,
                checks: o.checks.map(adjustAll)
            };
        })
    };

    const complications = view.complications.map((c) => {
        const cs = state.complications[c.key] ?? { active: false, resolved: false, points: 0 };
        return {
            ...c,
            active: cs.active && !cs.resolved,
            resolved: cs.resolved,
            ipLabel: c.points ? `${Math.min(cs.points, c.points)} / ${c.points} IP` : "",
            triggerLabel: c.triggerAPs.map((n) => `${n} AP`).join(", "),
            checks: c.checks.map(adjustAll),
            stateLabel: _loc(`${PREFIX}.ComplicationState.${cs.resolved ? "Resolved" : cs.active ? "Active" : "Inactive"}`)
        };
    });

    const alerts = state.alerts.map((ap) => {
        const t = thresholds.find((x) => x.ap === ap);
        return {
            ap,
            label: t ? thresholdLabel(t) : "",
            linked: view.complications
                .filter((c) => c.triggerAPs.includes(ap) && !(state.complications[c.key]?.active))
                .map((c) => ({ key: c.key, name: c.name }))
        };
    });

    return {
        name: view.name,
        statusLabel: game.i18n.format(`${PREFIX}.Status.${status.key}`, status.data ?? {}),
        statusTone: status.tone,
        roundLabel: game.i18n.format(`${PREFIX}.Round`, { round: state.round }),
        ap: state.ap,
        apMax: fail.ap,
        apLabel: `${state.ap} / ${fail.ap} AP`,
        edge: state.edge,
        dcLabel: anyDc ? dcBadge(dcState) : "",
        apMarkers: [...Array(fail.ap + 1).keys()].map((n) => {
            const t = thresholds.find((x) => x.ap === n);
            return { threshold: !!t, pos: fail.ap ? n / fail.ap : 0, tooltip: t ? thresholdLabel(t).replace(/<[^>]+>/g, "") : "" };
        }),
        alerts,
        roster,
        selectedName: selected?.name ?? "",
        selectedId: selected?.id ?? "",
        selectedDone: !!selPC && selPC.objective >= count,
        objective,
        activeComplications: complications.filter((c) => c.active),
        complications,
        opportunities: view.opportunities.map((p) => ({
            ...p,
            used: state.opportunities.includes(p.key),
            checks: p.checks.map(adjustAll)
        })),
        hasParty: party.length > 0
    };
}

export function infiltrationChatContent(infil, key) {
    const obstacle = findObstacle(infil, key);
    const complication = infil.complications.find((c) => c.key === key);
    const item = obstacle ?? complication;
    if (!item) return null;

    const lines = [`<h2>${item.name}</h2>`];
    if (obstacle) {
        lines.push(`<p><strong>${_loc(`${PREFIX}.InfiltrationPoints`)}</strong> ${obstacle.points} (${_loc(`${PREFIX}.Type.${obstacle.type}`).toLowerCase()})</p>`);
    }
    if (complication?.trigger) lines.push(`<p><strong>${_loc(`${PREFIX}.Trigger`)}</strong> ${complication.trigger}</p>`);
    if (item.description) lines.push(item.description);
    if (item.checks.length) lines.push(`<ul>${item.checks.map((c) => `<li>${c}</li>`).join("")}</ul>`);
    if (obstacle?.criticalFailure) {
        lines.push(`<p><strong>${_loc(`${PREFIX}.Outcome.criticalFailure`)}</strong> ${obstacle.criticalFailure}</p>`);
    }
    if (complication) {
        for (const [k, html] of Object.entries(complication.outcomes)) {
            lines.push(`<p><strong>${_loc(`${PREFIX}.Outcome.${k}`)}</strong> ${html}</p>`);
        }
    }
    return lines.join("\n");
}

export function movePC(infil, entry, actorId, delta) {
    const pc = (entry.pcs[actorId] ??= newPC());
    const target = Math.clamp(pc.objective + delta, 0, infil.objectives.length);
    if (target < pc.objective) {
        const keys = new Set(infil.objectives.slice(target).flatMap((o) => o.obstacles.map((ob) => ob.key)));
        pc.cleared = pc.cleared.filter((k) => !keys.has(k));
    }
    pc.objective = target;
    pc.ip = {};
}