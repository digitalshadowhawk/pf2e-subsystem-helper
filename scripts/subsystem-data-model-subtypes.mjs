
import { Helper } from "./pf2e-subsystem-helper.mjs";
import { Data } from "./pf2e-subsystem-helper.mjs";

export class Library extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			libraryName: new fields.StringField({required: true, blank: false, initial: "New Library"}),
			level: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			thresholds: new fields.ArrayField(new fields.StringField()),
			sources: new fields.ArrayField(new fields.StringField()),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "library"})
		}
	}
	
	addThreshold(newThreshold) {
		if(!newThreshold instanceof Threshold) {
			Helper.log(true, 'Cannot add new Library Threshold - the object is not a Threshold')
			return null;
		}
		const id = this.thresholds.push(Data.saveDataModel(newThreshold, Helper.FLAGS.THRESHOLDS))
		this.updateSource({thresholds: this.thresholds})
		return id;
	}
	
	getThresholdByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.THRESHOLDS);
	}
	
	getThresholds() {
		return this.thresholds.map( id => this.getThresholdByID(id) );
	}
	
	addSource(newSource) {
		if(!newSource instanceof LibrarySource) {
			Helper.log(true, 'Cannot add new Library Source - the object is not a Library Source')
			return null;
		}
		const id = this.sources.push(Data.saveDataModel(newSource, Helper.FLAGS.SOURCES))
		this.updateSource({sources: this.sources})
		return id;
	}
	
	getSourceByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.SOURCES);
	}
	
	getSources() {
		return this.sources.map( id => this.getSourceByID(id) );
	}

	toHTML(){
		let output = `<h3>${this.libraryName}</h3>
		<div>Level: ${this.level}</div>
		<div>Points: ${this.points}</div>
		${this.thresholds.map(element=> {
			Helper.log(true, 'subtypes Line 61')
			return Data.loadDataModel(element,Helper.FLAGS.THRESHOLDS).toHTML()
		}).join("")}
		${this.sources.map(element=> {
			Helper.log(true, 'subtypes Line 65')
			return Data.loadDataModel(element,Helper.FLAGS.SOURCES).toHTML()
		}).join("")}
		`
		return output;
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
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "librarysource"})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.checks.push(Data.saveDataModel(newCheck, Helper.FLAGS.CHECKS))
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}

	toHTML(){
		let output = `<h3>${this.description}</h3>
		<div>Earned RP: ${this.earnedRP}</div>
		<div>Max RP: ${this.maxRP}</div>
		${this.checks.map(element=> {
			Helper.log(true, 'subtypes Line 109')
			return Data.loadDataModel(element,Helper.FLAGS.CHECKS).toHTML()
		}).join("")}
		`
		return output;
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
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "influencenpc"})
		}
	}
	
	addThreshold(newThreshold) {
		if(!newThreshold instanceof Threshold) {
			Helper.log(true, 'Cannot add new Library Threshold - the object is not a Threshold')
			return null;
		}
		const id = this.thresholds.push(Data.saveDataModel(newThreshold, Helper.FLAGS.THRESHOLDS))
		this.updateSource({thresholds: this.thresholds})
		return id;
	}
	
	getThresholdByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.THRESHOLDS);
	}
	
	getThresholds() {
		return this.thresholds.map( id => this.getThresholdByID(id) );
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.checks.push(Data.saveDataModel(newCheck, Helper.FLAGS.CHECKS))
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
	
	addDiscoveryCheck(newDiscovery) {
		if(!newDiscovery instanceof Check) {
			Helper.log(true, 'Cannot add new Discovery Check - the object is not a Check')
			return;
		}
		const id = this.discoveries.push(Data.saveDataModel(newDiscovery, Helper.FLAGS.CHECKS))
		this.updateSource({discoveries: this.discoveries})
		return id;
	}
	
	getDiscoveryCheckByID(id) {
		return getCheckByID(id);
	}
	
	getDicoveryChecks() {
		return this.discoveries.map( id => this.getCheckByID(id) );
	}

	toHTML(){
		let output = `<h3>${this.name}</h3>
		<div>Perception: +${this.perception}</div>
		<div>Will: +${this.will}</div>
		<div>Resistances: ${this.resistances}</div>
		<div>Weaknesses: ${this.weaknesses}</div>
		${this.thresholds.map(element=> {
			Helper.log(true, 'subtypes Line 195')
			return Data.loadDataModel(element,Helper.FLAGS.THRESHOLDS).toHTML()
		}).join("")}
		${this.discoveries.map(element=> {
			Helper.log(true, 'subtypes Line 199')
			return Data.loadDataModel(element,Helper.FLAGS.CHECKS).toHTML()
		}).join("")}
		${this.checks.map(element=> {
			Helper.log(true, 'subtypes Line 203')
			return Data.loadDataModel(element,Helper.FLAGS.CHECKS).toHTML()
		}).join("")}
		`
		return output;
	}
}

