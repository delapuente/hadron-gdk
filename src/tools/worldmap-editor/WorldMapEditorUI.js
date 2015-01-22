
define([
  'S',
  'tools/mixins/Modable',
  'gfx/System',
  'lib/strongforce',
  'scene/metrics',
  'tools/map-editor/modes/ObjectMode',
  'gfx/Isospace',
  'gfx/fragments/ObjectFragment',
  'tools/helpers/selections/SimpleSelector',
  'tools/helpers/surfaces/Shadow',
], function (S, Modable, GfxSystem, strongforce, metrics, ObjectMode, Isospace,
             ObjectFragment, SimpleSelector, Shadow) {
  'use strict';

  var Loop = strongforce.Loop;

  function WorldMapEditorUI(root, model) {
    this._graphicEntities = {};
    this._gfxSystem = GfxSystem.getSystem();
    this._gfxSystem.resizeViewport([1024, 768]);
    this._gfxSystem.centerCamera();
    this._gfxSystem.setBgColor(model._backgroundColor);

    this._mapLayer = this._gfxSystem.newLayer('map-layer');

    var placeholder = root.querySelector('#canvas-placeholder');
    placeholder.parentNode.replaceChild(this._gfxSystem.view, placeholder);

    this._root = root;

    this._root.getElementById('select-background-button')
    .addEventListener('click', function () {
      this._root.getElementById('select-background-input').click();
    }.bind(this));

    this._root.getElementById('select-background-input')
    .addEventListener('change', this._loadBackground.bind(this));

    this._model = model;
    this._model.render = this._render.bind(this);

    this._model
    .addEventListener('backgroundSet', this._updateBackground.bind(this));

    this._loop = new Loop({ rootModel: model });
    this._loop.start();

  }
  S.theClass(WorldMapEditorUI).mix(Modable);

  WorldMapEditorUI.prototype._loadBackground = function (evt) {
    var newBackground = evt.target.files[0];
    var objectURL = URL.createObjectURL(newBackground);
    this._model.setBackground(objectURL, newBackground.name);
    evt.value = '';
  };

  WorldMapEditorUI.prototype._updateBackground = function (evt) {
    if (this._background) { this._mapLayer.removeChild(this._background); }
    this._background = new this._gfxSystem.Sprite.fromImage(evt.data);
    this._background.texture.baseTexture.addEventListener('loaded',
    function () {
      this._background.x = -this._background.width / 2;
      this._background.y = -this._background.height / 2;
    }.bind(this));
    this._mapLayer.addChildAt(this._background, 0);
  };

  WorldMapEditorUI.prototype._download = function (stream) {
    var download = this._root.querySelector('#download-object');
    download.href = 'data:application/octet-stream,' +
                    encodeURIComponent(stream);
    download.click();
  };

  WorldMapEditorUI.prototype._onObjectFocused = function (evt) {
    if (this._currentFlow === 'moving-object') { return; }
  };

  WorldMapEditorUI.prototype._setupControlModes = function () {
    //this._textureControlMode = new TextureMode(
      //this,
      //this._textureTools,
      //this._model,
      //this._textureLayer
    //);
    this._objectMode = new ObjectMode(
      this,
      this._objectTools,
      this._model,
      this._isospace,
      this._isospaceLayer
    );

    this.setupModable(this._gfxSystem);
  };

  WorldMapEditorUI.prototype.notifyStartOfFlow = function (flowName) {
    console.log('Starting flow ' + flowName);
    this.lockUIMode();
    this._currentFlow = flowName;
  };

  WorldMapEditorUI.prototype.notifyEndOfFlow = function (flowName) {
    console.log('Ending flow ' + flowName);
    this.unlockUIMode();
    this._currentFlow = null;
  };

  WorldMapEditorUI.prototype._changeCellSize = function () {
    var sizeX = parseInt(this._root.querySelector('#select-grid-size-x').value);
    var sizeZ = parseInt(this._root.querySelector('#select-grid-size-z').value);
    if (isNaN(sizeX) || isNaN(sizeZ)) { return; }
    this._model.grid.setCellSize([sizeX, sizeZ]);
  };

  WorldMapEditorUI.prototype._render = function (isPostCall, alpha) {
    if (isPostCall) {
      this._gfxSystem.render(alpha);
    }
  };

  return WorldMapEditorUI;
});
