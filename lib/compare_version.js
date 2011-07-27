function compare_version(v1, v2) {
  var v1a = v1.split('.');
  var v2a = v2.split('.');
  var c;
  for (var i=0, l=Math.max(v1a.length, v2a.length); i<l; i++) {
    c = (v1a[i] || 0) - (v2a[i] || 0);
    if (!c) continue;
    return (c > 0) ? 1 : -1;
  }
  return 0;
}

function test() {
  var v1 = '0.4.5';
  var v2 = '1.4.5';
  console.log(-1 == compare_version(v1, v2));
  console.log(1  == compare_version(v2, v1));
  console.log(0  == compare_version(v1, v1));
  console.log(0  == compare_version(v2, v2));

  var v1 = '5.2.8';
  var v2 = '5.2.10';
  console.log(-1 == compare_version(v1, v2));
  console.log(1  == compare_version(v2, v1));
  console.log(0  == compare_version(v1, v1));
  console.log(0  == compare_version(v2, v2));

  var v1 = '2.9';
  var v2 = '2.9.5';
  console.log(-1 == compare_version(v1, v2));
  console.log(1  == compare_version(v2, v1));
  console.log(0  == compare_version(v1, v1));
  console.log(0  == compare_version(v2, v2));

  var v1 = '2.11.5';
  var v2 = '2.90';
  console.log(-1 == compare_version(v1, v2));
  console.log(1  == compare_version(v2, v1));
  console.log(0  == compare_version(v1, v1));
  console.log(0  == compare_version(v2, v2));

  var v1 = '1420.0';
  var v2 = '1420.0.0';
  console.log(0  == compare_version(v1, v2));
  console.log(0  == compare_version(v2, v1));
  console.log(0  == compare_version(v1, v1));
  console.log(0  == compare_version(v2, v2));

  var v1 = '7.848';
  var v2 = '7.848.0.0';
  console.log(0  == compare_version(v1, v2));
  console.log(0  == compare_version(v2, v1));
  console.log(0  == compare_version(v1, v1));
  console.log(0  == compare_version(v2, v2));
}

module.exports = compare_version;
if (__filename == process.argv[1]) { test(); }

