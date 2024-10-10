import * as subtype from './subsystem-data-model-subtypes.mjs';
import { PF2eSubsystemHelper } from "./pf2e-subsystem-helper.mjs";
import { SubsystemData } from "./pf2e-subsystem-helper.mjs";

export class ResearchSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			libraries: new fields.ArrayField(new fields.StringField())//new fields.ObjectField({required: false}))
		}
	}
	
	constructor(name = "Research Subsystem", newid = foundry.utils.randomID(16), existingLibraries = [])
	{
		super({subsystemName: name, subsystemType: "research",  id: newid, libraries: existingLibraries})
	}
	
	reinstantiate() {
		this.libraries.forEach(loadLibrary);
		
		function loadLibrary(library, index, arr) {
			arr[index] = new subtype.Library(library.libraryName, library.level, library.points, library.id, library.thresholds, library.sources).reinstantiate();
		}
		
		return this;
	}
	
	addLibrary(newLibrary) {
		if(!newLibrary instanceof subtype.Library) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Library - the object is not an Library')
			return null;
		}
		return this.libraries.push(SubsystemData.saveDataModel(newLibrary, PF2eSubsystemHelper.FLAGS.LIBRARIES))
	}
	
	getLibraryByID(id) {
		return new Library(SubsystemData.loadDataModel(id));
	}
}

export class VictoryPointsDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			counters: new fields.ArrayField(new fields.ObjectField({required: false}))
		}
	}
	
	constructor(name = "Victory Points Subsystem", newid = foundry.utils.randomID(16), existingCounters = [])
	{
		super({subsystemName: name, subsystemType: "victorypoints",  id: newid, counters: existingCounters})
	}
	
	addCounter(newCounter) {
		if(!newCounter instanceof subtype.Counter) {
			PF2eSubsystemHelper.log(true, 'Cannot add new Counter - the object is not a Counter')
			return;
		}
		return this.libraries.push(newCounter)
	}
	
	reinstantiate() {
		this.counters.forEach(loadCounter);
		
		function loadCounter(counter, index, arr) {
			arr[index] = new subtype.Counter(counter.name, counter.points, counter.id);
		}
		
		return this;
	}
	
}

export class InfluenceSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			npcs: new fields.ArrayField(new fields.ObjectField({required: false}))
		}
	}
	
	constructor(name = "Influence Subsystem", newid = foundry.utils.randomID(16), existingNPCs = []) {
		super({subsystemName: name, subsystemType: "influence", id: newid, npcs: existingNPCs})
	}
	
	reinstantiate(){
		this.npcs.forEach(loadNPC);
		
		function loadNPC(npc, index, arr) {
			arr[index] = new subtype.InfluenceNPC(npc.name, npc.perception, npc.will, npc.id, npc.thresholds, npc.checks, npc.resistances, npc.weaknesses).reinstantiate();
		}
		
		return this;
	}
	
	addNPC(newNPC) {
		if(!newNPC instanceof subtype.npc) {
			PF2eSubsystemHelper.log(true, 'Cannot add new NPC - the object is not an NPC')
			return;
		}
		return this.npcs.push(newNPC)
	}
	
	getNPCByName(name) {
		let output = {}
		this.npcs.forEach(getNPC);
		
		function getNPC(npc) {
			if(npc.name===name) {
				output = npc
				return;
			}
		}
		return output;
	}
	
	getNPCByID(id) {
		let output = {}
		this.npcs.forEach(getNPC);
		
		function getNPC(npc) {
			if(npc.id===id) {
				output = npc
				return;
			}
		}
		return output;
	}
}

export class ChasesSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			chases: new fields.ArrayField(new fields.ObjectField({required: false}))
		}
	}
	
	constructor(name = "Chases Subsystem", newid = foundry.utils.randomID(16), existingChases = [])
	{
		super({subsystemName: name, subsystemType: "chases",  id: newid, chases: existingChases})
	}
	
	addChase(newChase) {
		if(!newChase instanceof subtype.Chase){
			PF2eSubsystemHelper.log(true, 'Cannot add new Chase - the object is not a Chase')
			return;
		}
		return this.chases.push(newChase)
	}
	
	reinstantiate() {
		this.chases.forEach(loadChases);
		
		function loadChases(chase, index, arr) {
			arr[index] = new subtype.Chase(chase.name, chase.points, counter.id);
		}
		
		return this;
	}
	
}