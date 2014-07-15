
define([
  'S',
  'lib/strongforce',
  'scene/metrics',
  'gfx/System'
], function (S, strongforce, metrics, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;

  function CuboidFragmentRender(cuboidFragment, cuboidNode) {
    this._cuboidNode = cuboidNode;
    this._gfxSystem = GfxSystem.getSystem();
    this._cuboidNode.addEventListener(
      'dimensionsChanged',
      this._onDimensionsChanged.bind(this)
    );
    this._cuboidNode.addEventListener(
      'positionChanged',
      this._onPositionChanged.bind(this)
    );
    this._graphic = new this._gfxSystem.Graphics();
    this._gfxSystem.add(this._graphic);

    this.drawCuboid(this._cuboidNode.getDimensions());
    this.placeCuboid(this._cuboidNode.getPosition());
  }
  S.theClass(CuboidFragmentRender).inheritsFrom(Render);

  CuboidFragmentRender.prototype._onDimensionsChanged = function (evt) {
    this.drawCuboid(evt.dimensions);
  };

  CuboidFragmentRender.prototype._onPositionChanged = function (evt) {
    this.placeCuboid(evt.position);
  };

  CuboidFragmentRender.prototype.drawCuboid = function (dimensions) {
    var sizeX = dimensions[0];
    var sizeY = dimensions[1];
    var sizeZ = dimensions[2];

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

  CuboidFragmentRender.prototype.placeCuboid = function (position) {
    var screenPosition = metrics.getScreenCoordinates(position);
    this._graphic.position.x = screenPosition[0];
    this._graphic.position.y = screenPosition[1];
  };

  return CuboidFragmentRender;
});
