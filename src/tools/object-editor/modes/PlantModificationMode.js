
define([
  'S',
  'scene/metrics'
], function (S, metrics) {
  'use strict';

  function HeightModificationMode(control, model) {
    this._control = control;
    this._model = model;
    this._lastPointerCoordinates = null;
  }

  HeightModificationMode.prototype.enable = function () {
  };

  HeightModificationMode.prototype.disable = function () {
  };

  HeightModificationMode.prototype.onkeydown = function (evt) {
  };

  HeightModificationMode.prototype.onkeyup = function (evt) {
  };

  HeightModificationMode.prototype.onmousedown = function (evt) {
    this._control.notifyStartOfFlow('modify-primitive-height');
  };

  HeightModificationMode.prototype.onmouseup = function () {
    this._control.notifyEndOfFlow('modify-primitive-height');
  };

  HeightModificationMode.prototype.onmousemove = function (evt) {
  };

  return HeightModificationMode;
});
