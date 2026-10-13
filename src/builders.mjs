import { PATTERNS, REPUTATION, tierThreshold, parseChase } from "./utils.mjs";
import { SubsystemPageSheet } from "./subsystem-sheets.mjs";
import { parseInfiltration } from "./infiltration.mjs";
import { parseComputer } from "./hacking.mjs";

/* -------------------------------------------- */
/*  Shared helpers                              */
/* -------------------------------------------- */

const RAW_CHECK = /@Check\[([^\]]+)\](\{[^}]*\})?/gi;

export const escapeHtml = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function withPlaceholders(html) {
    return html.replace(RAW_CHECK, (full) => `<a class="inline-check" data-raw="${encodeURIComponent(full)}"></a>`);
}

export function restoreChecks(html) {
    return String(html ?? "").replace(/<a class="inline-check" data-raw="([^"]*)"><\/a>/g, (_, raw) => decodeURIComponent(raw));
}

export function parseCheck(raw) {
    const match = raw.match(/@Check\[([^\]]+)\](\{[^}]*\})?/i);
    if (!match) return newCheck();
    const params = match[1].split("|").map((p) => p.trim());
    const type = (params.shift() ?? "").replace(/^type:/i, "").toLowerCase();
    let dc = null;
    const extra = [];
    for (const p of params) {
        const dcMatch = p.match(/^dc:\s*(\d+)$/i);
        if (dcMatch) dc = Number(dcMatch[1]);
        else extra.push(p);
    }
    const isLore = type.endsWith("-lore");
    return {
        skill: isLore ? "lore" : type,
        lore: isLore ? type.slice(0, -5) : "",
        dc,
        label: "",
        extra: extra.join("|"),
        suffix: match[2] ?? ""
    };
}

export function checkToRaw(c) {
    const type = c.skill === "lore"
        ? `${String(c.lore || "general").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-lore`
        : c.skill;
    const params = [type];
    if (Number.isFinite(c.dc)) params.push(`dc:${c.dc}`);
    if (c.extra) params.push(c.extra);
    const raw = `@Check[${params.join("|")}]${c.suffix ?? ""}`;
    return c.label ? `${raw} ${escapeHtml(c.label)}` : raw;
}

export function inlineHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html ?? "").trim();
    const blocks = [...template.content.children].filter((el) => /^(P|DIV)$/.test(el.tagName));
    if (!blocks.length) return template.innerHTML.trim();
    return blocks.map((el) => el.innerHTML.trim()).filter(Boolean).join("<br>");
}

function headingLevel(html) {
    return Number(String(html ?? "").match(/<h([1-6])[\s>]/i)?.[1]) || 2;
}

export const newCheck = () => ({ skill: "diplomacy", lore: "", dc: null, label: "", extra: "", suffix: "", secret: "", secretId: "" });

const secretFields = (secret) => ({
    secret: secret ? (secret.revealed ? "revealed" : "hidden") : "",
    secretId: secret?.id ?? ""
});

function wrapSecrets(lines) {
    const out = [];
    for (let i = 0; i < lines.length;) {
        const line = lines[i];
        if (!line.secret) {
            out.push(line.html);
            i++;
            continue;
        }
        const id = line.secretId || `secret-${foundry.utils.randomID()}`;
        const block = [line.html];
        let j = i + 1;
        while (j < lines.length && line.secretId && lines[j].secret && lines[j].secretId === line.secretId) block.push(lines[j++].html);
        out.push(`<section class="secret${line.secret === "revealed" ? " revealed" : ""}" id="${id}">${block.join("")}</section>`);
        i = j;
    }
    return out;
}

function groupsFromParsed(groups) {
    return groups.map((g) => ({
        label: g.label,
        max: g.max ?? null,
        checks: g.checks.map((c) => {
            const raw = decodeURIComponent(c.html.match(/data-raw="([^"]*)"/)?.[1] ?? "");
            return { ...parseCheck(raw), label: restoreChecks(c.label), ...secretFields(c.secret) };
        })
    }));
}

