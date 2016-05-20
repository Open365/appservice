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

var http = require('http');
var settings = require('./settings');
var log2out = require('log2out');
var ApplicationLauncher = require('eyeos-virtual-application').Application;
var url = require('url');
var Auth = require('eyeos-auth');
var MysqlInfo = require('./MysqlInfo');
var DockerInfo = require('./DockerInfo');
var mmdbreader = require('maxmind-db-reader');
var Persistence = require('./Persistence');
var getPrettyName = require('./getPrettyName');

function Server (customSettings) {
    this.settings = customSettings || settings;
    this.logger = log2out.getLogger("Server");
    this.applicationLauncher = new ApplicationLauncher(this.settings.spiceHost);
    this.auth = new Auth();
    this.mysqlInfo = new MysqlInfo();
    this.dockerInfo = new DockerInfo();
    this.persistence = new Persistence();
}

Server.prototype.start = function () {
    var self = this;
    //We need a function which handles requests and send response
    function handleRequest(request, response){

        console.log('HEADERS:', request.headers);
        if ( ! self.auth.verifyRequest(request)) {
            response.statusCode = 403;
            response.end();
            return;
        }

        try {
            var username = JSON.parse(request.headers.card).username;
            var domain = JSON.parse(request.headers.card).domain;
        } catch (e) {
            self.logger.warn("Coudn't parse users card", e, request.headers.card);
            response.statusCode = 400;
            response.end();
            return;
        }
        console.log('USERNAME:', username);
        var parseUrl = url.parse(request.url);
        var parts = parseUrl.pathname.split('/').slice(3);
        var width = "";
        var height = "";
        var temp = parts.join('/');
        parts = temp.split('/token/');
        var app = parts[0];
        var token = parts[1];

        if (parseUrl.search) {
            var search = parseUrl.search.substr(1, parseUrl.search.length - 1);
            var parameters = search.split("&");
            var items = {};
            var aux;
            parameters.forEach(function (param) {
                aux = param.split('=');
                items[aux[0]] = aux[1];
            });
            width  = items.width;
            height  = items.height;
        }


        try {
            app = JSON.parse(decodeURIComponent(app));
        } catch (e) {
            self.logger.warn("Coudn't parse app to execute", e, app);
            response.statusCode = 400;
            response.end();
            return;
        }
        console.log('request.url', request.url);
        console.log('parse', url.parse(request.url));
        console.log('APP:', app);
        var appInfo = {
            name: app,
            domain: domain,
            user: username,
            token: token,
            card: request.headers.card,
            minicard: request.headers.minicard,
            signature: request.headers.signature,
            minisignature: request.headers.minisignature,
            email_domain: process.env.APPSERVICE_EMAIL_DOMAIN,
            imap_host: process.env.EYEOS_IMAP_HOST,
            smtp_host: process.env.EYEOS_SMTP_HOST,
            use_bind_mount_for_libraries: self.settings.use_bind_mount_for_libraries,
            amqpBusHost: self.settings.amqpServer.host,
            amqpBusPort: self.settings.amqpServer.port,
            amqpBusUser: self.settings.amqpServer.login,
            amqpBusPass: self.settings.amqpServer.passcode,
            webDAVHost: self.settings.webdav.host,
            width: width,
            height: height
        };

        console.log('Multidocker enabled: ' + self.settings.multidockerConfig.enabled);
        if (self.settings.multidockerConfig.enabled) {

            // This flag is necessary for the virtual-application library
            appInfo.localisation = true;
            console.log('Localisation enabled, lets rock!');
            if (request.headers['x-real-ip']) {
                appInfo = self.setLocalisation(appInfo, request.headers['x-real-ip']);
            }
            appInfo = self.dockerInfo.addInfo(appInfo);
        }

        appInfo = self.mysqlInfo.addInfo(appInfo);


        self.persistence.getUserInfo(username, function(err, userInfo) {
            if (err) {
                console.warn("Error getting the user info from mongo. Not setting the pretty name.");
                appInfo.pretty_name = username;
            } else {
                appInfo.pretty_name = getPrettyName(userInfo);
            }

            console.log("Launching app with settings", appInfo);
            self.applicationLauncher.launch(appInfo, function(err, dockerInfo) {
                if (err) {
                    setTimeout(function() {
                        response.statusCode = 500;
                        response.end();
                    }, self.settings.retryTimeout);
                } else {
                    console.log('Received response from application launcher:', dockerInfo);
                    response.end(JSON.stringify(dockerInfo));
                }
            });
        })
    }

    //Create a server
    var server = http.createServer(handleRequest);

    //Lets start our server
    server.listen(this.settings.httpServer.port, function(){
        //Callback triggered when server is successfully listening. Hurray!
        console.log("Server listening on: http://localhost:%s", self.settings.httpServer.port);
    });
};

Server.prototype.setLocalisation = function (appInfo, ipAddress) {

    // Set default values
    appInfo.continent = 'default';
    appInfo.country = 'default';

    this.logger.debug('Getting localisation info for IP: ' + ipAddress);
    var continents = mmdbreader.openSync('/var/service/bin/GeoLite2-Country.mmdb');
    var geodata = continents.getGeoDataSync(ipAddress);
    if (geodata) {
        this.logger.debug("Geodata: " + geodata);
        // Get continent
        if (geodata.continent && geodata.continent.code) {
            appInfo.continent = geodata.continent.code;
        }
        //Get country
        if (geodata.country && geodata.country.iso_code) {
            appInfo.country = geodata.country.iso_code;
        } else if (geodata.registered_country && geodata.registered_country.iso_code) {
            appInfo.country = geodata.registered_country.iso_code;
        }
        this.logger.debug('IP ' + ipAddress + ' is from ' + appInfo.country + '(' + appInfo.continent + ')');
    }
    return appInfo;
};

module.exports = Server;
