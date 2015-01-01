
define([
  'S',
  'lib/strongforce',
  'gfx/fragments/CuboidFragment',
  'gfx/fragments/ObjectFragmentRender'
], function (S, strongforce, CuboidFragment, ObjectFragmentRender) {
  'use strict';

  var Model = strongforce.Model;

  function ObjectFragment(geometryNode, objectNode) {
    CuboidFragment.call(this, geometryNode, objectNode); //XXX: Rethink this!
    S.theObject(this).has('geometryNode', geometryNode);
  }
  S.theClass(ObjectFragment).inheritsFrom(CuboidFragment);

  ObjectFragment.prototype.render = ObjectFragmentRender;

  return ObjectFragment;
});
