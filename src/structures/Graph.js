define([
  'S'
], function(S) {
  'use strict';

  function Graph(nodes, relationship) {
    S.theObject(this)
      .has('relationship', relationship);
    this.nodes = nodes;
    this.buildGraph();
  }

  Graph.prototype.buildGraph = function () {
    var relationship = this.relationship;
    var graph = this._graph = {},
        nodes = this.nodes, lastIndex = nodes.length - 1;

    for (var i = lastIndex, node; node = nodes[i]; i--) {
      for (var j = lastIndex, another; another = nodes[j]; j--) {
        if (j == i) continue;
        if (relationship(node, another)) {
          if (!graph[node.id]) {
            graph[node.id] = {};
          }
          graph[node.id][another.id] = another;
        }
      }
    }
  };

  // Based on http://en.wikipedia.org/wiki/Topological_sorting
  // depth first search algorithm
  Graph.prototype.sort = function() {
    var sorted = new Array(this.nodes.length),
        graph = this._graph,
        nodes = this.nodes,
        lastIndex = nodes.length - 1,
        resultIndex = lastIndex;

    for (var i = lastIndex, node; node = nodes[i]; i--) {
      node.__visited__ = false;
    }

    for (var i = lastIndex, node; node = nodes[i]; i--) {
      if (node.__visited__) continue;
      visit(node);
    }

    function visit(node) {
      if (node.__visited__ === 'inprogress') {
        console.warn('Impossible to compute a topological sorting.');
      }
      if (!node.__visited__) {
        node.__visited__ = 'inprogress'; // XXX: not used at the moment
        for (var adjacentId in graph[node.id]) {
          visit(graph[node.id][adjacentId]);
        }
        node.__visited__ = true;
        sorted[resultIndex--] = node;
      }
    }

    this.nodes = sorted;
  };

  return Graph;
});
