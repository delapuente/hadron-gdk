
define([
  'S',
  'tools/mixins/UIMode',
  'gfx/worldmap/Track'
], function (S, UIMode, Track) {
  'use strict';

  function PathMode(control, model, pathsLayer) {
    UIMode.call(this, control);
    this._model = model;
    this._pathsLayer = pathsLayer;

    this._model.addEventListener('pathAdded', this._addPath.bind(this));
  }
  S.theClass(PathMode).inheritsFrom(UIMode);

  PathMode.prototype.onmousedown = function (evt) {
    var point = evt.viewportCoordinates;
    if (this._isDrawingPath) {
      this._addPointToPath(point);
    }
    else {
      this._startDrawingPath(point);
    }
  };

  PathMode.prototype._startDrawingPath = function (point) {
    var mapLocation = this._model.getNearLocation(point, 10);
    if (mapLocation) {
      this.startFlow('drawing-path');
      this._isDrawingPath = true;
      this._startLocation = mapLocation;
      var start = mapLocation.getPosition();
      this._currentTrack = new Track([start, start]);
      this._pathsLayer.addChild(this._currentTrack.render.graphic);
    }
  };

  PathMode.prototype._addPointToPath = function (point) {
    var mapLocation = this._model.getNearLocation(point, 10);
    if (mapLocation) {
      this._endDrawingPath(mapLocation);
    }
    else {
      this._currentTrack.addPoint(point);
    }
  };

  PathMode.prototype._endDrawingPath = function (mapLocation) {
    this._endLocation = mapLocation;
    var oneWayPath = this._currentTrack.getLength() < 4;
    var points = this._currentTrack.getPoints();
    var interPoints = points.slice(1, -1);
    if (this._endLocation !== this._startLocation || !oneWayPath) {
      this._model.newPath(
        this._startLocation,
        this._endLocation,
        interPoints
      );
    }
    this._isDrawingPath = false;
    this._startLocation = null;
    this._endLocation = null;
    this._currentTrack.clear();
    this.endFlow('drawing-path');
  };

  PathMode.prototype.onmousemove = function (evt) {
    if (this._isDrawingPath) {
      this._currentTrack.setEndPoint(evt.viewportCoordinates);
    }
  };

  PathMode.prototype._addPath = function (evt) {
    var track = new Track(evt.path);
    this._pathsLayer.addChild(track.render.graphic);
  };

  return PathMode;
});
