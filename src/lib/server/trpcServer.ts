import * as trpc from "@trpc/server";
import trpcTransformer from "trpc-transformer";
import type { inferAsyncReturnType } from "@trpc/server";

// optional
export const createContext = () => {
    // ...
    return {
        /** context data */
    };
};

// optional
export const responseMeta = () => {
    // ...d
    return {
        // { headers: ... }
    };
};

export const router = trpc
    .router<inferAsyncReturnType<typeof createContext>>()
    .transformer(trpcTransformer)
    // queries and mutations...
    .query('hello', {
        resolve: () => 'world',
    });

export type Router = typeof router;