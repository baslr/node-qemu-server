'use strict';

const fs = require('fs');

class Drives {
    constructor() {}

    get all() {
        return fs.readdirSync(`${__dirname}/../disks/`)
        .filter(file => ~file.search(/\.json$/)).map(file => JSON.parse(fs.readFileSync(`${__dirname}/../disks/${file}`)));
    }
}


const drives = new Drives();

module.exports = drives;
