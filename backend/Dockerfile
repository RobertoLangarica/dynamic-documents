# This stage install all the node dependencies
# This stage is sufficient for development
FROM registry.digitalocean.com/wizard/ddocuments/backend-dependencies:latest AS dev
# directory for the app
WORKDIR /usr/src/app

# copy all the files to the container
COPY . .

#  Run in dev mode
CMD ["nest","start","--watch"]

# Build phase, removes any dependency and source code
FROM dev as build

# build and dependencies removal
RUN npm run build && rm -r node_modules

# Install only the production dependencies
RUN npm install --production

# Remove the dependencies
WORKDIR /usr/src/app/dist



# Clean build
FROM node:14.4-alpine AS clean_build

WORKDIR /usr/src/app

# copy the dependencies (NestJS needs them)
COPY --from=dev /usr/src/app/node_modules ./node_modules

# copy only the build
COPY --from=build /usr/src/app/dist .

# start the server
CMD ["node","src/main"]