#!/usr/bin/env bash

data=../data
declare -a arr=("Sessions" "Files" "Comments" "Events")
mkdir -p $data
for i in "${arr[@]}"; do
    mongoexport --port 3001 --db meteor --collection "$i" --out "$data/$i.json"
done
