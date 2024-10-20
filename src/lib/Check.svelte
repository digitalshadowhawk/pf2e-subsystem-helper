<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';

    export let id;
    export let parentid
    export let parentFlag
    let data = Data.loadDataModel(id, constants.FLAGS.CHECKS)
    
    let content
    if(data !=undefined){
        content = data.getEnricher()
    }

    function deleteSelf() {        
        parent = Data.loadDataModel(parentid, parentFlag)
        try {
            parent?.deleteCheck(id)
        } catch (error){}
        try {
            parent?.deleteDiscoveryCheck(id)
        } catch (error){}
        Data.saveDataModel(parent, parentFlag)
    }

    function save(){
        Data.saveDataModel(data, constants.FLAGS.CHECKS)
        content =data.getEnricher()
    }

    function postToChat() {
        ChatMessage.create({content: content})
    }

</script>
{#if data != undefined}
<div class="leftandright">
<div class="center">DC <input type="number" style="width: 30px;" min="0" bind:value={data.dc} on:focusout={save} /> <input style="width: 120px;" min="0" bind:value={data.checkType} on:focusout={save} /> check</div>
<div><button class="folder-header flexrow" on:click={postToChat}>Post Check</button></div>
<button style="width: auto;" on:click={deleteSelf}>Delete</button>
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