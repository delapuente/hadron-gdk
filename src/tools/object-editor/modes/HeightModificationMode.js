
define([
  'S',
  'tools/mixins/UIMode',
  'scene/metrics'
], function (S, UIMode, metrics) {
  'use strict';

  function HeightModificationMode(control, model, handler) {
    UIMode.call(this, control);
    this._model = model;
    this._handler = handler;
    this._lastPointerCoordinates = null;
  }
  S.theClass(HeightModificationMode).inheritsFrom(UIMode);

  HeightModificationMode.prototype.onmousedown = function (evt) {
    this.startFlow('modify-primitive-height');
    this._selectedPrimitive = this._model.getFocusedPrimitive();
    this._isChangingHeight = true;

    var handlerPosition = this._handler.getPosition();
    this._lastPointerCoordinates =
      metrics.getMapCoordinates(
        evt.viewportCoordinates,
        { x: handlerPosition[0], z: handlerPosition[2] }
      );
  };

  HeightModificationMode.prototype.onmouseup = function () {
    this._isChangingHeight = false;
    this.endFlow('modify-primitive-height');
  };

  HeightModificationMode.prototype.onmousemove = function (evt) {
    if (!this._isChangingHeight || !this._selectedPrimitive) { return; }

    var handlerPosition = this._handler.getPosition();
    var mapPoint = metrics.getMapCoordinates(
      evt.viewportCoordinates,
      { x: handlerPosition[0], z: handlerPosition[2] }
    );
    var deltaY = mapPoint[1] - this._lastPointerCoordinates[1];
    var currentDimensions = this._selectedPrimitive.getDimensions();
    this._selectedPrimitive.setDimensions([
      currentDimensions[0],
      Math.max(currentDimensions[1] + deltaY, 0),
      currentDimensions[2]
    ]);

    this._lastPointerCoordinates = mapPoint;
  };

  return HeightModificationMode;
});
