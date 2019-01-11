#!/usr/bin/env bash

# TODO - also export files/images (non-hardcoded path way)

# Mongo Collections to export.
declare -a arr=("users" "Sessions" "Talks" "Comments" "files" "images")

data="../data $(date)"
mkdir -p "$data"
for i in "${arr[@]}"; do
    mongoexport --port 3001 --db meteor --collection "$i" --out "$data/$i.json"
done
