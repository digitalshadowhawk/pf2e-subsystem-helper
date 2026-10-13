import { LANG } from "./constants.mjs";
import { adjustCheckHtml } from "./utils.mjs";

const PREFIX = `${LANG}.Hacking`;

const HAS_CHECK = /@Check\[/i;
const ACCESS_LINE = /\(?\s*(physical|remote)\s*[;,]\s*(\d+)\s+success(?:es)?\s*\)?/i;
const FAILURES = /\(\s*(\d+)\s+failures?\s*(?:[;,]\s*([^)]*))?\)/i;
const REDUCTION = /(?:DC\s*)?[\u2013\u2014\u2212-]\s*(\d+)\s*$/i;
const MIN_DC = /min(?:imum)?\s+DC\s+(\d+)/i;

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const textOf = (html) => String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

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

function fromFirstCheck(html) {
    const at = html.search(/<a[^>]*class="[^"]*inline-check|@Check\[/i);
    return (at > 0 ? html.slice(at) : html).trim();
}

const stripReduction = (html) => html.replace(/[;,]?\s*(?:DC\s*)?[\u2013\u2014\u2212-]\s*\d+\s*((?:<\/[a-z]+>\s*)*)$/i, "$1").trim();

function splitBoldLabels(html, labels) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const parts = { "": "" };
    let current = "";
    for (const node of [...template.content.childNodes]) {
        const label = node.nodeType === Node.ELEMENT_NODE && /^(STRONG|B)$/.test(node.tagName)
            ? node.textContent.trim().replace(/[:.]$/, "")
            : null;
        if (label && labels.test(label)) {
            current = label.toLowerCase();
            parts[current] = "";
            continue;
        }
        const holder = document.createElement("div");
        holder.append(node.cloneNode(true));
        parts[current] += holder.innerHTML;
    }
    for (const key of Object.keys(parts)) parts[key] = parts[key].replace(/^[\s;,]+|[\s;,]+$/g, "");
    return parts;
}

/**
 * @param {string} html
 * @param {string} fallbackName
 */
