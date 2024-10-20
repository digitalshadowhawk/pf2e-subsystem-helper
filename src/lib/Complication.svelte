<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { CheckDataModel } from '../subsystem-data-model-subtypes.js';
    import TextWrapper from './TextWrapper.svelte';
    import Check from './Check.svelte';

    export let id;
    export let parentid;
    export let parentFlag;

    let data = Data.loadDataModel(id, constants.FLAGS.COMPLICATIONS)

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteComplication(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function addCheck() {
        data.addCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.COMPLICATIONS)
    }


    function toggleChecks() {
        data.checksVisible = !data.checksVisible
        Data.saveDataModel(data, constants.FLAGS.COMPLICATIONS)
    }
</script>

{#if data != undefined}
<div class="complication-data">
<div class="leftandright">
<div class="leftandright" style="width: 90%;"><div>Trigger: </div><div style="width: 90%;"><TextWrapper parentid={data.id} parentFlag={constants.FLAGS.COMPLICATIONS} content={data.trigger} field="trigger" /></div></div>
<button style="width: auto;" on:click={deleteSelf}>Delete</button>
</div>
<hr>
<div class="leftandright">
    <button class="folder-header flexrow" on:click={toggleChecks}>Checks:</button>
    {#if data.checksVisible}
    <button style="width: 120px;" on:click={addCheck}>Add Check</button>
    {/if}
</div>
{#if data.checksVisible}
{#each data.checks as check}
    <hr>
    <div class="check"><Check id={check} parentid={data.id} parentFlag={constants.FLAGS.COMPLICATIONS} /></div>
{/each}
{/if}
</div>
{/if}
<style>
    .leftandright{
        display: flex;
        justify-content: space-between;
    }
    
    .complication-data {
        border: 1px solid #000;
        padding: 1%;
    }
</style>