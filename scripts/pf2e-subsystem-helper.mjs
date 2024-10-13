import * as subsystem from './subsystem-data-models.mjs';
import * as subtype from './subsystem-data-model-subtypes.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api


export class Helper {
	static ID = "pf2e-subsystem-helper";
	
	static FLAGS = {
		SUBSYSTEMS: 'subsystems',
		LIBRARIES: 'libraries',
		REPUTATIONS: 'reputations',
		SOURCES: 'sources',
		THRESHOLDS: 'thresholds',
		CHECKS: 'checks',
		CHASES: 'chases',
		CHASEOBSTACLES: 'chaseobstacles',
		NPCS: 'npcs',
		INFILTRATIONS: 'infiltrations',
		INFILTRATIONOBSTACLES: 'infiltrationobstacles',
		INFILTRATIONPOINTS: 'infiltrationpoints',
		COMPLICATIONS: 'complications',
		COUNTERS: 'counters'
	}
	
	static TEMPLATES = {
		PF2ESUBSYSYSTEMHELPER: `modules/${this.ID}/templates/pf2e-subsystem-helper.hbs`
	}

	static DCS = {
		0:14,1:15,2:16,3:18,4:19,5:20,6:22,7:23,8:24,9:26,10:27,11:28,12:30,13:31,14:32,15:34,16:35,17:36,18:38,19:39,20:40,21:42,22:44,23:46,24:48,25:50
	}

	static ADJUSTMENTS = {
		INCREDIBLYEASY: -10,
		VERYEASY: -5,
		EASY: -2,
		STANDARD: 0,
		HARD: 2,
		VERYHARD: 5,
		INCREDIBLYHARD: 10
	}

	static REPUTATIONS = {
		LEVELS: {
			REVERED: {
				LABEL: "Revered",
				LOWER: 30,
				UPPER: 50,
				RAISED: "Major favor",
				LOWERED: "Moderate or major disservice",
				EFFECT: "The group reveres the PCs as heroes and celebrities. Every member has heard of the PCs, is helpful toward them, and would take major risks to assist them. Only major favors accrue Reputation Points, and only moderate or major disservices can reduce them."
			},
			ADMIRED: {
				LABEL: "Admired",
				LOWER: 15,
				UPPER: 29,
				RAISED: "Major favor",
				LOWERED: "Any disservice",
				EFFECT: "The PCs have earned this group's admiration. The majority of the group knows about the PCs and have an extremely favorable opinion toward them. Many members of the group are helpful toward the PCs, and those who aren't are friendly. Only major favors accrue Reputation Points."
			},
			LIKED: {
				LABEL: "Liked",
				LOWER: 5,
				UPPER: 14,
				RAISED: "Moderate or major favor",
				LOWERED: "Any disservice",
				EFFECT: "The PCs have gained this group's favor. Many members of the group know about the PCs, and those who do are usually friendly to them. At this reputation, only moderate and major favors accrue Reputation Points; it takes more to impress the group further."
			},
			IGNORED: {
				LABEL: "Ignored",
				LOWER: -4,
				UPPER: 4,
				RAISED: "Any favor",
				LOWERED: "Any disservice",
				EFFECT: "The PCs either aren't on this group's radar or the group knows about the PCs but is generally ambivalent toward them. This carries no special benefits or detriments."
			},
			DISLIKED: {
				LABEL: "Disliked",
				LOWER: -14,
				UPPER: -5,
				RAISED: "Any favor",
				LOWERED: "Moderate or major disservice",
				EFFECT: "The PCs have a poor reputation among members of this group. Many members of the group know about the PCs, and are usually unfriendly to them. At this reputation, only moderate and major disservices reduce Reputation Points."
			},
			HATED: {
				LABEL: "Hated",
				LOWER: -29,
				UPPER: -15,
				RAISED: "Any favor",
				LOWERED: "Major disservice",
				EFFECT: "The PCs have earned this group's ire. The vast majority of the group knows about the PCs and have an extremely unfavorable opinion toward them. Many members of the group are hostile toward the PCs, and those who aren't are unfriendly. When presented an easy opportunity to hurt the PCs, the group will jump at the chance. Only major disservices can still reduce Reputation Points."
			},
			HUNTED: {
				LABEL: "Hunted",
				LOWER: -30,
				UPPER: -30,
				RAISED: "Moderate or major favor",
				LOWERED: "Major disservice",
				EFFECT: "The group actively hunts the PCs as scapegoats or nemeses, even at significant cost to itself. Every member has heard of the PCs, is hostile toward them, and would take major risks to thwart or destroy them. Only major disservices can still reduce Reputation Points, and only moderate or major favors can increase them."
			}
		},
		SERVICES: {
			MINOR: "Minor favors are simple, basic tasks that don't take too much effort for a PC to perform or much time at the table. Minor favors grant 1 Reputation Point.",
			MODERATE: "Moderate favors require a significant amount of effort and often take up a session or a noticeable chunk of a single session to complete. Moderate favors grant 2 Reputation Points.",
			MAJOR: "Major favors are a sizable endeavor, typically an entire quest involving several sessions. Major favors grant 5 Reputation Points."
		},
		DISSERVICES: {
			MINOR: "Minor disservices could be small but significant missteps, or accumulated slights and inconveniences. Minor disservices take away 1 Reputation Point.",
			MODERATE: "Moderate disservices are more than just a nuisance or annoyance, generally significantly hindering the group's efforts or violating a fundamental tenet of the group's beliefs in a significant but not egregious way. Moderate disservices take away 2 Reputation Points.",
			MAJOR: "Major disservices are incredibly antagonistic to a group, usually a single brazen act, such as thwarting a cult's apocalyptic doomsday plan. Major disservices take away at least 5 Reputation Points, or more if they are particularly egregious. They might be so terrible that the PCs immediately lose all their Reputation Points and then lose 5 more Reputation Points."
		}
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
	static random = foundry.utils.randomID(16)
	
	static generateID(){
		return foundry.utils.randomID(16);
	}
}

/**
 * Register our module's debug flag with developer mode's custom hook
 */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(Helper.ID);
});

