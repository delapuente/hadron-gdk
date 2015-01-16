
define([
  'S',
  'lib/strongforce',
  'tools/helpers/grid/GridRender'
], function (S, strongforce, GridRender) {
  'use strict';

  var Model = strongforce.Model;

  function Grid(cellSize, height) {
    Model.call(this);
    this.setCellSize(cellSize);
    this.setHeight(height || 0);
  }
  S.theClass(Grid).inheritsFrom(Model);

  Grid.prototype.render = GridRender;

  Grid.prototype.getCellSize = function () {
    if (!this._cellSize) { return null; }
    return [
      this._cellSize[0],
      this._cellSize[1]
    ];
  };

  Grid.prototype.setCellSize = function (newCellSize) {
    var oldCellSize = this.getCellSize();
    this._cellSize = [newCellSize[0], newCellSize[1]];
    this.dispatchEvent('cellSizeChanged', {
      oldCellSize: oldCellSize,
      cellSize: this.getCellSize()
    });
  };

  Grid.prototype.setHeight = function (newHeight) {
    var oldHeight = this._height;
    this._height = newHeight;
    this.dispatchEvent('cellHeightChange', {
      oldHeight: oldHeight,
      height: this.getHeight()
    });
  };

  Grid.prototype.getHeight = function () {
    return this._height;
  };

  Grid.prototype.getNearestPoint = function (point) {
    return [
      Math.floor(point[0] / this._cellSize[0]) * this._cellSize[0],
      this.getHeight(),
      Math.floor(point[2] / this._cellSize[1]) * this._cellSize[1],
    ];
  };

  return Grid;
});
