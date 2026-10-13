export const PATTERNS = {
    research: /^\s*(\d+)\s+Research Points?\b/i,
    influence: /^\s*(\d+)\s+Influence\b/i,
    reputation: /^\s*(Hunted|Hated|Disliked|Ignored|Liked|Admired|Revered)\b/i,
    victory: /^\s*(\d+)\s+(?:Victory Points?|VP)\b/i,
};

export const CATEGORY_MAX = /\(?\s*max(?:imum)?\.?\s*(?:of\s+)?(\d+)(?:\s*points?)?\s*\)?/i;
export const CHASE_TYPES = ["chaseDown", "runAway", "beatTheClock", "competitive"];
const CHASE_POINTS = /^\s*(?:Chase Points?\s*:?\s*(\d+)|(\d+)\s+Chase Points?)\b/i;
const OBSTACLE_LEVEL = /\s*\((\d+)(?:st|nd|rd|th)?\)\s*$/i;
const HAS_CHECK = /@Check\[/i;

export const REPUTATION = {
    min: -50,
    max: 50,
    ticks: [-30, -15, -5, 0, 5, 15, 30],
    tiers: [
        { key: "Revered", min: 30, max: 50, marker: 30 },
        { key: "Admired", min: 15, max: 29, marker: 15 },
        { key: "Liked", min: 5, max: 14, marker: 5 },
        { key: "Ignored", min: -4, max: 4, marker: 0 },
        { key: "Disliked", min: -14, max: -5, marker: -5 },
        { key: "Hated", min: -29, max: -15, marker: -15 },
        { key: "Hunted", min: -50, max: -30, marker: -30 }
    ]
};

export const kindOfModifier = (label) => /weakness/i.test(label) ? "weakness" : /resist/i.test(label) ? "resistance" : null;
export const hasComputers = () => "computers" in (CONFIG.PF2E?.skills ?? {});

const findTier = (name) => REPUTATION.tiers.find((t) => t.key.toLowerCase() === name.toLowerCase());

export function tierThreshold(name) {
    return findTier(name)?.marker ?? 0;
}

export function tierReached(name, value) {
    const tier = findTier(name);
    if (!tier) return false;
    if (tier.min > 0) return value >= tier.min;
    if (tier.max < 0) return value <= tier.max;
    return value >= tier.min && value <= tier.max;
}

export function reputationTier(value) {
    return REPUTATION.tiers.find((t) => value >= t.min).key;
}

export function isReached(threshold, value) {
    return threshold >= 0 ? value >= threshold : value <= threshold;
}

const numericThreshold = (token) => Number(token.replace("−", "-"));

export function parseTopic(page, pattern, toThreshold = numericThreshold) {
    const template = document.createElement("template");
    template.innerHTML = page.text.content ?? "";

    const heading = template.content.querySelector("h1, h2, h3, h4, h5, h6");
    const name = heading?.textContent.trim() || page.name;

    const results = [];
    for (const p of template.content.querySelectorAll("p")) {
        const bold = p.querySelector("strong, b");
        if (!bold || !p.textContent.trimStart().startsWith(bold.textContent.trim())) continue;
        const match = p.textContent.match(pattern);
        if (!match) continue;
        results.push({
            threshold: toThreshold(match[1]),
            token: match[1],
            label: bold.textContent.trim().replace(/[:.]$/, ""),
            element: p
        });
    }
    results.sort((a, b) => a.threshold - b.threshold);

    return { pageId: page.id, name, thresholds: results.map((r) => r.threshold), results };
}

export function adjustCheckHtml(html, adjustment) {
    if (!adjustment) return html;
    const template = document.createElement("template");
    template.innerHTML = html;
    const anchor = template.content.firstElementChild;
    if (!anchor?.dataset.pf2Dc) return html;
    const dc = Number(anchor.dataset.pf2Dc);
    if (!Number.isFinite(dc)) return html;

    const newDc = dc + adjustment;
    anchor.dataset.pf2Dc = String(newDc);
    const walker = document.createTreeWalker(anchor, NodeFilter.SHOW_TEXT);
    const pattern = new RegExp(`\\b${dc}\\b`);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (pattern.test(node.nodeValue)) {
            node.nodeValue = node.nodeValue.replace(pattern, String(newDc));
            break;
        }
    }
    anchor.classList.add(adjustment < 0 ? "dc-lowered" : "dc-raised");
    return anchor.outerHTML;
}

