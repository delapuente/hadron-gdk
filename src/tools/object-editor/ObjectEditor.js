
define([
  'S',
  'lib/strongforce',
  'tools/helpers/grid/Grid'
], function (S, strongforce, Grid) {
  'use strict';

  var Model = strongforce.Model;

  function ObjectEditor(gridSize) {
    Model.call(this);
    this._grid = new Grid(gridSize);
  }
  S.theClass(ObjectEditor).inheritsFrom(Model);

  ObjectEditor.prototype.getSubmodels = function () {
    return [this._grid];
  };

  ObjectEditor.prototype.setGridSize = function (newDimensions) {
    this._grid.setDimensions(newDimensions);
  };

  return ObjectEditor;
});
