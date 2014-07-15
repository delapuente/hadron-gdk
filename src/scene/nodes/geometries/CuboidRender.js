
define([
  'S',
  'lib/strongforce',
  'scene/metrics',
  'gfx/System'
], function (S, strongforce, metrics, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;

  function CuboidRender(cuboid, dimensions) {
    this._cuboid = cuboid;
    this._gfxSystem = GfxSystem.getSystem();
    this._cuboid.addEventListener(
      'dimensionsChanged',
      this._onDimensionsChanged.bind(this)
    );
    this._graphic = new this._gfxSystem.Graphics();
    this._gfxSystem.add(this._graphic);
  }
  S.theClass(CuboidRender).inheritsFrom(Render);

  CuboidRender.prototype._onDimensionsChanged = function (evt) {
    var dimensions = evt.dimensions;
    this.drawCuboid(dimensions[0], dimensions[1], dimensions[2]);
  };

  CuboidRender.prototype.drawCuboid = function (sizeX, sizeY, sizeZ) {
    var p = metrics.getScreenCoordinates.bind(metrics);
    var graphic = this._graphic;
    graphic.clear();
    graphic.beginFill(0xFF0000);
    graphic.moveTo.apply(graphic, p([0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, 0]));
    graphic.endFill();
  };

  return CuboidRender;
});
