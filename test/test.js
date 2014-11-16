var fs = require('fs');
var path = require('path');
var test = require('tape');
var through = require('through2');

var createParseStream = require('../kicad-pcb');

test('basic parse', function(t) {
  var st = through();
  st.pipe(createParseStream())
    .on('data', function(obj) {
      t.deepEqual(obj, [ [ 'cmd1' ], ['arg1', 'arg2' ]])
    })
    .on('end', t.end.bind(t));

  st.end('(cmd1 arg1 arg2)');
});

test('nested parse', function(t) {
  var st = through();
  var expect = [
    [['top', 'next', 'bottom'], ['abc']],
    [['top', 'next'], []],
    [['top'], []],
  ];

  st.pipe(createParseStream())
    .on('data', function(obj) {
      t.deepEqual(obj, expect.shift());
    })
    .on('end', t.end.bind(t));

  st.end('(top (next (bottom abc)))');
});

test('nested parse', function(t) {
  var st = through();

  st.pipe(createParseStream())
    .on('data', function(obj) {
      t.deepEqual(
        obj,
        [['quoted'], ['a b', 'c d']]
      );
    })
    .on('end', t.end.bind(t));

  st.end('(quoted "a b" "c d")');
});

// test('parser', function(t) {
//   var s = through();
//   fs.createReadStream(path.join(__dirname, 'BLDC_4.kicad_pcb'))
//     .pipe(createParseStream())
//     .on('data', function(obj) {
//       console.log(obj);
//     })
//     .on('end', t.end.bind(t));
// });
