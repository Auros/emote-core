<script>
    import pubEnv from '$lib/env/pubEnv';
    import { session } from '$app/stores';
</script>

<nav class="navbar" aria-label="main navigation">
    <div class="container">
        <div class="navbar-brand">
            <a class="navbar-item" href="/">
                <img src="/favicon.png" alt="Emote Core Logo" />
            </a>

            <a href={null} role="button" class="navbar-burger" aria-label="menu" aria-expanded="false">
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
            </a>
        </div>

        <div class="navbar-menu">
            <div class="navbar-start" />

            <div class="navbar-end">
                <div class="navbar-item">
                    {#if $session.user}
                        <div class="buttons">
                            <a class="button" href="/user/{$session.user.id}">
                                {$session.user.username}
                            </a>
                            <a class="button" href="/api/auth/signout"> Logout </a>
                        </div>
                    {:else}
                        <div class="buttons">
                            <a class="button is-light" href="/api/auth/signin/discord?redirect={pubEnv.baseUrl}">
                                Log in
                            </a>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</nav>
