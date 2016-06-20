FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV WHATAMI appservice

ENV InstallationDir /var/service/

WORKDIR ${InstallationDir}

CMD eyeos-run-server --serf /var/service/src/eyeos-appservice.js

COPY . ${InstallationDir}

RUN /scripts-base/buildDependencies.sh --production --install && \
    curl -L http://get.docker.com/builds/Linux/x86_64/docker-1.11.1.tgz -o /docker.tgz && \
    cd / && \
    tar -xvzf docker.tgz && \
    cp /docker/* /usr/local/bin/ && \
    mv /usr/local/bin/docker /usr/local/bin/docker-1.11 && \
    rm docker.tgz && \
    curl -L http://get.docker.com/builds/Linux/x86_64/docker-1.10.1.tgz -o /docker.tgz && \
    tar -xvzf docker.tgz && \
    mv /usr/local/bin/docker /usr/local/bin/docker-1.10 && \
    rm docker.tgz && \
    curl -L http://get.docker.com/builds/Linux/x86_64/docker-1.9.1.tgz -o /docker.tgz && \
    tar -xvzf docker.tgz && \
    mv /usr/local/bin/docker /usr/local/bin/docker-1.9 && \
    rm docker.tgz && \
    curl -L http://get.docker.com/builds/Linux/i386/docker-1.8.2.tgz -o /docker.tgz && \
    tar -xvzf docker.tgz && \
    cp /usr/local/bin/docker /usr/local/bin/docker-1.8 && \
    rm docker.tgz && \
    cd - && \
    npm install --verbose --production && \
    npm cache clean && \
    /scripts-base/buildDependencies.sh --production --purgue && \
    rm -r /etc/ssl /var/cache/apk/*
