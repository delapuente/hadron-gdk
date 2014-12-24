
define([], function () {
  'use strict';

  function Modable() {}

  Modable.prototype.setupModable = function (modes, evtTarget) {
    this._modable = {
      _current: null,
      _isUnsafe: false,
      _modes: modes
    };
    this._redirectToModes();
  };

  Modable.prototype._redirectToModes = function (evtTarget) {
    var self = this;
    redirectToMode('keyup', window);
    redirectToMode('keydown', window);
    redirectToMode('mouseup');
    redirectToMode('mousedown');
    redirectToMode('mousemove');

    function redirectToMode(eventName, fromTarget) {
      fromTarget = fromTarget || evtTarget;
      var hookName = 'on' + eventName;
      fromTarget.addEventListener(eventName, function (evt) {
        if (!self._modable._current) { return; }
        if (!self._modable._current[hookName]) { return; }
        self._modable._current[hookName](evt);
      });
    }
  };

  Modable.prototype.changeMode = function (name) {
    if (!this._modable._isUnsafe) {
      if (this._modable._current && this._modable._current.disable) {
        this._modable._current.disable();
      }
      this._modable._current = this._modable._modes[name];
      if (this._modable._current && this._modable._current.enable) {
        this._modable._current.enable();
      }
      return true;
    }

    return false;
  };

  Modable.prototype.notifyStartOfMode = function (flowName) {
    this._modable.isUnsafe = true;
    this._modable._current = this._modable._modes[flowName];
  };

  Modable.prototype.notifyEndOfMode = function (flowName) {
    this._modable.isUnsafe = false;
    this._modable._current = null;
  };

  return Modable;
});