export class Chase extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Chase"}),
			obstacles: new fields.ArrayField(new fields.StringField()),
			objective: new fields.StringField({required: true, blank: false, initial: "Survive"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "chase"})
		}
	}
	
	addObstacle(newObstacle) {
		if(!newObstacle instanceof ChaseObstacle) {
			Helper.log(true, 'Cannot add new Chase Obstacle - the object is not an Chase Obstacle')
			return;
		}
		const id = this.obstacles.push(Data.saveDataModel(newObstacle, Helper.FLAGS.CHASEOBSTACLES))
		this.updateSource({obstacles: this.obstacles})
		return id;
	}
	
	getObstacleByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.CHASEOBSTACLES);
	}
	
	getObstacles() {
		return this.obstacles.map( id => this.getObstacleByID(id) );
	}

	toHTML(){
		let output = `<header class="flexrow" style="position: relative;">
			<h3 class="noborder">${this.name}</h3>
		</header>
		<ol class="subdirectory">
		<li class="directory-item flexrow">Objective: ${this.objective}</li>
		${this.obstacles.map(element=> {
			Helper.log(true, 'subtypes Line 245')
			return `<li class="directory-item flexcol">` + Data.loadDataModel(element,Helper.FLAGS.CHASEOBSTACLES).toHTML()+ `</li>`
		}).join("")}
		</ol>
		`
		return output;
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
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "chaseobstacle"})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.checks.push(Data.saveDataModel(newCheck, Helper.FLAGS.CHECKS))
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}

	toHTML(){
		let output = `<h3>${this.name}</h3><div class="flexrow"><div class="flexcol">
		<div>Level: ${this.level}</div>
		<div class="flexrow">
		<div>Points: ${this.points}</div>
		<div>Goal: ${this.goal}</div></div></div>
		<div class="flexcol">${this.checks.map(element=> {
			Helper.log(true, 'subtypes Line 291')
			return Data.loadDataModel(element,Helper.FLAGS.CHECKS).toHTML()
		}).join("")}</div></div>
		`
		return output;
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
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
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
			Helper.log(true, 'Cannot add new Infiltration Obstacle - the object is not an Infiltration Obstacle')
			return;
		}
		const id = this.obstacles.push(Data.saveDataModel(newObstacle, Helper.FLAGS.INFILTRATIONOBSTACLES))
		this.updateSource({obstacles: this.obstacles})
		return id;
	}
	
	getObstacleByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.INFILTRATIONOBSTACLES);
	}
	
	getObstacles() {
		return this.obstacles.map( id => this.getObstacleByID(id) );
	}
	
	addAwarenessThreshold(newThreshold) {
		if(!newThreshold instanceof Threshold) {
			Helper.log(true, 'Cannot add new Infiltration Threshold - the object is not a Threshold')
			return null;
		}
		const id = this.awarenessThresholds.push(Data.saveDataModel(newThreshold, Helper.FLAGS.THRESHOLDS))
		this.updateSource({awarenessThresholds: this.awarenessThresholds})
		return id;
	}
	
	getAwarenessThresholdByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.THRESHOLDS);
	}
	
	getAwarenessThresholds() {
		return this.awarenessThresholds.map( id => this.getAwarenessThresholdByID(id) );
	}
	
	addComplication(newComplication) {
		if(!newComplication instanceof Complication) {
			Helper.log(true, 'Cannot add new Complication - the object is not a Complication')
			return null;
		}
		const id = this.complications.push(Data.saveDataModel(newComplication, Helper.FLAGS.COMPLICATIONS))
		this.updateSource({complications: this.complications})
		return id;
	}
	
	getComplicationByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.COMPLICATIONS);
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

	toHTML(){
		let output = `<h3>${this.name}</h3>
		<div>Awareness Points: ${this.awarenessPoints}</div>
		<div>Edge Points: ${this.edgePoints}</div>
		<div>Goal: ${this.goal}</div>
		<div>Objectives</div>
		${this.objectives.map(element=> {
			return `<div>Objective: ${element}</div>`
		}).join("")}
		${this.opportunities.map(element=> {
			return `<div>Opportunity: ${element}</div>`
		}).join("")}
		${this.obstacles.map(element=> {
			Helper.log(true, 'subtypes Line 401')
			return Data.loadDataModel(element,Helper.FLAGS.INFILTRATIONOBSTACLES).toHTML()
		}).join("")}
		${this.awarenessThresholds.map(element=> {
			Helper.log(true, 'subtypes Line 405')
			return Data.loadDataModel(element,Helper.FLAGS.THRESHOLDS).toHTML()
		}).join("")}
		${this.complications.map(element=> {
			Helper.log(true, 'subtypes Line 409')
			return Data.loadDataModel(element,Helper.FLAGS.COMPLICATIONS).toHTML()
		}).join("")}
		`
		return output;
	}
}

