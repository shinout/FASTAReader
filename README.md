FASTAReader
============
read FASTA format (Node.js)

### Usage ###
    var FASTAReader = require('/path/to/FASTAReader.js');
    var f = new FASTAReader('/path/to/fasta.fasta');

    // fetch flagments
    var seq_id_of_the_fasta_file        = 'chr11';
    var base_start_offset_I_want_to_get = 1240;
    var length_of_the_flagment          = 420;
    f.fetch(seq_id_of_the_fasta_file, seq_id_of_the_fasta_file, length_of_the_flagment);

