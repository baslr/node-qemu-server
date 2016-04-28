'use strict';

/*
 * get next free port
 * scann for virtual machines running
 * TODO: network interfaces
 */

const execSync = require('child_process').execSync;


class Host {

  constructor() {

  }

  isPortUsed(port) {
    if ( isNaN(port) ) throw "Not a number";
    return '0' == execSync(`nc -z 0.0.0.0 ${port} &> /dev/null; echo $?;`).toString('utf8').split('\n')[0];
  }

  nextFreePort(start) {
    do {
      this.isPortUsed(start);
      if (!this.isPortUsed(start)) return start;
      start++;
    } while(65536 > start);

    throw "No free port";
  }

  isVmRunning(uuid) {
    const procs = this.vmProcesses();
    const reg   = new RegExp(`-uuid\\ (${uuid})`.replace('-', '\\-'));

    return 1 == procs.filter( (proc) => {
      const match = reg.exec(proc);
      return (match && match[1] == uuid);
    }).length;
  } // isVmRunning()


  vmProcesses() {
    var slice = -1;
    return execSync('ps aux').toString('utf8').split('\n').reduce( (prev, line) => {
      if (slice == -1) {
        slice = line.search(/COMMAND$/);
      } else { // if
        if (~line.indexOf('qemu-system-x86_64')) { prev.push(line.slice(slice)); }
      } // else
      return prev;
    }, []);
  } // qemuProcess()
}


var host = new Host();

module.exports = host;


// L I N U X
// ps ax -o pid,etimes,lstart,cputime|less
// cat /proc/{pid}/cmdline

// O S  X
// ps ax -o pid,etime,lstart,cputime,comm
