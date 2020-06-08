#!/bin/bash

imageName="registry.digitalocean.com/wizard/ddocuments/backend-dependencies"
version=$(grep -w -i '"version"' package.json | cut -d '"' -f 4)
img1=$imageName:$version
img2=$imageName
docker build -t $img1 -t $img2 -f- . <<EOF
FROM node:14.4-alpine AS dependency
# directory for the app
WORKDIR /usr/src/app

# Copy package and pacakge-lock
COPY package*.json ./

# install dependencies ignoring devDependencies
RUN npm install --production
EOF
built=$?
if [ "$built" == 0 ]; then        
    docker push $img1
    docker push $img2
    echo 'Dependencies -v'$version' and latest creation COMPLETED'
else
    echo 'A problem ocurred with the image creation'
fi

