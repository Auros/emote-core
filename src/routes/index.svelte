<script lang="ts">
    import pubEnv from '$lib/env/pubEnv';
    import { session } from '$app/stores';
    import trpcClient from '../lib/trpcClient';

    let greeting = '<null>';

    async function rpcTest() {
        greeting = await trpcClient.query('hello');
    }
</script>

<h1>{greeting}</h1>
<h3>{pubEnv.test}</h3>
<button on:click={rpcTest}>rpc test</button>
<a href="/api/auth/signin/discord?redirect=https://localhost:3000/">login</a>

<hr />

{#if $session.user}
    {JSON.stringify($session.user)}
    <hr />
    <img src={$session.user.pfp} alt='test'>
{/if}

<hr />

{#if $session.profile}
    {JSON.stringify($session.profile)}
{/if}
