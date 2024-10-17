<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { TJSContentEdit }     from '#standard/component';

    export let id;
    export let parentid
    export let parentFlag
    let data = Data.loadDataModel(id, constants.FLAGS.CHECKS)
    let content = data.getEnricher()
    
    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        if(parent.checks.indexOf(data.id) != -1){
            parent.checks.splice(parent.checks.indexOf(data.id),1)
        } else if(parent.discoveries.indexOf(data.id) != -1){
            parent.discoveries.splice(parent.discoveries.indexOf(data.id),1)
        }
        Data.saveDataModel(parent, parentFlag)
        Data.deleteFlag(data.id, constants.FLAGS.CHECKS)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.CHECKS)
        content =data.getEnricher()
    }

    function postToChat() {
        ChatMessage.create(new ChatMessage({content: content}))
    }

</script>
<div class="leftandright">
<div class="center">DC <input type="number" style="width: 30px;" min="0" bind:value={data.dc} on:focusout={save} /> <input style="width: 120px;" min="0" bind:value={data.checkType} on:focusout={save} /> check</div>
<div><button class="folder-header flexrow" on:click={postToChat}>Post Check</button></div>
<button style="width: auto;" on:click={deleteSelf}>Delete</button>
</div>

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