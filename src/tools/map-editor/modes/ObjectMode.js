
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

    this._importObjectButton =
      this._root.querySelector('#import-object-button');
    this._importObjectInput = this._root.querySelector('#import-object-input');

    this._importObjectButton.addEventListener('click', function (evt) {
      this._importObjectInput.click();
    }.bind(this));

    this._importObjectInput.addEventListener(
      'change',
      this._importObject.bind(this)
    );

    this._model
      .addEventListener('objectAddedToMap', this._addObject.bind(this));
    this._model
      .addEventListener('objectRemovedFromMap', this._removeObject.bind(this));
    this._model
      .addEventListener('objectAddedToPalette', this._updatePalette.bind(this));

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

  ObjectMode.prototype._importObject = function (evt) {
    var file = evt.target.files[0];
    var fileReader = new FileReader();
    fileReader.onloadend = function () {
      var stream = fileReader.result;
      this._model.importObject(stream);
    }.bind(this);
    fileReader.readAsText(file);
    evt.target.value = '';
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

  ObjectMode.prototype._updatePalette = function (evt) {
    var hobject = evt.object;
    var objectList = this._root.querySelector('#object-list');
    var nextIndex = objectList.querySelectorAll('li').length;
    var li = document.createElement('LI');
    var radio = document.createElement('INPUT');
    radio.name = 'object';
    radio.id = 'object-' + this.OBJECT_ID++;
    radio.type = 'radio';
    var label = document.createElement('LABEL');
    label.setAttribute('for', radio.id);
    // TODO: Compute thumbnail in a smarter way!
    var img = document.createElement('IMG');
    img.src = hobject.textures[0].data;
    img.style.height = '10rem';
    label.appendChild(img);
    li.appendChild(radio);
    li.appendChild(label);
    objectList.appendChild(li);
  };

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

  return ObjectMode;
});
