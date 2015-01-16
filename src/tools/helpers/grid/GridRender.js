
define([
  'S',
  'lib/strongforce',
  'gfx/System',
  'scene/metrics'
], function (S, strongforce, GfxSystem, metrics) {
  'use strict';

  var Render = strongforce.Render;

  function GridRender(grid) {
    Render.call(this);

    this._grid = grid;
    this._gfxSystem = GfxSystem.getSystem();
    this.graphic = new this._gfxSystem.Graphics();

    grid.addEventListener(
      'cellSizeChanged',
      this._onGridChanged.bind(this)
    );

    this._gfxSystem.addEventListener(
      'viewportChanged',
      this._onViewportChanged.bind(this)
    );
  }
  S.theClass(GridRender).inheritsFrom(Render);

  GridRender.prototype._onGridChanged = function (evt) {
    var cellSize = evt.cellSize;
    var viewport = this._gfxSystem.getViewport();
    this.drawGrid(cellSize[0], cellSize[1], viewport);
  };

  GridRender.prototype._onViewportChanged = function () {
    var cellSize = this._grid.getCellSize();
    var viewport = this._gfxSystem.getViewport();
    this.drawGrid(cellSize[0], cellSize[1], viewport);
  };

  GridRender.prototype.drawGrid = function (sizeX, sizeZ, viewport) {
    var p = metrics.getScreenCoordinates.bind(metrics);
    var height = this._grid.getHeight();
    var yPlane = { y: height };

    var sceneView = {
      topLeft: metrics.getMapCoordinates(viewport.topLeft, yPlane),
      topRight: metrics.getMapCoordinates(viewport.topRight, yPlane),
      bottomRight: metrics.getMapCoordinates(viewport.bottomRight, yPlane),
      bottomLeft: metrics.getMapCoordinates(viewport.bottomLeft, yPlane)
    };
    var startX = Math.floor(sceneView.topLeft[0] / sizeX) * sizeX;
    var endX = Math.ceil(sceneView.bottomRight[0] / sizeX) * sizeX;
    var startZ = Math.floor(sceneView.topRight[2] / sizeZ) * sizeZ;
    var endZ = Math.ceil(sceneView.bottomLeft[2] / sizeZ) * sizeZ;
    var graphic = this.graphic;

    graphic.clear();
    graphic.lineStyle(1, 0x333333, 1.0);
    for (var x = startX; x < endX; x += sizeX) {
      graphic.moveTo.apply(graphic, p([x, height, startZ]));
      graphic.lineTo.apply(graphic, p([x, height, endZ]));
    }
    for (var z = startZ; z < endZ; z += sizeZ) {
      graphic.moveTo.apply(graphic, p([startX, height, z]));
      graphic.lineTo.apply(graphic, p([endX, height, z]));
    }
    graphic.lineStyle(2, 0xFF0000, 1.0);
    graphic.moveTo.apply(graphic, p([0, height, startZ]));
    graphic.lineTo.apply(graphic, p([0, height, endZ]));
    graphic.moveTo.apply(graphic, p([startX, height, 0]));
    graphic.lineTo.apply(graphic, p([endX, height, 0]));
  };

  return GridRender;
});

