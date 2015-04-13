
define([
  'S',
  'lib/strongforce',
  'gfx/worldmap/LandMarkRender'
], function (S, strongforce, LandMarkRender) {
  'use strict';

  var Model = strongforce.Model;

  function LandMark(mapLocation) {
    Model.apply(this, arguments);
    this._mapLocation = mapLocation;
    this.proxyEventsFrom(mapLocation);
  }
  S.theClass(LandMark).inheritsFrom(Model);

  LandMark.prototype.show = function () {
    this.dispatchEvent('visibilityChange', { visibility: true });
  };

  LandMark.prototype.hide = function () {
    this.dispatchEvent('visibilityChange', { visibility: false });
  };

  LandMark.prototype.setColor = function (color) {
    this.dispatchEvent('colorChange', { color: color });
  };

  LandMark.prototype.render = LandMarkRender;

  return LandMark;
});
