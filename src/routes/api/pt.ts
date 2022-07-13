import download from "download";
import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

const prisma = new PrismaClient();

export const get: RequestHandler = async (event) => {
    const userCount = await prisma.user.count();

    await download('https://pbs.twimg.com/profile_images/1543587267364659200/JRWX5oU8_400x400.jpg', 'static/profiles', {
        filename: 'test.jpg'
    })

    return {
        body: {
            userCount,
            userAgent: event.request.headers.get('user-agent')
        }
    }
}