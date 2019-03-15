#!/usr/bin/env bash

NOW=$(date)

# Mongo Collections to export.
declare -a arr=("users" "Talks" "Comments" "Events" "files" "images" "sounds")
data="../db-data $NOW"
mkdir -pv "$data"
for i in "${arr[@]}"; do
    echo "Processing $i"
    mongoexport --port 3001 --db meteor --collection "$i" --out "$data/$i.json"
done

# copy files/images (hardcoded path)
files="/$HOME/Downloads/research"
dfile="../db-files $NOW"
mkdir -pv "$dfile"
cp -Rv "$files/*" "$dfile/"

# export and zip
dump="../data.tar.gz"
tar -czf "$dump" "$data" "$dfile"
echo "Export done."

