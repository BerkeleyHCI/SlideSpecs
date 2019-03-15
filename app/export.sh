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
if [ $1 != "--skip-files" ]; then
    files="$HOME/Downloads/research"
    dfile="../db-files $NOW"
    mkdir -pv "$dfile"
    cp -av "$files/." "$dfile/"
fi

# export and zip
echo "Compressing."
dump="../data.tar.gz"
if [[ -n $dfile ]]; then
    tar -czf "$dump" "$data" "$dfile"
else
    tar -czf "$dump" "$data"
fi
echo "Export done."

