#!/usr/bin/env node

//
// This executable sets up the environment and runs aircast.
//

'use strict'

process.title = 'aircast'

// Find the aircast lib
var path = require('path')
var fs = require('fs')
var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib')

// Run aircast
require(lib + '/cli')()
