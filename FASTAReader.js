var fs  = require('fs');
var pth = require('path');


function main() {
  var fpath = process.argv[2];
  if (! pth.existsSync(fpath)) {
    process.stderr.write(fpath +': No such file.\n');
    process.exit();
  }
  var fastas = new FASTAReader(fpath);
  process.stdout.write(JSON.stringify(fastas));
}


function FASTAReader(fpath) {
  this.fpath = fpath;
  this.result = fparse(fpath);
}




FASTAReader.prototype.fetch = function(id, start, length) {
  var unit = this.result[id];
  return unit.fetch(start, length);
}

FASTAReader.prototype.getStartIndex = function(id) {
  var unit = this.result[id];
  return unit.getStartIndex();
}

FASTAReader.prototype.getEndIndex = function(id) {
  var unit = this.result[id];
  return unit.getEndIndex();
}

FASTAReader.prototype.getEndPos = function(id) {
  var unit = this.result[id];
  return unit.getEndPos();
}

FASTAReader.prototype.getIndex = function(id, pos) {
  var unit = this.result[id];
  return unit.getIndex(pos);
}


function FASTA(unit, fpath) {
  this.id      = unit.id;
  this.start   = unit.start;
  this.length  = unit.length;
  this.linelen = unit.linelen;
  this.fpath   = fpath;
}

FASTA.prototype.getIndex = function(pos) {
  return fgetIndex(this, pos);
}

FASTA.prototype.getStartIndex = function() {
  return fstartIndex(this);
}

FASTA.prototype.idlen = function() {
  return idlen(this);
}

FASTA.prototype.getEndIndex = function() {
  return fendIndex(this);
}

FASTA.prototype.fetch = function(start, length) {
  return ffetch(this.fpath, this, start, length);
}

FASTA.prototype.getEndPos = function(){
  return fendPos(this);
}



/* FASTA function implementation (be static) */

function fgetIndex(unit, pos) {
  return pos2index(pos, idlen(unit), unit.linelen) + unit.start;
}

function idlen(unit) {
  return unit.id.length + 2;
}

function fstartIndex(unit) {
  return idlen(unit) + unit.start;
}

function fendIndex(unit) {
  return unit.length + unit.start;
}

function fendPos(unit) {
  return idx2pos(unit.length-1, idlen(unit), unit.linelen);
}



function ffetch(fpath, unit, start, length) {
  var fd        = fs.openSync(fpath, 'r');
  var startIdx  = fgetIndex(unit, start);
  var endIdx    = Math.min(fgetIndex(unit, start + length), fendIndex(unit));
  if (endIdx - startIdx <= 0) {
    return '';
  }
  try {
    var read      = fs.readSync(fd, endIdx - startIdx, startIdx);
  }
  catch(e) {
    return '';
  }
  fs.closeSync(fd);
  return read[0].split('\n').join('');
}



/* static functions */

/**
 * FASTAReader.pos2index
 * convert DNA base position to character index
 * @param number  pos     : DNA base position
 * @param number  prelen  : header data length
 * @param number  linelen : one line length
 * @return number : character index
 */
function pos2index(pos, prelen, linelen) {
  return prelen + pos -1 + Math.floor( (pos -1)/linelen );
}


/**
 * FASTAReader.idx2pos
 * convert charcter index to DNA base position
 * @param number  idx     : character index
 * @param number  prelen  : header data length
 * @param number  linelen : one line length
 * @return number : DNA base position
 */
function idx2pos(idx, prelen, linelen) {
  prelen = prelen || 0;
  linelen = linelen || 50;
  return Math.max(0, idx +1 - prelen - Math.floor((idx +1 - prelen)/(linelen + 1)));
}



/**
 * result format
 * id      : sequence id
 * start   : start index
 * linelen : length of one line
 * length  : total index length (including id length)
 *
 */

function fparse(fpath) {
  if (pth.existsSync(!fpath)) {
    process.stderr.write(config_file + ': No such file.\n');
    return false;
  }

  var fd        = fs.openSync(fpath, 'r');
  var read      = '';
  var pos       = 0;
  var start     = 0;
  var remnant   = '';
  var result    = {};
  var buffsize  = 1000;
  var summary   = null;
  var length    = 0;
  var emptyline = 0;

  function setAtEnd(_summary, _length, _emptyline) {
    // result, and fpath is in outer scope.
    _summary.length = _length - _emptyline;
    result[_summary.id] = new FASTA(_summary, fpath);
  }

  do {
    read = fs.readSync(fd, buffsize, pos);

    var lines = (remnant + read[0]).split('\n');
    remnant = lines.pop();

    lines.forEach(function(line) {
      if (line == '') {
        emptyline++;
      }
      else if (line.charAt(0) == '>') {
        // register a previous summary
        if (summary) {
          setAtEnd(summary, length, emptyline);
        }
        start += length;
        emptyline = 0;
        length    = 0;
        // make a new summary
        summary = {id: line.slice(1), start: start, linelen: 0};
      }
      else {
        if (!summary) {
          process.stderr.write(fpath +' does not seem to be FASTA format.\n');
          process.exit();
        }
        if (!summary.linelen) {
          summary.linelen = line.length;
        }
      }
      length += line.length + 1;
    });
    pos = pos + read[1];
  }
  while (read[1] > 0);

  // end
  length += remnant.replace('\n', '').length;
  setAtEnd(summary, length, emptyline);
  result[summary.id] = summary;

  fs.closeSync(fd);
  return result;
}


FASTAReader.parse = fparse;
FASTAReader.fetch = ffetch;
FASTAReader.pos2index = pos2index;
FASTAReader.idx2pos= idx2pos;
FASTAReader.fstartIndex= fstartIndex;
FASTAReader.fendIndex= fendIndex;
FASTAReader.fgetIndex= fgetIndex;
FASTAReader.fendPos = fendPos;

module.exports = FASTAReader;

if (__filename == process.argv[1]) {
  main();
}


