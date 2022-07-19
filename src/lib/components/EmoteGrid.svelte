<script lang="ts">
    import pubEnv from '$lib/env/pubEnv';
    import type { Emote } from '@prisma/client';

    export let emotes: Emote[] = [];
</script>

<div class="columns is-multiline is-centered">
    {#each emotes as emote}
        <div class="column is-2">
            <div class="card">
                <div class="card-image">
                    <a class="image" href={`/emote/${emote.id}`}>
                        <img src={pubEnv.emoteCdn + emote.path} alt="Emote" />
                    </a>
                </div>
                <div class="card-content has-text-centered">
                    <h1 class="subtitle">{emote.name}</h1>
                </div>
            </div>
        </div>
    {/each}
</div>
