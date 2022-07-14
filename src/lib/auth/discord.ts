import { OAuth2Provider } from 'sveltekit-oauth/providers';
import type { OAuth2ProviderConfig } from 'sveltekit-oauth/dist/providers/oauth2';

export interface DiscordProfile {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
}

export interface DiscordTokens {
    access_token: string;
    token_type: string;
}

type DiscordOAuth2ProviderConfig = OAuth2ProviderConfig<DiscordProfile, DiscordTokens>;

const defaultConfig: Partial<DiscordOAuth2ProviderConfig> = {
    id: 'discord',
    scope: 'identify',
    accessTokenUrl: 'https://discord.com/api/v10/oauth2/token',
    authorizationUrl: 'https://discord.com/api/v10/oauth2/authorize',
    profileUrl: 'https://discord.com/api/v10/users/@me',
    headers: {
        Accept: 'application/json'
    },
    grantType: 'authorization_code',
    contentType: 'application/x-www-form-urlencoded'
};

export class DiscordOAuth2Provider extends OAuth2Provider<DiscordProfile, DiscordTokens, DiscordOAuth2ProviderConfig> {
    constructor(config: DiscordOAuth2ProviderConfig) {
        super({
            ...defaultConfig,
            ...config
        });
    }

    async getUserProfile(tokens: DiscordTokens): Promise<DiscordProfile> {
        const headers = {
            'User-Agent': 'EmoteCoreAN',
            Accept: 'application/json',
            Authorization: `Bearer ${tokens.access_token}`
        };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const response = await fetch(this.config.profileUrl!, { headers: headers });
        return await response.json();
    }
}
