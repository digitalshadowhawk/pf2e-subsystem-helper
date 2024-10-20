<script>
    import { Data } from '../pf2e-subsystem-helper.js';
    import { ReputationsDataModel } from '../subsystem-data-models.js';
    import { ReputationDataModel } from '../subsystem-data-model-subtypes.js';
    import { constants } from '../constants.js';
    import Reputation from './Reputation.svelte';

    let reputationSubsystem = Data.loadDataModel('reputations') ?? new ReputationsDataModel();

    let display = "none" 
    if(game.settings.get(constants.ID, "Reputation")){
        display = "block"
    } else {
        display = "none"
    }

    function toggleReputations() {
        reputationSubsystem.visible = !reputationSubsystem.visible
        Data.saveDataModel(reputationSubsystem)
    }

    function toggleReference() {
        reputationSubsystem.displayReference = !reputationSubsystem.displayReference
        Data.saveDataModel(reputationSubsystem)
    }

    function addReputation() {
        reputationSubsystem.addReputation(new ReputationDataModel({}))
        Data.saveDataModel(reputationSubsystem)
    }
</script>


<div class="folder" style="display:{display}; width: 100%;">
    <button class="folder-header flexrow" on:click={toggleReputations}>{reputationSubsystem.subsystemName}</button>
    {#if reputationSubsystem.visible}
        {#each reputationSubsystem.reputations as reputation}
        <div class="reputation"><Reputation id={reputation} parentid={reputationSubsystem.id} parentFlag={constants.FLAGS.SUBSYSTEMS} /></div>
        {/each}
        <button class="sub-button" on:click={addReputation}>Add New Reputation</button>
        <button class="sub-button" on:click={toggleReference}>Reference</button>
        {#if reputationSubsystem.displayReference}
        <div class="reputation reference-data">
            <div class="flexrow">
                <div>Services</div>
                <div style="border-left:1px solid #000; padding-left: 1%;">Disservices</div>
            </div>
            <hr>
            <div class="flexrow">
                <div>Minor: {constants.REPUTATIONS.SERVICES.MINOR}</div>
                <div style="border-left:1px solid #000; padding-left: 1%;">Minor: {constants.REPUTATIONS.DISSERVICES.MINOR}</div>
            </div>
            <hr>
            <div class="flexrow">
                <div>Moderate: {constants.REPUTATIONS.SERVICES.MODERATE}</div>
                <div style="border-left:1px solid #000; padding-left: 1%;">Moderate: {constants.REPUTATIONS.DISSERVICES.MODERATE}</div>
            </div>
            <hr>
            <div class="flexrow">
                <div>Major: {constants.REPUTATIONS.SERVICES.MAJOR}</div>
                <div style="border-left:1px solid #000; padding-left: 1%;">Major: {constants.REPUTATIONS.DISSERVICES.MAJOR}</div>
            </div>
        </div>
        {/if}
    {/if}
</div>

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
    .reference-data {
        border: 1px solid #000;
        padding: 1%;
    }
    .reputation, .sub-button {
        margin-left: 1%;
    }
</style>