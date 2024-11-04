
import { Helper } from "./pf2e-subsystem-helper.js";
import { Data } from "./pf2e-subsystem-helper.js";
import { constants } from './constants.js';

export class LibraryDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			libraryName: new fields.StringField({required: true, blank: false, initial: "New Library"}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			thresholds: new fields.ArrayField(new fields.StringField()),
			sources: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "library"}),
			visible: new fields.BooleanField({required: true, blank: false, initial: false}),
			thresholdsVisible: new fields.BooleanField({required: true, blank: false, initial: true}),
			sourcesVisible: new fields.BooleanField({required: true, blank: false, initial: true})
		}
	}
	
	addThreshold(newThreshold) {
		if(!newThreshold instanceof ThresholdDataModel) {
			Helper.log(true, 'Cannot add new Library Threshold - the object is not a Threshold')
			return null;
		}
		this.thresholds.push(newThreshold.id)
		Data.saveDataModel(newThreshold, constants.FLAGS.THRESHOLDS)
		this.updateSource({thresholds: this.thresholds})
		return newThreshold.id;
	}
	
	getThresholdByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.THRESHOLDS);
	}
	
	getThresholds() {
		return this.thresholds.map( id => this.getThresholdByID(id) );
	}
	
	deleteThreshold(oldThresholdID){
		this.thresholds.splice(this.thresholds.indexOf(oldThresholdID), 1)
		Data.deleteFlag(oldThresholdID, constants.FLAGS.THRESHOLDS)
		this.updateSource({thresholds: this.thresholds})
		Data.saveDataModel(this, constants.FLAGS.LIBRARIES)
	}
	
	addSource(newSource) {
		if(!newSource instanceof LibrarySourceDataModel) {
			Helper.log(true, 'Cannot add new Library Source - the object is not a Library Source')
			return null;
		}
		this.sources.push(newSource.id)
		Data.saveDataModel(newSource, constants.FLAGS.SOURCES)
		this.updateSource({sources: this.sources})
		return newSource.id;
	}
	
	getSourceByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.SOURCES);
	}

	deleteSource(oldSourceID){
		let temp = Data.loadDataModel(oldSourceID, constants.FLAGS.SOURCES)
		temp.checks.forEach(check => {
			temp.deleteCheck(check)
		});
		this.sources.splice(this.sources.indexOf(oldSourceID), 1)
		Data.deleteFlag(oldSourceID, constants.FLAGS.SOURCES)
		this.updateSource({sources: this.sources})
		Data.saveDataModel(this, constants.FLAGS.LIBRARIES)
	}

	getSources() {
		return this.sources.map( id => this.getSourceByID(id) );
	}
}

export class LibrarySourceDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			description: new fields.StringField({required: true, blank: false, initial: "New Source"}),
			maxRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			earnedRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			checks: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "librarysource"}),
			checksVisible: new fields.BooleanField({required: true, blank: false, initial: true})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof CheckDataModel) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		this.checks.push(newCheck.id)
		Data.saveDataModel(newCheck, constants.FLAGS.CHECKS)
		this.updateSource({checks: this.checks})
		return newCheck.id;
	}
	

	deleteCheck(oldCheckID){
		this.checks.splice(this.checks.indexOf(oldCheckID), 1)
		Data.deleteFlag(oldCheckID, constants.FLAGS.CHECKS)
		this.updateSource({checks: this.checks})
		Data.saveDataModel(this, constants.FLAGS.SOURCES)
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
}

