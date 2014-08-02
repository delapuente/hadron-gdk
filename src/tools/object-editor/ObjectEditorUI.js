
define([
  'gfx/System',
  'lib/strongforce',
  'scene/metrics',
  'gfx/Isospace',
  'gfx/fragments/CuboidFragment',
  'tools/helpers/selections/SimpleSelector'
], function (GfxSystem, strongforce, metrics, Isospace, CuboidFragment,
             SimpleSelector) {
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
    this._isospaceLayer.alpha = 0.7;
    this._isospace = new Isospace(this._isospaceLayer);
    this._highlight = new SimpleSelector();

    this._gridLayer.addChild(model.grid.render.graphic);

    var placeholder = root.querySelector('#canvas-placeholder');
    placeholder.parentNode.replaceChild(this._gfxSystem.view, placeholder);
    this._gfxSystem.addEventListener('mousedown', this._onMouseDown.bind(this));
    this._gfxSystem.addEventListener('mouseup', this._onMouseUp.bind(this));
    this._gfxSystem.addEventListener(
      'mousemove',
      this._onMouseMove.bind(this)
    );

    this._root = root;
    this._model = model;
    this._model.render = this._render.bind(this);
    this._loop = new Loop({ rootModel: model });
    this._loop.start();

    // Grid controls
    var selectGridSizeX = root.querySelector('#select-grid-size-x');
    selectGridSizeX.addEventListener('change', this._changeCellSize.bind(this));
    var selectGridSizeZ = root.querySelector('#select-grid-size-z');
    selectGridSizeZ.addEventListener('change', this._changeCellSize.bind(this));

    // Layer controls
    var addNewLayer = root.querySelector('#add-new-layer');
    addNewLayer.addEventListener('change', this._loadImage.bind(this));
    this._model.addEventListener('layerAdded', this._addLayer.bind(this));
    this._model.addEventListener('layerDeleted', this._deleteLayer.bind(this));
    this._model.addEventListener('nodeAdded', this._addFragment.bind(this));
    this._model
      .addEventListener('nodeDeleted', this._deleteFragment.bind(this));
  };

  ObjectEditorUI.prototype._onMouseMove = function (evt) {
    var coordinates = evt.coordinates;
    this._currentPointerCoordinates = [coordinates[0], coordinates[1]];
    var cameraPosition = this._gfxSystem.getCameraPosition();
    var viewportCoordinates = [
      this._currentPointerCoordinates[0] - cameraPosition[0],
      this._currentPointerCoordinates[1] - cameraPosition[1]
    ];

    var inPrimitiveMode =
      this._root.querySelector('#toggle-primitive-mode').checked;
    if (this._selectedLayer && !inPrimitiveMode) {
      var deltaX = coordinates[0] - this._lastPointerCoordinates[0];
      var deltaY = coordinates[1] - this._lastPointerCoordinates[1];
      var currentPosition = this._selectedLayer.getPosition();
      this._selectedLayer.setPosition([
        currentPosition[0] + deltaX,
        currentPosition[1] + deltaY
      ]);
    }
    else if (this._selectedPrimitive &&
             !this._isDrawingPrimitive &&
             !this._isSelectingPrimitiveHeight) {

      if (!this._movingOffset) {
        this._movingOffset = metrics.getMapCoordinates(
          viewportCoordinates,
          { y: this._selectedPrimitive.getPosition()[1] }
        );
      }
      else {
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
    }
    else if (this._isDrawingPrimitive) {
      var newOriginPoint = this._startDrawingPoint.slice(0);
      var mapPoint = metrics.getMapCoordinates(viewportCoordinates);
      var newDimensions = [
        mapPoint[0] - newOriginPoint[0],
        0,
        mapPoint[2] - newOriginPoint[2]
      ];
      if (newDimensions[0] < 0) {
        newOriginPoint[0] += newDimensions[0];
        newDimensions[0] = -newDimensions[0];
      }
      if (newDimensions[2] < 0) {
        newOriginPoint[2] += newDimensions[2];
        newDimensions[2] = -newDimensions[2];
      }
      this._selectedPrimitive.setPosition(newOriginPoint);
      this._selectedPrimitive.setDimensions(newDimensions);
    }
    else if (this._isSelectingPrimitiveHeight) {
      var cameraPosition = this._gfxSystem.getCameraPosition();
      var viewportCoordinates = [
        this._currentPointerCoordinates[0] - cameraPosition[0],
        this._currentPointerCoordinates[1] - cameraPosition[1]
      ];
      var dimensions = this._selectedPrimitive.getDimensions();
      dimensions[1] = Math.max(0, metrics.getMapCoordinates(
        viewportCoordinates,
        this._restrictions
      )[1]);
      this._selectedPrimitive.setDimensions(dimensions);
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

    var inPrimitiveMode =
      this._root.querySelector('#toggle-primitive-mode').checked;

    if (inPrimitiveMode &&
        !this._isDrawingPrimitive && !this._isSelectingPrimitiveHeight) {
      this._isDrawingPrimitive = true;
      this._startDrawingPoint = metrics.getMapCoordinates(viewportCoordinates);
      var dimensions = [0, 0, 0];
      this._selectedPrimitive =
        this._model.addNewPrimitive(dimensions, this._startDrawingPoint);
    }
  };

  ObjectEditorUI.prototype._onMouseUp = function (evt) {
    if (this._isDrawingPrimitive) {
      this._isDrawingPrimitive = false;
      this._isSelectingPrimitiveHeight = true;

      var cameraPosition = this._gfxSystem.getCameraPosition();
      var viewportCoordinates = [
        this._currentPointerCoordinates[0] - cameraPosition[0],
        this._currentPointerCoordinates[1] - cameraPosition[1]
      ];
      var mapPoint = metrics.getMapCoordinates(viewportCoordinates);
      this._restrictions = { x: mapPoint[0], z: mapPoint[2] };
    }
    else if (this._isSelectingPrimitiveHeight) {
      this._isSelectingPrimitiveHeight = false;
      this._root.querySelector('#toggle-primitive-mode').checked = false;
    }
  };

  ObjectEditorUI.prototype._changeCellSize = function () {
    var sizeX = parseInt(this._root.querySelector('#select-grid-size-x').value);
    var sizeZ = parseInt(this._root.querySelector('#select-grid-size-z').value);
    if (isNaN(sizeX) || isNaN(sizeZ)) { return; }
    this._model.grid.setCellSize([sizeX, sizeZ]);
  };

  ObjectEditorUI.prototype._loadImage = function () {
    var newTexture = this._root.querySelector('#add-new-layer').files[0];
    var objectURL = URL.createObjectURL(newTexture);
    this._model.addNewLayer(objectURL, newTexture.name);
  };

  ObjectEditorUI.prototype._addLayer = function (evt) {
    var layer = evt.layer;
    this._textureLayer.addChild(layer.render.graphic);
    this._graphicEntities[layer.id] = layer.render.graphic;
    this._updateLayerList(layer);
  };

  ObjectEditorUI.prototype._deleteLayer = function (evt) {
    var layer = evt.layer;
    this._textureLayer.removeChild(layer.render.graphic);
    if (this._highlighedEntity === layer) {
      this._highlightEntity(null);
    }
    delete this._graphicEntities[layer.id];
    this._removeFromLayerList(layer);
  };

  ObjectEditorUI.prototype._updateLayerList = function (layer) {
    var layerList = this._root.querySelector('#layer-list');
    var li = document.createElement('li');
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'delete';
    deleteButton.type = 'button';
    li.dataset.id = layer.id;
    li.textContent = layer.name;
    li.appendChild(deleteButton);
    layer.render.addEventListener('mouseover', function () {
      li.classList.add('selected');
      this._highlightEntity(layer);
    }.bind(this));
    layer.render.addEventListener('mouseout', function () {
      li.classList.remove('selected');
    });
    layer.render.addEventListener('mousedown', function () {
      this._selectedLayer = layer;
    }.bind(this));
    layer.render.addEventListener('mouseup', function () {
      this._selectedLayer = null;
      this._highlightEntity(null);
    }.bind(this));
    layerList.insertBefore(li, layerList.firstChild);
    deleteButton.addEventListener('click', function () {
      this._model.deleteLayer(layer);
    }.bind(this));
  };

  ObjectEditorUI.prototype._removeFromLayerList = function (layer) {
    var layerList = this._root.querySelector('#layer-list');
    var li = layerList.querySelector('[data-id="' + layer.id + '"]');
    li.parentNode.removeChild(li);
  };

  ObjectEditorUI.prototype._addFragment = function (evt) {
    var fragment = new CuboidFragment(evt.node);
    this._isospace.addFragment(fragment);
    this._graphicEntities[fragment.id] = fragment.render.graphic;
    this._updateFragmentList(fragment);
  };

  ObjectEditorUI.prototype._deleteFragment = function (evt) {
    var fragment = evt.node;
    this._isospace.removeFragment(fragment);
    if (this._highlighedEntity === fragment) {
      this._highlightEntity(null);
    }
    delete this._graphicEntities[fragment.id];
    this._removeFromFragmentList(fragment);
  };

  ObjectEditorUI.prototype.FRAGMENT_ID = 1;

  ObjectEditorUI.prototype._updateFragmentList = function (fragment) {
    var fragmentList = this._root.querySelector('#fragment-list');
    var li = document.createElement('li');
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'delete';
    deleteButton.type = 'button';
    li.dataset.id = fragment.id;
    li.textContent = 'fragment-' + this.FRAGMENT_ID++;
    li.appendChild(deleteButton);
    fragment.render.addEventListener('mouseover', function () {
      li.classList.add('selected');
      this._highlightEntity(fragment);
    }.bind(this));
    fragment.render.addEventListener('mouseout', function () {
      li.classList.remove('selected');
      this._highlightEntity(null);
    }.bind(this));
    fragment.render.addEventListener('mousedown', function () {
      this._selectedPrimitive = fragment.node;
    }.bind(this));
    fragment.render.addEventListener('mouseup', function () {
      if (!this._isDrawingPrimitive && !this._isSelectingPrimitiveHeight) {
        this._selectedPrimitive = null;
        this._movingOffset = null;
      }
    }.bind(this));
    fragmentList.insertBefore(li, fragmentList.firstChild);
    li.addEventListener('mouseover', function () {
      this._highlightEntity(fragment);
    }.bind(this));
    deleteButton.addEventListener('click', function () {
      this._model.deletePrimitive(fragment);
    }.bind(this));
  };

  ObjectEditorUI.prototype._removeFromFragmentList = function (fragment) {
    var fragmentList = document.querySelector('#fragment-list');
    var li = fragmentList.querySelector('[data-id="' + fragment.id  + '"]');
    li.parentNode.removeChild(li);
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

  ObjectEditorUI.prototype._render = function (isPostCall, alpha) {
    if (isPostCall) {
      this._gfxSystem.render(alpha);
    }
  };

  return ObjectEditorUI;
});
