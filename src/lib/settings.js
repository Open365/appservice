/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var hostsInfo = require('../../multidocker-info/hosts');
var environment = process.env;

var getHosts = function (hostsEnv) {
    console.log(typeof hostsEnv);

    if (! hostsEnv) {
        return [];
    }

    var hosts = hostsEnv.split(',');
    var hostsList = [];
    hosts.forEach(function(value) {
        hostsList.push(value);
    });

    return hostsList;
};

var settings = {
    retryTimeout: 1000, //miliseconds
    httpServer: {
        path: '/appservice/v1/',
        host: 'localhost',
        port: environment.APPLICATION_PORT || 8085
    },
    amqpServer: {
        host: environment.APPSERVICE_AMQP_HOST || 'rabbit.service.consul',
        port: 5672,
        login: environment.EYEOS_BUS_MASTER_USER || 'guest',
        passcode: environment.EYEOS_BUS_MASTER_PASSWD || 'guest',
        prefetchCount: +environment.APPLICATION_PREFETCH_COUNT || 0,
        queues: [
            'appservice.v1'
        ]
    },
    mongoInfo: {
        host: environment.EYEOS_APPSERVICE_MONGOINFO_HOST || 'mongo.service.consul',
        port: environment.EYEOS_APPSERVICE_MONGOINFO_PORT || 27017,
        db: environment.EYEOS_APPSERVICE_MONGOINFO_DB || 'eyeos'
    },
    spiceHost: environment.APPSERVICE_SPICE_HOST || '127.0.0.1',
    security_mode: environment.APPSERVICE_SECURITY_MODE || 'unsecure',
    use_bind_mount_for_libraries: environment.USE_BIND_MOUNT_FOR_LIBRARIES || '',
    enable_libreoffice_autosave: environment.OPEN365_ENABLE_LIBREOFFICE_AUTOSAVE || '',
    mysql: {
        host: environment.APPSERVICE_MYSQL_HOST || '127.0.0.1',
        user_salt: environment.EYEOS_USER_SALT
    },
    webdav: {
        host: environment.APPSERVICE_WEBDAV_HOST || '127.0.0.1'
    },
    multidockerConfig: {
        enabled: environment.ENABLE_LOCALISATION === 'true' || false,
        enableFakeConnection: environment.ENABLE_FAKE_CONNECTION === 'true' || false,
        enabledDistributedWS: environment.ENABLE_DISTRIBUTED_WS === 'true' || false,
        defaultValues: {
            host: getHosts(environment.DOCKER_HOST),
            tlsVerify: environment.DOCKER_TLS_VERIFY || '',
            machineName: environment.MACHINE_NAME || ''
        },
        hosts: hostsInfo
    }
};

if (!settings.mysql.user_salt) {
    throw new Error("Required EYEOS_USER_SALT environment variable not present");
}

module.exports = settings;
