<script>
    import { ApplicationShell }   from '#runtime/svelte/component/core';
    import Research from './Research.svelte'
    import Influence from './Influence.svelte';
    import VictoryPoints from './VictoryPoints.svelte';

</script>

<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->

<div class="subsystems">
<Research />
<Influence />
<VictoryPoints />
</div>


<style>
.subsystems{
    display: block;
    position: relative;
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    height: auto;
    max-height: 100%;
}
</style>