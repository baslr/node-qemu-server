'use strict';

const net  = require('net');
const vms  = require('../lib/vms');
const host = require('../lib/host');

class Qmp {
  constructor(vmUuid) {
    this.vmUuid   = vmUuid;
    this.count    = 0;
    this.lines    = [];
    this.cmdStack = [];
  };

  attach(conf) {
    console.log(`QMP attach to ${this.vmUuid}`);
    clearTimeout(this.timeout);
    this.conf = conf;
    this.timeout = undefined;
    this.cmdStack.length = 0;

    var socket = this.socket = net.connect(conf.port);
    const onError = (e) => {
      console.log('socket error', e);
      if (e.code == 'ECONNREFUSED') {
        console.log('try reconnect', this.count++);
        socket.removeListener('error',   onError);
        socket.removeListener('data',    onData);
        socket.removeListener('connect', onConnect);
        socket.removeListener('close',   onClose);
        socket = this.socket = null;

        this.timeout = setTimeout( () => {
          this.attach(conf);
        }, 1000);
      } // if
    };
    const onConnect = () => {
      console.log('connected to socket');
      this.count = 0;
      this.cmdStack.push('qmp_capabilities');
      this.cmd('qmp_capabilities', 'query-status', 'query-vnc');
    };
    const onClose = (hadError) => {
      console.log('socket close had error', hadError);
      socket = this.socket = null;
      vms.emit('status', {status:'N/A', vmUuid:this.vmUuid});

      if (!host.isVmProcRunning(this.vmUuid)) {
        vms.emit('proc-status', {status:'terminated', vmUuid:this.vmUuid});
      } // if
    };
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
      vms.emit('status', {status:'N/A', vmUuid:this.vmUuid});
    } else if (typeof args == 'object') {
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
