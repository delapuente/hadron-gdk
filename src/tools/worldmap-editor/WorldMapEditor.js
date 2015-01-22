
define([
  'S',
  'lib/strongforce',
  'scene/metrics',
  'tools/worldmap-editor/Location',
  'formats/hobject/json'
], function (S, strongforce, metrics, Location, HObject2JSON) {
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

  WorldMapEditor.prototype.setBackground = function (backgroundData) {
    this.background = backgroundData;
    this.dispatchEvent('backgroundSet', {
      data: backgroundData
    });
  };

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

  WorldMapEditor.prototype.newMapLocation = function (name, position) {
    var newLocation = new Location(name, position);
    this.locations.push(newLocation);
    this.dispatchEvent('locationAdded', {
      mapLocation: newLocation
    });
    return newLocation;
  };

  WorldMapEditor.prototype.selectLocation = function (mapLocation) {
    this.selectedLocation = mapLocation;
  };

  return WorldMapEditor;
});