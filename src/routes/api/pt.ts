import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

const prisma = new PrismaClient();

export const get: RequestHandler = async (event) => {
    const userCount = await prisma.user.count()
    return {
        body: {
            userCount,
            userAgent: event.request.headers.get('user-agent')
        }
    }
}