// Generated by CoffeeScript 1.9.1
(function() {
  var clear_games_for_player, create_game, create_login_session, defaultHost, host, port, portString, serverUrl;

  defaultHost = "http://localhost";

  host = casper.cli.options['host'] || defaultHost;

  port = casper.cli.options['port'] || (host === defaultHost ? "5000" : "80");

  portString = port === "80" || port === 80 ? "" : ":" + port;

  if (!((host.match(/localhost/)) || (host.match(/staging/)))) {
    casper.die("Server url contains neither 'localhost' nor 'staging', aborting");
  }

  serverUrl = "" + host + portString;

  casper.echo("Testing against server at " + serverUrl);

  casper.test.begin('Test the login procedure', 2, function(test) {
    casper.start(serverUrl, function() {
      return test.assertTitle('Go', 'The front page title is the one expected');
    });
    casper.thenClick('#persona_login');
    casper.waitForPopup(/persona/);
    casper.withPopup(/persona/, function() {
      return test.assertTitleMatch(/Persona/i, 'Persona login popup has expected title');
    });
    return casper.then(function() {
      return test.done();
    });
  });

  casper.test.begin("Game interface", 23, function(test) {
    var ONE_EMAIL, TWO_EMAIL, countStonesAndPoints, pointSelector;
    casper.start();
    countStonesAndPoints = function() {
      var countImgsWith, counts;
      countImgsWith = function(name) {
        return casper.evaluate((function(name) {
          var allElems, allStrs, matching;
          allElems = $('table.goban img').toArray();
          allStrs = allElems.map(function(x) {
            return $(x).attr('src');
          });
          matching = allStrs.filter(function(x) {
            return x.indexOf(name) > -1;
          });
          return matching.length;
        }), name);
      };
      counts = {
        'empty': countImgsWith('e.gif'),
        'black': countImgsWith('b.gif'),
        'white': countImgsWith('w.gif')
      };
      return counts;
    };
    pointSelector = function(x, y) {
      return ".col-" + x + ".row-" + y;
    };
    test.assertPointMatches = function(x, y, regex) {
      var imgSrc;
      imgSrc = casper.evaluate((function(imgSel) {
        return $(imgSel).attr('src');
      }), pointSelector(x, y) + " img");
      return test.assertMatch(imgSrc, regex);
    };
    ONE_EMAIL = 'player@one.com';
    TWO_EMAIL = 'playa@dos.es';
    clear_games_for_player(ONE_EMAIL);
    clear_games_for_player(TWO_EMAIL);
    create_game(ONE_EMAIL, TWO_EMAIL);
    create_game(ONE_EMAIL, TWO_EMAIL);
    create_login_session(ONE_EMAIL);
    casper.thenOpen(serverUrl, function() {
      test.assertExists('#your_turn_games');
      return test.assertEqual(2, casper.evaluate(function() {
        return $('#your_turn_games a').length;
      }), 'exactly two games listed');
    });
    casper.thenClick('#your_turn_games li:last-child a', function() {
      var empty;
      test.assertExists('table.goban');
      empty = countStonesAndPoints().empty;
      test.assertEqual(19 * 19, empty, "19x19 empty points on board");
      test.assertTrue(casper.evaluate(function() {
        var result;
        result = false;
        $.ajax($('table.goban img').attr('src'), {
          'async': false,
          'success': function() {
            return result = true;
          }
        });
        return result;
      }), 'an image on the board can be loaded');
      return test.assertDoesntExist('.confirm_button:enabled', 'no usable confirm button appears');
    });
    casper.thenClick(pointSelector(15, 3), function() {
      var counts;
      counts = countStonesAndPoints();
      test.assertEquals(19 * 19 - 1, counts.empty);
      test.assertEquals(1, counts.black);
      return test.assertExists('.confirm_button:enabled');
    });
    casper.thenClick(pointSelector(15, 2), function() {
      var counts;
      counts = countStonesAndPoints();
      test.assertEquals(19 * 19 - 1, counts.empty);
      test.assertEquals(1, counts.black);
      test.assertPointMatches(15, 3, /e.gif/);
      return test.assertPointMatches(15, 2, /b.gif/);
    });
    casper.thenClick('.confirm_button', function() {
      return test.assertExists('#your_turn_games');
    });
    create_login_session(TWO_EMAIL);
    casper.thenOpen(serverUrl, function() {
      return test.assertEqual(1, casper.evaluate(function() {
        return $('#your_turn_games a').length;
      }), "exactly one game listed in which it's P2's turn");
    });
    casper.thenClick('#your_turn_games a');
    casper.thenClick(pointSelector(15, 2), function() {
      var counts;
      counts = countStonesAndPoints();
      test.assertEquals(19 * 19 - 1, counts.empty);
      test.assertEquals(1, counts.black);
      return test.assertEquals(0, counts.white);
    });
    casper.thenClick(pointSelector(3, 3), function() {
      var counts;
      counts = countStonesAndPoints();
      test.assertEquals(19 * 19 - 2, counts.empty);
      test.assertEquals(1, counts.black);
      return test.assertEquals(1, counts.white);
    });
    casper.thenClick('.confirm_button');
    casper.thenClick('#not_your_turn_games li:first-child a', function() {
      var counts;
      test.assertExists('.goban');
      counts = countStonesAndPoints();
      return test.assertEquals(19 * 19, counts.empty, 'second board empty');
    });
    return casper.then(function() {
      return test.done();
    });
  });

  clear_games_for_player = function(email) {
    return casper.thenOpen(serverUrl + "/testing_clear_games_for_player", {
      method: 'post',
      data: {
        'email': email
      }
    });
  };

  create_game = function(black_email, white_email) {
    return casper.thenOpen(serverUrl + "/testing_create_game", {
      method: 'post',
      data: {
        'black_email': black_email,
        'white_email': white_email
      }
    });
  };

  create_login_session = function(email) {
    "Add steps to the stack to create a login session on the server and set its cookie in the browser.";
    casper.thenOpen(serverUrl + "/testing_create_login_session", {
      method: 'post',
      data: {
        'email': email
      }
    });
    return casper.then(function() {
      var content, name, path, ref, value;
      content = casper.getPageContent();
      ref = content.split('\n'), name = ref[0], value = ref[1], path = ref[2];
      casper.page.clearCookies();
      return casper.page.addCookie({
        'name': name,
        'value': value,
        'path': path
      });
    });
  };

  casper.run(function() {
    casper.log("shutting down...");
    return casper.open('http://localhost:5000/shutdown', {
      method: 'post'
    });
  });

}).call(this);
