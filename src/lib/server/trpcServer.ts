import auth from '$lib/auth';
import * as trpc from '@trpc/server';
import type { User } from '@prisma/client';
import trpcTransformer from 'trpc-transformer';
import { createOrUpdateUser } from '$lib/utils';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

// optional
export const createContext = async (event: RequestEvent) => {
    const session = await auth.getSession(event);
    let user: User | undefined;
    if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user = await createOrUpdateUser(session.user as any);
    }
    return {
        user,
        profile: session.user
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
        resolve: () => 'world'
    });

export type Router = typeof router;
