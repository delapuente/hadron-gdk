
define([
  'S',
  'lib/strongforce'
], function (S, strongforce) {
  'use strict';

  var EventEmitter = strongforce.EventEmitter;

  function Node(position, owner) {
    owner = owner || null;
    EventEmitter.call(this);
    S.theObject(this).has('owner', owner);
    this.setPosition(position);
  }
  S.theClass(Node).mix(EventEmitter);

  Node.prototype.getPosition = function () {
    if (!this._position) { return null; }
    return [
      this._position[0],
      this._position[1],
      this._position[2]
    ];
  };

  Node.prototype.setPosition = function (newPosition) {
    var oldPosition = this.getPosition();
    this._position = newPosition;
    this.dispatchEvent('positionChanged', {
      oldPosition: oldPosition,
      position: this.getPosition()
    });
  };

  return Node;

});
