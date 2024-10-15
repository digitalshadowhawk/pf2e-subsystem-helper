<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    export let id;
    let data = Data.loadDataModel(id, constants.FLAGS.THRESHOLDS)
</script>

<hr>
<div><strong>{data.thresholdValue}:</strong> {data.description}</div>