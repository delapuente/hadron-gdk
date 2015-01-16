
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

  Node.prototype.getGlobalBounds = function () {
    var localBounds = this.getLocalBounds();
    var offset = this.getPosition();
    var globalBounds = {
      min: [
        localBounds.min[0] + offset[0],
        localBounds.min[1] + offset[1],
        localBounds.min[2] + offset[2]
      ],
      max: [
        localBounds.max[0] + offset[0],
        localBounds.max[1] + offset[1],
        localBounds.max[2] + offset[2]
      ]
    };
    ['X', 'Y', 'Z'].forEach(function (axis) {
      var property = 'size' + axis;
      Object.defineProperty(
        globalBounds,
        property,
        Object.getOwnPropertyDescriptor(localBounds, property)
      );
    });
    return globalBounds;
  };

  Node.prototype.intersects = function (anotherNode) {
    var myBoundingBox = this.getGlobalBounds();
    var otherBoundingBox = anotherNode.getGlobalBounds();

    return ['X', 'Y', 'Z'].every(function (axis) {
      return overlap(myBoundingBox, otherBoundingBox, axis);
    });

    function overlap(bb1, bb2, axis) {
      axis = axis.toUpperCase();
      var indices = { X: 0, Y: 1, Z: 2 };
      var property = 'size' + axis;
      var index = indices[axis];
      var minDistance = (bb1[property] + bb2[property])/2;
      var distance = Math.abs(bb1.min[index] - bb2.min[index]);
      return distance < minDistance;
    }

    function isInside(point, boundingBox) {
      return boundingBox.min[0] <= point[0] && point[0] <= boundingBox.max[0] &&
             boundingBox.min[1] <= point[1] && point[1] <= boundingBox.max[1] &&
             boundingBox.min[2] <= point[2] && point[2] <= boundingBox.max[2];
    }
  };


  return Node;

});
