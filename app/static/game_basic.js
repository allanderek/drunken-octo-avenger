// Generated by CoffeeScript 1.9.0
(function() {
  var $new_stone, colRe, game_basic, hasCoordClass, hasStoneClass, new_stone_image_path, parseCoordClass, rowRe, set_image, tesuji_charm;

  if (window.tesuji_charm == null) {
    window.tesuji_charm = {};
  }

  tesuji_charm = window.tesuji_charm;

  if (tesuji_charm.game_basic == null) {
    tesuji_charm.game_basic = {};
  }

  game_basic = tesuji_charm.game_basic;

  $new_stone = null;

  new_stone_image_path = null;

  set_image = function($td, filename) {
    return $td.find('img').attr('src', "static/images/goban/" + filename);
  };

  rowRe = /row-(\d+)/;

  colRe = /col-(\d+)/;

  hasCoordClass = function($obj) {
    var classStr;
    classStr = $obj.attr("class");
    return rowRe.test(classStr) && colRe.test(classStr);
  };

  parseCoordClass = function($obj) {
    var classStr, colStr, rowStr, _, _ref, _ref1;
    classStr = $obj.attr("class");
    _ref = rowRe.exec($obj.attr("class")), _ = _ref[0], rowStr = _ref[1];
    _ref1 = colRe.exec($obj.attr("class")), _ = _ref1[0], colStr = _ref1[1];
    return [parseInt(rowStr, 10), parseInt(colStr, 10)];
  };

  hasStoneClass = function($obj) {
    var classStr;
    classStr = $obj.attr("class");
    if (classStr.indexOf('blackstone') > -1) {
      return true;
    }
    if (classStr.indexOf('whitestone') > -1) {
      return true;
    }
    return false;
  };

  game_basic.initialize = function() {
    if (parseInt($('input#move_no').val()) % 2 === 0) {
      new_stone_image_path = 'b.gif';
    } else {
      new_stone_image_path = 'w.gif';
    }
    $('button.confirm_button').prop('disabled', true);
    return $('table.goban td').click(function() {
      var $old_new_stone, col, row, _ref;
      if (!hasCoordClass($(this))) {
        return;
      }
      if (hasStoneClass($(this))) {
        return;
      }
      $old_new_stone = $new_stone;
      $new_stone = $(this);
      if ($old_new_stone !== null) {
        set_image($old_new_stone, 'e.gif');
      }
      set_image($new_stone, new_stone_image_path);
      _ref = parseCoordClass($new_stone), row = _ref[0], col = _ref[1];
      $('input#row').val(row.toString());
      $('input#column').val(col.toString());
      return $('button.confirm_button').prop('disabled', false);
    });
  };

}).call(this);
