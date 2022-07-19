import pubEnv from '$lib/env/pubEnv';
import type { RequestEvent } from '@sveltejs/kit';
import prismaClient from '$lib/server/prismaClient';

export const get = async (event: RequestEvent) => {
    const emoteId = event.params.emoteId as string;

    const emote = await prismaClient.emote.findUnique({
        where: { id: emoteId },
        select: {
            id: true,
            name: true,
            path: true
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

    return {
        body: {
            id: emote.id,
            name: emote.name,
            source: pubEnv.emoteCdn + emote.path
        }
    };
};
