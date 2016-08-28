airtunes = require('airtunes');
var EventEmitter = require('events').EventEmitter;

module.exports = AirCast;

function AirCast(logger, discovery, proxy, settings) {
  this.logger = logger;
  this.discovery = discovery;
  this.proxy = proxy;
  this.settings = settings;
  this._init();
}

AirCast.prototype._init = function () {
  var self = this;

  this.proxy.on('connect', function(socket) {
    self.logger.info('Piping socket data to Airtunes');
    airtunes.reset();
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

  // monitor buffer events
  airtunes.on('buffer', function(status) {
    self.logger.info('Airtunes buffer status: %s', status);

    // after the playback ends, give AirTunes some time to finish
    if(status === 'end') {
      self.logger.info('Airtunes playback ended, waiting for devices');
      
    }
  });
};

AirCast.prototype._getAirTunesDevice = function (name) {
  var self = this;
  var dev = this.getDeviceByName(name);

  this.logger.info('Adding %s to Airtunes', name);

  var host = dev.addresses.filter(function(v) {
    return v.substring(0, 3) === '192';
  })[0];

  device = airtunes.add(host, {
    port: dev.port,
    volume: dev.volume
  });

  if (!device.name) {
    device.name = name;
  }
  
  if (!device.onStatus) {
    device.onStatus = function(status) {
      self.logger.info('Device %s status %s', name, status);
      dev.connected = status === 'ready' || status === 'playing';
    };
    device.on('status', device.onStatus);
  }

  if (!device.onError) {
    device.onError = function(error) {
      self.logger.warn('Device %s error %s', name, error);
    };
    device.on('error', device.onError);
  }

  return device;
};

AirCast.prototype.getDevices = function () {
  var self = this;
  return Object.keys(this.discovery.devices).map(
    function (key) {
      return self.discovery.devices[key];
    }).filter(function(dev) {
      return self.settings.blacklist.indexOf(dev.name) < 0;
    });
}

AirCast.prototype.getDeviceByName = function (name) {
  if (this.settings.blacklist.indexOf(name) >= 0) {
    return null;
  }
  return this.discovery.devices[name];
}

AirCast.prototype.hasDevice = function (name) {
  return (this.settings.blacklist.indexOf(name) < 0) && !!this.discovery.devices[name];
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