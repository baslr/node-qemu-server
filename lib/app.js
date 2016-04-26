'use strict';

const vms        = require('./vms');
const webService = require('./webService');

class App {
  constructor() {
    this.vms        = vms;
    this.webService = webService;
  } // constructor

  start() {
    this.vms.restore();

    this.webService.start();
  }
}


const app = new App();


module.exports = app;
