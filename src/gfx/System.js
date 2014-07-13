
define([
  'S',
  'lib/pixi',
  'lib/strongforce'
], function (S, pixi, strongforce) {
  'use strict';

  var EventEmitter = strongforce.EventEmitter;

  function RenderSystem(width, height) {
    EventEmitter.call(this);

    width = typeof width === 'undefined' ? 800 : width;
    height = typeof height === 'undefined' ? 600 : height;

    this._renderer = pixi.autoDetectRenderer(width, height);
    this._stage = new pixi.Stage();
    this._activeCamera = new pixi.DisplayObjectContainer();
    this.centerCamera();
    this._stage.addChild(this._activeCamera);
    this._layers = [];

    S.theObject(this).has('view', this._renderer.view);
  }
  S.theClass(RenderSystem).mix(EventEmitter);

  RenderSystem.prototype.render = function () {
    this._renderer.render(this._stage);
  };

  RenderSystem.prototype.setBgColor = function (color) {
    this._stage.setBackgroundColor(color);
  };

  RenderSystem.prototype.newLayer = function () {
    var newLayer = new pixi.DisplayObjectContainer();
    this._layers.push(newLayer);
    this._activeCamera.addChild(newLayer);
    return newLayer;
  };

  RenderSystem.prototype.add = function (object) {
    this._activeCamera.addChild(object);
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
    var oldPosition = [
      this._activeCamera.position.x,
      this._activeCamera.position.y
    ];
    this._activeCamera.position.x = where[0] + this._renderer.width / 2;
    this._activeCamera.position.y = where[1] + this._renderer.height / 2;
    this.dispatchEvent('viewportMoved', {
      oldPosition: oldPosition,
      position: [
        this._activeCamera.position.x,
        this._activeCamera.position.y
      ]
    });
    this._dispatchViewportChanged();
  };

  RenderSystem.prototype._dispatchViewportChanged = function () {
    this.dispatchEvent('viewportChanged', {
      dimensions: [this._renderer.width, this._renderer.height],
      position: [this._activeCamera.position.x, this._activeCamera.position.y]
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
