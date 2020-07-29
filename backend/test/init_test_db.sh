#!/bin/bash
file=.env
DB_DATABASE=$(grep DB_DATABASE $file | cut -d "=" -f 2)
DB_USERNAME=$(grep DB_USERNAME $file | cut -d "=" -f 2)
DB_PASSWORD=$(grep DB_PASSWORD $file | cut -d "=" -f 2)
PORT=5432

CONNECTION=postgresql://$DB_USERNAME:$DB_PASSWORD@localhost:$PORT

psql $CONNECTION -v ON_ERROR_STOP=1 -q <<-EOSQL 
            CREATE DATABASE $DB_DATABASE;
EOSQL