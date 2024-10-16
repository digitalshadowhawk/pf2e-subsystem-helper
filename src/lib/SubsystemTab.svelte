<script>
    import { ApplicationShell }   from '#runtime/svelte/component/core';
    import Research from './Research.svelte'
    import Influence from './Influence.svelte';
    import Chases from './Chases.svelte';
    import VictoryPoints from './VictoryPoints.svelte';

</script>

<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->

<div class="subsystems tab" data-tab="subsystems" data-region="subsystems">
<div class="content">
    <Research />
    <Influence />
    <Chases />
    <VictoryPoints />
</div>
</div>


<style>
.subsystems{
    display: block;
    position: relative;
    overflow-y: scroll;
    overflow-x: hidden;
    height: auto;
    max-height: 100%;
}
</style>