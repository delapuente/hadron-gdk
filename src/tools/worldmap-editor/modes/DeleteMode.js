
define([
  'S',
  'tools/mixins/UIMode'
], function (S, UIMode) {
  'use strict';

  function DeleteMode(control, model) {
    UIMode.call(this, control);
    this._model = model;
  }
  S.theClass(DeleteMode).inheritsFrom(UIMode);

  DeleteMode.prototype.onclick = function (evt) {
    var point = evt.viewportCoordinates;
    var nearestLocation = this._model.getNearLocation(point);
    var nearestPath = this._model.getNearPath(point);
    if (nearestLocation) {
      var confluentePaths = this._model.getPathsForLocation(nearestLocation);
      if (confluentePaths.length === 0) {
        this._model.removeMapLocation(nearestLocation);
      }
      else {
        var confirmMsg = 'This action will remove ' + confluentePaths.length +
                         ' path(s) ending in this location. Are you sure ' +
                         'you want to continue?';
        if (confirm(confirmMsg)) {
          confluentePaths.forEach(function (path) {
            this._model.removePath(path);
          }.bind(this));
          this._model.removeMapLocation(nearestLocation);
        }
      }
    }
    else if (nearestPath) {
      this._model.removePath(nearestPath);
    }
  };

  return DeleteMode;
});
