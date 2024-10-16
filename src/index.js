import SubsystemTab from './lib/SubsystemTab.svelte';
import { constants } from './constants.js';
import { Helper, PF2eSubsystemHelper } from './pf2e-subsystem-helper.js';

let subsystemTabActive = false;
let appID

Hooks.on('init', function() {
	game.settings.register(constants.ID, "Reputation", {
		name: "Use the Reputation Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(constants.ID, "Influence", {
		name: "Use the Influence Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(constants.ID, "Infiltration", {
		name: "Use the Infiltration Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(constants.ID, "Research", {
		name: "Use the Research Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(constants.ID, "Chases", {
		name: "Use the Chases Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(constants.ID, "VictoryPoints", {
		name: "Use the Victory Points Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
});

Hooks.once('init', PF2eSubsystemHelper.init);

Hooks.on('renderPartySheetPF2e', function(partySheet, html, data) {
    if (!game.user.isGM || !(game.settings.get(constants.ID, "Reputation")||game.settings.get(constants.ID, "Influence")||game.settings.get(constants.ID, "VictoryPoints")||game.settings.get(constants.ID, "Chases")||game.settings.get(constants.ID, "Infiltration")||game.settings.get(constants.ID, "Research"))) {return;}
    appID = partySheet.appID
    const targetEl = html[0].querySelector('.subsystemTab');
    if(targetEl) {
        partySheet.__subsystem_tab = new SubsystemTab({
            target: targetEl,
            props: {}
        })
    }
    
});

Hooks.on('closePartySheetPF2e', function(partySheet, html, data) {
	partySheet?.__subsystem_tab?.$destroy();
});