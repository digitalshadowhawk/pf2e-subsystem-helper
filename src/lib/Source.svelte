<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { CheckDataModel } from '../subsystem-data-model-subtypes.js';
    import { TJSContentEdit }     from '#standard/component';
    import Check from './Check.svelte';

    export let id;
    export let parentid;
    export let parentFlag;

    let data = Data.loadDataModel(id, constants.FLAGS.SOURCES)
    let content = data.description
    
    function addCheck() {
        data.addCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.SOURCES)
    }
    
    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.sources.splice(parent.sources.indexOf(data.id),1)
        Data.saveDataModel(parent, parentFlag)
        Data.deleteFlag(data.id, constants.FLAGS.SOURCES)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.SOURCES)
    }
</script>

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
    <h4>Checks:</h4>
    <button style="width: auto;" on:click={addCheck}>Add Check</button>
</div>
{#each data.checks as check}
    <hr>
    <div class="check"><Check id={check} parentid={data.id} parentFlag={constants.FLAGS.SOURCES} /></div>
{/each}

<style>
    .leftandright{
        display: flex;
        justify-content: space-between;
    }
    .subheader{
        display: flex;
        justify-content: space-between;
    }

    .center{
        align-content: center;
        margin: 0 0 0;
    }

    h4 {
        align-content: center;
        margin: 0 0 0;
    }
</style>