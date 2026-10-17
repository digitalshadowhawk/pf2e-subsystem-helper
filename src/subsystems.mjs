import { MODULE_ID, LANG, SUBSYSTEMS } from "./constants.mjs";
import { SubsystemData } from "./data.mjs";
import { PATTERNS, REPUTATION, CHASE_TYPES, isReached, parseTopic, partyMembers, reputationTier, tierReached, tierThreshold, chaseDefaults, chaseRequired, chaseStatus, detectedPartySize, parseChase, hasComputers } from "./utils.mjs";
import { parseReputationLocations } from "./parsers.mjs";
import { applyModifiersToGroups, skillsLabel } from "./modifiers.mjs";
import { SubsystemPageSheet, ResearchPageSheet, InfluencePageSheet, ReputationPageSheet, ChasePageSheet, InfiltrationPageSheet, VictoryPageSheet, HackingPageSheet, SHEET_CLASSES } from "./subsystem-sheets.mjs";
import { applyAP, applyResult, buildInfiltrationView, clearForAll, infiltrationChatContent, infiltrationDefaults, movePC, parseInfiltration } from "./infiltration.mjs";
import { adjustAccessPoint, applyCountermeasure, applyHackResult, buildHackingView, endHackingRound, hackingChatContent, hackingDefaults, parseComputer, toggleVulnerability } from "./hacking.mjs";
import { PageBuilder } from "./page-builder.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const availableSubsystems = () => SUBSYSTEMS.filter((id) => id !== "hacking" || hasComputers());

/* -------------------------------------------- */
/*  Module-level helpers                        */
/* -------------------------------------------- */

const topicOf = (target) => target.closest("[data-topic]").dataset.topic;

const textPages = (journal) => journal
    ? journal.pages.contents.filter((p) => p.type === "text").sort((a, b) => a.sort - b.sort)
    : [];

function visibilityControl(discovered, prefix, style = "lightbulb") {
    const [on, off] = style === "eye"
        ? ["fa-solid fa-eye", "fa-solid fa-eye-slash"]
        : ["fa-solid fa-lightbulb-on", "fa-solid fa-lightbulb-slash"];
    return discovered
        ? { discoveredIcon: on, discoveredTooltip: _loc(`${prefix}.Discovered`) }
        : { discoveredIcon: off, discoveredTooltip: _loc(`${prefix}.Undiscovered`) };
}

const sliderMarkers = (max, thresholds = []) => [...Array(max + 1).keys()].map((n) => ({
    threshold: thresholds.includes(n),
    pos: max ? n / max : 0
}));

const signedLabel = (n) => (n > 0 ? `+${n}` : `${n}`);

async function enrich(html, options) {
    return foundry.applications.ux.TextEditor.implementation.enrichHTML(html, options);
}

/* ==========================================================================
   Subsystems window
   ========================================================================== */

export class Subsystems extends HandlebarsApplicationMixin(ApplicationV2) {

    /* -------------------------------------------- */
    /*  Configuration                               */
    /* -------------------------------------------- */

    /** @override */
    static DEFAULT_OPTIONS = {
        tag: "form",
        id: "subsystems-window",
        classes: ["themed", "theme-light"],
        window: {
            icon: "fa-solid fa-book",
            title: "Subsystems",
            contentClasses: [MODULE_ID],
            resizable: true
        },
        position: { width: 800, height: 700 },
        form: {
            submitOnChange: true,
            handler: Subsystems.#onSubmitForm
        },
        actions: {
            // Shared
            toggleChecks: Subsystems.#onToggleChecks,
            toggleTopicDiscovered: Subsystems.#onToggleTopicDiscovered,
            resultsToChat: Subsystems.#onResultsToChat,
            newPage: Subsystems.#onNewPage,
            editPage: Subsystems.#onEditPage,
            toggleSecret: Subsystems.#onToggleSecret,
            // Influence
            toggleModifier: Subsystems.#onToggleModifier,
            // Reputation
            toggleLocation: Subsystems.#onToggleLocation,
            adjustReputation: Subsystems.#onAdjustReputation,
            // Chases
            chaseAward: Subsystems.#onChaseAward,
            chaseMove: Subsystems.#onChaseMove,
            chaseNextRound: Subsystems.#onChaseNextRound,
            chaseReveal: Subsystems.#onChaseReveal,
            chaseReset: Subsystems.#onChaseReset,
            chasePost: Subsystems.#onChasePost,
            // Infiltration
            infilSelect: Subsystems.#onInfilSelect,
            infilAward: Subsystems.#onInfilAward,
            infilClearAll: Subsystems.#onInfilClearAll,
            infilMovePC: Subsystems.#onInfilMovePC,
            infilAP: Subsystems.#onInfilAP,
            infilEndRound: Subsystems.#onInfilEndRound,
            infilEdge: Subsystems.#onInfilEdge,
            infilComplication: Subsystems.#onInfilComplication,
            infilOpportunity: Subsystems.#onInfilOpportunity,
            infilDismiss: Subsystems.#onInfilDismiss,
            infilPost: Subsystems.#onInfilPost,
            infilUndo: Subsystems.#onInfilUndo,
            infilReset: Subsystems.#onInfilReset,
            // Hacking
            hackResult: Subsystems.#onHackResult,
            hackAdjust: Subsystems.#onHackAdjust,
            hackVulnerability: Subsystems.#onHackVulnerability,
            hackCountermeasure: Subsystems.#onHackCountermeasure,
            hackEndRound: Subsystems.#onHackEndRound,
            hackDismiss: Subsystems.#onHackDismiss,
            hackPost: Subsystems.#onHackPost,
            hackReset: Subsystems.#onHackReset
        }
    };

    /** @override */
    static TABS = {
        subsystems: {
            tabs: [
                { id: "research", icon: "fa-solid fa-book" },
                { id: "influence", icon: "fa-solid fa-handshake" },
                { id: "reputation", icon: "fa-solid fa-flag" },
                { id: "chases", icon: "fa-solid fa-person-running" },
                { id: "infiltration", icon: "fa-solid fa-user-secret" },
                { id: "victory", icon: "fa-solid fa-trophy" },
                { id: "hacking", icon: "fa-solid fa-laptop-code" }
            ],
            initial: "research",
            labelPrefix: `${LANG}.Tabs`
        }
    };

