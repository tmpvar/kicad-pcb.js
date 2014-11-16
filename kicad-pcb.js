var through = require('through2');
var createParser = require('./parser');

module.exports = createKiCadParserStream;


function createKiCadParserStream(debug) {

  var parser = createParser(debug);


  return parser;

}
