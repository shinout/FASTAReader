FASTAReader
============
read FASTA format (Node.js)

using 1-based coordinate system 

> [1-based coordinate system]

> A coordinate system where the first base of a sequence is one.
> In this coordinate system, a region is specified by a closed interval.
> For example, the region between 3rd and 7th bases inclusive is [3, 7].
> The SAM, GFF and Wiggle formats are using the 1-based coordinate system.

> (from http://samtools.sourceforge.net/SAM1.pdf)

### Usage ###
    var FASTAReader = require('/path/to/FASTAReader.js');
    var freader = new FASTAReader('/path/to/fasta.fasta');

    // fetch flagments
    var rname = 'chr11';
    var start = 1240;
    var length = 420;
    var seq = freader.fetch(rname, start, length);

