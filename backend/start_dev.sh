#!/bin/bash
image=registry.digitalocean.com/wizard/ddocuments/backend-dev
version=latest
name=dd_back
cont_port=3000
port=3000
network=dd_back_net
previous=$(docker ps -a | grep -w $name | wc -l)
interactive=false

if [ $# -gt 0 ]; then
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

# firs we try to get the correct version 
docker pull $image:$version

if [ $? -ne 0 ]; then
echo "An error ocurred while getting the version: $version"
exit 1
fi

docker run  --name $name \
            --rm -p $port:$cont_port \
            --network $network \
            --mount type=bind,source=$(pwd),target=/usr/src/app \
            -v /usr/src/app/node_modules \
            -it=$interactive \
            $image:$version $1 $2 $3 $4 $5 $6 $7 $8 $9