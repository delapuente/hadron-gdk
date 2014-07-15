
define([
  'S',
  'lib/strongforce'
], function (S, strongforce) {
  'use strict';

  var Model = strongforce.Model;

  function Geometry() { Model.apply(this); }
  S.theClass(Geometry).inheritsFrom(Model);

  return Geometry;
});
