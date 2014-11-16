var through = require('through');

module.exports = createKiCadParserStream;

function createKiCadParserStream(debug) {

  var cmd;
  var loc;
  var stack = [];
  var sawSpace = false;
  var inQuotes = false;
  var current = '';

  function addCurrentToken() {
    var trimmed = current.trim();

    if (!sawSpace){
      sawSpace = true;
      loc[0] = current.trim();
    } else if (trimmed) {
      loc[1].push(trimmed);
    }
    current = '';
  }

  function handleChunk(chunk) {
    var str = chunk.toString();
    var l = str.length;

    for (var i = 0; i<l; i++) {
      var c = str[i];

      if (c === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (c === '(' && !inQuotes) {
        sawSpace = false;

        if (!cmd) {
          cmd = ['', []];
          loc = cmd;
        } else {
          var newloc = ['', []];
          loc[1].push(newloc);
          loc = newloc;
        }

        stack.push(loc);
      } else if (c === ')' && !inQuotes) {
        addCurrentToken();
        var last = stack.pop();

        if (this.listeners(last[0]).length) {
          this.emit('op_' + last[0], last[1]);
        } else {
          this.emit('*', last);
        }

        loc = stack[stack.length-1];

        if (!stack.length) {
          this.push(cmd);
        }
      } else if (c === ' ' && !inQuotes) {
        addCurrentToken();
      } else {
        current += c;
      }
    }
  }

  return through(handleChunk);
}
