import { adjustCheckHtml } from "./utils.mjs";

/* ==========================================================================
   Influence weaknesses/resistances: which checks they apply to

   A modifier is limited to specific skills when its text names them as checks:
     "Diplomacy checks", "Deception or Intimidation checks", "Society and Lore checks",
     "the Diplomacy DC". Anything else ("all checks", "Influence checks", or no
   skill named) applies to every check, as before.
   ========================================================================== */

const SKILLS = [
    "acrobatics", "arcana", "athletics", "computers", "crafting", "deception", "diplomacy",
    "intimidation", "medicine", "nature", "occultism", "performance", "piloting", "religion",
    "society", "stealth", "survival", "thievery", "perception", "lore"
];

const SKILL = `(?:${SKILLS.join("|")})`;
const JOIN = String.raw`(?:\s*,\s*(?:and\s+|or\s+)?|\s+(?:and|or)\s+)`;
/** One or more skills in a row, followed by "check(s)" or "DC(s)". */
const SKILL_LIST = new RegExp(String.raw`\b${SKILL}(?:${JOIN}${SKILL})*\s+(?:checks?|DCs?)\b`, "gi");

/** Skills a weakness/resistance is limited to, from its text. Empty = applies to all checks. */
export function modifierSkills(text) {
    const skills = new Set();
    for (const match of String(text ?? "").matchAll(SKILL_LIST)) {
        for (const word of match[0].toLowerCase().match(/[a-z]+/g)) {
            if (SKILLS.includes(word)) skills.add(word);
        }
    }
    return [...skills];
}

/** The statistic an inline check rolls, from enriched HTML or a raw @Check. */
export function checkStatistic(html) {
    const slug = html.match(/data-pf2-check="([^"]+)"/)?.[1]
        ?? html.match(/@Check\[(?:type:)?([\w-]+)/i)?.[1]
        ?? "";
    return slug.toLowerCase();
}

/** Whether a modifier limited to `skills` affects a check rolling `statistic`. */
export function modifierApplies(skills, statistic) {
    if (!skills?.length) return true;
    if (!statistic) return false;
    return skills.some((s) => s === statistic || (s === "lore" && statistic.endsWith("-lore")));
}

/**
 * Total DC change for one check from the active modifiers.
 * @param {{active: boolean, value: number, skills: string[]}[]} modifiers   value is negative for weaknesses
 * @param {string} html   The check's HTML
 */
export function checkAdjustment(modifiers, html) {
    const statistic = checkStatistic(html);
    return modifiers
        .filter((m) => m.active && modifierApplies(m.skills, statistic))
        .reduce((sum, m) => sum + m.value, 0);
}

/** "Diplomacy, Deception" for display, or "" when a modifier applies to everything. */
export const skillsLabel = (skills) => (skills ?? []).map((s) => s.capitalize()).join(", ");

const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

/**
 * Apply active weaknesses/resistances to check groups, check by check.
 * Discovery groups are never adjusted. When every check in a group gets the same change,
 * the group carries the label ("DC +2"); otherwise each affected check carries its own.
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
