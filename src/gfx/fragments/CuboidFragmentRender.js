
define([
  'S',
  'lib/strongforce',
  'scene/metrics',
  'gfx/System'
], function (S, strongforce, metrics, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;

  function CuboidFragmentRender(cuboidFragment, cuboidNode) {
    this._cuboidFragment = cuboidFragment;
    this._cuboidFragment.addEventListener(
      'dimensionsChanged',
      this._onDimensionsChanged.bind(this)
    );
    this._cuboidFragment.addEventListener(
      'positionChanged',
      this._onPositionChanged.bind(this)
    );

    this._gfxSystem = GfxSystem.getSystem();
    this._graphic = new this._gfxSystem.Graphics();
    this.drawCuboid(cuboidNode.getDimensions());
    this.placeCuboid(cuboidNode.getPosition());
  }
  S.theClass(CuboidFragmentRender).inheritsFrom(Render);

  CuboidFragmentRender.prototype.SIDE_COLOR = 0x4FBEE3;
  CuboidFragmentRender.prototype.FRONT_COLOR = 0x429EBC;
  CuboidFragmentRender.prototype.UP_COLOR = 0x59D6FF;

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

    // Draw inner lines
    graphic.lineStyle(2, 0x000000, 1.0);
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));

    // Front, rear and left side
    graphic.lineStyle(0);
    graphic.beginFill(this.FRONT_COLOR);
    graphic.moveTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));

    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, 0, 0]));

    graphic.moveTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.endFill();

    // Top
    graphic.beginFill(this.UP_COLOR);
    graphic.moveTo.apply(graphic, p([0, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
    graphic.endFill();

    // Right side
    graphic.beginFill(this.SIDE_COLOR);
    graphic.moveTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.endFill();

    // Contour
    graphic.lineStyle(2, 0x333333, 1.0);
    graphic.moveTo.apply(graphic, p([0, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
  };

  CuboidFragmentRender.prototype.placeCuboid = function (position) {
    var screenPosition = metrics.getScreenCoordinates(position);
    this._graphic.position.x = screenPosition[0];
    this._graphic.position.y = screenPosition[1];
  };

  return CuboidFragmentRender;
});
