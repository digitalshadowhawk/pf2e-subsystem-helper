<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import TextWrapper from './TextWrapper.svelte';
    import Counter from './Counter.svelte';
    import Check from './Check.svelte';
    import { CounterDataModel, CheckDataModel } from '../subsystem-data-model-subtypes.js';

    export let id;
    export let parentid;
    export let parentFlag;




    let data = Data.loadDataModel(id, constants.FLAGS.INFILTRATIONOBSTACLES)

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteObstacle(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function toggleCounters() {
        data.countersVisible = !data.countersVisible
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONOBSTACLES)
    }

    function addCounter(){
        data.addPointCounter(new CounterDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONOBSTACLES)
    }

    function addCheck(){
        data.addCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONOBSTACLES)
    }

    function toggleChecks() {
        data.checksVisible = !data.checksVisible
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONOBSTACLES)
    }

    function toggleReference() {
        data.displayReference = !data.displayReference
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONOBSTACLES)
    }
    
    function save(){
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONOBSTACLES)
    }
    </script>

{#if data != undefined}
    <div class="obstacle">
    <div class="leftandright">
        <div class="center" style="width: 80%;">Required Points: <input type="number" style="width: 30px;" min="0" bind:value={data.goal} on:focusout={save} /> (Requires individual checks:
            <input type="checkbox" bind:checked={data.isIndividual} />)</div>
        <div><button style="width: auto;" on:click={save}>Save</button></div>
        <div><button style="width: auto;" on:click={deleteSelf}>Delete</button></div>
    </div>
    <div>Description <TextWrapper parentid={data.id} parentFlag={constants.FLAGS.INFILTRATIONOBSTACLES} content={data.description} field="description" /></div>
    <hr>
    <div class="leftandright">
        <button class="folder-header flexrow" on:click={toggleCounters}>Infiltration Point Counters:</button>
        {#if data.countersVisible}
        <button style="width: 120px;" on:click={addCounter}>Add Counter</button>
        {/if}
    </div>
    {#if data.countersVisible}
    {#each data.counters as counter}
        <hr>
        <div class="check"><Counter id={counter} parentid={data.id} parentFlag={constants.FLAGS.INFILTRATIONOBSTACLES} /></div>
    {/each}
    <hr>
    {/if}
    <div class="leftandright">
        <button class="folder-header flexrow" on:click={toggleChecks}>Checks:</button>
        {#if data.checksVisible}
        <button style="width: 120px;" on:click={addCheck}>Add Check</button>
        {/if}
    </div>
    {#if data.checksVisible}
    {#each data.checks as check}
        <hr>
        <div class="check"><Check id={check} parentid={data.id} parentFlag = {constants.FLAGS.INFILTRATIONOBSTACLES} /></div>
    {/each}
    {/if}
    </div>
    <button class="sub-button" on:click={toggleReference}>Reference</button>
        {#if data.displayReference}
        <div class="obstacle">
        <div>Critical Success: {data.outcome.criticalSuccess}</div>
        <div>Success: {data.outcome.success}</div>
        <div>Failure: {data.outcome.failure}</div>
        <div>Critical Failure: {data.outcome.criticalFailure}</div>
        </div>
        {/if}
        {/if}
<style>
    .leftandright{
        display: flex;
        justify-content: space-between;
    }
    .obstacle{
        border: 1px solid #000;
        padding: 1%;
    }
</style>