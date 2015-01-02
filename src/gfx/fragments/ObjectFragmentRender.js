
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

    this._gfxSystem = GfxSystem.getSystem();
    this.graphic = new this._gfxSystem.DisplayObjectContainer();
    var texture = objectNode.textures[0];
    var textureLayer =
      this._gfxSystem.Sprite.fromImage(texture.data);
    textureLayer.position.x = texture.position[0];
    textureLayer.position.y = texture.position[1];
    var maskLayer = new this._gfxSystem.Graphics();
    this.graphic.addChild(maskLayer);
    this.graphic.addChild(textureLayer);

    var p = metrics.getScreenCoordinates.bind(metrics);
    var pos = geometryNode.getPosition();
    var dim = geometryNode.getDimensions();
    var screenPosition = p(pos);
    maskLayer.position.x = screenPosition[0];
    maskLayer.position.y = screenPosition[1];
    maskLayer.clear();
    maskLayer.lineStyle(0);
    maskLayer.beginFill(0x000000, 1);
    maskLayer.moveTo.apply(maskLayer, p([0, dim[1], 0]));
    maskLayer.lineTo.apply(maskLayer, p([0, dim[1], dim[2]]));
    maskLayer.lineTo.apply(maskLayer, p([0, 0, dim[2]]));
    maskLayer.lineTo.apply(maskLayer, p([dim[0], 0, dim[2]]));
    maskLayer.lineTo.apply(maskLayer, p([dim[0], 0, 0]));
    maskLayer.lineTo.apply(maskLayer, p([dim[0], dim[1], 0]));


    textureLayer.mask = maskLayer;

    var farthestPoint = objectNode.getLocalBounds()[0];
    var offset = p(farthestPoint);

    this.graphic.position.x -= offset[0];
    this.graphic.position.y -= offset[1];
  }
  S.theClass(ObjectFragmentRender).inheritsFrom(Render);
  S.theClass(ObjectFragmentRender).mix(EventEmitter);

  ObjectFragmentRender.prototype._onDimensionsChanged = function (evt) {
    this.drawSection(evt.dimensions);
  };

  ObjectFragmentRender.prototype._onPositionChanged = function (evt) {
    this.placeSection(evt.position);
  };

  ObjectFragmentRender.prototype.getLocalBounds = function () {
    return this.graphic.getLocalBounds();
  };

  ObjectFragmentRender.prototype.drawSection = function (dimensions) {
    var sizeX = dimensions[0];
    var sizeY = dimensions[1];
    var sizeZ = dimensions[2];

    var p = metrics.getScreenCoordinates.bind(metrics);
    var graphic = this.graphic;
    graphic.clear();

    // Draw inner lines
    graphic.lineStyle(2, 0x000000, 1.0);
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));

    // Bottom
    graphic.beginFill(this.FRONT_COLOR);
    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, 0]));

    // Front, rear and left side
    graphic.lineStyle(0);
    graphic.beginFill(this.FRONT_COLOR);
    graphic.moveTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));

    graphic.moveTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, 0, 0]));

    graphic.moveTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([0, 0, 0]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.endFill();

    // Top
    graphic.beginFill(this.UP_COLOR);
    graphic.moveTo.apply(graphic, p([0, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));
    graphic.endFill();

    // Right side
    graphic.beginFill(this.SIDE_COLOR);
    graphic.moveTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.endFill();

    // Contour
    graphic.lineStyle(2, 0x333333, 1.0);
    graphic.moveTo.apply(graphic, p([0, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, sizeY, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, 0]));
    graphic.lineTo.apply(graphic, p([sizeX, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, 0, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, sizeZ]));
    graphic.lineTo.apply(graphic, p([0, sizeY, 0]));

    graphic.updateLocalBounds();
    graphic.hitArea = graphic.getLocalBounds();
  };

  ObjectFragmentRender.prototype.placeSection = function (position) {
    var screenPosition = metrics.getScreenCoordinates(position);
    var localOffset =
      metrics.getScreenCoordinates(this._geometryNode.getPosition());
    this.graphic.position.x = screenPosition[0] + localOffset[0];
    this.graphic.position.y = screenPosition[1] + localOffset[1];
  };

  return ObjectFragmentRender;
});
