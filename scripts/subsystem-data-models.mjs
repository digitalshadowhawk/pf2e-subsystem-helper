import * as subtype from './subsystem-data-model-subtypes.mjs';
import { Helper } from "./pf2e-subsystem-helper.mjs";
import { Data } from "./pf2e-subsystem-helper.mjs";

export class ResearchDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Research Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "research"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			libraries: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addLibrary(newLibrary) {
		if(!newLibrary instanceof subtype.Library) {
			Helper.log(true, 'Cannot add new Library - the object is not an Library')
			return null;
		}
		this.libraries.push(Data.saveDataModel(newLibrary, Helper.FLAGS.LIBRARIES))
		this.updateSource({libraries: this.libraries})
		return newLibrary.id;
	}
	
	getLibraryByID(id) {
		return new subtype.Library(Data.loadDataModel(id, Helper.FLAGS.LIBRARIES));
	}
	
	getLibraries() {
		return this.libraries.map( id => this.getLibraryByID(id) );
	}

	getMechanicName() {
		return "Library";
	}

	toHTML(){
		return this.libraries.map(element => {
			let model = this.getLibraryByID(element)
			Helper.log(true, 'subsystems Line 43')
			let entry = `<research-library class="directory-item flexcol collapsed" style="display: flex;">
				${model.toHTML()}
			</research-library>`

			return entry;
		});
	}
}

export class VictoryPointsDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Victory Points Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "victorypoints"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			counters: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addCounter(newCounter) {
		if(!newCounter instanceof subtype.Counter) {
			Helper.log(true, 'Cannot add new Counter - the object is not a Counter')
			return null;
		}
		this.counters.push(Data.saveDataModel(newCounter, Helper.FLAGS.COUNTERS))
		this.updateSource({counters: this.counters})
		return newCounter.id;
	}
	
	getCounterByID(id) {
		return new subtype.Counter(Data.loadDataModel(id, Helper.FLAGS.COUNTERS));
	}
	
	getCounter() {
		return this.counters.map( id => this.getCounterByID(id) );
	}

	getMechanicName() {
		return "Counter";
	}

	toHTML(){
		return this.counters.map(element => {
			let model = this.getCounterByID(element)
			Helper.log(true, 'subsystems Line 89')
			let entry = `<victorypoints-counter class="directory-item flexcol collapsed" style="display: flex;">
				${model.toHTML()}
			</victorypoints-counter>`

			return entry;
		});
	}
	
}

export class InfluenceDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Influence Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "influence"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			npcs: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addNPC(newNPC) {
		if(!newNPC instanceof subtype.InfluenceNPC) {
			Helper.log(true, 'Cannot add new NPC - the object is not an NPC')
			return null;
		}
		this.npcs.push(Data.saveDataModel(newNPC, Helper.FLAGS.NPCS))
		this.updateSource({npcs: this.npcs})
		return newNPC.id;
	}
	
	getNPCByID(id) {
		return new subtype.InfluenceNPC(Data.loadDataModel(id, Helper.FLAGS.NPCS));
	}
	
	getNPCs() {
		return this.npcs.map( id => this.getNPCByID(id) );
	}

	getMechanicName() {
		return "NPC";
	}

	toHTML(){
		return this.npcs.map(element => {
			let model = this.getNPCByID(element)
			Helper.log(true, 'subsystems Line 136')
			let entry = `<influence-npc class="directory-item flexcol collapsed" style="display: flex;">
				${model.toHTML()}
			</influence-npc>`

			return entry;
		});
	}
}

export class ChasesDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Chases Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "chases"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			chases: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addChase(newChase) {
		if(!newChase instanceof subtype.Chase){
			Helper.log(true, 'Cannot add new Chase - the object is not a Chase')
			return;
		}
		this.chases.push(Data.saveDataModel(newChase, Helper.FLAGS.CHASES))
		this.updateSource({chases: this.chases})
		return newChase.id;
	}
	
	getChaseByID(id) {
		return new subtype.Chase(Data.loadDataModel(id, Helper.FLAGS.CHASES));
	}
	
	getChases() {
		return this.chases.map( id => this.getChaseByID(id) );
	}

	getMechanicName() {
		return "Chase";
	}

	toHTML(){
		return this.chases.map(element => {
			let model = this.getChaseByID(element)
			Helper.log(true, 'subsystems Line 182')
			let entry = `<li class="chases-chases directory-item flexcol collapsed" style="display: flex;">
				${model.toHTML()}
			</li>`

			return entry;
		});
	}	
}

export class InfiltrationDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Infiltration Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "infiltrations"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			infiltrations: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addInfiltration(newInfiltration) {
		if(!newInfiltration instanceof subtype.Infiltration){
			Helper.log(true, 'Cannot add new Infiltration - the object is not a Infiltration')
			return;
		}
		this.infiltrations.push(Data.saveDataModel(newInfiltration, Helper.FLAGS.INFILTRATIONS))
		this.updateSource({infiltrations: this.infiltrations})
		return newInfiltration.id;
	}
	
	getInfiltrationByID(id) {
		return new subtype.Infiltration(Data.loadDataModel(id, Helper.FLAGS.INFILTRATIONS));
	}
	
	getInfiltrations() {
		return this.infiltrations.map( id => this.getInfiltrationByID(id) );
	}

	getMechanicName() {
		return "Infiltration";
	}

	toHTML(){
		return this.infiltrations.map(element => {
			let model = this.getInfiltrationByID(element)
			Helper.log(true, 'subsystems Line 228')
			let entry = `<infiltration-infiltration class="directory-item flexcol collapsed" style="display: flex;">
				${model.toHTML()}
			</infiltration-infiltration>`

			return entry;
		});
	}	
}

export class ReputationDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Reputation Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "reputations"}),
			id: new fields.StringField({required: true, blank: false, initial: Helper.generateID}),
			reputations: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addReputation(newReputation) {
		if(!newReputation instanceof subtype.Reputation){
			Helper.log(true, 'Cannot add new Reputation - the object is not a Reputation')
			return;
		}
		this.reputations.push(Data.saveDataModel(newReputation, Helper.FLAGS.REPUTATIONS))
		this.updateSource({reputations: this.reputations})
		return newReputation.id;
	}
	
	getReputationByID(id) {
		return new subtype.Reputation(Data.loadDataModel(id, Helper.FLAGS.REPUTATIONS));
	}
	
	getReputations() {
		return this.reputations.map( id => this.getReputationByID(id) );
	}

	getMechanicName() {
		return "Reputation";
	}

	toHTML(){
		return this.reputations.map(element => {
			let model = this.getReputationNyID(element)
			Helper.log(true, 'subsystem Line 274')
			let entry = `<reputation-reputation class="directory-item flexcol collapsed" style="display: flex;">
				${model.toHTML()}
			</reputation-reputation>`

			return entry;
		});
	}
	
}