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

```
brew install imagemagick      # convert
brew cask install libreoffice # soffice
```

### Scripts

To lint:

```bash
meteor npm run lint
```

### Configuration

- current cert: /usr/local/etc/dehydrated
- renew cert: sudo dehydrated -cron -x
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
    #server_name  bayscope2.eecs.berkeley.edu;

    ssl_certificate /usr/local/etc/dehydrated/certs/bayscope2.eecs.berkeley.edu/fullchain.pem;
    ssl_certificate_key  /usr/local/etc/dehydrated/certs/bayscope2.eecs.berkeley.edu/privkey.pem;

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

