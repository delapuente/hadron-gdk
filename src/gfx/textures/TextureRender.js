
define([
  'S',
  'lib/strongforce',
  'gfx/System'
], function (S, strongforce, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;

  function TextureRender(texture, source) {
    Render.call(this);
    this._gfxSystem = GfxSystem.getSystem();
    this._sprite = new this._gfxSystem.Sprite.fromImage(source);
    this._gfxSystem.add(this._sprite);
  }
  S.theClass(TextureRender).inheritsFrom(Render);

  return TextureRender;
});
