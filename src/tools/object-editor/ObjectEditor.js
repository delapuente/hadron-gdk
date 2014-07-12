
define([
  'S',
  'lib/strongforce',
], function (S, strongforce) {
  'use strict';

  var Model = strongforce.Model;

  function ObjectEditor() {
    Model.call(this);
  }
  S.theClass(ObjectEditor).inheritsFrom(Model);

  return ObjectEditor;
});
