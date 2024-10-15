<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';

    export let id;
    let data = Data.loadDataModel(id, constants.FLAGS.COUNTERS)


    function reloadData() {
        data = Data.loadDataModel(id, constants.FLAGS.COUNTERS)
    }


</script>
    <div class="counter-data">
        <main>
            <div style="float: left;">{data.name}</div>
            <div style="float: right;">Points: {data.points}</div>
            <div style="clear:both;"></div>
        </main> 
    </div>

<style>
    .counter-data {
        border: 1px solid #000;
        padding: 1%;
    }
</style>