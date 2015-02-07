define([
], function () {
  'use strict';

  function dimensionWarn() {
    console.log('Items are of different dimensions!');
  }

  var metrics = {

    mul: function (scalar, v) {
      return v.map(function (value) { return scalar * value;  });
    },

    add: function (v, w) {
      if (v.length !== w.length) { dimensionWarn(); }
      return v.map(function (value, d) { return value + w[d]; });
    },

    sub: function (v, w) {
      return this.add(v, this.mul(-1, w));
    },

    dot: function (v, w) {
      if (v.length !== w.length) { dimensionWarn(); }
      return v.reduce(function (partial, _, d) {
        return partial + (v[d] * w[d]);
      }, 0);
    },

    distance: function (pointA, pointB) {
      if (pointA.length !== pointB.length) { dimensionWarn(); }
      var diff = this.sub(pointB, pointA);
      var squaredDistance = this.dot(diff, diff);
      return Math.sqrt(squaredDistance);
    },

    segmentDistance: function (segment, p) {
      var v = segment[0]; // start
      var w = segment[1]; // end
      var vw = this.sub(w, v); // (w-v)
      var squaredLength = this.dot(vw, vw);
      // XXX: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
      // Consider the line extending the segment, parameterized as v + t(w - v)
      // We find projection of point p onto the line.
      // It falls where t = -[(p-v) . (w-v)] / |w-v|^2
      // The expression is negated due to the inversion of Y axis
      var t = -this.dot(this.sub(v, p), vw) / squaredLength;
      if (t < 0) { return this.distance(v, p);  }
      if (t > 1) { return this.distance(w, p);  }
      var projection = this.add(v, this.mul(t, vw));
      return this.distance(p, projection);
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
