<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { TJSContentEdit }     from '#standard/component';

    export let id;
    export let parentid;
    export let parentFlag;
    export let hideDelete = false;
    let content

    let data = Data.loadDataModel(id, constants.FLAGS.COUNTERS)
    if(data !=undefined){
        content = data.name
    }

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteCounter(id)
        Data.saveDataModel(parent, parentFlag)
    }

    async function save(){
        await Data.saveDataModel(data, constants.FLAGS.COUNTERS)
    }


</script>

{#if data != undefined}
    <div>
        <main class="leftandright">
            <div style="width:200px;">
                <TJSContentEdit bind:content on:editor:save={() => { data.name = content; save()}} />
            </div>
            <div class="leftandright">
                <div class="center"><input type="number" style="width: 30px;" min="0" bind:value={data.points} on:focusout={save} /> Points </div>
                {#if !hideDelete}
                <button style="width: auto;" on:click={deleteSelf}>Delete</button>
                {/if}
            </div>
        </main> 
    </div>
{/if}
<style>

    .leftandright{
        display: flex;
        justify-content: space-between;
    }

    .center{
        align-content: center;
        margin: 0 0 0;
    }
</style>