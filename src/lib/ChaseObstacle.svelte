<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { CheckDataModel } from '../subsystem-data-model-subtypes.js';
    import { TJSContentEdit }     from '#standard/component';
    import Check from './Check.svelte';

    export let id;
    export let parentid;
    export let parentFlag;

    let content

    let data = Data.loadDataModel(id, constants.FLAGS.CHASEOBSTACLES)
    if(data != undefined){
        content = data.name;
    }
    function reloadData() {
        data = Data.loadDataModel(id, constants.FLAGS.CHASEOBSTACLES)
    }

    function addCheck() {
        data.addCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.CHASEOBSTACLES)
    }

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteObstacle(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function toggleChecks() {
        data.checksVisible = !data.checksVisible
        Data.saveDataModel(data, constants.FLAGS.CHASEOBSTACLES)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.CHASEOBSTACLES)
    }

</script>

{#if data != undefined}
<div>
    <header>
        <div class="center"><TJSContentEdit bind:content on:editor:save={() => { data.name = content; save()}} /></div>
            <hr>
            <div class="leftandright">
            <div>
            <div class="center">Level: <input type="number" style="width:30px;" min="0" bind:value={data.level} on:focusout={save} /></div>
            <div class="center">Points: <input type="number" style="width: 30px;" min="0" bind:value={data.points} on:focusout={save} /> / <input type="number" style="width: 30px;" min="0" bind:value={data.goal} on:focusout={save} /></div>
            </div>
            <div><button style="width: auto;" on:click={deleteSelf}>Delete</button></div>
            </div>
    </header>
    <hr>
    <main>
        <div class="leftandright">
            <button class="folder-header flexrow" on:click={toggleChecks}>Checks:</button>
            {#if data.checksVisible}
            <button style="width: 120px;" on:click={addCheck}>Add Check</button>
            {/if}
        </div>
        {#if data.checksVisible}
        {#each data.checks as check}
            <hr>
            <div class="check"><Check id={check} parentid={data.id} parentFlag = {constants.FLAGS.CHASEOBSTACLES} /></div>
        {/each}
        {/if}
    </main> 
</div>
{/if}

<style>
    .leftandright{
        display: flex;
        justify-content: space-between;
    }
    .folder-header {
        color: #FFFFFF;
        padding: 6px;
        line-height: 24px;
        background: rgba(120, 100, 82, 0.5);
        text-shadow: 0px 0px 3px var(--color-shadow-dark);
    }

    .center {
        align-content: center;
        margin: 0 0 0;
    }
</style>