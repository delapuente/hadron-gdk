
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
    this._layer = this._gfxSystem.newLayer();
    this._graphic = new this._gfxSystem.Graphics();
    this._layer.addChild(this._graphic);

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

    var sceneView = {
      topLeft: metrics.getMapCoordinates(viewport.topLeft),
      topRight: metrics.getMapCoordinates(viewport.topRight),
      bottomRight: metrics.getMapCoordinates(viewport.bottomRight),
      bottomLeft: metrics.getMapCoordinates(viewport.bottomLeft)
    };
    var startX = Math.floor(sceneView.topLeft[0] / sizeX) * sizeX;
    var endX = Math.ceil(sceneView.bottomRight[0] / sizeX) * sizeX;
    var startZ = Math.floor(sceneView.topRight[2] / sizeZ) * sizeZ;
    var endZ = Math.ceil(sceneView.bottomLeft[2] / sizeZ) * sizeZ;
    var graphic = this._graphic;

    graphic.clear();
    graphic.lineStyle(1, 0x333333, 1.0);
    for (var x = startX; x < endX; x += sizeX) {
      graphic.moveTo.apply(graphic, p([x, 0, startZ]));
      graphic.lineTo.apply(graphic, p([x, 0, endZ]));
    }
    for (var z = startZ; z < endZ; z += sizeZ) {
      graphic.moveTo.apply(graphic, p([startX, 0, z]));
      graphic.lineTo.apply(graphic, p([endX, 0, z]));
    }
    graphic.lineStyle(2, 0xFF0000, 1.0);
    graphic.moveTo.apply(graphic, p([0, 0, startZ]));
    graphic.lineTo.apply(graphic, p([0, 0, endZ]));
    graphic.moveTo.apply(graphic, p([startX, 0, 0]));
    graphic.lineTo.apply(graphic, p([endX, 0, 0]));
  };

  return GridRender;
});

