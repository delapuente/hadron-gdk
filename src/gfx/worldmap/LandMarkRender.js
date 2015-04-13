
define([
  'S',
  'lib/strongforce',
  'gfx/System',
], function (S, strongforce, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;

  function LandMarkRender(landmark, mapLocation, color) {
    Render.call(this);
    S.theObject(this)
      .has('_gfxSystem', GfxSystem.getSystem());

    color = color || 0xFF0000;
    this.graphic = new this._gfxSystem.Graphics();
    this._text = new this._gfxSystem.Text(mapLocation.getName());
    this.graphic.addChild(this._text);

    mapLocation.addEventListener('positionChanged', function (evt) {
      this.placeLandMark(evt.position);
    }.bind(this));

    mapLocation.addEventListener('nameChanged', function (evt) {
      this._text.setText(evt.name);
    }.bind(this));

    landmark.addEventListener('visibilityChange', function (evt) {
      this.graphic.visible = evt.visibility;
      this._text.visible = evt.visibility;
    }.bind(this));

    landmark.addEventListener('colorChange', function (evt) {
      this._drawLandmark(evt.color);
    }.bind(this));

    landmark.addEventListener('positionChange', function (evt) {
      this.placeLandMark(evt.position);
    }.bind(this));

    this._drawLandmark(color);
    this.placeLandMark(mapLocation.getPosition());
  }

  S.theClass(LandMarkRender).inheritsFrom(Render);

  LandMarkRender.prototype._drawLandmark = function (color) {
    this.graphic.clear();
    this.graphic.beginFill(color, 1.0);
    this.graphic.drawCircle(0, 0, 10);
  };

  LandMarkRender.prototype.placeLandMark = function (position) {
    this.graphic.position.x = position[0];
    this.graphic.position.y = position[1];
  };

  return LandMarkRender;
});
