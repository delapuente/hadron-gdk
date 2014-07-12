
define([
  'gfx/System',
  'lib/strongforce'
], function (GfxSystem, strongforce) {
  'use strict';

  var Loop = strongforce.Loop;

  function ObjectEditorUI(root, model) {
    this._gfxSystem = GfxSystem.getSystem(600, 600);
    this._gfxSystem.setBgColor(0xBBBBBB);

    var placeholder = root.querySelector('#canvas-placeholder');
    placeholder.parentNode.replaceChild(this._gfxSystem.view, placeholder);

    this._model = model;
    this._model.render = this._render.bind(this);
    this._loop = new Loop({ rootModel: model });
    this._loop.start();
  };

  ObjectEditorUI.prototype._render = function (isPostCall, alpha) {
    if (isPostCall) {
      this._gfxSystem.render(alpha);
    }
  };

  return ObjectEditorUI;
});
