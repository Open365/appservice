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

/*
 Use this file as an example. It will be mounted into the docker
 as a volume. If you need to modify it go to:
 EYEOS_CLI/environments/volumes/multidocker-info/hosts.js
 */

var hostsInfo = {
    /*'EU': [{
        host: 'tcp://1.1.1.1:444',
        tlsVerify: 0,
        machineName: 'docker-machine',
        wsHost: 'wss://9.9.9.9'
    }, {
        host: 'tcp://2.2.2.2:444',
        tlsVerify: 0,
        wsHost: 'wss://9.9.9.9'
    }],
    'US': [{
        host: 'tcp://3.3.3.3:444',
        wsHost: 'wss://5.5.5.5:5555'
    }, {
        host: 'tcp://4.4.4.4:444',
        tlsVerify: 0,
        machineName: 'docker-machine',
        wsHost: 'wss://8.8.8.8:443'
    }],
    'defaultValues': [{
        host: 'tcp://5.5.5.5:444',
        tlsVerify: 0,
        machineName: 'docker-machine',
        wsHost: 'wss://10.10.10.10:4430'
    }, {
        host: 'tcp://6.6.6.6:444'
    }]*/
};

module.exports = hostsInfo;
