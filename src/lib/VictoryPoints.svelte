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

    let showCounters = false

    function toggleCounters() {
        showCounters = !showCounters
    }

    function addCounter() {
        victoryPointsSubsystem.addCounter(new CounterDataModel({}))
        Data.saveDataModel(victoryPointsSubsystem)
    }
</script>


<div class="folder" style="display:{display}">
    <button class="folder-header flexrow" on:click={toggleCounters}>{victoryPointsSubsystem.subsystemName}</button>
    {#if showCounters}
        {#each victoryPointsSubsystem.counters as counter}
            <div class="counter"><Counter id={counter} /></div>
        {/each}
        <button on:click={addCounter}>Add New Counter</button>
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
    }
</style>