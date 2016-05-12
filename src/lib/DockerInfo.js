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

var settings = require('./settings');
var url = require('url');

var DockerInfo = function() {
    this.defaultValues = 'defaultValues';
};

DockerInfo.prototype.addInfo = function(appInfo) {

    if (settings.multidockerConfig.hosts[appInfo.country]) {
        // Check if country specific settings exist
        console.log('Using country docker values: ' + appInfo.country);
        appInfo = this.addDockerInfo(appInfo, settings.multidockerConfig.hosts[appInfo.country]);
    } else if (settings.multidockerConfig.hosts[appInfo.continent]) {
        // Check if continent specific settings exist
        console.log('Using continent docker values: ' + appInfo.continent);
        appInfo = this.addDockerInfo(appInfo, settings.multidockerConfig.hosts[appInfo.continent]);
    } else if (settings.multidockerConfig.hosts[this.defaultValues]) {
        console.log('Using default docker host values');
        appInfo = this.addDockerInfo(appInfo, settings.multidockerConfig.hosts[this.defaultValues]);
    } else {
        console.warn('No default values found. Loading values from envars...');
        appInfo = this.addDockerInfoFromEnvars(appInfo);
    }

    return appInfo;
};

DockerInfo.prototype.addDockerInfo = function (appInfo, dockerHosts) {
    console.log(dockerHosts);
    var dockerHostInfo = dockerHosts[Math.floor(Math.random()*dockerHosts.length)];
    console.log('Docker host = ' + dockerHostInfo.host);
    appInfo.dockerHost = dockerHostInfo.host;
    appInfo.dockerTLSVerify = dockerHostInfo.tlsVerify || '';
    appInfo.dockerMachineName = dockerHostInfo.machineName || '';

    // If distributed websockify is enabled, we need to set the wsHost value
    if (settings.multidockerConfig.enabledDistributedWS) {
        appInfo.wsHost = dockerHostInfo.wsHost || url.parse(dockerHostInfo.host).hostname;
        console.log('Setting websockify host to ' + appInfo.wsHost);
    }
    return appInfo;
};

DockerInfo.prototype.addDockerInfoFromEnvars = function (appInfo) {
    var dockerHosts = settings.multidockerConfig.defaultValues.host;
    var host = dockerHosts[Math.floor(Math.random()*dockerHosts.length)];
    console.log('Docker host = ' + host);
    appInfo.dockerHost = host;
    appInfo.dockerTLSVerify = settings.multidockerConfig.defaultValues.tlsVerify;
    appInfo.dockerMachineName = settings.multidockerConfig.defaultValues.machineName;

    // If distributed websockify is enabled, we need to set the wsHost value
    if (settings.multidockerConfig.enabledDistributedWS) {
        appInfo.wsHost = url.parse(host).hostname;
        console.log('Setting websockify host to ' + appInfo.wsHost);
    }
    return appInfo;
};

module.exports = DockerInfo;
