# SlideSpecs

- This is a Meteor app following [this structure guide](http://guide.meteor.com/structure.html).
- The UI is implemented in [React](https://facebook.github.io/react/index.html).
- More about using React in Meteor [here](http://guide.meteor.com/v1.3/react.html).

### Running the app

```bash
meteor npm install
meteor
open http://localhost:3000
```

##### PDF Conversion (osx)

```bash
brew install imagemagick      # convert
brew cask install libreoffice # soffice
```

### Scripts

##### Data Import/Export

To export data from production, use [`export.sh`](./export.sh). Move the files
in a location specified in `import/api/storagePath.js`. Import the mongoDB
records into a running meteor application with `mongoimport`, shown in the
[`import.sh`](./import.sh) script. Copy from remote server:

     scp -i ~/.ssh/bayscope slidespecs.berkeley.edu:/Users/jwrnr/Code/slidespecs-research/data.tar.gz .

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
            "@meteorjs/eslint-config-meteor",
        ],
}
```

### Configuration

- current cert: `/usr/local/etc/dehydrated`
- renew cert: `sudo dehydrated --cron -x`
- todo: https://github.com/tozd/docker-meteor

##### Server

- nginx: `/usr/local/etc/nginx/servers/`
- load conf: `sudo /usr/local/bin/nginx -s reload`

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

