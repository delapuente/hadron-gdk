
define([
  'S',
  'worldmap/Path',
  'worldmap/Location',
  'worldmap/WorldMap'
], function (S, Path, Location, WorldMap) {
  'use strict';

  var VERSION = '1.0';
  var FORMAT = 'json';
  var CLASS = 'WorldMap';

  function simplify(wmap) {
    var simple = {
      locations: [],
      paths: [],
      __class__: CLASS,
      __format__: FORMAT,
      __version__: VERSION
    };

    if (wmap instanceof WorldMap) {
      // Save paths
      wmap.paths.forEach(function (path) {
        simple.paths.push({
          start: wmap.locations.indexOf(path.start), // ref to locations
          end: wmap.locations.indexOf(path.end),     // ref to locations
          _interPoints: JSON.parse(JSON.stringify(path._interPoints)),
          _length: path._length
        });
      });

      // Save locations
      wmap.locations.forEach(function (mapLocation) {
        simple.locations.push({
          _position: mapLocation.getPosition(),
          _name: mapLocation.getName(),
          _isPopulated: mapLocation.isPopulated()
        });
      });
    }
    else {
      console.error('Could not serialize an object from a class different of' +
                    CLASS);
      simple = undefined;
    }
    return simple;
  }

  function enrich(simple) {
    var wmap = null;

    if (!simple) {
      console.error('JSON representation is not valid.');
    }
    else {

      if (!matchConstrains(simple)) {
        console.warn('The stream is not a compliant wmap. Could be errors ' +
                     'while importing.');
      }

      var locations = simple.locations.map(function (simpleLocation) {
        var mapLocation = new Location(
          simpleLocation._position,
          simpleLocation._name
        );
        mapLocation.setIsPopulated(simpleLocation._isPopulated);
        return mapLocation;
      });

      var paths = simple.paths.map(function (simplePath) {
        var path = new Path(
          locations[simplePath.start],
          locations[simplePath.end],
          simplePath._interPoints
        );
        return path;
      });

      wmap = new WorldMap({
        background: simple.background,
        locations: locations,
        paths: paths
      });
    }

    return wmap;
  }

  function serialize(wmap, meta) {
    var jsonString = null;
    var simpleObject = simplify(wmap);
    simpleObject.__meta__ = meta || {};
    if (typeof simpleObject !== 'undefined') {
      jsonString = JSON.stringify(simpleObject);
    }
    return jsonString;
  }

  function deserialize(jsonString) {
    var simple = null;

    try {
      simple = JSON.parse(jsonString);
    } catch (e) {}

    return { data: enrich(simple), meta: simple.__meta__ || {} };
  }

  function matchConstrains(simple) {
    return simple.__class__   === CLASS &&
           simple.__format__  === FORMAT &&
           simple.__version__ === VERSION;
  }

  return {
    simplify: simplify,
    enrich: enrich,
    serialize: serialize,
    deserialize: deserialize
  };
});
