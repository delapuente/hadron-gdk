
define([
  'S',
  'tools/mixins/UIMode',
  'scene/metrics'
], function (S, UIMode, metrics) {
  'use strict';

  function PlantModificationMode(control, model, handler) {
    UIMode.call(this, control);
    this._model = model;
    this._handler = handler;
    this._lastPointerCoordinates = null;
  }
  S.theClass(PlantModificationMode).inheritsFrom(UIMode);

  PlantModificationMode.prototype.onmousedown = function (evt) {
    this.startFlow('modify-primitive-plant');
    this._selectedPrimitive = this._model.getFocusedPrimitive();
    this._isChangingPlant = true;

    var handlerPosition = this._handler.getPosition();
    this._lastPointerCoordinates =
      metrics.getMapCoordinates(
        evt.viewportCoordinates,
        { y: handlerPosition[1]  }
      );
  };

  PlantModificationMode.prototype.onmouseup = function () {
    this._isChangingPlant = false;
    this.endFlow('modify-primitive-plant');
  };

  PlantModificationMode.prototype.onmousemove = function (evt) {
    if (!this._isChangingPlant || !this._selectedPrimitive) { return; }

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
