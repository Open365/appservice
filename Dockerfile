FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV WHATAMI appservice

ENV InstallationDir /var/service/

WORKDIR ${InstallationDir}

CMD eyeos-run-server --serf /var/service/src/eyeos-appservice.js

COPY . ${InstallationDir}

RUN apk update && \
    /scripts-base/installExtraBuild.sh && \
    curl -L http://get.docker.com/builds/Linux/i386/docker-1.8.2.tgz -o /docker.tgz && \
    cd / && \
    tar -xvzf docker.tgz && \
    rm docker.tgz && cd - && \
    npm install --verbose --production && \
    npm cache clean && \
    /scripts-base/deleteExtraBuild.sh && \
    rm -r /etc/ssl /var/cache/apk/* /tmp/*
