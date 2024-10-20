<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { ThresholdDataModel, LibrarySourceDataModel } from '../subsystem-data-model-subtypes.js';
    import { TJSContentEdit }     from '#standard/component';
    import Threshold from './Threshold.svelte';
    import Source from './Source.svelte';

    export let id;
    export let parentid;
    export let parentFlag;
    let content

    let data = Data.loadDataModel(id, constants.FLAGS.LIBRARIES)
    if(data !=undefined){
        content = data.libraryName;
    }

    function addThreshold() {
        data.addThreshold(new ThresholdDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.LIBRARIES)
    }

    function addSource() {
        data.addSource(new LibrarySourceDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.LIBRARIES)
    }

    function toggleLibrary() {
        data.visible = !data.visible
        Data.saveDataModel(data, constants.FLAGS.LIBRARIES)
    }

    function toggleSources() {
        data.sourcesVisible = !data.sourcesVisible
        Data.saveDataModel(data, constants.FLAGS.LIBRARIES)
    }

    function toggleThresholds() {
        data.thresholdsVisible = !data.thresholdsVisible
        Data.saveDataModel(data, constants.FLAGS.LIBRARIES)
    }

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteLibrary(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.LIBRARIES)
    }

</script>
{#if data != undefined}
<div class="folder">
    <button class="folder-header flexrow" on:click={toggleLibrary}>{data.libraryName}</button>
    {#if data.visible}
        <div class="library-data">
            <header>
                <div class="flexrow">
                    <div class="center" style="width: 25%;"><TJSContentEdit bind:content on:editor:save={() => { data.libraryName = content; save()}} /></div>
                    <div class="center">Research Points: <input type="number" style="width: 30px;" min="0" bind:value={data.points} on:focusout={save} /></div>
                    <div class="center">Level: <input type="number" style="width:30px;" min="0" bind:value={data.level} on:focusout={save} /></div>
                    <div style="text-align: right;"><button style="width: auto;" on:click={deleteSelf}>Delete</button></div>
                </div>
            </header>
            <hr>
            <main>
                <div class="leftandright">
                    <button class="folder-header flexrow" on:click={toggleThresholds}>Thresholds:</button>
                    {#if data.thresholdsVisible}
                    <button style="width: 120px;" on:click={addThreshold}>Add Threshold</button>
                    {/if}
                </div>
                {#if data.thresholdsVisible}
                {#each data.thresholds as threshold}
                    <div class="threshold"><Threshold id={threshold} parentid={data.id} parentFlag = {constants.FLAGS.LIBRARIES} /></div>
                {/each}
                {/if}
                <hr>
                <div class="leftandright">
                    <button class="folder-header flexrow" on:click={toggleSources}>Sources:</button>
                    {#if data.sourcesVisible}
                    <button style="width: 120px;" on:click={addSource}>Add Source</button>
                    {/if}
                </div>
                {#if data.sourcesVisible}
                {#each data.sources as source}
                    <div class="source"><Source id={source} parentid={data.id} parentFlag= {constants.FLAGS.LIBRARIES} /></div>
                {/each}
                {/if}
            </main> 
        </div>
    {/if}
</div>
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
    .library-data {
        border: 1px solid #000;
        padding: 1%;
    }

    .center {
        align-content: center;
        margin: 0 0 0;
    }
</style>