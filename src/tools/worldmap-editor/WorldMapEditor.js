
define([
  'S',
  'lib/strongforce',
  'scene/metrics',
  'worldmap/WorldMap',
  'worldmap/Location',
  'worldmap/Path',
  'formats/worldmap/json'
], function (S, strongforce, metrics, WorldMap, Location, Path, WorldMap2JSON) {
  'use strict';

  var Model = strongforce.Model;

  function WorldMapEditor(gridSize) {
    Model.call(this);
    S.theObject(this)
      .has('background', null)
      .has('_wmap', new WorldMap());

    this._backgroundColor = 0xFFFFFF;
  }
  S.theClass(WorldMapEditor).inheritsFrom(Model);

  WorldMapEditor.prototype.clear = function () {
    // Clear paths
    var paths = this._wmap.paths.slice(0);
    paths.forEach(function (path) {
      this.removePath(path);
    }.bind(this));

    // Clear locations
    var locations = this._wmap.locations.slice(0);
    locations.forEach(function (mapLocation) {
      this.removeMapLocation(mapLocation);
    }.bind(this));

    // Reset the map
    this._wmap = new WorldMap();
  };

  WorldMapEditor.prototype.serializeWorldMap = function (uimeta) {
    return WorldMap2JSON.serialize(this._wmap, uimeta);
  };

  WorldMapEditor.prototype.import = function (jsonString) {
    this.clear();

    var wmapInfo = WorldMap2JSON.deserialize(jsonString);
    var wmap = wmapInfo.data;
    var meta = wmapInfo.meta;

    // Editor meta
    if (meta.background) {
      this.setBackground(meta.background);
    }

    // Restore locations
    wmap.locations.forEach(function (mapLocation) {
      this._addMapLocation(mapLocation);
    }.bind(this));

    // Restore paths
    wmap.paths.forEach(function (path) {
      this._addPath(path);
    }.bind(this));
  };

  WorldMapEditor.prototype.setBackground = function (backgroundData) {
    this.background = backgroundData;
    this.dispatchEvent('backgroundSet', {
      data: backgroundData
    });
  };

  WorldMapEditor.prototype.clearBackground = function () {
    this.background = null;
    this.dispatchEvent('backgroundCleared');
  };

  WorldMapEditor.prototype.getNearLocation = function (mapPoint, radio) {
    return this._wmap.getNearLocation(mapPoint, radio);
  };

  WorldMapEditor.prototype.getNearPath = function (mapPoint, radio) {
    return this._wmap.getNearPath(mapPoint, radio);
  };

  WorldMapEditor.prototype.getPathsForLocation = function (mapLocation) {
    return this._wmap.getPathsForLocation(mapLocation);
  };

  WorldMapEditor.prototype.newMapLocation = function (name, position) {
    var newLocation = new Location(name, position);
    return this._addMapLocation(newLocation);
  };

  WorldMapEditor.prototype._addMapLocation = function (mapLocation) {
    this._wmap.locations.push(mapLocation);
    this.dispatchEvent('locationAdded', {
      mapLocation: mapLocation
    });
    return mapLocation;
  };

  WorldMapEditor.prototype.removeMapLocation = function (mapLocation) {
    this._wmap.locations.splice(this._wmap.locations.indexOf(mapLocation), 1);
    this.dispatchEvent('locationRemoved', {
      mapLocation: mapLocation
    });
  };

  WorldMapEditor.prototype.newPath = function (start, end, points) {
    var newPath = new Path(start, end, points);
    return this._addPath(newPath);
  };

  WorldMapEditor.prototype._addPath = function (path) {
    this._wmap.paths.push(path);
    this.dispatchEvent('pathAdded', {
      path: path
    });
    return path;
  };

  WorldMapEditor.prototype.removePath = function (path) {
    this._wmap.paths.splice(this._wmap.paths.indexOf(path), 1);
    this.dispatchEvent('pathRemoved', {
      path: path
    });
  };

  WorldMapEditor.prototype.selectLocation = function (mapLocation) {
    this.selectedLocation = mapLocation;
  };

  return WorldMapEditor;
});