export class InfluenceNPCDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New NPC"}),
			influence: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			perception: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			will: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			thresholds: new fields.ArrayField(new fields.StringField()),
			discoveries: new fields.ArrayField(new fields.StringField()),
			checks: new fields.ArrayField(new fields.StringField()),
			resistances: new fields.StringField({required: false, blank: true, initial: "No resistances"}),
			weaknesses: new fields.StringField({required: false, blank: true, initial: "No weaknesses"}),
			penalties: new fields.StringField({required: false, blank: true, initial: "No penalties"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "influencenpc"}),
			visible: new fields.BooleanField({required: true, blank: false, initial: false}),
			thresholdsVisible: new fields.BooleanField({required: true, blank: false, initial: true}),
			discoveriesVisible: new fields.BooleanField({required: true, blank: false, initial: true}),
			checksVisible: new fields.BooleanField({required: true, blank: false, initial: true})
		}
	}
	
	addThreshold(newThreshold) {
		if(!newThreshold instanceof ThresholdDataModel) {
			Helper.log(true, 'Cannot add new Library Threshold - the object is not a Threshold')
			return null;
		}
		this.thresholds.push(newThreshold.id)
		Data.saveDataModel(newThreshold, constants.FLAGS.THRESHOLDS)
		this.updateSource({thresholds: this.thresholds})
		return newThreshold.id;
	}
	
	getThresholdByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.THRESHOLDS);
	}
	
	getThresholds() {
		return this.thresholds.map( id => this.getThresholdByID(id) );
	}
	
	deleteThreshold(oldThresholdID){
		this.thresholds.splice(this.thresholds.indexOf(oldThresholdID), 1)
		Data.deleteFlag(oldThresholdID, constants.FLAGS.THRESHOLDS)
		this.updateSource({thresholds: this.thresholds})
		Data.saveDataModel(this, constants.FLAGS.NPCS)
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof CheckDataModel) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		this.checks.push(newCheck.id)
		Data.saveDataModel(newCheck, constants.FLAGS.CHECKS)
		this.updateSource({checks: this.checks})
		return newCheck.id;
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}

	deleteCheck(oldCheckID){
		this.checks.splice(this.checks.indexOf(oldCheckID), 1)
		Data.deleteFlag(oldCheckID, constants.FLAGS.CHECKS)
		this.updateSource({checks: this.checks})
		Data.saveDataModel(this, constants.FLAGS.NPCS)
	}

	addDiscoveryCheck(newDiscovery) {
		if(!newDiscovery instanceof CheckDataModel) {
			Helper.log(true, 'Cannot add new Discovery Check - the object is not a Check')
			return;
		}
		this.discoveries.push(newDiscovery.id)
		Data.saveDataModel(newDiscovery, constants.FLAGS.CHECKS)
		this.updateSource({discoveries: this.discoveries})
		return newDiscovery.id;
	}
	
	getDiscoveryCheckByID(id) {
		return getCheckByID(id);
	}
	
	getDicoveryChecks() {
		return this.discoveries.map( id => this.getCheckByID(id) );
	}
	

	deleteDiscoveryCheck(oldCheckID){
		this.discoveries.splice(this.discoveries.indexOf(oldCheckID), 1)
		Data.deleteFlag(oldCheckID, constants.FLAGS.CHECKS)
		this.updateSource({discoveries: this.discoveries})
		Data.saveDataModel(this, constants.FLAGS.NPCS)
	}
}

export class ChaseDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Chase"}),
			obstacles: new fields.ArrayField(new fields.StringField()),
			objective: new fields.StringField({required: true, blank: false, initial: "Survive"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "chase"}),
			visible: new fields.BooleanField({required: true, blank: false, initial: false}),
			obstaclesVisible: new fields.BooleanField({required: true, blank: false, initial: true})
		}
	}
	
	addObstacle(newObstacle) {
		if(!newObstacle instanceof ChaseObstacleDataModel) {
			Helper.log(true, 'Cannot add new Chase Obstacle - the object is not an Chase Obstacle')
			return;
		}
		this.obstacles.push(newObstacle.id)
		Data.saveDataModel(newObstacle, constants.FLAGS.CHASEOBSTACLES)
		this.updateSource({obstacles: this.obstacles})
		return newObstacle.id;
	}

	deleteObstacle(oldObstacleID){
		let temp = Data.loadDataModel(oldObstacleID, constants.FLAGS.CHASEOBSTACLES)
		temp.checks.forEach(check => {
			temp.deleteCheck(check)
		});
		this.obstacles.splice(this.obstacles.indexOf(oldObstacleID), 1)
		Data.deleteFlag(oldObstacleID, constants.FLAGS.CHASEOBSTACLES)
		this.updateSource({obstacles: this.obstacles})
		Data.saveDataModel(this, constants.FLAGS.CHASES)
	}
	
	getObstacleByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.CHASEOBSTACLES);
	}
	
	getObstacles() {
		return this.obstacles.map( id => this.getObstacleByID(id) );
	}
}

