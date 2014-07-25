
define([
  'S',
  'lib/strongforce',
  'tools/helpers/grid/Grid',
  'gfx/textures/Texture',
  'scene/nodes/Node',
  'scene/nodes/geometries/Cuboid'
], function (S, strongforce, Grid, Texture, Node, Cuboid) {
  'use strict';

  var Model = strongforce.Model;

  function ObjectEditor(gridSize) {
    Model.call(this);
    S.theObject(this)
      .has('grid', new Grid(gridSize))
      .has('layers', [])
      .has('primitives', []);
  }
  S.theClass(ObjectEditor).inheritsFrom(Model);

  ObjectEditor.prototype.getSubmodels = function () {
    return [this.grid].concat(this.layers).concat(this.primitives);
  };

  ObjectEditor.prototype.addNewLayer = function (source, name) {
    var newTexture = new Texture(source);
    var newLayer = Object.create(newTexture);
    newLayer.name = name;
    this.layers.push(newLayer);
    this.dispatchEvent('layerAdded', {
      layer: newLayer
    });
  };

  ObjectEditor.prototype.addNewPrimitive = function (dimensions, position) {
    position = position || [0, 0, 0];
    var newGeometry = new Cuboid(dimensions);
    var geometryNode = S.augment(newGeometry).with(Node, position);
    this.primitives.push(geometryNode);
    this.dispatchEvent('nodeAdded', {
      node: geometryNode
    });
    return geometryNode;
  };

  ObjectEditor.prototype.setGridSize = function (newDimensions) {
    this._grid.setDimensions(newDimensions);
  };

  return ObjectEditor;
});
