
define([
  'S',
  'lib/strongforce',
  'gfx/worldmap/TrackRender',
  'worldmap/Path'
], function (S, strongforce, TrackRender, Path) {
  'use strict';

  var Model = strongforce.Model;

  function Track(pathOrPoints) {
    Model.apply(this, arguments);
    var isPath = pathOrPoints instanceof Path;
    var points = isPath ? pathOrPoints.getPoints() : pathOrPoints;

    if (isPath) {
      this._path = pathOrPoints;
      this._path.addEventListener(
        'endChanged',
        this._onPathEndChanged.bind(this)
      );
    }

    this.setPoints(points);
  }
  S.theClass(Track).inheritsFrom(Model);

  Track.prototype.render = TrackRender;

  Track.prototype.clear = function () {
    this._points = [];
    this._dispatchPointSetChanged();
  };

  Track.prototype.setEndPoint = function (newPoint) {
    if (this._points.length > 0) {
      this._points[this._points.length - 1] = newPoint;
      this._dispatchPointSetChanged();
    }
  };

  Track.prototype._onPathEndChanged = function (evt) {
    this._points = evt.points;
    this._dispatchPointSetChanged();
  };

  Track.prototype._dispatchPointSetChanged = function () {
   this.dispatchEvent('pointSetChanged', {
      points: this._points
    });
  };

  Track.prototype.addPoint = function (point) {
    this._points.push(point);
    this._dispatchPointSetChanged();
  };

  Track.prototype.getLength = function (point) {
    return this._points.length;
  };

  Track.prototype.setPoints = function (points) {
    this._points = points;
    this._dispatchPointSetChanged();
  };

  Track.prototype.getPoints = function () {
    return this._points.slice(0);
  };

  return Track;
});
