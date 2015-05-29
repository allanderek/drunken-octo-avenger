// Generated by CoffeeScript 1.9.0
(function() {
  var $pointAt, aCode, colRe, colorFromDom, decodeSgfCoord, encodeSgfCoord, game_common, getInputSgf, go_rules, hasCoordClass, parseCoordClass, readBoardState, rowRe, setImage, setPointColor, setStoneClass, smartgame, tesuji_charm, updateBoard,
    __hasProp = {}.hasOwnProperty;

  if (window.tesuji_charm == null) {
    window.tesuji_charm = {};
  }

  tesuji_charm = window.tesuji_charm;

  if (tesuji_charm.game_common == null) {
    tesuji_charm.game_common = {};
  }

  game_common = tesuji_charm.game_common;

  smartgame = tesuji_charm.smartgame;

  go_rules = tesuji_charm.go_rules;

  game_common.$pointAt = $pointAt = function(x, y) {
    return $(".row-" + y + ".col-" + x);
  };

  game_common.getInputSgf = getInputSgf = function() {
    return $('input#data').val();
  };

  game_common.setPointColor = setPointColor = function($td, color) {
    var filename, stoneclass, _ref;
    _ref = (function() {
      switch (color) {
        case 'empty':
          return ['e.gif', 'nostone'];
        case 'black':
          return ['b.gif', 'blackstone'];
        case 'white':
          return ['w.gif', 'whitestone'];
        case 'blackdead':
          return ['bdwp.gif', 'blackdead whitescore'];
        case 'whitedead':
          return ['wdbp.gif', 'whitedead blackscore'];
        case 'blackscore':
          return ['bp.gif', 'blackscore nostone'];
        case 'whitescore':
          return ['wp.gif', 'whitescore nostone'];
      }
    })(), filename = _ref[0], stoneclass = _ref[1];
    setImage($td, filename);
    return setStoneClass($td, stoneclass);
  };

  setImage = function($td, filename) {
    return $td.find('img').attr('src', "/static/images/goban/" + filename);
  };

  setStoneClass = function($td, stoneclass) {
    return $td.removeClass('blackstone whitestone nostone blackdead whitedead blackscore whitescore').addClass(stoneclass);
  };

  game_common.colorFromDom = colorFromDom = function($point) {
    "return the color of the given point based on the DOM status";
    if ($point.hasClass('blackstone')) {
      return 'black';
    }
    if ($point.hasClass('whitestone')) {
      return 'white';
    }
    if ($point.hasClass('blackdead')) {
      return 'blackdead';
    }
    if ($point.hasClass('whitedead')) {
      return 'whitedead';
    }
    return 'empty';
  };

  rowRe = /row-(\d+)/;

  colRe = /col-(\d+)/;

  game_common.hasCoordClass = hasCoordClass = function($obj) {
    var classStr;
    classStr = $obj.attr("class");
    return rowRe.test(classStr) && colRe.test(classStr);
  };

  game_common.parseCoordClass = parseCoordClass = function($obj) {
    var classStr, colStr, rowStr, _, _ref, _ref1;
    classStr = $obj.attr("class");
    _ref = rowRe.exec(classStr), _ = _ref[0], rowStr = _ref[1];
    _ref1 = colRe.exec(classStr), _ = _ref1[0], colStr = _ref1[1];
    return [parseInt(rowStr, 10), parseInt(colStr, 10)];
  };

  game_common.readBoardState = readBoardState = function() {
    "generate a board state object based on the loaded page contents";
    var result;
    result = [];
    $('.goban td').each(function() {
      var $this, col, row, _ref;
      $this = $(this);
      _ref = parseCoordClass($this), row = _ref[0], col = _ref[1];
      if (result[row] == null) {
        result[row] = [];
      }
      return result[row][col] = colorFromDom($this);
    });
    return result;
  };

  game_common.updateBoard = updateBoard = function(state) {
    "set the images and classes of the DOM board to match the given state";
    var col, color, row, rowArray, _i, _j, _len, _len1;
    for (row = _i = 0, _len = state.length; _i < _len; row = ++_i) {
      rowArray = state[row];
      for (col = _j = 0, _len1 = rowArray.length; _j < _len1; col = ++_j) {
        color = rowArray[col];
        setPointColor($pointAt(col, row), color);
      }
    }
  };

  game_common.initialize = function(sgf_object) {
    var board_state, coordStr, coords, i, j, node, size, tableContentsStr, tr, x, y, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _ref1, _ref2, _ref3, _ref4;
    $('.goban').remove();
    $('#content').append('<table class="goban"></table>');
    if (!sgf_object) {
      if (getInputSgf() !== '') {
        sgf_object = smartgame.parse(getInputSgf());
      }
    }
    size = sgf_object ? parseInt(sgf_object.gameTrees[0].nodes[0].SZ) || 19 : 19;
    tableContentsStr = '';
    for (j = _i = 0; 0 <= size ? _i < size : _i > size; j = 0 <= size ? ++_i : --_i) {
      tr = '<tr>';
      for (i = _j = 0; 0 <= size ? _j < size : _j > size; i = 0 <= size ? ++_j : --_j) {
        tr += "<td class='row-" + j + " col-" + i + " nostone'>";
        tr += "<img src='static/images/goban/e.gif' />'";
        tr += "</td>";
      }
      tr += '</tr>';
      tableContentsStr += tr;
    }
    $('.goban').append(tableContentsStr);
    if (getInputSgf() !== '') {
      board_state = (function() {
        var _k, _results;
        _results = [];
        for (j = _k = 0; 0 <= size ? _k < size : _k > size; j = 0 <= size ? ++_k : --_k) {
          _results.push((function() {
            var _l, _results1;
            _results1 = [];
            for (i = _l = 0; 0 <= size ? _l < size : _l > size; i = 0 <= size ? ++_l : --_l) {
              _results1.push('empty');
            }
            return _results1;
          })());
        }
        return _results;
      })();
      _ref = sgf_object.gameTrees[0].nodes;
      for (_k = 0, _len = _ref.length; _k < _len; _k++) {
        node = _ref[_k];
        if (node.B) {
          _ref1 = decodeSgfCoord(node.B), x = _ref1[0], y = _ref1[1];
          board_state = go_rules.getNewState('black', x, y, board_state);
        }
        if (node.W) {
          _ref2 = decodeSgfCoord(node.W), x = _ref2[0], y = _ref2[1];
          board_state = go_rules.getNewState('white', x, y, board_state);
        }
        if (node.AB) {
          coords = Array.isArray(node.AB) ? node.AB : [node.AB];
          for (_l = 0, _len1 = coords.length; _l < _len1; _l++) {
            coordStr = coords[_l];
            _ref3 = decodeSgfCoord(coordStr), x = _ref3[0], y = _ref3[1];
            board_state[y][x] = 'black';
          }
        }
        if (node.AW) {
          coords = Array.isArray(node.AW) ? node.AW : [node.AW];
          for (_m = 0, _len2 = coords.length; _m < _len2; _m++) {
            coordStr = coords[_m];
            _ref4 = decodeSgfCoord(coordStr), x = _ref4[0], y = _ref4[1];
            board_state[y][x] = 'white';
          }
        }
      }
      updateBoard(board_state);
    }
  };

  aCode = 'a'.charCodeAt(0);

  game_common.decodeSgfCoord = decodeSgfCoord = function(coordStr) {
    var x, y;
    x = coordStr.charCodeAt(0) - aCode;
    y = coordStr.charCodeAt(1) - aCode;
    return [x, y];
  };

  game_common.encodeSgfCoord = encodeSgfCoord = function(x, y) {
    var encodedX, encodedY;
    encodedX = String.fromCharCode(aCode + x);
    encodedY = String.fromCharCode(aCode + y);
    return encodedX + encodedY;
  };

  game_common.cloneSgfObject = function(sgfObject) {
    "The trick here is that 'parent' attributes must be replaced with the parent in the new copy instead of pointing to the old one.";
    var cloneArrayRecursive, cloneObjectRecursive, getClone;
    getClone = function(v, self, k, parent) {
      if (k == null) {
        k = null;
      }
      if (parent == null) {
        parent = null;
      }
      switch (false) {
        case k !== 'parent':
          return parent;
        case !Array.isArray(v):
          return cloneArrayRecursive(v);
        case v !== Object(v):
          return cloneObjectRecursive(v, self);
        default:
          return v;
      }
    };
    cloneObjectRecursive = function(subObject, parent) {
      var k, result, v;
      result = {};
      for (k in subObject) {
        if (!__hasProp.call(subObject, k)) continue;
        v = subObject[k];
        result[k] = getClone(v, result, k, parent);
      }
      return result;
    };
    cloneArrayRecursive = function(subArray) {
      var result, v, _i, _len;
      result = [];
      for (_i = 0, _len = subArray.length; _i < _len; _i++) {
        v = subArray[_i];
        result.push(getClone(v, result));
      }
      return result;
    };
    return cloneObjectRecursive(sgfObject, null);
  };

}).call(this);
