
define([
  'S',
  'lib/pixi',
], function (S, pixi) {
  'use strict';

  function RenderSystem(width, height) {
    width = typeof width === 'undefined' ? 800 : width;
    height = typeof height === 'undefined' ? 600 : height;

    this._renderer = pixi.autoDetectRenderer(width, height);
    this._stage = new pixi.Stage();

    S.theObject(this).has('view', this._renderer.view);
  }

  RenderSystem.prototype.render = function () {
    this._renderer.render(this._stage);
  };

  RenderSystem.prototype.setBgColor = function (color) {
    this._stage.setBackgroundColor(color);
  };

  var system;

  return {
    _RenderSystem: RenderSystem,

    getSystem: function (width, height) {
      if (!system) { system = new RenderSystem(width, height); }
      return system;
    }
  };

});
