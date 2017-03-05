const net = require('net')
const util = require('util')
const EventEmitter = require('events').EventEmitter

'use strict'

module.exports = TCPServer

function TCPServer (logger, settings) {
  this.logger = logger
  this.settings = settings
  this._init()
}

util.inherits(TCPServer, EventEmitter)

TCPServer.prototype._init = function () {
  var self = this
  this.server = net.createServer(function (socket) {
    self.socket = socket
    self.logger.info('New TCP server connection established')
    self.emit('connect', socket)

    socket.on('data', function (data) {
      self.emit('data', data)
    })

    socket.setTimeout(1 * 60 * 1000, function () {
      socket.end()
    })

    socket.on('end', function () {
      self.logger.info('TCP server connection ended')
    })
  })

  this.server.maxConnections = 1
}

TCPServer.prototype.start = function () {
  var self = this
  this.server.listen(this.settings.port, function () {
    self.logger.info('TCP server started on port %d', self.settings.port)
    self.emit('start')
  })
}

TCPServer.prototype.stop = function (cb) {
  var self = this
  this.server.close(function () {
    self.logger.info('TCP server stopped')
    self.emit('stop')
    cb()
  })

  if (this.socket) {
    this.socket.destroy()
  }
}
