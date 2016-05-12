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

var crypto = require('crypto');
var settings = require('./settings');

var MysqlInfo = function() {
    this.userSalt = settings.mysql.user_salt;
};

MysqlInfo.prototype.addInfo = function(appInfo) {
    /*
     * Important notice: the algorithm to generate dbUser, dbName and dbPass should be kept in sync
     * with the one present in eyeos-cli->MySQLUserCreator
     */


    appInfo.mysqlHost = settings.mysql.host;
    var user = appInfo.user;
    var domain = appInfo.domain;

    var hash = crypto.createHash('sha256');

    user = user + '_' + domain;

    var saltedUser = user + this.userSalt;
    hash.update(saltedUser);

    var password = hash.digest('hex');

    hash = crypto.createHash('sha256');
    // I'm putting saltedUser and then dbUser again in the hash because that is what eyeos-cli is doing
    hash.update(saltedUser);
    hash.update(user);
    var hashedData = hash.digest('hex');
    var dbUser = hashedData.substr(0, 16);
    var dbName = hashedData.substr(0, 16) + '_dbv2';

    appInfo.mysqlDbName = dbName;
    appInfo.mysqlUsername = dbUser;
    appInfo.mysqlPassword = password;

    return appInfo;
};

module.exports = MysqlInfo;
