<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { TJSContentEdit }     from '#standard/component';

    export let id;
    export let parentid;
    export let parentFlag;

    let data = Data.loadDataModel(id, constants.FLAGS.COUNTERS)
    let content = data.name


    function reloadData() {
        data = Data.loadDataModel(id, constants.FLAGS.COUNTERS)
    }

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.counters.splice(parent.counters.indexOf(data.id),1)
        Data.saveDataModel(parent, parentFlag)
        Data.deleteFlag(data.id, constants.FLAGS.COUNTERS)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.COUNTERS)
    }


</script>
    <div class="counter-data">
        <main class="leftandright">
            <div style="width:200px;">
                <TJSContentEdit bind:content on:editor:save={() => { data.name = content; save()}} />
            </div>
            <div class="leftandright">
                <div class="center"><input type="number" style="width: 30px;" min="0" bind:value={data.points} on:focusout={save} /> Points </div>
                <button style="width: auto;" on:click={deleteSelf}>Delete</button>
            </div>
        </main> 
    </div>

<style>
    .counter-data {
        border: 1px solid #000;
        padding: 1%;
    }

    .leftandright{
        display: flex;
        justify-content: space-between;
    }

    .center{
        align-content: center;
        margin: 0 0 0;
    }
</style>