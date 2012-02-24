var fs  = require('fs');
var pth = require('path');
var AP  = require('argparser');
var dna = require('dna');


function usage() {
  var cmd = 'fastareader';

  console.error('[synopsis]');
  console.error('\t[to get information json file]');
  console.error('\t' + cmd + ' <fasta file>\n');

  console.error('\t[to get sequences]');
  console.error('\t' + cmd + ' <fasta file> <rname> <pos> <length>\n');

  console.error('[options]');
  console.error('\t--json|-j <json file>\t# import json summary file of the fasta file.\n');
  console.error('\t--compl|-c\t# shows complementary strand of the result (5\' -> 3\').\n');

  console.error('\t<rname>\tsequence id of the fasta file to get.\n');
  console.error('\t<pos>\tstart position of the fasta file to get.');
  console.error('\t<length>\tlength of the fasta file to get.');

  console.error('[notice]');
  console.error('\t1-based coordinate system');
}



function main(args) {
  var node = args.shift(), fname = args.shift();

  var p = new AP().addOptions(['c', 'compl']).addValueOptions(
    ['json', 'j']
  ).parse(args);


  var fpath = p.getArgs(0);
  if (! pth.existsSync(fpath)) {
    if (fpath) {
      process.stderr.write(fpath +': No such file.\n');
    }
    usage();
    process.exit();
  }

  var json = p.getOptions('json', 'j');

  if (json && ! pth.existsSync(json)) {
    console.error(json, ': No such file.');
    usage();
    process.exit();
  }

  if (json) {
    json = JSON.parse(fs.readFileSync(json, "utf8"));
  }

  var fastas = new FASTAReader(fpath, json);

  var seq_id = p.getArgs(1);
  var start  = p.getArgs(2);
  var length = p.getArgs(3);
  var rev    = p.getOptions('compl', 'c');

  if (seq_id && start && length) {
    console.log(fastas.fetch(seq_id, start, length, rev));
  }

  // get JSON
  else if (!seq_id && !start && !length) {
    Object.keys(fastas.result).forEach(function(chr) {
      delete fastas.result[chr].fpath;
    });
    console.log(JSON.stringify({result:fastas.result, Ns:fastas.Ns}));
  }

  // invalid args
  else {
    usage();
    process.exit();
  }
}


function FASTAReader(fpath, json) {
  this.fpath  = fpath;
  this.fd     = fs.openSync(fpath, 'r');

  if (!json) {
    try {
      json = require(fpath + '.json');
    }
    catch (e) {}
  }

  if (json) {
    this.result = (function() {
      var ret = {};
      Object.keys(json.result).forEach(function(k) {
        ret[k] = new FASTA(json.result[k], fpath);
      });
      return ret;
    })();

    this.Ns     = json.Ns;
  }
  else {
    var parsed  = fparse(fpath);
    this.result = parsed[0];
    this.Ns     = parsed[1];
  }
}


FASTAReader.create = function(fpath, json) {
  return new FASTAReader(fpath, json);
};

FASTAReader.prototype.getResult = function(id) {
  var unit = this.result[id];
  if (unit) return unit;
  throw new Error('['+ id +']: No such rname.');
};

FASTAReader.prototype.close = function() {
  fs.closeSync(this.fd);
}

FASTAReader.prototype.fetch = function(id, start, length, inverse) {
  var unit = this.getResult(id);
  return unit.fetch(start, length, this.fd, inverse);
}

FASTAReader.prototype.fetchByFormat = function(format) {
  if (typeof format == 'object') format = dna.getFormat(format);
  var info = dna.parseFormat(format, true);
  var poslen = dna.getPosLen(info.start, info.end);
  return this.fetch(info.chr, poslen[0], poslen[1], info.strand == "-");
}

FASTAReader.prototype.getStartIndex = function(id) {
  var unit = this.getResult(id);
  return unit.getStartIndex();
}

FASTAReader.prototype.getEndIndex = function(id) {
  var unit = this.getResult(id);
  return unit.getEndIndex();
}

FASTAReader.prototype.getEndPos = function(id) {
  var unit = this.getResult(id);
  return unit.getEndPos();
}

FASTAReader.prototype.getIndex = function(id, pos) {
  var unit = this.getResult(id);
  return unit.getIndex(pos);
}

