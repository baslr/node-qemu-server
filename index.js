#!./6-node
'use strict';

const qemuConfig = require('./qemu/config');


// read node version
const versions = process.version.split('.');
const major    = Number( versions[0].match(/\d+/)[0] );
const minor    = Number( versions[1].match(/\d+/)[0] );
const patch    = Number( versions[2].match(/\d+/)[0] );

if (versions.length != 3 || major < 5 || (major == 5 && minor < 11) ) {
  console.warn('Minimum supported node version is v5.11.0');
  process.exit();
}
console.log(`Found node version ${major}.${minor}.${patch}, OK`);


if (qemuConfig.versions.major < 2 || (qemuConfig.versions.major == 2 && qemuConfig.versions.minor < 5) ) {
  console.log('Minimum supported qemu version is v2.5.0');
  process.exit();
}
console.log(`Found qemu version ${qemuConfig.version}, OK`);

if (!qemuConfig.vncSupport) {
  console.log('qemu has no vnc support');
  process.exit();
}
console.log('Found qemu vnc, OK');

if (!qemuConfig.spiceSupport) {
  console.log('qemu has no spice support');
} else {
  console.log('Found qemu spice, OK');
}


const app = require('./lib/app');

app.start();







/*

read qemu images
read qemu isos

read qemu machines aka configs
  -> check if all requirements are mett


start webservice

TODO:
  webservice:
    file management
      -create vm image
      -upload vm image
      -weget  vm image

      -wget   iso
      -upload iso

    mv management
      // result is emited to all connected clients
      -create
      -edit
      -delete (with image deletion)

      -start
      -pause / resume
      -stop
      -reboot

      -(migrate)

*/


/*

TODO:
  - display network i/o
  - display hdd usage x of y GB
  - autorestart at x o'clock

*/