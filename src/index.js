
//import BasicApplication from './lib/BasicApplication.js';
//import SubsystemTab from './lib/SubsystemTab.js';
import SubsystemTab from './lib/SubsystemTab.svelte';
import { Helper } from './pf2e-subsystem-helper.js';
import { constants } from './constants.js';


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

Hooks.on('renderPartySheetPF2e', function(partySheet, html, data) {
    if (!game.user.isGM || !(game.settings.get(Helper.ID, "Reputation")||game.settings.get(Helper.ID, "Influence")||game.settings.get(Helper.ID, "VictoryPoints")||game.settings.get(Helper.ID, "Chases")||game.settings.get(Helper.ID, "Infiltration")||game.settings.get(Helper.ID, "Research"))) {return;}
    html.find('.sub-nav:not(.sub-sub-nav)').append('<a data-tab="subsystems" class="">Subsystems</a>')
    
    partySheet?.__subsystem_tab?.$destroy();
    const targetEl = html[0].querySelector('.container');
    if(targetEl) {
        partySheet.__subsystem_tab = new SubsystemTab({
            target: targetEl,
            props: {}
        })
    }

    //html.find('.container').append(new SubsystemTab(partySheet, html, data))
});