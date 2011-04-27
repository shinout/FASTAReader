#!/bin/sh
node=node
thisdir=$(dirname $0)
if [ -z $1 ]; then
  echo "usage: $0 <fasta file>"
  exit;
fi
$node ${thisdir}/FASTAReader.js $1
