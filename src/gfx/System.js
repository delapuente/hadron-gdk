
define([
  'S',
  'structures/Graph',
  'lib/pixi',
  'lib/strongforce'
], function (S, Graph, pixi, strongforce) {
  'use strict';

  var EventEmitter = strongforce.EventEmitter;

  function RenderSystem(width, height) {
    EventEmitter.call(this);

    width = typeof width === 'undefined' ? 800 : width;
    height = typeof height === 'undefined' ? 600 : height;

    this._renderer = pixi.autoDetectRenderer(width, height);
    this._stage = new pixi.Stage();
    this._stage.mousedown = this._onStageMouseDown.bind(this);
    this._stage.mousemove = this._onStageMouseMove.bind(this);
    this._activeCamera = new pixi.DisplayObjectContainer();
    this._stage.addChild(this._activeCamera);
    this._layers = [];

    this.centerCamera();

    S.theObject(this).has('view', this._renderer.view);
  }
  S.theClass(RenderSystem).mix(EventEmitter);

  RenderSystem.prototype.NEXT_LAYER_ID = 1;

  RenderSystem.prototype.render = function () {
    this._renderer.render(this._stage);
  };

  RenderSystem.prototype.setBgColor = function (color) {
    this._stage.setBackgroundColor(color);
  };

  RenderSystem.prototype.newLayer = function (name) {
    name = name || 'new-layer-' + this.NEXT_LAYER_ID++;
    var newLayer = new pixi.DisplayObjectContainer();
    newLayer.name = name;
    this._layers.push(newLayer);
    this._activeCamera.addChild(newLayer);
    return newLayer;
  };

  RenderSystem.prototype.getViewport = function () {
    var width = this._renderer.width;
    var height = this._renderer.height;

    var x0 = -this._activeCamera.position.x;
    var y0 = -this._activeCamera.position.y;
    var x1 = x0 + width;
    var y1 = y0 + height;

    return {
      topLeft: [x0, y0],
      topRight: [x1, y0],
      bottomRight: [x1, y1],
      bottomLeft: [x0, y1],
      width: width,
      height: height
    };
  };

  RenderSystem.prototype.resizeViewport = function (dimensions) {
    var oldDimensions = [this._renderer.width, this._renderer.height];
    this._renderer.resize.apply(this._renderer, dimensions);
    var newDimensions = [this._renderer.width, this._renderer.height];
    this.centerCamera([
      this._activeCamera.position.x,
      this._activeCamera.position.y
    ]);
    this.dispatchEvent('viewportDimensionsChanged', {
      oldDimensions: oldDimensions,
      dimensions: newDimensions
    });
    this._dispatchViewportChanged();
  };

  RenderSystem.prototype.centerCamera = function (where) {
    where = where || [0, 0];
    var oldPosition = this.getCameraPosition();
    this._activeCamera.position.x = where[0] + this._renderer.width / 2;
    this._activeCamera.position.y = where[1] + this._renderer.height / 2;
    this.dispatchEvent('viewportMoved', {
      oldPosition: oldPosition,
      position: this.getCameraPosition()
    });
    this._dispatchViewportChanged();
  };

  RenderSystem.prototype.getCameraPosition = function () {
    return [
      this._activeCamera.position.x,
      this._activeCamera.position.y
    ];
  };

  RenderSystem.prototype._dispatchViewportChanged = function () {
    this.dispatchEvent('viewportChanged', {
      dimensions: [this._renderer.width, this._renderer.height],
      position: [this._activeCamera.position.x, this._activeCamera.position.y]
    });
  };

  RenderSystem.prototype._onStageMouseDown = function (evt) {
    this.dispatchEvent('mousedown', {
      coordinates: [evt.global.x, evt.global.y]
    });
  };

  RenderSystem.prototype._onStageMouseMove = function (evt) {
    this.dispatchEvent('mousemove', {
      coordinates: [evt.global.x, evt.global.y]
    });
  };

  RenderSystem.prototype.Graphics = pixi.Graphics;

  RenderSystem.prototype.Texture = pixi.Texture;

  RenderSystem.prototype.Sprite = pixi.Sprite;

  var system;

  return {
    _RenderSystem: RenderSystem,

    getSystem: function (width, height) {
      if (!system) { system = new RenderSystem(width, height); }
      return system;
    }
  };

});
