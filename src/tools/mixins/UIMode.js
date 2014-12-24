
define([], function () {
  'use strict';

  function UIMode(name, control) {
    this._name = name;
    this._control = control;
  }

  UIMode.prototype.start = function () {
    if (this._control.notifyStartOfMode) {
      this._control.notifyStartOfMode(this._name);
    }
  };

  UIMode.prototype.end = function () {
    if (this._control.notifyEndOfMode) {
      this._control.notifyEndOfMode(this._name);
    }
  };

  return UIMode;
});
