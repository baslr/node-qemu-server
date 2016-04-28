'use strict';

const express = require('express');
const vms     = require('./vms');


class WebService {
  constructor() {
    this.sseClients = [];
  }

  start() {
    this.setup();
  } // start()

  setup() {
    this.app = express();
    this.app.use( express.static(`${__dirname}/../public`) );

    this.app.use( (req, res, next) => {
      console.log(`WEB:${req.method}:${req.url}`);
      next();
    });

    this.app.get('/api/vms/confs', (req, res) => {
      res.json(vms.confs);
    });

    this.app.get('/api/vms/qmp/:action', (req, res) => {
      vms.qmpToAll(req.params.action);
      res.status(204).end();
    });

    this.app.get('/api/vm/:uuid/:action', (req, res) => {
      if (req.params.action == 'start') {
        vms.start(req.params.uuid);
      } else {  // if
        vms.qmpTo(req.params.uuid, req.params.action);
      } // else
      res.status(204).end();
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
      // TODO: send cmd to all vms bzgl. vnc status
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
