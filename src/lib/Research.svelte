<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { ResearchDataModel } from '../subsystem-data-models.js';
    import { LibraryDataModel } from '../subsystem-data-model-subtypes.js';
    import { constants } from '../constants.js';
    import Library from './Library.svelte';

    let researchSubsystem = Data.loadDataModel('research') ?? new ResearchDataModel();

    let display = "none" 
    if(game.settings.get(constants.ID, "Research")){
        display = "block"
    } else {
        display = "none"
    }

    function toggleLibraries() {
        researchSubsystem.visible = !researchSubsystem.visible
        Data.saveDataModel(researchSubsystem)
    }

    function addLibrary() {
        researchSubsystem.addLibrary(new LibraryDataModel({}))
        Data.saveDataModel(researchSubsystem)
    }
</script>


<div class="folder" style="display:{display}; width: 100%;">
    <button class="folder-header flexrow" on:click={toggleLibraries}>{researchSubsystem.subsystemName}</button>
    {#if researchSubsystem.visible}
        {#each researchSubsystem.libraries as library}
        <div class="library"><Library id={library} parentid={researchSubsystem.id} parentFlag={constants.FLAGS.SUBSYSTEMS} /></div>
        {/each}
        <button class="sub-button" on:click={addLibrary}>Add New Library</button>
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
    .library, .sub-button {
        margin-left: 1%;
    }
</style>