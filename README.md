# aircast [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Server (proxy) app for streaming to multiple AirPlay devices.

## Installation

```bash
npm install aircast --global
```


## Usage

```
  Usage: aircast [options]

  Options:

    -h, --help                         output usage information
    -V, --version                      output the version number
    -w, --web-port [port]              Set [port] for REST/WS service. Defaults to "9000"
    -s, --stream-port [port]           Set [port] for reading streaming data from. Defaults to "9001"
    -l, --level [level]                Set default [level] for sound. Defaults to "50"
    -m, --mount-path [path]            Set [path] to mount files for an UI
    -b, --blacklist [name1,name2,...]  Disallow devices by [names...]
    -v, --verbose                      Increase verbosity
```

## Example

Mopidy configuration:

```
[audio]
output = audioconvert ! audio/x-raw,format=S16LE,channels=2,layout=interleaved ! tcpclientsink host=localhost port=9001
```

## Contributors

- [Sebastian Krüger](http://theblackestbox.net)

## License

MIT © [Sebastian Krüger](http://theblackestbox.net)


[npm-image]: https://badge.fury.io/js/aircast.svg
[npm-url]: https://npmjs.org/package/aircast
[daviddm-image]: https://david-dm.org/100hz/aircast.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/100hz/aircast
