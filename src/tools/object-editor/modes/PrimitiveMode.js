
define([
  'S',
  'scene/metrics',
  'gfx/fragments/CuboidFragment'
], function (S, metrics, CuboidFragment) {
  'use strict';

  function PrimitiveMode(control, root, model, isospace, isospaceLayer) {
    this._control = control;
    this._root = root;
    this._model = model;
    this._isospace = isospace;
    this._isospaceLayer = isospaceLayer;

    this._primitiveList = root.querySelector('#primitive-list');
    this._primitiveLayerAlpha = root.querySelector('#primitive-layer-alpha');
    this._primitiveLayerAlpha.addEventListener('change', function (evt) {
      this._isospaceLayer.alpha = evt.target.value;
    }.bind(this));

    this._model
      .addEventListener('primitiveAdded', this._addPrimitive.bind(this));
    this._model
      .addEventListener('primitiveDeleted', this._deletePrimitive.bind(this));

    this._lastPointerCoordinates = null;
  }

  PrimitiveMode.prototype.enable = function () {
    for (var i = 0, l = this._isospaceLayer.children.length; i < l; i++) {
      this._isospaceLayer.children[i].interactive = true;
    }
  };

  PrimitiveMode.prototype.disable = function () {
    for (var i = 0, l = this._isospaceLayer.children.length; i < l; i++) {
      this._isospaceLayer.children[i].interactive = false;
    }
  };

  PrimitiveMode.prototype.onkeydown = function (evt) {
    this._isChangingHeight = evt.ctrlKey;
  };

  PrimitiveMode.prototype.onkeyup = function (evt) {
    this._isChangingHeight = evt.ctrlKey;
  };

  PrimitiveMode.prototype.onmousedown = function (evt) {
    this._control.notifyStartOfFlow('moving-primitive');
    this._movingPrimitive = true;
    this._lastPointerCoordinates =
      metrics.getMapCoordinates(evt.viewportCoordinates);
  };

  PrimitiveMode.prototype.onmouseup = function () {
    this._movingPrimitive = false;
    this._selectedPrimitive = null;
    this._control.notifyEndOfFlow('moving-primitive');
  };

  PrimitiveMode.prototype.onmousemove = function (evt) {
    if (!this._movingPrimitive || !this._selectedPrimitive) { return; }

    var restrictions;
    if (this._isChangingHeight) {
      restrictions = {
        x: this._lastPointerCoordinates[0],
        z: this._lastPointerCoordinates[2]
      };
    }
    else {
      restrictions = {
        y: this._lastPointerCoordinates[1],
      };
    }

    var mapPoint = metrics.getMapCoordinates(
      evt.viewportCoordinates,
      restrictions
    );
    var deltaX = mapPoint[0] - this._lastPointerCoordinates[0];
    var deltaY = mapPoint[1] - this._lastPointerCoordinates[1];
    var deltaZ = mapPoint[2] - this._lastPointerCoordinates[2];
    var currentPosition = this._selectedPrimitive.getPosition();
    this._selectedPrimitive.setPosition([
      currentPosition[0] + deltaX,
      currentPosition[1] + deltaY,
      currentPosition[2] + deltaZ
    ]);

    this._lastPointerCoordinates = mapPoint;
  };

  PrimitiveMode.prototype._addPrimitive = function (evt) {
    var fragment = new CuboidFragment(evt.node);
    this._isospace.addFragment(fragment);
    this._updatePrimitiveList(fragment);
  };

  PrimitiveMode.prototype._deletePrimitive = function (evt) {
    var fragment = evt.node;
    this._isospace.removeFragment(fragment);
    this._removeFromPrimitiveList(fragment);
  };

  PrimitiveMode.prototype.PRIMITIVE_ID = 1;

  PrimitiveMode.prototype._updatePrimitiveList = function (fragment) {
    var li = document.createElement('li');
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'delete';
    deleteButton.type = 'button';
    li.dataset.id = fragment.id;
    li.textContent = 'primitive-' + this.PRIMITIVE_ID++;
    li.appendChild(deleteButton);
    this._primitiveList.insertBefore(li, this._primitiveList.firstChild);

    fragment.render.addEventListener('mousedown', function () {
      this._selectedPrimitive = fragment.node;
    }.bind(this));

    deleteButton.addEventListener('click', function () {
      this._model.deletePrimitive(fragment);
    }.bind(this));
  };

  PrimitiveMode.prototype._removeFromPrimitiveList =
  function (primitive) {
    var li =
      this._primitiveList.querySelector('[data-id="' + primitive.id + '"]');
    li.parentNode.removeChild(li);
  };

  return PrimitiveMode;
});
