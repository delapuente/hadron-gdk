
define([], function () {
  'use strict';

  function UIMode(control) {
    this._control = control;
  }

  UIMode.prototype.startFlow = function (name) {
    if (this._control.notifyStartOfFlow) {
      this._control.notifyStartOfFlow(name, this);
    }
  };

  UIMode.prototype.endFlow = function (name) {
    if (this._control.notifyEndOfFlow) {
      this._control.notifyEndOfFlow(name, this);
    }
  };

  return UIMode;
});
