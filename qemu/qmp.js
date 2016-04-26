'use strict';

const net    = require('net');
const events = require('../lib/events');

class Qmp {
  constructor(vmName) {
    this.vmName = vmName;
    this.count  = 0;
    this.lines  = [];
  };

  attach(conf) {
    this.conf = conf;

    console.log(`QMP attach to ${this.vmName}`);

    const socket = this.socket = net.connect(conf.port);
    const onError = (e) => {
      console.log('socket error', e);
      if (e.code == 'ECONNREFUSED') {
        console.log('try reconnect', this.count++);
        socket.removeListener('error',   onError);
        socket.removeListener('data',    onData);
        socket.removeListener('connect', onConnect);
        socket.removeListener('close',   onClose);

        setTimeout( () => {
          this.attach(conf);
        }, 1000);
      } // if
    };
    const onConnect = () => {
      console.log('connected to socket');
      socket.write('{"execute":"qmp_capabilities"}');
      socket.write('{"execute":"query-status"}');
    };
    const onClose = () => console.log('socket close');
    const onData = (d) => {
      this.lines.push.apply(this.lines, d.toString('utf8').split('\r\n'));

      var json = [];
      while(this.lines.length ) {
        const line = this.lines.shift()
        if (''  == line) continue;
        json.push(line);

        if ('}' == line) {
          var msg = JSON.parse(json.join(''));
          console.log(JSON.stringify(msg));

          if (msg.return) { msg = msg.return; }
          msg.vmName = this.vmName;
          if (msg.timestamp) {
            msg.timestamp = Number(`${msg.timestamp.seconds}.${msg.timestamp.microseconds}`);
          } else {
            msg.timestamp = Date.now()/1000;
          } // else 

          if (msg.event) {
            events.emit('event', msg);
          } else if (msg.status) { // if
            events.emit('status', msg);
          } // else if
          json = [];
        } // if
      } // while
      this.lines.unshift.apply(this.lines, json);
    };

    socket.on('error',   onError);
    socket.on('connect', onConnect);
    socket.on('close',   onClose);
    socket.on('data',    onData);
  } // attach()
}

module.exports = Qmp;
