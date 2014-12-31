
define([
  'S',
  'lib/strongforce',
  'gfx/System',
  'scene/metrics'
], function (S, strongforce, GfxSystem, metrics) {

  var Render = strongforce.Render;

  function HandlerRender(handler) {
    gfxSystem = GfxSystem.getSystem();
    this.graphic = new gfxSystem.Graphics();
    this.graphic.interactive = true;

    this._handler = handler;
    this._handler.addEventListener(
      'directionsSet',
      this._onDirectionsSet.bind(this)
    );
    this._handler.addEventListener(
      'positionChanged',
      this._onPositionChanged.bind(this)
    );
    this._handler.addEventListener(
      'stateChanged',
      this._onStateChanged.bind(this)
    );

    this.graphic.mouseover = function () {
      handler.setState('READY');
    };
    this.graphic.mouseout = function () {
      handler.setState('NON_READY');
    };
    this.graphic.mousedown = function () {
      handler.setState('ACTIVE');
    };
  }
  S.theClass(HandlerRender).inheritsFrom(Render);

  HandlerRender.prototype.HANDLER_DISABLED = 0x555555;
  HandlerRender.prototype.HANDLER_ENABLED = 0x00D000;

  HandlerRender.prototype._onDirectionsSet = function (evt) {
    var isEnabled = evt.state !== 'NON_READY';
    this._drawHandler(evt.directions, isEnabled);
  };

  HandlerRender.prototype._onPositionChanged = function (evt) {
    this._placeHandler(evt.screenPosition);
  };

  HandlerRender.prototype._onStateChanged = function (evt) {
    var directions = evt.target.getDirections();
    var isEnabled = evt.state !== 'NON_READY';
    this._drawHandler(directions, isEnabled);
  };

  HandlerRender.prototype._placeHandler = function (screenPosition) {
    this.graphic.x = screenPosition[0];
    this.graphic.y = screenPosition[1];
  };

  HandlerRender.prototype._drawHandler = function (directions, isEnabled) {
    var graphic = this.graphic;
    var p = metrics.getScreenCoordinates.bind(this);
    var currentColor = isEnabled ? this.HANDLER_ENABLED : this.HANDLER_DISABLED;
    var thresholdRadius = this._handler._threshold;
    var thresholdLength = thresholdRadius * 2;

    graphic.clear();
    graphic.lineStyle(2.0, currentColor, 1.0);

    if (directions.x) {
      graphic.moveTo.apply(graphic, p([-thresholdLength, 0, 0]));
      graphic.lineTo.apply(graphic, p([+thresholdLength, 0, 0]));
    }
    if (directions.y) {
      graphic.moveTo.apply(graphic, p([0, -thresholdLength, 0]));
      graphic.lineTo.apply(graphic, p([0, +thresholdLength, 0]));
    }
    if (directions.z) {
      graphic.moveTo.apply(graphic, p([0, 0, -thresholdLength]));
      graphic.lineTo.apply(graphic, p([0, 0, +thresholdLength]));
    }

    graphic.beginFill(currentColor);
    graphic.drawCircle(0, 0, thresholdRadius);

    graphic.updateLocalBounds();
    graphic.hitArea = graphic.getLocalBounds();
  };

  return HandlerRender;
});
