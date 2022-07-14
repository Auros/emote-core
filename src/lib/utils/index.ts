import fs from 'fs';
import download from 'download';
import prismaClient from '$lib/server/prismaClient';
import type { DiscordProfile } from '$lib/auth/discord';

export async function createOrUpdateUser(profile: DiscordProfile) {
    let user = await prismaClient.user.findUnique({
        where: {
            id: profile.id
        }
    });

    const name = `${profile.id}-${profile.avatar}.png`;
    const lPFP = `/profiles/${name}`;

    if (user) {
        if (user.pfp !== lPFP) {
            await createPFP(profile);
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

    await createPFP(profile);
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

async function createPFP(profile: DiscordProfile) {
    const url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=256`;
    const name = `${profile.id}-${profile.avatar}.png`;

    if (!fs.existsSync(`static/profiles/${name}`)) {
        await download(url, 'static/profiles', {
            filename: name
        });
    }
}
