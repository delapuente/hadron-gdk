
define([
  'S',
  'lib/strongforce',
  'scene/metrics'
], function (S, strongforce, metrics) {
  'use strict';

  var Model = strongforce.Model;

  function length(segment) {
    return metrics.distance(segment[0], segment[1]);
  }

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
      .has('_milestones', 1);
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

  Path.prototype.setMilestonesCount = function (newMilestones) {
    var oldMilestones = this.getMilestonesCount();
    this._milestones = newMilestones;
    this.dispatchEvent('milestonesChanged', {
      oldMilestones: oldMilestones,
      newMilestones: this.getMilestonesCount()
    });
  };

  Path.prototype.getMilestonesCount = function () {
    return this._milestones;
  };

  Path.prototype.getTotalDistance = function () {
    var segments = this.getSegments();
    return segments.reduce(function (total, segment) {
      return total + length(segment);
    }, 0);
  };

  Path.prototype.getPointAtMilestone = function (target) {
    target = Math.min(Math.max(0, target), 1.0); // 0 <= target <= 1.0
    var totalDistance = this.getTotalDistance();
    var segments = this.getSegments();

    var i = 0;
    var currentSegment = segments[i];
    var segmentLength = length(currentSegment);
    var segmentMilestone = segmentLength / totalDistance;
    while (segmentMilestone < target) {
      target -= segmentMilestone;
      i++;
      currentSegment = segments[i];
      segmentLength = length(currentSegment);
      segmentMilestone = segmentLength / totalDistance;
    }

    var remainingDistance = target * totalDistance;
    var relativeDistance = remainingDistance / segmentLength;
    var segmentVector = metrics.sub(currentSegment[1], currentSegment[0]);
    var scaledByTarget = metrics.mul(relativeDistance, segmentVector);
    var milestonePoint = metrics.add(currentSegment[0], scaledByTarget);

    return milestonePoint;
  };

  return Path;
});