function groupsToHtml(groups, { withMax = false } = {}) {
    const out = [];
    for (const g of groups) {
        const checks = (g.checks ?? []).filter((c) => c.skill);
        if (!checks.length) continue;
        let label = String(g.label ?? "").trim();
        if (withMax && Number.isFinite(g.max)) label = `${label} (max ${g.max})`.trim();
        if (label) out.push(`<p><strong>${escapeHtml(label)}</strong></p>`);
        out.push(...wrapSecrets(checks.map((c) => ({ html: `<p>${checkToRaw(c)}</p>`, secret: c.secret, secretId: c.secretId }))));
    }
    return out;
}

function thresholdsToHtml(thresholds, leadIn) {
    return [...thresholds]
        .filter((t) => Number.isFinite(t.points))
        .sort((a, b) => (a.points ?? 0) - (b.points ?? 0))
        .map((t) => `<p><strong>${escapeHtml(leadIn(t))}</strong> ${inlineHtml(t.html)}</p>`);
}

function parseRaw(html, fallbackName, options) {
    return SubsystemPageSheet.parse(withPlaceholders(html), fallbackName, options);
}

function strayModifiersAsNotes(parsed) {
    return parsed.modifiers.map((m) => {
        const label = m.kind === "weakness" ? "Weakness" : "Resistance";
        return `<p><strong>${label}</strong> ${restoreChecks(m.html)}</p>`;
    });
}

function notesFrom(parsed, extras = []) {
    return [restoreChecks(parsed.notes), ...extras].filter((n) => n?.trim()).join("\n");
}

function headerHtml(model) {
    const h = model.headingLevel || 2;
    const out = [`<h${h}>${escapeHtml(model.name)}</h${h}>`];
    if (model.notes?.trim()) out.push(model.notes.trim());
    return out;
}

/**
 * @param {object} config
 * @param {string} config.template
 * @param {RegExp} config.pattern
 * @param {string} config.unit
 * @param {boolean} [config.withMax]
 * @param {object} [config.context]
 */
function numericBuilder({ template, pattern, unit, withMax = false, context = {}, blankPoints = 5 }) {
    return {
        template,
        context: () => ({ showMax: withMax, ...context }),

        blank: () => ({
            name: "",
            headingLevel: 2,
            notes: "",
            groups: [{ label: "", max: null, checks: [newCheck()] }],
            thresholds: [{ points: blankPoints, html: "" }]
        }),

        rows: {
            groups: () => ({ label: "", max: null, checks: [newCheck()] }),
            checks: newCheck,
            thresholds: () => ({ points: null, html: "" })
        },

        fromHtml(html, fallbackName) {
            const parsed = parseRaw(html, fallbackName, { pattern });
            return {
                name: parsed.name,
                headingLevel: headingLevel(html),
                notes: notesFrom(parsed, strayModifiersAsNotes(parsed)),
                groups: groupsFromParsed(parsed.groups),
                thresholds: parsed.thresholds.map((t) => ({ points: t.threshold, html: restoreChecks(t.html) }))
            };
        },

        toHtml(model) {
            return [
                ...headerHtml(model),
                ...groupsToHtml(model.groups, { withMax }),
                ...thresholdsToHtml(model.thresholds, (t) => `${t.points} ${unit}`)
            ].join("\n");
        }
    };
}

const num = (v) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));
const plainText = (html) => {
    const template = document.createElement("template");
    template.innerHTML = String(html ?? "");
    return template.content.textContent.replace(/\s+/g, " ").trim();
};

function checksFromLine(html) {
    const raw = restoreChecks(html);
    const matches = [...raw.matchAll(RAW_CHECK)];
    const clean = (s) => plainText(s).replace(/^(?:[,;:]|or|and)\s*/i, "").replace(/\s*(?:[,;:]|or|and)$/i, "").trim();
    const prefix = clean(raw.slice(0, matches[0]?.index ?? 0));
    return matches.map((m, i) => {
        const end = matches[i + 1]?.index ?? raw.length;
        const label = clean(raw.slice(m.index + m[0].length, end));
        return { ...parseCheck(m[0]), label: i === 0 && prefix ? [prefix, label].filter(Boolean).join(" ") : label };
    });
}

