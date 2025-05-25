<script lang="ts">
	/**
	 * Root layout component for the application.
	 *
	 * This component handles:
	 * - Importing global styles.
	 * - Managing user authentication state using Supabase.
	 * - Invalidating the 'supabase:auth' cache when the session expires.
	 * - Subscribing to authentication state changes and unsubscribing on component unmount.
	 *
	 * @param {object} data - The data passed to the layout, containing the Supabase session and client.
	 * @param {object} children - The child components to be rendered within the layout.
	 */
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>


{@render children()}