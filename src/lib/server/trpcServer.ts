import z from 'zod';
import auth from '$lib/auth';
import * as trpc from '@trpc/server';
import { Role } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import trpcTransformer from 'trpc-transformer';
import { createOrUpdateUser } from '$lib/utils';
import type { User } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prismaClient from '$lib/server/prismaClient';
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

const createRouter = () => {
    return trpc.router<inferAsyncReturnType<typeof createContext>>();
};

export type Router = typeof router;

const users = createRouter()
    .query('find', {
        input: z.string(),
        async resolve({ input }) {
            return prismaClient.user.findUnique({ where: { id: input } });
        }
    })
    .mutation('role', {
        input: z.object({
            id: z.string(),
            role: z.nativeEnum(Role)
        }),
        async resolve({ ctx, input }) {
            if (ctx.user?.role !== 'ADMIN') throw new TRPCError({ code: 'UNAUTHORIZED' });

            const user = await prismaClient.user.findUnique({ where: { id: input.id } });
            if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

            if (user.role == input.role) throw new TRPCError({ code: 'BAD_REQUEST' });

            await prismaClient.user.update({
                where: { id: input.id },
                data: { role: input.role }
            });
        }
    });
const appRouter = createRouter()
    .transformer(trpcTransformer)
    .merge('users.', users)
    .query('hello', {
        resolve: () => 'world'
    });

export const router = appRouter;