export class Data {
	
	static get allSubsystems() {
		return game.actors?.party?.getFlag(Helper.ID, Helper.FLAGS.SUBSYSTEMS);
	}

	static saveDataModel(dataModel, flag = Helper.FLAGS.SUBSYSTEMS) {
		return game.actors?.party?.setFlag(Helper.ID, flag, {[dataModel.id]: dataModel});
	}

	static loadDataModel(id, flag = Helper.FLAGS.SUBSYSTEMS) {
		const model = game.actors?.party?.getFlag(Helper.ID, flag)?.[id]
		let instantiatedModel = {}
		if(!model){
			Helper.log(true, "Object is not a valid Data Model")
			return {};
		}
		if(model.type==="research"){
			instantiatedModel = new subsystem.ResearchDataModel(model)
		} else if (model.type==="influence"){
			instantiatedModel = new subsystem.InfluenceDataModel(model)
		} else if (model.type==="chases"){
			instantiatedModel = new subsystem.ChasesDataModel(model)
		} else if (model.type==="victorypoints"){
			instantiatedModel = new subsystem.VictoryPointsDataModel(model)
		} else if (model.type==="infiltrations"){
			instantiatedModel = new subsystem.InfiltrationDataModel(model)
		} else if (model.type==="reputations"){
			instantiatedModel = new subsystem.ReputationDataModel(model)
		}else if (model.type==="library"){
			instantiatedModel = new subtype.Library(model)
		} else if (model.type==="librarysource"){
			instantiatedModel = new subtype.LibrarySource(model)
		} else if (model.type==="influencenpc"){
			instantiatedModel = new subtype.InfluenceNPC(model)
		} else if (model.type==="chase"){
			instantiatedModel = new subtype.Chase(model)
		} else if (model.type==="chaseobstacle"){
			instantiatedModel = new subtype.ChaseObstacle(model)
		} else if (model.type==="infiltration"){
			instantiatedModel = new subtype.Infiltration(model)
		} else if (model.type==="infiltrationobstacle"){
			instantiatedModel = new subtype.InfiltrationObstacle(model)
		} else if (model.type==="complication"){
			instantiatedModel = new subtype.Complication(model)
		} else if (model.type==="reputation"){
			instantiatedModel = new subtype.Reputation(model)
		} else if (model.type==="check"){
			instantiatedModel = new subtype.Check(model)
		} else if (model.type==="threshold"){
			instantiatedModel = new subtype.Threshold(model)
		} else if (model.type==="counter"){
			instantiatedModel = new subtype.Counter(model)
		} else {
			Helper.log(true, "Data Model not recognized.")
		}
		
		return instantiatedModel;
	}
	
