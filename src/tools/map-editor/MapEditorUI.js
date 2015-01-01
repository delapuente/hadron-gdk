
define([
  'S',
  'tools/mixins/Modable',
  'gfx/System',
  'lib/strongforce',
  'scene/metrics',
  'gfx/Isospace',
  'gfx/fragments/ObjectFragment',
  'tools/helpers/selections/SimpleSelector',
  'tools/helpers/surfaces/Shadow',
  'tools/helpers/handlers/Handler'
], function (S, Modable, GfxSystem, strongforce, metrics, Isospace,
             ObjectFragment, SimpleSelector, Shadow, Handler) {
  'use strict';

  var Loop = strongforce.Loop;

  function MapEditorUI(root, model) {
    this._graphicEntities = {};
    this._gfxSystem = GfxSystem.getSystem();
    this._gfxSystem.resizeViewport([1280, 1080]);
    this._gfxSystem.centerCamera();
    this._gfxSystem.setBgColor(0xF0F0F0);

    this._gridLayer = this._gfxSystem.newLayer('grid-layer');
    this._textureLayer = this._gfxSystem.newLayer('texture-layer');
    this._isospaceLayer = this._gfxSystem.newLayer('isospace-layer');
    this._handlerLayer = this._gfxSystem.newLayer('handler-layer');
    this._isospaceLayer.alpha = 0.8;

    this._isospace = new Isospace(this._isospaceLayer);
    this._highlight = new SimpleSelector();
    this._shadow = new Shadow();
    this._xzHandler = new Handler({ x: true, y: false, z: true });
    this._yHandler = new Handler({ x: false, y: true, z: false });

    this._gridLayer.addChild(model.grid.render.graphic);
    this._gridLayer.addChild(this._shadow.render.graphic);

    this._handlerLayer.addChild(this._xzHandler.render.graphic);
    this._handlerLayer.addChild(this._yHandler.render.graphic);

    var placeholder = root.querySelector('#canvas-placeholder');
    placeholder.parentNode.replaceChild(this._gfxSystem.view, placeholder);

    this._root = root;
    this._textureTools = this._root.querySelector('#texture-tools');
    this._primitiveTools = this._root.querySelector('#primitive-tools');
      this._togglePrimitive =
      this._primitiveTools.querySelector('#toggle-primitive-mode');

    this._model = model;
    this._model.render = this._render.bind(this);
    this._setupControlModes();

    this._loop = new Loop({ rootModel: model });
    this._loop.start();

    this._model.addEventListener(
      'primitiveFocusChanged',
      this._onPrimitiveFocused.bind(this)
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

    // Creation mode activation
    this._togglePrimitive.addEventListener('click', function (evt) {
      var toggle = evt.target;
      if (toggle.checked) {
        this._selectMode(this._primitiveCreationMode);
      }
      else {
        this._selectMode(this._primitiveMode);
      }
    }.bind(this));

    // Primitive mode activation
    this._primitiveTools.addEventListener('click', function () {
      this._selectMode(this._primitiveMode);
    }.bind(this), true);

    // Primitive modification activation
    var boundOnHandler = this._onHandler.bind(this);
    this._xzHandler.addEventListener('stateChanged', boundOnHandler);
    this._yHandler.addEventListener('stateChanged', boundOnHandler);

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

    // Palette management
    this._root.querySelector('#import-object-button')
      .addEventListener('click', function (evt) {
        this._root.querySelector('#import-object-input').click();
      }.bind(this));

    this._root.querySelector('#import-object-input')
      .addEventListener('change', function (evt) {
        var file = evt.target.files[0];
        var fileReader = new FileReader();
        fileReader.onloadend = function () {
          var stream = fileReader.result;
          this._model.importObject(stream);
        }.bind(this);
        fileReader.readAsText(file);
        evt.target.value = '';
      }.bind(this));

    this._model.addEventListener('objectAddedToPalette', function (evt) {
      this._updatePalette(evt.object);
    }.bind(this));

    this._model.addEventListener('objectAddedToMap', function (evt) {
      var objectNode = evt.node;
      objectNode.nodes.forEach(function (geometryNode) {
        var objectFragment = new ObjectFragment(geometryNode, objectNode);
        this._isospace.addFragment(objectFragment);
      }.bind(this));
    }.bind(this));
  }
  S.theClass(MapEditorUI).mix(Modable);

  MapEditorUI.prototype._updatePalette = function (hobject) {
    var objectList = this._root.querySelector('#object-list');
    var nextIndex = objectList.querySelectorAll('li').length;
    var li = document.createElement('LI');
    // TODO: Compute thumbnail in a smarter way!
    var img = document.createElement('IMG');
    img.src = hobject.textures[0].data;
    img.style.height = '10rem';
    var addToMapButton = document.createElement('BUTTON');
    addToMapButton.textContent = 'Add to map';
    addToMapButton.dataset.index = nextIndex;
    addToMapButton.addEventListener('click', function (evt) {
      this._model.addToMap(evt.target.dataset.index);
    }.bind(this));
    li.appendChild(img);
    li.appendChild(addToMapButton);
    objectList.appendChild(li);
  };

  MapEditorUI.prototype._download = function (stream) {
    var download = this._root.querySelector('#download-object');
    download.href = 'data:application/octet-stream,' +
                    encodeURIComponent(stream);
    download.click();
  };

  MapEditorUI.prototype._onHandler = function (evt) {
    var inPrimitiveMode = this._currentMode === this._primitiveMode ||
                          this._currentMode === this._heightModificationMode ||
                          this._currentMode === this._plantModificationMode;
    if (!inPrimitiveMode) { return; }

    var state = evt.state;
    if (state !== 'NON_READY') {
      this._selectMode(evt.target === this._yHandler ?
                       this._heightModificationMode :
                       this._plantModificationMode);
    }
    else {
      this._selectMode(this._primitiveMode);
    }
  };

  MapEditorUI.prototype._onPrimitiveFocused = function (evt) {
    if (this._currentFlow === 'moving-primitive') { return; }

    var primitive = evt.primitive;
    var lastPrimitive = evt.lastPrimitive;

    this._shadow.setPrimitive(primitive);

    this._xzHandler.render.graphic.visible = false;
    this._yHandler.render.graphic.visible = false;
    this._boundOnPrimitiveChanged =
      this._boundOnPrimitiveChanged ||
      this._onPrimitiveChanged.bind(this);
    if (lastPrimitive) {
      lastPrimitive.removeEventListener(
        'positionChanged', this._boundOnPrimitiveChanged);
      lastPrimitive.removeEventListener(
        'dimensionsChanged', this._boundOnPrimitiveChanged);
    }
    if (primitive) {
      primitive.addEventListener(
        'positionChanged', this._boundOnPrimitiveChanged);
      primitive.addEventListener(
        'dimensionsChanged', this._boundOnPrimitiveChanged);
      this._xzHandler.render.graphic.visible = true;
      this._yHandler.render.graphic.visible = true;
      this._placeHandlers(primitive);
    }
  };

  MapEditorUI.prototype._onPrimitiveChanged = function (evt) {
    this._placeHandlers(evt.target);
  };

  MapEditorUI.prototype._placeHandlers = function (primitive) {
      var position = primitive.getPosition();
      var dimensions = primitive.getDimensions();
      var yHandlerPosition = [
        position[0] + dimensions[0],
        position[1] + dimensions[1],
        position[2] + dimensions[2]
      ];
      var xzHandlerPosition = [
        position[0] + dimensions[0],
        position[1],
        position[2] + dimensions[2]
      ];
      this._xzHandler.render.graphic.visible = true;
      this._yHandler.render.graphic.visible = true;
      this._xzHandler.setPosition(xzHandlerPosition);
      this._yHandler.setPosition(yHandlerPosition);
  };

  MapEditorUI.prototype._setupControlModes = function () {
    this._currentMode = null;
    this._isUnsafe = false;

    //this._textureControlMode = new TextureMode(
      //this,
      //this._textureTools,
      //this._model,
      //this._textureLayer
    //);
    //this._primitiveMode = new PrimitiveMode(
      //this,
      //this._primitiveTools,
      //this._model,
      //this._isospace,
      //this._isospaceLayer
    //);
    //this._primitiveCreationMode = new PrimitiveCreationMode(
      //this,
      //this._model
    //);
    //this._heightModificationMode = new HeightModificationMode(
      //this,
      //this._model,
      //this._yHandler
    //);
    //this._plantModificationMode = new PlantModificationMode(
      //this,
      //this._model,
      //this._xzHandler
    //);
  };

  MapEditorUI.prototype.notifyStartOfFlow = function (flowName) {
    console.log('Starting flow ' + flowName);
    this.lockMode();
    this._currentFlow = flowName;
  };

  MapEditorUI.prototype.notifyEndOfFlow = function (flowName) {
    console.log('Ending flow ' + flowName);
    this.unlockMode();
    this._currentFlow = null;

    if (flowName === 'creating-primitive') {
      if (this._togglePrimitive.checked) {
        this._togglePrimitive.click();
      }
    }
    if (flowName.startsWith('modify-primitive-') &&
        this._xzHandler.getState() === 'NON_READY' &&
        this._yHandler.getState() === 'NON_READY') {
      this._selectMode(this._primitiveMode);
    }
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
