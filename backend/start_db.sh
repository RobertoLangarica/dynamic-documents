#!/bin/bash


printf "################################\n#      STARTING DB SERVER      #\n################################\n\n"
context=$(dirname $BASH_SOURCE)
exist_credentials=0
file=$context/.env
networkName=dd_back_net
isRunning=
name=db_server
# imageName=registry.digitalocean.com/wizard/postgres
imageName=postgres:12

printf "  -> Reading credentilas from .env\n"
# Reading credentials
if [ -f $file ]; then
    exist_credentials=1
    echo
else
    printf "     NOTICE: There is no .env present\n\n"
    exist_credentials=0
fi

POSTGRES_PASSWORD=admin
POSTGRES_USER=postgres
POSTGRES_DB=postgres
PORT=5432

if [ $exist_credentials -eq 1 ]; then
    DB_PASSWORD=$(grep DB_PASSWORD $file | cut -d "=" -f 2)
    DB_USERNAME=$(grep DB_USERNAME $file | cut -d "=" -f 2)
    DB_DATABASE=$(grep DB_DATABASE $file | cut -d "=" -f 2)
    PORT=$(grep DB_PORT $file | cut -d "=" -f 2)
    
    # Postgres credentials exist?
    P_PASSWORD=$(grep POSTGRES_PASSWORD $file | cut -d "=" -f 2)
    P_USER=$(grep POSTGRES_USER $file | cut -d "=" -f 2)
    P_DB=$(grep POSTGRES_DB $file | cut -d "=" -f 2)

    if [ "$P_PASSWORD" != "" ]; then 
        POSTGRES_PASSWORD=$P_PASSWORD 
    fi
    if [ "$P_USER" != "" ]; then 
        POSTGRES_USER=$P_USER 
    fi
    if [ "$P_DB" != "" ]; then 
        POSTGRES_DB=$P_DB 
    fi
fi




# Reading a specific network for communicatong the services
if [ $# -gt 0 ]; then
    if [ "$1" == -n ]; then
        shift
        if [ "$1" != "" ]; then
            networkName=$1
            shift
            echo
        else
            printf "  -> ERROR: Missing network for -n \n\n"
            exit 1
        fi
    fi
fi

# Check if the postgres image server is already running
isRunning=$(docker ps -f name=$name | grep -w $name | wc -l)
if [ $isRunning -ne 1 ]; then
    # Data directory
    PGDATA=/var/lib/postgresql/data/pgdata

    # The network needed is ready?
    network=$(docker network ls | grep -w $networkName | wc -l)
    if [ $network -eq 0 ]; then
        printf "  -> CREATING: Docker network $networkName for communication\n\n"
        # Creating the network
        docker network create $networkName
    else
        printf "  -> USING: Docker network $networkName for communication\n\n"
    fi

    ########
    # When the DB is deployed in production the restart param should be --restart always
    # When the DB is deployed locally the restart param could be --restart unless-stopped
    ########
    printf "  -> RUNNING: Docker image $imageName\n\n"
    docker run --name $name -d \
            -p $PORT:$PORT \
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
    printf "  -> PostgresSQL image already running. Skipping image initialization\n"
    run=0
fi

# User and DB initilization
if [[ $run -eq 0 && $exist_credentials -eq 1 ]]; then

    # Waiting for the server
    serverError=2 # 2 is the error returned when the server is down
    count=0
    while [ $serverError -eq 2 ]; do
        if [ "$count" == 1 ]; then
            sleep 1
        fi
        count=1
        docker exec "$name" psql -U "$POSTGRES_USER" -v ON_ERROR_STOP=1 --command "\echo '      Server up...'"
        serverError=$?
    done


    printf "\n\n--------------------------------\n-> CREATING: Custom user an database\n\n"
    ######## USER and DATABASE
    if [[ "$DB_DATABASE" == "" || "$DB_USERNAME" == "" ]]; then
        echo "   NOTICE: Missing DB_DATABASE or DB_USERNAME --> Skipping creation"
    else
        ######## Creating user if not exist
        user_exist=$(docker exec "$name" psql -U "$POSTGRES_USER" -v ON_ERROR_STOP=1 -c "\du" | grep -w "$DB_USERNAME" | wc -l)
        if [ $user_exist -ge 1 ]; then
            echo "   User $DB_USERNAME already exist --> Skipping creation"
        else
            echo " -> Creating USER: $DB_USERNAME"
            docker exec "$name" psql -U "$POSTGRES_USER" -v ON_ERROR_STOP=1 -c "CREATE USER "$DB_USERNAME" WITH PASSWORD "$DB_PASSWORD" CREATEDB CREATEROLE"
        fi
        #########################################

        ######## Creating database if not exist
        db_exist=$(docker exec "$name" psql -U "$POSTGRES_USER" -v ON_ERROR_STOP=1 -c "\list" | grep -w "$DB_DATABASE" | wc -l)
        if [ $db_exist -ge 1 ]; then
            echo "   Database $DB_DATABASE already exist --> Skipping creation"
        else
            echo " -> Creating DB: $DB_DATABASE"
            docker exec "$name" psql -U "$POSTGRES_USER" -v ON_ERROR_STOP=1 -c "CREATE DATABASE "$DB_DATABASE""
            docker exec "$name" psql -U "$POSTGRES_USER" -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE "$DB_DATABASE" to "$DB_USERNAME""
        fi
        #########################################
    fi
fi
