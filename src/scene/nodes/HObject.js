
define([
], function () {
  'use strict';

  function HObject(parameters) {
    parameters = parameters || {};
    this.nodes = parameters.nodes || [];
    this.textures = parameters.textures || [];
  }

  return HObject;
});