const OUTCOME_LABELS = [
    ["criticalSuccess", "Critical Success"],
    ["success", "Success"],
    ["failure", "Failure"],
    ["criticalFailure", "Critical Failure"]
];

const INFIL_ROWS = {
    objectives: () => ({ name: "", required: null, description: "", obstacles: [INFIL_ROWS.obstacles()] }),
    obstacles: () => ({ name: "", points: 1, type: "individual", description: "", checks: [newCheck()], criticalFailure: "" }),
    checks: newCheck,
    complications: () => ({
        name: "", trigger: "", points: null, description: "", checks: [newCheck()],
        outcomes: { criticalSuccess: "", success: "", failure: "", criticalFailure: "" }
    }),
    opportunities: () => ({ name: "", requirements: "", description: "", checks: [] }),
    awareness: () => ({ ap: null, html: "" })
};

const HACK_ROWS = {
    accessPoints: () => ({
        name: "", type: "remote", required: 1, minDC: null, description: "",
        checks: [HACK_ROWS.checks()], vulnerabilities: [], countermeasures: []
    }),
    checks: () => ({ ...newCheck(), skill: "computers" }),
    vulnerabilities: () => ({ name: "", reduction: 1, checks: [newCheck()] }),
    countermeasures: () => ({
        name: "", failures: 2, persistent: false, effect: "",
        notice: [{ ...newCheck(), skill: "perception" }], disable: [{ ...newCheck(), skill: "computers" }]
    }),
    notice: () => ({ ...newCheck(), skill: "perception" }),
    disable: () => ({ ...newCheck(), skill: "computers" })
};

/* -------------------------------------------- */
/*  Definitions                                 */
/* -------------------------------------------- */

