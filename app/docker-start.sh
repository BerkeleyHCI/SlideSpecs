# we have to do this at runtime (not during build) because the docker-compose mount will re-mount as root
chown -R meteor:meteor /storage

# then we can drop root privileges. need a login shell for meteor
sudo -u meteor bash -l -c 'cd /app && npm run start'
