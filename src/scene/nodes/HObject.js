
define([
], function () {
  'use strict';

  function HObject(parameters) {
    parameters = parameters || {};
    this.nodes = parameters.nodes || [];
    this.textures = parameters.textures || [];
  }

  HObject.prototype.getLocalBounds = function () {
    var minX, minY, minZ;
    var maxX, maxY, maxZ;

    minX = minY = minZ = Infinity;
    maxX = maxY = maxZ = -Infinity;

    this.nodes.forEach(function (node) {
      var nodePos = node.getPosition();
      var nodeDim = node.getDimensions();
      minX = Math.min(minX, nodePos[0]);
      minY = Math.min(minY, nodePos[1]);
      minZ = Math.min(minZ, nodePos[2]);
      maxX = Math.max(maxX, nodePos[0] + nodeDim[0]);
      maxY = Math.max(maxY, nodePos[1] + nodeDim[1]);
      maxZ = Math.max(maxZ, nodePos[2] + nodeDim[2]);
    });

    return {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      get sizeX() { return this.max[0] - this.min[0]; },
      get sizeY() { return this.max[1] - this.min[1]; },
      get sizeZ() { return this.max[2] - this.min[2]; }
    };
  };

  return HObject;
});
