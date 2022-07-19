// eslint-disable-next-line
// @ts-ignore
import md5ToUuid from 'md5-to-uuid';

import pubEnv from '$lib/env/pubEnv';
import { Md5 } from 'ts-md5/dist/md5';
import type { RequestEvent } from '@sveltejs/kit';
import prismaClient from '$lib/server/prismaClient';

export const get = async (event: RequestEvent) => {
    const platformId = event.params.platformId as string;
    const userWithEmotes = await prismaClient.user.findFirst({
        where: { platformId },
        select: {
            username: true,
            emotes: {
                select: {
                    id: true,
                    name: true,
                    path: true
                }
            }
        }
    });

    if (!userWithEmotes) {
        return {
            status: 404,
            body: {
                errorMessage: 'User does not exist.'
            }
        };
    }

    const hash = Md5.hashStr(platformId);
    const generatedId = md5ToUuid(hash);

    // eslint-disable-next-line no-unused-labels
    const emotes = userWithEmotes.emotes.map((e) => {
        return {
            id: e.id,
            name: e.name,
            source: pubEnv.emoteCdn + e.path
        };
    });

    return {
        body: {
            id: generatedId,
            name: `${userWithEmotes.username}`,
            emotes
        }
    };
};
