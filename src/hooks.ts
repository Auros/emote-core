import auth from '$lib/auth';
import type { User } from '@prisma/client';
import { createOrUpdateUser } from '$lib/utils';
import { createTRPCHandle } from 'trpc-sveltekit';
import type { DiscordProfile } from '$lib/auth/discord';
import type { GetSession, Handle } from '@sveltejs/kit';
import { createContext, responseMeta, router } from '$lib/server/trpcServer';

// noinspection JSUnusedGlobalSymbols
export const handle: Handle = async ({ event, resolve }) => {
    return await createTRPCHandle({
        // 👈 add this handle
        url: '/trpc',
        router,
        createContext,
        responseMeta,
        event,
        resolve
    });
};

// noinspection JSUnusedGlobalSymbols
export const getSession: GetSession = async (request) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { user } = (await auth.getSession(request)) as any;

    let ourUser: User | undefined;
    if (user) ourUser = await createOrUpdateUser(user);

    return { user: ourUser, profile: user as DiscordProfile };
};
