
define([
  'S',
  'lib/strongforce',
  'tools/helpers/grid/GridRender'
], function (S, strongforce, GridRender) {
  'use strict';

  var Model = strongforce.Model;

  function Grid(cellSize) {
    Model.call(this);
    this.setCellSize(cellSize);
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

  return Grid;
});
