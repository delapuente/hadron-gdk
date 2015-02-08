
define([
  'S',
  'lib/strongforce',
  'scene/metrics'
], function (S, strongforce, metrics) {
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
      .has('_interPoints', points)
      .has('_length', 1);
  }
  S.theClass(Path).inheritsFrom(Model);

  Path.prototype.distance = function (point) {
    var segments = this.getSegments();
    var minDistance = segments.reduce(function (minDistance, segment) {
      var distance = metrics.segmentDistance(segment, point);
      if (distance < minDistance) { minDistance = distance; }
      return minDistance;
    }, Infinity);
    return minDistance;
  };

  Path.prototype.getSegments = function (point) {
    var segments = [];
    var points = this.getPoints();
    for (var i = 1; i < points.length; i++) {
      segments.push([points[i-1], points[i]]);
    }
    return segments;
  };

  Path.prototype.includes = function (mapLocation) {
    // TODO: extend to include points
    return mapLocation === this.start || mapLocation === this.end;
  };

  Path.prototype.getPoints = function () {
    var startPoint = this.start.getPosition();
    var endPoint = this.end.getPosition();
    var allPoints = [startPoint].concat(this._interPoints).concat([endPoint]);
    return allPoints;
  };

  Path.prototype._dispatchEndChanged = function () {
    this.dispatchEvent('endChanged', { points: this.getPoints() });
  };

  Path.prototype.setLength = function (newLength) {
    var oldLength = this.getLength();
    this._length = newLength;
    this.dispatchEvent('lengthChanged', {
      oldLength: oldLength,
      newLength: this.getLength()
    });
  };

  Path.prototype.getLength = function () {
    return this._length;
  };

  return Path;
});