export class ChaseObstacleDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Obstacle"}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 1}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			goal: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 1}),
			checks: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "chaseobstacle"}),
			checksVisible: new fields.BooleanField({required: true, blank: false, initial: true})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof CheckDataModel) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		this.checks.push(newCheck.id)
		Data.saveDataModel(newCheck, constants.FLAGS.CHECKS)
		this.updateSource({checks: this.checks})
		return newCheck.id;
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.CHECKS);
	}

	deleteCheck(oldCheckID){
		this.checks.splice(this.checks.indexOf(oldCheckID), 1)
		Data.deleteFlag(oldCheckID, constants.FLAGS.CHECKS)
		this.updateSource({checks: this.checks})
		Data.saveDataModel(this, constants.FLAGS.CHASEOBSTACLES)
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
}

export class InfiltrationDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Infiltration"}),
			objectives: new fields.ArrayField(new fields.StringField()), 
			obstacles: new fields.ArrayField(new fields.StringField()),
			awarenessPoints: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			awarenessThresholds: new fields.ArrayField(new fields.StringField()),
			complications: new fields.ArrayField(new fields.StringField()),
			opportunities: new fields.ArrayField(new fields.StringField()),
			edgePoints: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "infiltration"}),
			visible: new fields.BooleanField({required: true, blank: false, initial: false}),
			objectivesVisible: new fields.BooleanField({required: true, blank: false, initial: false}),
			obstaclesVisible: new fields.BooleanField({required: true, blank: false, initial: false}),
			thresholdsVisible: new fields.BooleanField({required: true, blank: false, initial: false}),
			complicationsVisible: new fields.BooleanField({required: true, blank: false, initial: false}),
			opportunitiesVisible: new fields.BooleanField({required: true, blank: false, initial: false})
		}
	}
	
	addObjective(newObjective) {
		this.objectives.push(newObjective)
		this.updateSource({objectives: this.objectives})
	}
	
	deleteObjective(objective) {
		this.objectives.splice(this.objectives.indexOf(objective),1)
	}
	
	getObjectives() {
		return this.objectives;
	}

	addOpportunity(newOpportunity) {
		this.opportunities.push(newOpportunity)
		this.updateSource({opportunities: this.opportunities})
	}
	
	deleteOpportunity(opportunity) {
		this.opportunities.splice(this.opportunities.indexOf(opportunity),1)
	}
	
	getOpportunities() {
		return this.opportunities;
	}

	addObstacle(newObstacle) {
		if(!newObstacle instanceof InfiltrationObstacleDataModel) {
			Helper.log(true, 'Cannot add new Infiltration Obstacle - the object is not an Infiltration Obstacle')
			return;
		}
		this.obstacles.push(newObstacle.id)
		Data.saveDataModel(newObstacle, constants.FLAGS.INFILTRATIONOBSTACLES)
		this.updateSource({obstacles: this.obstacles})
		return newObstacle.id;
	}
	
	deleteObstacle(oldObstacleID){
		let temp = Data.loadDataModel(oldObstacleID, constants.FLAGS.INFILTRATIONOBSTACLES)
		temp.checks.forEach(check => {
			temp.deleteCheck(check)
		});
		temp.counters.forEach(counter => {
			temp.deletePointCounter(counter)
		});
		this.obstacles.splice(this.obstacles.indexOf(oldObstacleID), 1)
		Data.deleteFlag(oldObstacleID, constants.FLAGS.INFILTRATIONOBSTACLES)
		this.updateSource({obstacles: this.obstacles})
		Data.saveDataModel(this, constants.FLAGS.INFILTRATIONS)
	}

	getObstacleByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.INFILTRATIONOBSTACLES);
	}
	
	getObstacles() {
		return this.obstacles.map( id => this.getObstacleByID(id) );
	}
	
	addAwarenessThreshold(newThreshold) {
		if(!newThreshold instanceof ThresholdDataModel) {
			Helper.log(true, 'Cannot add new Infiltration Threshold - the object is not a Threshold')
			return null;
		}
		this.awarenessThresholds.push(newThreshold.id)
		Data.saveDataModel(newThreshold, constants.FLAGS.THRESHOLDS)
		this.updateSource({awarenessThresholds: this.awarenessThresholds})
		return newThreshold.id;
	}
	
	getAwarenessThresholdByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.THRESHOLDS);
	}
	
	getAwarenessThresholds() {
		return this.awarenessThresholds.map( id => this.getAwarenessThresholdByID(id) );
	}

	deleteAwarenessThreshold(oldThresholdID){
		this.awarenessThresholds.splice(this.awarenessThresholds.indexOf(oldThresholdID), 1)
		Data.deleteFlag(oldThresholdID, constants.FLAGS.THRESHOLDS)
		this.updateSource({awarenessThresholds: this.awarenessThresholds})
		Data.saveDataModel(this, constants.FLAGS.INFILTRATIONS)
	}
	
	addComplication(newComplication) {
		if(!newComplication instanceof ComplicationDataModel) {
			Helper.log(true, 'Cannot add new Complication - the object is not a Complication')
			return null;
		}
		this.complications.push(newComplication.id)
		Data.saveDataModel(newComplication, constants.FLAGS.COMPLICATIONS)
		this.updateSource({complications: this.complications})
		return newComplication.id;
	}
	
	getComplicationByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.COMPLICATIONS);
	}
	
	getComplications() {
		return this.complications.map( id => this.getComplicationByID(id) );
	}
	
	deleteComplication(oldComplicationD){
		let temp = Data.loadDataModel(oldComplicationD, constants.FLAGS.COMPLICATIONS)
		temp.checks.forEach(check => {
			temp.deleteCheck(check)
		});
		this.complications.splice(this.complications.indexOf(oldComplicationD), 1)
		Data.deleteFlag(oldComplicationD, constants.FLAGS.COMPLICATIONS)
		this.updateSource({complications: this.complications})
		Data.saveDataModel(this, constants.FLAGS.INFILTRATIONS)
	}
}

