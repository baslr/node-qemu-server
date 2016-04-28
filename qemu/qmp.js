'use strict';

const net = require('net');
const vms = require('../lib/vms');

class Qmp {
  constructor(vmUuid) {
    this.vmUuid   = vmUuid;
    this.count    = 0;
    this.lines    = [];
    this.cmdStack = [];
  };

  attach(conf) {
    console.log(`QMP attach to ${this.vmUuid}`);
    this.conf = conf;
    this.cmdStack.length = 0;

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
      this.cmdStack.push('qmp_capabilities');
      this.cmd('qmp_capabilities', 'query-status', 'query-vnc');
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
          console.log(`QMP:cmd:res:pre: ${JSON.stringify(msg)}`);
          if (msg.return) { msg = msg.return; }
          msg.vmUuid = this.vmUuid;
          msg.wasCmd = this.cmdStack.shift();
          if (msg.timestamp) {
            msg.timestamp = Number(`${msg.timestamp.seconds}.${msg.timestamp.microseconds}`);
          } else {
            msg.timestamp = Date.now()/1000;
          } // else 
          console.log(`QMP:cmd:res:post:${JSON.stringify(msg)}`);
          if (msg.event) {
            vms.emit('event', msg);
          } else if (msg.status) { // if
            vms.emit('status', msg);
          } else { // else if
            vms.emit('generic', msg);
          } // else
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


  cmd(cmd, args) {
    if (!this.socket) {
      // TODO: emit not connected
      return;
    } // if

    if (typeof args == 'object') {
      this.cmdStack.push(cmd);
      console.log(`QMP:cmd:${cmd}:args:${JSON.stringify}`);
      this.socket.write(JSON.stringify({execute:cmd, arguments: args}) );
    }
    else {
      for(var cmd of arguments) {
        if (typeof cmd != 'string') continue;
        this.cmdStack.push(cmd);
        console.log(`QMP:cmd:${cmd}`);
        this.socket.write(JSON.stringify({execute:cmd}) );
      } // for
    }
  } // cmd()
}

module.exports = Qmp;
