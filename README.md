FASTAReader
============

description
-----------
reading FASTA format (Node.js)

what can we do with FASTAReader?
-------------------------------
+ fetching sequences of the exact position
+ getting information of N regions
+ getting information of reference lengths


installation
------------
    $ npm install fastareader

If you haven't installed [Node.js](http://nodejs.org/) yet,

first install [nvm](https://github.com/creationix/nvm) and follow the instruction on that page.



Usage
------
### FASTA Information JSON file ###
FASTAReader first scans through the given FASTA file.

It costs nearly one minites.

To skip this process, FASTAReader generates JSON of the scanned information.

You can save the JSON like

    $ fastareader foobar.fasta > foobar.fasta.json

After generating JSON, the file is automatically read if the prefix equals to the original FASTA file and
suffix equals .json. 


### javascript ###

    var FASTAReader = require('/path/to/FASTAReader.js');
    var freader = new FASTAReader('/path/to/fasta.fasta');

    // fetch flagments
    var rname = 'chr11';
    var start = 1240;
    var length = 420;
    var seq = freader.fetch(rname, start, length);

### command-line ###

    $ fastareader <fasta file> <rname> <pos> <length> 

NOTICE
------

FASTAReader uses 1-based coordinate system.

> [1-based coordinate system]

> A coordinate system where the first base of a sequence is one.
> In this coordinate system, a region is specified by a closed interval.
> For example, the region between 3rd and 7th bases inclusive is [3, 7].
> The SAM, GFF and Wiggle formats are using the 1-based coordinate system.

> (from http://samtools.sourceforge.net/SAM1.pdf)
