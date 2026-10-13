import { adjustCheckHtml } from "./utils.mjs";

const SKILLS = [
    "acrobatics", "arcana", "athletics", "computers", "crafting", "deception", "diplomacy",
    "intimidation", "medicine", "nature", "occultism", "performance", "piloting", "religion",
    "society", "stealth", "survival", "thievery", "perception"
];

const word = (w) => `[${w[0].toUpperCase()}${w[0]}]${w.slice(1)}`;

const ITEM = String.raw`(?:(?:[A-Z][\w'’-]*\s+){0,4}[Ll]ore|${SKILLS.map(word).join("|")})`;
const JOIN = String.raw`(?:\s*,\s*(?:and\s+|or\s+)?|\s+(?:and|or)\s+)`;
const SKILL_LIST = new RegExp(String.raw`\b${ITEM}(?:${JOIN}${ITEM})*\s+(?:[Cc]hecks?|DCs?)\b`, "g");
const LIST_ITEM = new RegExp(ITEM, "g");

function itemSlug(item) {
    const words = item.trim().split(/\s+/);
    if (words.at(-1).toLowerCase() !== "lore") return words[0].toLowerCase();
    const name = words.slice(0, -1).join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return name ? `${name}-lore` : "lore";
}

export function modifierSkills(text) {
    const skills = new Set();
    for (const match of String(text ?? "").matchAll(SKILL_LIST)) {
        for (const item of match[0].matchAll(LIST_ITEM)) skills.add(itemSlug(item[0]));
    }
    return [...skills];
}

export function checkStatistic(html) {
    const slug = html.match(/data-pf2-check="([^"]+)"/)?.[1]
        ?? html.match(/@Check\[(?:type:)?([\w-]+)/i)?.[1]
        ?? "";
    return slug.toLowerCase();
}

export function modifierApplies(skills, statistic) {
    if (!skills?.length) return true;
    if (!statistic) return false;
    return skills.some((s) => s === statistic || (s === "lore" && statistic.endsWith("-lore")));
}

/**
 * @param {{active: boolean, value: number, skills: string[]}[]} modifiers
 * @param {string} html   The check's HTML
 */
export function checkAdjustment(modifiers, html) {
    const statistic = checkStatistic(html);
    return modifiers
        .filter((m) => m.active && modifierApplies(m.skills, statistic))
        .reduce((sum, m) => sum + m.value, 0);
}

export const skillsLabel = (skills) => (skills ?? [])
    .map((s) => (s === "lore" ? "Any Lore" : s.split("-").map((w) => w.capitalize()).join(" ")))
    .join(", ");

const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

/**
 * @param {object[]} groups      Check groups: {label, checks: {html, label}[]}
 * @param {object[]} modifiers   {active, value, skills}
 */
export function applyModifiersToGroups(groups, modifiers) {
    return groups.map((group) => {
        if (/discovery/i.test(group.label)) return { ...group, adjustment: "" };
        const checks = group.checks.map((c) => {
            const delta = checkAdjustment(modifiers, c.html);
            return { ...c, delta, html: delta ? adjustCheckHtml(c.html, delta) : c.html };
        });
        const deltas = new Set(checks.map((c) => c.delta));
        const uniform = deltas.size === 1 ? [...deltas][0] : null;
        return {
            ...group,
            adjustment: uniform ? signed(uniform) : "",
            checks: checks.map((c) => ({ ...c, adjustment: uniform === null && c.delta ? signed(c.delta) : "" }))
        };
    });
}
