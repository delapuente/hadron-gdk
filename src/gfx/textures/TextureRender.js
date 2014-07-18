
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
    this._sprite = new this._gfxSystem.Sprite.fromImage(source);
    this._sprite.interactive = true;
    this._sprite.mouseover = this._dispatchOverTheTexture.bind(this);
    this._sprite.mouseout = this._dispatchLeavingTheTexture.bind(this);
    this._sprite.mousedown = this._dispatchClickTheTexture.bind(this);
    this._sprite.mouseup = this._dispatchReleaseTheTexture.bind(this);
    this._gfxSystem.add(this._sprite);
  }
  S.theClass(TextureRender).inheritsFrom(Render);
  S.theClass(TextureRender).mix(EventEmitter);

  TextureRender.prototype._updatePosition = function (evt) {
    this._sprite.position.x = evt.position[0];
    this._sprite.position.y = evt.position[1];
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