export const BUILDERS = {
    influence: {
        template: "influence.hbs",

        blank: () => ({
            name: "",
            headingLevel: 2,
            notes: "",
            groups: [
                { label: "Discovery", max: null, checks: [{ ...newCheck(), skill: "perception" }] },
                { label: "Influence Skills", max: null, checks: [newCheck()] }
            ],
            modifiers: [],
            thresholds: [{ points: 2, html: "" }]
        }),

        rows: {
            groups: () => ({ label: "", max: null, checks: [newCheck()] }),
            checks: newCheck,
            modifiers: () => ({ kind: "weakness", text: "", secret: "", secretId: "" }),
            thresholds: () => ({ points: null, html: "" })
        },

        fromHtml(html, fallbackName) {
            const parsed = parseRaw(html, fallbackName, { pattern: PATTERNS.influence });
            return {
                name: parsed.name,
                headingLevel: headingLevel(html),
                notes: restoreChecks(parsed.notes),
                groups: groupsFromParsed(parsed.groups),
                modifiers: parsed.modifiers.map((m) => ({ kind: m.kind, text: restoreChecks(m.html), ...secretFields(m.secret) })),
                thresholds: parsed.thresholds.map((t) => ({ points: t.threshold, html: restoreChecks(t.html) }))
            };
        },

        toHtml(model) {
            const h = model.headingLevel || 2;
            const out = [`<h${h}>${escapeHtml(model.name)}</h${h}>`];
            if (model.notes?.trim()) out.push(model.notes.trim());
            out.push(...groupsToHtml(model.groups));
            for (const [kind, label] of [["weakness", "Weaknesses"], ["resistance", "Resistances"]]) {
                const entries = model.modifiers.filter((m) => m.kind === kind && m.text?.trim());
                if (!entries.length) continue;
                out.push(`<p><strong>${label}</strong></p>`);
                out.push(...wrapSecrets(entries.map((m) => ({ html: `<p>${m.text.trim()}</p>`, secret: m.secret, secretId: m.secretId }))));
            }
            out.push(...thresholdsToHtml(model.thresholds, (t) => `${t.points} Influence`));
            return out.join("\n");
        }
    },

    research: numericBuilder({
        template: "research.hbs",
        pattern: PATTERNS.research,
        unit: "Research Points",
        withMax: true,
        blankPoints: 5,
        context: {
            namePlaceholder: "PF2E-SUBSYSTEM-HELPER.Builder.ResearchNamePlaceholder",
            groupPlaceholder: "PF2E-SUBSYSTEM-HELPER.Builder.ResearchGroupLabel",
            groupsHint: "PF2E-SUBSYSTEM-HELPER.Builder.ResearchGroupsHint",
            thresholdUnit: "PF2E-SUBSYSTEM-HELPER.Builder.ResearchUnit",
            thresholdsHint: "PF2E-SUBSYSTEM-HELPER.Builder.ResearchThresholdsHint"
        }
    }),

    victory: numericBuilder({
        template: "victory.hbs",
        pattern: PATTERNS.victory,
        unit: "Victory Points",
        blankPoints: 3,
        context: {
            namePlaceholder: "PF2E-SUBSYSTEM-HELPER.Builder.VictoryNamePlaceholder",
            groupPlaceholder: "PF2E-SUBSYSTEM-HELPER.Builder.GroupLabelGeneric",
            groupsHint: "PF2E-SUBSYSTEM-HELPER.Builder.VictoryGroupsHint",
            thresholdUnit: "PF2E-SUBSYSTEM-HELPER.Builder.VictoryUnit",
            thresholdsHint: "PF2E-SUBSYSTEM-HELPER.Builder.VictoryThresholdsHint"
        }
    }),

    chases: {
        template: "chases.hbs",
        context: () => ({ namePlaceholder: "PF2E-SUBSYSTEM-HELPER.Builder.ChaseNamePlaceholder" }),

        blank: () => ({
            name: "",
            headingLevel: 2,
            notes: "",
            obstacles: [{ name: "", level: null, chasePoints: null, description: "", checks: [newCheck()], options: [] }]
        }),

        rows: {
            obstacles: () => ({ name: "", level: null, chasePoints: null, description: "", checks: [newCheck()], options: [] }),
            checks: newCheck,
            options: () => ({ html: "" })
        },

        normalize(model) {
            model.obstacles = (model.obstacles ?? []).map((o) => ({
                name: o.name ?? "",
                level: num(o.level),
                chasePoints: num(o.chasePoints),
                description: o.description ?? "",
                checks: (o.checks ?? []).map((c) => ({ ...c, dc: num(c.dc) })),
                options: o.options ?? []
            }));
            return model;
        },

        fromHtml(html, fallbackName) {
            const parsed = parseChase(html, fallbackName);
            return {
                name: parsed.name,
                headingLevel: headingLevel(html),
                notes: parsed.intro ?? "",
                obstacles: parsed.obstacles.map((o) => ({
                    name: o.name,
                    level: o.level ?? null,
                    chasePoints: o.chasePoints ?? null,
                    description: o.description ?? "",
                    checks: o.checks.flatMap(checksFromLine),
                    options: o.options.map((opt) => ({ html: opt }))
                }))
            };
        },

        toHtml(model) {
            const h = Math.min((model.headingLevel || 2) + 1, 6);
            const out = headerHtml(model);
            for (const o of model.obstacles) {
                if (!o.name?.trim()) continue;
                const level = Number.isFinite(o.level) ? ` (${o.level})` : "";
                out.push(`<h${h}>${escapeHtml(o.name.trim())}${level}</h${h}>`);
                if (Number.isFinite(o.chasePoints)) out.push(`<p><strong>Chase Points</strong> ${o.chasePoints}</p>`);
                if (o.description?.trim()) out.push(o.description.trim());
                for (const c of o.checks.filter((c) => c.skill)) out.push(`<p>${checkToRaw(c)}</p>`);
                for (const opt of o.options.filter((x) => x.html?.trim())) {
                    out.push(`<p><strong>Options</strong> ${inlineHtml(opt.html)}</p>`);
                }
            }
            return out.join("\n");
        }
    },

    infiltration: {
        template: "infiltration.hbs",
        context: () => ({
            namePlaceholder: "PF2E-SUBSYSTEM-HELPER.Builder.InfiltrationNamePlaceholder",
            typeChoices: {
                individual: _loc("PF2E-SUBSYSTEM-HELPER.Infiltration.Type.individual"),
                group: _loc("PF2E-SUBSYSTEM-HELPER.Infiltration.Type.group")
            }
        }),

        blank: () => ({
            name: "",
            headingLevel: 1,
            notes: "",
            objectives: [INFIL_ROWS.objectives()],
            complications: [],
            opportunities: [],
            awareness: []
        }),

        rows: INFIL_ROWS,

        normalize(model) {
            const checks = (list) => (list ?? []).map((c) => ({ ...c, dc: num(c.dc) }));
            model.objectives = (model.objectives ?? []).map((o) => ({
                name: o.name ?? "",
                required: num(o.required),
                description: o.description ?? "",
                obstacles: (o.obstacles ?? []).map((ob) => ({
                    name: ob.name ?? "",
                    points: num(ob.points) ?? 1,
                    type: ob.type === "individual" ? "individual" : "group",
                    description: ob.description ?? "",
                    checks: checks(ob.checks),
                    criticalFailure: ob.criticalFailure ?? ""
                }))
            }));
            model.complications = (model.complications ?? []).map((c) => ({
                name: c.name ?? "",
                trigger: c.trigger ?? "",
                points: num(c.points),
                description: c.description ?? "",
                checks: checks(c.checks),
                outcomes: { criticalSuccess: "", success: "", failure: "", criticalFailure: "", ...(c.outcomes ?? {}) }
            }));
            model.opportunities = (model.opportunities ?? []).map((p) => ({
                name: p.name ?? "",
                requirements: p.requirements ?? "",
                description: p.description ?? "",
                checks: checks(p.checks)
            }));
            model.awareness = (model.awareness ?? []).map((a) => ({ ap: num(a.ap), html: a.html ?? "" }));
            return model;
        },

        view(model) {
            return {
                ...model,
                objectives: model.objectives.map((o, oi) => ({
                    ...o,
                    path: `objectives.${oi}`,
                    obstacles: o.obstacles.map((ob, bi) => {
                        const path = `objectives.${oi}.obstacles.${bi}`;
                        return { ...ob, path, checksPath: `${path}.checks` };
                    })
                })),
                complications: model.complications.map((c, ci) => ({
                    ...c,
                    path: `complications.${ci}`,
                    checksPath: `complications.${ci}.checks`,
                    outcomeFields: OUTCOME_LABELS.map(([key]) => ({
                        key,
                        label: _loc(`PF2E-SUBSYSTEM-HELPER.Infiltration.Outcome.${key}`),
                        value: c.outcomes[key]
                    }))
                })),
                opportunities: model.opportunities.map((p, pi) => ({
                    ...p,
                    path: `opportunities.${pi}`,
                    checksPath: `opportunities.${pi}.checks`
                }))
            };
        },

        fromHtml(html, fallbackName) {
            const parsed = parseInfiltration(html, fallbackName);
            const checks = (list) => list.flatMap(checksFromLine);
            const custom = parsed.thresholds.some((t) => t.html);
            return {
                name: parsed.name,
                headingLevel: headingLevel(html),
                notes: [parsed.intro, parsed.notes].filter((n) => n?.trim()).join("\n"),
                objectives: parsed.objectives.map((o) => ({
                    name: o.name,
                    required: o.required ?? null,
                    description: o.description,
                    obstacles: o.obstacles.map((ob) => ({
                        name: ob.name,
                        points: ob.points,
                        type: ob.type,
                        description: ob.description,
                        checks: checks(ob.checks),
                        criticalFailure: ob.criticalFailure
                    }))
                })),
                complications: parsed.complications.map((c) => ({
                    name: c.name,
                    trigger: c.trigger,
                    points: c.points ?? null,
                    description: c.description,
                    checks: checks(c.checks),
                    outcomes: { criticalSuccess: "", success: "", failure: "", criticalFailure: "", ...c.outcomes }
                })),
                opportunities: parsed.opportunities.map((p) => ({
                    name: p.name,
                    requirements: p.requirements,
                    description: p.description,
                    checks: checks(p.checks)
                })),
                awareness: custom ? parsed.thresholds.map((t) => ({ ap: t.ap, html: t.html })) : []
            };
        },

        toHtml(model) {
            const out = headerHtml(model);
            const lead = (label, html) => (html?.trim() ? `<p><strong>${label}</strong> ${inlineHtml(html)}</p>` : null);
            const checkLines = (list) => list.filter((c) => c.skill).map((c) => `<p>${checkToRaw(c)}</p>`);
            const block = (html) => (html?.trim() ? html.trim() : null);

            model.objectives.forEach((o, i) => {
                out.push(`<h2>Objective ${i + 1}: ${escapeHtml(o.name.trim() || `Objective ${i + 1}`)}</h2>`);
                if (Number.isFinite(o.required)) out.push(`<p><strong>Required</strong> ${o.required}</p>`);
                out.push(block(o.description));
                for (const ob of o.obstacles.filter((x) => x.name.trim())) {
                    out.push(`<h3>${escapeHtml(ob.name.trim())}</h3>`);
                    out.push(`<p><strong>Infiltration Points</strong> ${ob.points ?? 1} (${ob.type})</p>`);
                    out.push(block(ob.description), ...checkLines(ob.checks), lead("Critical Failure", ob.criticalFailure));
                }
            });

            const complications = model.complications.filter((c) => c.name.trim());
            if (complications.length) {
                out.push("<h2>Complications</h2>");
                for (const c of complications) {
                    out.push(`<h3>${escapeHtml(c.name.trim())}</h3>`, lead("Trigger", c.trigger));
                    if (Number.isFinite(c.points)) out.push(`<p><strong>Infiltration Points</strong> ${c.points}</p>`);
                    out.push(block(c.description), ...checkLines(c.checks));
                    for (const [key, label] of OUTCOME_LABELS) out.push(lead(label, c.outcomes[key]));
                }
            }

            const opportunities = model.opportunities.filter((p) => p.name.trim());
            if (opportunities.length) {
                out.push("<h2>Opportunities</h2>");
                for (const p of opportunities) {
                    out.push(`<h3>${escapeHtml(p.name.trim())}</h3>`, lead("Requirements", p.requirements));
                    out.push(block(p.description), ...checkLines(p.checks));
                }
            }

            const awareness = model.awareness.filter((a) => Number.isFinite(a.ap)).sort((a, b) => a.ap - b.ap);
            if (awareness.length) {
                out.push("<h2>Awareness</h2>");
                for (const a of awareness) out.push(`<p><strong>${a.ap} AP</strong> ${inlineHtml(a.html)}</p>`);
            }
            return out.filter(Boolean).join("\n");
        }
    },

    hacking: {
        template: "hacking.hbs",
        context: () => ({
            namePlaceholder: "PF2E-SUBSYSTEM-HELPER.Builder.HackingNamePlaceholder",
            accessChoices: {
                remote: _loc("PF2E-SUBSYSTEM-HELPER.Hacking.Type.remote"),
                physical: _loc("PF2E-SUBSYSTEM-HELPER.Hacking.Type.physical")
            }
        }),

        blank: () => ({
            name: "",
            headingLevel: 2,
            notes: "",
            accessPoints: [HACK_ROWS.accessPoints()],
            outcomes: { criticalSuccess: "", success: "" }
        }),

        rows: HACK_ROWS,

        normalize(model) {
            const checks = (list) => (list ?? []).map((c) => ({ ...c, dc: num(c.dc) }));
            model.accessPoints = (model.accessPoints ?? []).map((ap) => ({
                name: ap.name ?? "",
                type: ap.type === "physical" ? "physical" : "remote",
                required: num(ap.required) ?? 1,
                minDC: num(ap.minDC),
                description: ap.description ?? "",
                checks: checks(ap.checks),
                vulnerabilities: (ap.vulnerabilities ?? []).map((v) => ({
                    name: v.name ?? "",
                    reduction: num(v.reduction) ?? 1,
                    checks: checks(v.checks)
                })),
                countermeasures: (ap.countermeasures ?? []).map((cm) => ({
                    name: cm.name ?? "",
                    failures: num(cm.failures) ?? 1,
                    persistent: !!cm.persistent,
                    effect: cm.effect ?? "",
                    notice: checks(cm.notice),
                    disable: checks(cm.disable)
                }))
            }));
            model.outcomes = { criticalSuccess: "", success: "", ...(model.outcomes ?? {}) };
            return model;
        },

        view(model) {
            return {
                ...model,
                accessPoints: model.accessPoints.map((ap, ai) => {
                    const path = `accessPoints.${ai}`;
                    return {
                        ...ap,
                        path,
                        checksPath: `${path}.checks`,
                        vulnerabilities: ap.vulnerabilities.map((v, vi) => ({
                            ...v, path: `${path}.vulnerabilities.${vi}`, checksPath: `${path}.vulnerabilities.${vi}.checks`
                        })),
                        countermeasures: ap.countermeasures.map((cm, ci) => {
                            const cmPath = `${path}.countermeasures.${ci}`;
                            return { ...cm, path: cmPath, noticePath: `${cmPath}.notice`, disablePath: `${cmPath}.disable` };
                        })
                    };
                })
            };
        },

        fromHtml(html, fallbackName) {
            const parsed = parseComputer(html, fallbackName);
            const plainOnly = (html) => (!/@Check\[/i.test(html ?? "") && plainText(html)) || "";
            const withPlain = (base, extra, wrap) => (extra ? [base, wrap(extra)].filter(Boolean).join(base ? " " : "") : base);
            return {
                name: parsed.name,
                headingLevel: headingLevel(html),
                notes: parsed.description ?? "",
                accessPoints: parsed.accessPoints.map((ap) => ({
                    name: ap.unnamed ? "" : ap.name,
                    type: ap.type,
                    required: ap.required,
                    minDC: ap.minDC,
                    description: withPlain(ap.description ?? "", plainOnly(ap.checks), (t) => `<p>${escapeHtml(t)}</p>`),
                    checks: checksFromLine(ap.checks),
                    vulnerabilities: ap.vulnerabilities.map((v) => ({
                        name: v.unnamed ? "" : v.name,
                        reduction: v.reduction,
                        checks: checksFromLine(v.checks)
                    })),
                    countermeasures: ap.countermeasures.map((cm) => ({
                        name: cm.unnamed ? "" : cm.name,
                        failures: cm.failures,
                        persistent: cm.persistent,
                        effect: [
                            restoreChecks(cm.effect),
                            plainOnly(cm.notice) && `Notice: ${escapeHtml(plainOnly(cm.notice))}.`,
                            plainOnly(cm.disable) && `Disable: ${escapeHtml(plainOnly(cm.disable))}.`
                        ].filter(Boolean).join(" "),
                        notice: checksFromLine(cm.notice),
                        disable: checksFromLine(cm.disable)
                    }))
                })),
                outcomes: { criticalSuccess: "", success: "", ...parsed.outcomes }
            };
        },

        toHtml(model) {
            const h = Math.min((model.headingLevel || 2) + 1, 6);
            const out = headerHtml(model);
            const checkList = (list) => list.filter((c) => c.skill).map(checkToRaw).join("; ");
            model.accessPoints.forEach((ap, i) => {
                out.push(`<h${h}>${escapeHtml(ap.name.trim() || `Access Point ${i + 1}`)}</h${h}>`);
                const successes = `${ap.required} ${ap.required === 1 ? "Success" : "Successes"}`;
                const minDC = Number.isFinite(ap.minDC) ? ` Minimum DC ${ap.minDC}` : "";
                const checks = checkList(ap.checks);
                out.push(`<p><strong>Access</strong> ${ap.type}; ${successes}${checks ? `; ${checks}` : ""}${minDC}</p>`);
                if (ap.description?.trim()) out.push(ap.description.trim());
                for (const v of ap.vulnerabilities) {
                    const vChecks = checkList(v.checks);
                    if (!v.name.trim() && !vChecks) continue;
                    const body = [escapeHtml(v.name.trim()), vChecks].filter(Boolean).join(" ");
                    out.push(`<p><strong>Vulnerability</strong> ${body}; \u2013${v.reduction}</p>`);
                }
                for (const cm of ap.countermeasures) {
                    const failures = `${cm.failures} ${cm.failures === 1 ? "Failure" : "Failures"}${cm.persistent ? "; persistent" : ""}`;
                    const label = cm.name.trim() ? `Countermeasure: ${escapeHtml(cm.name.trim())} (${failures})` : `Countermeasure (${failures})`;
                    out.push(`<p><strong>${label}</strong> ${inlineHtml(cm.effect)}</p>`);
                    const notice = checkList(cm.notice);
                    const disable = checkList(cm.disable);
                    if (notice) out.push(`<p><strong>Notice</strong> ${notice}</p>`);
                    if (disable) out.push(`<p><strong>Disable</strong> ${disable}</p>`);
                }
            });
            if (model.outcomes.criticalSuccess?.trim()) out.push(`<p><strong>Critical Success</strong> ${inlineHtml(model.outcomes.criticalSuccess)}</p>`);
            if (model.outcomes.success?.trim()) out.push(`<p><strong>Success</strong> ${inlineHtml(model.outcomes.success)}</p>`);
            return out.join("\n");
        }
    },

    reputation: {
        template: "reputation.hbs",
        context: () => ({
            showMax: false,
            namePlaceholder: "PF2E-SUBSYSTEM-HELPER.Builder.ReputationNamePlaceholder",
            tierChoices: Object.fromEntries(REPUTATION.tiers.map((t) => [
                t.key, `${_loc(`PF2E-SUBSYSTEM-HELPER.Reputation.Tier.${t.key}`)} (${t.min > 0 ? `${t.min}+` : t.max < 0 ? `${t.max} or less` : `${t.min} to ${t.max}`})`
            ]))
        }),

        blank: () => ({
            name: "",
            headingLevel: 2,
            notes: "",
            thresholds: [
                { tier: "Liked", html: "" },
                { tier: "Disliked", html: "" }
            ],
            locations: []
        }),

        rows: {
            thresholds: () => ({ tier: "Liked", html: "" }),
            locations: () => ({ html: "" })
        },

        fromHtml(html, fallbackName) {
            const parsed = parseRaw(html, fallbackName, {
                pattern: PATTERNS.reputation, toThreshold: tierThreshold, collectLocations: true
            });
            const tierKey = (token) => REPUTATION.tiers.find((t) => t.key.toLowerCase() === token.toLowerCase())?.key ?? token;
            return {
                name: parsed.name,
                headingLevel: headingLevel(html),
                notes: notesFrom(parsed, [
                    ...strayModifiersAsNotes(parsed),
                    ...groupsToHtml(groupsFromParsed(parsed.groups))
                ]),
                thresholds: parsed.thresholds.map((t) => ({ tier: tierKey(t.token), html: restoreChecks(t.html) })),
                locations: parsed.locations.map((l) => ({ html: restoreChecks(l.html) }))
            };
        },

        toHtml(model) {
            const order = REPUTATION.tiers.map((t) => t.key);
            const thresholds = [...model.thresholds]
                .filter((t) => order.includes(t.tier))
                .sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier))
                .map((t) => `<p><strong>${t.tier}</strong> ${inlineHtml(t.html)}</p>`);
            const locations = (model.locations ?? []).filter((l) => l.html?.trim());
            return [
                ...headerHtml(model),
                ...thresholds,
                ...(locations.length ? ["<p><strong>Locations</strong></p>", ...locations.map((l) => `<p>${inlineHtml(l.html)}</p>`)] : [])
            ].join("\n");
        }
    }
};
