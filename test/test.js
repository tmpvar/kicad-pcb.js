var fs = require('fs');
var path = require('path');
var test = require('tape');
var through = require('through');

var createParseStream = require('../parser');

test('basic parse', function(t) {
  var st = through();
  t.plan(1);
  st.pipe(createParseStream())
    .on('data', function(obj) {
      t.deepEqual(obj, ['cmd1', ['arg1', 'arg2' ]]);
    })
    .on('end', t.end);

  st.end('(cmd1 arg1 arg2)');
});

test('nested parse', function(t) {
  var st = through();

  st.pipe(createParseStream())
    .on('data', function(obj) {
      t.deepEqual(
        obj, [
          'top', [
            ['next', [
              ['bottom', ['abc']]
            ]
          ]
        ]
      ]);
    })
    .on('end', t.end.bind(t));

  st.end('(top (next (bottom abc)))');
});

test('quoted parse', function(t) {
  var st = through();

  st.pipe(createParseStream())
    .on('data', function(obj) {
      t.deepEqual(
        obj,
        ['quoted', ['a b', 'c d']]
      );
    })
    .on('end', t.end.bind(t));

  st.end('(quoted "a b" "c d")');
});

test('quoted parse (nested paran', function(t) {
  var st = through();

  st.pipe(createParseStream())
    .on('data', function(obj) {
      t.deepEqual(
        obj,
        ['quoted', ['a ( b', 'c ) d']]
      );
    })
    .on('end', t.end.bind(t));

  st.end('(quoted "a ( b" "c ) d")');
});


test('nested with same path', function(t) {
  var st = through();

  var expect = [
    [['board', 'child'], ['a', 'b']],
    [['board', 'child'], ['c', 'd']],
    [['board'], ['test']],
  ];


  st.pipe(createParseStream())
    .on('data', function(obj) {
      t.deepEqual(
        obj, [
          'board', [
            'test',
            ['child', ['a', 'b']],
            ['child', ['c', 'd']]
          ]
        ]
      );
    })
    .on('end', t.end.bind(t));

  st.end('(board test (child a b) (child c d))');
});


test('emit events', function(t) {
  var st = through();
  var lines = 0;
  var boards = 0;

  st.pipe(createParseStream())
    .on('end', function() {
      t.equal(lines, 2, 'should have 2 lines');
      t.equal(boards, 1, 'should have 1 board');
      t.end();
    })
    .on('line', function(line) {
      t.equal(line.length, 4);
      lines++;
    })
    .on('board', function(board) {
      t.equal(board.length, 2);
      boards++;
    });

    st.end(
      '(board (line 10 10 100 100) (line 1 1 2 2))'
    );
});
