import auth from "./lib/auth";
import { router } from "./lib/server/trpcServer"
import { createTRPCHandle } from "trpc-sveltekit";
import type { GetSession, Handle } from "@sveltejs/kit";

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
export const getSession: GetSession = async (request) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { user } = await auth.getSession(request);

    return { user };
};