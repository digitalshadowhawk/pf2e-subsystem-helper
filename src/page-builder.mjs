import { LANG, MODULE_ID } from "./constants.mjs";
import { SHEET_CLASSES } from "./subsystem-sheets.mjs";
import { modifierSkills, skillsLabel } from "./modifiers.mjs";
import { BUILDERS } from "./builders.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const PARTIALS = ["header", "check-groups", "thresholds", "check-rows"].map((name) => `modules/${MODULE_ID}/templates/builder/partials/${name}.hbs`);

/* -------------------------------------------- */
/*  Helpers                                     */
/* -------------------------------------------- */

function arrays(value) {
    if (Array.isArray(value)) return value.map(arrays);
    if (value === null || typeof value !== "object") return value;
    const keys = Object.keys(value);
    if (keys.length && keys.every((k) => /^\d+$/.test(k))) {
        return keys.sort((a, b) => a - b).map((k) => arrays(value[k]));
    }
    return Object.fromEntries(keys.map((k) => [k, arrays(value[k])]));
}

const toNumber = (v) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));

function skillChoices() {
    const choices = { perception: "PF2E.PerceptionLabel" };
    for (const [key, value] of Object.entries(CONFIG.PF2E?.skills ?? {})) {
        choices[key] = typeof value === "string" ? value : value.label;
    }
    Object.assign(choices, { fortitude: "PF2E.SavesFortitude", reflex: "PF2E.SavesReflex", will: "PF2E.SavesWill" });
    const localized = Object.fromEntries(Object.entries(choices).map(([k, v]) => {
        const label = game.i18n.localize(v);
        return [k, label === v ? k.capitalize() : label];
    }));
    localized.lore = _loc(`${LANG}.Builder.Lore`);
    return localized;
}

function modifierPreview(kind, text) {
    const plain = String(text ?? "").replace(/<[^>]+>/g, " ");
    const amount = Number(plain.match(/\bby\s+(\d+)/i)?.[1] ?? 2);
    const skills = skillsLabel(modifierSkills(plain)) || _loc(`${LANG}.Builder.AllChecks`);
    const sign = kind === "weakness" ? "−" : "+";
    return `${skills} · DC ${sign}${amount}`;
}

/* ==========================================================================
   Page Builder
   ========================================================================== */

export class PageBuilder extends HandlebarsApplicationMixin(ApplicationV2) {

    /**
     * @param {object} options
     * @param {string} options.subsystem             Key in BUILDERS
     * @param {JournalEntry} [options.journal]        Journal to add a new page to
     * @param {JournalEntryPage} [options.page]       Existing page to edit
     */
    constructor({ subsystem, journal, page, ...options } = {}) {
        super(options);
        this.subsystem = subsystem;
        this.definition = BUILDERS[subsystem];
        this.page = page ?? null;
        this.journal = page?.parent ?? journal ?? null;
        this.model = page
            ? this.definition.fromHtml(page.text.content ?? "", page.name)
            : this.definition.blank();
    }

