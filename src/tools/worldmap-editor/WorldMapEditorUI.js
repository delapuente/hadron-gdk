
define([
  'S',
  'tools/mixins/Modable',
  'gfx/System',
  'lib/strongforce',
  'scene/metrics',
  'tools/worldmap-editor/modes/LocationMode',
  'tools/worldmap-editor/modes/PathMode',
  'tools/worldmap-editor/modes/DeleteMode',
  'tools/worldmap-editor/modes/EditMode',
  'tools/worldmap-editor/modes/PlacePartyMode',
  'tools/worldmap-editor/modes/PlacePartyMode'
], function (S, Modable, GfxSystem, strongforce, metrics, LocationMode,
             PathMode, DeleteMode, EditMode, PlacePartyMode, ChooseDestination)
{
  'use strict';

  var Loop = strongforce.Loop;

  function WorldMapEditorUI(root, model) {
    this._root = root;         // TODO: Extract to a base view
    this._gatherDOMEntities();

    this._model = model;
    this._model.render = this._render.bind(this);
    this._setupGraphics();
    this._setupControlModes();
    this._setupUI();

    this._loop = new Loop({ rootModel: model });
    this._loop.start();
  }
  S.theClass(WorldMapEditorUI).mix(Modable);

  WorldMapEditorUI.prototype.dom = {
    selectBackgroundButton: true,
    selectBackgroundInput: true,
    importInput: true,
    exportLink: true,
    exportButton: true,
    importButton: true,
    filenameInput: true,
    tools: {
      __root__: '[name="current-tool-option"][value="$"]',
      edit: true,
      placeLocation: true,
      drawPath: true,
      deleteEntity: true,
      placeParty: true,
      chooseDestination: true
    },
    propertiesArea: true
  };

  WorldMapEditorUI.prototype._gatherDOMEntities = function (els) {
    els = els || this.dom;
    var root = this._root;
    var slashCase, selector;
    var selectorTemplate = els.__root__ || '#$';
    for (var name in els) if (els.hasOwnProperty(name) && name !== '__root__') {
      var childSelector = els[name];
      var type = typeof childSelector;
      if (!childSelector) { continue; }
      if (type === 'object') {
        this._gatherDOMEntities(childSelector);
      }
      else {
        if (type === 'boolean') {
          childSelector = toSlashCase(name);
        }
        selector = selectorTemplate.replace('$', childSelector);
        els[name] = root.querySelector(selector);
      }
    }

    function toSlashCase(camelCase) {
      var wasLowerCase = false, isUpperCase, target = [];
      for (var i = 0, c; (c = camelCase[i]); i++) {
        isUpperCase = (c === c.toUpperCase());
        if (isUpperCase && wasLowerCase) {
          target.push('-');
        }
        target.push(c.toLowerCase());
        wasLowerCase = !isUpperCase;
      }
      return target.join('');
    }
  };

  WorldMapEditorUI.prototype._setupGraphics = function () {
    this._graphicEntities = {};
    this._gfxSystem = GfxSystem.getSystem();
    this._gfxSystem.resizeViewport([1024, 768]);
    this._gfxSystem.centerCamera();
    this._gfxSystem.setBgColor(this._model._backgroundColor);

    this._mapLayer = this._gfxSystem.newLayer('map-layer');
    this._pathsLayer = this._gfxSystem.newLayer('paths-layer');
    this._locationsLayer = this._gfxSystem.newLayer('locations-layer');
    this._partyLayer = this._gfxSystem.newLayer('party-layer');

    var placeholder = this._root.querySelector('#canvas-placeholder');
    placeholder.parentNode.replaceChild(this._gfxSystem.view, placeholder);
  };

  WorldMapEditorUI.prototype._setupUI = function () {

    this.dom.exportButton.addEventListener(
      'click',
      this._exportWorldMap.bind(this)
    );

    this.dom.importButton.addEventListener(
      'click',
      this.dom.importInput.click.bind(this.dom.importInput)
    );

    this.dom.importInput.addEventListener(
      'change',
      this._importWorldMap.bind(this)
    );

    this.dom.selectBackgroundButton.addEventListener(
      'click',
      this.dom.selectBackgroundInput.click.bind(this.dom.selectBackgroundInput)
    );

    this.dom.selectBackgroundInput.addEventListener(
      'change',
      this._loadBackground.bind(this)
    );

    this.dom.tools.edit.addEventListener(
      'click',
      this.changeMode.bind(this, this._editMode)
    );

    this.dom.tools.placeLocation.addEventListener(
      'click',
      this.changeMode.bind(this, this._locationMode)
    );

    this.dom.tools.drawPath.addEventListener(
      'click',
      this.changeMode.bind(this, this._pathMode)
    );

    this.dom.tools.deleteEntity.addEventListener(
      'click',
      this.changeMode.bind(this, this._deleteMode)
    );

    this.dom.tools.placeParty.addEventListener(
      'click',
      this.changeMode.bind(this, this._placePartyMode)
    );

    this.dom.tools.chooseDestination.addEventListener(
      'click',
      this.changeMode.bind(this, this._chooseDestinationMode)
    );

    var updateBackground = this._updateBackground.bind(this);
    this._model.addEventListener('backgroundSet', updateBackground);
    this._model.addEventListener('backgroundCleared', updateBackground);

    window.onkeypress = this._moveCamera.bind(this);
  };

  WorldMapEditorUI.prototype._moveCamera = function (evt) {
    var activeElement = document.activeElement;
    var isInput = (activeElement.tagName === 'INPUT' &&
                  ['checkbox', 'radio'].indexOf(activeElement.type) === -1);

    if (isInput) { return; }
    var key = String.fromCharCode(evt.charCode).toUpperCase();
    var deltas = {
      'W': [0, -10],
      'S': [0, +10],
      'A': [-10, 0],
      'D': [+10, 0]
    };
    var delta = deltas[key];
    var currentPosition = this._gfxSystem.getCameraPosition();
    var newPosition = [
      currentPosition[0] - delta[0],
      currentPosition[1] - delta[1]
    ];
    this._gfxSystem.setCameraPosition(newPosition);
  };

  WorldMapEditorUI.prototype._exportWorldMap = function () {
    var meta = !this._background ? {} : {
      background: getSourceData(this._background)
    };
    var stream = this._model.serializeWorldMap(meta);
    var nameInput = this.dom.filenameInput;
    var filename =
      (nameInput.value.trim() || nameInput.placeholder) + '.wmap';
    this.dom.exportLink.setAttribute('download', filename);
    this.dom.exportLink.href = 'data:application/octet-stream,' +
                               encodeURIComponent(stream);
    this.dom.exportLink.click();

    function getSourceData(graphic) {
      var img = graphic.texture.baseTexture.source;
      var buffer = document.createElement('canvas');
      buffer.width = img.width;
      buffer.height = img.height;
      buffer.getContext('2d').drawImage(img, 0, 0);
      return buffer.toDataURL();
    }
  };

  WorldMapEditorUI.prototype._importWorldMap = function (evt) {
    var file = evt.target.files[0];
    var fileReader = new FileReader();
    fileReader.onloadend = function () {
      var stream = fileReader.result;
      this._model.import(stream);
      this.dom.filenameInput.value = stripExtension(file.name);
    }.bind(this);
    fileReader.readAsText(file);
    evt.target.value = '';

    function stripExtension(filename) {
      return filename.substr(0, filename.lastIndexOf('.'));
    }
  };

  WorldMapEditorUI.prototype._loadBackground = function (evt) {
    var newBackground = evt.target.files[0];
    var objectURL = URL.createObjectURL(newBackground);
    this._model.setBackground(objectURL, newBackground.name);
    evt.value = '';
  };

  WorldMapEditorUI.prototype._updateBackground = function (evt) {
    if (this._background) { this._mapLayer.removeChild(this._background); }
    if (evt.data) {
      this._background = new this._gfxSystem.Sprite.fromImage(evt.data);
      this._background.texture.baseTexture
        .addEventListener('loaded', this._centerBackground.bind(this));
      this._mapLayer.addChildAt(this._background, 0);
      this._centerBackground();
    }
  };

  WorldMapEditorUI.prototype._centerBackground = function () {
    this._background.x = -this._background.width / 2;
    this._background.y = -this._background.height / 2;
  };

  WorldMapEditorUI.prototype._download = function (stream) {
    var download = this._root.querySelector('#download-object');
    download.href = 'data:application/octet-stream,' +
                    encodeURIComponent(stream);
    download.click();
  };

  WorldMapEditorUI.prototype._setupControlModes = function () {
    var model = this._model;
    this.setupModable({
      '_locationMode'           : [LocationMode, model, this._locationsLayer],
      '_pathMode'               : [PathMode, model, this._pathsLayer],
      '_editMode'               : [EditMode, model, this.dom.propertiesArea],
      '_deleteMode'             : [DeleteMode, model],
      '_placePartyMode'         : [PlacePartyMode, model, this._partyLayer],
      '_chooseDestinationMode'  : [ChooseDestination, model, this._partyLayer]
    }, this._gfxSystem);
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
