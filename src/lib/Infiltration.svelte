<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { TJSContentEdit }     from '#standard/component';
    import { InfiltrationObstacleDataModel, ThresholdDataModel, ComplicationDataModel } from '../subsystem-data-model-subtypes.js';
    import InfiltrationObstacle from './InfiltrationObstacle.svelte';
    import Threshold from './Threshold.svelte';
    import Complication from './Complication.svelte';

    export let id;
    export let parentid;
    export let parentFlag;
    let content

    let data = Data.loadDataModel(id, constants.FLAGS.INFILTRATIONS)
    if(data !=undefined){
        content = data.name;
    }
    let newObjective
    let newOpportunity


    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteInfiltration(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function toggleInfiltration() {
        data.visible = !data.visible
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }
    

    function toggleObjectives() {
        data.objectivesVisible = !data.objectivesVisible
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }
    
    function toggleObstacles() {
        data.obstaclesVisible = !data.obstaclesVisible
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

    function deleteObjective(objective){
        data.deleteObjective(objective)
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

    function deleteOpportunity(opportunity){
        data.deleteOpportunity(opportunity)
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

    function addObjective(){
        data.addObjective(newObjective)
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
        newObjective = ""
    }

    function addOpportunity(){
        data.addOpportunity(newOpportunity)
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
        newOpportunity = ""
    }
    
    function toggleThresholds() {
        data.thresholdsVisible = !data.thresholdsVisible
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

    function toggleComplications() {
        data.complicationsVisible = !data.complicationsVisible
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

    function toggleOpportunities() {
        data.opportunitiesVisible = !data.opportunitiesVisible
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

    function addObstacle() {
        data.addObstacle(new InfiltrationObstacleDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

    function addComplication() {
        data.addComplication(new ComplicationDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

    function addThreshold() {
        data.addAwarenessThreshold(new ThresholdDataModel({}))
        Data.saveDataModel(data, constants.FLAGS.INFILTRATIONS)
    }

</script>

{#if data != undefined}
<div class="folder">
    <button class="folder-header flexrow" on:click={toggleInfiltration}>{data.name}</button>
    {#if data.visible}
        <div class="infiltration-data">
            <header>
                <div class="flexrow">
                    <div class="center" style="width: 25%;"><TJSContentEdit bind:content on:editor:save={() => { data.name = content; save()}} /></div>
                    <div class="center">Awareness Points: <input type="number" style="width: 30px;" min="0" bind:value={data.awarenessPoints} on:focusout={save} /></div>
                    <div class="center">Edge Points: <input type="number" style="width: 30px;" min="0" bind:value={data.edgePoints} on:focusout={save} /></div>
                    <div style="text-align: right;"><button style="width: auto;" on:click={deleteSelf}>Delete</button></div>
                </div>
                <hr>
                <div>
                    <div>
                    <button class="folder-header flexrow" on:click={toggleObjectives}>Objectives:</button>
                    {#if data.objectivesVisible}
                    <div class="infiltration-data">
                    {#each data.objectives as objective }
                    <div class="leftandright center">    
                        <div class="center">Objective: {objective}</div>
                        <div style="text-align: right;"><button style="width: auto;" on:click={deleteObjective(objective)}>Delete</button></div>
                    </div>
                    <hr>
                    {/each}
                    <div class="leftandright">
                        <div class="flexrow center" style="width: 90%;">New Objective: <input style="width: 78%; margin-left: 1%;" bind:value={newObjective} /></div>
                        <div style="text-align: right;"><button style="width: auto;" on:click={addObjective}>Add</button></div>
                    </div>
                    </div>
                    {/if}
                    <div class="leftandright">
                        <button class="folder-header flexrow" on:click={toggleObstacles}>Obstacles:</button>
                        {#if data.obstaclesVisible}
                            <button style="width: 110px;" on:click={addObstacle}>Add Obstacle</button>
                        {/if}
                    </div>
                    {#if data.obstaclesVisible}
                    {#each data.obstacles as obstacle}
                        <div class="obstacle">
                            <InfiltrationObstacle id={obstacle} parentid={data.id} parentFlag={constants.FLAGS.INFILTRATIONS} />
                        </div>
                    {/each}
                    {/if}
                    <div class="leftandright">
                        <button class="folder-header flexrow" on:click={toggleThresholds}>Awareness Thresholds:</button>
                        {#if data.thresholdsVisible}
                        <button style="width: 120px;" on:click={addThreshold}>Add Threshold</button>
                        {/if}
                    </div>
                    {#if data.thresholdsVisible}
                    {#each data.awarenessThresholds as threshold}
                        <div class="threshold"><Threshold id={threshold} parentid={data.id} parentFlag = {constants.FLAGS.INFILTRATIONS} /></div>
                    {/each}
                    {/if}
                    <div class="leftandright">
                        <button class="folder-header flexrow" on:click={toggleComplications}>Complications:</button>
                        {#if data.complicationsVisible}
                        <button style="width: 150px;" on:click={addComplication}>Add Complication</button>
                        {/if}
                    </div>
                    {#if data.complicationsVisible}
                    {#each data.complications as complication}
                        <div class="complication"><Complication id={complication} parentid={data.id} parentFlag = {constants.FLAGS.INFILTRATIONS} /></div>
                    {/each}
                    {/if}
                    <button class="folder-header flexrow" on:click={toggleOpportunities}>Opportunities:</button>
                    {#if data.opportunitiesVisible}
                    <div class="infiltration-data">
                    {#each data.opportunities as opportunity }
                    <div class="leftandright center">    
                        <div class="center">Opportunity: {opportunity}</div>
                        <div style="text-align: right;"><button style="width: auto;" on:click={deleteOpportunity(opportunity)}>Delete</button></div>
                    </div>
                    <hr>
                    {/each}
                    <div class="leftandright">
                        <div class="flexrow center" style="width: 90%;">New Opportunity: <input style="width: 78%; margin-left: 1%;" bind:value={newOpportunity} /></div>
                        <div style="text-align: right;"><button style="width: auto;" on:click={addOpportunity}>Add</button></div>
                    </div>
                    </div>
                    {/if}
                </div>
            </header>
        </div>
    {/if}
</div>
{/if}
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
    .infiltration-data {
        border: 1px solid #000;
        padding: 1%;
    }
    .leftandright{
        display: flex;
        justify-content: space-between;
    }

    .center {
        align-content: center;
        margin: 0 0 0;
    }
</style>