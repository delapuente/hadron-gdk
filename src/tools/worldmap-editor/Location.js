
define([
  'S',
  'lib/strongforce',
  'tools/worldmap-editor/LocationRender'
], function (S, strongforce, LocationRender) {
  'use strict';

  var Model = strongforce.Model;

  // XXX: Maybe this class end outside world editor as it is convenient to
  // have named nodes.
  function Location(position, name) {
    Model.apply(this, arguments);
    S.theObject(this)
      .has('name', null);

    this.setPosition(position);
    this.setName(name);
  }
  S.theClass(Location).inheritsFrom(Model);

  Location.prototype.render = LocationRender;

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
      name: this.getName
    });
  };

  return Location;
});
