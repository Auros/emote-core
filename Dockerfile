FROM node:16-alpine as builder

# install dependencies
WORKDIR /app
COPY prisma ./prisma/
COPY package.json yarn.lock svelte.config.js vite.config.js tsconfig.json ./
RUN yarn --frozen-lockfile

# Copy all local files into the image.
COPY . .

ENV VITE_BASE_URL=https://emote-core.auros.dev
ENV VITE_EMOTE_CDN=https://emote-core.auros.dev

RUN yarn build

###
# Only copy over the Node pieces we need
# ~> Saves 35MB
###
FROM node:16-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma

CMD ["yarn", "start"]