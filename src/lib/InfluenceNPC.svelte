<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { ThresholdDataModel, CheckDataModel } from '../subsystem-data-model-subtypes.js';
    import Threshold from './Threshold.svelte';
    import Check from './Check.svelte';
    export let id;
    let data = Data.loadDataModel(id, constants.FLAGS.NPCS)
    
    let showNPC = false

    function addCheck() {
        data.addCheck(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }
    
    function addThreshold() {
        data.addThreshold(new ThresholdDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }
    
    function addDiscovery() {
        data.addDiscovery(new CheckDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.NPCS)
    }

    function toggleNPC() {
        showNPC = !showNPC
    }
</script>
<button class="folder-header flexrow" on:click={toggleNPC}>{data.name}</button>
    {#if showNPC}
<div class="npc-data">
    <div>Perception: +{data.perception}, Will: +{data.will}</div>
<hr>
<div class="subheader">
    <h4>Thresholds:</h4>
    <button style="width: auto;" on:click={addThreshold}>Add Threshold</button>
</div>
{#each data.thresholds as threshold}
    <div class="threshold"><Threshold id={threshold} /></div>
{/each}
<hr>
<div class="subheader">
    <h4>Discovery Checks:</h4>
    <button style="width: auto;" on:click={addDiscovery}>Add Discovery Check</button>
</div>
{#each data.discoveries as discovery}
    <hr>
    <div class="discovery"><Check id={discovery} /></div>
{/each}
<hr>
<div class="subheader">
    <h4>Checks:</h4>
    <button style="width: auto;" on:click={addCheck}>Add Check</button>
</div>
{#each data.checks as check}
    <hr>
    <div class="check"><Check id={check} /></div>
{/each}
<hr>
<div><strong>Resistances:</strong> {data.resistances}</div>
<hr>
<div><strong>Weaknesses:</strong> {data.weaknesses}</div>
</div>
{/if}

<style>
    .subheader{
        display: flex;
        justify-content: space-between;
    }

    h4 {
        align-content: center;
        margin: 0 0 0;
    }
    .npc-data {
        border: 1px solid #000;
        padding: 1%;
    }
</style>