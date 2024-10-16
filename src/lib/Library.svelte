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

    let data = Data.loadDataModel(id, constants.FLAGS.LIBRARIES)
    let content = data.libraryName;
    let enrichedContent;

    function reloadData() {
        data = Data.loadDataModel(id, constants.FLAGS.LIBRARIES)
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

    function deleteSelf() {
        parent = Data.loadDataModel(parentid)
        parent.libraries.splice(parent.libraries.indexOf(data.id),1)
        Data.saveDataModel(parent, parentFlag)
        Data.deleteFlag(data.id, constants.FLAGS.LIBRARIES)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.LIBRARIES)
    }

</script>

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
                    <h3 class="center">Thresholds:</h3>
                    <button style="width: auto;" on:click={addThreshold}>Add Threshold</button>
                </div>
                {#each data.thresholds as threshold}
                    <div class="threshold"><Threshold id={threshold} parentid={data.id} parentFlag = {constants.FLAGS.LIBRARIES} /></div>
                {/each}
                <hr>
                <div class="leftandright">
                    <h3 class="center">Sources:</h3>
                    <button style="width: auto;" on:click={addSource}>Add Source</button>
                </div>
                {#each data.sources as source}
                    <div class="source"><Source id={source} parentid={data.id} parentFlag= {constants.FLAGS.LIBRARIES} /></div>
                {/each}
            </main> 
        </div>
    {/if}
</div>

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