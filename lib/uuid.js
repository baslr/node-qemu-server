'use strict';

const crypto = require('crypto');

class Uuid {
  new() {
    return crypto.randomBytes(32).toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/).slice(1).join('-');
  }
}

const uuid = new Uuid();

module.exports = uuid;
