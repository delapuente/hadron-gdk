
define([
  'gfx/System',
  'lib/strongforce',
  'scene/metrics',
  'gfx/Isospace',
  'gfx/fragments/CuboidFragment',
  'tools/object-editor/modes/TextureMode',
  'tools/object-editor/modes/PrimitiveMode',
  'tools/object-editor/modes/PrimitiveCreationMode',
  'tools/helpers/selections/SimpleSelector',
  'tools/helpers/surfaces/Shadow',
  'tools/helpers/handlers/Handler'
], function (GfxSystem, strongforce, metrics, Isospace, CuboidFragment,
             TextureMode, PrimitiveMode, PrimitiveCreationMode, SimpleSelector,
             Shadow, Handler) {
  'use strict';

  var Loop = strongforce.Loop;

  function ObjectEditorUI(root, model) {
    this._graphicEntities = {};
    this._gfxSystem = GfxSystem.getSystem();
    this._gfxSystem.resizeViewport([600, 600]);
    this._gfxSystem.centerCamera();
    this._gfxSystem.setBgColor(0xF0F0F0);

    this._gridLayer = this._gfxSystem.newLayer('grid-layer');
    this._textureLayer = this._gfxSystem.newLayer('texture-layer');
    this._isospaceLayer = this._gfxSystem.newLayer('isospace-layer');
    this._handlerLayer = this._gfxSystem.newLayer('handler-layer');
    this._isospaceLayer.alpha = 0.5;

    this._isospace = new Isospace(this._isospaceLayer);
    this._highlight = new SimpleSelector();
    this._shadow = new Shadow();
    this._xzHandler = new Handler({ x: true, y: false, z: true });
    this._yHandler = new Handler({ x: false, y: true, z: false });

    this._gridLayer.addChild(model.grid.render.graphic);
    this._gridLayer.addChild(this._shadow.render.graphic);

    var placeholder = root.querySelector('#canvas-placeholder');
    placeholder.parentNode.replaceChild(this._gfxSystem.view, placeholder);

    this._root = root;
    this._model = model;
    this._model.render = this._render.bind(this);
    this._setupControlModes();

    this._loop = new Loop({ rootModel: model });
    this._loop.start();

     //Grid controls
    //var selectGridSizeX = root.querySelector('#select-grid-size-x');
    //selectGridSizeX.addEventListener('change', this._changeCellSize.bind(this));
    //var selectGridSizeZ = root.querySelector('#select-grid-size-z');
    //selectGridSizeZ.addEventListener('change', this._changeCellSize.bind(this));

    //// Ctrl key
    //window.addEventListener('keydown', function (evt) {
      //this._isCtrlPressed = evt.ctrlKey;
    //}.bind(this));

    //window.addEventListener('keyup', function (evt) {
      //this._isCtrlPressed = evt.ctrlKey;
    //}.bind(this));
  }

  ObjectEditorUI.prototype._setupControlModes = function () {
    this._currentMode = null;
    this._isUnsafe = false;

    this._textureTools = this._root.querySelector('#texture-tools');
    this._primitiveTools = this._root.querySelector('#primitive-tools');
    this._togglePrimitive =
      this._primitiveTools.querySelector('#toggle-primitive-mode');

    this._textureControlMode = new TextureMode(
      this,
      this._textureTools,
      this._model,
      this._textureLayer
    );
    this._primitiveMode = new PrimitiveMode(
      this,
      this._primitiveTools,
      this._model,
      this._isospace,
      this._isospaceLayer
    );
    this._primitiveCreationMode = new PrimitiveCreationMode(
      this,
      this._model
    );

    this._textureTools.addEventListener('click', function () {
      console.log('Texture mode selected');
      return this._selectMode(this._textureControlMode);
    }.bind(this), true);

    this._primitiveTools.addEventListener('click', function () {
      console.log('Primitive mode selected');
      return this._selectMode(this._primitiveMode);
    }.bind(this), true);

    this._togglePrimitive.addEventListener('click', function () {
      console.log('New primitive mode enabled');
      return this._selectMode(this._primitiveCreationMode);
    }.bind(this));

    this._redirectToModes();
  };

  ObjectEditorUI.prototype._redirectToModes = function () {
    var self = this;
    redirectToMode('mouseup');
    redirectToMode('mousedown');
    redirectToMode('mousemove');

    function redirectToMode(eventName) {
      var hookName = 'on' + eventName;
      self._gfxSystem.addEventListener(eventName, function (evt) {
        if (!self._currentMode) { return; }
        if (!self._currentMode[hookName]) { return; }

        var fixedEvent = Object.create(evt);
        var screenCoordiantes = evt.coordinates;
        var referenceSpace = self._currentMode.referenceSpace;
        var cameraPosition = self._gfxSystem.getCameraPosition();
        var viewportCoordinates = [
          screenCoordiantes[0] - cameraPosition[0],
          screenCoordiantes[1] - cameraPosition[1]
        ];
        fixedEvent.viewportCoordinates = viewportCoordinates;

        self._currentMode[hookName].call(self._currentMode, fixedEvent);
      });
    }
  };

  ObjectEditorUI.prototype._selectMode = function (mode) {
    if (!this._isUnsafe) {
      this._currentMode = mode;
      return true;
    }

    return false;
  };

  ObjectEditorUI.prototype.notifyStartOfFlow = function (flowName) {
    console.log('Starting flow ' + flowName);
    this._isUnsafe = true;
  };

  ObjectEditorUI.prototype.notifyEndOfFlow = function (flowName) {
    console.log('Ending flow ' + flowName);
    this._isUnsafe = false;

    if (flowName === 'creating-primitive') {
      this._togglePrimitive.checked = false;
      this._selectMode(this._primitiveMode);
    }
  };

  ObjectEditorUI.prototype._onMouseMove = function (evt) {
    var coordinates = evt.coordinates;
    this._currentPointerCoordinates = [coordinates[0], coordinates[1]];
    var cameraPosition = this._gfxSystem.getCameraPosition();
    var viewportCoordinates = [
      this._currentPointerCoordinates[0] - cameraPosition[0],
      this._currentPointerCoordinates[1] - cameraPosition[1]
    ];
    this._xzHandler.testScreenPosition(viewportCoordinates);
    this._yHandler.testScreenPosition(viewportCoordinates);

    if (this._selectedPrimitive &&
             !this._isDrawingPrimitive &&
             !this._isSelectingPrimitiveHeight) {

      if (!this._isCtrlPressed && !this._movingOffset) {
        this._movingOffset = metrics.getMapCoordinates(
          viewportCoordinates,
          { y: this._selectedPrimitive.getPosition()[1] }
        );
      }
      else if (this._isCtrlPressed && !this._movingOffset) {
        this._movingOffset = metrics.getMapCoordinates(
          viewportCoordinates,
          {
            x: this._selectedPrimitive.getPosition()[0],
            z: this._selectedPrimitive.getPosition()[2]
          }
        );
      }
      else if (!this._isCtrlPressed) {
        var currentPosition = this._selectedPrimitive.getPosition();
        var mapPoint = metrics.getMapCoordinates(
          viewportCoordinates,
          { y: currentPosition[1] }
        );
        var deltaX = mapPoint[0] - this._movingOffset[0];
        var deltaZ = mapPoint[2] - this._movingOffset[2];
        this._selectedPrimitive.setPosition([
          currentPosition[0] + deltaX,
          currentPosition[1],
          currentPosition[2] + deltaZ
        ]);
        this._movingOffset = mapPoint;
      }
      else {
        var currentPosition = this._selectedPrimitive.getPosition();
        var mapPoint = metrics.getMapCoordinates(
          viewportCoordinates,
          {
            x: currentPosition[0],
            z: currentPosition[2]
          }
        );
        var deltaY = mapPoint[1] - this._movingOffset[1];
        this._selectedPrimitive.setPosition([
          currentPosition[0],
          Math.max(0, currentPosition[1] + deltaY),
          currentPosition[2]
        ]);
        this._movingOffset = mapPoint;
      }
    }

    this._lastPointerCoordinates = this._currentPointerCoordinates;
  };

  ObjectEditorUI.prototype._onMouseDown = function (evt) {
    this._lastPointerCoordinates = evt.coordinates;
    var cameraPosition = this._gfxSystem.getCameraPosition();
    var viewportCoordinates = [
      this._lastPointerCoordinates[0] - cameraPosition[0],
      this._lastPointerCoordinates[1] - cameraPosition[1]
    ];

    if (this._isModifyingPrimitive) {
      this._selectedPrimitive = this._highlight.getSelection().node;
      this._isDrawingPrimitive = true;
      this._startDrawingPoint = this._selectedPrimitive.getPosition();
    }
    else if (this._isModifyingPrimitiveHeight) {
      this._selectedPrimitive = this._highlight.getSelection().node;
      this._isSelectingPrimitiveHeight = true;
      this._startDrawingPoint = this._yHandler.getPosition();
    }
  };

  ObjectEditorUI.prototype._changeCellSize = function () {
    var sizeX = parseInt(this._root.querySelector('#select-grid-size-x').value);
    var sizeZ = parseInt(this._root.querySelector('#select-grid-size-z').value);
    if (isNaN(sizeX) || isNaN(sizeZ)) { return; }
    this._model.grid.setCellSize([sizeX, sizeZ]);
  };

  ObjectEditorUI.prototype._highlightEntity = function (entity) {
    if (this._highlighedEntity) {
      this._graphicEntities[this._highlighedEntity.id]
        .removeChild(this._highlight.render.graphic);
    }
    this._highlighedEntity = entity;
    this._highlight.setSelection(entity);
    if (entity) {
      this._graphicEntities[entity.id].addChild(this._highlight.render.graphic);
    }
  };

  ObjectEditorUI.prototype._showPrimitiveHelpers = function (node) {
    this._shadow.setPrimitive(node);
    this._boundOnPositionChanged =
      this._boundOnPositionChanged ||
      function onPositionChanged(evt) {
        var position = evt.target.getPosition();
        var dimensions = evt.target.getDimensions();
        position[0] += dimensions[0];
        position[2] += dimensions[2];
        this._xzHandler.setPosition(position);
      }.bind(this);

    // XXX: As a side effect of how we redraw the primitive (by setting the
    // position even if it is not changing), we end with an always updated
    // y handler.
    this._boundOnPositionChangedForHeight =
      this._boundOnPositionChangedForHeight ||
      function onPositionChangedForHeight(evt) {
        var position = evt.target.getPosition();
        var dimensions = evt.target.getDimensions();
        position[0] += dimensions[0];
        position[1] += dimensions[1];
        position[2] += dimensions[2];
        this._yHandler.setPosition(position);
      }.bind(this);

    if (node) {
      this._handlerLayer.addChild(this._xzHandler.render.graphic);
      this._handlerLayer.addChild(this._yHandler.render.graphic);
      var hoverPrimitive = this._highlight.getSelection().node;
      hoverPrimitive.addEventListener(
        'positionChanged',
        this._boundOnPositionChanged
      );
      hoverPrimitive.addEventListener(
        'positionChanged',
        this._boundOnPositionChangedForHeight
      );
      hoverPrimitive.addEventListener(
        'dimensionsChanged',
        this._boundOnPositionChangedForHeight
      );
      this._boundOnPositionChanged({
        target: hoverPrimitive
      });
      this._boundOnPositionChangedForHeight({
        target: hoverPrimitive
      });
    }
    else {
      if (this._handlerLayer.children
          .indexOf(this._xzHandler.render.graphic) > -1) {
        this._handlerLayer.removeChild(this._xzHandler.render.graphic);
      }
      if (this._handlerLayer.children
          .indexOf(this._yHandler.render.graphic) > -1) {
        this._handlerLayer.removeChild(this._yHandler.render.graphic);
      }
    }
  };

  ObjectEditorUI.prototype._render = function (isPostCall, alpha) {
    if (isPostCall) {
      this._gfxSystem.render(alpha);
    }
  };

  return ObjectEditorUI;
});
