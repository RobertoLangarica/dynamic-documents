#!/bin/bash
echo "Creating custom user an database"

if [ -n $DB_USERNAME ]; then

    # This command was designed to run inside a docker image from postgres as a step in initialization and as a docker exec for a postgress image
    
    # Avoiding race conditions when the servees is not initialized yet
    serverError=2 # 2 is the error returned when can't connect to the server
    while [ $serverError -eq 2 ]; do
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --command "\echo Server up..."
    serverError=$?
    sleep 1
    done

    # Creating user if not exist
    # NOT WORKING IN THE CONTAINER---> user_exist=$(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "\du" | grep -w $user | wc -l)
    user_exist=0
    if [ $user_exist -ge 1 ]; then
        echo User: $DB_USERNAME already exist --> Skipping creation.
        user=0
    else
        echo Creating user: $DB_USERNAME
        psql -v ON_ERROR_STOP=1 -q --username "$POSTGRES_USER" <<-EOSQL 
        CREATE USER $DB_USERNAME WITH 
        PASSWORD '$DB_PASSWORD'
        CREATEDB 
        CREATEROLE;
EOSQL
        user=$?
    fi

    # Creating database if not exist
    if [ -n $DB_DATABASE ]; then
        # NOT WORKING IN THE CONTAINER--->  db_exist=$(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "\list" | grep -w $db | wc -l)
        db_exist=0
        if [ $db_exist -ge 1 ]; then
            echo The database $DB_DATABASE already exist --> Skipping creation.
            db=0
        else
            echo Creating DB: $DB_DATABASE
            psql -v ON_ERROR_STOP=1 -q --username "$POSTGRES_USER" <<-EOSQL
            CREATE DATABASE $DB_DATABASE;
            GRANT ALL PRIVILEGES ON DATABASE $DB_DATABASE to $DB_USERNAME
EOSQL
            db=$?
        fi
    fi

    
    if [[ $user == 0  && $db == 0 ]]; then
        echo Using ROLE $DB_USERNAME
        echo Using DB $DB_DATABASE
    elif [[ $user == 3  && $db == 3 ]]; then
        echo Using ROLE $DB_USERNAME
        echo Using DB $DB_DATABASE
    else
        echo "A problem ocurred while trying to set the user an database"
    fi
else
    echo "No credentilas provided for custom user and db."    
fi
