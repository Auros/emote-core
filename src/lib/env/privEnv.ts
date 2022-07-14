const privEnv = {
    test: import.meta.env.VITE_TEST as string,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
    jwtSecret: process.env.JWT_SECRET
};

export default privEnv;
