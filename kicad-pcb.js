var through = require('through2');

module.exports = createKiCadParserStream;


function createKiCadParserStream(debug) {
  var stack = [];
  var current = null;
  var path = [];
  var sawSpace = false;
  var inQuotes = false;

  var params = [];

  function readChar(c) {
    var ret = null;
    if (c === '"') {
      inQuotes = !inQuotes;

      if (!inQuotes) {
        if (!sawSpace) {
          path.push(current.trim());
        } else {
          params.push(current.trim());
        }
        current = '';
      }
    } else if (c === ' ') {
      if (!sawSpace) {
        sawSpace = true;
        path.push(current.trim());
        current = '';
      } else if (inQuotes) {
        current += ' ';
      } else {
        params.push(current.trim());
        current = '';
      }

    } else if (c === '(') {
      sawSpace = false;
      current = '';

    } else if (c === ')') {
      params.push(current.trim());
      ret = [
        path.slice(),
        params.filter(Boolean)
      ];
      current = '';
      params.length = 0;
      path.pop();
      sawSpace = false;
    } else {
      current += c;
    }

    return ret;
  }


  return through.obj(function(chunk, enc, cb) {
    var str = chunk.toString();
    debug && console.log(str);
    var l = str.length;
    for (var i = 0; i<l; i++) {
      var val = readChar(str[i])
      debug && console.log(str[i], val);
      if (val) {
        this.push(val);
      }
    }

    cb();
  });
}
