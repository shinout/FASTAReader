var FR= require('../FASTAReader');
if (typeof global != 'undefined') require('./test.load').load(global);

var fpath = __dirname + '/sample.fasta';
var result = FR.parse(fpath)[0];

var fs  = require('fs');
var fd = fs.openSync(fpath, 'r');

/* inverse function test */
var idx, pos, idx2, linelen = 50, idlen = 8;

for (var i=1; i<300; i++) {
  pos = i;
  idx = FR.pos2index(pos, idlen, linelen);
  pos2 = FR.idx2pos(idx, idlen, linelen);
  idx2 = FR.pos2index(pos2, idlen, linelen);
  T.equal(idx, idx2);
  T.equal(pos, pos2);
  console.yellow(pos,pos2,idx,idx2);
}

/* detect id test */
T.equal(Object.keys(result).length, 11, 'ids are not detected correctly.');

/* start position test */

//process.exit();
Object.keys(result).forEach(function(id){
  var read = fs.readSync(fd, 1 + id.length, result[id].start);
  T.equal(read[0], '>' + id, 'start position at ' + id);
});

/* instanceof fasta or not */
var FASTA = FR.FASTA;
Object.keys(result).forEach(function(id){
  T.ok(result[id] instanceof FASTA, 'object type: ' + id);
});

/* line length test */
Object.keys(result).forEach(function(id){
  var read = fs.readSync(fd, 1 + result[id].linelen, result[id].start + result[id].idlen());
  T.ok(read[0].match(/^[^\n]*\n$/), 'line length at ' + id);
});

/* get character test */
T.equal(FR.fetch(fpath, result.sample1, 1, 4, fd), 'acta', 'fetch result');
T.equal(FR.fetch(fpath, result.sample1, 51, 4, fd), 'acta', 'fetch result');
T.equal(FR.fetch(fpath, result.sample1, 51, 4, fd, true), 'tagt', 'fetch result (inversed)');
T.equal(FR.fetch(fpath, result.sample1, 50, 4, fd), 'aact', 'fetch result');
T.equal(FR.fetch(fpath, result.sample1, 49, 6, fd), 'taacta', 'fetch result');
T.equal(FR.fetch(fpath, result.sample1, 49, 6, fd, true), 'tagtta', 'fetch result (inversed)');
T.equal(FR.fetch(fpath, result.sample1, 1, 600, fd).length, 400, 'fetch result');
T.equal(FR.fetch(fpath, result.sample4, 1, 8, fd), 'aaaaaaaa', 'fetch result');
T.equal(FR.fetch(fpath, result.sample4, 1, 333, fd), 'aaaaaaaa', 'fetch result');
T.equal(FR.fetch(fpath, result.sample4, 8, 1, fd), 'a', 'fetch result');
T.equal(FR.fetch(fpath, result.sample4, 9, 1, fd), '', 'fetch result');
fs.closeSync(fd);

/* get start index, end index, end pos*/
var st = FR.fstartIndex(result.sample1);
var en = FR.fendIndex(result.sample1); 

var len = "   >sample1 description hoge fuga".length + 1;
T.equal(st, len, 'start index');
T.equal(en, len + 51*8, 'end index');
T.equal(FR.fgetIndex(result.sample1, 1), st , 'start index');
T.equal(FR.fgetIndex(result.sample1, 1), st , 'end index');
T.equal(FR.fendPos(result.sample1), 400 , 'end pos');
T.equal(FR.fendPos(result.sample2), 250 + 19 , 'end pos');
//console.purple("endpos", FR.fendPos(result.sample2), "actual", 250 + 19);
T.equal(FR.fendPos(result.sample3), 19, 'end pos');
T.equal(FR.fendPos(result.sample4), 8 , 'end pos');

/* object test */

var fastas = new FR(fpath);
T.equal(fastas.fetch('sample1', 49, 6), 'taacta', 'fetch result');
T.equal(fastas.fetch('sample4', 8, 1), 'a', 'fetch result');
T.equal(fastas.getStartIndex('sample1'), len, 'getStartIndex result');
T.equal(fastas.getEndIndex('sample1'), len + 51*8, 'getEndIndex result');
T.equal(fastas.getEndPos('sample1'), 400, 'getEndPos result');
T.equal(fastas.getEndPos('sample2'), 50*5 + 19, 'getEndPos result');
T.equal(fastas.getIndex('sample1', 53), len + 53 + 1 -1, 'getIndex result');

/* hasN */
T.equal(fastas.hasN("sample_last", 40, 1), false);
T.equal(fastas.hasN("sample_last", 40, 9), false);
T.equal(fastas.hasN("sample_last", 40, 10), false);

T.equal(fastas.hasN("sample_last", 40, 11), true);
T.equal(fastas.hasN("sample_last", 55, 1), true);
T.equal(fastas.hasN("sample_last", 40, 15), true);

