
define([
  'S',
  'lib/strongforce',
  'gfx/System'
], function (S, strongforce, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;
  var EventEmitter = strongforce.EventEmitter;

  function TextureRender(texture, source) {
    Render.call(this);
    EventEmitter.call(this);
    this._texture = texture;
    this._texture
      .addEventListener('positionChanged', this._updatePosition.bind(this));
    this._gfxSystem = GfxSystem.getSystem();
    this.graphic = new this._gfxSystem.Sprite.fromImage(source);
    this.graphic.interactive = true;
    this.graphic.mouseover = this._dispatchOverTheTexture.bind(this);
    this.graphic.mouseout = this._dispatchLeavingTheTexture.bind(this);
    this.graphic.mousedown = this._dispatchClickTheTexture.bind(this);
    this.graphic.mouseup = this._dispatchReleaseTheTexture.bind(this);
  }
  S.theClass(TextureRender).inheritsFrom(Render);
  S.theClass(TextureRender).mix(EventEmitter);

  TextureRender.prototype._updatePosition = function (evt) {
    this.graphic.position.x = evt.position[0];
    this.graphic.position.y = evt.position[1];
  };

  TextureRender.prototype._dispatchOverTheTexture = function (data) {
    this.dispatchEvent('mouseover', Object.create(data));
  };

  TextureRender.prototype._dispatchLeavingTheTexture = function (data) {
    this.dispatchEvent('mouseout', Object.create(data));
  };

  TextureRender.prototype._dispatchClickTheTexture = function (data) {
    this.dispatchEvent('mousedown', Object.create(data));
  };

  TextureRender.prototype._dispatchReleaseTheTexture = function (data) {
    this.dispatchEvent('mouseup', Object.create(data));
  };
  return TextureRender;
});