    /** @override */
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: [MODULE_ID, "page-builder", "themed", "theme-light"],
        window: {
            icon: "fa-solid fa-pen-ruler",
            resizable: true
        },
        position: { width: 780, height: 760 },
        form: {
            handler: PageBuilder.#onSubmit,
            submitOnChange: false,
            closeOnSubmit: false
        },
        actions: {
            addRow: PageBuilder.#onAddRow,
            removeRow: PageBuilder.#onRemoveRow,
            moveRow: PageBuilder.#onMoveRow
        }
    };

    /** @override */
    static PARTS = {
        form: { template: "", scrollable: [""] },   // "" = the part's own root element
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    /** @override */
    get title() {
        const name = this.page?.name ?? _loc(`${LANG}.Builder.NewPage`);
        return `${_loc(`${LANG}.Tabs.${this.subsystem}`)}: ${name}`;
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    /** @override */
    async _preFirstRender(context, options) {
        await super._preFirstRender(context, options);
        await foundry.applications.handlebars.loadTemplates(PARTIALS);
    }

    /** @override */
    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        parts.form.template = `modules/${MODULE_ID}/templates/builder/${this.definition.template}`;
        return parts;
    }

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const model = this.model;
        Object.assign(context, this.definition.context?.() ?? {});
        return Object.assign(context, {
            model,
            view: this.definition.view?.(model) ?? model,
            editing: !!this.page,
            skillChoices: skillChoices(),
            kindChoices: {
                weakness: _loc(`${LANG}.Influence.Modifier.Weakness`),
                resistance: _loc(`${LANG}.Influence.Modifier.Resistance`)
            },
            discoveryChoices: {
                "": _loc(`${LANG}.Builder.Discovery.known`),
                hidden: _loc(`${LANG}.Builder.Discovery.hidden`),
                revealed: _loc(`${LANG}.Builder.Discovery.revealed`)
            },
            modifiers: (model.modifiers ?? []).map((m) => ({ ...m, preview: modifierPreview(m.kind, m.text) })),
            buttons: [{
                type: "submit",
                icon: "fa-solid fa-floppy-disk",
                label: this.page ? `${LANG}.Builder.Save` : `${LANG}.Builder.Create`
            }]
        });
    }

    /** @override */
    async _preRender(context, options) {
        await super._preRender(context, options);
        const scroller = this.element?.querySelector(".builder-body");
        this.#scrollTop = scroller ? scroller.scrollTop : null;
    }

    /** @type {number|null} */
    #scrollTop = null;

    /** @override */
    async _onRender(context, options) {
        await super._onRender(context, options);
        const PM = foundry.applications.elements.HTMLProseMirrorElement;
        for (const slot of this.element.querySelectorAll("[data-editor]")) {
            const name = slot.dataset.editor;
            const value = foundry.utils.getProperty(this.model, name) ?? "";
            const editor = PM?.create
                ? PM.create({ name, value, toggled: false })
                : Object.assign(document.createElement("textarea"), { name, value });
            editor.classList.add("builder-editor");
            slot.replaceWith(editor);
        }
        if (this.#scrollTop !== null) {
            const scroller = this.element.querySelector(".builder-body");
            if (scroller) scroller.scrollTop = this.#scrollTop;
        }
    }

    _onChangeForm(formConfig, event) {
        super._onChangeForm(formConfig, event);
        const target = event.target;
        const row = target.closest("[data-row]");
        if (!row) return;
        if (target.name?.endsWith(".skill")) {
            row.querySelector("[data-lore]")?.toggleAttribute("hidden", target.value !== "lore");
        }
        if (row.dataset.row === "modifier") {
            const kind = row.querySelector("[name$='.kind']")?.value;
            const text = row.querySelector("[name$='.text']")?.value;
            const preview = row.querySelector("[data-preview]");
            if (preview) preview.textContent = modifierPreview(kind, text);
        }
    }

    /* -------------------------------------------- */
    /*  Model                                       */
    /* -------------------------------------------- */

    #readForm() {
        const data = new foundry.applications.ux.FormDataExtended(this.element).object;
        for (const editor of this.element.querySelectorAll("prose-mirror[name]")) data[editor.name] = editor.value;
        const model = arrays(foundry.utils.expandObject(data));
        return this.#normalize({ ...this.model, ...model });
    }

    #normalize(model) {
        model.groups = (model.groups ?? []).map((g) => ({
            label: g.label ?? "",
            max: toNumber(g.max),
            checks: (g.checks ?? []).map((c) => ({ ...c, dc: toNumber(c.dc) }))
        }));
        model.modifiers = model.modifiers ?? [];
        model.locations = model.locations ?? [];
        model.thresholds = (model.thresholds ?? []).map((t) => ({ ...t, points: toNumber(t.points) }));
        this.definition.normalize?.(model);
        return model;
    }

    #collection(path) {
        const list = foundry.utils.getProperty(this.model, path);
        if (Array.isArray(list)) return list;
        const created = [];
        foundry.utils.setProperty(this.model, path, created);
        return created;
    }

    /* -------------------------------------------- */
    /*  Actions                                     */
    /* -------------------------------------------- */

    /** @this {PageBuilder} */
    static #onAddRow(event, target) {
        this.model = this.#readForm();
        const path = target.dataset.path;
        const key = path.split(".").at(-1);
        this.#collection(path).push(this.definition.rows[key]());
        this.render();
    }

    /** @this {PageBuilder} */
    static #onRemoveRow(event, target) {
        this.model = this.#readForm();
        const { path, index } = target.dataset;
        this.#collection(path).splice(Number(index), 1);
        this.render();
    }

    /** @this {PageBuilder} */
    static #onMoveRow(event, target) {
        this.model = this.#readForm();
        const { path, index, delta } = target.dataset;
        const list = this.#collection(path);
        const from = Number(index);
        const to = from + Number(delta);
        if (to < 0 || to >= list.length) return;
        [list[from], list[to]] = [list[to], list[from]];
        this.render();
    }

    /** @this {PageBuilder} */
    static async #onSubmit(event, form, formData) {
        this.model = this.#readForm();
        const name = this.model.name?.trim();
        if (!name) {
            ui.notifications.warn(_loc(`${LANG}.Builder.NeedsName`));
            return;
        }
        const content = this.definition.toHtml(this.model);

        if (this.page) {
            await this.page.update({ name, "text.content": content });
        } else {
            if (!this.journal) {
                ui.notifications.error(_loc(`${LANG}.Builder.NoJournal`));
                return;
            }
            await this.journal.createEmbeddedDocuments("JournalEntryPage", [{
                name,
                type: "text",
                text: { content, format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML },
                flags: { core: { sheetClass: SHEET_CLASSES[this.subsystem] } }
            }]);
        }
        await this.close();
    }

    /* -------------------------------------------- */

    static supports(subsystem) {
        return subsystem in BUILDERS;
    }
}
