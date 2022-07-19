<script>
    import pubEnv from '$lib/env/pubEnv';
    import { session } from '$app/stores';
    import logo from '$lib/logo.png'

    let active = false;
</script>

<nav class="navbar" aria-label="main navigation">
    <div class="container">
        <div class="navbar-brand">
            <a class="navbar-item" href="/">
                <img src={logo} alt="Emote Core Logo" />
            </a>

            <a
                href={null}
                role="button"
                class="navbar-burger"
                aria-label="menu"
                aria-expanded="false"
                class:is-active={active}
                on:click={() => (active = !active)}
            >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
            </a>
        </div>

        <div class="navbar-menu" class:is-active={active}>
            <div class="navbar-end">
                <div class="navbar-item">
                    {#if $session.user}
                        <div class="buttons">
                            {#if $session.user.role === 'ADMIN' || $session.user.role === 'SUPPORTER'}
                                <a class="button" href="/upload"> Upload An Emote </a>
                            {/if}
                            <a class="button" href="/user/{$session.user.id}">
                                {$session.user.username}
                            </a>
                            <a class="button" href="/api/auth/signout"> Logout </a>
                        </div>
                    {:else}
                        <div class="buttons">
                            <a class="button is-light" href="/api/auth/signin/discord?redirect={pubEnv.baseUrl}">
                                Log In
                            </a>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</nav>
