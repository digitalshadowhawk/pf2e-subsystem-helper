import { Subsystems } from "./subsystems.mjs"
import { MODULE_ID, SUBSYSTEMS } from "./constants.mjs"
import { SHEET_CLASSES } from "./subsystem-sheets.mjs";

function watchedJournals() {
    const data = subsystems.manager?.data;
    if (!data) return [];
    return SUBSYSTEMS.map((id) => data[id]?.journal).filter(Boolean);
}

Hooks.once("init", () => {
    globalThis.subsystems = game.modules.get(MODULE_ID);

    Subsystems.onInit();
})

Hooks.once("ready", async () => {
    subsystems.manager = new Subsystems();
})

Hooks.on("updateJournalEntryPage", (page) => {
    if (watchedJournals().includes(page.parent?.uuid)) subsystems.manager.render();
});

Hooks.on("createJournalEntryPage", (page) => {
    if (watchedJournals().includes(page.parent?.uuid)) subsystems.manager.render();
});

Hooks.on("createJournalEntryPage", (page, _options, userId) => {
    if (userId !== game.user.id || page.type !== "text") return;
    const data = game.settings.get(MODULE_ID, "subsystems");
    for (const [key, sheetClass] of Object.entries(SHEET_CLASSES)) {
        if (page.parent?.uuid === data[key].journal) page.setFlag("core", "sheetClass", sheetClass);
    }
});

Hooks.on("deleteJournalEntryPage", (page) => {
    if (watchedJournals().includes(page.parent?.uuid)) subsystems.manager.render();
});