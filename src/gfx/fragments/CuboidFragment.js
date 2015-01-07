
define([
  'S',
  'lib/strongforce',
  'gfx/fragments/CuboidFragmentRender'
], function (S, strongforce, CuboidFragmentRender) {
  'use strict';

  var Model = strongforce.Model;

  // TODO: Now this is the base for all derivated fragments but we should
  // generalize to Fragment when needed.
  //
  // At most, the only things a fragment should know are:
  //   * The logical node that the fragment makes reference
  //   * The information for spatial calculations (geometryData)
  //   * The information for visualization (visualizationData).
  function CuboidFragment(node, cuboidGeometry) {
    Model.apply(this, arguments);
    S.theObject(this)
      .has('node', node) // XXX: maybe this knowledge should be removed?
      .has('cuboidGeometry', cuboidGeometry);

    var onGeometryChanged = this._onGeometryChanged.bind(this);
    cuboidGeometry.addEventListener('positionChanged', onGeometryChanged);
    cuboidGeometry.addEventListener('dimensionsChanged', onGeometryChanged);
  }
  S.theClass(CuboidFragment).inheritsFrom(Model);

  CuboidFragment.prototype.render = CuboidFragmentRender;

  CuboidFragment.prototype._onGeometryChanged = function () {
    this.dispatchEvent('fragmentChanged');
  };

  // XXX: assumes the other geometry is a cuboid
  CuboidFragment.prototype.getOverlapped = function (anotherFragment) {
    var X = 0, Y = 1, Z = 2;
    var primitiveA = this.cuboidGeometry;
    var primitiveB = anotherFragment.cuboidGeometry;

    var aBack = primitiveA.getPosition(),
        aDimensions = primitiveA.getDimensions(),
        aFront = [
          aBack[X] + aDimensions[X],
          aBack[Y] + aDimensions[Y],
          aBack[Z] + aDimensions[Z]
        ],
        bBack = primitiveB.getPosition(),
        bDimensions = primitiveB.getDimensions(),
        bFront = [
          bBack[X] + bDimensions[X],
          bBack[Y] + bDimensions[Y],
          bBack[Z] + bDimensions[Z]
        ];

    var overlapped;

    if (
      overlaps(
       [aBack[X] - aFront[Z], aFront[X] - aBack[Z]],
       [bBack[X] - bFront[Z], bFront[X] - bBack[Z]]
      ) &&
      overlaps(
       [aBack[X] - aFront[Y], aFront[X] - aBack[Y]],
       [bBack[X] - bFront[Y], bFront[X] - bBack[Y]]
      ) &&
      overlaps(
       [-aFront[Z] + aBack[Y], -aBack[Z] + aFront[Y]],
       [-bFront[Z] + bBack[Y], -bBack[Z] + bFront[Y]]
      )
    ) {
      if (aFront[X] <= bBack[X] ||
          aFront[Z] <= bBack[Z] ||
          aFront[Y] <= bBack[Y])
      {
        overlapped = this;
      }

      if (bFront[X] <= aBack[X] ||
          bFront[Z] <= aBack[Z] ||
          bFront[Y] <= aBack[Y])
      {
        overlapped = anotherFragment;
      }
    }

    function overlaps(intervalA, intervalB) {
      return intervalA[1] >= intervalB[0] && intervalB[1] >= intervalA[0];
    }

    return overlapped;
  };

  return CuboidFragment;
});
