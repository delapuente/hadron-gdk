
define([
  'S',
  'lib/strongforce',
  'tools/helpers/grid/Grid',
  'gfx/textures/Texture'
], function (S, strongforce, Grid, Texture) {
  'use strict';

  var Model = strongforce.Model;

  function ObjectEditor(gridSize) {
    Model.call(this);
    S.theObject(this)
      .has('grid', new Grid(gridSize))
      .has('layers', [])
      .has('geometries', []);
  }
  S.theClass(ObjectEditor).inheritsFrom(Model);

  ObjectEditor.prototype.getSubmodels = function () {
    return [this.grid].concat(this.layers).concat(this.geometries);
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

  ObjectEditor.prototype.setGridSize = function (newDimensions) {
    this._grid.setDimensions(newDimensions);
  };

  return ObjectEditor;
});
