
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
    ['over', 'out', 'down', 'up'].forEach(function (action) {
      var eventName = 'mouse' + action;
      this.graphic[eventName] = function (data) {
        this.dispatchEvent(eventName, Object.create(data));
      }.bind(this);
    }.bind(this));
  }
  S.theClass(TextureRender).inheritsFrom(Render);
  S.theClass(TextureRender).mix(EventEmitter);

  TextureRender.prototype.getLocalBounds = function () {
    return this.graphic.getLocalBounds();
  };

  TextureRender.prototype._updatePosition = function (evt) {
    this.graphic.position.x = evt.position[0];
    this.graphic.position.y = evt.position[1];
  };

  return TextureRender;
});