    /** @override */
    static PARTS = {
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        ...Object.fromEntries(SUBSYSTEMS.map((id) => [id, {
            template: `modules/${MODULE_ID}/templates/${id}.hbs`,
            scrollable: ["ol.topics"]
        }]))
    };

    /* -------------------------------------------- */
    /*  Instance state (GM client only, not saved)  */
    /* -------------------------------------------- */

    #expanded = new Set();
    #researchCategories = new Map();
    #reputation = new Map();
    #infilSelected = new Map();
    #infilHistory = new Map();

    /* -------------------------------------------- */
    /*  Initialization                              */
    /* -------------------------------------------- */

    static onInit() {
        game.settings.register(MODULE_ID, "subsystems", {
            name: "Subsystem Data",
            scope: "world",
            config: false,
            type: SubsystemData,
            onChange: () => {
                subsystems.manager?.render();
                for (const app of foundry.applications.instances.values()) {
                    if (app instanceof SubsystemPageSheet && app.rendered) app.render();
                }
            }
        });

        game.settings.register(MODULE_ID, "editInJournal", {
            name: `${LANG}.Settings.EditInJournal.Name`,
            hint: `${LANG}.Settings.EditInJournal.Hint`,
            scope: "user",
            config: true,
            type: Boolean,
            default: false,
            onChange: () => subsystems.manager?.render()
        });

        Hooks.on("renderChatMessageHTML", (message, element) => {
            const flags = message.flags[MODULE_ID];
            const subsystem = flags?.results ?? (flags?.researchThresholds ? "research" : null);
            if (!subsystem) return;
            element.classList.add(MODULE_ID, subsystem);
            element.addEventListener("click", (event) => {
                event.target.closest("li > button")?.parentElement.classList.toggle("expanded");
            });
        });

        Hooks.on("getSceneControlButtons", (controls) => {
            controls.notes.tools.subsystems = {
                name: "subsystems",
                title: "Subsystems",
                icon: "fa-solid fa-book",
                order: Object.keys(controls.notes.tools).length,
                button: true,
                visible: true,
                onChange: () => subsystems.manager?.render({ force: true })
            };
        });

        const { DocumentSheetConfig } = foundry.applications.apps;
        for (const [cls, label] of [
            [ResearchPageSheet, `${LANG}.Sheets.Research`],
            [InfluencePageSheet, `${LANG}.Sheets.Influence`],
            [ReputationPageSheet, `${LANG}.Sheets.Reputation`],
            [ChasePageSheet, `${LANG}.Sheets.Chase`],
            [InfiltrationPageSheet, `${LANG}.Sheets.Infiltration`],
            [VictoryPageSheet, `${LANG}.Sheets.Victory`],
            ...(hasComputers() ? [[HackingPageSheet, `${LANG}.Sheets.Hacking`]] : [])
        ]) {
            DocumentSheetConfig.registerSheet(foundry.documents.JournalEntryPage, MODULE_ID, cls, {
                types: ["text"], makeDefault: false, label
            });
        }
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        this.data = game.settings.get(MODULE_ID, "subsystems");
        context.editTooltip = _loc(game.settings.get(MODULE_ID, "editInJournal")
            ? `${LANG}.EditPage.Journal` : `${LANG}.EditPage.Form`);

        this.journals = Object.fromEntries(SUBSYSTEMS.map((id) => {
            const uuid = this.data[id].journal;
            return [id, uuid ? fromUuidSync(uuid) : null];
        }));

        this.topics = {
            research: textPages(this.journals.research).map((p) => parseTopic(p, PATTERNS.research)),
            influence: textPages(this.journals.influence).map((p) => parseTopic(p, PATTERNS.influence)),
            reputation: textPages(this.journals.reputation).map((p) => parseTopic(p, PATTERNS.reputation, tierThreshold)),
            chases: textPages(this.journals.chases)
                .map((p) => ({ pageId: p.id, ...parseChase(p.text.content ?? "", p.name) })),
            infiltration: textPages(this.journals.infiltration)
                .map((p) => ({ pageId: p.id, ...parseInfiltration(p.text.content ?? "", p.name) })),
            victory: textPages(this.journals.victory).map((p) => parseTopic(p, PATTERNS.victory)),
            hacking: textPages(this.journals.hacking)
                .map((p) => ({ pageId: p.id, ...parseComputer(p.text.content ?? "", p.name) }))
        };

        Object.assign(context, {
            tabs: this._prepareTabs("subsystems"),
            rootId: this.id,
            isGM: game.user.isGM,
            journalChoices: Object.fromEntries(game.journal.map((j) => [j.uuid, j.name])),
            journal: this.data.research.journal,
            influenceJournal: this.data.influence.journal,
            reputationJournal: this.data.reputation.journal,
            chasesJournal: this.data.chases.journal,
            infiltrationJournal: this.data.infiltration.journal,
            victoryJournal: this.data.victory.journal,
            hackingJournal: this.data.hacking.journal
        });
        return context;
    }

