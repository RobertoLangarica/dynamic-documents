#!/bin/bash

imageName="registry.digitalocean.com/wizard/ddocuments/backend-dev"
# entering to the docker context
wkd=$(pwd)
cd $(dirname $BASH_SOURCE)
cd ..
version=$(grep -w -i '"version"' package.json | cut -d '"' -f 4)
img1=$imageName:$version
img2=$imageName
docker build -t $img1 -t $img2 --target development .
built=$?
cd $wkd
if [ "$built" == 0 ]; then        
    docker push $img1
    docker push $img2
    echo 'Dependencies -v'$version' and latest creation COMPLETED'
else
    echo 'A problem ocurred with the image creation'
fi