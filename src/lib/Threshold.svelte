<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { TJSContentEdit }     from '#standard/component';

    export let id;
    export let parentid;
    export let parentFlag;
    let content
    
    let data = Data.loadDataModel(id, constants.FLAGS.THRESHOLDS)
    if(data !=undefined){
        content = data.description
    }

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteThreshold(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.THRESHOLDS)
    }
</script>

{#if data != undefined}
<hr>
<div class="threshold">
<div class="center" style="width: 90%"><div style="width: 35px; float: left;"><strong><input type="number" style="width: 25px;" min="0" bind:value={data.thresholdValue} on:focusout={save} />:</strong></div> <div style="width: 90%; float: left;"><TJSContentEdit bind:content on:editor:save={() => { data.description = content; save()}} /></div></div>
<button style="width: auto; height: 37px;" on:click={deleteSelf}>Delete</button>
</div>
{/if}
<style>

.threshold{
    display: flex;
    justify-content: space-between;
}


.center{
        align-content: center;
        margin: 0 0 0;
}

</style>