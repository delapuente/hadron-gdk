
define([
  'gfx/System',
  'lib/strongforce',
  'scene/metrics'
], function (GfxSystem, strongforce, metrics) {
  'use strict';

  var Loop = strongforce.Loop;

  function ObjectEditorUI(root, model) {
    this._gfxSystem = GfxSystem.getSystem();
    this._gfxSystem.resizeViewport([600, 600]);
    this._gfxSystem.centerCamera();
    this._gfxSystem.setBgColor(0xF0F0F0);

    var placeholder = root.querySelector('#canvas-placeholder');
    placeholder.parentNode.replaceChild(this._gfxSystem.view, placeholder);
    this._gfxSystem
      .view.addEventListener('mousedown', this._onMouseDown.bind(this));
    this._gfxSystem
      .view.addEventListener('mousemove', this._onMouseMove.bind(this));

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
    this._model.addEventListener('layerAdded', this._updateLayerList.bind(this));
  };

  ObjectEditorUI.prototype._onMouseMove = function (evt) {
    if (this._selectedLayer) {
      var deltaX = evt.clientX - this._lastPointerCoordinates[0];
      var deltaY = evt.clientY - this._lastPointerCoordinates[1];
      this._lastPointerCoordinates = [evt.clientX, evt.clientY];
      var currentPosition = this._selectedLayer.getPosition();
      this._selectedLayer.setPosition([
        currentPosition[0] + deltaX,
        currentPosition[1] + deltaY
      ]);
    }
  };

  ObjectEditorUI.prototype._onMouseDown = function (evt) {
    this._lastPointerCoordinates = [evt.clientX, evt.clientY];
    if (this._root.querySelector('#toggle-primitive-mode').checked) {
      var cameraPosition = this._gfxSystem.getCameraPosition();
      var viewportCoordinates = [
        this._lastPointerCoordinates[0] - cameraPosition[0],
        this._lastPointerCoordinates[1] - cameraPosition[1]
      ];
      var cellSize = this._model.grid.getCellSize();
      var height =
        parseInt(this._root.querySelector('#select-grid-size-y').value);
      if (isNaN(height)) { height = cellSize[0]; }

      var mapPoint = metrics.getMapCoordinates(viewportCoordinates);
      var position = [
        Math.floor(mapPoint[0] / cellSize[0]) * cellSize[0],
        mapPoint[1],
        Math.floor(mapPoint[2] / cellSize[1]) * cellSize[1]
      ];
      var dimensions = [cellSize[0], height, cellSize[1]];
      this._model.addNewPrimitive(dimensions, position);
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

  ObjectEditorUI.prototype._updateLayerList = function (evt) {
    var layerList = this._root.querySelector('#layer-list');
    var li = document.createElement('li');
    var layer = evt.layer;
    li.dataset.id = layer.id;
    li.textContent = layer.name;
    layer.render.addEventListener('mouseover', function () {
      li.classList.add('selected');
    });
    layer.render.addEventListener('mouseout', function () {
      li.classList.remove('selected');
    });
    layer.render.addEventListener('mousedown', function () {
      this._selectedLayer = layer;
    }.bind(this));
    layer.render.addEventListener('mouseup', function () {
      this._selectedLayer = null;
    }.bind(this));
    layerList.insertBefore(li, layerList.firstChild);
  };

  ObjectEditorUI.prototype._render = function (isPostCall, alpha) {
    if (isPostCall) {
      this._gfxSystem.render(alpha);
    }
  };

  return ObjectEditorUI;
});
