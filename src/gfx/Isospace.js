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

  function Isospace() {
    Model.apply(this);
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

  function IsospaceRender(isospace) {
    Render.apply(this);
    this._gfxSystem = GfxSystem.getSystem();
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
    this._gfxSystem.clearIsospace();
    fragments.forEach(function (fragment) {
      this._gfxSystem.addToIsospace(fragment.render._graphic);
    }, this);
  };

  return Isospace;
});
