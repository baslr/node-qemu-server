'use strict';

const express = require('express');


class WebService {
  constructor() {
  }

  start() {
    this.setup();
  } // start()

  setup() {
    this.app = express();
    this.app.use( express.static(`${__dirname}/../public`) );

    this.app.use( (req, res, next) => {
      console.log(`method ${req.method} ${req.url}`);

      next();
    });

    this.app.get('/a', (req, res) => {
      res.setHeader('content-type', 'text/event-stream');



      res.write('data: initial response\n\n');

    });


    this.app.listen(4224, '0.0.0.0');
  } // setup
}

const webService = new WebService();


module.exports = webService;
