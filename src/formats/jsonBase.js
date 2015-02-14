define([
], function () {
  'use strict';

  var FORMAT = 'json';

  return {
    serialize: function (obj, meta) {
      var jsonString = null;
      var simpleObject = {
        __class__: this.CLASS,
        __version__: this.VERSION,
        __format__: FORMAT
      };
      this.simplify(obj, simpleObject);
      simpleObject.__meta__ = meta || {};
      if (typeof simpleObject !== 'undefined') {
        jsonString = JSON.stringify(simpleObject);
      }
      return jsonString;
    },

    deserialize: function (jsonString) {
      var simple = null;

      try {
        simple = JSON.parse(jsonString);
      }
      catch (e) {
        console.error('JSON representation is not valid.');
        console.error(e);
      }

      if (!this.matchConstrains(simple)) {
        console.warn('The stream is not a compliant wmap. Could be errors ' +
                     'while importing.');
      }
      var revived = this.enrich(simple);
      return { data: revived, meta: simple.__meta__ || {} };
    },

    matchConstrains: function (simple) {
      return simple.__class__   === this.CLASS &&
             simple.__format__  === FORMAT &&
             simple.__version__ === this.VERSION;
    }
  };
});
