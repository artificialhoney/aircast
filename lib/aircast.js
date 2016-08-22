airtunes = require('airtunes');

module.exports = AirCast;

function AirCast(logger, discovery, proxy, settings) {
  this.logger = logger;
  this.discovery = discovery;
  this.proxy = proxy;
  this.settings = settings;
  this.airTunesDevices = {};
  this._init();
}

AirCast.prototype._init = function () {
  var self = this;

  this.proxy.on('connect', function(socket) {
    self.logger.info('Piping socket data to Airtunes');
    socket.pipe(airtunes);
  });

  var stopAll = function() {
    airtunes.stopAll(function () {
      self.logger.info('Airtunes stopped');
    });
  };

  this.proxy.on('stop', stopAll);
  this.proxy.on('end', stopAll);

  this.discovery.on('serviceUp', function(info) {
    info.connected = false;
    info.volume = self.settings.level;
  });
};

AirCast.prototype._getAirTunesDevice = function (name) {
  var self = this;
  var dev = this.getDeviceByName(name);

  this.logger.info('Adding %s to Airtunes', name);
  device = this.airTunesDevices[name] = airtunes.add(dev.addresses[dev.addresses.length-1], {
    port: dev.port,
    volume: dev.volume
  });

  device.on('status', function(status) {
    self.logger.info('Device status %s', status);
    dev.connected = status === 'ready';
  });

  device.on('error', function(error) {
    self.logger.warn('Device error %s', error);
  });

  return device;
};


AirCast.prototype.getDevices = function () {
  var self = this;
  return Object.keys(this.discovery.devices).map(function (key) {return self.discovery.devices[key]})
}

AirCast.prototype.getDeviceByName = function (name) {
  return this.discovery.devices[name];
}

AirCast.prototype.hasDevice = function (name) {
  return !!this.discovery.devices[name];
}

AirCast.prototype.setConnect = function (name, connect) {
  this.logger.info('Setting connect for %s to %d', name, connect);
  var dev = this.getDeviceByName(name);
  
  if (connect === true && dev.connected === false) {
    this._getAirTunesDevice(name);
  } else if (connect === false && dev.connected === true) {
    var device = this._getAirTunesDevice(name);
    device.stop();
  }

  dev.connected = connect;
  return dev;
}

AirCast.prototype.setVolume = function (name, volume) {
  this.logger.info('Setting volume for %s to %d', name, volume);
  volume = parseInt(volume);
  var dev = this.getDeviceByName(name);
  dev.volume = volume;

  if (dev.connected) {
    var device = this._getAirTunesDevice(name);
    device.setVolume(volume);
  }
  return dev;
}