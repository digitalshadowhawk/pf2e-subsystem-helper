export const BASTION_ID = "pf2e-bastion-of-blasphemies";
export const BASTION_SETTING = `${BASTION_ID}.campaign`;

export const bastionActive = () => !!game.modules.get(BASTION_ID)?.active;

function campaignData() {
    if (!bastionActive()) return null;
    try {
        return game.settings.get(BASTION_ID, "campaign");
    } catch {
        return null;
    }
}

function findPage(pageId) {
    if (!pageId) return null;
    for (const journal of game.journal) {
        const page = journal.pages.get(pageId);
        if (page) return page;
    }
    return null;
}

const nameFromKey = (key) => key.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function parsePage(page) {
    const template = document.createElement("template");
    template.innerHTML = page.text?.content ?? "";
    const root = template.content;

    const name = root.querySelector("header h1, header h2, header h3, header h4")?.textContent.trim() || page.name;
    const results = [...root.querySelectorAll("[data-threshold]")].map((element) => ({
        threshold: Number(element.dataset.threshold),
        label: element.querySelector("strong, b")?.textContent.trim() ?? `${element.dataset.threshold}`,
        element
    })).filter((r) => Number.isFinite(r.threshold));

    return { name, results };
}

/**
 * @returns {object[]}
 */
export function bastionResearchTopics() {
    const research = campaignData()?.research;
    if (!research) return [];

    return Object.entries(research).map(([key, entry]) => {
        const page = findPage(entry.pageId);
        const parsed = page ? parsePage(page) : null;
        const thresholds = [...(entry.thresholds ?? [])].map(Number).filter(Number.isFinite).sort((a, b) => a - b);
        return {
            pageId: `bastion-${key}`,
            key,
            name: parsed?.name ?? nameFromKey(key),
            thresholds,
            results: parsed?.results ?? [],
            points: Number(entry.points) || 0,
            discovered: !!entry.discovered,
            page
        };
    });
}
