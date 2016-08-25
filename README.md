# aircast

Server (proxy) app for streaming to multiple AirPlay devices.

## Installation

1. `git clone git@github.com:100hz/aircast.git`
2. `cd aircast && npm install`


## Usage

`bin/aircast`

Please see `bin\aircast --help`:

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

## Contributors

- [Sebastian Krüger](http://theblackestbox.net)

### Want to contribute?

Welcome! Glad, to hear. It's easy. Just follow theses steps:

1. Fork the project & branch
2. Code and document your stuff
3. Create a Pull Request with description

## License

(MIT License)

Copyright (c) 2016 Sebastian Krüger [sk@theblackestbox.net]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.