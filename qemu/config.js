'use strict';

/*
read qemu config from actually qemu binary
*/

const execSync = require('child_process').execSync;


class QemuConfig {
  constructor() {

    // V E R S I O N
    this.versions = {major:0,minor:0,patch:0};
    execSync('qemu-system-x86_64 --version 2>&1').toString('utf8').split('\n').forEach( (line) => {
      var match = line.match(/^QEMU\ emulator\ version\ (\d+)\.(\d+)\.(\d+)/);
      if (match) {
        this.versions.major = match[1];
        this.versions.minor = match[2];
        this.versions.patch = match[3];
      } // if
    });
    this.version = `${this.versions.major}.${this.versions.minor}.${this.versions.patch}`;

    // C P U S
    this.cpus = execSync('qemu-system-x86_64 -cpu help').toString('utf8').split('\n').reduce( (prev, line) => {
      var match = line.match(/^x86\ +(\S+)\ ?(.*)/);
      if (match) {
        prev.push({name:match[1], description:match[2].trim().replace(/\ +/g, ' ')});
      } // if
      return prev;
    }, []);


    // M A C H I N E S
    this.machines = execSync('qemu-system-x86_64 -machine help').toString('utf8').split('\n').reduce( (prev, line) => {
      var match = line.match(/^(\S+)\ {2,}(.*)/);
      if (match) {
        prev.push({name:match[1], description:match[2]});
      } // if
      return prev;
    }, []);


    // N E T  M O D E L S
    this.netModels = execSync('qemu-system-x86_64 -net nic,model=help 2>&1').toString('utf8').split('\n').reduce( (prev, line) => {
      var match = line.match(/models:\ (\S+)/);

      if (match) {
        match[1].split(',').forEach( (model) => prev.push({name:model, description:''}));
      }
      return prev;
    }, []);
  } // constructor()
}

const qemuConfig = new QemuConfig();

module.exports   = qemuConfig;
