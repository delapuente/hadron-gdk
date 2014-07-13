
define([
  'S',
  'lib/strongforce',
  'gfx/System',
  'gfx/metrics'
], function (S, strongforce, GfxSystem, metrics) {
  'use strict';

  var Render = strongforce.Render;

  function GridRender(grid) {
    Render.call(this);

    this._grid = grid;
    this._gfxSystem = GfxSystem.getSystem();
    this._layer = this._gfxSystem.newLayer();
    this._drawer = new this._gfxSystem.Graphics();
    this._layer.addChild(this._drawer);

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
    var drawer = this._drawer;

    drawer.clear();
    drawer.lineStyle(1, 0x333333, 1.0);
    for (var x = startX; x < endX; x += sizeX) {
      drawer.moveTo.apply(drawer, metrics.getScreenCoordinates([x, 0, startZ]));
      drawer.lineTo.apply(drawer, metrics.getScreenCoordinates([x, 0, endZ]));
    }
    for (var z = startZ; z < endZ; z += sizeZ) {
      drawer.moveTo.apply(drawer, metrics.getScreenCoordinates([startX, 0, z]));
      drawer.lineTo.apply(drawer, metrics.getScreenCoordinates([endX, 0, z]));
    }
    drawer.lineStyle(2, 0xFF0000, 1.0);
    drawer.moveTo.apply(drawer, metrics.getScreenCoordinates([0, 0, startZ]));
    drawer.lineTo.apply(drawer, metrics.getScreenCoordinates([0, 0, endZ]));
    drawer.moveTo.apply(drawer, metrics.getScreenCoordinates([startX, 0, 0]));
    drawer.lineTo.apply(drawer, metrics.getScreenCoordinates([endX, 0, 0]));
  };

  return GridRender;
});

