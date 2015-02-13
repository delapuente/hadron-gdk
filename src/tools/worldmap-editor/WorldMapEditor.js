
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
      .has('locations', [])
      .has('paths', []);

    this._backgroundColor = 0xFFFFFF;
  }
  S.theClass(WorldMapEditor).inheritsFrom(Model);

  WorldMapEditor.prototype.clear = function () {
    var paths = this.paths.slice(0);
    paths.forEach(function (path) {
      this.removePath(path);
    }.bind(this));
    var locations = this.locations.slice(0);
    locations.forEach(function (mapLocation) {
      this.removeMapLocation(mapLocation);
    }.bind(this));
  };

  WorldMapEditor.prototype.serializeWorldMap = function (meta) {
    var wmap = new WorldMap({
      locations: this.locations,
      paths: this.paths
    });
    return WorldMap2JSON.serialize(wmap, meta);
  };

  WorldMapEditor.prototype.import = function (jsonString) {
    this.clear();
    var wmapInfo = WorldMap2JSON.deserialize(jsonString);
    var wmap = wmapInfo.data;
    var meta = wmapInfo.meta;
    if (meta.background) {
      this.setBackground(meta.background);
    }
    wmap.locations.forEach(function (mapLocation) {
      this._addMapLocation(mapLocation);
    }.bind(this));
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

  // TODO: Move to WorldMap
  WorldMapEditor.prototype.getNearLocation = function (mapPoint, radio) {
    radio = radio || 10;
    var nearestLocation = null;
    this.locations.reduce(function (minDistance, mapLocation) {
      var distance = metrics.distance(mapLocation.getPosition(), mapPoint);
      if (distance < radio && distance < minDistance) {
        minDistance = distance;
        nearestLocation = mapLocation;
      }
      return minDistance;
    }, Infinity);
    return nearestLocation;
  };

  // TODO: Move to WorldMap
  WorldMapEditor.prototype.getNearPath = function (mapPoint, radio) {
    radio = radio || 10;
    var nearestPath = null;
    this.paths.reduce(function (minDistance, path) {
      var distance = path.distance(mapPoint);
      if (distance < radio && distance < minDistance) {
        minDistance = distance;
        nearestPath = path;
      }
      return minDistance;
    }, Infinity);
    return nearestPath;
  };

  // TODO: Move to WorldMap
  WorldMapEditor.prototype.getPathsForLocation = function (mapLocation) {
    return this.paths.filter(function (path) {
      return path.includes(mapLocation);
    });
  };

  WorldMapEditor.prototype.newMapLocation = function (name, position) {
    var newLocation = new Location(name, position);
    return this._addMapLocation(newLocation);
  };

  WorldMapEditor.prototype._addMapLocation = function (mapLocation) {
    this.locations.push(mapLocation);
    this.dispatchEvent('locationAdded', {
      mapLocation: mapLocation
    });
    return mapLocation;
  };

  WorldMapEditor.prototype.removeMapLocation = function (mapLocation) {
    this.locations.splice(this.locations.indexOf(mapLocation), 1);
    this.dispatchEvent('locationRemoved', {
      mapLocation: mapLocation
    });
  };

  WorldMapEditor.prototype.newPath = function (start, end, points) {
    var newPath = new Path(start, end, points);
    return this._addPath(newPath);
  };

  WorldMapEditor.prototype._addPath = function (path) {
    this.paths.push(path);
    this.dispatchEvent('pathAdded', {
      path: path
    });
    return path;
  };

  WorldMapEditor.prototype.removePath = function (path) {
    this.paths.splice(this.paths.indexOf(path), 1);
    this.dispatchEvent('pathRemoved', {
      path: path
    });
  };

  WorldMapEditor.prototype.selectLocation = function (mapLocation) {
    this.selectedLocation = mapLocation;
  };

  return WorldMapEditor;
});
