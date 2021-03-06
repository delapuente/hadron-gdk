
define([
  'S',
  'tools/mixins/UIMode',
  'gfx/worldmap/LandMark'
], function (S, UIMode, LandMark) {
  'use strict';

  function LocationMode(control, model, locationsLayer) {
    UIMode.call(this, control);
    this._model = model;
    this._locationsLayer = locationsLayer;

    this._model.addEventListener('locationAdded', this._addLocation.bind(this));
    this._model
      .addEventListener('locationRemoved', this._delLocation.bind(this));
  }
  S.theClass(LocationMode).inheritsFrom(UIMode);

  LocationMode.prototype.onmousedown = function (evt) {
    this.startFlow('placing-location');
    var point = evt.viewportCoordinates;
    var mapLocation = this._model.getNearLocation(point, 10);
    if (mapLocation) {
      this._model.selectLocation(mapLocation);
    }
    else {
      var name = prompt('Location name:');
      if (name) {
        mapLocation = this._model.newMapLocation(point, name);
      }
      // XXX: when using prompt, the onmouseup event is lost
      this.onmouseup();
    }
  };

  LocationMode.prototype.onmouseup = function () {
    this._model.selectLocation(null);
    this.endFlow('placing-location');
  };

  LocationMode.prototype.onmousemove = function (evt) {
    var currentPointerCoordinates = evt.viewportCoordinates;
    if (this._model.selectedLocation) {
      this._model.selectedLocation.setPosition(currentPointerCoordinates);
    }
  };

  LocationMode.prototype._addLocation = function (evt) {
    var landmark = new LandMark(evt.mapLocation);
    evt.mapLocation.__landmark = landmark; // TODO: maps needed!!
    this._locationsLayer.addChild(landmark.render.graphic);
  };

  LocationMode.prototype._delLocation = function (evt) {
    var landmark = evt.mapLocation.__landmark;
    this._locationsLayer.removeChild(landmark.render.graphic);
  };

  return LocationMode;
});
