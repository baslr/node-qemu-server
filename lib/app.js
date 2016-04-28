'use strict';

const vms        = require('./vms');
const webService = require('./webService');

class App {
  constructor() {
    this.vms        = vms;
    this.webService = webService;

    vms.on('event', (msg) => {
      console.log(`VMS:on:event:${msg.vmUuid}:${msg.event}`);
      webService.send('vm-event', msg);
    });
    vms.on('status', (msg) => {
      console.log(`VMS:on:status:${msg.vmUuid}:${msg.status}`);
      webService.send('vm-status', msg);
    });
    vms.on('generic', (msg) => {
      console.log(`VMS:on:generic:${JSON.stringify(msg)}`);
      webService.send('vm-generic', msg);
    });
  } // constructor

  start() {
    this.vms.restore();

    this.webService.start();
  }
}

const app = new App();

module.exports = app;
