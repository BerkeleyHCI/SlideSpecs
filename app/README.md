This is an example app built from [this guide](http://guide.meteor.com/structure.html).

This UI is implemented in [React](https://facebook.github.io/react/index.html).

You can read more about using React in Meteor in the [Meteor guide article on the subject](http://guide.meteor.com/v1.3/react.html).

### Running the app

```bash
meteor npm install
meteor
```

### Scripts

To lint:

```bash
meteor npm run lint
```

### Configuration

- current: /usr/local/etc/dehydrated
- todo: https://github.com/tozd/docker-meteor
- renew: sudo dehydrated -cron -x

##### Server

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

