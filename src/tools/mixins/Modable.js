
define([], function () {
  'use strict';

  function Modable() {}

  Modable.prototype.setupModable = function (evtTarget) {
    this._modable = {
      _current: null,
      _isLocked: false
    };
    this._redirectToModes(evtTarget);
  };

  Modable.prototype._redirectToModes = function (evtTarget) {
    var self = this;
    redirectToMode('keyup', window);
    redirectToMode('keydown', window);
    redirectToMode('mouseup');
    redirectToMode('mousedown');
    redirectToMode('mousemove');
    redirectToMode('mouseover');
    redirectToMode('mouseout');
    redirectToMode('click');

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

  Modable.prototype.changeMode = function (mode) {
    if (!this._modable._isLocked) {
      if (this._modable._current && this._modable._current.disable) {
        this._modable._current.disable();
      }
      this._modable._current = mode;
      if (this._modable._current && this._modable._current.enable) {
        this._modable._current.enable();
      }
      return true;
    }

    return false;
  };

  Modable.prototype.getCurrentMode = function () {
    return this._modable._current;
  };

  Modable.prototype.lockUIMode = function () {
    this._modable._isLocked = true;
  };

  Modable.prototype.unlockUIMode = function () {
    this._modable._isLocked = false;
  };

  return Modable;
});
