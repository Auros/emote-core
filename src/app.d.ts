/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

declare namespace App {
    // interface Locals {}
    // interface Platform {}
    interface Session {
        user?: import('@prisma/client').User;
        profile?: import('$lib/auth/discord').DiscordUser;
    }
    // interface Stuff {}
}
