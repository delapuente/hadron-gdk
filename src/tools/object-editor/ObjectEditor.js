
define([
  'S',
  'lib/strongforce',
  'tools/helpers/grid/Grid',
  'gfx/textures/Texture',
  'scene/nodes/Node',
  'scene/nodes/geometries/Cuboid'
], function (S, strongforce, Grid, Texture, Node, Cuboid) {
  'use strict';

  var Model = strongforce.Model;

  function ObjectEditor(gridSize) {
    Model.call(this);
    S.theObject(this)
      .has('grid', new Grid(gridSize))
      .has('textures', [])
      .has('primitives', []);
  }
  S.theClass(ObjectEditor).inheritsFrom(Model);

  ObjectEditor.prototype.getSubmodels = function () {
    return [this.grid].concat(this.textures).concat(this.primitives);
  };

  ObjectEditor.prototype.addNewTexture = function (source, name) {
    var newTexture = Object.create(new Texture(source));
    newTexture.name = name;
    this.textures.push(newTexture);
    this.dispatchEvent('textureAdded', {
      texture: newTexture
    });
  };

  ObjectEditor.prototype.deleteTexture = function (texture) {
    this.textures.splice(this.textures.indexOf(texture), 1);
    this.dispatchEvent('textureDeleted', {
      texture: texture
    });
  };

  ObjectEditor.prototype.addNewPrimitive = function (dimensions, position) {
    position = position || [0, 0, 0];
    var newGeometry = new Cuboid(dimensions);
    var geometryNode = S.augment(newGeometry).with(Node, position);
    this.primitives.push(geometryNode);
    this.dispatchEvent('primitiveAdded', {
      node: geometryNode
    });
    return geometryNode;
  };

  ObjectEditor.prototype.deletePrimitive = function (primitive) {
    if (this._focusedPrimitive === primitive) {
      this.focusPrimitive(null);
    }
    if (this._selectedPrimitive === primitive) {
      this.selectPrimitive(null);
    }
    this.primitives.splice(this.primitives.indexOf(primitive), 1);
    this.dispatchEvent('primitiveDeleted', {
      node: primitive
    });
  };

  ObjectEditor.prototype.selectPrimitive = function (primitive) {
    this._selectedPrimitive = primitive;
    this.dispatchEvent('primitiveSelected', {
      primitive: primitive
    });
  };

  ObjectEditor.prototype.focusPrimitive = function (primitive) {
    var lastFocused = this._focusedPrimitive;
    this._focusedPrimitive = primitive;
    this.dispatchEvent('primitiveFocusChanged', {
      lastPrimitive: lastFocused,
      primitive: primitive
    });
  };

  ObjectEditor.prototype.getFocusedPrimitive = function () {
    return this._focusedPrimitive;
  };

  ObjectEditor.prototype.getSelectedPrimitive = function () {
    return this._selectedPrimitive;
  };

  ObjectEditor.prototype.selectTexture = function (primitive) {
    this._selectedTexture = texture;
    this.dispatchEvent('textureSelected', {
      texture: texture
    });
  };

  ObjectEditor.prototype.getSelectedTexture = function () {
    return this._selectedTexture;
  };

  ObjectEditor.prototype.setGridSize = function (newDimensions) {
    this._grid.setDimensions(newDimensions);
  };

  ObjectEditor.prototype.serializeObject = function ( ) {
    var simple = {
      nodes:       [],
      textures:    [],
      __class__:   'HObject',
      __version__: '1.0'
    };

    // Save nodes
    this.primitives.forEach(function (primitive) {
      simple.nodes.push({
        position: primitive.getPosition(),
        dimensions: primitive.getDimensions()
      });
    });

    // Save textures
    this.textures.forEach(function (texture) {
      simple.textures.push({
        name: texture.name,
        position: texture.getPosition(),
        data: texture.getSourceData()
      });
    });

    return JSON.stringify(simple);
  };

  ObjectEditor.prototype.clear = function () {
    var textures = this.textures.slice(0);
    textures.forEach(function (texture) {
      this.deleteTexture(texture);
    }.bind(this));
    var primitives = this.primitives.slice(0);
    primitives.forEach(function (primitive) {
      this.deletePrimitive(primitive);
    }.bind(this));
  };

  return ObjectEditor;
});
