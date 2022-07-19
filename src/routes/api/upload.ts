import axios from 'axios';
import auth from '$lib/auth';
import FormData from 'form-data';
import privEnv from '$lib/env/privEnv';
import { createOrUpdateUser } from '$lib/utils';
import type { RequestEvent } from '@sveltejs/kit';

export const get = async (event: RequestEvent) => {
    const session = await auth.getSession(event);

    if (!session.user) {
        return {
            status: 401,
            body: {
                uploadEndpoint: null
            }
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await createOrUpdateUser(session.user as any);
    if (!user) {
        return {
            status: 401,
            body: {
                uploadEndpoint: null
            }
        };
    }

    const form = new FormData();
    form.append('requireSignedURLs', 'false');
    form.append(
        'metadata',
        JSON.stringify({
            creatorId: user.id
        })
    );

    const url = `https://api.cloudflare.com/client/v4/accounts/${privEnv.cloudflareAccountId}/images/v2/direct_upload`;
    try {
        const response = await axios.post(url, form, {
            headers: {
                Authorization: `Bearer ${privEnv.cloudflareApiKey}`
            }
        });

        return {
            status: 200,
            body: {
                uploadEndpoint: response.data.result.uploadURL
            }
        };
    } catch (e) {
        console.log(e);
    }
    return {
        status: 400,
        body: {
            uploadEndpoint: null
        }
    };
};
