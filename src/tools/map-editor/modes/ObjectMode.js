
define([
  'S',
  'tools/mixins/UIMode',
  'scene/metrics',
  'gfx/fragments/ObjectFragment'
], function (S, UIMode, metrics, ObjectFragment) {
  'use strict';

  function ObjectMode(control, root, model, isospace, isospaceLayer) {
    UIMode.call(this, control);
    this._root = root;
    this._model = model;
    this._isospace = isospace;
    this._isospaceLayer = isospaceLayer;

    // XXX: Change to scene's objects management
    this._primitiveList = root.querySelector('#primitive-list');
    this._primitiveLayerAlpha = root.querySelector('#primitive-layer-alpha');
    this._primitiveLayerAlpha.addEventListener('change', function (evt) {
      this._isospaceLayer.alpha = evt.target.value;
    }.bind(this));

    this._model
      .addEventListener('objectAddedToMap', this._addObject.bind(this));
    this._model
      .addEventListener('objectRemovedFromMap', this._removeObject.bind(this));

    this._lastPointerCoordinates = null;
  }
  S.theClass(ObjectMode).inheritsFrom(UIMode);

  ObjectMode.prototype.enable = function () {
    for (var i = 0, l = this._isospaceLayer.children.length; i < l; i++) {
      this._isospaceLayer.children[i].interactive = true;
    }
  };

  ObjectMode.prototype.disable = function () {
    for (var i = 0, l = this._isospaceLayer.children.length; i < l; i++) {
      this._isospaceLayer.children[i].interactive = false;
    }
  };

  ObjectMode.prototype.onkeydown = function (evt) {
    this._isChangingHeight = evt.ctrlKey;
  };

  ObjectMode.prototype.onkeyup = function (evt) {
    this._isChangingHeight = evt.ctrlKey;
  };

  ObjectMode.prototype.onmousedown = function (evt) {
    this.startFlow('moving-object');
    this._movingObject = true;
    this._lastPointerCoordinates =
      metrics.getMapCoordinates(evt.viewportCoordinates);
  };

  ObjectMode.prototype.onmouseup = function () {
    this._movingObject = false;
    this._model.selectObject(null);
    this.endFlow('moving-object');
  };

  ObjectMode.prototype.onmousemove = function (evt) {
    var selectedObject = this._model.getSelectedObject();
    if (!this._movingObject || !selectedObject) { return; }

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
    var currentPosition = selectedObject.getPosition();
    selectedObject.setPosition([
      currentPosition[0] + deltaX,
      currentPosition[1] + deltaY,
      currentPosition[2] + deltaZ
    ]);

    this._lastPointerCoordinates = mapPoint;
  };

  ObjectMode.prototype._addObject = function (evt) {
    var objectNode = evt.node;
    ObjectFragment.getFragments(objectNode).forEach(function (objectFragment) {
      this._isospace.addFragment(objectFragment);
      this._updatePrimitiveList(objectFragment);
    }.bind(this));
  };

  ObjectMode.prototype._removeObject = function (evt) {
    this._isospace.removeNode(evt.node);
    // this._removeFromPrimitiveList(evt.node);
  };

  ObjectMode.prototype.OBJECT_ID = 1;

  ObjectMode.prototype._updatePrimitiveList = function (fragment) {
    //var li = document.createElement('li');
    //var deleteButton = document.createElement('button');
    //deleteButton.textContent = 'delete';
    //deleteButton.type = 'button';
    //li.dataset.id = fragment.node.id;
    //li.textContent = 'primitive-' + this.OBJECT_ID++;
    //li.appendChild(deleteButton);
    //this._primitiveList.insertBefore(li, this._primitiveList.firstChild);

    fragment.render.addEventListener('mouseover', function () {
      this._model.focusObject(fragment.node);
    }.bind(this));

    fragment.render.addEventListener('mousedown', function () {
      this._model.selectObject(fragment.node);
    }.bind(this));

    //deleteButton.addEventListener('click', function () {
      //this._model.deletePrimitive(fragment.node);
    //}.bind(this));
  };

  ObjectMode.prototype._removeFromPrimitiveList =
  function (primitive) {
    var li =
      this._primitiveList.querySelector('[data-id="' + primitive.id + '"]');
    li.parentNode.removeChild(li);
  };

  return ObjectMode;
});
