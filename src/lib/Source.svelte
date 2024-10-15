<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { CheckDataModel } from '../subsystem-data-model-subtypes.js';
    import Check from './Check.svelte';
    export let id;
    let data = Data.loadDataModel(id, constants.FLAGS.SOURCES)
    

    function addCheck() {
        data.addCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.SOURCES)
    }
</script>

<hr>
<header class="leftandright">
    <h3>{data.description}</h3>
    <div>{data.earnedRP} / {data.maxRP} RP Earned</div>
</header>
<hr>
<div class="subheader">
    <h4>Checks:</h4>
    <button style="width: auto;" on:click={addCheck}>Add Check</button>
</div>
{#each data.checks as check}
    <hr>
    <div class="check"><Check id={check} /></div>
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

    h4 {
        align-content: center;
        margin: 0 0 0;
    }
</style>