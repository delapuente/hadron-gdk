
define([
  'S',
  'lib/strongforce',
  'gfx/System',
], function (S, strongforce, GfxSystem) {
  'use strict';

  var Render = strongforce.Render;

  function TrackRender(track) {
    Render.call(this);
    S.theObject(this)
      .has('_gfxSystem', GfxSystem.getSystem());

    this.graphic = new this._gfxSystem.Graphics();

    track.addEventListener('pointSetChanged', function (evt) {
      this._drawTrack(evt.points);
    }.bind(this));
  }

  S.theClass(TrackRender).inheritsFrom(Render);

  TrackRender.prototype._drawTrack = function (points) {
    this.graphic.clear();
    if (points.length > 0) {
      this.graphic.lineStyle(4, 0x000000, 1.0);
      var startPoint = points[0];
      this.graphic.moveTo(startPoint[0], startPoint[1]);
      for (var i = 1, point; (point = points[i]); i++) {
        this.graphic.lineTo(point[0], point[1]);
      }
    }
  };

  return TrackRender;
});
