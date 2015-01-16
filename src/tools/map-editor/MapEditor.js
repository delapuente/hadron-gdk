
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

  function MapEditor(gridSize) {
    Model.call(this);
    S.theObject(this)
      .has('grid', new Grid(gridSize))
      .has('backgrounds', [])
      .has('foregrounds', [])
      .has('regions', [])
      .has('palette', [])
      .has('objects', []);

    this._backgroundColor = 0x000000;
  }
  S.theClass(MapEditor).inheritsFrom(Model);

  MapEditor.prototype.getSubmodels = function () {
    return [this.grid]
      .concat(this.backgrounds)
      .concat(this.foregrounds)
      .concat(this.regions);
  };

  MapEditor.prototype.changeBackgroundColor = function (color) {
    if (typeof color === 'string') {
      color = parseInt(color, 16);
    }
    this._backgroundColor = color;
    this.dispatchEvent('backgroundColorChanged', {
      color: color
    });
  };

  MapEditor.prototype.addNewBackground = function (source, name) {
    var newBackground = Object.create(new Texture(source));
    newBackground.name = name;
    this.textures.push(newBackground);
    this.dispatchEvent('backgroundAdded', {
      background: newBackground
    });
    return newBackground;
  };

  MapEditor.prototype.deleteBackground = function (texture) {
    this.textures.splice(this.textures.indexOf(texture), 1);
    this.dispatchEvent('textureDeleted', {
      texture: texture
    });
  };

  MapEditor.prototype.addNewPrimitive = function (dimensions, position) {
    position = position || [0, 0, 0];
    var newGeometry = new Cuboid(dimensions);
    var geometryNode = S.augment(newGeometry).with(Node, position);
    this.primitives.push(geometryNode);
    this.dispatchEvent('primitiveAdded', {
      node: geometryNode
    });
    return geometryNode;
  };

  MapEditor.prototype.deleteObject = function (hobject) {
    if (this._focusedObject === hobject) {
      this.focusObject(null);
    }
    if (this._selectedObject === hobject) {
      this.selectObject(null);
    }
    this.objects.splice(this.objects.indexOf(hobject), 1);
    this.dispatchEvent('objectRemovedFromMap', {
      node: hobject
    });
  };

  MapEditor.prototype.selectObject = function (hobject) {
    this._selectedObject = hobject;
    this.dispatchEvent('objectSelected', {
      object: hobject
    });
  };

  MapEditor.prototype.focusObject = function (hobject) {
    var lastFocused = this._focusedObject;
    this._focusedObject = hobject;
    this.dispatchEvent('objectFocusChanged', {
      lastObject: lastFocused,
      object: hobject
    });
  };

  MapEditor.prototype.getFocusedObject = function () {
    return this._focusedObject;
  };

  MapEditor.prototype.getSelectedObject = function () {
    return this._selectedObject;
  };

  MapEditor.prototype.canBePlaced = function (hobject) {
    return !this.objects.some(function (anotherObject) {
      return hobject !== anotherObject && hobject.intersects(anotherObject);
    });
  };

  MapEditor.prototype.selectBackground = function (primitive) {
    this._selectedBackground = texture;
    this.dispatchEvent('textureSelected', {
      texture: texture
    });
  };

  MapEditor.prototype.getSelectedBackground = function () {
    return this._selectedBackground;
  };

  MapEditor.prototype.setGridSize = function (newDimensions) {
    this._grid.setDimensions(newDimensions);
  };

  MapEditor.prototype.importObject = function (jsonString) {
    var hobject = HObject2JSON.deserialize(jsonString);
    this.addToPalette(hobject);
  };

  MapEditor.prototype.addToPalette = function (hobject) {
    this.palette.push(hobject);
    this.dispatchEvent('objectAddedToPalette', {
      object: hobject
    });
  };

  MapEditor.prototype.addToMap = function (paletteIndex, position) {
    position = position || [0, 0, 0];
    var hobject = this.palette[paletteIndex];
    var objectNode = S.augment(hobject).with(Node, position);
    this.objects.push(objectNode);
    this.dispatchEvent('objectAddedToMap', {
      node: objectNode
    });
  };

  MapEditor.prototype.import = function (simple) {
    this.clear();

    simple.textures.forEach(function (texture) {
      var newTexture = this.addNewTexture(texture.data, texture.name);
      newTexture.setPosition(texture.position);
    }.bind(this));

    simple.nodes.forEach(function (primitive) {
      this.addNewPrimitive(primitive.dimensions, primitive.position);
    }.bind(this));
  };

  MapEditor.prototype.clear = function () {
    var textures = this.textures.slice(0);
    textures.forEach(function (texture) {
      this.deleteTexture(texture);
    }.bind(this));
    var primitives = this.primitives.slice(0);
    primitives.forEach(function (primitive) {
      this.deleteObject(primitive);
    }.bind(this));
  };


  return MapEditor;
});
