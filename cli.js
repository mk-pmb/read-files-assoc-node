#!/usr/bin/env nodejs
/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
'use strict';

var rfa = require('./'), args = process.argv.slice(2), opts = {
  debug: +(process.env.DEBUGLEVEL || 0),
};

function reportResults(err, fileDict) {
  if (err) {
    console.error(err);
    process.exit(2);
  }
  // let's make something JSON-y once rfa works.
  console.log('files dict:', fileDict);
}

console.log('opts:', opts, 'cli args:', args);
rfa(args, opts, reportResults);
