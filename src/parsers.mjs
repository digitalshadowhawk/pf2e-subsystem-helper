import { CATEGORY_MAX, PATTERNS, kindOfModifier } from "./utils.mjs";
import { modifierSkills } from "./modifiers.mjs";

/* ==========================================================================
   Page parsers used by the Subsystems window
   (Chases and Infiltration have their own parsers in utils.mjs / infiltration.mjs)
   ========================================================================== */

async function enrichPage(page) {
    const TextEditor = foundry.applications.ux.TextEditor.implementation;
    const html = await TextEditor.enrichHTML(page.text.content ?? "", { relativeTo: page });
    const template = document.createElement("template");
    template.innerHTML = html;
    return template;
}

/**
 * @param {JournalEntryPage} page
 * @param {RegExp} pattern
 * @returns {Promise<{checks: object[], modifiers: object[]}>}
 */
export async function parseDetails(page, pattern) {
    const template = await enrichPage(page);
    const groups = new Map();
    const modifiers = [];
    const counts = { weakness: 0, resistance: 0 };
    let currentLabel = "";
    const firstHeading = template.content.querySelector("h1, h2, h3, h4, h5, h6");

    for (const el of template.content.querySelectorAll("h1, h2, h3, h4, h5, h6, p")) {
        const text = el.textContent.trim();

        if (el.tagName !== "P") {
            if (el !== firstHeading) currentLabel = text;
            continue;
        }
        if (pattern.test(text)) continue;

        const anchors = [...el.querySelectorAll("a.inline-check")];
        const boldText = el.querySelector("strong, b")?.textContent.trim() ?? "";
        const leadIn = boldText && text.startsWith(boldText) ? boldText.replace(/[:.]$/, "") : "";

        if (!anchors.length) {
            if (boldText && boldText === text) {
                currentLabel = text.replace(/[:.]$/, "");
                continue;
            }
            const kind = kindOfModifier(leadIn || currentLabel);
            if (kind) {
                const body = leadIn ? text.slice(boldText.length).trim() : text;
                const amount = Number(body.match(/\bby\s+(\d+)/i)?.[1] ?? 2);
                modifiers.push({ key: `${kind}-${counts[kind]++}`, kind, text: body, amount, skills: modifierSkills(body) });
            }
            continue;
        }

        const groupLabel = leadIn || currentLabel;
        if (!groups.has(groupLabel)) groups.set(groupLabel, new Map());
        const group = groups.get(groupLabel);
        anchors.forEach((anchor, i) => {
            let label = "";
            for (let node = anchor.nextSibling; node && node !== anchors[i + 1]; node = node.nextSibling) {
                label += node.textContent;
            }
            label = label.trim().replace(/^[-–—:,]\s*/, "");
            const html = anchor.outerHTML;
            group.set(`${html}|${label}`, { html, label });
        });
    }

    return {
        checks: [...groups].map(([rawLabel, checks], i) => {
            const match = rawLabel.match(CATEGORY_MAX);
            const label = match ? rawLabel.replace(match[0], "").trim() : rawLabel;
            return {
                key: label ? label.slugify({ strict: true }) : `group-${i}`,
                label,
                max: match ? Number(match[1]) : null,
                checks: [...checks.values()]
            };
        }),
        modifiers
    };
}

/**
 * @param {JournalEntryPage} page
 * @returns {Promise<{key: string, html: string}[]>}
 */
export async function parseReputationLocations(page) {
    const template = await enrichPage(page);
    const locations = [];
    let inLocations = false;
    const firstHeading = template.content.querySelector("h1, h2, h3, h4, h5, h6");

    for (const el of template.content.querySelectorAll("h1, h2, h3, h4, h5, h6, p")) {
        const text = el.textContent.trim();
        if (el.tagName !== "P") {
            if (el !== firstHeading) inLocations = /location/i.test(text);
            continue;
        }
        const boldText = el.querySelector("strong, b")?.textContent.trim() ?? "";
        if (boldText && text.startsWith(boldText) && PATTERNS.reputation.test(boldText)) {
            inLocations = false;
            continue;
        }
        if (boldText && boldText === text) {
            inLocations = /location/i.test(text);
            continue;
        }
        if (inLocations && text) locations.push({ key: `location-${locations.length}`, html: el.innerHTML });
    }
    return locations;
}
