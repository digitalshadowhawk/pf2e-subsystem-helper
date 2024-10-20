<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { ChaseObstacleDataModel } from '../subsystem-data-model-subtypes.js';
    import TextWrapper from './TextWrapper.svelte';
    import ChaseObstacle from './ChaseObstacle.svelte';

    export let id;
    export let parentid;
    export let parentFlag;
    let data = Data.loadDataModel(id, constants.FLAGS.CHASES)

    function addObstacle() {
        data.addObstacle(new ChaseObstacleDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.CHASES)
    }

    function toggleChase() {
        data.visible = !data.visible
        Data.saveDataModel(data, constants.FLAGS.CHASES)
    }
    
    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteChase(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function toggleObstacles() {
        data.obstaclesVisible = !data.obstaclesVisible
        Data.saveDataModel(data, constants.FLAGS.CHASES)
    }

</script>
{#if data != undefined}
<button class="folder-header flexrow" on:click={toggleChase}>{data.name}</button>
{#if data.visible}
<div class="chase-data folder">
    <div style="display: grid; grid-template-columns: 25% auto 10%;">
        <div><TextWrapper parentid={data.id} parentFlag={constants.FLAGS.CHASES} content={data.name} field="name" /></div>
        <div>Objective: <TextWrapper parentid={data.id} parentFlag={constants.FLAGS.CHASES} content={data.objective} field="objective" /></div>
        <div style="text-align:right;"><button style="width: auto;" on:click={deleteSelf}>Delete</button></div>
    </div>
    <hr>
    <div class="leftandright">
        <button class="folder-header flexrow" on:click={toggleObstacles}>Obstacles:</button>
        {#if data.obstaclesVisible}
        <button style="width: 120px;" on:click={addObstacle}>Add Obstacle</button>
        {/if}
    </div>
    {#if data.obstaclesVisible}
    {#each data.obstacles as obstacle}
        <hr>
        <div class="check"><ChaseObstacle id={obstacle} parentid={data.id} parentFlag={constants.FLAGS.CHASES} /></div>
    {/each}
    {/if}
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
    .chase-data {
        border: 1px solid #000;
        padding: 1%;
    }
</style>