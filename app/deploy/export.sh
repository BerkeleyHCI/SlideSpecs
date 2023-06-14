#!/usr/bin/env bash

NOW=$(date)

SLIDESPECS=/home/jeremy/Code/SlideSpecs
LOCALFILES="/home/jeremy/Documents/slidespecs-db"

# Mongo Collections to export.
declare -a arr=("users" "Talks" "Comments" "Events" "Transcripts" "files" "images" "sounds")
data="db-data $NOW"
mkdir -pv "$data"
for i in "${arr[@]}"; do
    echo "Processing $i"
    mongoexport --port 3001 --db meteor --collection "$i" --out "$data/$i.json"
done

# copy files/images (hardcoded path)
if [[ $1 != "--skip-files" ]]; then
    dfile="db-files $NOW"
    mkdir -pv "$dfile"
    cp -av "$LOCALFILES/." "$dfile/"
fi

# Compress and move
echo "Compressing."
dump="data.tar.gz"
if [[ -n $dfile ]]; then
    tar -czf "$dump" "$data" "$dfile"
    mv "$dump" "$data" "$dfile" "$SLIDESPECS"
else
    tar -czf "$dump" "$data"
    mv "$dump" "$data" "$SLIDESPECS"
fi

echo "Export done."

