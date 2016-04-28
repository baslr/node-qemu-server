'use strict';

const fs    = require('fs');
const spawn = require('child_process').spawn;

const Qmp    = require('../qemu/qmp');
const Parser = require('./parser');
const vms    = require('./vms');
const host   = require('./host');


class Vm {
  constructor(name) {
    this.process = null;
    this.conf = {name:name};
    this.readConf();
    this.qmp  = new Qmp(this.uuid);

    if (host.isVmRunning(this.uuid) ) {
      console.log('reconnect qmp');
      this.qmp.attach(this.conf.settings.qmp);
    } else if (this.conf.settings.autoBoot) {
      this.start();
    } // else if

    vms.on('event', (msg) => {
      if (msg.vmUuid == this.uuid && msg.event == 'SHUTDOWN' && this.conf.settings.autoBoot) {
        const tryRestart = () => {
          if (this.conf.noShutdown && host.isVmRunning(this.uuid)) setTimeout(tryRestart, 1000);
          else this.start();
        } // tryRestart()
        tryRestart();
      } // if
    });
  } // constructor()


  readConf() {
    this.conf = JSON.parse( fs.readFileSync(`${__dirname}/../vmConfigs/${this.conf.name}.json`) );
  }

  get uuid() { return this.conf.uuid; }


  start() {
    // TODO: if this.process or process is running
    if (this.process) { // this is mumpits, you cant start the vm because then the vm has to rum and the only with qmp cmds reset etc its possible
      console.log(`VM:${this.conf.name}:start:congrats:this should never happen`);
      // this.qmpCmd('start');
    } else {
      console.log(`VM:${this.conf.name}:start:via:process:spawn`);
      this.startProcess()
    } // else
  } // start()


  startProcess() {
    try {
      const args = (new Parser()).vmConfToArgs(this.conf);
      console.log(`VM:${this.conf.name}:startProcess:args:${args.join(' ')}`);
      this.process = spawn(args.shift(), args, {stdio: 'pipe', detached:true});
      this.process.on('error', (e) => {
        console.log(`process error ${e}`);
      });
      this.process.stdout.on('data', (d) => console.log(`Proc.stdout: ${d.toString()}`) );
      this.process.stderr.on('data', (d) => console.log(`Proc.stderr: ${d.toString()}`) );
      this.process.on('exit', (code, signal) => {
        if (0 == signal) {
          console.log(`Process exited with Code 0, Signal ${signal}. OK`);
        } else {
          console.log(`Process exited with Code ${code}, Signal ${signal}`);  
        } // else

        this.process = null;

        // todo: send event via a event stream?
        if (this.conf.settings.autoBoot) { this.start(); }
      });
      this.qmp.attach(this.conf.settings.qmp);

      console.log(`VM:${this.conf.name}:startProcess:booted`);
    } catch(e) {
      console.log(e);
      console.log(e.stack);
      console.error(`Cant start vm ${this.conf.name}`);
    }
  } // boot()

  qmpCmd(cmd, args) { console.log(`VM:${this.conf.name}:qmpCmd:${cmd}:${args}`); if (this.qmp) this.qmp.cmd(cmd, args); }
}

module.exports = Vm;
