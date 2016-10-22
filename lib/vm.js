'use strict';

const fs    = require('fs');
const spawn = require('child_process').spawn;

const Qmp    = require('../qemu/qmp');
const Parser = require('./parser');
const uuid   = require('./uuid');
const vms    = require('./vms');
const host   = require('./host');


class Vm {
  constructor(name) {
    this.conf = {name:name};
    this.readConf();

    if (this.conf.settings.vnc && this.conf.settings.vnc.enabled && !this.conf.settings.vnc.port) {
      this.conf.settings.vnc.port = vms.nextFreeVncPort;
      this.saveConf();
    } // if

    if (!this.conf.settings.qmp) {
      this.conf.settings.qmp = {port:vms.nextFreeQmpPort};
      this.saveConf();
    }

    this.qmp  = new Qmp(this.uuid);

    if (host.isVmRunning(this.uuid) ) {
      console.log(`VM:${this.conf.uuid}:reconnect-qmp`);
      this.qmp.attach(this.conf.settings.qmp);
    } else if (this.conf.settings.autoBoot) {
      this.start();
    } // else if

    vms.on('event', (msg) => {
      if (msg.vmUuid == this.uuid && msg.event == 'SHUTDOWN' && this.conf.settings.autoBoot) {
        const tryRestart = () => {
          if (!this.conf.settings.noShutdown && host.isVmRunning(this.uuid)) {
            console.log('settimeout lol');
            setTimeout(tryRestart, 1000);
          } // if
          else {
            this.start();
          } // else
        } // tryRestart()
        tryRestart();
      } // if
    });
  } // constructor()


  readConf() {
    this.conf = JSON.parse( fs.readFileSync(`${__dirname}/../vmConfigs/${this.conf.name}.json`) );

    if (!this.conf.uuid) {
      this.conf.uuid = uuid.new();
      this.saveConf();
    } // if
  }


  saveConf() {
    fs.writeFileSync(`${__dirname}/../vmConfigs/${this.conf.name}.json`, JSON.stringify(this.conf, false, 2));
  } // saveConf()


  get uuid() { return this.conf.uuid; }


  start() {
    if (host.isVmRunning(this.uuid)) {
      console.log(`VM:${this.conf.name}:start:proc-already-running`);
    } else {
      console.log(`VM:${this.conf.name}:start:via:process:spawn`);
      this.startProcess();
    } // else
  } // start()


  startProcess() {
    try {
      const args = (new Parser()).vmConfToArgs(this.conf);
      console.log(`VM:${this.conf.name}:startProcess:args:${args.join(' ')}`);
      const proc = spawn(args.shift(), args, {stdio: 'pipe', detached:true});
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

        if (host.isVmRunning(this.conf.uuid)) {
          vms.emit('proc-status', {status:'running', vmUuid:this.conf.uuid});
        } else {
          vms.emit('proc-status', {status:'terminated', vmUuid:this.conf.uuid});
        }

        if (this.conf.settings.autoBoot) { this.start(); }
      });
      vms.emit('proc-status', {status:'running', vmUuid:this.conf.uuid});
      this.qmp.attach(this.conf.settings.qmp);

      console.log(`VM:${this.conf.name}:startProcess:booted`);
    } catch(e) {
      console.log(e);
      console.log(e.stack);
      console.error(`Cant start vm ${this.conf.name}`);
    }
  } // startProcess()

  qmpCmd(cmd, args) { console.log(`VM:${this.conf.name}:qmpCmd:${cmd}:${args}`); if (this.qmp) this.qmp.cmd(cmd, args); }
}

module.exports = Vm;
