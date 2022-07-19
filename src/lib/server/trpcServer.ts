import z from 'zod';
import axios from 'axios';
import auth from '$lib/auth';
import * as trpc from '@trpc/server';
import { Role } from '@prisma/client';
import privEnv from '$lib/env/privEnv';
import { TRPCError } from '@trpc/server';
import type { User } from '@prisma/client';
import trpcTransformer from 'trpc-transformer';
import { createOrUpdateUser } from '$lib/utils';
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
    })
    .mutation('platform', {
        input: z.object({
            userId: z.string(),
            platformId: z.string().nullable()
        }),
        async resolve({ ctx, input }) {
            if (ctx.user?.role !== 'ADMIN') throw new TRPCError({ code: 'UNAUTHORIZED' });

            await prismaClient.user.update({
                where: { id: input.userId },
                data: { platformId: input.platformId }
            });
        }
    });

const tags = createRouter().query('all', {
    async resolve({ ctx }) {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });

        // Load all the tags that are verified.
        const tags = await prismaClient.tag.findMany({
            where: {
                verified: true
            }
        });
        return tags.map((t) => t.name);
    }
});

const series = createRouter()
    .query('all', {
        async resolve({ ctx }) {
            if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });

            return prismaClient.series.findMany();
        }
    })
    .mutation('assign', {
        input: z.object({
            emoteId: z.string(),
            name: z.string()
        }),
        async resolve({ ctx, input }) {
            if (!ctx.user || (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPPORTER'))
                throw new TRPCError({ code: 'UNAUTHORIZED' });

            let emote = await prismaClient.emote.findUnique({
                where: { id: input.emoteId }
            });

            if (!emote) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Emote does not exist.' });

            let series = await prismaClient.series.findFirst({
                where: { name: input.name }
            });

            if (!series) {
                series = await prismaClient.series.create({
                    data: {
                        name: input.name,
                        creatorId: ctx.user.id,
                        verified: ctx.user.role === 'ADMIN'
                    }
                });
            }

            emote = await prismaClient.emote.update({
                where: { id: emote.id },
                data: { seriesId: series.id },
                include: {
                    uploader: true,
                    series: true
                }
            });

            return {
                emote,
                series
            };
        }
    })
    .mutation('verification', {
        input: z.object({
            id: z.string(),
            value: z.boolean()
        }),
        async resolve({ ctx, input }) {
            if (!ctx.user || ctx.user.role !== 'ADMIN') throw new TRPCError({ code: 'UNAUTHORIZED' });

            const series = await prismaClient.series.findUnique({
                where: { id: input.id }
            });

            if (!series) throw new TRPCError({ code: 'NOT_FOUND', message: 'Series does not exist' });

            await prismaClient.series.update({
                where: { id: series.id },
                data: { verified: input.value }
            });
        }
    });

const emotes = createRouter()
    .query('search', {
        input: z.string().nullable().optional(),
        resolve({ input }) {
            if (input) {
                return prismaClient.emote.findMany({
                    where: {
                        name: {
                            contains: input,
                            mode: 'insensitive'
                        }
                    },
                    orderBy: { uploaded: 'desc' },
                    take: 50
                });
            }

            return prismaClient.emote.findMany({
                orderBy: { uploaded: 'desc' },
                take: 50
            });
        }
    })
    .query('full', {
        input: z.string(),
        async resolve({ input }) {
            const emote = await prismaClient.emote.findUnique({
                where: { id: input },
                select: {
                    id: true,
                    name: true,
                    path: true,
                    uploaded: true,
                    uploader: {
                        select: {
                            id: true,
                            username: true,
                            pfp: true
                        }
                    },
                    status: true,
                    seriesId: true,

                    emoteTags: {
                        select: {
                            tag: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            });

            if (!emote) return null;

            const tags = emote.emoteTags.map((et) => et.tag.name);

            return {
                uploader: emote.uploader,
                emote,
                tags
            };
        }
    })
    .mutation('create', {
        input: z.object({
            id: z.string(),
            name: z.string(),
            tags: z.string().array().max(20, 'Too many tags! You can only add a maximum of 20 tags to an emote.')
        }),
        async resolve({ ctx, input }) {
            if (!ctx.user || (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPPORTER'))
                throw new TRPCError({ code: 'UNAUTHORIZED' });

            const verifiableUser = ctx.user.role === 'ADMIN' || ctx.user.role === 'SUPPORTER';
            // Let's verify that the image exists via cloudflare's API
            try {
                const response = await axios.get(
                    `https://api.cloudflare.com/client/v4/accounts/${privEnv.cloudflareAccountId}/images/v1/${input.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${privEnv.cloudflareApiKey}`
                        }
                    }
                );

                if (response.data.result.meta.creatorId != ctx.user.id) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: `Unable to create an image that you did not initialize.`
                    });
                }
            } catch (e) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Unable to verify image upload with the ID ${input.id}`
                });
            }

            const allTags = input.tags.map((t) => t.toString());
            let tags = await prismaClient.tag.findMany({
                where: {
                    name: { in: allTags }
                }
            });

            const tagsToCreate = [];
            for (let i = 0; i < allTags.length; i++) {
                const cT = allTags[i];
                if (tags.some((t) => t.name.toLowerCase() == cT.toLowerCase())) continue;
                tagsToCreate.unshift({
                    name: cT,
                    verified: verifiableUser
                });
            }

            if (tagsToCreate.length > 0) {
                await prismaClient.tag.createMany({
                    data: tagsToCreate
                });

                const createdArray = tagsToCreate.map((t) => t.name);
                const recentlyAdded = await prismaClient.tag.findMany({
                    where: {
                        name: { in: createdArray }
                    }
                });
                tags = tags.concat(recentlyAdded);
            }

            const emote = await prismaClient.emote.create({
                data: {
                    id: input.id,
                    name: input.name,
                    path: `/cdn-cgi/imagedelivery/${privEnv.cloudflareAccountHash}/${input.id}/${privEnv.cloudflareImageVariantName}`,
                    uploaderId: ctx.user.id,
                    status: verifiableUser ? 'APPROVED' : 'PENDING'
                }
            });

            const emoteTags = [];
            for (let i = 0; i < tags.length; i++) {
                const tag = tags[i];
                emoteTags.push({
                    tagId: tag.id,
                    emoteId: emote.id
                });
            }

            await prismaClient.emoteTag.createMany({
                data: emoteTags
            });

            return prismaClient.emote.findUnique({
                where: {
                    id: emote.id
                },
                include: {
                    emoteTags: true
                }
            });
        }
    });

const appRouter = createRouter()
    .transformer(trpcTransformer)
    .merge('series.', series)
    .merge('emotes.', emotes)
    .merge('users.', users)
    .merge('tags.', tags)
    .query('hello', {
        resolve: () => 'world'
    });

export const router = appRouter;
