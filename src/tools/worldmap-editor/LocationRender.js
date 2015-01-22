
define([
  'S',
  'lib/strongforce',
  'gfx/System',
], function (S, strongforce, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;

  function LocationRender(mapLocation, position, name) {
    Render.call(this);
    S.theObject(this)
      .has('_gfxSystem', GfxSystem.getSystem());

    this.graphic = new this._gfxSystem.Graphics();
    this.graphic.clear();
    this.graphic.beginFill(0xFF0000, 1.0);
    this.graphic.drawCircle(0, 0, 10);
    this._text = new this._gfxSystem.Text(name);
    this.graphic.addChild(this._text);

    mapLocation.addEventListener('positionChanged', function (evt) {
      var position = evt.position;
      this.graphic.position.x = position[0];
      this.graphic.position.y = position[1];
    }.bind(this));
  }
  S.theClass(LocationRender).inheritsFrom(Render);

  return LocationRender;
});