export class InfiltrationObstacleDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			goal: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 2}),
			counters: new fields.ArrayField(new fields.StringField()),
			checks: new fields.ArrayField(new fields.StringField()),
			description: new fields.StringField({required: true, blank: false, initial: "New Description"}),
			outcome: new fields.SchemaField({
				criticalSuccess: new fields.StringField({required: true, blank: false, initial: "The PC gains 2 Infiltration Points."}),
				success: new fields.StringField({required: true, blank: false, initial: "The PC gains 1 Infiltration Point."}),
				failure: new fields.StringField({required: true, blank: false, initial: "The PCs accrue 1 Awareness Point."}),
				criticalFailure: new fields.StringField({required: true, blank: false, initial: "The PCs accrue 2 Awareness Points."})
			}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "infiltrationobstacle"}),
			isIndividual: new fields.BooleanField({required: true, blank: false, initial: false}),
			countersVisible: new fields.BooleanField({required: true, blank: false, initial: false}),
			checksVisible: new fields.BooleanField({required: true, blank: false, initial: false}),
			displayReference: new fields.BooleanField({required: true, blank: false, initial: false})
		}
	}

	addCheck(newCheck){
		if(!newCheck instanceof CheckDataModel) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		Data.saveDataModel(newCheck, constants.FLAGS.CHECKS)
		this.checks.push(newCheck.id)
		this.updateSource({checks: this.checks})
		return this
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
	

	deleteCheck(oldCheckID){
		this.checks.splice(this.checks.indexOf(oldCheckID), 1)
		Data.deleteFlag(oldCheckID, constants.FLAGS.CHECKS)
		this.updateSource({checks: this.checks})
		Data.saveDataModel(this, constants.FLAGS.INFILTRATIONOBSTACLES)
	}

	addPointCounter(newCounter){
		Data.saveDataModel(newCounter, constants.FLAGS.COUNTERS)
		this.counters.push(newCounter.id)
		this.updateSource({counters: this.counters})
		return newCounter.id;
	}
	
	deletePointCounter(oldCounter) {
		this.counters.splice(this.counters.indexOf(oldCounter),1)
		Data.deleteFlag(oldCounter, constants.FLAGS.COUNTERS)
		this.updateSource({counters: this.counters})
		Data.saveDataModel(this, constants.FLAGS.INFILTRATIONOBSTACLES)
	}
	
	getPointCounterByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.COUNTERS);
	}
	
	getPointCounters() {
		return this.checks.map( id => this.getPointCountersByID(id) );
	}
}

