<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    export let id;
    let data = Data.loadDataModel(id, constants.FLAGS.CHECKS)
</script>

<div>DC {data.dc} {data.checkType} check</div>