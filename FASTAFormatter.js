var EventEmitter = require('events').EventEmitter;

function FASTAFormatter(sync, linelen) {
  this.linelen = Number(linelen) || 50;
  this.remnant = '';
}

FASTAFormatter.prototype = new EventEmitter();

FASTAFormatter.prototype.header = function(rname) {
  if (!this.sent) {
    return this.emit('data', '>' + rname + '\n');
  }
}

FASTAFormatter.prototype.headerSync = function(rname) {
  return '>' + rname + '\n';
}

FASTAFormatter.prototype.write = function(data) {
  this.sent    = true;
  var linelen  = this.linelen;
  var chunk    = this.remnant + data.replace(/\n/g, '');
  this.remnant = '';

  while (chunk.length >= linelen) {
    this.emit('data', chunk.slice(0, linelen)+ '\n');
    chunk = chunk.slice(linelen);
  }
  this.remnant = chunk;
}


FASTAFormatter.prototype.writeSync = function(data) {
  var ret      = '';
  this.sent    = true;
  var linelen  = this.linelen;
  var chunk    = this.remnant + data.replace(/\n/g, '');
  this.remnant = '';

  while (chunk.length >= linelen) {
    ret += chunk.slice(0, linelen)+ '\n';
    chunk = chunk.slice(linelen);
  }
  this.remnant = chunk;
  return ret;
}


FASTAFormatter.prototype.error = function(e) {
  this.emit('error', e);
}


FASTAFormatter.prototype.end = function() {
  if (this.remnant) {
    this.emit('data', this.remnant + '\n');
  }
  this.emit('end');
}

FASTAFormatter.prototype.endSync = function() {
  return this.remnant;
}


module.exports = FASTAFormatter;
