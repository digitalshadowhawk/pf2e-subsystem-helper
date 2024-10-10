
import { PF2eSubsystemHelper } from "./pf2e-subsystem-helper.mjs";
import { SubsystemData } from "./pf2e-subsystem-helper.mjs";

export class Library extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			libraryName: new fields.StringField({required: true, blank: false, initial: "New Library"}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			thresholds: new fields.ArrayField(new fields.StringField()),
			sources: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
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
		const fields =foundry.data.fields;
		return {
			description: new fields.StringField({required: true, blank: false, initial: "New Source"}),
			maxRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			earnedRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			checks: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			type: new fields.StringField({required: true, blank: false, initial: "librarysource"})
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

export class InfluenceNPC extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New NPC"}),
			perception: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			will: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			thresholds: new fields.ArrayField(new fields.StringField()),
			checks: new fields.ArrayField(new fields.StringField()),
			resistances: new fields.StringField({required: false, blank: true, initial: ""}),
			weaknesses: new fields.StringField({required: false, blank: true, initial: ""}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
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
}

export class Chase extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Chase"}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 1}),
			obstacles: new fields.ArrayField(new fields.StringField()),
			objective: new fields.StringField({required: true, blank: false, initial: "Survive"}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			type: new fields.StringField({required: true, blank: false, initial: "chase"})
		}
	}
	
	addObstacle(newObstacle) {
		if(!newObstacle instanceof Obstacle) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Obstacle - the object is not an Obstacle')
			return;
		}
		const id = this.obstacles.push(SubsystemData.saveDataModel(newObstacle, PF2eSubsystemHelper.FLAGS.OBSTACLES))
		this.updateObstacle({obstacles: this.obstacles})
		return id;
	}
	
	getObstacleByID(id) {
		return SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.OBSTACLES);
	}
	
	getObstacles() {
		return this.obstacles.map( id => this.getObstacleByID(id) );
	}
}

export class Obstacle extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Obstacle"}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 1}),
			checks: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			type: new fields.StringField({required: true, blank: false, initial: "obstacle"})
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

export class Check extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			checkType: new fields.StringField({required: true, blank: false, initial: "Athletics"}),
			dc: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 10}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			type: new fields.StringField({required: true, blank: false, initial: "check"})
		}
	}
	
	getEnricher() {
		return "@Check[type:"+this.checkType+"|dc:"+this.dc+"]";
	}
}

export class Counter extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Counter"}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			type: new fields.StringField({required: true, blank: false, initial: "counter"})
		}
	}
}

export class Threshold extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			thresholdValue: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			description: new fields.StringField({required: true, blank: false, initial: "New Threshold"}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			type: new fields.StringField({required: true, blank: false, initial: "threshold"})
		}
	}
}