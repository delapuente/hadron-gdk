
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
    // TODO: I don't like this design. Maybe fragments should know nothing about
    // nodes. They are in different abstraction (visual vs logical) layers.
    // These relationships should be modelled apart as glue.
    S.theObject(this).has('objectNode', objectNode);
  }
  S.theClass(ObjectFragment).inheritsFrom(CuboidFragment);

  ObjectFragment.prototype.render = ObjectFragmentRender;

  return ObjectFragment;
});