export class ComplicationDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			trigger: new fields.StringField({required: true, blank: false, initial: "New Trigger"}),
			checks: new fields.ArrayField(new fields.StringField()),
			description: new fields.StringField({required: true, blank: false, initial: "New Description"}),
			outcome: new fields.SchemaField({
				criticalSuccess: new fields.StringField({required: true, blank: false, initial: "Critical Success"}),
				success: new fields.StringField({required: true, blank: false, initial: "Success"}),
				failure: new fields.StringField({required: true, blank: false, initial: "Failure"}),
				criticalFailure: new fields.StringField({required: true, blank: false, initial: "Critical Failure"})
			}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "complication"}),
			checksVisible: new fields.BooleanField({required: true, blank: false, initial: false}),
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof CheckDataModel) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		this.checks.push(newCheck.id)
		Data.saveDataModel(newCheck, constants.FLAGS.CHECKS)
		this.updateSource({checks: this.checks})
		return newCheck.id;
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, constants.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
	
	deleteCheck(oldCheckID){
		this.checks.splice(this.checks.indexOf(oldCheckID), 1)
		Data.deleteFlag(oldCheckID, constants.FLAGS.CHECKS)
		this.updateSource({checks: this.checks})
		Data.saveDataModel(this, constants.FLAGS.COMPLICATIONS)
	}
}

export class ReputationDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Group"}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			reputation: new fields.StringField({required: true, blank: false, initial: constants.REPUTATIONS.LEVELS.IGNORED.LABEL}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "reputation"}),
			visible: new fields.BooleanField({required: true, blank: false, initial: false}),
			effectsVisible: new fields.BooleanField({required: true, blank: false, initial: false}),
			Revered: new fields.SchemaField({
				value: new fields.StringField({required: false, blank: true, initial: ""}),
				overrides: new fields.BooleanField({required: true, blank: false, initial: false})
			}),
			Admired: new fields.SchemaField({
				value: new fields.StringField({required: false, blank: true, initial: ""}),
				overrides: new fields.BooleanField({required: true, blank: false, initial: false})
			}),
			Liked: new fields.SchemaField({
				value: new fields.StringField({required: false, blank: true, initial: ""}),
				overrides: new fields.BooleanField({required: true, blank: false, initial: false})
			}),
			Ignored: new fields.SchemaField({
				value: new fields.StringField({required: false, blank: true, initial: ""}),
				overrides: new fields.BooleanField({required: true, blank: false, initial: false})
			}),
			Disliked: new fields.SchemaField({
				value: new fields.StringField({required: false, blank: true, initial: ""}),
				overrides: new fields.BooleanField({required: true, blank: false, initial: false})
			}),
			Hated: new fields.SchemaField({
				value: new fields.StringField({required: false, blank: true, initial: ""}),
				overrides: new fields.BooleanField({required: true, blank: false, initial: false})
			}),
			Hunted: new fields.SchemaField({
				value: new fields.StringField({required: false, blank: true, initial: ""}),
				overrides: new fields.BooleanField({required: true, blank: false, initial: false})
			})
		}
	}

	updateFromPoints() {
		this.reputation = this.getSlug("LABEL")
	}

	getSlug(slug) {
		for (const property in constants.REPUTATIONS.LEVELS){
			if(this.points >= constants.REPUTATIONS.LEVELS[property].LOWER && this.points <= constants.REPUTATIONS.LEVELS[property].UPPER){
				return constants.REPUTATIONS.LEVELS[property][slug]
			}
			if(this.points > 50) {
				return constants.REPUTATIONS.LEVELS.REVERED[slug]
			}
			if(this.points < -50) {
				return constants.REPUTATIONS.LEVELS.HUNTED[slug]
			}
		}
	}

}

export class CheckDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			checkType: new fields.StringField({required: true, blank: false, initial: "Athletics"}),
			partyLevel: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			adjustment: new fields.StringField({required: true, blank: false, initial: "STANDARD"}),
			dc: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 15}),
			calculated: new fields.BooleanField({initial: false}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "check"})
		}
	}

	calculateDC() {
		this.updateSource({dc: constants.DCS?.[this.partyLevel] + constants.ADJUSTMENTS?.[this.adjustment], calculated: true});
		return this;
	}
	
	getEnricher() {
		return `@Check[${this.checkType}|dc:${this.dc}]`;
	}
}

export class CounterDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Counter"}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "counter"})
		}
	}
}

export class ThresholdDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			thresholdValue: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			description: new fields.StringField({required: true, blank: false, initial: "New Threshold"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "threshold"})
		}
	}
}