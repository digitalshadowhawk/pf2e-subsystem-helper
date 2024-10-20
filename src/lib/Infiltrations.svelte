<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { InfiltrationsDataModel } from '../subsystem-data-models.js';
    import { InfiltrationDataModel } from '../subsystem-data-model-subtypes.js';
    import { constants } from '../constants.js';
    import Infiltration from './Infiltration.svelte';

    let infiltrationSubsystem = Data.loadDataModel('infiltrations') ?? new InfiltrationsDataModel();

    let display = "none" 
    if(game.settings.get(constants.ID, "Infiltration")){
        display = "block"
    } else {
        display = "none"
    }

    function toggleInfiltrations() {
        infiltrationSubsystem.visible = !infiltrationSubsystem.visible
        Data.saveDataModel(infiltrationSubsystem)
    }

    function addInfiltration() {
        infiltrationSubsystem.addInfiltration(new InfiltrationDataModel({}))
        Data.saveDataModel(infiltrationSubsystem)
    }
</script>


<div class="folder" style="display:{display}; width: 100%;">
    <button class="folder-header flexrow" on:click={toggleInfiltrations}>{infiltrationSubsystem.subsystemName}</button>
    {#if infiltrationSubsystem.visible}
        {#each infiltrationSubsystem.infiltrations as infiltration}
        <div class="reputation"><Infiltration id={infiltration} parentid={infiltrationSubsystem.id} parentFlag={constants.FLAGS.SUBSYSTEMS} /></div>
        {/each}
        <button class="sub-button" on:click={addInfiltration}>Add New Infiltration</button>
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
    .reputation, .sub-button {
        margin-left: 1%;
    }
</style>