export class InfiltrationObstacle extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			goal: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 2}),
			goalType: new fields.StringField({required: true, blank: false, initial: "group"}),
			infiltrationPoints: new fields.ArrayField(new fields.StringField()),
			checks: new fields.ArrayField(new fields.StringField()),
			description: new fields.StringField({required: true, blank: false, initial: "New Description"}),
			outcome: new fields.SchemaField({
				criticalSuccess: new fields.StringField({required: true, blank: false, initial: "The PC gains 2 Infiltration Points."}),
				success: new fields.StringField({required: true, blank: false, initial: "The PC gains 1 Infiltration Point."}),
				failure: new fields.StringField({required: true, blank: false, initial: "The PCs accrue 1 Awareness Point."}),
				criticalFailure: new fields.StringField({required: true, blank: false, initial: "The PCs accrue 2 Awareness Points."})
			}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "infiltrationobstacle"})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.checks.push(Data.saveDataModel(newCheck, Helper.FLAGS.CHECKS))
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}
	
	addPointCounter(newCounter) {
		if(!newCounter instanceof Counter) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.infiltrationPoints.push(Data.saveDataModel(newCounter, Helper.FLAGS.COUNTERS))
		this.updateSource({infiltrationPoints: this.infiltrationPoints})
		return id;
	}
	
	getPointCounterByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.COUNTERS);
	}
	
	getPointCounters() {
		return this.checks.map( id => this.getPointCountersByID(id) );
	}

	generatePointCounters(partySheet) {
		if(this.goalType==="group"){
			this.infiltrationPoints = [new Counter({name: "Player 1"})]
		} else if(this.goalType==="individual") {
			this.infiltrationPoints = [new Counter({name: "Player 1"}), new Counter({name: "Player 2"}), new Counter({name: "Player 3"}), new Counter({name: "Player 4"})]
		}
	}

	toHTML(){
		let output = `<h3>${this.description}</h3>
		<div>Points: ${this.points}</div>
		<div>Goal: ${this.goal} (${this.goalType})</div>
		<div>Objectives</div>
		${this.infiltrationPoints.map(element=> {
			Helper.log(true, 'subtypes Line 488')
			return Data.loadDataModel(element,Helper.FLAGS.INFILTRATIONPOINTS).toHTML()
		}).join("")}
		${this.checks.map(element=> {
			Helper.log(true, 'subtypes Line 492')
			return Data.loadDataModel(element,Helper.FLAGS.CHECKS).toHTML()
		}).join("")}
		<div>Critical Success: ${this.outcome.criticalSuccess}</div>
		<div>Success: ${this.outcome.success}</div>
		<div>Failure: ${this.outcome.failure}</div>
		<div>Critical Failure: ${this.outcome.criticalFailure}</div>
		`
		return output;
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
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "complication"})
		}
	}
	
	addCheck(newCheck) {
		if(!newCheck instanceof Check) {
			Helper.log(true, 'Cannot add new Check - the object is not a Check')
			return;
		}
		const id = this.checks.push(Data.saveDataModel(newCheck, Helper.FLAGS.CHECKS))
		this.updateSource({checks: this.checks})
		return id;
	}
	
	getCheckByID(id) {
		return Data.loadDataModel(id, Helper.FLAGS.CHECKS);
	}
	
	getChecks() {
		return this.checks.map( id => this.getCheckByID(id) );
	}

	toHTML(){
		let output = `<h3>Trigger: ${this.trigger}</h3>
		<div>Description: ${this.descriiption}</div>
		${this.checks.map(element=> {
			Helper.log(true, 'subtypes Line 544')
			return Data.loadDataModel(element,Helper.FLAGS.CHECKS).toHTML()
		}).join("")}
		<div>Critical Success: ${this.outcome.criticalSuccess}</div>
		<div>Success: ${this.outcome.success}</div>
		<div>Failure: ${this.outcome.failure}</div>
		<div>Critical Failure: ${this.outcome.criticalFailure}</div>
		`
		return output;
	}
}

