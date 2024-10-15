<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { ThresholdDataModel, LibrarySourceDataModel } from '../subsystem-data-model-subtypes.js';
    import Threshold from './Threshold.svelte';
    import Source from './Source.svelte';

    export let id;
    let data = Data.loadDataModel(id, constants.FLAGS.LIBRARIES)
    
    let showLibrary = false


    function toggleLibrary() {
        showLibrary = !showLibrary
    }

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

</script>

<div class="folder">
    <button class="folder-header flexrow" on:click={toggleLibrary}>{data.libraryName}</button>
    {#if showLibrary}
        <div class="library-data">
            <header>
                <div style="float:right;">Level: {data.level}</div>
                <div>Research Points: {data.points}</div>
            </header>
            <hr>
            <main>
                <div class="subheader">
                    <h3>Thresholds:</h3>
                    <button style="width: auto;" on:click={addThreshold}>Add Threshold</button>
                </div>
                {#each data.thresholds as threshold}
                    <div class="threshold"><Threshold id={threshold} /></div>
                {/each}
                <hr>
                <div class="subheader">
                    <h3>Sources:</h3>
                    <button style="width: auto;" on:click={addSource}>Add Source</button>
                </div>
                {#each data.sources as source}
                    <div class="source"><Source id={source} /></div>
                {/each}
            </main> 
        </div>
    {/if}
</div>

<style>
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
    .subheader{
        display: flex;
        justify-content: space-between;
    }

    h3 {
        align-content: center;
        margin: 0 0 0;
    }
</style>