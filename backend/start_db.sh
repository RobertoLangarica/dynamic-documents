#!/bin/bash


echo "Sarting DB server"
context=$(dirname $BASH_SOURCE)
exist_credentials=0
file=$context/.env
networkName=
isRunning=
name=db_server
imageName=registry.digitalocean.com/wizard/postgres


if [ -f $file ]; then
    exist_credentials=1
    echo "Using credentias FROM: .env"
else
    echo "There is no .env present"
    exist_credentials=0
fi

# Network
if [ $# -gt 0 ]; then
    if [ "$1" == -n ]; then
        shift
        if [ "$1" != "" ]; then
            networkName=$1
            shift
        else
            echo "Missing network for -n"
            exit 1
        fi
    fi
fi

# Start the postgres server only if it is not running
isRunning=$(docker ps -f name=$name | wc -l)
if [ $isRunning -lt 2 ]; then

    if [ $exist_credentials -eq 1 ]; then
        DB_PASSWORD=$(grep DB_PASSWORD $file | cut -d "=" -f 2)
        DB_USERNAME=$(grep DB_USERNAME $file | cut -d "=" -f 2)
        DB_DATABASE=$(grep DB_DATABASE $file | cut -d "=" -f 2)
    fi

    POSTGRES_PASSWORD=admin
    POSTGRES_USER=postgres
    POSTGRES_DB=postgres

    # Data directory
    PGDATA=/var/lib/postgresql/data/pgdata

    # The network used is ready?
    if [ "$networkName" != "" ]; then
        network=$(docker network ls | grep -w $networkName | wc -l)

        if [ $network -eq 0 ]; then
            echo Creating the service network: $networkName 
            # Creating the network
            docker network create $networkName
        fi
    else
        networkName=dd_back_net
        echo Using default network: $networkName
    fi

    ########
    # When the DB is deployed in production the restart param should be --restart always
    # When the DB is deployed locally the restart param could be --restart unless-stopped
    ########
    docker run --name $name -d \
            -p 5432:5432 \
            -v postgresData:/var/lib/postgresql/data \
            --restart unless-stopped \
            --network $networkName \
            -e DB_PASSWORD=$DB_PASSWORD \
            -e DB_USERNAME=$DB_USERNAME \
            -e DB_DATABASE=$DB_DATABASE \
            -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
            -e POSTGRES_USER=$POSTGRES_USER \
            -e POSTGRES_DB=$POSTGRES_DB \
            -e PGDATA=$PGDATA \
            $imageName
    run=$?

    # give it some time to start the server
    sleep 5
else
    echo PostgresSQL server already running.
    run=0
fi

# User and db initilization
if [[ $run -eq 0 && $exist_credentials -eq 1 ]]; then
    docker exec $name /docker-entrypoint-initdb.d/init_db.sh
fi
