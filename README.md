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

## preparation ##
### Create FASTA Information JSON file ###

FASTAReader first scans through the given FASTA file.

It costs nearly one minites.

To skip this process, FASTAReader generates JSON of the scanned information.

You can save the JSON like

    $ fastareader foobar.fasta > foobar.fasta.json

After generating JSON, the file is automatically read if the prefix equals to the original FASTA file and
suffix equals .json. 


## command-line ##

    $ fastareader <fasta file> <rname> <pos> <length> 

### args ###

<table>
<tr><th>name</th>
<td>description</td>
<td>example</td></tr>

<tr><th>fasta file</th>
<td>a fasta file to get sequences</td>
<td>hg19.fa</td></tr>

<tr><th>rname</th>
<td>a reference name to fetch. Must be in the fasta file.</td>
<td>chr12</td></tr>

<tr><th>pos</th>
<td>start position of the sequence to fetch (1-based coordinate).</td>
<td>51417222</td></tr>

<tr><th>length</th>
<td>length of the sequence to fetch.</td>
<td>300</td></tr>
</table>

### options ###

<table>
<tr><th>name</th>
<td>description</td>
<td>example</td></tr>

<tr><th>--compl, -c</th>
<td>Gets complmentary strand of the sequence</td>
<td>-c</td></tr>

<tr><th>--json, -j</th>
<td>a FASTA Information JSON file. When the name is [fasta file].json, the file is automatically read.</td>
<td>hg19.fa.json</td></tr>
</table>


## JavaScript API Documentation ##

    var freader = require('fastareader').create('/path/to/fasta.fasta');

    // fetch a sequence
    var rname  = 'chr11';
    var start  = 1240;
    var length = 420;
    var rev    = true;
    var seq = freader.fetch(rname, start, length, rev);

NOTICE
------

FASTAReader uses 1-based coordinate system.

> [1-based coordinate system]

> A coordinate system where the first base of a sequence is one.
> In this coordinate system, a region is specified by a closed interval.
> For example, the region between 3rd and 7th bases inclusive is [3, 7].
> The SAM, GFF and Wiggle formats are using the 1-based coordinate system.

> (from http://samtools.sourceforge.net/SAM1.pdf)
