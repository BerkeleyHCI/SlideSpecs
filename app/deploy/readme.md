### Running the app

Copy and Edit this file to tell meteor where to save files:

```bash
cp imports/api/storagePath.default.js imports/api/storagePath.js
```

Installing and running the app (or [start](../start)):

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
brew install gs imagemagick     # for convert
brew install --cask libreoffice # for soffice
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

     scp -i ~/.ssh/slidespecs slidespecs.berkeley.edu:/home/jeremy/Code/slidespecs/data.tar.gz .

Installing `mongodb` may be required to use `mongoimport`: `brew install mongodb`

### Configuration Notes

-   SSL/HTTPS
    - https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal
    - see also [nginx.conf](./nginx.conf) and [slidespecs.nginx](./slidespecs.nginx)  
-   todo
    -   https://github.com/tozd/docker-meteor
    -   run in 'production' mode

##### Server

-   nginx: `/etc/nginx/`
-   load conf: `sudo nginx -s reload`
-   see also [nginx.conf](./nginx.conf) and [slidespecs.nginx](./slidespecs.nginx)


## etc

##### starting a tmux shell on boot

```bash
crontab -e              # user
sudo vim /etc/crontab   # root
```

relevant scripts: [tmux-init.sh](./tmux-init.sh) and [start](../start)

##### for accessing google cloud storage

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/home/jeremy/Code/SlideSpecs/app/private/slidespecs.json
```

##### checking what process is using a port

```bash
netstat -nl | grep 9000
```

##### meteor up (see [mup.js](./mup.js))

-   http://meteor-up.com/docs.html#mongodb
-   http://meteor-up.com/getting-started.html
-   npm install -g mup


##### autostart mac hardware running ubuntu on power failure

- http://www.macfreek.nl/memory/Reboot_Mac_running_Linux_after_power_failure
- https://superuser.com/questions/212434/how-to-reboot-after-power-failure-for-mac-mini-running-ubuntu
- https://smackerelofopinion.blogspot.com/2011/09/mac-mini-rebooting-tweaks-setpci-s-01f0.html
- https://askubuntu.com/questions/99263/use-setpci-to-restart-ubuntu-server-after-power-failure-on-macbook
- https://www.intel.com/content/www/us/en/io/io-controller-hub-10-family-datasheet.html

