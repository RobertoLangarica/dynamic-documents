#!/bin/bash

imageName="back_ddocuments"
dependencies="registry.digitalocean.com/wizard/ddocuments/backend-dependencies"
docker pull $dependencies:latest
context=$(dirname $BASH_SOURCE)
docker build -t $imageName --target dev $context
built=$?
if [ "$built" == 0 ]; then        
    echo 'Dev image:'$imageName' creation COMPLETED'
else
    echo 'A problem ocurred with the image creation'
fi