export function parseComputer(html, fallbackName) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const queue = [...template.content.children];
    const firstHeading = queue.find(isHeading);

    const computer = { name: firstHeading?.textContent.trim() || fallbackName, description: "", accessPoints: [], outcomes: {} };
    const description = [];
    let ap = null;
    let countermeasure = null;
    let section = null;

    const newAccessPoint = (name) => {
        const index = computer.accessPoints.length;
        ap = {
            key: `ap${index}`,
            name: name || game.i18n.format(`${PREFIX}.AccessPointN`, { n: index + 1 }),
            type: "remote", required: 1, checks: "", minDC: null, hasLine: false, unnamed: !name,
            description: [], vulnerabilities: [], countermeasures: []
        };
        computer.accessPoints.push(ap);
        countermeasure = null;
        section = null;
        return ap;
    };

    const readAccessLine = (html, text) => {
        const match = text.match(ACCESS_LINE);
        if (match) {
            ap.type = match[1].toLowerCase();
            ap.required = Number(match[2]);
        }
        ap.minDC = Number(text.match(MIN_DC)?.[1]) || null;
        const rest = html.replace(ACCESS_LINE, "").replace(MIN_DC, "").replace(/^[\s;,]+/, "");
        ap.checks = fromFirstCheck(rest);
        ap.hasLine = true;
    };

    const addVulnerability = (html, text, name) => {
        ap ??= newAccessPoint();
        const reduction = Number(text.match(REDUCTION)?.[1]) || 1;
        const before = textOf(stripReduction(html.split(/<a[^>]*class="[^"]*inline-check|@Check\[/i)[0])).replace(/[:;,\u2013\u2014-]\s*$/, "");
        ap.vulnerabilities.push({
            key: `${ap.key}-v${ap.vulnerabilities.length}`,
            name: name || before || game.i18n.format(`${PREFIX}.VulnerabilityN`, { n: ap.vulnerabilities.length + 1 }),
            unnamed: !(name || before),
            checks: stripReduction(fromFirstCheck(html)),
            reduction
        });
    };

    const addCountermeasure = (label, html, text) => {
        ap ??= newAccessPoint();
        const source = `${label} ${text}`;
        const parts = splitBoldLabels(html, /^(notice|disable)$/i);
        const match = source.match(FAILURES);
        const name = label.replace(/^countermeasures?\b/i, "").replace(FAILURES, "").replace(/^[\s:–—-]+/, "").trim();
        countermeasure = {
            key: `${ap.key}-c${ap.countermeasures.length}`,
            name: name || game.i18n.format(`${PREFIX}.CountermeasureN`, { n: ap.countermeasures.length + 1 }),
            unnamed: !name,
            failures: Number(match?.[1]) || 1,
            persistent: /persistent/i.test(match?.[2] ?? "") || /\bpersistent\b/i.test(label),
            effect: parts[""].replace(FAILURES, "").replace(/^\s*[;:,]\s*/, "").replace(/[\s;,]+$/, "").trim(),
            notice: fromFirstCheck(parts.notice ?? ""),
            disable: fromFirstCheck(parts.disable ?? "")
        };
        ap.countermeasures.push(countermeasure);
    };

    while (queue.length) {
        const el = queue.shift();
        if (el === firstHeading) continue;

        if (el.tagName === "UL" || el.tagName === "OL") {
            if (section || el.querySelector("a.inline-check") || HAS_CHECK.test(el.textContent)) {
                queue.unshift(...[...el.children].map((li) => li.querySelector(":scope > p") ?? li));
                continue;
            }
        }

        if (isHeading(el)) {
            newAccessPoint(el.textContent.trim());
            continue;
        }

        const text = el.textContent.trim();
        if (!text) continue;
        const lead = (el.tagName === "P" || el.tagName === "LI") ? leadIn(el) : null;
        const label = lead?.label ?? "";

        if (lead && !lead.text) {
            if (/^vulnerabilit/i.test(label)) { section = "vulnerability"; continue; }
            if (/^countermeasure/i.test(label) && !FAILURES.test(label)) { section = "countermeasure"; continue; }
        }

        if (lead) {
            if (/^critical success$/i.test(label)) { computer.outcomes.criticalSuccess = lead.html; continue; }
            if (/^success$/i.test(label)) { computer.outcomes.success = lead.html; continue; }
            if (/^access(?: point)?$/i.test(label)) {
                ap ??= newAccessPoint();
                readAccessLine(lead.html, lead.text);
                continue;
            }
            if (/^vulnerabilit/i.test(label)) { addVulnerability(lead.html, lead.text); continue; }
            if (/^countermeasure/i.test(label)) { addCountermeasure(label, lead.html, lead.text); continue; }
            if (/^notice$/i.test(label) && countermeasure) { countermeasure.notice = fromFirstCheck(lead.html); continue; }
            if (/^disable$/i.test(label) && countermeasure) { countermeasure.disable = fromFirstCheck(lead.html); continue; }

            if (ACCESS_LINE.test(lead.text)) {
                if (!ap || ap.hasLine) newAccessPoint(label);
                else if (ap.unnamed) Object.assign(ap, { name: label, unnamed: false });
                readAccessLine(lead.html, lead.text);
                continue;
            }
        }

        if (!lead && ACCESS_LINE.test(text) && (!ap || !ap.hasLine)) {
            ap ??= newAccessPoint();
            readAccessLine(el.innerHTML, text);
            continue;
        }

        if (!lead && ap && FAILURES.test(text) && text.startsWith("(")) {
            addCountermeasure("", el.innerHTML, text);
            continue;
        }

        if (section === "vulnerability" && ap) {
            addVulnerability(lead ? lead.html : el.innerHTML, lead ? lead.text : text, lead?.label);
            continue;
        }
        if (section === "countermeasure" && ap) {
            addCountermeasure(lead ? lead.label : "", lead ? lead.html : el.innerHTML, lead ? lead.text : text);
            continue;
        }

        (ap ? ap.description : description).push(el.outerHTML);
    }

    computer.description = description.join("\n");
    for (const a of computer.accessPoints) a.description = a.description.join("\n");
    return computer;
}

/* -------------------------------------------- */
/*  State helpers                               */
/* -------------------------------------------- */

export function hackingDefaults() {
    return { discovered: false, round: 1, points: {}, exploited: [], countermeasures: {}, alerts: [] };
}

const pointsOf = (entry, apKey) => (entry.points[apKey] ??= { successes: 0, failures: 0 });
const cmStateOf = (entry, cmKey) => (entry.countermeasures[cmKey] ??= { noticed: false, disabled: false, triggered: false });
const findAP = (computer, apKey) => computer.accessPoints.find((a) => a.key === apKey);
const findCM = (computer, cmKey) => computer.accessPoints.flatMap((a) => a.countermeasures).find((c) => c.key === cmKey);
const apOfCM = (computer, cmKey) => computer.accessPoints.find((a) => a.countermeasures.some((c) => c.key === cmKey));

