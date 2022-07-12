import { createTRPCHandle } from 'trpc-sveltekit';
import type { Handle } from "@sveltejs/kit";
import { router } from '$lib/trpcServer'
import auth from "./lib/auth";

// noinspection JSUnusedGlobalSymbols
export const handle: Handle = async ({ event, resolve }) => {

    const response = await createTRPCHandle({ // 👈 add this handle
        url: '/trpc',
        router,
        event,
        resolve
    });

    return response;
};

// noinspection JSUnusedGlobalSymbols
export const { getSession } = auth;