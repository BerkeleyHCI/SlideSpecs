
### Configuration Notes

- current cert: `/usr/local/etc/dehydrated`
- SSL/HTTPS
    - (old) renew cert: `sudo dehydrated --cron -x`
    - (new) https://certbot.eff.org/lets-encrypt/osx-nginx
    - new - `sudo certbot renew`
- todo
    - https://github.com/tozd/docker-meteor
    - run in 'production' mode


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

for accessing google cloud storage

```
export GOOGLE_APPLICATION_CREDENTIALS=/Users/jwrnr/Code/slidespecs-research/app/private/slidespecs.json
```

checking what process is using a port

```
netstat -nl|grep 9000
```

meteor up

- http://meteor-up.com/docs.html#mongodb
- http://meteor-up.com/getting-started.html
- npm install -g mup