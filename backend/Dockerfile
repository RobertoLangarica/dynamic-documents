# This stage install all the dependencies
FROM node:12.18-alpine AS development

# directory for the app
WORKDIR /usr/src/app

# Copy package and pacakge-lock
COPY package*.json ./

# Installs latest Chromium (85) package.
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# install dependencies
RUN npm install

# Puppeteer v5.2.1 works with Chromium 85.
RUN npm install puppeteer@5.2.1

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
  && mkdir -p /home/pptruser/Downloads /app \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

# copy all the files to the container
COPY . .

EXPOSE 3000

#  Run in dev mode
CMD ["npm","run","start:dev"]

# Build phase, removes any dependency and source code
FROM development as build

# build and dependencies removal
RUN npm run build && rm -r node_modules

# Install only the production dependencies and rebuild bcrypt
RUN apk add --no-cache make gcc g++ python && \
  npm install --production && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python

# Clean build
FROM node:12.18-alpine AS clean_build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# copy the dependencies (NestJS needs them)
COPY --from=build /usr/src/app/node_modules ./node_modules

# copy only the build
COPY --from=build /usr/src/app/dist .

# start the server
CMD ["node","src/main"]