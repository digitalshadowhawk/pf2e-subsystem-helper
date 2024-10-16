
//import BasicApplication from './lib/BasicApplication.js';
//import SubsystemTab from './lib/SubsystemTab.js';
import SubsystemTab from './lib/SubsystemTab.svelte';
import { constants } from './constants.js';
import { Helper } from './pf2e-subsystem-helper.js';

let subsystemTabActive = false;

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
    if (!game.user.isGM || !(game.settings.get(constants.ID, "Reputation")||game.settings.get(constants.ID, "Influence")||game.settings.get(constants.ID, "VictoryPoints")||game.settings.get(constants.ID, "Chases")||game.settings.get(constants.ID, "Infiltration")||game.settings.get(constants.ID, "Research"))) {return;}
    html.find('.sub-nav:not(.sub-sub-nav)').append('<a data-tab="subsystems" class="subsystemTab">Subsystems</a>')
    
    const targetEl = html[0].querySelector('.container');
    if(targetEl) {
        partySheet.__subsystem_tab = new SubsystemTab({
            target: targetEl,
            props: {}
        })
    }

	if(subsystemTabActive) {
		const subsystemButton = html[0].querySelector('.subsystemTab')
		subsystemButton.click();
		subsystemTabActive = false;
	}
});

Hooks.on('updateActor', function(arg1, arg2, arg3, arg4) {
	if(arg2._id==="xxxPF2ExPARTYxxx") {
		if(arg1._sheet._tabs[0].active==="subsystems") {
			subsystemTabActive = true;
		} else {
			subsystemTabActive = false;
		}
	}
});

function check(target) {
	if(target.classList.contains("active")) {
		Helper.log(true, true)
		subsystemTabActive = true;
		return true;
	} else {
		Helper.log(true, false)
		subsystemTabActive = false;
		return false;
	}
}

Hooks.on('closePartySheetPF2e', function(partySheet, html, data) {
	partySheet?.__subsystem_tab?.$destroy();

	const targetEl = html[0].querySelector('.subsystemTab')
	Helper.log(true, targetEl)
	check(targetEl)
});