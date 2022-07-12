<script lang="ts">
    import { session } from "$app/stores";
    import trpcClient from "$lib/trpcClient";
    import pubEnv from "$lib/env/pubEnv";

    let greeting = '<null>';

    async function rpcTest() {
        greeting = await trpcClient.query('hello');
    }

</script>

<h1>{greeting}</h1>
<h3>{pubEnv.test}</h3>
<button on:click={rpcTest}>rpc test</button>
<a href="/api/auth/signin/discord?redirect=https://localhost:3000/">login</a>

{#if $session.user}
    {JSON.stringify($session.user)}
{/if}