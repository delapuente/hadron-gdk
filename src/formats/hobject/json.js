
define([
  'scene/nodes/HObject',
], function (HObject) {
  'use strict';

  var VERSION = '1.0';
  var FORMAT = 'json';
  var CLASS = 'HObject';

  function serialize(hobject) {
    var jsonString = null;

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

      jsonString = JSON.stringify(simple);
    }
    else {
      console.error('Could not serialize an object from a class different of' +
                    'HObject');
    }

    return jsonString;
  }

  function deserialize(jsonString) {
    var simple = null;
    var hobject = null;

    try {
      simple = JSON.parse(jsonString);
    } catch (e) {}


    if (!simple) {
      console.error('JSON representation is not valid.');
    }
    else {

      if (!matchConstrains(simple)) {
        console.warn('The stream is not a compliant HObject. Could be errors ' +
                     'while importing.');
      }

      hobject = new HObject({
        nodes: simple.nodes,
        textures: simple.textures
      });
    }

    return hobject;
  }

  function matchConstrains(simple) {
    return simple.__class__   === CLASS &&
           simple.__format__  === FORMAT &&
           simple.__version__ === VERSION;
  }

  return {
    serialize: serialize,
    deserialize: deserialize
  };
});
