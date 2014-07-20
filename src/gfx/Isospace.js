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

    // Build the graph
    fragmentGraph.nodes.push(fragment);
    fragmentGraph.buildGraph();

    // Sort the graph
    fragmentGraph.sort();

    this.dispatchEvent('newFragmentAdded', {
      fragment: fragment
    });
  };

  function IsospaceRender(isospace, layer) {
    Render.apply(this);
    this._layer = layer;
    this._isospace = isospace;
    this._isospace.addEventListener(
      'newFragmentAdded',
      this._onFragmentAdded.bind(this)
    );
  }
  S.theClass(IsospaceRender).inheritsFrom(Render);

  IsospaceRender.prototype._onFragmentAdded = function (evt) {
    var sortedFragments = this._isospace.graph.nodes;
    this.buildScene(sortedFragments);
  };

  IsospaceRender.prototype.buildScene = function (fragments) {
    this._clearLayer();
    fragments.forEach(function (fragment) {
      this._layer.addChild(fragment.render._graphic);
    }, this);
  };

  IsospaceRender.prototype._clearLayer = function () {
    while (this._layer.children.length > 0) {
      this._layer.removeChild(this._layer.getChildAt(0));
    }
  };

  return Isospace;
});
