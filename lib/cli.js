const program = require('commander')
const winston = require('winston')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const Discovery = require('./discovery')
const TCPServer = require('./tcp-server')
const AirCast = require('./aircast')
const version = require('./version')

'use strict'

module.exports = function () {
  program
    .version(version)
    .option('-w, --web-port [port]', 'Set [port] for REST/WS service. Defaults to "9000"', 9000)
    .option('-s, --stream-port [port]', 'Set [port] for reading streaming data from. Defaults to "9001"', 9001)
    .option('-l, --level [level]', 'Set default [level] for sound. Defaults to "50"', 50)
    .option('-m, --mount-path [path]', 'Set [path] to mount files for an UI')
    .option('-b, --blacklist [name1,name2,...]', 'Disallow devices by [names...]',
      function (val) {
        return val.split(',')
      }
    )
    .option('-v, --verbose', 'Increase verbosity')
    .parse(process.argv)

  // init logger, according to program args
  var logger = new (winston.Logger)()

  logger.add(winston.transports.Console, {
    level: program.verbose ? 'debug' : 'info',
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true
  })

  // create Discovery
  var discovery = new Discovery(logger, {

  })

  // create TCPServer
  var tcp = new TCPServer(logger, {
    port: program.streamPort
  })

  // create AirCast
  var aircast = new AirCast(logger, discovery, tcp, {
    level: program.level,
    blacklist: program.blacklist || []
  })

  // create server
  var app = express()
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(bodyParser.json())
  var apiRouter = express.Router({mergeParams: true})
  apiRouter.get('/devices', function (req, res) {
    res.json(aircast.getDevices())
  })
  apiRouter.get('/devices/:name', function (req, res) {
    var device = aircast.getDeviceByName(req.params.name)
    if (!device) return res.status(404).send('Device not found')
    res.json(device)
  })
  apiRouter.put('/devices/:name/connect', function (req, res) {
    if (!aircast.hasDevice(req.params.name)) return res.status(404).send('Device not found')
    var device = aircast.setConnect(req.params.name, req.body.connect)
    res.json(device)
  })
  apiRouter.put('/devices/:name/volume', function (req, res) {
    if (!aircast.hasDevice(req.params.name)) return res.status(404).send('Device not found')
    var device = aircast.setVolume(req.params.name, req.body.volume)
    res.json(device)
  })
  app.use('/api', apiRouter)
  var server = http.Server(app)

  // mount path
  if (program.mountPath) app.use(express.static(program.mountPath))

  // handle signals
  var signals = { 'SIGINT': 2, 'SIGTERM': 15 }
  Object.keys(signals).forEach(function (signal) {
    process.on(signal, function () {
      logger.info('Got %s, shutting down aircast...', signal)
      discovery.stop()
      tcp.stop(function () {
        server.close(function () {
          logger.info('HTTP server stopped')
          process.exit(128 + signals[signal])
        })
      })
    })
  })

  // start discovery
  discovery.start()

  // start tcp
  tcp.start()

  // start server
  logger.info('HTTP server starting on port %s', program.webPort)
  server.listen(program.webPort)
}
