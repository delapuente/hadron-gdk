
define([
  'S',
  'lib/strongforce',
  'tools/helpers/grid/Grid',
  'gfx/textures/Texture',
  'scene/nodes/Node',
  'scene/nodes/geometries/Cuboid',
  'scene/nodes/HObject',
  'formats/hobject/json'
], function (S, strongforce, Grid, Texture, Node, Cuboid, HObject,
             HObject2JSON) {
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
    return newTexture;
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
    var hobject = new HObject({
      nodes: this.primitives,
      textures: this.textures
    });
    return HObject2JSON.serialize(hobject);
  };

  ObjectEditor.prototype.import = function (jsonString) {
    this.clear();

    var hobject = HObject2JSON.deserialize(jsonString);

    hobject.textures.forEach(function (texture) {
      var newTexture = this.addNewTexture(texture.data, texture.name);
      newTexture.setPosition(texture.position);
    }.bind(this));

    hobject.nodes.forEach(function (primitive) {
      this.addNewPrimitive(primitive.getDimensions(), primitive.getPosition());
    }.bind(this));
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
