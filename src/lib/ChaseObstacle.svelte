<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { CheckDataModel } from '../subsystem-data-model-subtypes.js';
    import { TJSContentEdit }     from '#standard/component';
    import Check from './Check.svelte';

    export let id;
    export let parentid;
    export let parentFlag;

    let data = Data.loadDataModel(id, constants.FLAGS.CHASEOBSTACLES)
    let content = data.name;

    function reloadData() {
        data = Data.loadDataModel(id, constants.FLAGS.CHASEOBSTACLES)
    }

    function addCheck() {
        data.addCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.CHASEOBSTACLES)
    }

    function deleteSelf() {
        parent = Data.loadDataModel(parentid)
        parent.obstacles.splice(parent.obstacles.indexOf(data.id),1)
        Data.saveDataModel(parent, parentFlag)
        Data.deleteFlag(data.id, constants.FLAGS.CHASEOBSTACLES)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.CHASEOBSTACLES)
    }

</script>

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
            <h3 class="center">Checks:</h3>
            <button style="width: auto;" on:click={addCheck}>Add Check</button>
        </div>
        {#each data.checks as check}
            <hr>
            <div class="check"><Check id={check} parentid={data.id} parentFlag = {constants.FLAGS.CHASEOBSTACLES} /></div>
        {/each}
    </main> 
</div>

<style>
    .leftandright{
        display: flex;
        justify-content: space-between;
    }

    .center {
        align-content: center;
        margin: 0 0 0;
    }
</style>