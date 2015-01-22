
define([
  'S',
  'tools/mixins/Modable',
  'gfx/System',
  'lib/strongforce',
  'scene/metrics',
  'tools/worldmap-editor/modes/LocationMode',
], function (S, Modable, GfxSystem, strongforce, metrics, LocationMode) {
  'use strict';

  var Loop = strongforce.Loop;

  function WorldMapEditorUI(root, model) {
    this._graphicEntities = {};
    this._gfxSystem = GfxSystem.getSystem();
    this._gfxSystem.resizeViewport([1024, 768]);
    this._gfxSystem.centerCamera();
    this._gfxSystem.setBgColor(model._backgroundColor);

    this._mapLayer = this._gfxSystem.newLayer('map-layer');
    this._locationsLayer = this._gfxSystem.newLayer('locations-layer');

    var placeholder = root.querySelector('#canvas-placeholder');
    placeholder.parentNode.replaceChild(this._gfxSystem.view, placeholder);

    this._root = root;

    // Load background
    this._root.getElementById('select-background-button')
    .addEventListener('click', function () {
      this._root.getElementById('select-background-input').click();
    }.bind(this));

    this._root.getElementById('select-background-input')
    .addEventListener('change', this._loadBackground.bind(this));

    // Change to locations mode
    this._root
    .querySelector('input[name="current-tool-option"][value="place-location"]')
    .addEventListener('click', function () {
      this.changeMode(this._locationMode);
    }.bind(this));

    this._model = model;
    this._model.render = this._render.bind(this);

    this._model
    .addEventListener('backgroundSet', this._updateBackground.bind(this));

    this._setupControlModes();

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

  WorldMapEditorUI.prototype._setupControlModes = function () {
    this._locationMode =
      new LocationMode(this, this._model, this._locationsLayer);
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

  WorldMapEditorUI.prototype._render = function (isPostCall, alpha) {
    if (isPostCall) {
      this._gfxSystem.render(alpha);
    }
  };

  return WorldMapEditorUI;
});
