
define([
], function () {
  'use strict';

  function WorldMap(parameters) {
    parameters = parameters || {};
    this.locations = parameters.locations || [];
    this.paths = parameters.paths || [];
  }

  WorldMap.prototype.getNearLocation = function (mapPoint, radio) {
    radio = radio || 10;
    var nearestLocation = null;
    this.locations.reduce(function (minDistance, mapLocation) {
      var distance = mapLocation.distance(mapPoint);
      if (distance < radio && distance < minDistance) {
        minDistance = distance;
        nearestLocation = mapLocation;
      }
      return minDistance;
    }, Infinity);
    return nearestLocation;
  };

  WorldMap.prototype.getNearPath = function (mapPoint, radio) {
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

  WorldMap.prototype.getPathsForLocation = function (mapLocation) {
    return this.paths.filter(function (path) {
      return path.includes(mapLocation);
    });
  };

  return WorldMap;
});
