import * as subtype from './subsystem-data-model-subtypes.mjs';

class ResearchSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			libraries: new fields.ArrayField(new fields.ObjectField({required: false}))
		}
	}
	
	constructor(name = "Research Subsystem", type = "research", newid = foundry.utils.randomID(16), existingLibraries = [])
	{
		super({subsystemName: name, subsystemType: type,  id: newid, libraries: existingLibraries})
	}
	
	reinstantiate() {
		this.libraries.forEach(loadLibrary);
		
		function loadLibrary(library, index, arr) {
			arr[index] = new subtype.Library(library.libraryName, library.level, library.points, library.id, library.thresholds, library.sources).reinstantiate();
		}
		
		return this;
	}
	
	addLibrary(newLibrary) {
		if(newLibrary.getType() != "Library") {
			PF2eSubsystemHelper.log(true, 'Cannot add new Library - the object is not an Library')
			return;
		}
		return this.libraries.push(newLibrary)
	}
	
	getLibraryByName(name) {
		let output = {}
		this.libraries.forEach(getLibrary);
		
		function getLibrary(library) {
			if(library.name===name) {
				output = library
				return;
			}
		}
		return output;
	}
	
	getLibraryByID(id) {
		let output = {}
		this.libraries.forEach(getLibrary);
		
		function getLibrary(library) {
			if(library.id===id) {
				output = library
				return;
			}
		}
		return output;
	}
}

class VictoryPointsDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			counters: new fields.ArrayField(new fields.ObjectField({required: false}))
		}
	}
	
	constructor(name = "Victory Points Subsystem", type = "victorypoints", newid = foundry.utils.randomID(16), existingCounters = [])
	{
		super({subsystemName: name, subsystemType: type,  id: newid, counters: existingCounters})
	}
	
	addCounter(newCounter) {
		if(newCounter.getType() != "Counter") {
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

class InfluenceSubsystemDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			npcs: new fields.ArrayField(new fields.ObjectField({required: false}))
		}
	}
	
	constructor(name = "Influence Subsystem", type = "influence", newid = foundry.utils.randomID(16), existingNPCs = []) {
		super({subsystemName: name, subsystemType: type, id: newid, npcs: existingNPCs})
	}
	
	reinstantiate(){
		this.npcs.forEach(loadNPC);
		
		function loadNPC(npc, index, arr) {
			arr[index] = new subtype.InfluenceNPC(npc.name, npc.perception, npc.will, npc.id, npc.thresholds, npc.checks, npc.resistances, npc.weaknesses).reinstantiate();
		}
		
		return this;
	}
	
	addNPC(newNPC) {
		if(newNPC.getType() != "InfluenceNPC") {
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

class ChasesDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			subsystemName: new fields.StringField({required: true, blank: false}),
			subsystemType: new fields.StringField({required: true, blank: false}),
			id: new fields.StringField({required: true, blank: false}),
			chases: new fields.ArrayField(new fields.ObjectField({required: false}))
		}
	}
	
	constructor(name = "Chases Subsystem", type = "chases", newid = foundry.utils.randomID(16), existingChases = [])
	{
		super({subsystemName: name, subsystemType: type,  id: newid, chases: existingChases})
	}
	
	addChase(newChase) {
		if(newChase.getType() != "Chase") {
			PF2eSubsystemHelper.log(true, 'Cannot add new Chase - the object is not a Chase')
			return;
		}
		return this.libraries.push(newChase)
	}
	
	reinstantiate() {
		this.chases.forEach(loadChases);
		
		function loadChases(chase, index, arr) {
			arr[index] = new subtype.Chase(chase.name, chase.points, counter.id);
		}
		
		return this;
	}
	
}