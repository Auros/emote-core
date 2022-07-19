import type { RequestEvent } from '@sveltejs/kit';
import prismaClient from '$lib/server/prismaClient';

export const get = async (event: RequestEvent) => {
    const emoteId = event.params.emoteId as string;
    const platformIds = (event.params.platformIds as string).split(',');

    const emote = await prismaClient.emote.findUnique({
        where: { id: emoteId },
        select: {
            approverId: true,
            series: { select: { verified: true } }
        }
    });

    if (!emote) {
        return {
            status: 404,
            body: {
                errorMessage: 'Could not find emote.'
            }
        };
    }

    if (emote.series?.verified) {
        return {
            body: platformIds.map((p) => {
                return {
                    id: p,
                    permission: true
                };
            })
        };
    }

    const users = await prismaClient.user.findMany({
        where: { platformId: { in: platformIds } },
        select: { role: true, platformId: true, emotes: { select: { uploaderId: true } } }
    });

    const response = users.map((u) => {
        return {
            id: u.platformId,
            permission: u.role === 'ADMIN' || u.emotes.find((e) => e.uploaderId) !== undefined
        };
    });

    return {
        body: response
    };
};
