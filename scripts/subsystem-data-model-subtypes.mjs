
import { PF2eSubsystemHelper } from "./pf2e-subsystem-helper.mjs";
import { SubsystemData } from "./pf2e-subsystem-helper.mjs";

export class Library extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			libraryName: new fields.StringField({required: true, blank: false, initial: "New Library"}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			thresholds: new fields.ArrayField(new fields.StringField()),
			sources: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "library"})
		}
	}
	
	addThreshold(newThreshold) {
		if(!newThreshold instanceof Threshold) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Library Threshold - the object is not a Threshold')
			return null;
		}
		const id = this.thresholds.push(SubsystemData.saveDataModel(newThreshold, PF2eSubsystemHelper.FLAGS.THRESHOLDS))
		this.updateSource({thresholds: this.thresholds})
		return id;
	}
	
	getThresholdByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.THRESHOLDS);
	}
	
	getThresholds() {
		return this.thresholds.map( id => this.getThresholdByID(id) );
	}
	
	addSource(newSource) {
		if(!newSource instanceof LibrarySource) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Library Source - the object is not a Library Source')
			return null;
		}
		const id = this.sources.push(SubsystemData.saveDataModel(newSource, PF2eSubsystemHelper.FLAGS.SOURCES))
		this.updateSource({sources: this.sources})
		return id;
	}
	
	getSourceByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.SOURCES);
	}
	
	getSources() {
		return this.sources.map( id => this.getSourceByID(id) );
	}
}

export class LibrarySource extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			description: new fields.StringField({required: true, blank: false, initial: "New Source"}),
			maxRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			earnedRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			checks: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "librarysource"})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		//PF2eSubsystemHelper.log(true, this.checks)
		const id = this.checks.push(SubsystemData.saveDataModel(newCheck, PF2eSubsystemHelper.FLAGS.CHECKS))
		//PF2eSubsystemHelper.log(true, this.checks)
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
}

export class InfluenceNPC extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New NPC"}),
			perception: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			will: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			thresholds: new fields.ArrayField(new fields.StringField()),
			discoveries: new fields.ArrayField(new fields.StringField()),
			checks: new fields.ArrayField(new fields.StringField()),
			resistances: new fields.StringField({required: false, blank: true, initial: ""}),
			weaknesses: new fields.StringField({required: false, blank: true, initial: ""}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "influencenpc"})
		}
	}
	
	addThreshold(newThreshold) {
		if(!newThreshold instanceof Threshold) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Library Threshold - the object is not a Threshold')
			return null;
		}
		const id = this.thresholds.push(SubsystemData.saveDataModel(newThreshold, PF2eSubsystemHelper.FLAGS.THRESHOLDS))
		this.updateSource({thresholds: this.thresholds})
		return id;
	}
	
	getThresholdByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.THRESHOLDS);
	}
	
	getThresholds() {
		return this.thresholds.map( id => this.getThresholdByID(id) );
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.checks.push(SubsystemData.saveDataModel(newCheck, PF2eSubsystemHelper.FLAGS.CHECKS))
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
	
	addDiscoveryCheck(newDiscovery) {
		if(!newDiscovery instanceof Check) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Discovery Check - the object is not a Check')
			return;
		}
		const id = this.discoveries.push(SubsystemData.saveDataModel(newDiscovery, PF2eSubsystemHelper.FLAGS.CHECKS))
		this.updateSource({discoveries: this.discoveries})
		return id;
	}
	
	getDiscoveryCheckByID(id) {
		return getCheckByID(id);
	}
	
	getDicoveryChecks() {
		return this.discoveries.map( id => this.getCheckByID(id) );
	}
}

export class Chase extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Chase"}),
			obstacles: new fields.ArrayField(new fields.StringField()),
			objective: new fields.StringField({required: true, blank: false, initial: "Survive"}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "chase"})
		}
	}
	
	addObstacle(newObstacle) {
		if(!newObstacle instanceof ChaseObstacle) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Chase Obstacle - the object is not an Chase Obstacle')
			return;
		}
		const id = this.obstacles.push(SubsystemData.saveDataModel(newObstacle, PF2eSubsystemHelper.FLAGS.CHASEOBSTACLES))
		this.updateSource({obstacles: this.obstacles})
		return id;
	}
	
	getObstacleByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHASEOBSTACLES);
	}
	
	getObstacles() {
		return this.obstacles.map( id => this.getObstacleByID(id) );
	}
}

export class ChaseObstacle extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Obstacle"}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 1}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			goal: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 1}),
			checks: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "chaseobstacle"})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.checks.push(SubsystemData.saveDataModel(newCheck, PF2eSubsystemHelper.FLAGS.CHECKS))
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
}

