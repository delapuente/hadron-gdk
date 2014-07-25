define([
], function () {
  'use strict';

  var metrics = {

    getScreenCoordinates: function (mapCoordinates) {
      var x = mapCoordinates[0];
      var y = mapCoordinates[1];
      var z = mapCoordinates[2];
      return [
        x - z,
        (x + z)/2 - y
      ];
    },

    getMapCoordinates: function (screenCoordinates, planeRestrictions) {
      planeRestrictions = planeRestrictions || { y: 0 };
      var restriction = Object.keys(planeRestrictions)[0];
      var x = screenCoordinates[0];
      var y = screenCoordinates[1];
      var methodName = 'getMapCoordinatesOver' + restriction.toUpperCase();
      return this[methodName](x, y, planeRestrictions[restriction]);
    },

    getMapCoordinatesOverY: function (x, y, yPlane) {
      return [
        x/2 + y + yPlane,
        yPlane,
        y + yPlane - x/2
      ];
    },

    getMapCoordinatesOverZ: function (x, y, zPlane) {
      return [
        x + zPlane,
        x/2 + zPlane - y,
        zPlane
      ];
    },

    getMapCoordinatesOverX: function (x, y, xPlane) {
      return [
        xPlane,
        xPlane - x/2 - y,
        xPlane - x
      ];
    }

  };

  return metrics;
});