	// delete a specific subsystem by ID
	static deleteFlag(id, flag) {
		const keyDeletion = {
			[`-=${id}`]: null
		}
		
		return game.actors?.party?.setFlag(Helper.ID, flag, keyDeletion);
	}
	
	static deleteFlagType(flag) {
		return game.actors?.party?.unsetFlag(Helper.ID, flag);
	}
	
	static deleteAllFlags() {		
		for (const property in Helper.FLAGS){
			Helper.log(true, game.actors?.party?.unsetFlag(Helper.ID, Helper.FLAGS[property]))
		}
	}
	
	static showAllFlags() {
		for (const property in Helper.FLAGS){
			Helper.log(true, game.actors?.party?.getFlag(Helper.ID, Helper.FLAGS[property]))
		}
	}

	static getAllSubsystems() {
		var output = game.actors?.party?.getFlag(Helper.ID, Helper.FLAGS.SUBSYSTEMS)
		return output
	}

	/*static getSubsystemOfType(newType) {
		var output = game.actors?.party?.getFlag(Helper.ID, Helper.FLAGS.SUBSYSTEMS)?.[newType]
		Helper.log(true, "Getting subsystem")
		Helper.log(true, output)
		return output;
	}*/

	static populateDummies() {
		
		//Victory Point Subsystem Dummies
		const victoryPointDummy = new subsystem.VictoryPointsDataModel()
		const counter1 = new subtype.Counter()
		victoryPointDummy.addCounter(counter1)

		this.saveDataModel(victoryPointDummy)

		//Chase Subsystem Dummies
		const chaseDummy = new subsystem.ChasesDataModel()
		const chase1 = new subtype.Chase({name: "Underground Obstacles" , objective: "Win."})
		const chaseObstacle1 = new subtype.ChaseObstacle({name: "Crumbling Corridor", level: 1, goal:1})
		const chaseObstacle1Check1 = new subtype.Check({checkType: "Acrobatics", dc: 13})
		const chaseObstacle1Check2 = new subtype.Check({checkType: "Crafting", dc: 15})
		const chaseObstacle2 = new subtype.ChaseObstacle({name: "Fungus Grotto", level: 1, goal:1})
		const chaseObstacle2Check1 = new subtype.Check({checkType: "Fortitude", dc: 15})
		const chaseObstacle2Check2 = new subtype.Check({checkType: "Survival", dc: 13})
		const chaseObstacle3 = new subtype.ChaseObstacle({name: "Pit Trap", level: 1, goal:2})
		const chaseObstacle3Check1 = new subtype.Check({checkType: "Athletics", dc: 13})
		const chaseObstacle3Check2 = new subtype.Check({checkType: "Perception", dc: 15})
		const chaseObstacle4 = new subtype.ChaseObstacle({name: "Wandering Gelatinous Cube", level: 1, goal:2})
		const chaseObstacle4Check1 = new subtype.Check({checkType: "Occultism", dc: 18})
		const chaseObstacle4Check2 = new subtype.Check({checkType: "Stealth", dc: 15})

		chaseObstacle1.addCheck(chaseObstacle1Check1)
		chaseObstacle1.addCheck(chaseObstacle1Check2)
		chaseObstacle2.addCheck(chaseObstacle2Check1)
		chaseObstacle2.addCheck(chaseObstacle2Check2)
		chaseObstacle3.addCheck(chaseObstacle3Check1)
		chaseObstacle3.addCheck(chaseObstacle3Check2)
		chaseObstacle4.addCheck(chaseObstacle4Check1)
		chaseObstacle4.addCheck(chaseObstacle4Check2)
		chase1.addObstacle(chaseObstacle1)
		chase1.addObstacle(chaseObstacle2)
		chase1.addObstacle(chaseObstacle3)
		chase1.addObstacle(chaseObstacle4)
		chaseDummy.addChase(chase1)

		this.saveDataModel(chaseDummy)

		//Influence Subsystem Dummies
		const influenceDummy = new subsystem.InfluenceDataModel()
		const npc1 = new subtype.InfluenceNPC({name: "Danphy Mollwether", perception: 9, will: 12, resistances: "The landlord thinks in practical terms, with little patience for the “good-for-nothings” of the troupe. Appeals directed at sympathy alone increase the check's DC by 2.", weaknesses: "Mr. Mollwether used to visit the theater often as a small child, and performing one of his favorite old songs or plays brings tears to his eyes and reduces the Performance DC by 2."})
		const npcThreshold1 = new subtype.Threshold({thresholdValue: 4, description: "Mr. Mollwether gives the troupe 1 week to get him his back rent, with interest, before evicting them."})
		const npcThreshold2 = new subtype.Threshold({thresholdValue: 6, description: "Mr. Mollwether gives the troupe 1 month to get him his back rent before evicting them."})
		const npcThreshold3 = new subtype.Threshold({thresholdValue: 8, description: "Mr. Mollwether allows the troupe to stay, reduces their rent, and forgives half their debt."})
		const npcDiscovery1 = new subtype.Check({checkType: "Mercantile Lore", dc: 13})
		const npcDiscovery2 = new subtype.Check({checkType: "Perception", dc: 18})
		const npcDiscovery3 = new subtype.Check({checkType: "Society", dc: 16})
		const npcCheck1 = new subtype.Check({checkType: "Accounting Lore", dc: 16})
		const npcCheck2 = new subtype.Check({checkType: "Crafting", dc: 16})
		const npcCheck3 = new subtype.Check({checkType: "Intimidation", dc: 20})
		const npcCheck4 = new subtype.Check({checkType: "Performance", dc: 20})
		const npcCheck5 = new subtype.Check({checkType: "Diplomacy", dc: 22})
		const npcCheck6 = new subtype.Check({checkType: "Deception", dc: 24})

		npc1.addThreshold(npcThreshold1)
		npc1.addThreshold(npcThreshold2)
		npc1.addThreshold(npcThreshold3)
		npc1.addDiscoveryCheck(npcDiscovery1)
		npc1.addDiscoveryCheck(npcDiscovery2)
		npc1.addDiscoveryCheck(npcDiscovery3)
		npc1.addCheck(npcCheck1)
		npc1.addCheck(npcCheck2)
		npc1.addCheck(npcCheck3)
		npc1.addCheck(npcCheck4)
		npc1.addCheck(npcCheck5)
		npc1.addCheck(npcCheck6)
		influenceDummy.addNPC(npc1)

		this.saveDataModel(influenceDummy)

		//Research Subsystem Dummies
		const researchDummy = new subsystem.ResearchDataModel()
		const library1 = new subtype.Library({libraryName: "The Hags' Secret", level: 7, points: 0})
		const librarySource1 = new subtype.LibrarySource({description: "Sprite Swarm", maxRP: 5, earnedRP: 0})
		const librarySource1check1 = new subtype.Check({checkType: "Diplomacy", dc: 23})
		const librarySource1check2 = new subtype.Check({checkType: "Society", dc: 23})
		const librarySource1check3 = new subtype.Check({checkType: "Athletics", dc: 28})
		const librarySource2 = new subtype.LibrarySource({description:"Field of Tomeflowers", maxRP: 10, earnedRP: 0})
		const librarySource2check1 = new subtype.Check({checkType: "Academia Lore", dc: 18})
		const librarySource2check2 = new subtype.Check({checkType: "Library Lore", dc: 18})
		const librarySource2check3 = new subtype.Check({checkType: "Occultism", dc: 23})
		const librarySource3 = new subtype.LibrarySource({description: "Loremother Tree", maxRP: 15, earnedRP: 0})
		const librarySource3check1 = new subtype.Check({checkType: "Performance", dc: 21})
		const librarySource3check2 = new subtype.Check({checkType: "Nature", dc: 23})
		const libraryThreshold1 = new subtype.Threshold({thresholdValue: 5, description: "The PCs learn of apocryphal fey legends that say the coven members were once cruel fey queens now twisted by inner corruption. They learn basic details about hags and the hag mother's Call."})
		const libraryThreshold2 = new subtype.Threshold({thresholdValue: 10, description: "The PCs learn that the coven gathers on a nearby mountaintop every full moon. Attaining this knowledge comes at a cost: hag malice solidifies into two will-o'-wisps, which attack the PCs."})
		const libraryThreshold3 = new subtype.Threshold({thresholdValue: 15, description: "The PCs learn that a specific magical incantation is needed to reach the hag's mountaintop. Though they don't quite discover the incantation, they discover among magical writings a page containing the uncommon spell read omens."})
		const libraryThreshold4 = new subtype.Threshold({thresholdValue: 20, description: "The Loremother Tree awakens long enough to tell the PCs the incantation, but warns them that the hags possess powerful magic that has struck down many heroes. The tree then returns to slumber. Replace the Loremother Tree's Performance Research check with a DC 28 Diplomacy check to convince the tree to share further knowledge."})
		const libraryThreshold5 = new subtype.Threshold({thresholdValue: 30, description: " A dryad emerges from the trunk of the Loremother Tree and tells the PCs about the hags' spell—a unique polymorph ability that turns people into toads. She also gives each PC a small flower charm for protection that grants each PC a +3 status bonus to their saving throws against the hags' Toad Form ability. Unfortunately, this draws the hags' attention, who send two living wildfires to burn the glade down. If the PCs don't defeat the fire elementals, the creatures destroy any remaining information in the glade."})
		
		librarySource1.addCheck(librarySource1check1)
		librarySource1.addCheck(librarySource1check2)
		librarySource1.addCheck(librarySource1check3)
		librarySource2.addCheck(librarySource2check1)
		librarySource2.addCheck(librarySource2check2)
		librarySource2.addCheck(librarySource2check3)
		librarySource3.addCheck(librarySource3check1)
		librarySource3.addCheck(librarySource3check2)
		library1.addSource(librarySource1)
		library1.addSource(librarySource2)
		library1.addSource(librarySource3)
		library1.addThreshold(libraryThreshold1)
		library1.addThreshold(libraryThreshold2)
		library1.addThreshold(libraryThreshold3)
		library1.addThreshold(libraryThreshold4)
		library1.addThreshold(libraryThreshold5)
		researchDummy.addLibrary(library1)
		
		this.saveDataModel(researchDummy);

		//Infiltration Subsystem Dummies
		const infiltrationDummy = new subsystem.InfiltrationDataModel()
		const infiltration1 = new subtype.Infiltration({name: "Sample Infiltration"})
		const infiltrationObstacle1 = new subtype.InfiltrationObstacle({goal: 2, goalType: "individual"})
		const infiltrationObstacle1Check1 = new subtype.Check({checkType: "Deception", level: 1, adjustment: "STANDARD"}).calculateDC()
		const infiltrationObstacle1Check2 = new subtype.Check({checkType: "Diplomacy", level: 1, adjustment: "HARD"}).calculateDC()
		const infiltrationObstacle1Check3 = new subtype.Check({checkType: "Stealth", level: 1, adjustment: "VERYHARD"}).calculateDC()
		const infiltrationObstacle2 = new subtype.InfiltrationObstacle({goal: 1, goalType: "group"})
		const infiltrationObstacle2Check1 = new subtype.Check({checkType: "Athletics", level: 1, adjustment: "HARD"}).calculateDC()
		const infiltrationObstacle2Check2 = new subtype.Check({checkType: "Thievery", level: 1, adjustment: "VERYHARD"}).calculateDC()
		const infiltrationObstacle3 = new subtype.InfiltrationObstacle({goal: 3, goalType: "group"})
		const infiltrationObstacle3Check1 = new subtype.Check({checkType: "Thievery", level: 1, adjustment: "HARD"}).calculateDC()
		const awarenessThreshold1 = new subtype.Threshold({thresholdValue: 5, description: "Suspicions are raised. Increase the DCs for obstacles by 1. The first time the PCs reach this tier, a complication occurs."})
		const awarenessThreshold2 = new subtype.Threshold({thresholdValue: 10, description: "The first time the PCs reach this tier, a complication occurs."})
		const awarenessThreshold3 = new subtype.Threshold({thresholdValue: 15, description: "Increase the DCs for obstacles by a total of 2, and the first time the PCs reach this tier, a complication occurs."})
		const awarenessThreshold4 = new subtype.Threshold({thresholdValue: 20, description: "The infiltration fails."})
		const complication1 = new subtype.Complication({trigger: "The PCs reach 5 Awareness Points for the first time.", description: "Someone thinks they recognize you, and you must either convince them otherwise before slipping away or find a way to dodge the person entirely.", outcome: {success: "You convince or otherwise dodge the person.", failure: "You are recognized, and the party accrues 1 AP.", criticalFailure: "As failure, but the party accrues 2 AP."}})
		const complication1Check1 = new subtype.Check({checkType: "Deception", level: 1, adjustment: "STANDARD"}).calculateDC()
		const complication1Check2 = new subtype.Check({checkType: "Diplomacy", level: 1, adjustment: "HARD"}).calculateDC()
		const complication1Check3 = new subtype.Check({checkType: "Performance", level: 1, adjustment: "HARD"}).calculateDC()
		const complication1Check4 = new subtype.Check({checkType: "Stealth", level: 1, adjustment: "VERYHARD"}).calculateDC()
		
		complication1.addCheck(complication1Check1)
		complication1.addCheck(complication1Check2)
		complication1.addCheck(complication1Check3)
		complication1.addCheck(complication1Check4)
		infiltrationObstacle1.addCheck(infiltrationObstacle1Check1)
		infiltrationObstacle1.addCheck(infiltrationObstacle1Check2)
		infiltrationObstacle1.addCheck(infiltrationObstacle1Check3)
		infiltrationObstacle2.addCheck(infiltrationObstacle2Check1)
		infiltrationObstacle2.addCheck(infiltrationObstacle2Check2)
		infiltrationObstacle3.addCheck(infiltrationObstacle3Check1)
		infiltration1.addAwarenessThreshold(awarenessThreshold1)
		infiltration1.addAwarenessThreshold(awarenessThreshold2)
		infiltration1.addAwarenessThreshold(awarenessThreshold3)
		infiltration1.addAwarenessThreshold(awarenessThreshold4)
		infiltration1.addComplication(complication1)
		infiltration1.addObstacle(infiltrationObstacle1)
		infiltration1.addObstacle(infiltrationObstacle2)
		infiltration1.addObstacle(infiltrationObstacle3)
		infiltration1.addObjective("Get to the target.")
		infiltration1.addOpportunity("Requirements The PC has successfully completed an individual objective and some other PCs have not. Having completed your objective, you help an ally who is still trying to reach that goal. Describe how you are helping. This gives the ally the benefits of Following the Expert (Player Core 438). In unusual cases, the GM might allow you to attempt a relevant skill check to overcome the obstacle on behalf of the other PC instead.")
		infiltrationDummy.addInfiltration(infiltration1)

		this.saveDataModel(infiltrationDummy)
	}
}

