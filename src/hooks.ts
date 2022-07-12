import auth from "./lib/auth";
import { router } from "$lib/trpcServer"
import type { Handle } from "@sveltejs/kit";
import { createTRPCHandle } from "trpc-sveltekit";

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