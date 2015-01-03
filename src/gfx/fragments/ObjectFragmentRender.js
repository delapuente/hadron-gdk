
define([
  'S',
  'lib/strongforce',
  'scene/metrics',
  'gfx/System'
], function (S, strongforce, metrics, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;
  var EventEmitter = strongforce.EventEmitter;

  function ObjectFragmentRender(objectFragment, geometryNode, objectNode) {
    Render.apply(this);
    EventEmitter.apply(this);

    this._objectOrigin =
      metrics.getScreenCoordinates(objectNode.getLocalBounds()[0]);

    this._gfxSystem = GfxSystem.getSystem();
    this.graphic = new this._gfxSystem.DisplayObjectContainer();

    objectNode.addEventListener(
      'positionChanged',
      this._onObjectPositionChanged.bind(this)
    );

    this.drawFragment(objectNode, geometryNode);
    this.placeFragment(objectNode.getPosition());
  }
  S.theClass(ObjectFragmentRender).inheritsFrom(Render);
  S.theClass(ObjectFragmentRender).mix(EventEmitter);

  ObjectFragmentRender.prototype._onObjectPositionChanged = function (evt) {
    this.placeFragment(evt.position);
  };

  ObjectFragmentRender.prototype.getLocalBounds = function () {
    return this.graphic.getLocalBounds();
  };

  ObjectFragmentRender.prototype.drawFragment =
  function (objectNode, geometryNode) {
    var p = metrics.getScreenCoordinates.bind(metrics);

    // Base texture
    var texture = objectNode.textures[0];
    var textureLayer = this._gfxSystem.Sprite.fromImage(texture.data);
    textureLayer.position.x = texture.position[0];
    textureLayer.position.y = texture.position[1];

    textureLayer.interactive = true;
    ['over', 'out', 'down', 'up'].forEach(function (action) {
      var eventName = 'mouse' + action;
      this.graphic[eventName] = function (data) {
          this.dispatchEvent(eventName, Object.create(data));
      }.bind(this);
    }.bind(this));

    // Mask
    var maskLayer = new this._gfxSystem.Graphics();
    var screenPosition = p(geometryNode.getPosition());
    var dimensions = geometryNode.getDimensions();
    var sizeX = dimensions[0];
    var sizeY = dimensions[1];
    var sizeZ = dimensions[2];

    maskLayer.position.x = screenPosition[0];
    maskLayer.position.y = screenPosition[1];
    maskLayer.clear();
    maskLayer.lineStyle(0);
    maskLayer.beginFill(0x000000, 1);
    maskLayer.moveTo.apply(maskLayer, p([0,     sizeY, 0]));
    maskLayer.lineTo.apply(maskLayer, p([0,     sizeY, sizeZ]));
    maskLayer.lineTo.apply(maskLayer, p([0,     0,     sizeZ]));
    maskLayer.lineTo.apply(maskLayer, p([sizeX, 0,     sizeZ]));
    maskLayer.lineTo.apply(maskLayer, p([sizeX, 0,     0]));
    maskLayer.lineTo.apply(maskLayer, p([sizeX, sizeY, 0]));

    textureLayer.mask = maskLayer;

    this.graphic.addChild(maskLayer);
    this.graphic.addChild(textureLayer);
  };

  ObjectFragmentRender.prototype.placeFragment = function (position) {
    var screenPosition = metrics.getScreenCoordinates(position);
    var origin = this._objectOrigin;

    this.graphic.position.x = screenPosition[0] - origin[0];
    this.graphic.position.y = screenPosition[1] - origin[1];
  };

  return ObjectFragmentRender;
});
