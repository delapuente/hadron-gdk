
define([
  'S',
  'lib/strongforce',
  'gfx/fragments/CuboidFragment',
  'gfx/fragments/ObjectFragmentRender'
], function (S, strongforce, CuboidFragment, ObjectFragmentRender) {
  'use strict';

  var Model = strongforce.Model;

  function ObjectPartialGeometry(objectNode, primitiveNode) {
    Model.apply(this);
    this._objectNode = objectNode;
    this._primitiveNode = primitiveNode;
    // TODO: refine to not proxy all events, just those needed
    this.proxyEventsFrom(objectNode);
    this.proxyEventsFrom(primitiveNode);
  }
  S.theClass(ObjectPartialGeometry).inheritsFrom(Model);

  ObjectPartialGeometry.prototype.getLocalPosition = function () {
    return this._primitiveNode.getPosition();
  };

  ObjectPartialGeometry.prototype.getPosition = function () {
    var objectPosition = this._objectNode.getPosition();
    var localOffset = this._primitiveNode.getPosition();
    return [
      objectPosition[0] + localOffset[0],
      objectPosition[1] + localOffset[1],
      objectPosition[2] + localOffset[2]
    ];
  };

  ObjectPartialGeometry.prototype.getDimensions = function () {
    return this._primitiveNode.getDimensions();
  };

  // TODO: Make 3rd parameter to be only visual data
  function ObjectFragment(node, cuboidGeometry, objectNode) {
    CuboidFragment.call(this, node, cuboidGeometry, objectNode);
    this.proxyEventsFrom(objectNode);
  }
  S.theClass(ObjectFragment).inheritsFrom(CuboidFragment);

  ObjectFragment.getFragments = function (objectNode) {
    return objectNode.nodes.map(function (primitiveNode) {
      var partialGeometry =
        new ObjectPartialGeometry(objectNode, primitiveNode);

      return new ObjectFragment(objectNode, partialGeometry, objectNode);
    });
  };

  ObjectFragment.prototype.render = ObjectFragmentRender;

  return ObjectFragment;
});
