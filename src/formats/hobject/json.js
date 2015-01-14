
define([
  'S',
  'scene/nodes/HObject',
  'scene/nodes/Node',
  'scene/nodes/geometries/Cuboid'
], function (S, HObject, Node, Cuboid) {
  'use strict';

  var VERSION = '1.0';
  var FORMAT = 'json';
  var CLASS = 'HObject';

  function simplify(hobject) {
    var simple = {
      nodes: [],
      textures: [],
      __class__: CLASS,
      __format__: FORMAT,
      __version__: VERSION
    };

    if (hobject instanceof HObject) {
      // Save nodes
      hobject.nodes.forEach(function (node) {
        simple.nodes.push({
          position: node.getPosition(),
          dimensions: node.getDimensions()
        });
      });

      // Save textures
      hobject.textures.forEach(function (texture) {
        simple.textures.push({
          name: texture.name,
          position: texture.getPosition(),
          data: texture.getSourceData()
        });
      });
    }
    else {
      console.error('Could not serialize an object from a class different of' +
                    'HObject');
      simple = undefined;
    }
    return simple;
  }

  function enrich(simple) {
    var hobject = null;

    if (!simple) {
      console.error('JSON representation is not valid.');
    }
    else {

      if (!matchConstrains(simple)) {
        console.warn('The stream is not a compliant HObject. Could be errors ' +
                     'while importing.');
      }

      var nodes = simple.nodes.map(function (simpleNode) {
        var cuboid = new Cuboid(simpleNode.dimensions);
        var node = S.augment(cuboid).with(Node, simpleNode.position);
        return node;
      });

      hobject = new HObject({
        nodes: nodes,
        textures: simple.textures
      });
    }

    return hobject;
  }

  function serialize(hobject) {
    var jsonString = null;
    var simpleObject = simplify(hobject);
    if (typeof simpleObject !== 'undefined') {
      jsonString = JSON.stringify(simpleObject);
    }
    return jsonString;
  }

  function deserialize(jsonString) {
    var simple = null;

    try {
      simple = JSON.parse(jsonString);
    } catch (e) {}

    return enrich(simple);
  }

  function matchConstrains(simple) {
    return simple.__class__   === CLASS &&
           simple.__format__  === FORMAT &&
           simple.__version__ === VERSION;
  }

  return {
    simplify: simplify,
    enrich: enrich,
    serialize: serialize,
    deserialize: deserialize
  };
});
