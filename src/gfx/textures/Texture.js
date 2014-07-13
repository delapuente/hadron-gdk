
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
  }
  S.theClass(Texture).inheritsFrom(Model);

  Texture.prototype.render = TextureRender;

  return Texture;
});
