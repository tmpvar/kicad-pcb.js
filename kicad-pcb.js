var through = require('through');
var createParser = require('./parser');

module.exports = createKiCadParserStream;

function r3(args) {
  args[0] = parseFloat(args[0]);
  args[1] = parseFloat(args[1]);
  args[2] = parseFloat(args[2]);
}

function r2(args) {
  args[0] = parseFloat(args[0]);
  args[1] = parseFloat(args[1]);
  return args;
}

function r1(args) {
  return parseFloat(args[0])
}

function i1(args) {
  return parseInt(args[0], 10);
}

function hex(args) {
  return parseInt(args[0], 16);
}

function bool(args) {
  return !!args[0];
}


var ops = {

  width: r1,
  net: r1,
  min_thickness: r1,
  clearance: r1,
  thermal_bridge_width: r1,
  thermal_gap: r1,
  thermal_width: r1,
  thickness: r1,
  angle: r1,
  user_trace_width: r1,

  last_trace_width: r1,
  trace_clearance: r1,
  zone_clearance: r1,
  trace_min: r1,
  segment_width: r1,
  edge_width: r1,
  via_size: r1,
  via_drill: r1,
  via_min_size: r1,
  via_min_drill: r1,
  uvia_size: r1,
  uvia_drill: r1,
  uvias_allowed: r1,
  uvia_min_size: r1,
  uvia_min_drill: r1,
  pcb_text_width: r1,
  pcb_text_size: r1,
  mod_edge_width: r1,
  mod_text_size: r1,
  mod_text_width: r1,
  pad_drill: r1,
  pad_to_mask_clearance: r1,
  links : r1,
  no_connects : r1,
  thickness : r1,
  drawings : r1,
  tracks : r1,
  zones : r1,
  modules : r1,
  nets : r1,
  version: r1,
  trace_width: r1,
  via_dia: r1,
  uvia_dia: r1,
  linewidth: r1,

  arc_segments: i1,
  status: i1,
  zone_connect: i1,
  drillshape: i1,
  mode: i1,
  scaleselection: i1,
  outputformat: i1,
  hpglpennumber: i1,
  hpglpenspeed: i1,
  hpglpendiameter: i1,
  hpglpenoverlay: i1,

  tstamp: hex,
  tedit: hex,

  xy: r2,
  at: r2,
  start: r2,
  end: r2,
  size: r2,
  center: r2,
  drill: r2,
  user_via: r2,
  pad_size: r2,
  aux_axis_origin: r2,

  xyz: r3,

  layer : false,
  net_name : false,
  connect_pads: false,
  segment: false,

  mirror: bool,
  useauxorigin: bool,
  psnegative: bool,
  psa4output: bool,
  plotreference: bool,
  plotvalue: bool,
  plotinvisibletext: bool,
  padsonsilk: bool,
  subtractmaskfromsilk: bool,
  usegerberextensions: bool,
  excludeedgelayer: bool,
  plotframeref: bool,
  viasonmask: bool,

  // unsure
  polygon: false,
  filled_polygon: false,
  zone: false,
  fill: false,
  pts: false,
  layers: false,
  via: false,
  gr_text: false,
  gr_line: false,
  fp_line: false,
  fp_circle: false,
  fp_text: false,
  fp_poly: false,
  font: false,
  justify: false,
  rotate: false,
  scale: false,
  kicad_pcb: false,
  effects: false,
  module: false,
  model: false,
  attr: false,
  path: false,
  tags: false,
  descr: false,
  add_net: false,
  zone_45_only: false,
  host: false,
  general: false,
  company: false,
  rev: false,
  date: false,
  title: false,
  page: false,
  title_block: false,
  visible_elements: false,
  net_class: false,
  setup: false,
  outputdirectory: false,
  layerselection: false, // this one is weird: 0x010f0_80000007
  pcbplotparams: false,

  // special
  hatch : function(args) {
    args[1] = i1(args[1]);
    return args;
  },

  pad : function(args) {
    args[0] = i1(args[0]);
    return args;
  },

  area : function(args) {
    return args.map(parseFloat);
  }
}


for (var i=0; i<100; i++) {
  ops[String(i)] = false;
}

function createKiCadParserStream(debug) {

  var parser = createParser(debug);

  parser.on('*', function(ev) {
    var op = ops[ev[0]];
    if (op) {
      parser.emit('op_' + ev[0], op(ev[1]));
    } else {
      if (op !== false) {
        console.log('no handler for:', ev[0]);
      }
      parser.emit('op_' + ev[0], ev[1]);
    }
  });

  return parser;

}
