#!/usr/bin/env bash

# provide one arg to specify which folder json is in.
# https://markdrew.io/importing-json-into-a-meteor-mongo-database

for i in `find "$1" -name '*.json'`; do
    echo importing $i
    full=$(basename -- "$i")
    base="${full%.*}"
    mongoimport -h localhost:3001 --db meteor \
        --collection "$base" \
        --type json \
        --file "$i" --jsonArray
done

