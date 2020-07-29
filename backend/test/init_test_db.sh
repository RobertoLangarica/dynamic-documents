#!/bin/bash
file=.env
DB_DATABASE=$(grep DB_DATABASE $file | cut -d "=" -f 2)
DB_USERNAME=$(grep DB_USERNAME $file | cut -d "=" -f 2)
DB_HOST=$(grep DB_HOST $file | cut -d "=" -f 2)
DB_PORT=$(grep DB_PORT $file | cut -d "=" -f 2)
DB_PASSWORD=$(grep DB_PASSWORD $file | cut -d "=" -f 2)

DB_USERNAME=$DB_USERNAME DB_DATABASE=$DB_DATABASE DB_HOST=$DB_HOST DB_PORT=$DB_PORT DB_PASSWORD=$DB_PASSWORD node ./init_test_db