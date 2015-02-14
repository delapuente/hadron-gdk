
define([
  'S',
  'formats/jsonBase',
  'worldmap/Path',
  'worldmap/Location',
  'worldmap/WorldMap'
], function (S, jsonBase, Path, Location, WorldMap) {
  'use strict';

  var module = {

    VERSION: '2.0',

    CLASS: 'WorldMap',

    simplify: function (wmap, simple) {
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
            _populated: mapLocation.isPopulated()
          });
        });
      }
      else {
        console.error('Could not serialize an object from a class different of' +
                      this.CLASS);
        simple = undefined;
      }
      return simple;
    },

    enrich: function (simple) {
      var wmap = null;

      var locations = simple.locations.map(function (simpleLocation) {
        var mapLocation = new Location(
          simpleLocation._position,
          simpleLocation._name
        );
        var populated = simpleLocation._isPopulated ||
                        simpleLocation._populated;
        mapLocation.setPopulated(simpleLocation._isPopulated);
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

      return wmap;
    }
  };
  S.the(module).mix(jsonBase);

  return module;
});
