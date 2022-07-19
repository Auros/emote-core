<script lang="ts" context="module">
    import trpcClient from '$lib/trpcClient';
    import type { Load } from '@sveltejs/kit';

    export const load: Load = async ({ params, fetch }) => {
        const body = await trpcClient(fetch).query('emotes.full', params.id);
        return {
            status: body ? 200 : 404,
            props: { body }
        };
    };
</script>

<script lang="ts">
    import moment from 'moment';
    import { onMount } from 'svelte';
    import pubEnv from '$lib/env/pubEnv';
    import { session } from '$app/stores';
    import AutoComplete from 'simple-svelte-autocomplete';
    import type { Emote, Series, User } from '@prisma/client';

    let seriesVerified;
    let text = 'No Series';
    let seriesNames: string[] = [];
    let selectedSeriesName: string;
    let allVerifiedSeries: Series[] = [];
    let selectedSeries: Series | null = null;

    interface EmoteBody {
        uploader: User;
        emote: Emote;
        tags: string[];
        series?: Series;
    }

    export let body: EmoteBody;

    onMount(loadSeries);

    async function loadSeries() {
        allVerifiedSeries = await trpcClient().query('series.all');
        seriesNames = allVerifiedSeries.map((a) => a.name);

        const emoteSeries = allVerifiedSeries.find((s) => s.id == body.emote.seriesId);
        selectedSeriesName = emoteSeries?.name ?? '';
        text = emoteSeries?.name ?? 'No Series';

        seriesVerified = emoteSeries?.verified;
        selectedSeries = emoteSeries;
    }

    function handleCreate(name: string) {
        seriesNames.unshift(name);
        seriesNames = seriesNames;
        return name;
    }

    async function updateSeries() {
        await trpcClient().mutation('series.assign', {
            emoteId: body.emote.id,
            name: selectedSeriesName
        });
        location.reload();
    }

    async function verificationChanged() {
        if (!selectedSeries) return;

        await trpcClient().mutation('series.verification', {
            id: selectedSeries.id,
            value: seriesVerified
        });
        await loadSeries();
    }
</script>

<div class="section">
    <div class="box">
        <article class="media">
            <figure class="media-left">
                <p class="image is-128x128">
                    <img src={`${pubEnv.emoteCdn}${body.emote.path}`} alt="Emote" />
                </p>
            </figure>
            <div class="media-content">
                <div class="content">
                    <h1><strong>{body.emote.name}</strong></h1>
                    <div class="tags">
                        {#each body.tags as tag}
                            <span class="tag is-link">{tag}</span>
                        {/each}
                    </div>
                    <small>{moment(body.emote.uploaded).calendar()}</small>
                    <br />
                </div>
            </div>
            {#if $session.user && ($session.user.role === 'ADMIN' || $session.user.role === 'SUPPORTER')}
                <div class="media-right">
                    <p class="image is-64x64">
                        <img class="is-rounded" src={body.uploader.pfp} alt="Uploader" />
                    </p>
                    <hr />
                    <div class="field has-addons">
                        <div class="control">
                            <AutoComplete
                                items={seriesNames}
                                bind:selectedItem={selectedSeriesName}
                                bind:text
                                create={true}
                                onCreate={handleCreate}
                            />
                        </div>
                        <div class="control">
                            <button class="button is-info is-small" on:click={updateSeries}> Update Series </button>
                        </div>
                    </div>
                    {#if selectedSeries && $session.user.role === 'ADMIN'}
                        <hr />
                        <div class="field">
                            <div class="control">
                                <label class="checkbox">
                                    <input
                                        type="checkbox"
                                        bind:checked={seriesVerified}
                                        on:change={verificationChanged}
                                    />
                                    Verified (Series)
                                </label>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        </article>
    </div>
</div>
