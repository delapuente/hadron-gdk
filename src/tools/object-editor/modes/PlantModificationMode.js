
define([
  'S',
  'scene/metrics'
], function (S, metrics) {
  'use strict';

  function PlantModificationMode(control, model, handler) {
    this._control = control;
    this._model = model;
    this._handler = handler;
    this._lastPointerCoordinates = null;
  }

  PlantModificationMode.prototype.onmousedown = function (evt) {
    this._control.notifyStartOfFlow('modify-primitive-plant');
    this._selectedPrimitive = this._model.getFocusedPrimitive();
    this._isChangingPlant = true;
    this._lastPointerCoordinates = this._handler.getPosition();
  };

  PlantModificationMode.prototype.onmouseup = function () {
    this._isChangingPlant = false;
    this._control.notifyEndOfFlow('modify-primitive-plant');
  };

  PlantModificationMode.prototype.onmousemove = function (evt) {
    if (!this._isChangingPlant ||
        !this._selectedPrimitive ||
        !this._handler.isEnabled()) { return; }

    var handlerPosition = this._handler.getPosition();
    var mapPoint = metrics.getMapCoordinates(
      evt.viewportCoordinates,
      { y: handlerPosition[1] }
    );
    var deltaX = mapPoint[0] - this._lastPointerCoordinates[0];
    var deltaZ = mapPoint[2] - this._lastPointerCoordinates[2];
    var currentDimensions = this._selectedPrimitive.getDimensions();
    this._selectedPrimitive.setDimensions([
      Math.max(currentDimensions[0] + deltaX, 0),
      currentDimensions[1],
      Math.max(currentDimensions[2] + deltaZ, 0)
    ]);

    this._lastPointerCoordinates = mapPoint;
  };

  return PlantModificationMode;
});
