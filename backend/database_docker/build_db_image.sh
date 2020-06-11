#!/bin/bash
image=registry.digitalocean.com/wizard/postgres
context=$(dirname $BASH_SOURCE)
docker build -t $image $context
if [ $? -eq 0 ]; then
    docker push $image
fi