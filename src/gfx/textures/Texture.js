
define([
  'S',
  'lib/strongforce',
  'gfx/textures/TextureRender'
], function (S, strongforce, TextureRender) {
  'use strict';

  var Model = strongforce.Model;

  function Texture(source) {
    Model.apply(this, arguments);
    this._source = source;
    this.setPosition([0, 0]);
  }
  S.theClass(Texture).inheritsFrom(Model);

  Texture.prototype.render = TextureRender;

  Texture.prototype.getPosition = function () {
    if (!this._position) { return null; }
    return [
      this._position[0],
      this._position[1]
    ];
  };

  Texture.prototype.setPosition = function (newPosition) {
    var oldPosition = this.getPosition();
    this._position = [newPosition[0], newPosition[1]];
    this.dispatchEvent('positionChanged', {
      oldPosition: oldPosition,
      position: this.getPosition()
    });
  };

  return Texture;
});
