'use strict';

const fs = require('fs');

const events = require('./events');

class Vms {
  constructor() {
    this.vms = [];

    events.on('event', (msg) => {
      console.log(`Vms:event:${msg.vmName}:${msg.event}`);
    });
    events.on('status', (msg) => {
      console.log(`Vms:status:${msg.vmName}:${msg.status}`)
    })
  }

  restore() {
    this.vms = fs.readdirSync(`${__dirname}/../vmConfigs`).reduce( (prev, file) => {
      if (~file.search(/\.json$/) ) {
        const vmName = file.slice(0,-5);
        console.log(`Found vm ${vmName}`);
        try {
          const vm = new (require('./vm'))(vmName);
          prev.push(vm);
          console.log(`Loaded vm ${vmName}`);
        } catch(e) {
          console.log(e);
          console.log(e.stack.split('\n'));
          console.log(`Cant load vm ${vmName}, sorry :-(`);
        }
      } // if
      return prev;
    }, []);
  } // loadAll()

  reattach() {
    console.log('reattach');
  }


  autoBoot() {
    console.log('autoBoot vms');
    this.vms.forEach((vm) => vm.autoBoot() );
  }
}

const vms = new Vms();

module.exports = vms;