function syncCountermeasures(ap, entry) {
    const { failures } = pointsOf(entry, ap.key);
    for (const cm of ap.countermeasures) {
        const state = cmStateOf(entry, cm.key);
        if (failures >= cm.failures && !state.triggered && !state.disabled) {
            state.triggered = true;
            if (!entry.alerts.includes(cm.key)) entry.alerts.push(cm.key);
        } else if (failures < cm.failures && state.triggered) {
            state.triggered = false;
            entry.alerts = entry.alerts.filter((k) => k !== cm.key);
        }
    }
}

/**
 * @param {"critSuccess"|"success"|"failure"|"critFailure"} result
 */
export function applyHackResult(computer, entry, apKey, result) {
    const ap = findAP(computer, apKey);
    if (!ap) return;
    const points = pointsOf(entry, apKey);
    const amount = result.startsWith("crit") ? 2 : 1;
    if (result.endsWith("uccess")) points.successes = Math.min(points.successes + amount, ap.required * 2);
    else points.failures += amount;
    syncCountermeasures(ap, entry);
}

export function adjustAccessPoint(computer, entry, apKey, field, delta) {
    const ap = findAP(computer, apKey);
    if (!ap) return;
    const points = pointsOf(entry, apKey);
    const max = field === "successes" ? ap.required * 2 : Infinity;
    points[field] = Math.clamp(points[field] + delta, 0, max);
    syncCountermeasures(ap, entry);
}

/**
 * @param {"notice"|"disable"|"failure"|"critFailure"} op
 */
export function applyCountermeasure(computer, entry, cmKey, op) {
    const ap = apOfCM(computer, cmKey);
    if (!ap) return;
    const state = cmStateOf(entry, cmKey);
    if (op === "notice") state.noticed = !state.noticed;
    else if (op === "disable") {
        state.disabled = !state.disabled;
        if (state.disabled) entry.alerts = entry.alerts.filter((k) => k !== cmKey);
    } else {
        pointsOf(entry, ap.key).failures += op === "critFailure" ? 2 : 1;
        syncCountermeasures(ap, entry);
    }
}

export function endHackingRound(computer, entry) {
    entry.round += 1;
    for (const ap of computer.accessPoints) {
        for (const cm of ap.countermeasures) {
            const state = cmStateOf(entry, cm.key);
            if (cm.persistent && state.triggered && !state.disabled && !entry.alerts.includes(cm.key)) {
                entry.alerts.push(cm.key);
            }
        }
    }
}

export function toggleVulnerability(entry, key) {
    entry.exploited = entry.exploited.includes(key)
        ? entry.exploited.filter((k) => k !== key)
        : [...entry.exploited, key];
}

export function hackingStatus(computer, entry) {
    const done = computer.accessPoints.filter((ap) => (entry.points[ap.key]?.successes ?? 0) >= ap.required);
    const doubled = computer.accessPoints.some((ap) => (entry.points[ap.key]?.successes ?? 0) >= ap.required * 2);
    if (done.length > 1 || doubled) return { key: "CriticalSuccess", tone: "good", hacked: true, critical: true };
    if (done.length) return { key: "Hacked", tone: "good", hacked: true, critical: false };
    const triggered = Object.values(entry.countermeasures).some((c) => c.triggered && !c.disabled);
    if (triggered) return { key: "Countermeasures", tone: "bad", hacked: false, critical: false };
    return { key: "InProgress", tone: "", hacked: false, critical: false };
}

/* -------------------------------------------- */
/*  View                                        */
/* -------------------------------------------- */

export function reduceChecks(html, reduction, minDC) {
    if (!reduction || !html) return html;
    const template = document.createElement("template");
    template.innerHTML = html;
    for (const a of template.content.querySelectorAll("a.inline-check")) {
        const dc = Number(a.dataset.pf2Dc);
        if (!dc) continue;
        const delta = minDC ? Math.max(-reduction, Math.min(0, minDC - dc)) : -reduction;
        if (delta) a.outerHTML = adjustCheckHtml(a.outerHTML, delta);
    }
    return template.innerHTML;
}

const pips = (count, filled, extra = 0) => [...Array(count + extra).keys()].map((i) => ({
    state: i < filled ? (i >= count ? "bonus" : "cleared") : "",
    bonus: i >= count
}));

/**
 * @param {object} view
 * @param {object} state
 */
