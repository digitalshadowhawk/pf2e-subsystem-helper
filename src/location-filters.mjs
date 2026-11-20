export const emptyFilters = () => ({ faction: "", tag: "", search: "", minLevel: null, maxLevel: null });

export function plainText(html) {
    const div = document.createElement("div");
    div.innerHTML = html ?? "";
    return div.textContent.replace(/\s+/g, " ").trim();
}

const narrowsLocations = (f) => !!(f.tag || f.search.trim() || f.minLevel !== null || f.maxLevel !== null);

export function locationMatches(el, f) {
    const tags = (el.dataset.tags ?? "").split("|").filter(Boolean);
    if (f.tag && !tags.includes(f.tag)) return false;

    const level = el.dataset.level === undefined || el.dataset.level === "" ? null : Number(el.dataset.level);
    if (f.minLevel !== null && (level === null || level < f.minLevel)) return false;
    if (f.maxLevel !== null && (level === null || level > f.maxLevel)) return false;

    const terms = f.search.toLowerCase().split(/\s+/).filter(Boolean);
    const haystack = el.dataset.search ?? "";
    return terms.every((term) => haystack.includes(term));
}

/**
 * @returns {number}
 */
export function applyLocationFilters(panel, f) {
    let visible = 0;

    for (const row of panel.querySelectorAll("tr[data-location]")) {
        const show = (!f.faction || row.dataset.topic === f.faction) && locationMatches(row, f);
        row.hidden = !show;
        if (show) visible++;
    }

    const narrowing = narrowsLocations(f);
    for (const li of panel.querySelectorAll("li.topic[data-subsystem='reputation']")) {
        let matches = 0;
        for (const line of li.querySelectorAll(".location[data-location]")) {
            const show = locationMatches(line, f);
            line.hidden = narrowing && !show;
            if (show) matches++;
        }
        const show = (!f.faction || li.dataset.topic === f.faction) && (!narrowing || matches > 0);
        li.hidden = !show;
        li.classList.toggle("filter-match", show && narrowing);
        if (show) visible++;
    }

    const empty = panel.querySelector(".filter-empty");
    if (empty) empty.hidden = visible > 0;
    return visible;
}

export function sortLocationRows(rows, { key = "number", dir = 1 } = {}) {
    const byOrder = (a, b) => a.order - b.order;
    const byNumber = (a, b) => {
        if (!a.number || !b.number) return (!a.number) - (!b.number) || byOrder(a, b);
        return dir * a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: "base" }) || byOrder(a, b);
    };
    const compare = {
        number: byNumber,
        name: (a, b) => dir * a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) || byOrder(a, b),
        level: (a, b) => {
            if (a.level === null || b.level === null) return (a.level === null) - (b.level === null) || byNumber(a, b);
            return dir * (a.level - b.level) || byNumber(a, b);
        },
        faction: (a, b) => dir * a.faction.localeCompare(b.faction, undefined, { sensitivity: "base" }) || byOrder(a, b)
    }[key] ?? byNumber;
    return [...rows].sort(compare);
}
