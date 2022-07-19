FROM mhart/alpine-node:16

# install dependencies
WORKDIR /app
COPY prisma ./prisma/
COPY package.json yarn.lock svelte.config.js vite.config.js tsconfig.json ./
RUN yarn --frozen-lockfile

# Copy all local files into the image.
COPY . .

RUN yarn build

###
# Only copy over the Node pieces we need
# ~> Saves 35MB
###
FROM mhart/alpine-node:slim-16

WORKDIR /app
COPY --from=0 /app .
COPY . .

CMD ["yarn", "start"]