var program = require('commander');
var winston = require('winston');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var Discovery = require('./discovery');
var Proxy = require('./proxy');
var version = require('./version');

'use strict';

module.exports = function() {

  program
    .version(version)
    .option('-w, --web-port [port]', 'Set [port] for REST/WS service. Defaults to "9000"', 9000)
    .option('-s, --stream-port [port]', 'Set [port] for reading streaming data from. Defaults to "9001"', 9001)
    .option('-m, --mount-path [path]', 'Set [path] to mount files for an UI')
    .option('-v, --verbose', 'Increase verbosity')
    .parse(process.argv);

  // init logger, according to program args
  var logger = new (winston.Logger)();

  logger.add(winston.transports.Console, {
    level: program.verbose ? 'debug' : 'info',
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true
  });

  //create Discovery
  var discovery = new Discovery(logger, {

  });

    //create Proxy
  var proxy = new Proxy(logger, {
    port: program.streamPort
  });

  // create server
  var app = express();
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  var apiRouter = express.Router({mergeParams: true});
  apiRouter.get('/devices', function(req, res) {
    res.json(Object.keys(discovery.devices).map(function (key) {return discovery.devices[key]}));
  });
  app.use('/api', apiRouter);
  var server = http.Server(app);

  //mount path
  if (program.mountPath) app.use(express.static(program.mountPath));

  // handle signals
  var signals = { 'SIGINT': 2, 'SIGTERM': 15 };
  Object.keys(signals).forEach(function (signal) {
    process.on(signal, function () {
      logger.info("Got %s, shutting down aircast...", signal);
      discovery.stop();
      proxy.stop();
      process.exit(128 + signals[signal]);
    });
  });

  //start discovery
  discovery.start();

  //start proxy
  proxy.start();

  //start server
  logger.info('REST server starting on port %s', program.webPort);
  server.listen(program.webPort);
}