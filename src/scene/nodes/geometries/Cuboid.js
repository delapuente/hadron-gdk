
define([
  'S',
  'scene/nodes/geometries/Geometry',
  'scene/nodes/geometries/CuboidRender'
], function (S, Geometry, CuboidRender) {
  'use strict';

  function Cuboid(dimensions) {
    Geometry.apply(this, arguments);
    this.setDimensions(dimensions);
  }
  S.theClass(Cuboid).inheritsFrom(Geometry);

  Cuboid.prototype.render = CuboidRender;

  Cuboid.prototype.getDimensions = function () {
    if (!this._dimensions) { return null; }
    return [
      this._dimensions[0],
      this._dimensions[1],
      this._dimensions[2]
    ];
  };

  Cuboid.prototype.setDimensions = function (newDimensions) {
    var oldDimensions = this.getDimensions();
    this._dimensions = [
      newDimensions[0],
      newDimensions[1],
      newDimensions[2]
    ];
    this.dispatchEvent('dimensionsChanged', {
      oldDimensions: oldDimensions,
      dimensions: this.getDimensions()
    });
  };

  return Cuboid;
});
