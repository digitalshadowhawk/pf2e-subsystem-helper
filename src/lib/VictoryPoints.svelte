<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { VictoryPointsDataModel } from '../subsystem-data-models.js';
    import { CounterDataModel } from '../subsystem-data-model-subtypes.js';
    import { constants } from '../constants.js';
    import Counter from './Counter.svelte';

    let victoryPointsSubsystem = Data.loadDataModel('victorypoints') ?? new VictoryPointsDataModel();

    let display = "none" 
    if(game.settings.get(constants.ID, "VictoryPoints")){
        display = "block"
    } else {
        display = "none"
    }


    function toggleCounters() {
        victoryPointsSubsystem.visible = !victoryPointsSubsystem.visible
        Data.saveDataModel(victoryPointsSubsystem)
    }

    function addCounter() {
        victoryPointsSubsystem.addCounter(new CounterDataModel({}))
        Data.saveDataModel(victoryPointsSubsystem)
    }
</script>


<div class="folder" style="display:{display}; width: 100%">
    <button class="folder-header flexrow" on:click={toggleCounters}>{victoryPointsSubsystem.subsystemName}</button>
    {#if victoryPointsSubsystem.visible}
        {#each victoryPointsSubsystem.counters as counter}
            <div class="counter"><Counter id={counter} parentid={victoryPointsSubsystem.id} parentFlag={constants.FLAGS.SUBSYSTEMS}/></div>
        {/each}
        <button class="sub-button" on:click={addCounter}>Add New Counter</button>
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
    .counter {
        margin-left: 1%;
        border: 1px solid #000;
        padding: 1%;
    }
    .sub-button {
        margin-left: 1%;
    }
</style>