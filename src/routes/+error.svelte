<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    onMount(() => {
        setTimeout(() => {
            window.history.back();
        }, 3000);
    });
</script>

<div class="error-container">
    <h1 class="error-title">Error {$page.status}</h1>
    <p class="error-message">{$page.error?.message}</p>
    <p class="redirect-message">You will be redirected in a moment. If the redirection does not occur, <a href="/login" class="redirect-link">click here</a>.</p>
</div>

<style>
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        font-family: Arial, sans-serif;
        color: #333;
        background-color: #f9f9f9;
        padding: 20px;
    }

    .error-title {
        font-size: 2rem;
        color: #d9534f;
        margin-bottom: 10px;
    }

    .error-message {
        font-size: 1.2rem;
        margin-bottom: 20px;
    }

    .redirect-message {
        font-size: 1rem;
        color: #555;
    }

    .redirect-link {
        color: #0275d8;
        text-decoration: none;
    }

    .redirect-link:hover {
        text-decoration: underline;
    }
</style>