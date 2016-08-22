var net = require('net');
var util = require( 'util' );
var EventEmitter = require('events').EventEmitter;

'use strict';

module.exports = Proxy;

function Proxy(logger, settings) {
  this.logger = logger;
  this.settings = settings;
  this._init();
}

util.inherits(Proxy, EventEmitter);


Proxy.prototype._init = function () {
  var self = this;
  this.server = net.createServer(function (socket) {
    self.socket = socket;
    self.logger.info('New proxy connection established');
    self.emit('connect', socket);

    socket.on('data', function (data) {
      self.emit('data', data);
    });
    socket.on('end', function(had_error) {
      self.logger.info('Proxy connection ended');
      self.emit('end');
    });
  });
 
  this.server.maxConnections = 1;
};

Proxy.prototype.start = function () {
  var self = this;
  this.server.listen(this.settings.port, function() {
    self.logger.info('Proxy started on port %d', self.settings.port);
    self.emit('start');
  });
};

Proxy.prototype.stop = function (cb) {
  var self = this;
  this.server.close(function() {
    self.logger.info('Proxy stopped');
    self.emit('stop');
    cb();
  });

  if (this.socket) {
    this.socket.destroy();
  }
};