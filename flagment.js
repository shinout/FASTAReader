var fs  = require('fs');
var pth = require('path');
var FASTAReader = require('./FASTAReader');
var ArgParser = require('argparser');

function main() {

  function showUsage() {
    process.stderr.write('Usage: '+ process.argv[0] + ' ' + process.argv[1] + ' [-s|--start <start position>] [-l|--length=100]  <fasta file> <seq_id=null> \n');
  }

  var parser = new ArgParser().addValueOptions(['s','start','l','length']).parse();
  var fpath  = parser.getArgs(0);

  if (! pth.existsSync(fpath)) {
    process.stderr.write(fpath +': No such file.\n');
    showUsage();
    process.exit();
  }

  var start = parser.getOptions('s') || parser.getOptions('start');
  if (!start) {
    process.stderr.write('You must specify the start position. ' + fpath + '\n');
    showUsage();
    process.exit();
  }
  var length = parser.getOptions('l') || parser.getOptions('length') || 100;

  var fastas = new FASTAReader(fpath);
  var id     = parser.getArgs(1);
  if (!id) {
    id = Object.keys(fastas.result)[0];
  }

  if (!fastas.result[id]) {
    process.stderr.write(id +' is not in the FASTA file. ' + fpath + '\n');
    process.exit();
  }

  var fasta = fastas.result[id];


  console.log(fasta.fetch(start, length));

}

if (__filename == process.argv[1]) {
  main();
}

