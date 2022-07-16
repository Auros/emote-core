<script>
    import '../app.scss';
    import Navbar from '$lib/components/Navbar.svelte';
</script>

<svelte:head>
    <title>Emote Core</title>
</svelte:head>

<Navbar />

<div class="container">
    <slot />
</div>
