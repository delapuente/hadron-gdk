
define([
  'S'
], function (S) {
  'use strict';

  function TextureMode(control, root, model, textureLayer) {
    this._control = control;
    this._root = root;
    this._model = model;
    this._textureLayer = textureLayer;

    this._addNewTexture = root.querySelector('#add-new-texture');
    this._textureList = root.querySelector('#texture-list');
    this._addNewTexture.addEventListener('change', this._loadImage.bind(this));

    this._model.addEventListener('textureAdded', this._addTexture.bind(this));
    this._model
      .addEventListener('textureDeleted', this._deleteTexture.bind(this));

    this._lastPointerCoordinates = null;
  }

  TextureMode.prototype.onmousedown = function (evt) {
    this._control.notifyStartOfFlow('moving-texture');
    this._movingTexture = true;
    this._lastPointerCoordinates = evt.viewportCoordinates;
  };

  TextureMode.prototype.onmouseup = function () {
    this._movingTexture = false;
    this._control.notifyEndOfFlow('moving-texture');
  };

  TextureMode.prototype.onmousemove = function (evt) {
    if (!this._movingTexture || !this._selectedTexture) { return; }

    var currentPointerCoordinates = evt.viewportCoordinates;
    var deltaX = currentPointerCoordinates[0] - this._lastPointerCoordinates[0];
    var deltaY = currentPointerCoordinates[1] - this._lastPointerCoordinates[1];
    var currentPosition = this._selectedTexture.getPosition();
    this._selectedTexture.setPosition([
      currentPosition[0] + deltaX,
      currentPosition[1] + deltaY
    ]);

    this._lastPointerCoordinates = currentPointerCoordinates;
  };

  TextureMode.prototype._loadImage = function () {
    var newTexture = this._addNewTexture.files[0];
    var objectURL = URL.createObjectURL(newTexture);
    this._model.addNewTexture(objectURL, newTexture.name);
    this._addNewTexture.value = '';
  };

  TextureMode.prototype._addTexture = function (evt) {
    var texture = evt.texture;
    this._textureLayer.addChild(texture.render.graphic);
    this._updateTextureList(texture);
  };

  TextureMode.prototype._deleteTexture = function (evt) {
    var texture = evt.texture;
    this._textureLayer.removeChild(texture.render.graphic);
    this._removeFromTextureList(texture);
  };

  TextureMode.prototype._updateTextureList = function (texture) {
    var li = document.createElement('li');
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'delete';
    deleteButton.type = 'button';
    li.dataset.id = texture.id;
    li.textContent = texture.name;
    li.appendChild(deleteButton);
    this._textureList.insertBefore(li, this._textureList.firstChild);

    texture.render.addEventListener('mousedown', function () {
      li.classList.add('active');
      this._selectedTexture = texture;
    }.bind(this));
    deleteButton.addEventListener('click', function () {
      this._model.deleteTexture(texture);
    }.bind(this));
  };

  TextureMode.prototype._removeFromTextureList = function (texture) {
    var li = this._textureList.querySelector('[data-id="' + texture.id + '"]');
    li.parentNode.removeChild(li);
  };

  return TextureMode;
});
