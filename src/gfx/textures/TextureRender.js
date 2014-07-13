
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
    this._gfxSystem = GfxSystem.getSystem();
    this._sprite = new this._gfxSystem.Sprite.fromImage(source);
    this._sprite.interactive = true;
    this._sprite.mouseover = this._dispatchOverTheTexture.bind(this);
    this._sprite.mouseout = this._dispatchLeavingTheTexture.bind(this);
    this._gfxSystem.add(this._sprite);
  }
  S.theClass(TextureRender).inheritsFrom(Render);
  S.theClass(TextureRender).mix(EventEmitter);

  TextureRender.prototype._dispatchOverTheTexture = function (data) {
    this.dispatchEvent('mouseover', data);
  };

  TextureRender.prototype._dispatchLeavingTheTexture = function (data) {
    this.dispatchEvent('mouseout', data);
  };

  return TextureRender;
});
