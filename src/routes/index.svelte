<script lang="ts">
    import { onMount } from 'svelte';
    import { Emote } from '@prisma/client';
    import trpcClient from '$lib/trpcClient';
    import EmoteGrid from '$lib/components/EmoteGrid.svelte';

    let emotes: Emote[] = [];
    let searchBy = '';

    onMount(async () => {
        await search();
    });

    async function search() {
        emotes = await trpcClient().query('emotes.search', searchBy);
    }
</script>

<section class="section">
    <div class="field is-grouped">
        <p class="control is-expanded">
            <input
                class="input is-large"
                type="text"
                placeholder="...search for an emote"
                bind:value={searchBy}
                on:change={search}
            />
        </p>
        <p class="control">
            <button class="button is-large is-info" on:click={search}> Search </button>
        </p>
    </div>
</section>

<section class="section">
    <EmoteGrid {emotes} />
</section>
