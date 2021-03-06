
define([
  'S',
  'lib/strongforce',
  'scene/metrics',
  'gfx/System'
], function (S, strongforce, metrics, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;
  var EventEmitter = strongforce.EventEmitter;

  function CuboidFragmentRender(cuboidFragment, node, cuboidGeometry) {
    Render.apply(this);
    EventEmitter.apply(this);

    this._gfxSystem = GfxSystem.getSystem();
    this.graphic = new this._gfxSystem.Graphics();
    this.graphic.interactive = true;
    ['over', 'out', 'down', 'up'].forEach(function (action) {
      var eventName = 'mouse' + action;
      this.graphic[eventName] = function (data) {
          this.dispatchEvent(eventName, Object.create(data));
      }.bind(this);
    }.bind(this));

    cuboidFragment.addEventListener(
      'fragmentChanged',
      this._onFragmentChanged.bind(this)
    );
    this._cuboidGeometry = cuboidGeometry;
    this.drawCuboid(this._cuboidGeometry.getDimensions());
    this.placeCuboid(this._cuboidGeometry.getPosition());
  }
  S.theClass(CuboidFragmentRender).inheritsFrom(Render);
  S.theClass(CuboidFragmentRender).mix(EventEmitter);

  CuboidFragmentRender.prototype.SIDE_COLOR = 0x4FBEE3;
  CuboidFragmentRender.prototype.FRONT_COLOR = 0x429EBC;
  CuboidFragmentRender.prototype.UP_COLOR = 0x59D6FF;

  CuboidFragmentRender.prototype._onFragmentChanged = function (evt) {
    this.drawCuboid(this._cuboidGeometry.getDimensions());
    this.placeCuboid(this._cuboidGeometry.getPosition());
  };

  CuboidFragmentRender.prototype.getLocalBounds = function () {
    return this.graphic.getLocalBounds();
  };

  CuboidFragmentRender.prototype.drawCuboid = function (dimensions) {
    var sizeX = dimensions[0];
    var sizeY = dimensions[1];
    var sizeZ = dimensions[2];

    var p = metrics.getScreenCoordinates.bind(metrics);
    var graphic = this.graphic;
    graphic.clear();

    // Draw inner lines
    graphic.lineStyle(2, 0x000000, 1.0);
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));

    // Bottom
    graphic.beginFill(this.FRONT_COLOR);
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, 0]));

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

    graphic.updateLocalBounds();
    graphic.hitArea = graphic.getLocalBounds();
  };

  CuboidFragmentRender.prototype.placeCuboid = function (position) {
    var screenPosition = metrics.getScreenCoordinates(position);
    this.graphic.position.x = screenPosition[0];
    this.graphic.position.y = screenPosition[1];
  };

  return CuboidFragmentRender;
});
