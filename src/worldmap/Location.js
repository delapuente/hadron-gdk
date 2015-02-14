
define([
  'S',
  'lib/strongforce',
  'scene/metrics'
], function (S, strongforce, metrics) {
  'use strict';

  var Model = strongforce.Model;

  function Location(position, name) {
    Model.apply(this, arguments);
    S.theObject(this)
      .has('_name', '')
      .has('_populated', true);

    this.setPosition(position);
    this.setName(name);
    this.setPopulated(true);
  }
  S.theClass(Location).inheritsFrom(Model);

  Location.prototype.distance = function (point) {
    return metrics.distance(this.getPosition(), point);
  };

  Location.prototype.getPosition = function () {
    if (!this._position) { return null; }
    return [
      this._position[0],
      this._position[1]
    ];
  };

  Location.prototype.setPosition = function (newPosition) {
    var oldPosition = this.getPosition();
    this._position = newPosition;
    this.dispatchEvent('positionChanged', {
      oldPosition: oldPosition,
      position: this.getPosition()
    });
  };

  Location.prototype.getName = function () {
    if (!this._name) { return null; }
    return this._name;
  };

  Location.prototype.setName = function (newName) {
    var oldName = this.getName();
    this._name = newName;
    this.dispatchEvent('nameChanged', {
      oldName: oldName,
      name: this.getName()
    });
  };

  Location.prototype.isPopulated = function () {
    return !!this._populated;
  };

  Location.prototype.setPopulated = function (populated) {
    this._populated = populated;
    this.dispatchEvent('isPopulatedChanged', {
      populated: this._populated
    });
  };

  return Location;
});
