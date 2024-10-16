<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { ChasesDataModel } from '../subsystem-data-models.js';
    import { ChaseDataModel } from '../subsystem-data-model-subtypes.js';
    import { constants } from '../constants.js';
    import Chase from './Chase.svelte';

    let chasesSubsystem = Data.loadDataModel('chases') ?? new ChasesDataModel();

    let display = "none" 
    if(game.settings.get(constants.ID, "Chases")){
        display = "block"
    } else {
        display = "none"
    }

    function toggleChases() {
        chasesSubsystem.visible = !chasesSubsystem.visible
        Data.saveDataModel(chasesSubsystem)
    }

    function addChase() {
        chasesSubsystem.addChase(new ChaseDataModel({}))
        Data.saveDataModel(chasesSubsystem)
    }
</script>


<div class="folder" style="display:{display}; width:100%;">
    <button class="folder-header flexrow" on:click={toggleChases}>{chasesSubsystem.subsystemName}</button>
    {#if chasesSubsystem.visible}
        {#each chasesSubsystem.chases as chase}
            <div class="chase"><Chase id={chase} parentid={chasesSubsystem.id} parentFlag={constants.FLAGS.SUBSYSTEMS} /></div>
        {/each}
        <button class="sub-button" on:click={addChase}>Add New Chase</button>
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
    .chase {
        margin-left: 1%;
    }
    .sub-button {
        margin-left: 1%;
    }
</style>