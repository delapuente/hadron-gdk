
define([
  'S',
  'lib/strongforce',
  'gfx/System',
], function (S, strongforce, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;

  function LandMarkRender(landmark, mapLocation) {
    Render.call(this);
    S.theObject(this)
      .has('_gfxSystem', GfxSystem.getSystem());

    this.graphic = new this._gfxSystem.Graphics();
    this.graphic.clear();
    this.graphic.beginFill(0xFF0000, 1.0);
    this.graphic.drawCircle(0, 0, 10);
    this._text = new this._gfxSystem.Text(mapLocation.getName());
    this.graphic.addChild(this._text);

    mapLocation.addEventListener('positionChanged', function (evt) {
      this.placeLandMark(evt.position);
    }.bind(this));

    mapLocation.addEventListener('nameChanged', function (evt) {
      this._text.setText(evt.name);
    }.bind(this));

    this.placeLandMark(mapLocation.getPosition());
  }

  S.theClass(LandMarkRender).inheritsFrom(Render);

  LandMarkRender.prototype.placeLandMark = function (position) {
    this.graphic.position.x = position[0];
    this.graphic.position.y = position[1];
  };

  return LandMarkRender;
});