    /** @override */
    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        const available = availableSubsystems();
        for (const id of SUBSYSTEMS) if (!available.includes(id)) delete parts[id];
        return parts;
    }

    /** @override */
    _prepareTabs(group) {
        const tabs = super._prepareTabs(group);
        const available = availableSubsystems();
        for (const id of SUBSYSTEMS) if (!available.includes(id)) delete tabs[id];
        return tabs;
    }

    /** @override */
    async _preparePartContext(partId, context) {
        const partContext = await super._preparePartContext(partId, context);
        if (partId in partContext.tabs) partContext.tab = partContext.tabs[partId];
        switch (partId) {
            case "research": await this.#prepareResearchContext(partContext); break;
            case "influence": await this.#prepareInfluenceContext(partContext); break;
            case "reputation": await this.#prepareReputationContext(partContext); break;
            case "chases": await this.#prepareChaseContext(partContext); break;
            case "infiltration": await this.#prepareInfiltrationContext(partContext); break;
            case "victory": await this.#prepareVictoryContext(partContext); break;
            case "hacking": await this.#prepareHackingContext(partContext); break;
        }
        return partContext;
    }

    /** @override */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.classList.toggle("player-view", !game.user.isGM);
    }

    async #pageDetails(page, options) {
        if (!game.user.isGM) return { groups: [], modifiers: [], notes: "" };
        const html = await enrich(page.text.content ?? "", { relativeTo: page, secrets: true });
        return SubsystemPageSheet.parse(html, page.name, options);
    }

    #visibleTopics(subsystem) {
        const topics = this.topics[subsystem];
        if (game.user.isGM) return topics;
        return topics.filter((t) => this.data[subsystem].topics[t.pageId]?.discovered);
    }

    /* -------------------------------------------- */
    /*  Tab contexts                                */
    /* -------------------------------------------- */

    async #prepareResearchContext(partContext) {
        const prefix = `${LANG}.Research.Topic`;
        const isGM = game.user.isGM;
        const journal = this.journals.research;
        partContext.instructions = await enrich(_loc(`${LANG}.Research.Instructions`));

        partContext.topics = await Promise.all(this.#visibleTopics("research").map(async (topic) => {
            const page = journal.pages.get(topic.pageId);
            const state = this.data.research.topics[topic.pageId] ?? { discovered: false, points: 0, categories: {} };
            const max = topic.thresholds.at(-1) ?? 0;

            const details = await this.#pageDetails(page, { pattern: PATTERNS.research });
            const stored = state.categories ?? {};
            const checks = details.groups.map((g) => {
                const sliderMax = g.max ?? max;
                return { ...g, points: stored[g.key] ?? 0, sliderMax, markers: sliderMarkers(sliderMax) };
            });
            const hasCategories = checks.length > 0;
            if (isGM) this.#researchCategories.set(topic.pageId, checks.map(({ key, max }) => ({ key, max })));

            const total = hasCategories ? Math.min(checks.reduce((sum, g) => sum + g.points, 0), max) : state.points;

            return {
                ...topic,
                ...state,
                ...visibilityControl(state.discovered, prefix),
                points: total,
                max,
                pageLink: page.toAnchor({ name: topic.name }).outerHTML,
                toChatTooltip: _loc(`${prefix}.ToChat`),
                checksTooltip: _loc(`${prefix}.Checks`),
                checks,
                hasCategories,
                sliderEditable: isGM && state.discovered && !hasCategories,
                categoriesEditable: isGM && state.discovered,
                expanded: this.#expanded.has(topic.pageId),
                markers: sliderMarkers(max, topic.thresholds),
                hasResults: state.discovered && topic.thresholds.some((t) => t <= total),
                notes: details.notes
            };
        }));
    }

    async #prepareInfluenceContext(partContext) {
        const prefix = `${LANG}.Influence`;
        const isGM = game.user.isGM;
        const journal = this.journals.influence;
        partContext.instructions = await enrich(_loc(`${prefix}.Instructions`));

        partContext.topics = await Promise.all(this.#visibleTopics("influence").map(async (topic) => {
            const page = journal.pages.get(topic.pageId);
            const state = this.data.influence.topics[topic.pageId] ?? { discovered: false, points: 0, max: null, active: [] };
            const defaultMax = topic.thresholds.at(-1) ?? 0;
            const max = state.max ?? defaultMax;

            const parsed = await this.#pageDetails(page, { pattern: PATTERNS.influence });
            const active = new Set(state.active ?? []);
            const modifiers = parsed.modifiers.map((m) => {
                const signed = m.kind === "weakness" ? -m.amount : m.amount;
                return {
                    ...m,
                    text: m.html,
                    active: active.has(m.key),
                    value: signed,
                    signedLabel: signedLabel(signed),
                    skillsLabel: skillsLabel(m.skills),
                    kindLabel: _loc(`${prefix}.Modifier.${m.kind === "weakness" ? "Weakness" : "Resistance"}`)
                };
            });
            const checks = applyModifiersToGroups(parsed.groups, modifiers);

            return {
                ...topic,
                ...state,
                ...visibilityControl(state.discovered, `${prefix}.Topic`),
                max,
                storedMax: state.max,
                defaultMax,
                pageLink: page.toAnchor({ name: topic.name }).outerHTML,
                toChatTooltip: _loc(`${prefix}.Topic.ToChat`),
                checksTooltip: _loc(`${prefix}.Topic.Checks`),
                checks,
                modifiers,
                hasDetails: checks.length > 0 || modifiers.length > 0,
                expanded: this.#expanded.has(topic.pageId),
                markers: sliderMarkers(max, topic.thresholds),
                hasResults: state.discovered && topic.thresholds.some((t) => t <= state.points),
                notes: parsed.notes,
                hasDetails: checks.length > 0 || modifiers.length > 0 || !!parsed.notes
            };
        }));
    }

    async #prepareReputationContext(partContext) {
        const prefix = `${LANG}.Reputation`;
        const journal = this.journals.reputation;
        const span = REPUTATION.max - REPUTATION.min;
        partContext.instructions = await enrich(_loc(`${prefix}.Instructions`));

        partContext.topics = await Promise.all(this.#visibleTopics("reputation").map(async (topic) => {
            const page = journal.pages.get(topic.pageId);
            const state = this.data.reputation.topics[topic.pageId] ?? { discovered: false, points: 0, completed: [] };

            const completed = new Set(state.completed ?? []);
            const locations = (await parseReputationLocations(page)).map((l) => ({ ...l, completed: completed.has(l.key) }));
            const { notes } = await this.#pageDetails(page, {
                pattern: PATTERNS.reputation, toThreshold: tierThreshold, collectLocations: true
            });
            const bonus = locations.filter((l) => l.completed).length;
            const total = Math.clamp(state.points + bonus, REPUTATION.min, REPUTATION.max);
            const shown = game.user.isGM ? locations : locations.filter((l) => l.completed);
            this.#reputation.set(topic.pageId, { total, bonus });

            const tier = reputationTier(total);
            const markerValues = [...new Set([...REPUTATION.ticks, ...topic.thresholds])]
                .filter((n) => n >= REPUTATION.min && n <= REPUTATION.max)
                .sort((a, b) => a - b);

            return {
                ...topic,
                ...state,
                ...visibilityControl(state.discovered, `${prefix}.Topic`),
                total,
                bonus,
                min: REPUTATION.min,
                max: REPUTATION.max,
                tierKey: tier.toLowerCase(),
                tierLabel: _loc(`${prefix}.Tier.${tier}`),
                pageLink: page.toAnchor({ name: topic.name }).outerHTML,
                toChatTooltip: _loc(`${prefix}.Topic.ToChat`),
                locationsTooltip: _loc(`${prefix}.Topic.Locations`),
                locations: shown,
                hasDetails: shown.length > 0,
                expanded: this.#expanded.has(topic.pageId),
                markers: markerValues.map((n) => ({
                    threshold: topic.thresholds.includes(n),
                    pos: (n - REPUTATION.min) / span
                })),
                hasResults: state.discovered && topic.results.some((r) => tierReached(r.token, total)),
                notes,
                hasDetails: shown.length > 0 || !!notes
            };
        }));
    }

    async #prepareChaseContext(partContext) {
        const prefix = `${LANG}.Chases`;
        const isGM = game.user.isGM;
        const journal = this.journals.chases;
        partContext.instructions = isGM ? await enrich(_loc(`${prefix}.Instructions`)) : "";
        partContext.typeChoices = Object.fromEntries(CHASE_TYPES.map((t) => [t, _loc(`${prefix}.Type.${t}`)]));

        partContext.topics = await Promise.all(this.#visibleTopics("chases").map(async (chase) => {
            const page = journal.pages.get(chase.pageId);
            const view = parseChase(await enrich(page.text.content ?? "", { relativeTo: page, secrets: page.isOwner }), page.name);
            const state = { ...chaseDefaults(), ...(this.data.chases.topics[chase.pageId] ?? {}) };

            const count = view.obstacles.length;
            const party = Math.min(state.obstacle, count);
            const opponent = Math.min(state.opponent, count);
            const hasOpponent = state.type !== "beatTheClock";
            const obstacle = view.obstacles[party];
            const required = chaseRequired(obstacle, state);
            const status = chaseStatus(state, count);
            const limit = state.rounds ?? count;

            const track = view.obstacles.map((o, i) => ({
                index: i + 1,
                name: o.name,
                revealed: isGM || i <= state.revealedThrough,
                unrevealed: isGM && i > state.revealedThrough,
                cleared: i < party,
                current: i === party,
                party: i === party,
                opponent: hasOpponent && i === opponent
            }));
            track.push({
                finish: true,
                name: _loc(`${prefix}.Finish`),
                revealed: true,
                current: party >= count,
                party: party >= count,
                opponent: hasOpponent && opponent >= count
            });

            return {
                ...state,
                ...visibilityControl(state.discovered, prefix, "eye"),
                pageId: chase.pageId,
                pageLink: page.toAnchor({ name: view.name }).outerHTML,
                detectedPartySize: detectedPartySize(),
                statusLabel: game.i18n.format(`${prefix}.Status.${status.key}`, status.data ?? {}),
                statusTone: status.tone,
                roundLabel: state.type === "beatTheClock"
                    ? game.i18n.format(`${prefix}.RoundOf`, { round: state.round, limit })
                    : game.i18n.format(`${prefix}.Round`, { round: state.round }),
                track,
                hasOpponent,
                isBeatTheClock: state.type === "beatTheClock",
                storedRounds: state.rounds,
                obstacleCount: count,
                lengthHint: count < 6 ? game.i18n.format(`${prefix}.LengthHint`, { count }) : "",
                canReveal: state.revealedThrough < count - 1,
                current: obstacle && {
                    ...obstacle,
                    required,
                    points: Math.min(state.points, required),
                    levelLabel: obstacle.level ? game.i18n.format(`${prefix}.Level`, { level: obstacle.level }) : "",
                    markers: sliderMarkers(required).map(({ pos }) => ({ pos }))
                },
                expanded: this.#expanded.has(chase.pageId),
                notes: isGM ? view.intro : ""
            };
        }));
    }

    async #prepareInfiltrationContext(partContext) {
        const prefix = `${LANG}.Infiltration`;
        const isGM = game.user.isGM;
        const journal = this.journals.infiltration;
        const party = partyMembers();
        partContext.instructions = isGM ? await enrich(_loc(`${prefix}.Instructions`)) : "";

        partContext.topics = await Promise.all(this.#visibleTopics("infiltration").map(async (infil) => {
            const page = journal.pages.get(infil.pageId);
            const view = parseInfiltration(await enrich(page.text.content ?? "", { relativeTo: page, secrets: page.isOwner }), page.name);
            const state = { ...infiltrationDefaults(), ...(this.data.infiltration.topics[infil.pageId] ?? {}) };
            const selectedId = this.#infilSelected.get(infil.pageId) ?? (isGM ? null : game.user.character?.id);

            return {
                ...visibilityControl(state.discovered, prefix, "eye"),
                pageId: infil.pageId,
                pageLink: page.toAnchor({ name: view.name }).outerHTML,
                canUndo: (this.#infilHistory.get(infil.pageId)?.length ?? 0) > 0,
                expanded: this.#expanded.has(infil.pageId),
                ...buildInfiltrationView(view, state, { party, selectedId }),
                notes: isGM ? [view.intro, view.notes].filter(Boolean).join("\n") : ""
            };
        }));
    }

    async #prepareVictoryContext(partContext) {
        const prefix = `${LANG}.Victory`;
        const isGM = game.user.isGM;
        const journal = this.journals.victory;
        partContext.instructions = isGM ? await enrich(_loc(`${prefix}.Instructions`)) : "";

        partContext.topics = await Promise.all(this.#visibleTopics("victory").map(async (topic) => {
            const page = journal.pages.get(topic.pageId);
            const state = this.data.victory.topics[topic.pageId] ?? { discovered: false, points: 0 };
            const max = topic.thresholds.at(-1) ?? 0;
            const { groups: checks, notes } = await this.#pageDetails(page, { pattern: PATTERNS.victory });

            return {
                ...topic,
                ...state,
                ...visibilityControl(state.discovered, `${prefix}.Topic`, "eye"),
                points: Math.min(state.points, max),
                max,
                pageLink: page.toAnchor({ name: topic.name }).outerHTML,
                toChatTooltip: _loc(`${prefix}.Topic.ToChat`),
                checksTooltip: _loc(`${prefix}.Topic.Checks`),
                checks,
                expanded: this.#expanded.has(topic.pageId),
                markers: sliderMarkers(max, topic.thresholds),
                hasResults: topic.thresholds.some((t) => t <= state.points),
                notes
            };
        }));
    }

    async #prepareHackingContext(partContext) {
        const prefix = `${LANG}.Hacking`;
        const isGM = game.user.isGM;
        const journal = this.journals.hacking;
        partContext.instructions = isGM ? await enrich(_loc(`${prefix}.Instructions`)) : "";

        partContext.topics = await Promise.all(this.#visibleTopics("hacking").map(async (computer) => {
            const page = journal.pages.get(computer.pageId);
            const view = parseComputer(await enrich(page.text.content ?? "", { relativeTo: page, secrets: page.isOwner }), page.name);
            const state = { ...hackingDefaults(), ...(this.data.hacking.topics[computer.pageId] ?? {}) };

            return {
                ...visibilityControl(state.discovered, prefix, "eye"),
                pageId: computer.pageId,
                pageLink: page.toAnchor({ name: view.name }).outerHTML,
                expanded: this.#expanded.has(computer.pageId),
                ...buildHackingView(view, state)
            };
        }));
    }

    /* -------------------------------------------- */
    /*  State updates                               */
    /* -------------------------------------------- */

    /**
     * @param {string} subsystem
     * @param {string} topicId
     * @param {(entry: object) => void} fn
     * @param {object} [defaults]
     */
    async #updateTopic(subsystem, topicId, fn, defaults = {}) {
        const data = this.data.toObject();
        const entry = { ...defaults, ...(data[subsystem].topics[topicId] ?? {}) };
        fn(entry);
        data[subsystem].topics[topicId] = entry;
        await game.settings.set(MODULE_ID, "subsystems", data);
    }

    async #chaseUpdate(topicId, fn) {
        const chase = this.topics.chases.find((c) => c.pageId === topicId);
        if (!chase) return;
        await this.#updateTopic("chases", topicId, (entry) => fn(entry, chase.obstacles.length, chase), chaseDefaults());
    }

    async #infilUpdate(topicId, fn) {
        const infil = this.topics.infiltration.find((i) => i.pageId === topicId);
        if (!infil) return;
        const partyIds = partyMembers().map((a) => a.id);
        await this.#updateTopic("infiltration", topicId, (entry) => {
            this.#pushInfilHistory(topicId, foundry.utils.deepClone(entry));
            fn(entry, infil, partyIds);
        }, infiltrationDefaults());
    }

    async #hackUpdate(topicId, fn) {
        const computer = this.topics.hacking.find((c) => c.pageId === topicId);
        if (!computer) return;
        await this.#updateTopic("hacking", topicId, (entry) => fn(entry, computer), hackingDefaults());
    }

    #pushInfilHistory(topicId, snapshot) {
        const stack = this.#infilHistory.get(topicId) ?? [];
        stack.push(snapshot);
        if (stack.length > 20) stack.shift();
        this.#infilHistory.set(topicId, stack);
    }

    /* -------------------------------------------- */
    /*  Shared actions                              */
    /* -------------------------------------------- */

    /** @this {Subsystems} */
    static #onToggleChecks(event, target) {
        const li = target.closest("[data-topic]");
        const id = li.dataset.topic;
        if (this.#expanded.has(id)) this.#expanded.delete(id);
        else this.#expanded.add(id);
        li.classList.toggle("expanded", this.#expanded.has(id));
    }

    /** 
     * @this {Subsystems}
     */
    static async #onToggleTopicDiscovered(event, target) {
        if (!game.user.isGM) return;
        const { subsystem, topic } = target.closest("[data-topic]").dataset;
        await this.#updateTopic(subsystem, topic, (entry) => {
            entry.discovered = !entry.discovered;
        });
    }

    /** @this {Subsystems} */
    static async #onResultsToChat(event, target) {
        if (!game.user.isGM) return;
        const { subsystem, topic: topicId } = target.closest("[data-topic]").dataset;
        const topic = this.topics[subsystem].find((t) => t.pageId === topicId);
        const state = this.data[subsystem].topics[topicId];

        const reached = subsystem === "reputation"
            ? topic.results.filter((r) => tierReached(r.token, this.#reputation.get(topicId)?.total ?? state.points))
            : topic.results.filter((r) => isReached(r.threshold, state.points));

        const list = document.createElement("ol");
        for (const { label, element } of reached) {
            const li = document.createElement("li");
            const p = element.cloneNode(true);
            p.querySelector("strong, b")?.remove();
            const button = document.createElement("button");
            button.type = "button";
            button.append(foundry.applications.fields.createFontAwesomeIcon("caret-right"), label);
            li.append(button, p);
            list.append(li);
        }

        const content = `<h2>${topic.name}</h2>\n${list.outerHTML}`;
        const flags = { [MODULE_ID]: { results: subsystem } };
        await ChatMessage.implementation.create({ speaker: { user: game.user.id }, content, flags });
    }

    /** 
     * @this {Subsystems}
     */
    static #onNewPage(event, target) {
        if (!game.user.isGM) return;
        const subsystem = target.dataset.subsystem;
        const journal = this.journals[subsystem];
        if (!journal || !PageBuilder.supports(subsystem)) return;
        new PageBuilder({ subsystem, journal }).render({ force: true });
    }

    /** @this {Subsystems} */
    static #onEditPage(event, target) {
        if (!game.user.isGM) return;
        const { subsystem, topic } = target.closest("[data-topic]").dataset;
        const page = this.journals[subsystem]?.pages.get(topic);
        if (!page) return;

        if (game.settings.get(MODULE_ID, "editInJournal") || !PageBuilder.supports(subsystem)) {
            const mode = page.sheet.constructor.MODES?.EDIT ?? "edit";
            return page.sheet.render({ force: true, mode });
        }
        new PageBuilder({ subsystem, page }).render({ force: true });
    }

    static async #onToggleSecret(event, target) {
        if (!game.user.isGM) return;
        const { subsystem, topic } = target.closest("[data-topic]").dataset;
        const page = this.journals[subsystem]?.pages.get(topic);
        const id = target.dataset.secret;
        if (!page || !id) return;
        const template = document.createElement("template");
        template.innerHTML = page.text.content ?? "";
        const section = template.content.querySelector(`section.secret[id="${CSS.escape(id)}"]`);
        if (!section) return;
        section.classList.toggle("revealed");
        await page.update({ "text.content": template.innerHTML });
    }

    /* -------------------------------------------- */
    /*  Influence actions                           */
    /* -------------------------------------------- */

    /** @this {Subsystems} */
    static async #onToggleModifier(event, target) {
        if (!game.user.isGM) return;
        const key = target.dataset.key;
        await this.#updateTopic("influence", topicOf(target), (entry) => {
            const active = new Set(entry.active ?? []);
            if (active.has(key)) active.delete(key);
            else active.add(key);
            entry.active = [...active];
        });
    }

    /* -------------------------------------------- */
    /*  Reputation actions                          */
    /* -------------------------------------------- */

    /** @this {Subsystems} */
    static async #onToggleLocation(event, target) {
        if (!game.user.isGM) return;
        const key = target.dataset.key;
        await this.#updateTopic("reputation", topicOf(target), (entry) => {
            const completed = new Set(entry.completed ?? []);
            if (completed.has(key)) completed.delete(key);
            else completed.add(key);
            entry.completed = [...completed];
        });
    }

    /** 
     * @this {Subsystems}
     */
    static async #onAdjustReputation(event, target) {
        if (!game.user.isGM) return;
        const topicId = topicOf(target);
        const delta = Number(target.dataset.delta) || 0;
        const { total = 0, bonus = 0 } = this.#reputation.get(topicId) ?? {};
        const next = Math.clamp(total + delta, REPUTATION.min, REPUTATION.max);
        if (next === total) return;
        await this.#updateTopic("reputation", topicId, (entry) => {
            entry.points = next - bonus;
        });
    }

    /* -------------------------------------------- */
    /*  Chase actions                               */
    /* -------------------------------------------- */

    static #chaseAdvance(entry, count) {
        entry.obstacle = Math.min(entry.obstacle + 1, count);
        entry.points = 0;
        entry.revealedThrough = Math.max(entry.revealedThrough, Math.min(entry.obstacle, count - 1));
    }

    /** @this {Subsystems} */
    static async #onChaseAward(event, target) {
        if (!game.user.isGM) return;
        const amount = Number(target.dataset.amount);
        await this.#chaseUpdate(topicOf(target), (entry, count, chase) => {
            if (entry.obstacle >= count) return;
            const required = chaseRequired(chase.obstacles[entry.obstacle], entry);
            entry.points = Math.max(0, entry.points + amount);
            if (entry.points >= required) Subsystems.#chaseAdvance(entry, count);
        });
    }

    /** @this {Subsystems} */
    static async #onChaseMove(event, target) {
        if (!game.user.isGM) return;
        const { who, delta } = target.dataset;
        await this.#chaseUpdate(topicOf(target), (entry, count) => {
            if (who === "party") {
                entry.obstacle = Math.clamp(entry.obstacle + Number(delta), 0, count);
                entry.points = 0;
                entry.revealedThrough = Math.max(entry.revealedThrough, Math.min(entry.obstacle, count - 1));
            } else {
                entry.opponent = Math.clamp(entry.opponent + Number(delta), 0, count);
            }
        });
    }

    /** @this {Subsystems} */
    static async #onChaseNextRound(event, target) {
        if (!game.user.isGM) return;
        await this.#chaseUpdate(topicOf(target), (entry, count) => {
            entry.round += 1;
            if (entry.type !== "beatTheClock") entry.opponent = Math.min(entry.opponent + entry.pace, count);
        });
    }

    /** @this {Subsystems} */
    static async #onChaseReveal(event, target) {
        if (!game.user.isGM) return;
        await this.#chaseUpdate(topicOf(target), (entry, count) => {
            entry.revealedThrough = Math.min(entry.revealedThrough + 1, count - 1);
        });
    }

    /** @this {Subsystems} */
    static async #onChaseReset(event, target) {
        if (!game.user.isGM) return;
        const topicId = topicOf(target);
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: _loc(`${LANG}.Chases.Reset`) },
            content: `<p>${_loc(`${LANG}.Chases.ResetConfirm`)}</p>`
        });
        if (!confirmed) return;
        await this.#chaseUpdate(topicId, (entry) => {
            entry.obstacle = entry.type === "runAway" ? 1 : 0;
            entry.opponent = entry.type === "chaseDown" ? 1 : 0;
            entry.points = 0;
            entry.round = 1;
            entry.revealedThrough = entry.obstacle;
        });
    }

    /** @this {Subsystems} */
    static async #onChasePost(event, target) {
        if (!game.user.isGM) return;
        const topicId = topicOf(target);
        const chase = this.topics.chases.find((c) => c.pageId === topicId);
        const state = { ...chaseDefaults(), ...(this.data.chases.topics[topicId] ?? {}) };
        const obstacle = chase?.obstacles[state.obstacle];
        if (!obstacle) return;

        const content = [
            `<h2>${obstacle.name}</h2>`,
            obstacle.description,
            `<p><strong>${_loc(`${LANG}.Chases.ChasePoints`)}</strong> ${chaseRequired(obstacle, state)}</p>`,
            obstacle.checks.length ? `<ul>${obstacle.checks.map((c) => `<li>${c}</li>`).join("")}</ul>` : "",
            obstacle.options.length ? `<ul>${obstacle.options.map((o) => `<li>${o}</li>`).join("")}</ul>` : ""
        ].join("\n");
        const flags = { [MODULE_ID]: { results: "chase" } };
        await ChatMessage.implementation.create({ speaker: { user: game.user.id }, content, flags });
    }

    /* -------------------------------------------- */
    /*  Infiltration actions                        */
    /* -------------------------------------------- */

    /** @this {Subsystems} */
    static #onInfilSelect(event, target) {
        this.#infilSelected.set(topicOf(target), target.dataset.actor);
        this.render();
    }

    /** @this {Subsystems} */
    static async #onInfilAward(event, target) {
        if (!game.user.isGM) return;
        const { key, result } = target.dataset;
        const actorId = target.closest(".infil-panel")?.querySelector(".roster-pc.selected")?.dataset.actor ?? null;
        await this.#infilUpdate(topicOf(target), (entry, infil, partyIds) =>
            applyResult(infil, entry, key, result, actorId, partyIds));
    }

    /** @this {Subsystems} */
    static async #onInfilClearAll(event, target) {
        if (!game.user.isGM) return;
        const key = target.dataset.key;
        await this.#infilUpdate(topicOf(target), (entry, infil, partyIds) => clearForAll(infil, entry, key, partyIds));
    }

    /** @this {Subsystems} */
    static async #onInfilMovePC(event, target) {
        if (!game.user.isGM) return;
        const { actor, delta } = target.dataset;
        await this.#infilUpdate(topicOf(target), (entry, infil) => movePC(infil, entry, actor, Number(delta)));
    }

    /** @this {Subsystems} */
    static async #onInfilAP(event, target) {
        if (!game.user.isGM) return;
        const delta = Number(target.dataset.delta);
        await this.#infilUpdate(topicOf(target), (entry, infil) => applyAP(entry, delta, infil));
    }

    /** @this {Subsystems} */
    static async #onInfilEndRound(event, target) {
        if (!game.user.isGM) return;
        await this.#infilUpdate(topicOf(target), (entry, infil) => {
            entry.round += 1;
            applyAP(entry, 1, infil);
        });
    }

    /** @this {Subsystems} */
    static async #onInfilEdge(event, target) {
        if (!game.user.isGM) return;
        const delta = Number(target.dataset.delta);
        await this.#infilUpdate(topicOf(target), (entry) => {
            entry.edge = Math.max(0, entry.edge + delta);
        });
    }

    /** @this {Subsystems} */
    static async #onInfilComplication(event, target) {
        if (!game.user.isGM) return;
        const { key, op, ap } = target.dataset;
        await this.#infilUpdate(topicOf(target), (entry) => {
            const state = (entry.complications[key] ??= { active: false, resolved: false, points: 0 });
            if (op === "activate") Object.assign(state, { active: true, resolved: false });
            else if (op === "resolve") Object.assign(state, { active: false, resolved: true });
            else Object.assign(state, { active: false, resolved: false, points: 0 });
            if (ap) entry.alerts = entry.alerts.filter((a) => a !== Number(ap));
        });
    }

    /** @this {Subsystems} */
    static async #onInfilOpportunity(event, target) {
        if (!game.user.isGM) return;
        const key = target.dataset.key;
        await this.#infilUpdate(topicOf(target), (entry) => {
            entry.opportunities = entry.opportunities.includes(key)
                ? entry.opportunities.filter((k) => k !== key)
                : [...entry.opportunities, key];
        });
    }

    /** @this {Subsystems} */
    static async #onInfilDismiss(event, target) {
        if (!game.user.isGM) return;
        const ap = Number(target.dataset.ap);
        await this.#infilUpdate(topicOf(target), (entry) => {
            entry.alerts = entry.alerts.filter((a) => a !== ap);
        });
    }

    /** @this {Subsystems} */
    static async #onInfilPost(event, target) {
        if (!game.user.isGM) return;
        const infil = this.topics.infiltration.find((i) => i.pageId === topicOf(target));
        const content = infil && infiltrationChatContent(infil, target.dataset.key);
        if (!content) return;
        const flags = { [MODULE_ID]: { results: "infiltration" } };
        await ChatMessage.implementation.create({ speaker: { user: game.user.id }, content, flags });
    }

    /** @this {Subsystems} */
    static async #onInfilUndo(event, target) {
        if (!game.user.isGM) return;
        const topicId = topicOf(target);
        const previous = this.#infilHistory.get(topicId)?.pop();
        if (!previous) return;
        const data = this.data.toObject();
        data.infiltration.topics[topicId] = previous;
        await game.settings.set(MODULE_ID, "subsystems", data);
    }

    /** @this {Subsystems} */
    static async #onInfilReset(event, target) {
        if (!game.user.isGM) return;
        const topicId = topicOf(target);
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: _loc(`${LANG}.Infiltration.Reset`) },
            content: `<p>${_loc(`${LANG}.Infiltration.ResetConfirm`)}</p>`
        });
        if (!confirmed) return;
        await this.#infilUpdate(topicId, (entry) => {
            const { discovered, edge } = entry;
            Object.assign(entry, infiltrationDefaults(), { discovered, edge });
        });
    }

    /* -------------------------------------------- */
    /*  Hacking actions                             */
    /* -------------------------------------------- */

    /** @this {Subsystems} */
    static async #onHackResult(event, target) {
        if (!game.user.isGM) return;
        const apKey = target.closest("[data-ap]").dataset.ap;
        const result = target.dataset.result;
        await this.#hackUpdate(topicOf(target), (entry, computer) => applyHackResult(computer, entry, apKey, result));
    }

    /** @this {Subsystems} */
    static async #onHackAdjust(event, target) {
        if (!game.user.isGM) return;
        const apKey = target.closest("[data-ap]").dataset.ap;
        const { field, delta } = target.dataset;
        await this.#hackUpdate(topicOf(target), (entry, computer) =>
            adjustAccessPoint(computer, entry, apKey, field, Number(delta)));
    }

    /** @this {Subsystems} */
    static async #onHackVulnerability(event, target) {
        if (!game.user.isGM) return;
        const key = target.dataset.key;
        await this.#hackUpdate(topicOf(target), (entry) => toggleVulnerability(entry, key));
    }

    /** @this {Subsystems} */
    static async #onHackCountermeasure(event, target) {
        if (!game.user.isGM) return;
        const { key, op } = target.dataset;
        await this.#hackUpdate(topicOf(target), (entry, computer) => applyCountermeasure(computer, entry, key, op));
    }

    /** @this {Subsystems} */
    static async #onHackEndRound(event, target) {
        if (!game.user.isGM) return;
        await this.#hackUpdate(topicOf(target), (entry, computer) => endHackingRound(computer, entry));
    }

    /** @this {Subsystems} */
    static async #onHackDismiss(event, target) {
        if (!game.user.isGM) return;
        const key = target.dataset.key;
        await this.#hackUpdate(topicOf(target), (entry) => {
            entry.alerts = entry.alerts.filter((k) => k !== key);
        });
    }

    /** @this {Subsystems} */
    static async #onHackPost(event, target) {
        if (!game.user.isGM) return;
        const computer = this.topics.hacking.find((c) => c.pageId === topicOf(target));
        const content = computer && hackingChatContent(computer, target.dataset.key);
        if (!content) return;
        const flags = { [MODULE_ID]: { results: "hacking" } };
        await ChatMessage.implementation.create({ speaker: { user: game.user.id }, content, flags });
    }

    /** @this {Subsystems} */
    static async #onHackReset(event, target) {
        if (!game.user.isGM) return;
        const topicId = topicOf(target);
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: _loc(`${LANG}.Hacking.Reset`) },
            content: `<p>${_loc(`${LANG}.Hacking.ResetConfirm`)}</p>`
        });
        if (!confirmed) return;
        await this.#hackUpdate(topicId, (entry) => {
            Object.assign(entry, hackingDefaults(), { discovered: entry.discovered });
        });
    }

    /* -------------------------------------------- */
    /*  Form submission                             */
    /* -------------------------------------------- */

    /** @this {Subsystems} */
    static async #onSubmitForm(_event, _form, formData) {
        if (!game.user.isGM) return;
        const previousJournals = Object.fromEntries(SUBSYSTEMS.map((id) => [id, this.data[id].journal]));
        const submitData = foundry.utils.mergeObject(this.data.toObject(), foundry.utils.expandObject(formData.object));

        this.#normalizeResearch(submitData);
        this.#normalizeInfluence(submitData);
        this.#normalizeReputation(submitData, formData.object);
        this.#normalizeChases(submitData);
        this.#normalizeInfiltration(submitData, formData.object);
        this.#normalizeVictory(submitData);

        await game.settings.set(MODULE_ID, "subsystems", submitData);

        for (const [key, sheetClass] of Object.entries(SHEET_CLASSES)) {
            if (!availableSubsystems().includes(key)) continue;
            const uuid = submitData[key].journal;
            if (uuid && uuid !== previousJournals[key]) await Subsystems.#assignSheet(uuid, sheetClass);
        }
    }

    #normalizeResearch(submitData) {
        for (const topic of this.topics?.research ?? []) {
            const entry = submitData.research.topics[topic.pageId];
            if (!entry) continue;
            const max = topic.thresholds.at(-1) ?? 0;
            const categories = this.#researchCategories.get(topic.pageId) ?? [];
            if (!categories.length) {
                entry.points = Math.clamp(entry.points, 0, max);
                continue;
            }
            entry.categories ??= {};
            let sum = 0;
            for (const { key, max: cap } of categories) {
                const value = Math.clamp(Number(entry.categories[key] ?? 0), 0, cap ?? Infinity);
                entry.categories[key] = value;
                sum += value;
            }
            entry.points = Math.min(sum, max);
        }
    }

    #normalizeInfluence(submitData) {
        for (const topic of this.topics?.influence ?? []) {
            const entry = submitData.influence.topics[topic.pageId];
            if (!entry) continue;
            const max = entry.max ?? topic.thresholds.at(-1) ?? 0;
            entry.points = Math.clamp(entry.points ?? 0, 0, max);
        }
    }

    #normalizeReputation(submitData, flat) {
        for (const topic of this.topics?.reputation ?? []) {
            const entry = submitData.reputation.topics[topic.pageId];
            const submitted = flat[`reputation.topics.${topic.pageId}.points`];
            if (!entry || submitted === undefined || submitted === null) continue;
            const bonus = this.#reputation.get(topic.pageId)?.bonus ?? 0;
            entry.points = Math.clamp(submitted - bonus, REPUTATION.min, REPUTATION.max);
        }
    }

    #normalizeChases(submitData) {
        for (const chase of this.topics?.chases ?? []) {
            const entry = submitData.chases.topics[chase.pageId];
            if (!entry) continue;
            const count = chase.obstacles.length;
            entry.obstacle = Math.clamp(entry.obstacle ?? 0, 0, count);
            entry.points = Math.max(0, entry.points ?? 0);
            if (entry.obstacle < count) {
                const required = chaseRequired(chase.obstacles[entry.obstacle], entry);
                if (entry.points >= required) Subsystems.#chaseAdvance(entry, count);
            } else {
                entry.points = 0;
            }
        }
    }

    #normalizeInfiltration(submitData, flat) {
        for (const infil of this.topics?.infiltration ?? []) {
            const submitted = flat[`infiltration.topics.${infil.pageId}.ap`];
            if (submitted === undefined || submitted === null) continue;
            const stored = this.data.infiltration.topics[infil.pageId];
            const entry = { ...infiltrationDefaults(), ...(stored ? foundry.utils.deepClone(stored) : {}) };
            if (submitted === entry.ap) continue;
            this.#pushInfilHistory(infil.pageId, foundry.utils.deepClone(entry));
            applyAP(entry, submitted - entry.ap, infil);
            submitData.infiltration.topics[infil.pageId] = entry;
        }
    }

    #normalizeVictory(submitData) {
        for (const topic of this.topics?.victory ?? []) {
            const entry = submitData.victory.topics[topic.pageId];
            if (!entry) continue;
            entry.points = Math.clamp(entry.points ?? 0, 0, topic.thresholds.at(-1) ?? 0);
        }
    }

    /* -------------------------------------------- */
    /*  Helpers                                     */
    /* -------------------------------------------- */

    static async #assignSheet(uuid, sheetClass) {
        const journal = fromUuidSync(uuid);
        if (!journal) return;
        const updates = journal.pages
            .filter((p) => p.type === "text" && p.getFlag("core", "sheetClass") !== sheetClass)
            .map((p) => ({ _id: p.id, "flags.core.sheetClass": sheetClass }));
        if (updates.length) await journal.updateEmbeddedDocuments("JournalEntryPage", updates);
    }
}
