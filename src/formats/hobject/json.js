
define([
  'S',
  'formats/jsonBase',
  'scene/nodes/HObject',
  'scene/nodes/Node',
  'scene/nodes/geometries/Cuboid'
], function (S, jsonBase, HObject, Node, Cuboid) {
  'use strict';

  var module = {
    VERSION: '1.0',

    CLASS: 'HObject',

    simplify: function (hobject, simple) {
      simple.nodes = [];
      simple.textures = [];

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
                      CLASS);
        return false;
      }
      return true;
    },

    enrich: function (simple) {
      var hobject = null;

      var nodes = simple.nodes.map(function (simpleNode) {
        var cuboid = new Cuboid(simpleNode.dimensions);
        var node = S.augment(cuboid).with(Node, simpleNode.position);
        return node;
      });

      hobject = new HObject({
        nodes: nodes,
        textures: simple.textures
      });

      return hobject;
    }
  };
  S.the(module).mix(jsonBase);

  return module;
});
