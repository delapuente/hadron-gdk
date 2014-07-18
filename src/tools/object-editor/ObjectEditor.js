
define([
  'S',
  'lib/strongforce',
  'tools/helpers/grid/Grid',
  'gfx/textures/Texture',
  'scene/nodes/Node',
  'scene/nodes/geometries/Cuboid',
  'gfx/fragments/CuboidFragment',
  'gfx/Isospace'
], function (S, strongforce, Grid, Texture, Node, Cuboid, CuboidFragment,
             Isospace) {
  'use strict';

  var Model = strongforce.Model;

  function ObjectEditor(gridSize) {
    Model.call(this);
    S.theObject(this)
      .has('grid', new Grid(gridSize))
      .has('layers', [])
      .has('primitives', [])
      .has('isospace', new Isospace());
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
    var newPrimitive = S.augment(newGeometry).with(Node, position);
    var newFragment = new CuboidFragment(newPrimitive);
    this.isospace.addFragment(newFragment);
    this.primitives.push(newPrimitive);
    this.dispatchEvent('primitiveAdded', {
      primitive: newGeometry
    });
  };

  ObjectEditor.prototype.setGridSize = function (newDimensions) {
    this._grid.setDimensions(newDimensions);
  };

  return ObjectEditor;
});
