
define([
  'S',
  'lib/strongforce',
  'gfx/System'
], function (S, strongforce, GfxSystem) {

  var Render = strongforce.Render;

  function SimpleSelectorRender(selector) {
    gfxSystem = GfxSystem.getSystem();
    this.graphic = new gfxSystem.Graphics();
    this._selector = selector;
    this._selector.addEventListener(
      'selectionChanged',
      this._onSelectionChanged.bind(this)
    );
    this._selector.addEventListener(
      'dimensionsChanged',
      this._dimensionsChanged.bind(this)
    );
  }
  S.theClass(SimpleSelectorRender).inheritsFrom(Render);

  SimpleSelectorRender.prototype._onSelectionChanged = function (evt) {
    this._drawSelection(evt.selection);
  };

  SimpleSelectorRender.prototype._dimensionsChanged = function (evt) {
    this._drawSelection(this._selector.getSelection());
  };

  SimpleSelectorRender.prototype._drawSelection = function (selection) {
    var graphic = this.graphic;
    graphic.clear();
    if (!selection) { return; }

    var bounds = selection.render.graphic.getLocalBounds();
    graphic.lineStyle(2, 0x008800, 1.0);
    graphic.moveTo(bounds.x, bounds.y);
    graphic.lineTo(bounds.x + bounds.width, bounds.y);
    graphic.lineTo(bounds.x + bounds.width, bounds.y + bounds.height);
    graphic.lineTo(bounds.x, bounds.y + bounds.height);
    graphic.lineTo(bounds.x, bounds.y);
  };

  return SimpleSelectorRender;
});
