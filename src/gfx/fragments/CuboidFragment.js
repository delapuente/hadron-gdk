
define([
  'S',
  'lib/strongforce',
  'gfx/fragments/CuboidFragmentRender'
], function (S, strongforce, CuboidFragmentRender) {
  'use strict';

  var Model = strongforce.Model;

  function CuboidFragment(cuboidNode) {
    Model.apply(this, arguments);
    this.proxyEventsFrom(cuboidNode);
    S.theObject(this).has('cuboid', cuboidNode);
  }
  S.theClass(CuboidFragment).inheritsFrom(Model);

  CuboidFragment.prototype.render = CuboidFragmentRender;

  return CuboidFragment;
});
