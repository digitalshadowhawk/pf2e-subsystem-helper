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

class SubsystemData {	
	// all subsystems
	static get allSubsystems() {
		//const allSubsystems = game.actors?.party
		
		return game.actors?.party?.getFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS);
	}
	
	// get specified subsystem
	static getSubsystem(subsystemID) {
		return game.actors?.party?.getFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS)?.[subsystemID];
	}
	
	// create subsystem
	static createSubsystem(subsystemName, subsystemType, subsystemData) {
		
		const newSubsystem = {
			name: subsystemName,
			type: subsystemType,
			...subsystemData,
			id: foundry.utils.randomID(16)
		}
		
		const newSubsystems = {
			[newSubsystem.id]: newSubsystem
		}
		
		return game.actors?.party?.setFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS, newSubsystems);
	}
	
	// update subsystem
	static updateSubsystem(subsystemID, updateData) {
		const update = {
			[subsystemID]: updateData
		}
		
		return game.actors?.party?.setFlag(PF2eSubsystemHelper.ID, PF2eSubsystemHelper.FLAGS.SUBSYSTEMS, update);
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

class SubsystemForm extends FormApplication {
	
}

/**
 * A single Subsystem entry
 * @typedef {Object} VictoryPointBase
 * @property {string} id - a Unique ID to identify this Victory Point entry
 * @property {string} label - The name of this Victory Point entry
 * @property {number} points - the numerical value of Victory Points that have been accrued
 */
class Subsystem{
	constructor(id) {
		const data = SubsystemData.getSubsystem(id)
		this.name = data.name
		this.type = data.type
		if(this.type === "Research") {
			PF2eSubsystemHelper.log(true, 'Research Subsystem Detected!')
			this.library = new Library();
		}
		if(this.type === "Victory Points") {
			PF2eSubsystemHelper.log(true, 'Victory Points Subsystem Detected!')
			this.library = new Library();
		}
	}
}

class PointCounter {
	constructor(name, points) {
		if(points===undefined) {
			this.points = 0
		} else {
			this.points = points
		}
		if(name===undefined) {
			this.name = "Basic Counter"
		} else {
			this.name = name
		}
	}
	
}

class Library extends PointCounter {
	constructor(name, level, points) {
		super(name,points)
		if(level===undefined) {
			this.level = 1
		} else {
			this.level = level
		}
		this.sources = []
		this.thresholds = []
	}
	
	getName() {
		return this.name;
	}
	
	addThreshold(value, description) {
		this.thresholds.push(new Threshold(value,description));
	}
	
	checkThresholds() {
		this.thresholds.forEach((threshold) => {if(this.points >= threshold.value){threshold.thresholdMet = true} else { threshold.thresholdMet = false}})
	}
	
	addSource(description,maxRP) {
		this.sources.push(new Source(description,maxRP));
	}
	
	addSource(description,maxRP,check) {
		this.sources.push(new Source(description,maxRP).addCheck(check));
	}
	
	addSource(description,maxRP,checkType,dc) {
		this.sources.push(new Source(description,maxRP).addCheck(checkType,dc));
	}
	
	removeSource(id){
		if(this.sources.length < (id + 1)){
			return;
		}
		this.sources.splice(id,1)
	}
	
	earnRP(id,amount) {
		const changedBy = this.sources[id].addEarnedRP(amount)
		this.points += changedBy
		return changedBy;
	}
}

class Threshold {
	constructor(value, description){
		this.value = value
		this.description = description
		this.thresholdMet = false
	}
}

class Source {
	constructor(description, maxRP)
	{
		this.description = description
		this.maxRP = maxRP
		this.earnedRP = 0
		this.checks = []
	}
	
	setMaxRP(newMax) {
		this.maxRP = newMax;
	}
	
	setEarnedRP(earned) {
		const increasedBy = earned - this.earned
		this.earnedRP = earned
		
		return increasedBy;
	}
	
	addEarnedRP(earned) {
		let increasedBy = 0
		
		if (earned >= 0) {
			increasedBy = Math.min(this.maxRP - this.earnedRP, this.earnedRP + earned)
		} else {
			increasedBy = Math.max(this.earnedRP * -1, earned)
		}
		this.earnedRP += increasedBy
		return increasedBy;
	}
	
	addCheck(check) {
		this.checks = check
		return this;
	}
	
	addCheck(type, dc) {
		this.checks.push("@Check[type:" + type + "|dc:" + dc + "]")
		return this;
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