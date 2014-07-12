
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
  'tools/object-editor/ObjectEditor',
  'tools/object-editor/ObjectEditorUI'
], function (ObjectEditor, ObjectEditorUI) {
  'use strict';


  var objectEditor = new ObjectEditor();
  var ui = new ObjectEditorUI(document, objectEditor);

});
