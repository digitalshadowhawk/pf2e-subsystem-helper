<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { InfluenceDataModel } from '../subsystem-data-models.js';
    import { InfluenceNPCDataModel } from '../subsystem-data-model-subtypes.js';
    import { constants } from '../constants.js';
    import InfluenceNPC from './InfluenceNPC.svelte';

    let influenceSubsystem = Data.loadDataModel('influence') ?? new InfluenceDataModel();

    let display = "none" 
    if(game.settings.get(constants.ID, "Influence")){
        display = "block"
    } else {
        display = "none"
    }

    function toggleNPCs() {
        influenceSubsystem.visible = !influenceSubsystem.visible
        Data.saveDataModel(influenceSubsystem)
    }

    function addNPC() {
        influenceSubsystem.addNPC(new InfluenceNPCDataModel({}))
        Data.saveDataModel(influenceSubsystem)
    }
</script>


<div class="folder" style="display:{display}; width:100%;">
    <button class="folder-header flexrow" on:click={toggleNPCs}>{influenceSubsystem.subsystemName}</button>
    {#if influenceSubsystem.visible}
        {#each influenceSubsystem.npcs as npc}
        <div class="npc"><InfluenceNPC id={npc} parentid={influenceSubsystem.id} parentFlag={constants.FLAGS.SUBSYSTEMS} /></div>
        {/each}
        <button class="sub-button" on:click={addNPC}>Add New NPC</button>
    {/if}
</div>

<style>
    .folder {
        color: rgb(120, 100, 82);
    }
    .folder-header {
        color: #FFFFFF;
        padding: 6px;
        line-height: 24px;
        background: rgba(120, 100, 82, 0.5);
        text-shadow: 0px 0px 3px var(--color-shadow-dark);
    }
    .npc {
        margin-left: 1%;
    }
    .sub-button {
        margin-left: 1%;
    }
</style>