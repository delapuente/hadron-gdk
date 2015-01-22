
define([
  'S',
  'lib/strongforce',
  'tools/helpers/grid/Grid',
  'gfx/textures/Texture',
  'scene/nodes/Node',
  'scene/nodes/geometries/Cuboid',
  'formats/hobject/json'
], function (S, strongforce, Grid, Texture, Node, Cuboid, HObject2JSON) {
  'use strict';

  var Model = strongforce.Model;

  function WorldMapEditor(gridSize) {
    Model.call(this);
    S.theObject(this)
      .has('background', null)
      .has('locations', [])
      .has('paths', []);

    this._backgroundColor = 0xFFFFFF;
  }
  S.theClass(WorldMapEditor).inheritsFrom(Model);

  WorldMapEditor.prototype.setBackground = function (backgroundData) {
    this.background = backgroundData;
    this.dispatchEvent('backgroundSet', {
      data: backgroundData
    });
  };

  return WorldMapEditor;
});
