'use strict';

const fs    = require('fs');
const spawn = require('child_process').spawn;

const Qmp    = require('../qemu/qmp');
const Parser = require('./parser');
const vms    = require('./vms');
const host   = require('./host');


class Vm {
  constructor(name) {
    this.conf = {name:name};
    this.readConf();
    this.qmp  = new Qmp(this.uuid);

    if (host.isVmRunning(this.uuid) ) {
      console.log('reconnect qmp');
      this.qmp.attach(this.conf.settings.qmp);
    } else if (this.conf.settings.autoBoot) {
      this.startProcess();
    } // else if
  } // constructor()


  readConf() {
    this.conf = JSON.parse( fs.readFileSync(`${__dirname}/../vmConfigs/${this.conf.name}.json`) );
  }

  get uuid() { return this.conf.uuid; }


  // TODO: listen to SHUTDOWN, if process is not there then we have to handle the restart of this vm, for conf.settings.autoBoot

  start() {
    // TODO: check if process is running and only a qmp cmd ins necessary. cause qemu can be hold in hot standby mode

    this.startProcess()
  }


  startProcess() {
    try {
      const args = (new Parser()).vmConfToArgs(this.conf);
      console.log(`mv args are ${args.join(' ')}`);
      const proc = this.process = spawn(args.shift(), args, {stdio: 'pipe', detached:true});
      proc.on('error', (e) => {
        console.log(`process error ${e}`);
      });
      proc.stdout.on('data', (d) => console.log(`Proc.stdout: ${d.toString()}`) );
      proc.stderr.on('data', (d) => console.log(`Proc.stderr: ${d.toString()}`) );
      proc.on('exit', (code, signal) => {
        if (0 == signal) {
          console.log(`Process exited with Code 0, Signal ${signal}. OK`);
        } else {
          console.log(`Process exited with Code ${code}, Signal ${signal}`);  
        } // else

        // todo: send event via a event stream?
        if (this.conf.settings.autoBoot) { this.start(); }
      });
      this.qmp.attach(this.conf.settings.qmp);

      console.log(`Booted vm ${this.conf.name}`);
    } catch(e) {
      console.log(e);
      console.log(e.stack);
      console.error(`Cant start vm ${this.conf.name}`);
    }
  } // boot()

  qmpCmd(cmd, args) { if (this.qmp) this.qmp.cmd(cmd, args); }
}

module.exports = Vm;