export class Infiltration extends foundry.abstract.DataModel {
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
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "infiltration"})
		}
	}
	
	addObjective(newObjective) {
		this.objectives.push(newObjective)
		this.updateSource({objectives: this.objectives})
	}
	
	getObjectives() {
		return this.objectives;
	}
	
	addObstacle(newObstacle) {
		if(!newObstacle instanceof InfiltrationObstacle) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Infiltration Obstacle - the object is not an Infiltration Obstacle')
			return;
		}
		const id = this.obstacles.push(SubsystemData.saveDataModel(newObstacle, PF2eSubsystemHelper.FLAGS.INFILTRATIONOBSTACLES))
		this.updateSource({obstacles: this.obstacles})
		return id;
	}
	
	getObstacleByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.INFILTRATIONOBSTACLES);
	}
	
	getObstacles() {
		return this.obstacles.map( id => this.getObstacleByID(id) );
	}
	
	addAwarenessThreshold(newThreshold) {
		if(!newThreshold instanceof Threshold) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Infiltration Threshold - the object is not a Threshold')
			return null;
		}
		const id = this.awarenessThresholds.push(SubsystemData.saveDataModel(newThreshold, PF2eSubsystemHelper.FLAGS.THRESHOLDS))
		this.updateSource({awarenessThresholds: this.awarenessThresholds})
		return id;
	}
	
	getAwarenessThresholdByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.THRESHOLDS);
	}
	
	getAwarenessThresholds() {
		return this.awarenessThresholds.map( id => this.getAwarenessThresholdByID(id) );
	}
	
	addComplication(newComplication) {
		if(!newComplication instanceof Complication) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Complication - the object is not a Complication')
			return null;
		}
		const id = this.complications.push(SubsystemData.saveDataModel(newComplication, PF2eSubsystemHelper.FLAGS.COMPLICATIONS))
		this.updateSource({complications: this.complications})
		return id;
	}
	
	getComplicationByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.COMPLICATIONS);
	}
	
	getComplications() {
		return this.complications.map( id => this.getComplicationByID(id) );
	}
	
	addOpportunity(newOpportunity) {
		this.opportunities.push(newOpportunity)
		this.updateSource({opportunities: this.opportunities})
	}
	
	getOpportunities() {
		return this.opportunities;
	}
}

export class InfiltrationObstacle extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			goal: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 2}),
			goalType: new fields.StringField({required: true, blank: false, initial: "group"}),
			checks: new fields.ArrayField(new fields.StringField()),
			description: new fields.StringField({required: true, blank: false, initial: "New Description"}),
			outcome: new fields.SchemaField({
				criticalSuccess: new fields.StringField({required: true, blank: false, initial: "The PC gains 2 Infiltration Points."}),
				success: new fields.StringField({required: true, blank: false, initial: "The PC gains 1 Infiltration Point."}),
				failure: new fields.StringField({required: true, blank: false, initial: "The PCs accrue 1 Awareness Point."}),
				criticalFailure: new fields.StringField({required: true, blank: false, initial: "The PCs accrue 2 Awareness Points."})
			}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "infiltrationobstacle"})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.checks.push(SubsystemData.saveDataModel(newCheck, PF2eSubsystemHelper.FLAGS.CHECKS))
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
}

export class Complication extends foundry.abstract.DataModel {
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
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "complication"})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.checks.push(SubsystemData.saveDataModel(newCheck, PF2eSubsystemHelper.FLAGS.CHECKS))
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
}

export class Reputation extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Group"}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			reputation: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.REPUTATIONS.LEVELS.IGNORED.LABEL}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "reputation"})
		}
	}

	updateFromPoints() {

	}
}

export class Check extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			checkType: new fields.StringField({required: true, blank: false, initial: "Athletics"}),
			partyLevel: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			adjustment: new fields.StringField({required: true, blank: false, initial: "STANDARD"}),
			dc: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 15}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "check"})
		}
	}

	calculateDC() {
		this.updateSource({dc: PF2eSubsystemHelper.DCS?.[this.partyLevel] + PF2eSubsystemHelper.ADJUSTMENTS?.[this.adjustment]});
		return this;
	}
	
	getEnricher() {
		return "@Check[type:"+this.checkType+"|dc:"+this.dc+"]";
	}
}

export class Counter extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Counter"}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "counter"})
		}
	}
}

export class Threshold extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			thresholdValue: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			description: new fields.StringField({required: true, blank: false, initial: "New Threshold"}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "threshold"})
		}
	}
}