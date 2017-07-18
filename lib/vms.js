'use strict';

const fs     = require('fs');
const events = require('events');
const host   = require('./host');

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
  } // restore()

  add(vmConfig) {
    fs.writeFileSync(`${__dirname}/../vmConfigs/${vmConfig.name}.json`, JSON.stringify(vmConfig, false, 2));
    const vm = new (require('./vm'))(vmConfig.name, vmConfig);
    this.vms.push(vm);
  }


  start(uuid) {
    const vm = this.vm(uuid);
    vm && vm.start();
  }


  procStatusToAll() {
    const procsRunning = host.vmProcesses();
    this.vms.forEach( (vm) => {
      const msg = {vmUuid:vm.uuid, status:'terminated'};
      if (host.isVmProcRunning(vm.uuid, procsRunning)) {
        msg.status = 'running';
      } // if
      this.emit('proc-status', msg);
    });
  }


  vm(uuid) { return this.vms.find( (vm) => vm.uuid === uuid); }

  get confs() { return this.vms.reduce( (prev, vm) => {prev.push(vm.conf); return prev;}, []); }

  _nextFreePort(start, fnc) {
    let idx = start;
    const portMap = {};

    for(const vm of this.vms) {
      try { portMap[fnc(vm.conf)] = true; } catch(e) {}
    }

    do {
      if (!portMap[idx])
        return idx;
      idx++;
    } while (idx < 65536)
    throw 'no more free ports';
  }

  get nextFreeVncPort() {
    return this._nextFreePort(0, (conf) => conf.settings.vnc.port);
  }

  get nextFreeQmpPort() {
    return this._nextFreePort(15000, (conf) => conf.settings.qmp.port);
  }


  qmpToAll(cmd, args) { this.vms.forEach( (vm) => vm.qmpCmd(cmd, args) ); }
  qmpTo(uuid, cmd, args) {
    const vm = this.vm(uuid);
    vm && vm.qmpCmd(cmd, args);
    console.log('qmpTo', uuid, cmd, args);
  } // qmpTo()
}

const vms = new Vms();

module.exports = vms;
