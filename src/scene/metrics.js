define([
], function () {
  'use strict';

  var DIMETRIC_ANGLE = Math.atan(0.5);
  // TODO: And this??
  var SCALE_FACTOR = Math.sqrt(10) / 4;

  var metrics = {
    DIMETRIC_ANGLE: DIMETRIC_ANGLE,
    SCALE_FACTOR: SCALE_FACTOR,
    SCREEN_SCALE_FACTOR: 1 / (2 * SCALE_FACTOR),
    SIN: Math.sin(DIMETRIC_ANGLE),
    COS: Math.cos(DIMETRIC_ANGLE),

    getScreenCoordinates: function (mapCoordinates) {
      var x = mapCoordinates[0];
      var y = mapCoordinates[1];
      var z = mapCoordinates[2];
      return [
        this.COS * this.SCALE_FACTOR * (x - z),
        this.SIN * this.SCALE_FACTOR * (x + z) - y
      ];
    },

    getMapCoordinates: function (screenCoordinates, height) {
      var x = screenCoordinates[0];
      var y = screenCoordinates[1];
      height = height || 0;
      return [
        this.SCREEN_SCALE_FACTOR * (x/this.COS + (y+height)/this.SIN),
        -height,
        this.SCREEN_SCALE_FACTOR * ((y+height)/this.SIN - x/this.COS)
      ];
    }
  };

  return metrics;
});
