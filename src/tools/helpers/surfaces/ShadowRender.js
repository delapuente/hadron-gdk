
define([
  'S',
  'lib/strongforce',
  'gfx/System',
  'scene/metrics'
], function (S, strongforce, GfxSystem, metrics) {

  var Render = strongforce.Render;

  function ShadowRender(shadow) {
    gfxSystem = GfxSystem.getSystem();
    this.graphic = new gfxSystem.Graphics();
    this._shadow = shadow;
    this._shadow.addEventListener(
      'primitiveChanged',
      this._onSelectionChanged.bind(this)
    );
    this._shadow.addEventListener(
      'dimensionsChanged',
      this._dimensionsChanged.bind(this)
    );
    this._shadow.addEventListener(
      'positionChanged',
      this._dimensionsChanged.bind(this)
    );
  }
  S.theClass(ShadowRender).inheritsFrom(Render);

  ShadowRender.prototype.SHADOW_COLOR = 0x999999;

  ShadowRender.prototype._onSelectionChanged = function (evt) {
    this._drawShadow(evt.primitive);
  };

  ShadowRender.prototype._dimensionsChanged = function (evt) {
    this._drawShadow(this._shadow.getPrimitive());
  };

  ShadowRender.prototype._drawShadow = function (primitive) {
    var graphic = this.graphic;
    graphic.clear();
    if (!primitive) { return; }

    var p = metrics.getScreenCoordinates.bind(metrics);
    var position = primitive.getPosition();
    position[1] = 0;

    var screenPosition = metrics.getScreenCoordinates(position);
    graphic.x = screenPosition[0];
    graphic.y = screenPosition[1];

    var dimensions = primitive.getDimensions();
    var sizeX = dimensions[0],
        sizeZ = dimensions[2];

    graphic.beginFill(this.SHADOW_COLOR);
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, 0]));
  };

  return ShadowRender;
});
