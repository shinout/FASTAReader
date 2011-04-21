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





function ffetch(fpath, unit, start, length) {
  var fd        = fs.openSync(fpath, 'r');
  var startIdx  = pos2index(start, unit.id.length + 2, unit.linelen);
  var endIdx    = Math.min(unit.length, pos2index(length + start, unit.id.length + 2, unit.linelen));
  var read      = fs.readSync(fd, endIdx - startIdx, startIdx + unit.start);
  fs.closeSync(fd);
  return read[0].split('\n').join('');
}




function pos2index(pos, prelen, linelen) {
  return prelen + pos -1 + Math.floor( (pos -1)/linelen );
}







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

module.exports = FASTAReader;
