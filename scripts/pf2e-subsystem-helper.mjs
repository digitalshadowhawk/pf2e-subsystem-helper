import * as subsystem from './subsystem-data-models.mjs';
import * as subtype from './subsystem-data-model-subtypes.mjs';


export class PF2eSubsystemHelper {
	static ID = "pf2e-subsystem-helper";
	
	static FLAGS = {
		SUBSYSTEMS: 'subsystems',
		LIBRARIES: 'libraries',
		SOURCES: 'sources',
		THRESHOLDS: 'thresholds',
		CHECKS: 'checks',
		OBSTACLES: 'obstacles'
	}
	
	static TEMPLATES = {
		PF2ESUBSYSYSTEMHELPER: `modules/${this.ID}/templates/pf2e-subsystem-helper.hbs`
	}
	
  /**
   * A small helper function which leverages developer mode flags to gate debug logs.
   * 
   * @param {boolean} force - forces the log even if the debug flag is not on
   * @param  {...any} args - what to log
   */
	static log(force, ...args) {
		const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);
		
		if (shouldLog) {
			console.log(this.ID, '|', ...args);
		}
	}

	
	static generateID(){
		return foundry.utils.randomID(16);
	}
}

/**
 * Register our module's debug flag with developer mode's custom hook
 */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(PF2eSubsystemHelper.ID);
});

export class SubsystemData {
	
	static get allSubsystems() {
		return game.actors?.party?.getFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS);
	}

	static saveDataModel(dataModel, flag = PF2eSubsystemHelper.FLAGS.SUBSYSTEMS) {
		game.actors?.party?.setFlag(PF2eSubsystemHelper.ID, flag, {[dataModel.id]: dataModel});
		return dataModel.id;
	}

	static loadDataModel(id, flag = PF2eSubsystemHelper.FLAGS.SUBSYSTEMS) {
		const model = game.actors?.party?.getFlag(PF2eSubsystemHelper.ID, flag)?.[id]
		/*let instantiatedModel = {}
		if(model.subsystemType==="research"){
			instantiatedModel = new subsystem.ResearchSubsystemDataModel(model.subsystemName,  model.id, model.libraries).reinstantiate()
		} else if (model.subsystemType==="influence"){
			instantiatedModel = new subsystem.InfluenceSubsystemDataModel(model.subsystemName, model.id, model.npcs).reinstantiate()
		} else if (model.subsystemType==="chases"){
			instantiatedModel = new subsystem.ChasesSubsystemDataModel(model.subsystemName, model.id, model.chases).reinstantiate()
		} else if (model.subsystemType==="victorypoints"){
			instantiatedModel = new subsystem.VictoryPointsDataModel(model.subsystemName, model.id, model.counters).reinstantiate()
		}*/
		
		return model;
	}
	
	// delete a specific subsystem by ID
	static deleteSubsystem(subsystemID) {
		const keyDeletion = {
			[`-=${subsystemID}`]: null
		}
		
		return game.actors?.party?.setFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS, keyDeletion);
	}
	
	static deleteAllSubsystems() {
		return game.actors?.party?.unsetFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS);
	}

	static populateDummies() {
		const researchDummy = new subsystem.ResearchSubsystemDataModel("Dummy Research System", PF2eSubsystemHelper.generateID())
		const libraryDummy = new subtype.Library("The Hags' Secret", 7, 0)
		const librarySource1 = new subtype.LibrarySource("Sprite Swarm", 5, 0)
		const librarySource1check1 = new subtype.Check("Diplomacy",23)
		const librarySource1check2 = new subtype.Check("Society",23)
		const librarySource1check3 = new subtype.Check("Athletics",28)
		const librarySource2 = new subtype.LibrarySource("Field of Tomeflowers", 10, 0)
		const librarySource2check1 = new subtype.Check("Academia Lore",18)
		const librarySource2check2 = new subtype.Check("Library Lore",18)
		const librarySource2check3 = new subtype.Check("Occultism",23)
		const librarySource3 = new subtype.LibrarySource("Loremother Tree", 15, 0)
		const librarySource3check1 = new subtype.Check("Performance",21)
		const librarySource3check2 = new subtype.Check("Nature",23)
		const libraryThreshold1 = new subtype.Threshold(5,"The PCs learn of apocryphal fey legends that say the coven members were once cruel fey queens now twisted by inner corruption. They learn basic details about hags and the hag mother's Call.")
		const libraryThreshold2 = new subtype.Threshold(10,"The PCs learn that the coven gathers on a nearby mountaintop every full moon. Attaining this knowledge comes at a cost: hag malice solidifies into two will-o'-wisps, which attack the PCs.")
		const libraryThreshold3 = new subtype.Threshold(15,"The PCs learn that a specific magical incantation is needed to reach the hag's mountaintop. Though they don't quite discover the incantation, they discover among magical writings a page containing the uncommon spell read omens.")
		const libraryThreshold4 = new subtype.Threshold(20,"The Loremother Tree awakens long enough to tell the PCs the incantation, but warns them that the hags possess powerful magic that has struck down many heroes. The tree then returns to slumber. Replace the Loremother Tree's Performance Research check with a DC 28 Diplomacy check to convince the tree to share further knowledge.")
		const libraryThreshold5 = new subtype.Threshold(30," A dryad emerges from the trunk of the Loremother Tree and tells the PCs about the hags' spell—a unique polymorph ability that turns people into toads. She also gives each PC a small flower charm for protection that grants each PC a +3 status bonus to their saving throws against the hags' Toad Form ability. Unfortunately, this draws the hags' attention, who send two living wildfires to burn the glade down. If the PCs don't defeat the fire elementals, the creatures destroy any remaining information in the glade.")
		librarySource1.addCheck(librarySource1check1)
		librarySource1.addCheck(librarySource1check2)
		librarySource1.addCheck(librarySource1check3)
		librarySource2.addCheck(librarySource2check1)
		librarySource2.addCheck(librarySource2check2)
		librarySource2.addCheck(librarySource2check3)
		librarySource3.addCheck(librarySource3check1)
		librarySource3.addCheck(librarySource3check2)
		libraryDummy.addSource(librarySource1)
		libraryDummy.addSource(librarySource2)
		libraryDummy.addSource(librarySource3)
		libraryDummy.addThreshold(libraryThreshold1)
		libraryDummy.addThreshold(libraryThreshold2)
		libraryDummy.addThreshold(libraryThreshold3)
		libraryDummy.addThreshold(libraryThreshold4)
		libraryDummy.addThreshold(libraryThreshold5)
		researchDummy.addLibrary(libraryDummy)

		PF2eSubsystemHelper.log(true, "This is the dummy before saving:")
		PF2eSubsystemHelper.log(true, researchDummy)
		
		return this.saveDataModel(researchDummy);
	}
}

