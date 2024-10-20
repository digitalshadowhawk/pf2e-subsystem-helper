<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { CheckDataModel } from '../subsystem-data-model-subtypes.js';
    import { TJSContentEdit }     from '#standard/component';
    import Check from './Check.svelte';

    export let id;
    export let parentid;
    export let parentFlag;
    let content
    let data = Data.loadDataModel(id, constants.FLAGS.SOURCES)
    if(data !=undefined){
        content = data.description
    }

    function addCheck() {
        data.addCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.SOURCES)
    }

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteSource(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function toggleChecks() {
        data.checksVisible = !data.checksVisible
        Data.saveDataModel(data, constants.FLAGS.SOURCES)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.SOURCES)
    }
</script>

{#if data != undefined}
<hr>
<header class="leftandright">
    <h3 class="center" style="width: 70%;"><TJSContentEdit bind:content on:editor:save={() => { data.description = content; save()}} /></h3>
    <div class="leftandright">
        <div class="center"><input type="number" style="width: 35px;" min="0" bind:value={data.earnedRP} on:focusout={save} /> / <input type="number" style="width: 35px;" min="0" bind:value={data.maxRP} on:focusout={save} /> RP Earned</div>
        <button style="width: auto; height: auto;" on:click={deleteSelf}>Delete</button>
    </div>
</header>
<hr>
<div class="subheader">
    <button class="folder-header flexrow" on:click={toggleChecks}>Checks:</button>
    {#if data.checksVisible}
    <button style="width: 120px;" on:click={addCheck}>Add Check</button>
    {/if}
</div>
{#if data.checksVisible}
{#each data.checks as check}
    <hr>
    <div class="check"><Check id={check} parentid={data.id} parentFlag={constants.FLAGS.SOURCES} /></div>
{/each}
{/if}
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
    .subheader{
        display: flex;
        justify-content: space-between;
    }

    .center{
        align-content: center;
        margin: 0 0 0;
    }
</style>