
define([
  'S',
  'lib/strongforce',
  'tools/helpers/surfaces/ShadowRender'
], function (S, strongforce, ShadowRender) {

  var Model = strongforce.Model;

  function Shadow(primitive) {
    Model.apply(this);
    this.setPrimitive(primitive);
  }
  S.theClass(Shadow).inheritsFrom(Model);

  Shadow.prototype.render = ShadowRender;

  Shadow.prototype.getPrimitive = function () {
    return this._primitive;
  };

  Shadow.prototype.setPrimitive = function (primitive) {
    this._primitive = primitive || null;
    this.proxyEventsFrom(this._primitive);
    this.dispatchEvent('primitiveChanged', { primitive: primitive });
  };

  return Shadow;
});
