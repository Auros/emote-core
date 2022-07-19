const privEnv = {
    test: import.meta.env.VITE_TEST as string,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    cloudflareApiKey: process.env.CLOUDFLARE_API_KEY,
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareAccountHash: process.env.CLOUDFLARE_ACCOUNT_HASH,
    cloudflareImageVariantName: process.env.CLOUDFLARE_IMAGE_VARIANT_NAME
};

export default privEnv;
