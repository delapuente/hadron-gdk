define([
  'S',
  'lib/strongforce',
  'gfx/System',
  'structures/Graph'
], function (S, strongforce, GfxSystem, Graph) {

  var Model = strongforce.Model;
  var Render = strongforce.Render;

  function isOverlappedBy(fragmentA, fragmentB) {
    return fragmentA.getOverlapped(fragmentB) === fragmentA;
  }

  function Isospace(layer) {
    Model.apply(this, arguments);
    S.theObject(this).has('graph', new Graph([], isOverlappedBy));
  };
  S.theClass(Isospace).inheritsFrom(Model);

  Isospace.prototype.render = IsospaceRender;

  Isospace.prototype.addFragment = function (fragment) {
    var fragmentGraph = this.graph;
    fragmentGraph.nodes.push(fragment);

    // Subscribe to fragment alterations
    fragment.addEventListener(
      'positionChanged',
      this._onFragmentChanged.bind(this)
    );
    fragment.addEventListener(
      'dimensionsChanged',
      this._onFragmentChanged.bind(this)
    );

    this.dispatchEvent('newFragmentAdded', {
      fragment: fragment
    });
    this._dispatchIsospaceChanged();
  };

  Isospace.prototype.removeFragment = function (fragment) {
    var fragmentGraph = this.graph;
    fragmentGraph.nodes.splice(fragmentGraph.nodes.indexOf(fragment), 1);
    this._dispatchIsospaceChanged();
  };

  Isospace.prototype._onFragmentChanged = function () {
    this._dispatchIsospaceChanged();
  };

  Isospace.prototype._dispatchIsospaceChanged = function () {
    this._sortSpace();
    this.dispatchEvent('isospaceChanged', {
      sortedFragments: this.graph.nodes
    });
  };

  Isospace.prototype._sortSpace = function () {
    var fragmentGraph = this.graph;
    fragmentGraph.buildGraph();
    fragmentGraph.sort();
  };

  function IsospaceRender(isospace, layer) {
    Render.apply(this);
    this._layer = layer;
    this._isospace = isospace;
    this._isospace.addEventListener(
      'isospaceChanged',
      this._onIsospaceChanged.bind(this)
    );
  }
  S.theClass(IsospaceRender).inheritsFrom(Render);

  IsospaceRender.prototype._onIsospaceChanged = function (evt) {
    var sortedFragments = this._isospace.graph.nodes;
    this.buildScene(sortedFragments);
  };

  IsospaceRender.prototype.buildScene = function (fragments) {
    this._clearLayer();
    fragments.forEach(function (fragment) {
      this._layer.addChild(fragment.render.graphic);
    }, this);
  };

  IsospaceRender.prototype._clearLayer = function () {
    while (this._layer.children.length > 0) {
      this._layer.removeChild(this._layer.getChildAt(0));
    }
  };

  return Isospace;
});
