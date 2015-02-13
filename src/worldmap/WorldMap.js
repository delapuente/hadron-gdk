
define([
], function () {
  'use strict';

  function WorldMap(parameters) {
    parameters = parameters || {};
    this.locations = parameters.locations || [];
    this.paths = parameters.paths || [];
    this.background = parameters.background || '';
  }

  return WorldMap;
});
