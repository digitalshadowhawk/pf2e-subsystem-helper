<script>
    import { TJSContentEdit }     from '#standard/component';
    import { Helper } from '../pf2e-subsystem-helper.js';

export let content;
let options = { editable: false }
</script>
<TJSContentEdit {options} bind:content />