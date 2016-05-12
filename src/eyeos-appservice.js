#!/usr/bin/env node
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

var Server = require('./lib/server');
var Notifier = require('eyeos-service-ready-notify');
var settings = require('./lib/settings');
var log2out = require('log2out'),
	logger = log2out.getLogger("eyeos-appservice");
var BusToHttp = require('eyeos-bustohttp');
var mongoDriverSingleton = require('eyeos-mongo').mongoDriverSingleton;

logger.info('================= SETTINGS ================================================');
logger.info(settings);

mongoDriverSingleton.connect({
    setMongoStarted: function(started) {
        if (!started) {
            console.log("Failed to connect to mongo");
            return process.exit(1);
        }

        var server = new Server();
        server.start();
        subcribeToRabbit()
    }
}, settings);

function subcribeToRabbit() {
    // Initialize BusToHttp instances for each amqpQueue configured
    settings.amqpServer.queues.forEach(function(queue) {
        var httpToBusOptions = {
            busHost: settings.amqpServer.host,
            busPort: settings.amqpServer.port,
            queueName: queue
        };
        var busToHttp = new BusToHttp();
        var httpHost = settings.httpServer.host;
        var httpPort = settings.httpServer.port;
        logger.info('Starting BusToHttp instance for HTTP: %s:%d and AMQP: %j', httpHost, httpPort, httpToBusOptions);
        busToHttp.start(httpToBusOptions, httpHost, httpPort, settings.amqpServer.prefetchCount);
    });
}

// notify to systemd that the service is ready
var notifier = new Notifier();
notifier.registerService();
