#!/bin/bash

imageName="back_ddocuments"
dependencies="registry.digitalocean.com/wizard/ddocuments/backend-dependencies"
docker pull $dependencies:latest
docker build -t $imageName --target dev .
built=$?
if [ "$built" == 0 ]; then        
    echo 'Dev image:'$imageName' creation COMPLETED'
else
    echo 'A problem ocurred with the image creation'
fi