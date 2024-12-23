import * as subsystem from './subsystem-data-models.js';
import * as subtype from './subsystem-data-model-subtypes.js';
import { constants } from './constants.js';
import { libWrapper } from './lib/shim.js';

export let patchFunc = (prop, func, type = "WRAPPER") => {
    /*let nonLibWrapper = () => {
        /*const oldFunc = eval(prop);
        eval(`${prop} = function (event) {
            return func.call(this, ${type != "OVERRIDE" ? "oldFunc.bind(this)," : ""} ...arguments);
        }`);


    }*/
    if (game.modules.get("lib-wrapper")?.active) {
        try {
            libWrapper.register("pf2e-subsystem-helper", prop, func, type);
        } catch (e) {
            Helper.log(true, "Could not successfully register module.")
        }
    } else {
        Helper.log(true,"LibWrapper not enabled.")
    }
}

export class PF2eSubsystemHelper {
	static async init() {
        try {
            Object.defineProperty(User.prototype, "isTheGM", {
                get: function isTheGM() {
                    return this == (game.users.find(u => u.hasRole("GAMEMASTER") && u.active) || game.users.find(u => u.hasRole("ASSISTANT") && u.active));
                }
            });
        } catch { }

		patchFunc("ActorSheet.prototype._renderInner", async function (wrapped, ...args) {
            let inner = await wrapped(...args);

            if (this.constructor.name == "PartySheetPF2e") {

                let subsystemTab = $("<div>").attr("data-tab", "subsystems").attr("style", "display: block; overflow-y: scroll; overflow-x: hidden;").addClass("tab subsystemTab");//.append(template);


                $('.sub-nav a[data-tab="inventory"]', inner).after($("<a>").attr("data-tab", "subsystems").text("Subsystems"));
                $('section.container div[data-tab="inventory"]', inner).after(subsystemTab);
            }

            return inner;
        });
	}

	
}

export class Helper {
	
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

export class Data {
	
	static get allSubsystems() {
		return game.actors?.party?.getFlag(constants.ID, constants.FLAGS.SUBSYSTEMS);
	}

	static saveDataModel(dataModel, flag = constants.FLAGS.SUBSYSTEMS) {
		return game.actors?.party?.setFlag(constants.ID, flag, {[dataModel.id]: dataModel});
	}

	static loadDataModel(id, flag = constants.FLAGS.SUBSYSTEMS) {
		const model = game.actors.party.getFlag(constants.ID, flag)?.[id]
		let instantiatedModel = {}
		if(!model){
			Helper.log(true, "Object is not a valid Data Model", id, flag)
			if(flag === constants.FLAGS.SUBSYSTEMS) {
				let model = {}
				if(id==="research"){
					instantiatedModel = new subsystem.ResearchDataModel(model)
					this.saveDataModel(instantiatedModel)
				} else if (id==="influence"){
					instantiatedModel = new subsystem.InfluenceDataModel(model)
					this.saveDataModel(instantiatedModel)
				} else if (id==="chases"){
					instantiatedModel = new subsystem.ChasesDataModel(model)
					this.saveDataModel(instantiatedModel)
				} else if (id==="victorypoints"){
					instantiatedModel = new subsystem.VictoryPointsDataModel(model)
					this.saveDataModel(instantiatedModel)
				} else if (id==="infiltrations"){
					instantiatedModel = new subsystem.InfiltrationsDataModel(model)
					this.saveDataModel(instantiatedModel)
				} else if (id==="reputations"){
					instantiatedModel = new subsystem.ReputationsDataModel(model)
					this.saveDataModel(instantiatedModel)
				}
				return instantiatedModel
			}
			return null;
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
			instantiatedModel = new subsystem.InfiltrationsDataModel(model)
		} else if (model.type==="reputations"){
			instantiatedModel = new subsystem.ReputationsDataModel(model)
		}else if (model.type==="library"){
			instantiatedModel = new subtype.LibraryDataModel(model)
		} else if (model.type==="librarysource"){
			instantiatedModel = new subtype.LibrarySourceDataModel(model)
		} else if (model.type==="influencenpc"){
			instantiatedModel = new subtype.InfluenceNPCDataModel(model)
		} else if (model.type==="chase"){
			instantiatedModel = new subtype.ChaseDataModel(model)
		} else if (model.type==="chaseobstacle"){
			instantiatedModel = new subtype.ChaseObstacleDataModel(model)
		} else if (model.type==="infiltration"){
			instantiatedModel = new subtype.InfiltrationDataModel(model)
		} else if (model.type==="infiltrationobstacle"){
			instantiatedModel = new subtype.InfiltrationObstacleDataModel(model)
		} else if (model.type==="complication"){
			instantiatedModel = new subtype.ComplicationDataModel(model)
		} else if (model.type==="reputation"){
			instantiatedModel = new subtype.ReputationDataModel(model)
		} else if (model.type==="check"){
			instantiatedModel = new subtype.CheckDataModel(model)
		} else if (model.type==="threshold"){
			instantiatedModel = new subtype.ThresholdDataModel(model)
		} else if (model.type==="counter"){
			instantiatedModel = new subtype.CounterDataModel(model)
		} else {
			Helper.log(true, "Data Model not recognized.")
		}
		
		return instantiatedModel;
	}

