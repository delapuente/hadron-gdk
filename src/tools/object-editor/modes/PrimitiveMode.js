
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

  PrimitiveMode.prototype.onmousedown = function (evt) {
  };

  PrimitiveMode.prototype.onmouseup = function () {
  };

  PrimitiveMode.prototype.onmousemove = function (evt) {
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

  PrimitiveMode.prototype._updatePrimitiveList = function (primitive) {
    var li = document.createElement('li');
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'delete';
    deleteButton.type = 'button';
    li.dataset.id = primitive.id;
    li.textContent = 'primitive-' + this.PRIMITIVE_ID++;
    li.appendChild(deleteButton);
    this._primitiveList.insertBefore(li, this._primitiveList.firstChild);

    deleteButton.addEventListener('click', function () {
      this._model.deletePrimitive(primitive);
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
