'use strict';

const vms        = require('./vms');
const webService = require('./webService');

class App {
  constructor() {
    this.vms        = vms;
    this.webService = webService;

    vms.on('event', (msg) => {
      console.log(`Vms:event:${msg.vmUuid}:${msg.event}`);
      webService.send('vm-event', msg);
    });
    vms.on('status', (msg) => {
      console.log(`Vms:status:${msg.vmUuid}:${msg.status}`)
      webService.send('vm-status', msg);
    });
  } // constructor

  start() {
    this.vms.restore();

    this.webService.start();
  }
}

const app = new App();

module.exports = app;