Hooks.on('init', function() {
	game.settings.register(PF2eSubsystemHelper.ID, "Reputation", {
		name: "Use the Reputation Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(PF2eSubsystemHelper.ID, "Influence", {
		name: "Use the Influence Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(PF2eSubsystemHelper.ID, "Infiltration", {
		name: "Use the Infiltration Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(PF2eSubsystemHelper.ID, "Research", {
		name: "Use the Research Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(PF2eSubsystemHelper.ID, "Chases", {
		name: "Use the Chases Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(PF2eSubsystemHelper.ID, "Victory Points", {
		name: "Use the Victory Points Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
});

Hooks.on('getPartySheetPF2eHeaderButtons', function(app, buttons) {
	if (!game.user.isGM) {return;}
	
	buttons.unshift({
		label: "Subsystems",
		icon: "fa fa-gears",
		class: `${PF2eSubsystemHelper.ID}-tab`,
		onclick: () => {
			(new SubsystemForm({actor:app.actor}, async () => {
			setTimeout(() => { app.render(true, { tab: "sub-system"}) }, 0);
			})).render(true);
		}
	});
});

Hooks.on('renderPartySheetPF2e', function(partySheet, html, data) {
    if (!game.user.isGM && !game.settings.get(PF2eSubsystemHelper.ID, "Reputation")) {return;}
	
	const content = `
	<section class="tab sidebar-tab directory flexcol subsystem-section">
		<ol class="directory-list subsystem-list">
			${getFolders(partySheet)}
		</ol>
	</section>
	
	`

	html.find('.sub-nav:not(.sub-sub-nav)').append('<a data-tab="subsystems" class="">Subsystems</a>')
    html.find('.container').append(`<div class="tab" data-tab="subsystems" data-region="subsystems"><div class="content">${content}</div></div>`)
	
	html.find('.container').find('.subsystem-list').find('.directory-item').on("click", async function(event) {
        event.preventDefault();
        let target = $(event.currentTarget);
        if (target.hasClass('collapsed')) {
              target.removeClass('collapsed')
        } else {
              target.addClass('collapsed')
        }
    })
	
	html.on('click', '.create-Reputation-subsystem-button', (event) => {
		PF2eSubsystemHelper.log(true, 'Reputation Button Clicked!');
	});
	html.on('click', '.create-Influence-subsystem-button', (event) => {
		PF2eSubsystemHelper.log(true, 'Influence Button Clicked!');
	});
	html.on('click', '.create-Infiltration-subsystem-button', (event) => {
		PF2eSubsystemHelper.log(true, 'Infiltration Button Clicked!');
	});
	html.on('click', '.create-Research-subsystem-button', (event) => {
		PF2eSubsystemHelper.log(true, 'Research Button Clicked!');
	});
	html.on('click', '.create-Chases-subsystem-button', (event) => {
		PF2eSubsystemHelper.log(true, 'Chases Button Clicked!');
	});
	html.on('click', '.create-Victory Points-subsystem-button', (event) => {
		PF2eSubsystemHelper.log(true, 'Victory Points Button Clicked!');
	});
});

function getFolders(partySheet) {
	
	const enabledFolders = []
	
	if (game.settings.get(PF2eSubsystemHelper.ID, "Reputation")) {
		enabledFolders.push('Reputation');
	}
	if (game.settings.get(PF2eSubsystemHelper.ID, "Influence")) {
		enabledFolders.push('Influence');
	}
	if (game.settings.get(PF2eSubsystemHelper.ID, "Infiltration")) {
		enabledFolders.push('Infiltration');
	}
	if (game.settings.get(PF2eSubsystemHelper.ID, "Research")) {
		enabledFolders.push('Research');
	}
	if (game.settings.get(PF2eSubsystemHelper.ID, "Chases")) {
		enabledFolders.push('Chases');
	}
	if (game.settings.get(PF2eSubsystemHelper.ID, "Victory Points")) {
		enabledFolders.push('Victory Points');
	}
	
	return enabledFolders.map(obj=>{
        let folder = `<li class="directory-item folder flexcol collapsed">
          <header class="folder-header flexrow">
            <h3 class="noborder"><i class="fas fa-folder-open fa-fw"></i>${obj}</h3>
			<button type='button' class="create-button create-subsystem-button create-${obj}-subsystem-button flex0" data-tooltip="Create New ${obj} Subsystem">
				<i class="fa-solid subsystem-add fa-gears"></i>
				<i class="fa-solid subsystem-add fa-plus"></i>
			</button>
          </header>
          <ol class="subdirectory">
                
          </ol>
        </li>`
        return folder;
    }).join("")

}


globalThis.pf2esubsystemhelper = {
	SubsystemData,
	subsystem,
	subtype
}