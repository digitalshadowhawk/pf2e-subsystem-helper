/**
 * @param {string} html
 * @returns {{ html: string, number: string|null, level: number|null, tags: string[] }}
 */
export function parseLocationMeta(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const root = template.content;
    const walker = () => document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    let number = null;
    const first = walker().nextNode();
    const numberMatch = first?.nodeValue.match(/^\s*([A-Za-z]{0,2}\d{1,3}[A-Za-z]?)[.)]\s+/);
    if (numberMatch) {
        number = numberMatch[1];
        first.nodeValue = first.nodeValue.slice(numberMatch[0].length);
    }

    let level = null;
    let tags = [];
    const DETAILS = /\s*\(\s*((?:level\s+-?\d+|tags?\s*:)[^)]*)\)/i;
    for (let node, w = walker(); (node = w.nextNode());) {
        const match = node.nodeValue.match(DETAILS);
        if (!match) continue;
        let inner = match[1].trim();
        const levelMatch = inner.match(/^level\s+(-?\d+)\s*[;,]?/i);
        if (levelMatch) {
            level = Number(levelMatch[1]);
            inner = inner.slice(levelMatch[0].length);
        }
        inner = inner.replace(/^\s*tags?\s*:/i, "");
        tags = inner.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
        node.nodeValue = node.nodeValue.slice(0, match.index) + node.nodeValue.slice(match.index + match[0].length);
        break;
    }

    return { html: template.innerHTML.trim(), number, level, tags };
}

/**
 * @param {object[]} locations
 * @returns {object[]}
 */
export function withLocationKeys(locations) {
    const counts = new Map();
    for (const l of locations) {
        if (l.number) counts.set(l.number.toLowerCase(), (counts.get(l.number.toLowerCase()) ?? 0) + 1);
    }
    return locations.map((l, index) => {
        const positionKey = `location-${index}`;
        const unique = l.number && counts.get(l.number.toLowerCase()) === 1;
        return unique
            ? { ...l, key: `number-${l.number.toLowerCase()}`, legacyKey: positionKey }
            : { ...l, key: positionKey, legacyKey: null };
    });
}

export const hasLocationKey = (keys, location) =>
    keys.has(location.key) || (!!location.legacyKey && keys.has(location.legacyKey));
