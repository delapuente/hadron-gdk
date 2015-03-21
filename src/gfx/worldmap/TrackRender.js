
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
      .has('_track', track)
      .has('_gfxSystem', GfxSystem.getSystem());

    this.graphic = new this._gfxSystem.Graphics();
    this._milestoneLayer = new this._gfxSystem.Graphics();
    this.graphic.addChild(this._milestoneLayer);

    track.addEventListener('pointSetChanged', function (evt) {
      this._drawTrack(evt.points);
      this._drawMilestones(evt.milestones);
    }.bind(this));

    track.addEventListener('milestonesChanged', function (evt) {
      this._drawMilestones(evt.milestones);
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

  TrackRender.prototype._drawMilestones = function (milestones) {
    var self = this;
    this._milestoneLayer.clear();
    var points = getPointsForMilestones(milestones);
    this._milestoneLayer.beginFill(0x00FF00);
    for (var i = 0, point; (point = points[i]); i++) {
      this._drawMilestone(point);
    }
    this._milestoneLayer.endFill();

    function getPointsForMilestones(milestones) {
      var point, points = [];
      var delta = 1 / milestones;
      for (var m = 0; m < 1; m += delta) {
        point = self._track.getPointAtMilestone(m);
        if (point) { points.push(point); }
      }
      return points;
    }
  };

  TrackRender.prototype._drawMilestone = function (point) {
    var length = 8;
    var semiLength = length / 2;
    this._milestoneLayer
      .drawRect(point[0] - semiLength, point[1] - semiLength, length, length);
  };

  return TrackRender;
});
