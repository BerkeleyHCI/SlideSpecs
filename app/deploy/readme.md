### Running the app

Copy and Edit this file to tell meteor where to save files:

```bash
cp imports/api/storagePath.default.js imports/api/storagePath.js
```

Installing and running the app:

```bash
meteor npm install
meteor
export GOOGLE_APPLICATION_CREDENTIALS=./app/private/slidespecs.json
open http://localhost:3000
```

Note that you'd need to use your own Google Application credential JSON.

More on that: https://cloud.google.com/docs/authentication/application-default-credentials

##### Audio Concatenation (osx)

Best practices for audio recording: https://cloud.google.com/speech-to-text/docs/best-practices

transcription material: http://www.ushistory.org/declaration/document/

```
brew install sox
```

##### PDF Conversion (osx)

```bash
brew install gs  # dependency
brew install imagemagick      # convert
brew install --cask libreoffice # soffice
```

### Scripts

##### Linting

To lint:

```bash
meteor npm run lint
```

Configuration options (`.eslintrc`)

```json
{
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "@meteorjs/eslint-config-meteor"
    ]
}
```

##### Data Import/Export

To export data from production, use [`export.sh`](./export.sh). Move the files
in a location specified in `import/api/storagePath.js`. Import the mongoDB
records into a running meteor application with `mongoimport`, shown in the
[`import.sh`](./import.sh) script. Copy from remote server:

     scp -i ~/.ssh/slidespecs slidespecs.berkeley.edu:/Users/jwrnr/Code/research-slidespecs/data.tar.gz .

Installing `mongodb` may be required to use `mongoimport`: `brew install mongodb`

### Configuration Notes

-   current cert: `/usr/local/etc/dehydrated`
-   SSL/HTTPS
    -   (old) renew cert: `sudo dehydrated --cron -x`
    -   (new) https://certbot.eff.org/lets-encrypt/osx-nginx
    -   new - `sudo certbot renew`
-   todo
    -   https://github.com/tozd/docker-meteor
    -   run in 'production' mode

##### Server

-   nginx: `/usr/local/etc/nginx/servers/`
-   load conf: `sudo /usr/local/bin/nginx -s reload`

```
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen       80;
    listen       8081;
    listen       443 ssl;
    server_name  slidespecs.berkeley.edu;

    ssl_certificate /usr/local/etc/dehydrated/certs/slidespecs.berkeley.edu/fullchain.pem;
    ssl_certificate_key  /usr/local/etc/dehydrated/certs/slidespecs.berkeley.edu/privkey.pem;

    ssl_stapling on;
    ssl_stapling_verify on;

    location / {
        proxy_pass   http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /.well-known/acme-challenge {
        alias /var/www/dehydrated;
    }
}
```

for accessing google cloud storage

```
export GOOGLE_APPLICATION_CREDENTIALS=/Users/jwrnr/Code/slidespecs-research/app/private/slidespecs.json
```

checking what process is using a port

```
netstat -nl|grep 9000
```

meteor up

-   http://meteor-up.com/docs.html#mongodb
-   http://meteor-up.com/getting-started.html
-   npm install -g mup
