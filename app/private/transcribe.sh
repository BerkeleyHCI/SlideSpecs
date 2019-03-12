#!/usr/bin/env bash

# prereq: base64, curl. convert WAV to string, send to google (humbly offer),

FILE="$1"
BASE=$(base64 -i "$1")
HOST="https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}"

echo "converted. $FILE to base64. now uploading..."

curl -s -X \
    POST -H "Content-Type: application/json" \
    -d @- "$HOST" <<CURL_DATA
{
    "config": {
        "enableWordTimeOffsets": true,
        "profanityFilter": true,
        "languageCode": "en-US"
    },
    "audio": {
        "content": "$BASE",
    },
}
CURL_DATA