Hooks.on('init', function() {
	game.settings.register(Helper.ID, "Reputation", {
		name: "Use the Reputation Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(Helper.ID, "Influence", {
		name: "Use the Influence Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(Helper.ID, "Infiltration", {
		name: "Use the Infiltration Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(Helper.ID, "Research", {
		name: "Use the Research Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(Helper.ID, "Chases", {
		name: "Use the Chases Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
	game.settings.register(Helper.ID, "VictoryPoints", {
		name: "Use the Victory Points Subsystem",
		scope: "world",
		config: "true",
		default: "false",
		type: Boolean
	});
});

/*Hooks.on('getPartySheetPF2eHeaderButtons', function(app, buttons) {
	if (!game.user.isGM) {return;}
	
	buttons.unshift({
		label: "Subsystems",
		icon: "fa fa-gears",
		class: `${Helper.ID}-tab`,
		onclick: () => {
			(new SubsystemForm({actor:app.actor}, async () => {
			setTimeout(() => { app.render(true, { tab: "sub-system"}) }, 0);
			})).render(true);
		}
	});
});*/

Hooks.on('renderPartySheetPF2e', function(partySheet, html, data) {
    Helper.log(true, game.settings.get(Helper.ID, "Reputation")?.config)
	if (!game.user.isGM || !(game.settings.get(Helper.ID, "Reputation")||game.settings.get(Helper.ID, "Influence")||game.settings.get(Helper.ID, "VictoryPoints")||game.settings.get(Helper.ID, "Chases")||game.settings.get(Helper.ID, "Infiltration")||game.settings.get(Helper.ID, "Research"))) {return;}
	
	let context ={
		researchSubsystem: Data.loadDataModel('research').concatenate(),
		influenceSubsystem: Data.loadDataModel('influence'),
		reputationSubsystem: Data.loadDataModel('reputation'),
		chasesSubsystem: Data.loadDataModel('chases'),
		infiltrationSubsystem: Data.loadDataModel('infiltration'),
		victorypointsSubsystem: Data.loadDataModel('victorypoints')
	}

	//Helper.log(true, this)
	//const inject = Handlebars.compile(`./modules/pf2e-subsystem-helper/templates/pf2e-subsystem-helper.hbs`, {context, allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true})

	html.find('.sub-nav:not(.sub-sub-nav)').append('<a data-tab="subsystems" class="">Subsystems</a>')
    html.find('.container').append('<div class="tab" data-tab="subsystems" data-region="subsystems"> </div>')
	html.find('.container').find('.subsystems').find('.directory-item').on("click", async function(event) {
        event.preventDefault();
        let target = $(event.currentTarget);
        if (target.hasClass('collapsed')) {
              target.removeClass('collapsed')
        } else {
              target.addClass('collapsed')
        }
    })

	Helper.log("this before instantiating subsystemTab")
	Helper.log(this)

	this.subsystemTab ??= new (this.pf2esubsystemhelper.App.SubsystemForm({window: {frame: false, applicationPart: 'composite'}}))
	this.subsystemTab.render({force: true});
	
	html.on('click', '.create-Reputation-subsystem-button', (event) => {
		Helper.log(true, 'Reputation Button Clicked!');
	});
	html.on('click', '.create-Influence-subsystem-button', (event) => {
		Helper.log(true, 'Influence Button Clicked!');
	});
	html.on('click', '.create-Infiltration-subsystem-button', (event) => {
		Helper.log(true, 'Infiltration Button Clicked!');
	});
	html.on('click', '.create-Research-subsystem-button', (event) => {
		Helper.log(true, 'Research Button Clicked!');
	});
	html.on('click', '.create-Chases-subsystem-button', (event) => {
		Helper.log(true, 'Chases Button Clicked!');
	});
	html.on('click', '.create-VictoryPoints-subsystem-button', (event) => {
		Helper.log(true, 'Victory Points Button Clicked!');
	});
});

function getFolders(partySheet) {
	
	const enabledFolders = []
	
	if (game.settings.get(Helper.ID, "Reputation")) {
		enabledFolders.push('reputation')
	}
	if (game.settings.get(Helper.ID, "Influence")) {
		enabledFolders.push('influence')
	}
	if (game.settings.get(Helper.ID, "Infiltration")) {
		enabledFolders.push('infiltrations')
	}
	if (game.settings.get(Helper.ID, "Research")) {
		enabledFolders.push('research')
	}
	if (game.settings.get(Helper.ID, "Chases")) {
		enabledFolders.push('chases')
	}
	if (game.settings.get(Helper.ID, "VictoryPoints")) {
		enabledFolders.push('victorypoints');
	}

	return enabledFolders.map(obj=>{
		Helper.log(true, obj)
		let model = Data.loadDataModel(obj)
		Helper.log(true, model)
		let folder = `<li class="directory-item folder flexcol collapsed" style="display: flex;">
		<header class="folder-header flexrow">
            <h3 class="noborder"><i class="fas fa-folder-open fa-fw"></i>${model.subsystemName}</h3>
			<button class="create-button create-subsystem-button create-${model.type}-subsystem-button flex0" data-tooltip="Create New ${element.getMechanicName()}">
				<i class="fa-solid subsystem-add fa-gears"></i>
				<i class="fa-solid subsystem-add fa-plus"></i>
			</button>
       	</header>
   		<ol class="subdirectory">
			${model.toHTML()}
		</ol>
   		</li>`

		return folder;
	}).join("")
}

export class SubsystemForm extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id: "subsystem-form",
		form: {
			closeOnSubmit: false
		},
		position: {
			width: 640,
			height: "auto"
		},
		tag: "form"
	}

	get title() {
		return `Subsystems`;
	}

	static PARTS = {
		header: {
			template: "./modules/pf2e-subsystem-helper/templates/pf2e-subsystem-helper.hbs"
		}
	}

	_prepareContext(options) {
		return {
			researchSubsystem: Data.loadDataModel('research').concatenate(),
			influenceSubsystem: Data.loadDataModel('influence'),
			reputationSubsystem: Data.loadDataModel('reputation'),
			chasesSubsystem: Data.loadDataModel('chases'),
			infiltrationSubsystem: Data.loadDataModel('infiltration'),
			victorypointsSubsystem: Data.loadDataModel('victorypoints')
		}
	}

	async #onSubmit(event, form, formData) {
		await Data.saveDataModel(formData)

		this.render();
	}
}


globalThis.pf2esubsystemhelper = {
	Helper,
	Data,
	subsystem,
	subtype,
	SubsystemForm
}