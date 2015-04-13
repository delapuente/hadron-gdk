
define([
  'S',
  'tools/mixins/UIMode',
  'worldmap/Location',
  'gfx/worldmap/LandMark'
], function (S, UIMode, Location, LandMark) {
  'use strict';

  function PlacePartyMode(control, model, partyLayer) {
    UIMode.call(this, control);
    this._model = model;
    this._party = new Location([0, 0], 'party');
    this._partyLandmark = new LandMark(this._party);
    this._partyLandmark.hide();
    this._partyLandmark.setColor(0x9E6700);
    partyLayer.addChild(this._partyLandmark.render.graphic);
  }
  S.theClass(PlacePartyMode).inheritsFrom(UIMode);

  PlacePartyMode.prototype.onclick = function (evt) {
    var descriptor;
    var point = evt.viewportCoordinates;
    var nearestLocation = this._model.getNearLocation(point);
    if (nearestLocation) {
      if (this._currentLocation === nearestLocation) {
        this._partyLandmark.hide();
        this._currentLocation = null;
      }
      else {
        this._party.setPosition(nearestLocation.getPosition());
        this._partyLandmark.show();
        this._currentLocation = nearestLocation;
      }
    }
  };

  return PlacePartyMode;
});