	static setFlag(id, flag, value) {
		return game.actors?.party?.setFlag(constants.ID, flag[id], value)
	}

	static getFlag(id, flag) {
		return game.actors?.party?.getFlag(constants.ID, flag[id])
	}
	
	// delete a specific subsystem by ID
	static deleteFlag(id, flag) {
		const keyDeletion = {
			[`-=${id}`]: null
		}
		
		return game.actors?.party?.setFlag(constants.ID, flag, keyDeletion);
	}
	
	static deleteFlagType(flag) {
		return game.actors?.party?.unsetFlag(constants.ID, flag);
	}
	
	static deleteAllFlags() {		
		for (const property in constants.FLAGS){
			Helper.log(true, game.actors?.party?.unsetFlag(constants.ID, constants.FLAGS[property]))
		}
	}
	
	static showAllFlags() {
		for (const property in constants.FLAGS){
			Helper.log(true, constants.FLAGS[property], game.actors?.party?.getFlag(constants.ID, constants.FLAGS[property]))
		}
	}

	static getAllSubsystems() {
		var output = game.actors?.party?.getFlag(constants.ID, constants.FLAGS.SUBSYSTEMS)
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
		const counter1 = new subtype.CounterDataModel()
		victoryPointDummy.addCounter(counter1)

		this.saveDataModel(victoryPointDummy)

		//Chase Subsystem Dummies
		const chaseDummy = new subsystem.ChasesDataModel()
		const chase1 = new subtype.ChaseDataModel({name: "Underground Obstacles" , objective: "Win."})
		const chaseObstacle1 = new subtype.ChaseObstacleDataModel({name: "Crumbling Corridor", level: 1, goal:1})
		const chaseObstacle1Check1 = new subtype.CheckDataModel({checkType: "Acrobatics", dc: 13})
		const chaseObstacle1Check2 = new subtype.CheckDataModel({checkType: "Crafting", dc: 15})
		const chaseObstacle2 = new subtype.ChaseObstacleDataModel({name: "Fungus Grotto", level: 1, goal:1})
		const chaseObstacle2Check1 = new subtype.CheckDataModel({checkType: "Fortitude", dc: 15})
		const chaseObstacle2Check2 = new subtype.CheckDataModel({checkType: "Survival", dc: 13})
		const chaseObstacle3 = new subtype.ChaseObstacleDataModel({name: "Pit Trap", level: 1, goal:2})
		const chaseObstacle3Check1 = new subtype.CheckDataModel({checkType: "Athletics", dc: 13})
		const chaseObstacle3Check2 = new subtype.CheckDataModel({checkType: "Perception", dc: 15})
		const chaseObstacle4 = new subtype.ChaseObstacleDataModel({name: "Wandering Gelatinous Cube", level: 1, goal:2})
		const chaseObstacle4Check1 = new subtype.CheckDataModel({checkType: "Occultism", dc: 18})
		const chaseObstacle4Check2 = new subtype.CheckDataModel({checkType: "Stealth", dc: 15})

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
		const npc1 = new subtype.InfluenceNPCDataModel({name: "Danphy Mollwether", perception: 9, will: 12, resistances: "The landlord thinks in practical terms, with little patience for the “good-for-nothings” of the troupe. Appeals directed at sympathy alone increase the check's DC by 2.", weaknesses: "Mr. Mollwether used to visit the theater often as a small child, and performing one of his favorite old songs or plays brings tears to his eyes and reduces the Performance DC by 2."})
		const npcThreshold1 = new subtype.ThresholdDataModel({thresholdValue: 4, description: "Mr. Mollwether gives the troupe 1 week to get him his back rent, with interest, before evicting them."})
		const npcThreshold2 = new subtype.ThresholdDataModel({thresholdValue: 6, description: "Mr. Mollwether gives the troupe 1 month to get him his back rent before evicting them."})
		const npcThreshold3 = new subtype.ThresholdDataModel({thresholdValue: 8, description: "Mr. Mollwether allows the troupe to stay, reduces their rent, and forgives half their debt."})
		const npcDiscovery1 = new subtype.CheckDataModel({checkType: "Mercantile Lore", dc: 13})
		const npcDiscovery2 = new subtype.CheckDataModel({checkType: "Perception", dc: 18})
		const npcDiscovery3 = new subtype.CheckDataModel({checkType: "Society", dc: 16})
		const npcCheck1 = new subtype.CheckDataModel({checkType: "Accounting Lore", dc: 16})
		const npcCheck2 = new subtype.CheckDataModel({checkType: "Crafting", dc: 16})
		const npcCheck3 = new subtype.CheckDataModel({checkType: "Intimidation", dc: 20})
		const npcCheck4 = new subtype.CheckDataModel({checkType: "Performance", dc: 20})
		const npcCheck5 = new subtype.CheckDataModel({checkType: "Diplomacy", dc: 22})
		const npcCheck6 = new subtype.CheckDataModel({checkType: "Deception", dc: 24})

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
		const library1 = new subtype.LibraryDataModel({libraryName: "The Hags' Secret", level: 7, points: 0})
		const librarySource1 = new subtype.LibrarySourceDataModel({description: "Sprite Swarm", maxRP: 5, earnedRP: 0})
		const librarySource1check1 = new subtype.CheckDataModel({checkType: "Diplomacy", dc: 23})
		const librarySource1check2 = new subtype.CheckDataModel({checkType: "Society", dc: 23})
		const librarySource1check3 = new subtype.CheckDataModel({checkType: "Athletics", dc: 28})
		const librarySource2 = new subtype.LibrarySourceDataModel({description:"Field of Tomeflowers", maxRP: 10, earnedRP: 0})
		const librarySource2check1 = new subtype.CheckDataModel({checkType: "Academia Lore", dc: 18})
		const librarySource2check2 = new subtype.CheckDataModel({checkType: "Library Lore", dc: 18})
		const librarySource2check3 = new subtype.CheckDataModel({checkType: "Occultism", dc: 23})
		const librarySource3 = new subtype.LibrarySourceDataModel({description: "Loremother Tree", maxRP: 15, earnedRP: 0})
		const librarySource3check1 = new subtype.CheckDataModel({checkType: "Performance", dc: 21})
		const librarySource3check2 = new subtype.CheckDataModel({checkType: "Nature", dc: 23})
		const libraryThreshold1 = new subtype.ThresholdDataModel({thresholdValue: 5, description: "The PCs learn of apocryphal fey legends that say the coven members were once cruel fey queens now twisted by inner corruption. They learn basic details about hags and the hag mother's Call."})
		const libraryThreshold2 = new subtype.ThresholdDataModel({thresholdValue: 10, description: "The PCs learn that the coven gathers on a nearby mountaintop every full moon. Attaining this knowledge comes at a cost: hag malice solidifies into two will-o'-wisps, which attack the PCs."})
		const libraryThreshold3 = new subtype.ThresholdDataModel({thresholdValue: 15, description: "The PCs learn that a specific magical incantation is needed to reach the hag's mountaintop. Though they don't quite discover the incantation, they discover among magical writings a page containing the uncommon spell read omens."})
		const libraryThreshold4 = new subtype.ThresholdDataModel({thresholdValue: 20, description: "The Loremother Tree awakens long enough to tell the PCs the incantation, but warns them that the hags possess powerful magic that has struck down many heroes. The tree then returns to slumber. Replace the Loremother Tree's Performance Research check with a DC 28 Diplomacy check to convince the tree to share further knowledge."})
		const libraryThreshold5 = new subtype.ThresholdDataModel({thresholdValue: 30, description: " A dryad emerges from the trunk of the Loremother Tree and tells the PCs about the hags' spell—a unique polymorph ability that turns people into toads. She also gives each PC a small flower charm for protection that grants each PC a +3 status bonus to their saving throws against the hags' Toad Form ability. Unfortunately, this draws the hags' attention, who send two living wildfires to burn the glade down. If the PCs don't defeat the fire elementals, the creatures destroy any remaining information in the glade."})
		
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
		const infiltrationDummy = new subsystem.InfiltrationsDataModel()
		const infiltration1 = new subtype.InfiltrationDataModel({name: "Sample Infiltration"})
		const infiltrationObstacle1 = new subtype.InfiltrationObstacleDataModel({goal: 2, goalType: "individual"})
		const infiltrationObstacle1Check1 = new subtype.CheckDataModel({checkType: "Deception", level: 1, adjustment: "STANDARD"}).calculateDC()
		const infiltrationObstacle1Check2 = new subtype.CheckDataModel({checkType: "Diplomacy", level: 1, adjustment: "HARD"}).calculateDC()
		const infiltrationObstacle1Check3 = new subtype.CheckDataModel({checkType: "Stealth", level: 1, adjustment: "VERYHARD"}).calculateDC()
		const infiltrationObstacle2 = new subtype.InfiltrationObstacleDataModel({goal: 1, goalType: "group"})
		const infiltrationObstacle2Check1 = new subtype.CheckDataModel({checkType: "Athletics", level: 1, adjustment: "HARD"}).calculateDC()
		const infiltrationObstacle2Check2 = new subtype.CheckDataModel({checkType: "Thievery", level: 1, adjustment: "VERYHARD"}).calculateDC()
		const infiltrationObstacle3 = new subtype.InfiltrationObstacleDataModel({goal: 3, goalType: "group"})
		const infiltrationObstacle3Check1 = new subtype.CheckDataModel({checkType: "Thievery", level: 1, adjustment: "HARD"}).calculateDC()
		const awarenessThreshold1 = new subtype.ThresholdDataModel({thresholdValue: 5, description: "Suspicions are raised. Increase the DCs for obstacles by 1. The first time the PCs reach this tier, a complication occurs."})
		const awarenessThreshold2 = new subtype.ThresholdDataModel({thresholdValue: 10, description: "The first time the PCs reach this tier, a complication occurs."})
		const awarenessThreshold3 = new subtype.ThresholdDataModel({thresholdValue: 15, description: "Increase the DCs for obstacles by a total of 2, and the first time the PCs reach this tier, a complication occurs."})
		const awarenessThreshold4 = new subtype.ThresholdDataModel({thresholdValue: 20, description: "The infiltration fails."})
		const complication1 = new subtype.ComplicationDataModel({trigger: "The PCs reach 5 Awareness Points for the first time.", description: "Someone thinks they recognize you, and you must either convince them otherwise before slipping away or find a way to dodge the person entirely.", outcome: {success: "You convince or otherwise dodge the person.", failure: "You are recognized, and the party accrues 1 AP.", criticalFailure: "As failure, but the party accrues 2 AP."}})
		const complication1Check1 = new subtype.CheckDataModel({checkType: "Deception", level: 1, adjustment: "STANDARD"}).calculateDC()
		const complication1Check2 = new subtype.CheckDataModel({checkType: "Diplomacy", level: 1, adjustment: "HARD"}).calculateDC()
		const complication1Check3 = new subtype.CheckDataModel({checkType: "Performance", level: 1, adjustment: "HARD"}).calculateDC()
		const complication1Check4 = new subtype.CheckDataModel({checkType: "Stealth", level: 1, adjustment: "VERYHARD"}).calculateDC()
		
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

globalThis.pf2esubsystemhelper = {
	Helper,
	Data,
	subsystem,
	subtype,
	PF2eSubsystemHelper
}