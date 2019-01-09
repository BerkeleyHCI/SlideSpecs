#!/usr/bin/env bash

# TODO - also export files/images

data=../data
declare -a arr=("users" "Sessions" "Talks" "Comments" "files" "images")
mkdir -p $data
for i in "${arr[@]}"; do
    mongoexport --port 3001 --db meteor --collection "$i" --out "$data/$i.json"
done
