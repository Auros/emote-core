import pubEnv from '$lib/env/pubEnv';
import type { RequestEvent } from '@sveltejs/kit';
import prismaClient from '$lib/server/prismaClient';

export const get = async (event: RequestEvent) => {
    const verifiedSeries = await prismaClient.series.findMany({
        where: { verified: true },
        select: {
            id: true,
            name: true,
            emotes: {
                select: {
                    id: true,
                    name: true,
                    path: true
                }
            }
        }
    });

    const categories = verifiedSeries.map((s) => {
        return {
            id: s.id,
            name: s.name,
            emotes: s.emotes.map((e) => {
                return {
                    id: e.id,
                    name: e.name,
                    source: pubEnv.emoteCdn + e.path
                };
            })
        };
    });

    return {
        body: categories
    };
};
