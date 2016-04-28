'use strict';

const fs     = require('fs');
const events = require('events');

class Vms extends events {
  constructor() {
    super();
    this.vms = [];
  }

  restore() {
    this.vms = fs.readdirSync(`${__dirname}/../vmConfigs`).reduce( (prev, file) => {
      if (~file.search(/\.json$/) ) {
        const vmName = file.slice(0,-5);
        console.log(`VMS:restore:vm:${vmName}`);
        try {
          const vm = new (require('./vm'))(vmName);
          prev.push(vm);
          console.log(`VMS:restore:loaded:${vmName}`);
        } catch(e) {
          console.log(e);
          console.log(e.stack.split('\n'));
          console.log(`VMS:restore:load:e:${vmName}`);
        }
      } // if
      return prev;
    }, []);
  } // loadAll()


  start(uuid) {
    const vm = this.vm(uuid);
    vm && vm.start();
  }

  vm(uuid) { return this.vms.find( (vm) => vm.uuid == uuid); }

  get confs() { return this.vms.reduce( (prev, vm) => {prev.push(vm.conf); return prev;}, []); }


  qmpToAll(cmd, args) { this.vms.forEach( (vm) => vm.qmpCmd(cmd, args) ); }
  qmpTo(uuid, cmd, args) {
    const vm = this.vm(uuid);
    vm && vm.qmpCmd(cmd, args);
    console.log('qmpTo', uuid, cmd, args);
  } // qmpTo()
}

const vms = new Vms();

module.exports = vms;
