'use strict';

/*
host part

* get next free port
* scann for virtual machines running
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
}


var host = new Host();


// const port = host.nextFreePort(8529);
// console.log('next free port is', port);


module.exports = host;


// L I N U X
// ps ax -o pid,etimes,lstart,cputime|less
// cat /proc/{pid}/cmdline


// O S  X
// ps ax -o pid,etime,lstart,cputime,comm


// TODO: processes, network interfaces
