'use strict';

const events = require('events');

class Events extends events {}

const qemuEvents = new Events();

module.exports = qemuEvents;
