class PF2eSubsystemHelper {
	static ID = "pf2e-subsystem-helper";
	
	static FLAGS = {
		SUBSYSTEMS: 'subsystems'
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
}

/**
 * Register our module's debug flag with developer mode's custom hook
 */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(PF2eSubsystemHelper.ID);
});

class SubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false})
		}
	}	
}

class ResearchSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			library: new fields.SchemaField({
				libraryName: new fields.StringField({required: true, blank: false}),
				level: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
				points: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
				thresholds: new fields.ArrayField(new fields.ObjectField({required: false})),
				sources: new fields.ArrayField(new fields.ObjectField({required: false}))
			})
		}
	}
}

class LibraryThreshold extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			thresholdValue: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			description: new fields.StringField({required: true, blank: false})
		}
	}
}

class LibrarySource extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			description: new fields.StringField({required: true, blank: false}),
			maxRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			earnedRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			checks: new fields.ArrayField(new fields.ObjectField({required: false}))
		}
	}
}

class InfluenceSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			npcs: new fields.ArrayField(new fields.ObjectField({required: false}))
		}
	}
}

class InfluenceNPC extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false}),
			perception: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			will: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			thresholds: new fields.ArrayField(new fields.ObjectField({required: false})),
			checks: new fields.ArrayField(new fields.ObjectField({required: false})),
			resistances: new fields.StringField({required: false, blank: false}),
			weaknesses: new fields.StringField({required: false, blank: false})
		}
	}
}

class InfluenceThreshold extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			thresholdValue: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			description: new fields.StringField({required: true, blank: false})
		}
	}
}

class Check extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			type: new fields.StringField({required: true, blank: false}),
			dc: new fields.NumberField({required: true, nullable: false, integer: true, positive: true})
		}
	}
}

class SubsystemData {
	static get allSubsystems() {
		return game.actors?.party?.getFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS);
	}

	static saveDataModel(dataModel) {
		return game.actors?.party?.setFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS, {[dataModel.id]: dataModel});
	}

	static loadDataModel(id) {
		return game.actors?.party?.getFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS)?.[id];
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
			<button type='button' class="create-subsystem-button create-${obj}-subsystem-button flex0" data-tooltip="Create New ${obj} Subsystem">
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