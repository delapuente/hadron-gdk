
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

  function MapEditorUI(root, model) {
    this._graphicEntities = {};
    this._gfxSystem = GfxSystem.getSystem();
    this._gfxSystem.resizeViewport([1024, 768]);
    this._gfxSystem.centerCamera();
    this._gfxSystem.setBgColor(0xF0F0F0);

    this._gridLayer = this._gfxSystem.newLayer('grid-layer');
    this._textureLayer = this._gfxSystem.newLayer('texture-layer');
    this._isospaceLayer = this._gfxSystem.newLayer('isospace-layer');

    this._isospace = new Isospace(this._isospaceLayer);
    this._highlight = new SimpleSelector();
    this._shadow = new Shadow();

    this._gridLayer.addChild(model.grid.render.graphic);
    this._gridLayer.addChild(this._shadow.render.graphic);

    var placeholder = root.querySelector('#canvas-placeholder');
    placeholder.parentNode.replaceChild(this._gfxSystem.view, placeholder);

    this._root = root;
    this._textureTools = this._root.querySelector('#texture-tools');
    this._objectTools = this._root.querySelector('#object-tools');

    this._model = model;
    this._model.render = this._render.bind(this);
    this._setupControlModes();

    this._loop = new Loop({ rootModel: model });
    this._loop.start();

    this._model.addEventListener(
      'objectFocusChanged',
      this._onObjectFocused.bind(this)
    );

    // Texture mode activation
    this._model.addEventListener(
      'textureAdded',
      function () {
        this._selectMode(this._textureControlMode);
      }.bind(this)
    );

    this._textureTools.addEventListener('click', function () {
      this._selectMode(this._textureControlMode);
    }.bind(this), true);

    // Object mode activation
    this._objectTools.addEventListener('click', function () {
      this.changeMode(this._objectMode);
    }.bind(this), true);

    //Grid controls
    var selectGridSizeX = root.querySelector('#select-grid-size-x');
    selectGridSizeX.addEventListener('change', this._changeCellSize.bind(this));
    var selectGridSizeZ = root.querySelector('#select-grid-size-z');
    selectGridSizeZ.addEventListener('change', this._changeCellSize.bind(this));

    // Export and import
    this._root.querySelector('#export-button')
      .addEventListener('click', function () {
        this._download(this._model.serializeMap());
      }.bind(this));

    this._root.querySelector('#import-button')
      .addEventListener('click', function () {
        this._root.querySelector('#import-input').click();
      }.bind(this));

    this._root.querySelector('#import-input')
      .addEventListener('change', function (evt) {
        var file = evt.target.files[0];
        var fileReader = new FileReader();
        fileReader.onloadend = function () {
          var stream = fileReader.result;
          this._model.import(JSON.parse(stream));
        }.bind(this);
        fileReader.readAsText(file);
        evt.target.value = '';
      }.bind(this));

    this._root.querySelector('#new-button')
      .addEventListener('click', function () {
        this._model.clear();
      }.bind(this));
  }
  S.theClass(MapEditorUI).mix(Modable);

  MapEditorUI.prototype._download = function (stream) {
    var download = this._root.querySelector('#download-object');
    download.href = 'data:application/octet-stream,' +
                    encodeURIComponent(stream);
    download.click();
  };

  MapEditorUI.prototype._onObjectFocused = function (evt) {
    if (this._currentFlow === 'moving-object') { return; }
  };

  MapEditorUI.prototype._setupControlModes = function () {
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

  MapEditorUI.prototype.notifyStartOfFlow = function (flowName) {
    console.log('Starting flow ' + flowName);
    this.lockUIMode();
    this._currentFlow = flowName;
  };

  MapEditorUI.prototype.notifyEndOfFlow = function (flowName) {
    console.log('Ending flow ' + flowName);
    this.unlockUIMode();
    this._currentFlow = null;
  };

  MapEditorUI.prototype._changeCellSize = function () {
    var sizeX = parseInt(this._root.querySelector('#select-grid-size-x').value);
    var sizeZ = parseInt(this._root.querySelector('#select-grid-size-z').value);
    if (isNaN(sizeX) || isNaN(sizeZ)) { return; }
    this._model.grid.setCellSize([sizeX, sizeZ]);
  };

  MapEditorUI.prototype._render = function (isPostCall, alpha) {
    if (isPostCall) {
      this._gfxSystem.render(alpha);
    }
  };

  return MapEditorUI;
});
