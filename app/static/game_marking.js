// Generated by CoffeeScript 1.9.0
(function() {
  var $pointAt, game_common, game_marking, getEmptyRegions, go_rules, markStonesAround, reviveAroundRegion, setInitialDead, setRegionScores, setupScoring, smartgame, tesuji_charm, togglePoints, updateForm,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (window.tesuji_charm == null) {
    window.tesuji_charm = {};
  }

  tesuji_charm = window.tesuji_charm;

  if (tesuji_charm.game_marking == null) {
    tesuji_charm.game_marking = {};
  }

  game_marking = tesuji_charm.game_marking;

  smartgame = tesuji_charm.smartgame;

  game_common = tesuji_charm.game_common;

  $pointAt = game_common.$pointAt;

  go_rules = tesuji_charm.go_rules;

  game_marking.initialize = function() {
    var data, sgf_object;
    data = $('input#data').val();
    sgf_object = (function() {
      switch (false) {
        case !data:
          return smartgame.parse(data);
        default:
          return smartgame.parse('(;)');
      }
    })();
    game_common.initialize(sgf_object);
    setInitialDead(sgf_object);
    setupScoring();
    return $('table.goban td').click(function() {
      var col, row, _ref;
      if (!game_common.hasCoordClass($(this))) {
        return;
      }
      _ref = game_common.parseCoordClass($(this)), row = _ref[0], col = _ref[1];
      markStonesAround(col, row);
      return setupScoring();
    });
  };

  setInitialDead = function(sgf_object) {
    "mark dead stones on the DOM according to the supplied SGF object";
    var $point, asciiCoords, color, last_node, nodes, tbs, tws, x, y, _i, _len, _ref;
    nodes = sgf_object.gameTrees[0].nodes;
    last_node = nodes[nodes.length - 1];
    tws = last_node.TW || [];
    tbs = last_node.TB || [];
    _ref = tws.concat(tbs);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      asciiCoords = _ref[_i];
      x = asciiCoords.charCodeAt(0) - 'a'.charCodeAt(0);
      y = asciiCoords.charCodeAt(1) - 'a'.charCodeAt(0);
      $point = $pointAt(x, y);
      color = game_common.colorFromDom($point);
      if (color !== 'whitedead' && color !== 'blackdead') {
        markStonesAround(x, y);
      }
    }
  };

  setupScoring = function() {
    "set/remove scoring classes on the DOM based on current live/dead state of all stones";
    var boundary, col, region, row, state, _i, _len, _ref, _ref1;
    state = game_common.readBoardState();
    _ref = getEmptyRegions(state);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      region = _ref[_i];
      _ref1 = region[0], col = _ref1[0], row = _ref1[1];
      boundary = go_rules.boundingColor(region, state);
      setRegionScores(region, (function() {
        switch (boundary) {
          case 'black':
            return 'blackscore';
          case 'white':
            return 'whitescore';
          case 'neither':
            return 'empty';
          default:
            throw new Error("invalid boundary color: '" + boundary + "'");
        }
      })());
    }
    updateForm();
  };

  getEmptyRegions = function(state) {
    var col, color, done, emptyColors, height, i, j, region, regions, row, rowArray, width, x, y, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    regions = [];
    emptyColors = ['empty', 'blackdead', 'whitedead'];
    height = state.length;
    width = state[0].length;
    done = (function() {
      var _i, _results;
      _results = [];
      for (j = _i = 0; 0 <= height ? _i <= height : _i >= height; j = 0 <= height ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (i = _j = 0; 0 <= width ? _j <= width : _j >= width; i = 0 <= width ? ++_j : --_j) {
            _results1.push(false);
          }
          return _results1;
        })());
      }
      return _results;
    })();
    for (row = _i = 0, _len = state.length; _i < _len; row = ++_i) {
      rowArray = state[row];
      for (col = _j = 0, _len1 = rowArray.length; _j < _len1; col = ++_j) {
        color = rowArray[col];
        if (done[row][col]) {
          continue;
        }
        if (_ref = state[row][col], __indexOf.call(emptyColors, _ref) >= 0) {
          region = go_rules.groupPoints(col, row, state, emptyColors);
          for (_k = 0, _len2 = region.length; _k < _len2; _k++) {
            _ref1 = region[_k], x = _ref1[0], y = _ref1[1];
            done[y][x] = true;
          }
          regions.push(region);
        }
      }
    }
    return regions;
  };

  setRegionScores = function(region, scoreColor) {
    var $point, x, y, _i, _len, _ref;
    for (_i = 0, _len = region.length; _i < _len; _i++) {
      _ref = region[_i], x = _ref[0], y = _ref[1];
      $point = $pointAt(x, y);
      if (game_common.colorFromDom($point) === 'empty') {
        game_common.setPointColor($point, scoreColor);
      }
    }
  };

  markStonesAround = function(x, y) {
    "Toggle the life/death status of the given point and all friendly stones in the region (ie. the area bounded by unfriendly stones).  If killing stones, also revive surrounding enemy stones. We don't trigger scoring recalculation here, that's for the caller to do.";
    var color, isKilling, region, state;
    color = game_common.colorFromDom($pointAt(x, y));
    if (color === 'empty') {
      return;
    }
    isKilling = color === 'black' || color === 'white';
    state = game_common.readBoardState();
    region = go_rules.groupPoints(x, y, state, ['empty', color]);
    togglePoints(region);
    if (isKilling) {
      reviveAroundRegion(region, state);
    }
  };

  reviveAroundRegion = function(region, state) {
    "Revive all dead groups touching, but not in, the given region; together with friendly stones in their own regions.";
    var height, i, ignore, j, neighborColor, neighborRegion, width, x, xg, xn, y, yg, yn, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;
    height = state.length;
    width = state[0].length;
    ignore = (function() {
      var _i, _results;
      _results = [];
      for (j = _i = 0; 0 <= height ? _i <= height : _i >= height; j = 0 <= height ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (i = _j = 0; 0 <= width ? _j <= width : _j >= width; i = 0 <= width ? ++_j : --_j) {
            _results1.push(false);
          }
          return _results1;
        })());
      }
      return _results;
    })();
    for (_i = 0, _len = region.length; _i < _len; _i++) {
      _ref = region[_i], x = _ref[0], y = _ref[1];
      ignore[y][x] = true;
    }
    for (_j = 0, _len1 = region.length; _j < _len1; _j++) {
      _ref1 = region[_j], x = _ref1[0], y = _ref1[1];
      _ref2 = go_rules.neighboringPoints(x, y, state);
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        _ref3 = _ref2[_k], xn = _ref3[0], yn = _ref3[1];
        if (ignore[yn][xn]) {
          continue;
        }
        ignore[yn][xn] = true;
        neighborColor = state[yn][xn];
        if (neighborColor === 'blackdead' || neighborColor === 'whitedead') {
          neighborRegion = go_rules.groupPoints(xn, yn, state, ['empty', neighborColor]);
          togglePoints(neighborRegion);
          for (_l = 0, _len3 = neighborRegion.length; _l < _len3; _l++) {
            _ref4 = neighborRegion[_l], xg = _ref4[0], yg = _ref4[1];
            ignore[yg][xg] = true;
          }
        }
      }
    }
  };

  togglePoints = function(points) {
    "Among the given points, mark live stones as dead and dead stones as alive.";
    var $point, color, newColor, x, y, _i, _len, _ref;
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      _ref = points[_i], x = _ref[0], y = _ref[1];
      $point = $pointAt(x, y);
      color = game_common.colorFromDom($point);
      if (color === 'empty') {
        continue;
      }
      newColor = (function() {
        switch (color) {
          case 'black':
            return 'blackdead';
          case 'white':
            return 'whitedead';
          case 'blackdead':
            return 'black';
          case 'whitedead':
            return 'white';
          default:
            return null;
        }
      })();
      if (newColor) {
        game_common.setPointColor($point, newColor);
      }
    }
  };

  updateForm = function() {
    "Update the hidden form that communicates our marks back to the server, based on the current DOM state.";
    var dead_stones, point, row, state, x, y, _i, _j, _len, _len1;
    dead_stones = [];
    state = game_common.readBoardState();
    for (y = _i = 0, _len = state.length; _i < _len; y = ++_i) {
      row = state[y];
      for (x = _j = 0, _len1 = row.length; _j < _len1; x = ++_j) {
        point = row[x];
        if ((point === 'blackdead') || (point === 'whitedead')) {
          dead_stones.push([x, y]);
        }
      }
    }
    $('input#dead_stones').val(JSON.stringify(dead_stones));
  };

}).call(this);