export function buildHackingView(view, state) {
    const isGM = game.user.isGM;
    const status = hackingStatus(view, state);
    const exploited = new Set(state.exploited);
    const cmByKey = new Map();

    const accessPoints = view.accessPoints.map((ap) => {
        const { successes = 0, failures = 0 } = state.points[ap.key] ?? {};
        const vulnerabilities = ap.vulnerabilities.map((v) => ({
            ...v,
            exploited: exploited.has(v.key),
            reductionLabel: `DC -${v.reduction}`
        }));
        const reduction = vulnerabilities.filter((v) => v.exploited).reduce((sum, v) => sum + v.reduction, 0);
        const countermeasures = ap.countermeasures.map((cm) => {
            const cmState = { noticed: false, disabled: false, triggered: false, ...(state.countermeasures[cm.key] ?? {}) };
            const tone = cmState.disabled ? "disabled" : cmState.triggered ? "triggered" : cmState.noticed ? "noticed" : "";
            const built = {
                ...cm,
                ...cmState,
                tone,
                thresholdLabel: game.i18n.format(`${PREFIX}.FailuresOf`, { failures: Math.min(failures, cm.failures), max: cm.failures }),
                stateLabel: _loc(`${PREFIX}.CmState.${tone || "hidden"}`),
                visible: isGM || cmState.noticed || cmState.triggered
            };
            cmByKey.set(cm.key, built);
            return built;
        });
        return {
            ...ap,
            successes,
            failures,
            hacked: successes >= ap.required,
            typeLabel: _loc(`${PREFIX}.Type.${ap.type}`),
            requiredLabel: game.i18n.format(`${PREFIX}.SuccessesOf`, { successes: Math.min(successes, ap.required), required: ap.required }),
            successPips: pips(ap.required, successes, Math.min(Math.max(successes - ap.required, 0), ap.required)),
            failureLabel: game.i18n.format(`${PREFIX}.Failures`, { failures }),
            checks: reduceChecks(ap.checks, reduction, ap.minDC),
            reductionLabel: reduction ? `DC -${reduction}` : "",
            minLabel: ap.minDC ? game.i18n.format(`${PREFIX}.MinDC`, { dc: ap.minDC }) : "",
            vulnerabilities,
            countermeasures: countermeasures.filter((c) => c.visible)
        };
    });

    return {
        name: view.name,
        description: view.description,
        round: state.round,
        roundLabel: game.i18n.format(`${PREFIX}.Round`, { round: state.round }),
        statusLabel: _loc(`${PREFIX}.Status.${status.key}`),
        statusTone: status.tone,
        accessPoints,
        alerts: state.alerts.map((key) => cmByKey.get(key)).filter(Boolean).map((cm) => ({
            ...cm,
            label: cm.persistent && cm.triggered ? game.i18n.format(`${PREFIX}.TriggersAgain`, { name: cm.name }) : cm.name
        })),
        outcomes: [
            view.outcomes.criticalSuccess && { key: "criticalSuccess", label: _loc(`${PREFIX}.Outcome.criticalSuccess`), html: view.outcomes.criticalSuccess, reached: status.critical },
            view.outcomes.success && { key: "success", label: _loc(`${PREFIX}.Outcome.success`), html: view.outcomes.success, reached: status.hacked }
        ].filter(Boolean)
    };
}

export function hackingChatContent(computer, key) {
    if (key === "success" || key === "criticalSuccess") {
        const html = computer.outcomes[key];
        if (!html) return null;
        const lines = [`<h2>${computer.name}</h2>`, `<p><strong>${_loc(`${PREFIX}.Outcome.${key}`)}</strong> ${html}</p>`];
        if (key === "criticalSuccess" && computer.outcomes.success) {
            lines.push(`<p><strong>${_loc(`${PREFIX}.Outcome.success`)}</strong> ${computer.outcomes.success}</p>`);
        }
        return lines.join("\n");
    }
    const cm = findCM(computer, key);
    if (!cm) return null;
    const lines = [`<h2>${cm.name}</h2>`];
    if (cm.effect) lines.push(`<p>${cm.effect}</p>`);
    const checks = [
        cm.notice && `<li><strong>${_loc(`${PREFIX}.Notice`)}</strong> ${cm.notice}</li>`,
        cm.disable && `<li><strong>${_loc(`${PREFIX}.Disable`)}</strong> ${cm.disable}</li>`
    ].filter(Boolean);
    if (checks.length) lines.push(`<ul>${checks.join("")}</ul>`);
    return lines.join("\n");
}