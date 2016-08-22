var util = require( 'util' );
var EventEmitter = require('events').EventEmitter;
var mdns = require( 'mdns' );

'use strict';

module.exports = Discovery;

function Discovery(logger, settings) {
  this.logger = logger;
  this.devices = {};
  this.settings = settings;
  this._init();
}

util.inherits(Discovery, EventEmitter);


Discovery.prototype._init = function () {
  var self = this;

  var sequence = [
    mdns.rst.DNSServiceResolve(),
    'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families:[4]}),
    mdns.rst.makeAddressesUnique()
  ];

  this.browser = mdns.createBrowser(mdns.tcp('raop'), {resolverSequence: sequence});
  this.browser.on('serviceUp', function(info) {
    self.devices[info.name] = info;
    self.emit('serviceUp', info);
    self.logger.info('Device up for service: %s', info.name);
    self.logger.debug(info);
  });
  this.browser.on('serviceDown', function(info) {
    var device = self.devices[info.name];
    self.emit('serviceDown', info);
    self.logger.info('Device down for service: %s', info.name);
    self.logger.debug(info);
    if (device) {
      delete self.devices[info.name];
    }
  });
};

Discovery.prototype.start = function () {
  this.browser.start();
  this.logger.info('Discovery started');
  this.emit( 'start' );
};

Discovery.prototype.stop = function() {
  this.browser.stop();
  this.logger.info('Discovery stopped');
  this.emit( 'stop' );
};
