<script>
    import { TJSContentEdit }     from '#standard/component';
    import { Data } from '../pf2e-subsystem-helper.js';

export let parentid;
export let parentFlag;
export let content;
export let field;

let data = Data.loadDataModel(parentid,parentFlag)

function save(){
    Data.saveDataModel(data, parentFlag)
}


</script>
<TJSContentEdit bind:content on:editor:save={() => { data[field] = content; save()}} />