export function parseChase(html, fallbackName) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const queue = [...template.content.children];
    const firstHeading = queue.find((el) => /^H[1-6]$/.test(el.tagName));

    const intro = [];
    const obstacles = [];
    let current = null;

    while (queue.length) {
        const el = queue.shift();
        if (el === firstHeading) continue;

        if (/^H[1-6]$/.test(el.tagName)) {
            const raw = el.textContent.trim();
            const level = raw.match(OBSTACLE_LEVEL);
            current = {
                name: level ? raw.slice(0, level.index).trim() : raw,
                level: level ? Number(level[1]) : null,
                chasePoints: null,
                description: [],
                checks: [],
                options: []
            };
            obstacles.push(current);
            continue;
        }

        if (!current) {
            intro.push(el.outerHTML);
            continue;
        }

        if (el.tagName === "UL" || el.tagName === "OL") {
            if (el.querySelector("a.inline-check") || HAS_CHECK.test(el.textContent)) {
                queue.unshift(...[...el.children].map((li) => li.querySelector(":scope > p") ?? li));
            } else {
                current.description.push(el.outerHTML);
            }
            continue;
        }

        const text = el.textContent.trim();
        if (!text) continue;

        const cp = text.match(CHASE_POINTS);
        if (cp) {
            current.chasePoints = Number(cp[1] ?? cp[2]);
            continue;
        }

        if (el.querySelector("a.inline-check") || HAS_CHECK.test(text)) {
            current.checks.push(el.innerHTML.trim());
            continue;
        }

        const boldText = el.querySelector("strong, b")?.textContent.trim() ?? "";
        if (boldText && text.startsWith(boldText) && /^options?:?$/i.test(boldText)) {
            const body = el.cloneNode(true);
            body.querySelector("strong, b")?.remove();
            current.options.push(body.innerHTML.trim());
            continue;
        }

        current.description.push(el.outerHTML);
    }

    return {
        name: firstHeading?.textContent.trim() || fallbackName,
        intro: intro.join("\n"),
        obstacles: obstacles.map((o) => ({ ...o, description: o.description.join("\n") }))
    };
}

export function chaseDefaults() {
    return {
        discovered: false, obstacle: 0, points: 0, opponent: 1, round: 1, type: "chaseDown", pace: 1, rounds: null, revealedThrough: 0, partySize: null
    };
}

export function chaseRequired(obstacle, state) {
    if (obstacle?.chasePoints) return obstacle.chasePoints;
    const partySize = state?.partySize ?? detectedPartySize();
    return Math.max(1, partySize - 1);
}

export function chaseStatus(state, count) {
    const party = Math.min(state.obstacle, count);
    const opponent = Math.min(state.opponent, count);
    if (count === 0) return { key: "NoObstacles", tone: "warning" };
    if (count < 2) return { key: "TooFew", tone: "warning" };
    switch (state.type) {
        case "beatTheClock": {
            const limit = state.rounds ?? count;
            if (party >= count) return { key: "MadeIt", tone: "good" };
            if (state.round > limit) return { key: "OutOfTime", tone: "bad" };
            return { key: "RoundsLeft", tone: "neutral", data: { rounds: limit - state.round + 1 } };
        }
        case "runAway":
            if (opponent >= party) return { key: "CaughtByPursuers", tone: "bad" };
            if (party >= count || party - opponent >= 3) return { key: "Escaped", tone: "good" };
            return { key: "Ahead", tone: "neutral", data: { gap: party - opponent } };
        case "competitive":
            if (party >= count) return { key: "Won", tone: "good" };
            if (opponent >= count) return { key: "Lost", tone: "bad" };
            if (party === opponent) return { key: "Even", tone: "neutral" };
            return party > opponent
                ? { key: "Ahead", tone: "neutral", data: { gap: party - opponent } }
                : { key: "Behind", tone: "neutral", data: { gap: opponent - party } };
        default: // chaseDown
            if (party >= opponent) return { key: "CaughtQuarry", tone: "good" };
            if (opponent >= count) return { key: "QuarryEscaped", tone: "bad" };
            return { key: "Behind", tone: "neutral", data: { gap: opponent - party } };
    }
}

export function partyMembers() {
    const members = game.actors.party?.members ?? [];
    return members.filter((a) => {
        if (a.type !== "character" || !a.class) return false;
        const cls = `${a.class.slug ?? ""} ${a.class.name ?? ""}`;
        return !/eidolon|companion/i.test(cls);
    });
}

export function detectedPartySize() {
    return partyMembers().length || 4;
}