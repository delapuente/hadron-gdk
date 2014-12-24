
require.config({
  baseUrl: 'src',
  paths: {
    'S': 'scaffolding',
    'T': 'toolkit',
    'lib/strongforce': '../lib/strongforce/dist/strongforce',
    'lib/pixi': '../lib/pixi.js/bin/pixi.dev'
  }
});

define([
  'tools/map-editor/MapEditor',
  'tools/map-editor/MapEditorUI'
], function (MapEditor, MapEditorUI) {
  'use strict';

  var mapEditor = new MapEditor([50, 50]);
  var ui = new MapEditorUI(document, mapEditor);
});
