#!/bin/bash

# Start the postgres server only if it is not running
isRunning=$(docker ps -f name=db_server | wc -l)

echo "Sarting db_server"
context=$(dirname $BASH_SOURCE)
exist_credentials=0
file=$context/.env
if [ -f $file ]; then
    exist_credentials=1
    echo "Using credentias FROM: .env"
else
    echo "There is no .env present"
    exist_credentials=0
fi

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

    ########
    # When the DB is deployed in production the restart param should be --restart always
    # When the DB is deployed locally the restart param could be --restart unless-stopped
    ########
    imageName=registry.digitalocean.com/wizard/postgres
    docker run --name db_server -d \
            -p 5432:5432 \
            -v postgresData:/var/lib/postgresql/data \
            --restart unless-stopped \
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
    docker exec db_server /docker-entrypoint-initdb.d/init_db.sh
fi
