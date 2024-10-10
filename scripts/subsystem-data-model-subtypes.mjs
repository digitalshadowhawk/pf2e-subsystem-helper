
import { PF2eSubsystemHelper } from "./pf2e-subsystem-helper.mjs";
import { SubsystemData } from "./pf2e-subsystem-helper.mjs";

export class Library extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			libraryName: new fields.StringField({required: true, blank: false}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false}),
			thresholds: new fields.ArrayField(new fields.StringField()),
			sources: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false})
		}
	}
	
	constructor(name = "New Library", newLevel = 1, newPoints = 1, newid = foundry.utils.randomID(16), existingThresholds = [], existingSources = []) {
		super({libraryName: name, level: newLevel, points: newPoints, id: newid, thresholds: existingThresholds, sources: existingSources})
	}
	
	reinstantiate(){
		this.thresholds.forEach(loadThreshold);
		this.sources.forEach(loadSource);
		
		function loadThreshold(threshold, index, arr) {
			arr[index] = new Threshold(threshold.thresholdValue, threshold.description, threshold.id);
		}
		
		function loadSource(source, index, arr) {
			arr[index] = new LibrarySource(source.description, source.maxRP, source.earnedRP, source.id, source.checks).reinstantiate();
		}
		
		return this;
	}
	
	addThreshold(newThreshold) {
		if(!newThreshold instanceof Threshold) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Library Threshold - the object is not a Threshold')
			return null;
		}
		return this.thresholds.push(SubsystemData.saveDataModel(newThreshold, PF2eSubsystemHelper.FLAGS.THRESHOLDS));
	}
	
	getThresholdByID(id) {
		return new Threshold(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.THRESHOLDS));
	}
	
	addSource(newSource) {
		if(!newSource instanceof LibrarySource) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Library Source - the object is not a Library Source')
			return null;
		}
		return this.sources.push(SubsystemData.saveDataModel(newSource, PF2eSubsystemHelper.FLAGS.SOURCES));
	}
	
	getSourceByID(id) {
		return new LibrarySource(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.SOURCES));
	}
}

export class LibrarySource extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			description: new fields.StringField({required: true, blank: false}),
			maxRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			earnedRP: new fields.NumberField({required: true, nullable: false, integer: true, positive: false}),
			checks: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false})
		}
	}
	
	constructor(newDescription = "New Description", max = 5, earned = 1, newid = foundry.utils.randomID(16), existingChecks = []) {
		super({description: newDescription, maxRP: max, earnedRP: earned, id: newid, checks: existingChecks})
	}
	
	reinstantiate(){
		this.checks.forEach(loadCheck);
		
		function loadCheck(check, index, arr) {
			arr[index] = new Check(check.type, check.dc, check.id);
		}
		
		return this;
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		return this.checks.push(SubsystemData.saveDataModel(newCheck, PF2eSubsystemHelper.FLAGS.CHECKS));
	}
	
	getCheckByID(id) {
		return new Check(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHECKS));
	}
}

export class InfluenceNPC extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false}),
			perception: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			will: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			thresholds: new fields.ArrayField(new fields.StringField()),
			checks: new fields.ArrayField(new fields.StringField()),
			resistances: new fields.StringField({required: false, blank: true}),
			weaknesses: new fields.StringField({required: false, blank: true}),
			id: new fields.StringField({required: true, blank: false})
		}
	}
	
	constructor(newName = "New NPC", newPerception = 1, newWill = 1, newid = foundry.utils.randomID(16), existingThresholds = [], existingChecks = [], resistances = "", weaknesses = "") {
		super({name: newName, perception: newPerception, will: newWill, id: newid, thresholds: existingThresholds, checks: existingChecks, resistances, weaknesses})
	}
	
	reinstantiate() {
		this.thresholds.forEach(loadThreshold);
		this.checks.forEach(loadCheck);
		
		function loadThreshold(threshold, index, arr) {
			arr[index] = new Threshold(threshold.thresholdValue, threshold.description, threshold.id);
		}
		
		function loadCheck(check, index, arr) {
			arr[index] = new Check(check.type, check.dc, check.id);
		}
		
		return this;
	}
	
	addThreshold(newThreshold) {
		if(!newThreshold instanceof Threshold) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Threshold - the object is not an Threshold')
			return;
		}
		return this.thresholds.push(SubsystemData.saveDataModel(newThreshold, PF2eSubsystemHelper.FLAGS.THRESHOLDS));
	}
	
	getThresholdByID(id) {
		return new Threshold(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.THRESHOLDS));
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		return this.checks.push(SubsystemData.saveDataModel(newCheck, PF2eSubsystemHelper.FLAGS.CHECKS));
	}
	
	getCheckByID(id) {
		return new Check(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHECKS));
	}
}



export class Chase extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			obstacles: new fields.ArrayField(new fields.StringField()),
			objective: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false})
		}
	}
	
	constructor(newName = "New Chase", newLevel = 1, newid = foundry.utils.randomID(16), newObjective = "Survive", existingObstacles = []) {
		super({name: newName, level: newLevel, id: newid, objective: newObjective, obstacles: existingObstacles})
	}
	
	reinstantiate() {
		this.obstacles.forEach(loadObstacle);
		
		function loadObstacle(obstacle, index, arr) {
			arr[index] = new Obstacle(obstacle.name, obstacle.level, obstacle.id, obstacle.checks);
		}
		
		return this;
	}
	
	addObstacle(newObstacle) {
		if(!newObstacle instanceof Obstacle) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Obstacle - the object is not an Obstacle')
			return;
		}
		return this.obstacles.push(SubsystemData.saveDataModel(newObstacle, PF2eSubsystemHelper.FLAGS.OBSTACLES));
	}
	
	getObstacleByID(id) {
		return new Obstacle(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.OBSTACLES));
	}
}

export class Obstacle extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			checks: new fields.ArrayField(new fields.StringField()),
			id: new fields.SringField({required: true, blank: false})
		}
	}
	
	constructor(newName = "New Obstacle", newLevel = 1, newid = foundry.utils.randomID(16), existingChecks = []) {
		super({name: newName, level: newLevel, id: newid, checks: existingChecks})
	}
	
	reinstantiate(){
		this.checks.forEach(loadCheck);
		
		function loadCheck(check, index, arr) {
			arr[index] = new Check(check.type, check.dc, check.id);
		}
		
		return this;
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		return this.checks.push(SubsystemData.saveDataModel(newCheck, PF2eSubsystemHelper.FLAGS.CHECKS));
	}
	
	getCheckByID(id) {
		return new Check(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHECKS));
	}
}

export class Check extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			type: new fields.StringField({required: true, blank: false}),
			dc: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			id: new fields.StringField({required: true, blank: false})
		}
	}
	
	constructor(newType = "Athletics", newDC = 10, newID = PF2eSubsystemHelper.generateID()) {
		super({type: newType, dc: newDC, id: newID})
	}
	
	getEnricher() {
		return "@Check[type:"+this.type+"|dc:"+this.dc+"]";
	}
}

export class Counter extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			id: new fields.StringField({required: true, blank: false})
		}
	}
	
	constructor(newName = "Counter", points = 1, newID) {
		super({name: newName, points: newPoints, id: newID})
	}
}

export class Threshold extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields =foundry.data.fields;
		return {
			thresholdValue: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
			description: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false})
		}
	}
	
	constructor(value = 1, newDescription = "New Description", newid = foundry.utils.randomID(16)) {
		super({thresholdValue: value, description: newDescription,  id: newid})
	}
}