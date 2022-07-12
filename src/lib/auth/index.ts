import privEnv from "../env/privEnv";
import { SvelteKitAuth } from "sveltekit-oauth";
import { DiscordOAuth2Provider } from "./discord";

const auth = new SvelteKitAuth({
    providers: [
        new DiscordOAuth2Provider({
            clientId: privEnv.discordClientId,
            clientSecret: privEnv.discordClientSecret,
            profile(profile) {
                return { ...profile, provider: "discord" }
            }
        })
    ],
    jwtSecret: privEnv.jwtSecret
})

export default auth;