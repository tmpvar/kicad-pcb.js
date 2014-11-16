var through = require('through');
var createParser = require('./parser');

module.exports = createKiCadParserStream;

function i1(args) {
  return parseInt(args[0], 10);
}

function hex(args) {
  return parseInt(args[0], 16);
}

function bool(args) {
  return !!args[0];
}

function attemptFloat(num) {
  var r = parseFloat(num);
  if (!isNaN(r)) {
    return r;
  } else {
    return num;
  }
}

function float(args) {

  for (var i=0; i<args.length; i++) {
    args[i] = attemptFloat(args[i]);
  }

  if (args.length > 1) {
    return args;
  } else {
    return args[0];
  }
}


var ops = {

  width: float,
  net: float,
  min_thickness: float,
  clearance: float,
  thermal_bridge_width: float,
  thermal_gap: float,
  thermal_width: float,
  thickness: float,
  angle: float,
  user_trace_width: float,

  last_trace_width: float,
  trace_clearance: float,
  zone_clearance: float,
  trace_min: float,
  segment_width: float,
  edge_width: float,
  via_size: float,
  via_drill: float,
  via_min_size: float,
  via_min_drill: float,
  uvia_size: float,
  uvia_drill: float,
  uvias_allowed: float,
  uvia_min_size: float,
  uvia_min_drill: float,
  pcb_text_width: float,
  pcb_text_size: float,
  mod_edge_width: float,
  mod_text_size: float,
  mod_text_width: float,
  pad_drill: float,
  pad_to_mask_clearance: float,
  links : float,
  no_connects : float,
  thickness : float,
  drawings : float,
  tracks : float,
  zones : float,
  modules : float,
  nets : float,
  version: float,
  trace_width: float,
  via_dia: float,
  uvia_dia: float,
  linewidth: float,

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

  xy: float,
  start: float,
  end: float,
  size: float,
  center: float,
  drill: float,
  user_via: float,
  pad_size: float,
  aux_axis_origin: float,

  xyz: float,

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

  at : function(args) {
    if (isNaN(parseFloat(args[0]))) {
      return args;
    } else {
      return float(args);
    }
  },

  area : float
}


for (var i=0; i<100; i++) {
  ops[String(i)] = false;
}

function createKiCadParserStream(debug) {

  var parser = createParser(debug);

  parser.on('*', function(ev, stack) {
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
