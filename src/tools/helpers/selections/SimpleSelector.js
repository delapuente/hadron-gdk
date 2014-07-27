
define([
  'S',
  'lib/strongforce',
  'tools/helpers/selections/SimpleSelectorRender'
], function (S, strongforce, SimpleSelectorRender) {

  var Model = strongforce.Model;

  function SimpleSelector(selection) {
    Model.apply(this);
    this.setSelection(selection);
  }
  S.theClass(SimpleSelector).inheritsFrom(Model);

  SimpleSelector.prototype.render = SimpleSelectorRender;

  SimpleSelector.prototype.getSelection = function () {
    return this._selection;
  };

  SimpleSelector.prototype.setSelection = function (selection) {
    this._selection = selection || null;
    this.proxyEventsFrom(this._selection);
    this.dispatchEvent('selectionChanged', { selection: selection });
  };

  return SimpleSelector;
});
