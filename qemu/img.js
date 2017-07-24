'use strict';

const fs       = require('fs');
const execSync = require('child_process').execSync;
const uuid     = require('../lib/uuid');

class Img {
    constructor(conf = {}) {
        if (conf.create) {
            conf.uuid = uuid.new();
        } // if

        if (conf.create && 'file' === conf.type) {
            const createArgs = ['qemu-img', 'create', '-f', conf.format];

            if (conf.useBacking) {
                createArgs.push('-o', `backing_file=${conf.backingPath},backing_fmt=qcow2${conf.size?',size='+conf.size:''}`)
            } // if

            createArgs.push(conf.uuid+'.img');

            if (!conf.useBacking && conf.size) {
                createArgs.push('-o', `size=${conf.size}`);
            } // if

            const ret = execSync(createArgs.join(' '), {shell:'/bin/bash', cwd:`${__dirname}/../disks/`});
            fs.writeFileSync(`${__dirname}/../disks/${conf.uuid}.json`, JSON.stringify(conf, false, 2));

            console.log(ret.toString());
        } // if
        this.conf = JSON.parse(JSON.stringify(conf));
    }

    create(conf) {
        if (!conf.uuid) {
            conf.uuid = uuid.new();
        } // if

        const createArgs = ['qemu-img', 'create', `${conf.uuid}.img`, '-f', conf.format];

        switch (conf.type) {
            case 'new':
                createArgs.push('-o', `size=${conf.size}`);

                if (conf.useBacking) {
                    createArgs.push('-o', `backing_file=${conf.backingPath}`);
                }

                const ret = execSync(createArgs.join(' '), {shell:'/bin/bash', cwd:`${__dirname}/../disks/`});
                conf.path = `disks/${conf.uuid}.img`;
                fs.writeFileSync(`${__dirname}/../disks/${conf.uuid}.json`, JSON.stringify(conf, false, 2));

                console.log(ret.toString());
                break;

            case 'path':
                fs.writeFileSync(`${__dirname}/../disks/${conf.uuid}.json`, JSON.stringify(conf, false, 2));
                break;
        } // switch
    }

    get config() {
        return {
            path:`disks/${this.conf.uuid}.img`,
            type:'disk',
            interface:'virtio'
        };
    }
}

module.exports = Img;

/*

name: 'w10',
  type: 'new',
  size: '20G',
  format: 'qcow2',
  media: 'disk'


const img = new Img({backingPath:"nbd:192.168.2.103:10115",
format:"qcow2",
type:'file',
size:'20G',
name:"arangodrive-3",
useBacking:true,create:true});

console.log(img.config);
*/


// qemu-img create -o backing_file=nbd:192.168.2.103:13140,backing_fmt=qcow2 -f qcow2 newin10.img

/*
backingPath:"nbd:192.168.2.103:10115"
format:"qcow2"
name:"arangodrive-3"
size:"20G"
useBacking:true
*/