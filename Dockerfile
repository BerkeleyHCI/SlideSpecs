FROM node:14.21.3-bullseye

RUN apt update
RUN apt install -y sudo zsh sox libreoffice imagemagick ghostscript

# https://stackoverflow.com/questions/52998331/imagemagick-security-policy-pdf-blocking-conversion
# probably fine security-wise since we're in a docker container
RUN sed -i '/disable ghostscript format types/,+6d' /etc/ImageMagick-6/policy.xml

WORKDIR /app
RUN useradd -m meteor
RUN chown meteor:meteor /app

RUN mkdir /storage
RUN chown meteor:meteor /storage

USER meteor

RUN npm config set prefix "/home/meteor/npm"

RUN npm install -g meteor

COPY --chown=meteor:meteor ./app /app
RUN npm ci

USER root

CMD ["bash", "/app/docker-start.sh"]
