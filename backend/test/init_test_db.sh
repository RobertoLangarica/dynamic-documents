#!/bin/bash
file=.env
DB_DATABASE=$(grep DB_DATABASE $file | cut -d "=" -f 2)
DB_USERNAME=$(grep DB_USERNAME $file | cut -d "=" -f 2)
IMAGE_NAME=postgres

docker exec "$IMAGE_NAME" psql -U "$DB_USERNAME" -v ON_ERROR_STOP=1 -c "CREATE DATABASE "$DB_DATABASE""