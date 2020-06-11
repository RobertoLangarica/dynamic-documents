# This stage install all the dependencies
FROM node:14.4-alpine AS development
# directory for the app
WORKDIR /usr/src/app

# Copy package and pacakge-lock
COPY package*.json ./

# install dependencies
RUN npm install

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
FROM node:14.4-alpine AS clean_build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# copy the dependencies (NestJS needs them)
COPY --from=build /usr/src/app/node_modules ./node_modules

# copy only the build
COPY --from=build /usr/src/app/dist .

# start the server
CMD ["node","src/main"]