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
    this.qmp  = new Qmp(name);

    this.readConf();

    

    if (false && true) { // if vm process is running
      console.log('reconnect qmp');
      this.qmp.attach(this.conf.settings.qmp);

    } else if (true || this.conf.settings.autoBoot) {
      this.startProcess();
    } // else if
  } // constructor()


  readConf() {
    this.conf = JSON.parse( fs.readFileSync(`${__dirname}/../vmConfigs/${this.conf.name}.json`) );
  }


  startProcess() {
    try {
      const args   = (new Parser()).vmConfToArgs(this.conf);
      console.log(`mv args are ${args.join(' ')}`);
      this.qmp.attach(this.conf.settings.qmp);
      const proc   = this.process = spawn(args.shift(), args, {stdio: 'pipe', detached:true});
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
        
        // todo: send event via a event stream
      });

      console.log(`Booted vm ${this.conf.name}`);
    } catch(e) {
      console.log(e);
      console.log(e.stack);
      console.error(`Cant start vm ${this.conf.name}`);
    }
  } // boot()
}

module.exports = Vm;

