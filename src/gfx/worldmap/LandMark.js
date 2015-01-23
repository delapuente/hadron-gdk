
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

  LandMark.prototype.render = LandMarkRender;

  return LandMark;
});
