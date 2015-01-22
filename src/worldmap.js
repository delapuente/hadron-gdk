
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
  'tools/worldmap-editor/WorldMapEditor',
  'tools/worldmap-editor/WorldMapEditorUI'
], function (WorldMapEditor, WorldMapEditorUI) {
  'use strict';

  var wmapEditor = new WorldMapEditor();
  var ui = new WorldMapEditorUI(document, wmapEditor);
});
