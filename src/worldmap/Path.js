
define([
  'S',
  'lib/strongforce'
], function (S, strongforce) {
  'use strict';

  var Model = strongforce.Model;

  function Path(startLocation, endLocation, points) {
    Model.apply(this, arguments);

    startLocation
      .addEventListener('positionChanged', this._dispatchEndChanged.bind(this));
    endLocation
      .addEventListener('positionChanged', this._dispatchEndChanged.bind(this));

    S.theObject(this)
      .has('start', startLocation)
      .has('end', endLocation)
      .has('_interPoints', points);
  }
  S.theClass(Path).inheritsFrom(Model);

  Path.prototype.getPoints = function () {
    var startPoint = this.start.getPosition();
    var endPoint = this.end.getPosition();
    var allPoints = [startPoint].concat(this._interPoints).concat([endPoint]);
    return allPoints;
  };

  Path.prototype._dispatchEndChanged = function () {
    this.dispatchEvent('endChanged', { points: this.getPoints() });
  };

  return Path;
});
