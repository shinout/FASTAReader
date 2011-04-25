var fs  = require('fs');
var pth = require('path');




function FASTAReader(fpath) {
  this.fpath = fpath;
  this.result = fparse(fpath);
}




FASTAReader.prototype.fetch = function(id, start, length) {
  if (!this.result[id]) {
    return false;
  }
  var unit = this.result[id];
  return ffetch(this.fpath, unit, start, length);
}

FASTAReader.prototype.getStartIndex = function(id) {
  return fstartIndex(this.result[id]);
}

FASTAReader.prototype.getEndIndex = function(id) {
  return fendIndex(this.result[id]);
}

FASTAReader.prototype.getIndex = function(id, pos) {
  var unit = this.result[id];
  return fgetIndex(unit, pos);
}

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
          summary.length = length - emptyline;
          result[summary.id] = summary;
        }
        start += length;
        emptyline = 0;
        length    = 0;
        // make a new summary
        summary = {id: line.slice(1), start: start, linelen: 0};
      }
      else {
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
  summary.length += remnant.length;
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

module.exports = FASTAReader;
