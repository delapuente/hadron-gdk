
define([
  'S',
  'scene/metrics'
], function (S, metrics) {
  'use strict';

  function PrimitiveMode(control, model) {
    this._control = control;
    this._model = model;
    this._creatingPrimitiveStage = 'FINISHED';
  }

  PrimitiveMode.prototype.onmousedown = function (evt) {
    switch (this._creatingPrimitiveStage) {
      case 'FINISHED':
        this._control.notifyStartOfFlow('creating-primitive');
        this._creatingPrimitiveStage = 'SETTING_PLANT';

        this._startDrawingPoint =
          metrics.getMapCoordinates(evt.viewportCoordinates);
        this._newPrimitive =
          this._model.addNewPrimitive([0, 0, 0], this._startDrawingPoint);
        break;

      case 'SETTING_HEIGHT':
        this._control.notifyEndOfFlow('creating-primitive');
        this._creatingPrimitiveStage = 'FINISHED';

        this._newPrimitive = null;
        break;
    }
  };

  PrimitiveMode.prototype.onmouseup = function (evt) {
    switch (this._creatingPrimitiveStage) {
      case 'SETTING_PLANT':
        var mapPoint = metrics.getMapCoordinates(evt.viewportCoordinates);
        this._endPointRestrictions = { x: mapPoint[0], z: mapPoint[2] };
        this._creatingPrimitiveStage = 'SETTING_HEIGHT';
        break;
    }
  };

  PrimitiveMode.prototype.onmousemove = function (evt) {
    var dimensions;
    switch (this._creatingPrimitiveStage) {
      case 'SETTING_PLANT':
        var newOriginPoint = this._startDrawingPoint.slice(0);
        var mapPoint = metrics.getMapCoordinates(evt.viewportCoordinates);
        dimensions = this._newPrimitive.getDimensions();
        var newDimensions = [
          mapPoint[0] - newOriginPoint[0],
          dimensions[1],
          mapPoint[2] - newOriginPoint[2]
        ];
        if (newDimensions[0] < 0) {
          newOriginPoint[0] += newDimensions[0];
          newDimensions[0] = -newDimensions[0];
        }
        if (newDimensions[2] < 0) {
          newOriginPoint[2] += newDimensions[2];
          newDimensions[2] = -newDimensions[2];
        }
        this._newPrimitive.setPosition(newOriginPoint);
        this._newPrimitive.setDimensions(newDimensions);
        break;

      case 'SETTING_HEIGHT':
        dimensions = this._newPrimitive.getDimensions();
        dimensions[1] = Math.max(0, metrics.getMapCoordinates(
          evt.viewportCoordinates,
          this._endPointRestrictions
        )[1]);
        this._newPrimitive.setDimensions(dimensions);
        break;
    }
  };

  return PrimitiveMode;
});
