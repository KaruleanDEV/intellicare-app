<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let { data }: { data: PageData } = $props();

    onMount(() => {
    goto('/private/dashboard');
});
</script>