export class Reputation extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Group"}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			reputation: new fields.StringField({required: true, blank: false, initial: Helper.REPUTATIONS.LEVELS.IGNORED.LABEL}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "reputation"})
		}
	}

	updateFromPoints() {

	}

	toHTML(){
		let output = `<h3>Group: ${this.name}</h3>
		<div>Points: ${this.points} (${this.reputation})</div>
		`
		return output;
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
			calculated: new fields.BooleanField({initial: false}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "check"})
		}
	}

	calculateDC() {
		this.updateSource({dc: Helper.DCS?.[this.partyLevel] + Helper.ADJUSTMENTS?.[this.adjustment], calculated: true});
		return this;
	}
	
	getEnricher() {
		return "@Check[type:"+this.checkType+"|dc:"+this.dc+"]";
	}

	toHTML(){
		let output = ``
		if(this.calculated){
			//output = `<div>${this.getEnricher()} (${this.adjustment} Level ${this.partyLevel} DC)</div>`
			output = `<div>DC ${this.dc} ${this.checkType} Check (${this.adjustment} Level ${this.partyLevel} DC)</div>`
		} else {
			//output =`<div>${this.getEnricher()}</div>`
			output =`<div>DC ${this.dc} ${this.checkType} Check</div>`
		}
		return output;
	}
}

export class Counter extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			name: new fields.StringField({required: true, blank: false, initial: "New Counter"}),
			points: new fields.NumberField({required: true, nullable: false, integer: true, positive: false, initial: 0}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "counter"})
		}
	}

	toHTML(){
		let output = `<div>${this.name}: ${this.points}</div>`
		return output;
	}
}

export class Threshold extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			thresholdValue: new fields.NumberField({required: true, nullable: false, integer: true, positive: true, initial: 1}),
			description: new fields.StringField({required: true, blank: false, initial: "New Threshold"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			type: new fields.StringField({required: true, blank: false, initial: "threshold"})
		}
	}

	toHTML(){
		let output = `<div>${this.thresholdValue}: ${this.description}</div>`
		return output;
	}
}