FASTAReader.prototype.hasN = function(id, start, length) {
  var unit      = this.result[id];
  var startIdx  = fgetIndex(unit, start);
  var endIdx    = Math.min(fgetIndex(unit, Number(start) + Number(length)), fendIndex(unit));

  var ns = this.Ns[id];
  if (!ns) return false;
  const len = ns.length;
  if (len == 0) { return false;}
  var end = start + length;

  var i = 0;
  while (i == 0 || ns[i-1]) {
    var ns_end   = (i == len) ? unit.start + unit.length : ns[i].start;
    var ns_start = (i >= 1) ? ns[i-1].end: unit.start;

    if (ns_end <= startIdx) {
      i++;
      continue;
    }

    return !( ns_start < startIdx && endIdx < ns_end);
  }
  return false;
}


function FASTA(unit, fpath) {
  this.id      = unit.id;
  this.desc    = unit.desc;
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

FASTA.prototype.fetch = function(start, length, fd, inverse) {
  return ffetch(this.fpath, this, start, length, fd, inverse);
}

FASTA.prototype.getEndPos = function(){
  return fendPos(this);
}



/* FASTA function implementation (be static) */

function fgetIndex(unit, pos) {
  return pos2index(pos, idlen(unit), unit.linelen) + Number(unit.start);
}

function idlen(unit) {
  var desclen = (unit.desc == null) ? 0 : 1 + unit.desc.length;
  return unit.id.length + 2 + desclen;
}

function id_desc_len(unit) {
  return unit.id.length + 2;
}

function fstartIndex(unit) {
  return idlen(unit) + Number(unit.start);
}

function fendIndex(unit) {
  return unit.length + Number(unit.start);
}

function fendPos(unit) {
  return idx2pos(unit.length-2, idlen(unit), unit.linelen);
}



function ffetch(fpath, unit, start, length, fd, inverse) {
  var startIdx  = fgetIndex(unit, start);
  var endIdx    = Math.min(fgetIndex(unit, Number(start) + Number(length)), fendIndex(unit));

  if (endIdx - startIdx <= 0) {
    return '';
  }
  try {
    var read = fs.readSync(fd, endIdx - startIdx, startIdx);
  }
  catch(e) {
    return '';
  }
  var ret = read[0].split('\n').join('');
  return (inverse) ? dna.complStrand(ret, true) : ret;
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
  return Number(prelen) + Number(pos) -1 + Math.floor( (pos -1)/linelen );
}


/**
 * FASTAReader.idx2pos
 * convert charcter index to DNA base position
 * @param number  idx     : character index (leftside)
 * @param number  prelen  : header data length
 * @param number  linelen : one line length
 * @return number : DNA base position
 */
function idx2pos(idx, prelen, linelen) {
  prelen  = prelen || 0;
  linelen = linelen || 50;
  idx = Number(idx);
  return Math.max(0, idx - prelen - Math.floor((idx - prelen)/(linelen + 1))) + 1;
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
    console.error(config_file + ': No such file.');
    return [false, false];
  }

  var fd        = fs.openSync(fpath, 'r');
  var read      = '';
  var pos       = 0;
  var start     = 0;
  var Ns        = {};
  var currentNs = null;
  var currentN  = null;
  var remnant   = '';
  var result    = {};
  var buffsize  = 65535;
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

    lines.forEach(function(line, i) {

      if (line.match('N')) {
        if (!currentN) {
          currentN = {
            line: i,
            start: start + length,
            end : start + length+ line.length
          };
        }
        else {
          currentN.line++;
          currentN.end += line.length;
        }
      }
      else if (currentN) {
        currentNs.push(currentN);
        currentN = null;
      }

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
        var id_desc = line.slice(1).split(' ');
        var id = id_desc.shift();
        var desc = (id_desc.length) ? id_desc.join(' ') : null;
        summary = {id: id, desc: desc, start: start, linelen: 0};
        // make a new Ns
        Ns[summary.id] = [];
        currentNs = Ns[summary.id];
      }
      else {
        if (!summary) {
          console.error(fpath +' does not seem to be FASTA format.');
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

  fs.closeSync(fd);
  return [result, Ns];
}


FASTAReader.parse = fparse;
FASTAReader.fetch = ffetch;
FASTAReader.pos2index = pos2index;
FASTAReader.idx2pos= idx2pos;
FASTAReader.fstartIndex= fstartIndex;
FASTAReader.fendIndex= fendIndex;
FASTAReader.fgetIndex= fgetIndex;
FASTAReader.fendPos = fendPos;
FASTAReader.FASTA = FASTA;
FASTAReader.idlen = idlen;
FASTAReader.main = main;

module.exports = FASTAReader;


if (__filename == process.argv[1]) { main(process.argv); }
