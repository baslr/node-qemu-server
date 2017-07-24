'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const vms        = require('./vms');
const qemuConfig = require('../qemu/config');
const Img        = require('../qemu/img');


class WebService {
  constructor() {
    this.sseClients = [];
  }

  start() {
    this.setup();
  } // start()

  setup() {
    this.app = express();
    this.app.use( bodyParser.json() );
    this.app.use( express.static(`${__dirname}/../public`) );

    this.app.use( (req, res, next) => {
      console.log(`WEB:${req.method}:${req.url}`);
      next();
    });

    // add new vm
    this.app.post('/api/vms', (req, res) => {
      vms.add(req.body);
      res.sendStatus(204);
    });

    this.app.get('/api/vms/confs', (req, res) => {
      res.json(vms.confs);
    });

    this.app.get('/api/vms/qmp/:action', (req, res) => {
      vms.qmpToAll(req.params.action);
      res.sendStatus(204);
    });

    this.app.get('/api/vms/proc/status', (req, res) => {
      vms.procStatusToAll();
      res.sendStatus(204);
    });

    this.app.get('/api/vm/:uuid/:action', (req, res) => {
      vms.qmpTo(req.params.uuid, req.params.action);
      res.sendStatus(204);
    });

    this.app.get('/api/vm/:uuid/proc/start', (req, res) => {
      vms.start(req.params.uuid);
      res.sendStatus(204);
    });


    // D R I V E S
    this.app.post('/api/drives', (req, res) => {
      console.log(req.body);
      const img = new Img();
      img.create(req.body);
      res.sendStatus(204);
    });


    this.app.get('/a', (req, res) => {
      const removeFromSse = (res) => {
        for(var idx in this.sseClients) {
          const r = this.sseClients[idx];

          if (r === res) {
            console.log('remove response');
            this.sseClients.splice(idx, 1);
            break;
          } // if
        } // for
      } // removeFromSse()

      res.on('error', () => removeFromSse(res) );
      res.on('close',   () => removeFromSse(res) );
      res.setTimeout(0, () => console.log('response timeout out') );

      this.sseClients.push(res);

      res.setHeader('content-type', 'text/event-stream');

      res.write('data: initial response\n\n');

      ['cpus', 'machines', 'nics'].forEach( (itm) => this.send('qemu-config', {selection:itm, data:qemuConfig[itm]}) );
    });

    this.app.use( (req, res) => {
      res.sendFile('index.html', {root:`${__dirname}/../public/`});
    });


    this.app.listen(4224, '0.0.0.0');
  } // setup()

  send(event, data={}) {
    this.sseClients.forEach((res) => {
      console.log(`WEB:sse:${event}`);
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  } // send()
}

const webService = new WebService();


module.exports = webService;
