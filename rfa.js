/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var rfa, fs = require('fs'),
  pathSteps = require('path-steps'),
  glob = require('glob'),
  tokenObj = require('tokenobj'),
  
  async = require('async'),
  ld = require('lodash');


rfa = function readFilesAssoc___proxy(files, opts, deliver) {
  return rfa.readFilesAssoc(files, opts, deliver);
};
rfa.defaultOpts = {
  encoding: 'UTF-8',
  debug: 0,
  glob: null,
  globOpts: {},
  skipDirs: true,
  baseDir: '',
  fnPrefix: '',
  fnSuffix: '',
  readFileFunc: null,
  onFileError: null,
  onRecvAll: null,
};


function isType(x, t) { return ((x === null ? String(x) : typeof x) === t); }

function makeDebugLogger(cfgDbgLv, cfgPrefix) {
  if (!Array.isArray(cfgPrefix)) { cfgPrefix = [cfgPrefix]; }
  return function debugLog(msgMinLv, msg) {
    if (cfgDbgLv < msgMinLv) { return; }
    msg = Array.prototype.slice.call(arguments, 1);
    console.log.apply(console, cfgPrefix.concat(msg));
  };
}


rfa.readFilesAssoc = function readFilesAssoc(files, opts, deliver) {
  var job, readEmAll;
  if (!deliver) {
    if (isType(opts, 'function')) {
      deliver = opts;
      opts = false;
    }
    if ((!opts) && files && files.files) {
      opts = files;
      files = opts.files;
    }
  }
  if (!opts) { opts = {}; }
  job = ld.assign(ld.clone(rfa.defaultOpts), opts);
  if (isType(deliver, 'function')) { job.onRecvAll = deliver; }
  if (isType(files, 'string')) { files = [files]; }
  job.baseDir = pathSteps.normalize(job.baseDir);

  job.dbg = (job.debug > 0 ? makeDebugLogger(job.debug, 'D:') : Array);

  job.readerChain = [
    (job.readFileFunc || rfa.defaultFileReader),
  ];
  if (job.skipDirs) { job.readerChain.push(rfa.silenceErrIsDir); }
  if (job.onFileRead) { job.readerChain.push(job.onFileRead); }

  files = ld.map(files, function addFixes(fn, key) {
    var spec;
    fn = String(fn);
    if (isType(key, 'number')) { key = null; }
    spec = { id: key, origSpec: fn };
    fn = (job.fnPrefix || '') + fn + (job.fnSuffix || '');
    if (!isType(job.glob, 'boolean')) {
      if (glob.hasMagic(fn, job.globOpts)) { job.glob = true; }
    }
    if (job.baseDir) { fn = pathSteps.join(job.baseDir, fn); }
    spec.fileName = fn;
    return spec;
  });

  readEmAll = rfa.readAllFilesInJob.bind(null, job);
  if (job.glob) {
    job.files = [];
    return async.forEach(files, rfa.globOnePattern.bind(null, job), readEmAll);
  }
  job.files = files;
  return readEmAll();
};


rfa.defaultFileReader = function (srcFn, encoding, deliver) {
  switch (encoding) {
  case 'binary':
  case 'buffer':
    encoding = null;
    break;
  }
  return fs.readFile(srcFn, encoding, deliver);
};


rfa.silenceErrIsDir = function (err, data) {
  pathSteps
};


rfa.globOnePattern = function (job, spec, whenGlobbed) {
  whenGlobbed = rfa.addGlobResult.bind(null, job, spec, whenGlobbed);
  glob(spec.fileName, job.globOpts, whenGlobbed);
};


rfa.addGlobResult = function (job, globSpec, whenAdded, err, files) {
  if (err) { return whenAdded(err, job, globSpec); }
  files.forEach(function (fn) {
    var spec = ld.clone(globSpec);
    spec.fileName = fn;
    job.files.push(spec);
  });
  return whenAdded();
};


rfa.readAllFilesInJob = function (job, whenAllRead) {
  if (!whenAllRead) { whenAllRead = job.onRecvAll; }
  var recvAll = function (err) {
    console.log('olo', arguments);
    if (err) { return whenAllRead(err); }
    rfa.makeFilesDict(job, whenAllRead);
  };
  async.each(job.files, rfa.readOneFile.bind(null, job), recvAll);
};


rfa.readOneFile = function (job, fileSpec, deliver) {
  async.waterfall([

    function initArgs(cb) {
      return cb(null, fileSpec.fileName, job.encoding);
    },

  ].concat(
    job.readerChain

  ).concat([
    function recvData(err, data, then) {
      console.log('data', arguments);
      if (err) { return deliver(err); }
      fileSpec.data = data;
      return then(null);
    },

  ]), deliver);
};


rfa.makeFilesDict = function (job, whenHasDict) {
  var filesDict = Object.create(null);
  job.dbg(3, 'dict <- job.files:', job.files);
  job.files.forEach(function (spec) {
    var flist, key = spec.id, fn = String(spec.fileName);
    if (job.baseDir) {
      if (fn.substr(0, job.baseDir.length) === job.baseDir) {
        spec.fileName = fn = pathSteps.relative(job.baseDir, fn);
      }
    }
    if (key === null) { key = fn; }
    flist = filesDict[key];
    if (!Array.isArray(flist)) { flist = filesDict[key] = []; }
    flist.push(spec);
  });
  return whenHasDict(null, filesDict);
};





















module.exports = rfa;
