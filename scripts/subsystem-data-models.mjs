import * as subtype from './subsystem-data-model-subtypes.mjs';
import { PF2eSubsystemHelper } from "./pf2e-subsystem-helper.mjs";
import { SubsystemData } from "./pf2e-subsystem-helper.mjs";

export class ResearchSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Research Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "research"}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			libraries: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addLibrary(newLibrary) {
		if(!newLibrary instanceof subtype.Library) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Library - the object is not an Library')
			return null;
		}
		this.libraries.push(SubsystemData.saveDataModel(newLibrary, PF2eSubsystemHelper.FLAGS.LIBRARIES))
		this.updateSource({libraries: this.libraries})
		return newLibrary.id;
	}
	
	getLibraryByID(id) {
		return new subtype.Library(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.LIBRARIES));
	}
	
	getLibraries() {
		return this.libraries.map( id => this.getLibraryByID(id) );
	}
}

export class VictoryPointsDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Victory Points Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "victorypoints"}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			counters: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addCounter(newCounter) {
		if(!newCounter instanceof subtype.Counter) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Counter - the object is not a Counter')
			return null;
		}
		this.counters.push(SubsystemData.saveDataModel(newCounter, PF2eSubsystemHelper.FLAGS.COUNTERS))
		this.updateSource({counters: this.counters})
		return newCounter.id;
	}
	
	getCounterByID(id) {
		return new subtype.Counter(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.COUNTERS));
	}
	
	getCounter() {
		return this.counters.map( id => this.getCounterByID(id) );
	}
	
}

export class InfluenceSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Influence Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "influence"}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			npcs: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addNPC(newNPC) {
		if(!newNPC instanceof subtype.InfluenceNPC) {
			PF2eSubsystemHelper.log(true, 'Cannot add new NPC - the object is not an NPC')
			return null;
		}
		this.npcs.push(SubsystemData.saveDataModel(newNPC, PF2eSubsystemHelper.FLAGS.NPCS))
		this.updateSource({npcs: this.npcs})
		return newNPC.id;
	}
	
	getNPCByID(id) {
		return new subtype.InfluenceNPC(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.NPCS));
	}
	
	getNPCs() {
		return this.npcs.map( id => this.getNPCByID(id) );
	}
}

export class ChasesSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false, initial: "Chases Subsystem"}),
			type: new fields.StringField({required: true, blank: false, initial: "chases"}),
			id: new fields.StringField({required: true, blank: false, initial: PF2eSubsystemHelper.generateID()}),
			chases: new fields.ArrayField(new fields.StringField())
		}
	}
	
	addChase(newChase) {
		if(!newChase instanceof subtype.Chase){
			PF2eSubsystemHelper.log(true, 'Cannot add new Chase - the object is not a Chase')
			return;
		}
		this.chases.push(SubsystemData.saveDataModel(newChase, PF2eSubsystemHelper.FLAGS.CHASES))
		this.updateSource({chases: this.chases})
		return newChase.id;
	}
	
	getChaseByID(id) {
		return new subtype.Chase(SubsystemData.loadDataModel(id, PF2eSubsystemHelper.FLAGS.CHASES));
	}
	
	getChases() {
		return this.chases.map( id => this.getChaseByID(id) );
	}
	
}