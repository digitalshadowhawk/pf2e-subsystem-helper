<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { ThresholdDataModel, CheckDataModel } from '../subsystem-data-model-subtypes.js';
    import TextWrapper from './TextWrapper.svelte';
    import { TJSContentEdit }     from '#standard/component';
    import Threshold from './Threshold.svelte';
    import Check from './Check.svelte';

    export let id;
    export let parentid;
    export let parentFlag;
    let content
    let data = Data.loadDataModel(id, constants.FLAGS.NPCS)
    
    if(data !=undefined){
        content = data.name
    }

    function addCheck() {
        data.addCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }
    
    function addThreshold() {
        data.addThreshold(new ThresholdDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }
    
    function addDiscoveryCheck() {
        data.addDiscoveryCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }

    function toggleNPC() {
        data.visible = !data.visible
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteNPC(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function toggleThresholds() {
        data.thresholdsVisible = !data.thresholdsVisible
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }

    function toggleDiscoveries() {
        data.discoveriesVisible = !data.discoveriesVisible
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }

    function toggleChecks() {
        data.checksVisible = !data.checksVisible
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }

</script>
{#if data != undefined}
<button class="folder-header flexrow" on:click={toggleNPC}>{data.name}</button>
{#if data.visible}
<div class="npc-data folder">
    <div class="leftandright">
        <div style="width: 80%;" class="leftandright"><div class="center" style="width: 25%;"><TJSContentEdit bind:content on:editor:save={() => { data.name = content; save()}} /></div>
        <div class="center">Perception: +<input type="number" style="width: 30px;" min="0" bind:value={data.perception} on:focusout={save} />, Will: +<input type="number" style="width: 30px;" min="0" bind:value={data.will} on:focusout={save} /></div>
    </div>
        <button style="width: auto;" on:click={deleteSelf}>Delete</button>
    </div>
    <hr>
    <div class="leftandright">
        <button class="folder-header flexrow" on:click={toggleThresholds}>Thresholds:</button>
        {#if data.thresholdsVisible}
            <button style="width: 120px;" on:click={addThreshold}>Add Threshold</button>
        {/if}
    </div>
    {#if data.thresholdsVisible}
    {#each data.thresholds as threshold}
        <div class="threshold">
            <Threshold id={threshold} parentid={data.id} parentFlag={constants.FLAGS.NPCS} />
        </div>
    {/each}
    {/if}
    <hr>
    <div class="leftandright">
        <button class="folder-header flexrow" on:click={toggleDiscoveries}>Dicovery Checks:</button>
        {#if data.discoveriesVisible}
        <button style="width: 180px;" on:click={addDiscoveryCheck}>Add Discovery Check</button>
        {/if}
    </div>
    {#if data.discoveriesVisible}
    {#each data.discoveries as discovery}
        <hr>
        <div class="discovery"><Check id={discovery} parentid={data.id} parentFlag={constants.FLAGS.NPCS} /></div>
    {/each}
    {/if}
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
        <div class="check"><Check id={check} parentid={data.id} parentFlag={constants.FLAGS.NPCS} /></div>
    {/each}
    {/if}
    <hr>
    <div>
        <div style="margin: 5px 0; width: 90px;font-weight: bold;">Resistances:</div> 
        <div style="height: auto;"><TextWrapper parentid={data.id} parentFlag={constants.FLAGS.NPCS} content={data.resistances} field="resistances" /></div>
    </div>
    <hr>
    <div>
        <div style="margin: 5px 0; width: 90px;font-weight: bold;">Weaknesses:</div> 
        <div style="height: auto;"><TextWrapper parentid={data.id} parentFlag={constants.FLAGS.NPCS} content={data.weaknesses} field="weaknesses" /></div>
    </div>
    <hr>
    <div>
        <div style="margin: 5px 0; width: 90px;font-weight: bold;">Penalties:</div> 
        <div style="height: auto;"><TextWrapper parentid={data.id} parentFlag={constants.FLAGS.NPCS} content={data.penalties} field="penalties" /></div>
    </div>
</div>
{/if}
{/if}
<style>
    .leftandright{
        display: flex;
        justify-content: space-between;
    }
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

    .center {
        align-content: center;
        margin: 0 0 0;
    }
    .npc-data {
        border: 1px solid #000;
        padding: 1%;
    }
</style>