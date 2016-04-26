'use strict';

const Parser = require('./lib/parser');
const assert = require('assert');


const startArgs   = (new Parser().args);
const sliceLength = startArgs.length;


const tests = [
 ['nodefconfig', [], ['-nodefconfig']]
,['nodefaults',  [], ['-nodefaults']]


// cpus ram gfx
,['smp',      [2,3,4],     ['-smp', 'cpus=24,sockets=2,cores=3,threads=4']]
,['smp',      [1,4,1],     ['-smp', 'cpus=4,sockets=1,cores=4,threads=1']]
,['smp',      [1,4,2],     ['-smp', 'cpus=8,sockets=1,cores=4,threads=2']]
,['smp',      [2],         ['-smp', 'cpus=2,sockets=2,cores=1,threads=1']]
,['smp',      [2,3],       ['-smp', 'cpus=6,sockets=2,cores=3,threads=1']]

,['cpuModel', [],          ['-cpu', 'qemu64']]
,['cpuModel', ['myModel'], ['-cpu', 'myModel']]

,['ram',      [1024],  ['-m', '1024M']]
,['vga',      ['qxl'], ['-vga', 'qxl']]
,['keyboard', ['de'],  ['-k', 'de']]


// machine and accelerator
,['machine', ['myMachine'], ['-machine', 'type=myMachine']]
,['accel',   ['kvm'],       ['-machine', 'accel=kvm']]
,['kvm',     [],            ['-enable-kvm']]


// vnc, qmp, spice
,['vnc',   [4], ['-vnc', ':4']]
,['qmp',   [6], ['-qmp-pretty', 'tcp:127.0.0.1:6,server']]
,['spice', [8, '1.2.3.4'], ['-spice', 'port=8,addr=1.2.3.4,disable-ticketing']]
,['spice', [8, '1.2.3.4', 'myPassword'], ['-spice', `port=8,addr=1.2.3.4,password='myPassword'`]]

// net
,['net', ['myMacAddr', 'myCard', 'user'], ['-net', 'nic,model=myCard,macaddr=myMacAddr', '-net', 'user']]
,['net', ['myMacAddr', 'myCard', 'user', {guestIp:'gIp',fwds:[{hostIp:'hIp',hostPort:'hPort', guestPort:'gPort'}]}], ['-net', 'nic,model=myCard,macaddr=myMacAddr', '-net', 'user,dhcpstart=gIp,hostfwd=tcp:hIp:hPort-gIp:gPort']]


// drives
,['drive', ['disk',      '/myPath.img', 'virtio'], ['-drive', 'file=/myPath.img,media=disk,if=virtio']]
,['drive', ['partition', '/dev/sdb1',   'virtio'], ['-drive', 'file=/dev/sdb1,media=disk,if=virtio,cache=none']]
,['drive', ['cdrom',     '/myCd.iso',   'virtio'], ['-drive', 'file=/myCd.iso,media=cdrom,if=virtio']]

]


for(const test of tests) {
  const parser = new Parser();
  const cmd    = test[0];
  const args   = test[1];
  const cmp    = test[2];

  const ret = parser[cmd].apply(parser, args).args;

  try {
    assert.deepStrictEqual(ret.slice(sliceLength), cmp);
    console.log(`Passed ${cmd} with ${args.length} Args. ${JSON.stringify(args)}`);
  } catch(e) {
    console.log(e);
  }
}
