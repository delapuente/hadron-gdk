
define([
  'S',
  'lib/strongforce',
  'scene/metrics',
  'gfx/System'
], function (S, strongforce, metrics, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;
  var EventEmitter = strongforce.EventEmitter;

  function CuboidFragmentRender(cuboidFragment, cuboidNode) {
    Render.apply(this);
    EventEmitter.apply(this);

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
    this._graphic.interactive = true;
    this._shadowGraphic = new this._gfxSystem.Graphics();
    this._cuboidGraphic = new this._gfxSystem.Graphics();
    this._graphic.addChild(this._shadowGraphic);
    this._graphic.addChild(this._cuboidGraphic);
    ['over', 'out', 'down', 'up'].forEach(function (action) {
      var eventName = 'mouse' + action;
      this._graphic[eventName] = function (data) {
          this.dispatchEvent(eventName, Object.create(data));
      }.bind(this);
    }.bind(this));
    this.drawCuboid(cuboidNode.getDimensions());
    this.placeCuboid(cuboidNode.getPosition());

    // Outside, the graphic is only the cuboid
    S.theObject(this).hasGetter(function graphic() {
      return this._graphic;
    });
  }
  S.theClass(CuboidFragmentRender).inheritsFrom(Render);
  S.theClass(CuboidFragmentRender).mix(EventEmitter);

  CuboidFragmentRender.prototype.SIDE_COLOR = 0x4FBEE3;
  CuboidFragmentRender.prototype.FRONT_COLOR = 0x429EBC;
  CuboidFragmentRender.prototype.UP_COLOR = 0x59D6FF;
  CuboidFragmentRender.prototype.SHADOW_COLOR = 0x00FF00;

  CuboidFragmentRender.prototype._onDimensionsChanged = function (evt) {
    this.drawCuboid(evt.dimensions);
  };

  CuboidFragmentRender.prototype._onPositionChanged = function (evt) {
    this.placeCuboid(evt.position);
  };

  CuboidFragmentRender.prototype.getLocalBounds = function () {
    var localBounds = this._cuboidGraphic.getLocalBounds();
    localBounds.x += this._cuboidGraphic.x;
    localBounds.y += this._cuboidGraphic.y;
    return localBounds;
  };

  CuboidFragmentRender.prototype.drawCuboid = function (dimensions) {
    var sizeX = dimensions[0];
    var sizeY = dimensions[1];
    var sizeZ = dimensions[2];

    var p = metrics.getScreenCoordinates.bind(metrics);
    var graphic = this._cuboidGraphic;
    graphic.clear();

    this._drawShadow(dimensions);

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

    this._graphic.updateBounds();
    this._graphic.hitArea = this._cuboidGraphic.getLocalBounds();
  };

  CuboidFragmentRender.prototype._drawShadow = function (dimensions) {
    var sizeX = dimensions[0];
    var sizeY = dimensions[1];
    var sizeZ = dimensions[2];

    var p = metrics.getScreenCoordinates.bind(metrics);
    var graphic = this._shadowGraphic;
    graphic.clear();

    graphic.lineStyle(0);
    graphic.beginFill(this.SHADOW_COLOR);
    graphic.moveTo.apply(graphic, p([-10, 0, -10]));
    graphic.lineTo.apply(graphic, p([sizeX + 10, 0, -10]));
    graphic.lineTo.apply(graphic, p([sizeX + 10, 0, sizeZ + 10]));
    graphic.lineTo.apply(graphic, p([-10, 0, sizeZ + 10]));
    graphic.lineTo.apply(graphic, p([-10, 0, -10]));
  };

  CuboidFragmentRender.prototype.placeCuboid = function (position) {
    var screenPosition = metrics.getScreenCoordinates(position);
    this._cuboidGraphic.position.x = screenPosition[0];
    this._cuboidGraphic.position.y = screenPosition[1];

    var shadowScreenPositon =
      metrics.getScreenCoordinates([position[0], 0, position[2]]);
    this._shadowGraphic.position.x = shadowScreenPositon[0];
    this._shadowGraphic.position.y = shadowScreenPositon[1];
  };

  return CuboidFragmentRender;
});
