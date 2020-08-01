#!/bin/bash
image=registry.digitalocean.com/wizard/ddocuments/backend-dev
version=latest
name=dd_back
cont_port=3000
port=3000
network=dd_back_net
interactive=false
release=0

# TODO change this block for a whle that allows an arbitrary param order
# Check for params (release, interactive shell and custom image version)
if [ $# -gt 0 ]; then

    # Is release
    if [ "$1" == -r ]; then
        release=1
        port=3001
        image=registry.digitalocean.com/wizard/ddocuments/backend
        name=dynamicdocs_api
        shift
    fi

    # Is interactive
    if [ "$1" == -it ]; then
        interactive=true
        shift
    fi

    # Is a Custom version
    if [ "$1" == -v ]; then
        shift
        if [ "$1" != "" ]; then
            version=$1
            shift
        else
            echo "Missing version for -v"
            exit 1
        fi
    fi
fi

#Stop previous instance is needed
previous=$(docker ps -a | grep -w $name | wc -l)
if [ $previous -ge 1 ]; then
    # Is running
    previous=$(docker ps -a -f status=exited | grep -w $name | wc -l)
    if [ $previous -lt 1 ]; then
        # running
        echo Stoping previous running instance
        docker stop $name
    fi
    previous=$(docker ps -a | grep -w $name | wc -l)
    if [ $previous -ge 1 ]; then
    echo Cleaning previous running instance
    docker rm $name
    fi
fi

# Pull the correct image version 
docker pull $image:$version

if [ $? -ne 0 ]; then
echo "An error ocurred while getting the version: $version"
exit 1
fi

if [ $release -eq 1 ]; then
    # release
    #   We change some params for release:
    #       It runs without rm so we can use a restart behaviour and process the container if stopped
    #       It runs dettached (to release the console after run)
    #       It has a retart policy that will try to restart the container unless stoped
    echo " -> Starting image"
    docker run  --name $name \
            -p $port:$cont_port \
            --network $network \
            -d \
            --restart unless-stopped \
            --env-file .env \
            $image:$version $1 $2 $3 $4 $5 $6 $7 $8 $9
else
    # development
    #   We change some params for development:
    #       It runs with rm so the container is removed whenever is stop and we can reuse its name
    #       It runs interactive (it) so we have the console attached
    #       It has a folder binding to our dev folder so we can make changes an see the effects
    #       The binding ignores node_modules, so we are using the same dependencies always 
    echo " -> Starting image"
    docker run  --name $name \
            --rm \
            -p $port:$cont_port \
            --network $network \
            --mount type=bind,source=$(pwd),target=/usr/src/app \
            -v /usr/src/app/node_modules \
            -it=$interactive \
            $image:$version $1 $2 $3 $4 $5 $6 $7 $8 $9
     
fi