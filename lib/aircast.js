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
    socket.pipe(airtunes, {end: false});
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

  var device = this.airTunesDevices[name];
  if (device) {
    return device;
  }

  device = this.airTunesDevices[name] = airtunes.add(dev.host, {
    port: dev.port,
    volume: dev.volume
  });

  device.on('ready', function() {
    dev.connected = true;
  });

  device.on('stopped', function() {
    dev.connected = false;
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
  connect = connect === true;
  var dev = this.getDeviceByName(name);

  var device = this.airTunesDevices[name];
  if (!device && connect === false) {
    return dev;
  } else {
    device = this._getAirTunesDevice(name);
    if (connect === true && device.status === 'stopped') {
      device.start();
    } else if (connect === false && device.status !== 'stopped') {
      device.stop();
    }
    return dev;
  }
}

AirCast.prototype.setVolume = function (name, volume) {
  volume = parseInt(volume);
  var dev = this.getDeviceByName(name);
  dev.volume = volume;

  var device = this.airTunesDevices[name];
  if (!device) {
    return dev;
  } else {
    device = this._getAirTunesDevice();
    device.setVolume(volume);
    return dev;
  }
}