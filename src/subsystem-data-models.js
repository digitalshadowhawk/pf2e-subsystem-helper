import * as subtype from './subsystem-data-model-subtypes.js';
import { Helper } from "./pf2e-subsystem-helper.js";
import { Data } from "./pf2e-subsystem-helper.js";
import { constants } from './constants.js';

export class ResearchDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Research Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "research"}),
			id: new fields.StringField({required: true, blank: false, initial: 'research'}),
			libraries: new fields.ArrayField(new fields.StringField()),
			visible: new fields.BooleanField({required: true, blank: false, initial: false})
		}
	}
	
	addLibrary(newLibrary) {
		if(!newLibrary instanceof subtype.LibraryDataModel) {
			Helper.log(true, 'Cannot add new Library - the object is not an Library')
			return null;
		}
		this.libraries.push(newLibrary.id)
		Data.saveDataModel(newLibrary, constants.FLAGS.LIBRARIES)
		this.updateSource({libraries: this.libraries})
		return newLibrary.id;
	}
	
	getLibraryByID(id) {
		return new subtype.LibraryDataModel(Data.loadDataModel(id, constants.FLAGS.LIBRARIES));
	}
	
	getLibraries() {
		return this.libraries.map( id => this.getLibraryByID(id) );
	}

	getMechanicName() {
		return "Library";
	}
}

export class VictoryPointsDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Victory Points Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "victorypoints"}),
			id: new fields.StringField({required: true, blank: false, initial: 'victorypoints'}),
			counters: new fields.ArrayField(new fields.StringField()),
			visible: new fields.BooleanField({required: true, blank: false, initial: false})
		}
	}
	
	addCounter(newCounter) {
		if(!newCounter instanceof subtype.CounterDataModel) {
			Helper.log(true, 'Cannot add new Counter - the object is not a Counter')
			return null;
		}
		this.counters.push(newCounter.id)
		Data.saveDataModel(newCounter, constants.FLAGS.COUNTERS)
		this.updateSource({counters: this.counters})
		return newCounter.id;
	}
	
	getCounterByID(id) {
		return new subtype.CounterDataModel(Data.loadDataModel(id, constants.FLAGS.COUNTERS));
	}
	
	getCounter() {
		return this.counters.map( id => this.getCounterByID(id) );
	}

	getMechanicName() {
		return "Counter";
	}
}

export class InfluenceDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Influence Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "influence"}),
			id: new fields.StringField({required: true, blank: false, initial: 'influence'}),
			npcs: new fields.ArrayField(new fields.StringField()),
			visible: new fields.BooleanField({required: true, blank: false, initial: false})
		}
	}
	
	addNPC(newNPC) {
		if(!newNPC instanceof subtype.InfluenceNPCDataModel) {
			Helper.log(true, 'Cannot add new NPC - the object is not an NPC')
			return null;
		}
		this.npcs.push(newNPC.id)
		Data.saveDataModel(newNPC, constants.FLAGS.NPCS)
		this.updateSource({npcs: this.npcs})
		return newNPC.id;
	}
	
	getNPCByID(id) {
		return new subtype.InfluenceNPCDataModel(Data.loadDataModel(id, constants.FLAGS.NPCS));
	}
	
	getNPCs() {
		return this.npcs.map( id => this.getNPCByID(id) );
	}

	getMechanicName() {
		return "NPC";
	}
}

export class ChasesDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Chases Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "chases"}),
			id: new fields.StringField({required: true, blank: false, initial: 'chases'}),
			chases: new fields.ArrayField(new fields.StringField()),
			visible: new fields.BooleanField({required: true, blank: false, initial: false})
		}
	}
	
	addChase(newChase) {
		if(!newChase instanceof subtype.ChaseDataModel){
			Helper.log(true, 'Cannot add new Chase - the object is not a Chase')
			return;
		}
		this.chases.push(newChase.id)
		Data.saveDataModel(newChase, constants.FLAGS.CHASES)
		this.updateSource({chases: this.chases})
		return newChase.id;
	}
	
	getChaseByID(id) {
		return new subtype.ChaseDataModel(Data.loadDataModel(id, constants.FLAGS.CHASES));
	}
	
	getChases() {
		return this.chases.map( id => this.getChaseByID(id) );
	}

	getMechanicName() {
		return "Chase";
	}
}

export class InfiltrationDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Infiltration Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "infiltrations"}),
			id: new fields.StringField({required: true, blank: false, initial: 'infiltration'}),
			infiltrations: new fields.ArrayField(new fields.StringField()),
			visible: new fields.BooleanField({required: true, blank: false, initial: false})
		}
	}
	
	addInfiltration(newInfiltration) {
		if(!newInfiltration instanceof subtype.InfiltrationDataModel){
			Helper.log(true, 'Cannot add new Infiltration - the object is not a Infiltration')
			return;
		}
		this.infiltrations.push(newInfiltration.id)
		Data.saveDataModel(newInfiltration, constants.FLAGS.INFILTRATIONS)
		this.updateSource({infiltrations: this.infiltrations})
		return newInfiltration.id;
	}
	
	getInfiltrationByID(id) {
		return new subtype.InfiltrationDataModel(Data.loadDataModel(id, constants.FLAGS.INFILTRATIONS));
	}
	
	getInfiltrations() {
		return this.infiltrations.map( id => this.getInfiltrationByID(id) );
	}

	getMechanicName() {
		return "Infiltration";
	}
}

export class ReputationDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Reputation Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "reputations"}),
			id: new fields.StringField({required: true, blank: false, initial: 'reputations'}),
			reputations: new fields.ArrayField(new fields.StringField()),
			visible: new fields.BooleanField({required: true, blank: false, initial: false})
		}
	}
	
	addReputation(newReputation) {
		if(!newReputation instanceof subtype.ReputationDataModel){
			Helper.log(true, 'Cannot add new Reputation - the object is not a Reputation')
			return;
		}
		this.reputations.push(newReputation.id)
		Data.saveDataModel(newReputation, constants.FLAGS.REPUTATIONS)
		this.updateSource({reputations: this.reputations})
		return newReputation.id;
	}
	
	getReputationByID(id) {
		return new subtype.ReputationDataModel(Data.loadDataModel(id, constants.FLAGS.REPUTATIONS));
	}
	
	getReputations() {
		return this.reputations.map( id => this.getReputationByID(id) );
	}

	getMechanicName() {
		return "Reputation";
	}	
}