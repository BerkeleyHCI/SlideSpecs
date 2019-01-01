#!/usr/bin/env bash

# TODO - also export the image files.

data=../data
declare -a arr=("users" "Sessions" "files" "images" "Comments" "Events")
mkdir -p $data
for i in "${arr[@]}"; do
    mongoexport --port 3001 --db meteor --collection "$i" --out "$data/$i.json"
done
