#!/usr/bin/env bash

NOW=$(date)

# Mongo Collections to export.
declare -a arr=("users" "Talks" "Comments" "Events" "files" "images" "sounds")
data="../db-data $NOW"
mkdir -pv "$data"
for i in "${arr[@]}"; do
    mongoexport --port 3001 --db meteor --collection "$i" --out "$data/$i.json"
done

# copy files/images (hardcoded path)
files="/$HOME/Downloads/research"
dfile="../db-files $NOW"
cp -Rv "$files" "$dfiles"

# export and zip
dump="../db-dump-$NOW.tar.gz"
tar -czf "$dump" "$data" "$dfiles"
echo "Export done."

