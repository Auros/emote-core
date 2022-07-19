import axios from 'axios';
import FormData from 'form-data';
import pubEnv from '$lib/env/pubEnv';
import privEnv from '$lib/env/privEnv';
import prismaClient from '$lib/server/prismaClient';
import type { DiscordProfile } from '$lib/auth/discord';

export async function createOrUpdateUser(profile: DiscordProfile) {
    let user = await prismaClient.user.findUnique({
        where: {
            id: profile.id
        }
    });

    const id = `${profile.id}-${profile.avatar}`
    const lPFP = `${pubEnv.emoteCdn}/cdn-cgi/imagedelivery/${privEnv.cloudflareAccountHash}/${id}/${privEnv.cloudflareImageVariantName}`;
    const discordPFP = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=256`;

    if (user) {
        if (user.pfp !== lPFP) {
            await createPFP(id, profile.id, discordPFP);
            await prismaClient.user.update({
                where: { id: profile.id },
                data: { pfp: lPFP }
            });
        }
        if (user.username !== profile.username) {
            await prismaClient.user.update({
                where: { id: profile.id },
                data: { username: profile.username }
            });
        }
        if (user.discriminator !== profile.discriminator) {
            await prismaClient.user.update({
                where: { id: profile.id },
                data: { username: profile.discriminator }
            });
        }
        return user;
    }

    await createPFP(id, profile.id, discordPFP);
    user = await prismaClient.user.create({
        data: {
            pfp: lPFP,
            role: 'USER',
            id: profile.id,
            username: profile.username,
            discriminator: profile.discriminator
        }
    });

    return user;
}

async function createPFP(id: string, userId: string, url: string) {
    const form = new FormData();
    form.append('url', url);
    form.append(
        'metadata',
        JSON.stringify({
            role: `pfp`,
            userId
        })
    )

    console.log(id)
    form.append('id', id)
    console.log(form)

    const reqUrl = `https://api.cloudflare.com/client/v4/accounts/${privEnv.cloudflareAccountId}/images/v1`
    try {
        const response = await axios.post(reqUrl, form, {
            headers: {
                Authorization: `Bearer ${privEnv.cloudflareApiKey}`
            }
        });
    } catch (e) {
        //console.log(e.response);
    }
}
