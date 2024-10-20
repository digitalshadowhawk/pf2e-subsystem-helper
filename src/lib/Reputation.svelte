<script>
    import { Data, Helper } from '../pf2e-subsystem-helper.js';
    import { constants } from '../constants.js';
    import { TJSContentEdit }     from '#standard/component';
    import Enricher from './Enricher.svelte'

    export let id;
    export let parentid;
    export let parentFlag;
    let content

    let data = Data.loadDataModel(id, constants.FLAGS.REPUTATIONS)
    if(data !=undefined){
        content = data.name;
    }

    function deleteSelf() {
        parent = Data.loadDataModel(parentid, parentFlag)
        parent.deleteReputation(id)
        Data.saveDataModel(parent, parentFlag)
    }

    function toggleReputation() {
        data.visible = !data.visible
        Data.saveDataModel(data, constants.FLAGS.REPUTATIONS)
    }

    function toggleEffects() {
        data.effectsVisible = !data.effectsVisible
    }

    function getSlug(slug) {
        return data.getSlug(slug)
    }

    function save(){
        data.updateFromPoints()
        Data.saveDataModel(data, constants.FLAGS.REPUTATIONS)
    }

</script>
{#if data != undefined}
<div class="folder">
    <button class="folder-header flexrow" on:click={toggleReputation}>{data.name}</button>
    {#if data.visible}
        <div class="library-data">
            <header>
                <div class="flexrow">
                    <div class="center" style="width: 25%;"><TJSContentEdit bind:content on:editor:save={() => { data.name = content; save()}} /></div>
                    <div class="center">Points: <input type="number" style="width: 30px;" min="0" bind:value={data.points} on:focusout={save} /></div>
                    <div class="center">Reputation: {data.reputation}</div>
                    <div style="text-align: right;"><button style="width: auto;" on:click={deleteSelf}>Delete</button></div>
                </div>
                <hr>
                <div>
                    <div>Raised By: {getSlug("RAISED")}</div>
                    <hr>
                    <div>Lowered By: {getSlug("LOWERED")}</div>
                    <hr>
                    <div>Effect: 
                    {#if data[data.reputation].overrides != true }
                        <Enricher content={getSlug("EFFECT")}/><br><br>
                    {/if}
                        <Enricher content={data[data.reputation].value} />
                    </div>
                    <button style="margin-top: 5px;" on:click={toggleEffects}>Custom Effects</button>
                    {#if data.effectsVisible}
                        <div>
                            <div style="margin-top: 5px;">Revered: <br><input style="width: 85%;" bind:value={data.Revered.value} on:focusout={save} /> Override: <input type="checkbox" bind:checked={data.Revered.overrides} /></div>
                            <div style="margin-top: 5px;">Admired: <br><input style="width: 85%;" bind:value={data.Admired.value} on:focusout={save} /> Override: <input type="checkbox" bind:checked={data.Admired.overrides} /></div>
                            <div style="margin-top: 5px;">Liked: <br><input style="width: 85%;" bind:value={data.Liked.value} on:focusout={save} /> Override: <input type="checkbox" bind:checked={data.Liked.overrides} /></div>
                            <div style="margin-top: 5px;">Ignored: <br><input style="width: 85%;" bind:value={data.Ignored.value} on:focusout={save} /> Override: <input type="checkbox" bind:checked={data.Ignored.overrides} /></div>
                            <div style="margin-top: 5px;">Disliked: <br><input style="width: 85%;" bind:value={data.Disliked.value} on:focusout={save} /> Override: <input type="checkbox" bind:checked={data.Disliked.overrides} /></div>
                            <div style="margin-top: 5px;">Hated: <br><input style="width: 85%;" bind:value={data.Hated.value} on:focusout={save} /> Override: <input type="checkbox" bind:checked={data.Hated.overrides} /></div>
                            <div style="margin-top: 5px;">Hunted: <br><input style="width: 85%;" bind:value={data.Hunted.value} on:focusout={save} /> Override: <input type="checkbox" bind:checked={data.Hunted.overrides} /></div>
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
    .library-data {
        border: 1px solid #000;
        padding: 1%;
    }

    .center {
        align-content: center;
        margin: 0 0 0;
    }
</style>