<script lang="ts" context="module">
    import trpcClient from '$lib/trpcClient';
    import type { Load } from '@sveltejs/kit';

    export const load: Load = async ({ params, fetch }) => {
        const user = await trpcClient(fetch).query('users.find', params.id);
        return {
            status: user ? 200 : 404,
            props: { user }
        };
    };
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { session } from '$app/stores';
    import type { User, Role } from '@prisma/client';

    export let user: User;
    let selectedRole: Role;
    let selectedPlatformId: string | null;

    function canUpdateRole(role: Role) {
        return role !== user.role && user.role === 'ADMIN';
    }

    async function updateRole() {
        user.role = selectedRole;
        await trpcClient().mutation('users.role', { id: user.id, role: selectedRole });
    }

    async function updatePlatformId() {
        user.platformId = selectedPlatformId;
        await trpcClient().mutation('users.platform', { userId: user.id, platformId: selectedPlatformId });
    }

    onMount(() => {
        selectedRole = user.role;
        selectedPlatformId = user.platformId;
    });
</script>

<section class="section">
    <div class="box">
        <div class="columns">
            <div class="column">
                <h1 class="title">{user.username}</h1>
                <figure class="image is-128x128">
                    <img class="is-rounded" src={user.pfp} alt={`${user.username}'s Profile Icon`} />
                </figure>
            </div>
            <div class="column">
                <p class="subtitle">Account Role: {user.role}</p>
                {#if $session.user && $session.user.role === 'ADMIN'}
                    <div class="field has-addons">
                        <div class="select">
                            <select bind:value={selectedRole}>
                                <option value="USER">User</option>
                                <option value="BANNED">Banned</option>
                                <option value="SUPPORTER">Supporter</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div class="control">
                            <button class="button" disabled={!canUpdateRole(selectedRole)} on:click={updateRole}>
                                Apply
                            </button>
                        </div>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input
                                class="input"
                                type="text"
                                placeholder="76561198088728803"
                                bind:value={selectedPlatformId}
                            />
                        </div>
                        <div class="control">
                            <button class="button" on:click={updatePlatformId}> Apply </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</section>
