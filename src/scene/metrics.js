define([
], function () {
  'use strict';

  var metrics = {

    distance: function (pointA, pointB) {
      if (pointA.length !== pointB.length) {
        console.warn('Points does not have the same dimension.');
      }
      var diff = pointB.map(function (dimensionValue, dimension) {
        return dimensionValue - pointA[dimension];
      });
      var sum = diff.reduce(function (sum, value) {
        return (value * value) + sum;
      }, 0);
      return Math.sqrt(sum);
    },

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
      var restrictions = '';
      restrictions  = 'x' in planeRestrictions ? 'X' : '';
      restrictions += 'y' in planeRestrictions ? 'Y' : '';
      restrictions += 'z' in planeRestrictions ? 'Z' : '';
      var x = screenCoordinates[0];
      var y = screenCoordinates[1];
      var methodName = 'getMapCoordinatesOver' + restrictions;
      return this[methodName](x, y, planeRestrictions);
    },

    getMapCoordinatesOverY: function (x, y, planeRestrictions) {
      var yPlane = planeRestrictions.y;
      return [
        x/2 + y + yPlane,
        yPlane,
        y + yPlane - x/2
      ];
    },

    getMapCoordinatesOverZ: function (x, y, planeRestrictions) {
      var zPlane = planeRestrictions.z;
      return [
        x + zPlane,
        x/2 + zPlane - y,
        zPlane
      ];
    },

    getMapCoordinatesOverX: function (x, y, planeRestrictions) {
      var xPlane = planeRestrictions.x;
      return [
        xPlane,
        xPlane - x/2 - y,
        xPlane - x
      ];
    },

    getMapCoordinatesOverXY: function (x, y, planeRestrictions) {
      var xPlane = planeRestrictions.x;
      var yPlane = planeRestrictions.y;
      return [
        xPlane,
        yPlane,
        y + yPlane - x/2
      ];
    },

    getMapCoordinatesOverXZ: function (x, y, planeRestrictions) {
      var xPlane = planeRestrictions.x;
      var zPlane = planeRestrictions.z;
      return [
        xPlane,
        (xPlane + zPlane)/2 - y,
        zPlane
      ];
    },

    getMapCoordinatesOverYZ: function (x, y, planeRestrictions) {
      var yPlane = planeRestrictions.y;
      var zPlane = planeRestrictions.z;
      return [
        x/2 + y + yPlane,
        yPlane,
        zPlane
      ];
    },

    getMapCoordinatesOverXYZ: function (x, y, planeRestrictions) {
      return [
        planeRestrictions.x,
        planeRestrictions.y,
        planeRestrictions.z
      ];
    }

  };

  return metrics;
});
