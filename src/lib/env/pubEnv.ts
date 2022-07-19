const pubEnv = {
    test: import.meta.env.VITE_TEST as string,
    baseUrl: import.meta.env.VITE_BASE_URL as string,
    emoteCdn: import.meta.env.VITE_EMOTE_CDN as string
};

export default pubEnv;
