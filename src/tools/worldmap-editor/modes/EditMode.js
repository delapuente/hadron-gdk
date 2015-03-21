
define([
  'S',
  'tools/mixins/UIMode',
  'tools/helpers/propertyeditor/propertyeditor'
], function (S, UIMode, PropertyEditor) {
  'use strict';

  function EditMode(control, model, root) {
    UIMode.call(this, control);
    this._model = model;
    this._root = root;
  }
  S.theClass(EditMode).inheritsFrom(UIMode);

  EditMode.prototype.onclick = function (evt) {
    var descriptor;
    var point = evt.viewportCoordinates;
    var nearestLocation = this._model.getNearLocation(point);
    var nearestPath = this._model.getNearPath(point);
    if (nearestLocation) {
      descriptor = {
        get name() { return nearestLocation.getName(); },
        set name(value) { nearestLocation.setName(value); },
        get isPopulated() { return nearestLocation.isPopulated(); },
        set isPopulated(value) { nearestLocation.setPopulated(value); }
      };
    }
    else if (nearestPath) {
      descriptor = {
        get milestones() { return nearestPath.getMilestonesCount(); },
        set milestones(value) { nearestPath.setMilestonesCount(value); },
      };
    }
    if (descriptor) {
      var editor = new PropertyEditor(descriptor);
      this._root.innerHTML = '';
      this._root.appendChild(editor.getElement());
    }
  };

  return EditMode;
});
