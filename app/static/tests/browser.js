// Generated by CoffeeScript 1.9.1
(function() {
  var BrowserTest, ChallengeTest, ClientSideJsTest, GameInterfaceTest, LoginTest, PassAndScoringTest, PlaceStonesTest, ResignTest, StatusTest, allTestObjects, clearGamesForPlayer, createGame, createLoginSession, defaultHost, host, pointSelector, port, portString, registerTest, runAll, runTest, serverUrl, testObjectsByName,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    hasProp = {}.hasOwnProperty,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  defaultHost = "http://localhost";

  host = casper.cli.options['host'] || defaultHost;

  port = casper.cli.options['port'] || (host === defaultHost ? "5000" : "80");

  portString = port === "80" || port === 80 ? "" : ":" + port;

  if (!((host.match(/localhost/)) || (host.match(/staging/)))) {
    casper.die("Server url contains neither 'localhost' nor 'staging', aborting");
  }

  serverUrl = "" + host + portString;

  casper.echo("Testing against server at " + serverUrl);

  testObjectsByName = {};

  allTestObjects = [];

  registerTest = function(test) {
    var i, len, name, ref, results;
    allTestObjects.push(test);
    ref = test.names;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      name = ref[i];
      results.push(testObjectsByName[name] = test);
    }
    return results;
  };

  runTest = function(name) {
    var test;
    test = testObjectsByName[name];
    return test.run();
  };

  runAll = function() {
    var i, len, results, test;
    results = [];
    for (i = 0, len = allTestObjects.length; i < len; i++) {
      test = allTestObjects[i];
      results.push(test.run());
    }
    return results;
  };

  BrowserTest = (function() {
    function BrowserTest() {
      this.assertStonePointCounts = bind(this.assertStonePointCounts, this);
      this.assertGeneralPointCounts = bind(this.assertGeneralPointCounts, this);
      this.assertEmptyBoard = bind(this.assertEmptyBoard, this);
      this.getLastGameLink = bind(this.getLastGameLink, this);
      this.run = bind(this.run, this);
    }

    BrowserTest.prototype.run = function() {
      return casper.test.begin(this.description, this.numTests, (function(_this) {
        return function(test) {
          casper.start();
          _this.testBody(test);
          return casper.then(function() {
            return test.done();
          });
        };
      })(this));
    };

    BrowserTest.prototype.names = [];

    BrowserTest.prototype.description = 'This class needs a description';

    BrowserTest.prototype.numTests = 0;

    BrowserTest.prototype.assertNumGames = function(test, players_turn, players_wait) {
      return casper.thenOpen(serverUrl, function() {
        var game_counts;
        test.assertExists('#your_turn_games', "Status has a list of 'your turn' games");
        test.assertExists('#not_your_turn_games', "Status has a list of 'not your turn' games");
        game_counts = casper.evaluate(function() {
          var counts;
          counts = {
            'your_turn': $('#your_turn_games a').length,
            'not_your_turn': $('#not_your_turn_games a').length
          };
          return counts;
        });
        test.assertEqual(game_counts.your_turn, players_turn, 'Expected number of your-turn games');
        return test.assertEqual(game_counts.not_your_turn, players_wait, 'Expected number of not-your-turn games');
      });
    };

    BrowserTest.prototype.lastGameSelector = function(your_turn) {
      var list_id;
      list_id = your_turn ? 'your_turn_games' : 'not_your_turn_games';
      return '#' + list_id + ' li:last-child a';
    };

    BrowserTest.prototype.getLastGameLink = function(your_turn) {
      var evaluate_fun;
      evaluate_fun = function(selector) {
        var link;
        link = {
          target: $(selector).attr('href'),
          text: $(selector).text()
        };
        return link;
      };
      return casper.evaluate(evaluate_fun, this.lastGameSelector(your_turn));
    };

    BrowserTest.prototype.imageSrc = function(x, y) {
      return casper.evaluate((function(x, y) {
        return $(".row-" + y + ".col-" + x + " img").attr('src');
      }), x, y);
    };

    BrowserTest.prototype.assertEmptyBoard = function(test) {
      return this.assertStonePointCounts(test, 19 * 19, 0, 0);
    };

    BrowserTest.prototype.assertPointIsBlack = function(test, x, y) {
      return test.assertExists(pointSelector(x, y) + ".blackstone", 'There is a black stone at the expected point');
    };

    BrowserTest.prototype.assertPointIsWhite = function(test, x, y) {
      return test.assertExists(pointSelector(x, y) + ".whitestone", 'There is a white stone at the expected point');
    };

    BrowserTest.prototype.assertPointIsEmpty = function(test, x, y) {
      return test.assertExists(pointSelector(x, y) + ".nostone", 'The specified point is empty as expected');
    };

    BrowserTest.prototype.countStonesAndPoints = function() {
      var counts;
      counts = casper.evaluate(function() {
        var blackDead, blackScore, blackStones, emptyStones, noScore, whiteDead, whiteScore, whiteStones;
        emptyStones = $('.goban .nostone').length;
        blackStones = $('.goban .blackstone').length;
        whiteStones = $('.goban .whitestone').length;
        blackScore = $('.goban .blackscore').length;
        whiteScore = $('.goban .whitescore').length;
        blackDead = $('.goban .blackdead').length;
        whiteDead = $('.goban .whitedead').length;
        noScore = $('.goban td').length - blackScore - whiteScore;
        counts = {
          'empty': emptyStones,
          'black': blackStones,
          'white': whiteStones,
          'blackscore': blackScore,
          'whitescore': whiteScore,
          'blackdead': blackDead,
          'whitedead': whiteDead,
          'noscore': noScore
        };
        return counts;
      });
      return counts;
    };

    BrowserTest.prototype.assertGeneralPointCounts = function(test, expected) {
      var count, counts, label, ref, results, type;
      label = (ref = expected.label) != null ? ref : "unlabeled";
      delete expected.label;
      counts = this.countStonesAndPoints();
      results = [];
      for (type in expected) {
        if (!hasProp.call(expected, type)) continue;
        count = expected[type];
        results.push(test.assertEqual(counts[type], count, "in " + label + ": " + type + " should be " + count + ", was " + counts[type]));
      }
      return results;
    };

    BrowserTest.prototype.assertStonePointCounts = function(test, nostone, black, white) {
      var counts;
      counts = this.countStonesAndPoints();
      return this.assertGeneralPointCounts(test, {
        'empty': nostone,
        'black': black,
        'white': white
      });
    };

    return BrowserTest;

  })();

  ClientSideJsTest = (function(superClass) {
    extend(ClientSideJsTest, superClass);

    function ClientSideJsTest() {
      return ClientSideJsTest.__super__.constructor.apply(this, arguments);
    }

    ClientSideJsTest.prototype.names = ['ClientSideJsTest', 'qunit', 'client'];

    ClientSideJsTest.prototype.description = "Run client-side JS tests and ensure they pass.";

    ClientSideJsTest.prototype.numTests = 1;

    ClientSideJsTest.prototype.testBody = function(test) {
      return casper.thenOpen(serverUrl + "/static/tests/tests.html", function() {
        var foundFunc, predicate, timeoutFunc;
        predicate = function() {
          return (casper.exists('.qunit-pass')) || (casper.exists('.qunit-fail'));
        };
        foundFunc = function() {
          if (casper.exists('.qunit-pass')) {
            return test.pass('Qunit tests passed');
          } else if (casper.exists('.qunit-fail')) {
            return test.fail('Qunit tests failed');
          }
        };
        timeoutFunc = function() {
          return test.fail("Couldn't detect pass or fail for Qunit tests");
        };
        return casper.waitFor(predicate, foundFunc, timeoutFunc, 5000);
      });
    };

    return ClientSideJsTest;

  })(BrowserTest);

  registerTest(new ClientSideJsTest);

  LoginTest = (function(superClass) {
    extend(LoginTest, superClass);

    function LoginTest() {
      return LoginTest.__super__.constructor.apply(this, arguments);
    }

    LoginTest.prototype.names = ['LoginTest', 'login'];

    LoginTest.prototype.description = 'Test the login procedure';

    LoginTest.prototype.numTests = 3;

    LoginTest.prototype.testBody = function(test) {
      casper.thenOpen(serverUrl, function() {
        return test.assertTitle('Go', 'The front page title is the one expected');
      });
      casper.thenClick('#persona_login');
      casper.waitForPopup(/persona/);
      casper.withPopup(/persona/, function() {
        test.assertTitleMatch(/Persona/i, 'Persona login popup has expected title');
        this.sendKeys('#authentication_email', 'test@mockmyid.com');
        return this.thenClick('button:enabled');
      });
      return casper.then(function() {
        return test.skip(1);
      });
    };

    return LoginTest;

  })(BrowserTest);

  registerTest(new LoginTest);

  StatusTest = (function(superClass) {
    extend(StatusTest, superClass);

    function StatusTest() {
      this.testBody = bind(this.testBody, this);
      return StatusTest.__super__.constructor.apply(this, arguments);
    }

    StatusTest.prototype.names = ['StatusTest', 'status'];

    StatusTest.prototype.description = 'Test the status listings';

    StatusTest.prototype.numTests = 12;

    StatusTest.prototype.testBody = function(test) {
      var ONE_EMAIL, THREE_EMAIL, TWO_EMAIL, assertNumGames, i, len, p, ref;
      ONE_EMAIL = 'playa@uno.es';
      TWO_EMAIL = 'player@two.co.uk';
      THREE_EMAIL = 'plagxo@tri.eo';
      ref = [ONE_EMAIL, TWO_EMAIL, THREE_EMAIL];
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        clearGamesForPlayer(p);
      }
      createGame(ONE_EMAIL, TWO_EMAIL);
      createGame(ONE_EMAIL, THREE_EMAIL);
      createGame(THREE_EMAIL, ONE_EMAIL);
      assertNumGames = (function(_this) {
        return function(player, players_turn, players_wait) {
          createLoginSession(player);
          return _this.assertNumGames(test, players_turn, players_wait);
        };
      })(this);
      assertNumGames(ONE_EMAIL, 2, 1);
      assertNumGames(TWO_EMAIL, 0, 1);
      return assertNumGames(THREE_EMAIL, 1, 1);
    };

    return StatusTest;

  })(BrowserTest);

  registerTest(new StatusTest);

  ChallengeTest = (function(superClass) {
    extend(ChallengeTest, superClass);

    function ChallengeTest() {
      this.testBody = bind(this.testBody, this);
      return ChallengeTest.__super__.constructor.apply(this, arguments);
    }

    ChallengeTest.prototype.names = ['ChallengeTest', 'challenge'];

    ChallengeTest.prototype.description = "Tests the 'Challenge a player process";

    ChallengeTest.prototype.numTests = 17;

    ChallengeTest.prototype.testBody = function(test) {
      var OCHI_EMAIL, SHINDOU_EMAIL, TOUYA_EMAIL, i, len, p, ref, shindous_game_link;
      SHINDOU_EMAIL = 'shindou@ki-in.jp';
      TOUYA_EMAIL = 'touya@ki-in.jp';
      OCHI_EMAIL = 'ochino1@ki-in.jp';
      ref = [SHINDOU_EMAIL, TOUYA_EMAIL, OCHI_EMAIL];
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        clearGamesForPlayer(p);
      }
      createLoginSession(SHINDOU_EMAIL);
      casper.thenOpen(serverUrl, (function(_this) {
        return function() {
          return _this.assertNumGames(test, 0, 0);
        };
      })(this));
      casper.thenClick('#challenge_link', function() {
        var form_values;
        form_values = {
          'input[name="opponent_email"]': TOUYA_EMAIL
        };
        return this.fillSelectors('form', form_values, true);
      });
      shindous_game_link = null;
      casper.thenOpen(serverUrl, (function(_this) {
        return function() {
          _this.assertNumGames(test, 0, 1);
          return shindous_game_link = _this.getLastGameLink(false);
        };
      })(this));
      createLoginSession(TOUYA_EMAIL);
      casper.thenOpen(serverUrl, (function(_this) {
        return function() {
          var touyas_game_link;
          _this.assertNumGames(test, 1, 0);
          touyas_game_link = _this.getLastGameLink(true);
          return test.assertEqual(shindous_game_link, touyas_game_link, "both players see the same game link (target & text)");
        };
      })(this));
      createLoginSession(OCHI_EMAIL);
      return casper.thenOpen(serverUrl, (function(_this) {
        return function() {
          return _this.assertNumGames(test, 0, 0);
        };
      })(this));
    };

    return ChallengeTest;

  })(BrowserTest);

  registerTest(new ChallengeTest);

  PlaceStonesTest = (function(superClass) {
    extend(PlaceStonesTest, superClass);

    function PlaceStonesTest() {
      this.testBody = bind(this.testBody, this);
      return PlaceStonesTest.__super__.constructor.apply(this, arguments);
    }

    PlaceStonesTest.prototype.names = ['PlaceStonesTest'];

    PlaceStonesTest.prototype.description = "Test Placing Stones";

    PlaceStonesTest.prototype.numTests = 18;

    PlaceStonesTest.prototype.testBody = function(test) {
      var ONE_EMAIL, TWO_EMAIL, initialEmptyCount;
      ONE_EMAIL = 'player@one.com';
      TWO_EMAIL = 'playa@dos.es';
      clearGamesForPlayer(ONE_EMAIL);
      clearGamesForPlayer(TWO_EMAIL);
      createGame(ONE_EMAIL, TWO_EMAIL, ['.b.', 'bw.', '.b.']);
      initialEmptyCount = 19 * 19 - 4;
      createLoginSession(ONE_EMAIL);
      casper.thenOpen(serverUrl, (function(_this) {
        return function() {
          return _this.assertNumGames(test, 1, 0);
        };
      })(this));
      return casper.thenClick(this.lastGameSelector(true), (function(_this) {
        return function() {
          test.assertExists('table.goban', 'The Go board does exist.');
          _this.assertStonePointCounts(test, initialEmptyCount, 3, 1);
          test.assertDoesntExist('.confirm_button:enabled', 'no usable confirm button appears');
          _this.assertPointIsEmpty(test, 0, 0);
          _this.assertPointIsBlack(test, 1, 0);
          _this.assertPointIsEmpty(test, 2, 0);
          _this.assertPointIsBlack(test, 0, 1);
          _this.assertPointIsWhite(test, 1, 1);
          _this.assertPointIsEmpty(test, 2, 1);
          _this.assertPointIsEmpty(test, 0, 2);
          _this.assertPointIsBlack(test, 1, 2);
          return _this.assertPointIsEmpty(test, 2, 2);
        };
      })(this));
    };

    return PlaceStonesTest;

  })(BrowserTest);

  registerTest(new PlaceStonesTest);

  GameInterfaceTest = (function(superClass) {
    extend(GameInterfaceTest, superClass);

    function GameInterfaceTest() {
      this.testBody = bind(this.testBody, this);
      return GameInterfaceTest.__super__.constructor.apply(this, arguments);
    }

    GameInterfaceTest.prototype.names = ['GameInterfaceTest', 'game'];

    GameInterfaceTest.prototype.description = "Game interface";

    GameInterfaceTest.prototype.numTests = 43;

    GameInterfaceTest.prototype.testBody = function(test) {
      var ONE_EMAIL, TWO_EMAIL, initialEmptyCount;
      ONE_EMAIL = 'player@one.com';
      TWO_EMAIL = 'playa@dos.es';
      clearGamesForPlayer(ONE_EMAIL);
      clearGamesForPlayer(TWO_EMAIL);
      createGame(ONE_EMAIL, TWO_EMAIL);
      createGame(ONE_EMAIL, TWO_EMAIL, ['wwb', 'b..']);
      initialEmptyCount = 19 * 19 - 4;
      createLoginSession(ONE_EMAIL);
      casper.thenOpen(serverUrl, (function(_this) {
        return function() {
          return _this.assertNumGames(test, 2, 0);
        };
      })(this));
      casper.thenClick(this.lastGameSelector(true), (function(_this) {
        return function() {
          test.assertExists('table.goban', 'The Go board does exist.');
          _this.assertStonePointCounts(test, initialEmptyCount, 2, 2);
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
        };
      })(this));
      casper.thenClick(pointSelector(1, 1), (function(_this) {
        return function() {
          _this.assertStonePointCounts(test, initialEmptyCount + 1, 3, 0);
          return test.assertExists('.confirm_button:enabled');
        };
      })(this));
      casper.thenClick(pointSelector(15, 3), (function(_this) {
        return function() {
          _this.assertStonePointCounts(test, initialEmptyCount - 1, 3, 2);
          _this.assertPointIsEmpty(test, 1, 1);
          return _this.assertPointIsWhite(test, 1, 0);
        };
      })(this));
      casper.thenClick(pointSelector(1, 1), (function(_this) {
        return function() {
          return _this.assertStonePointCounts(test, initialEmptyCount + 1, 3, 0);
        };
      })(this));
      casper.thenClick('.confirm_button', (function(_this) {
        return function() {
          return _this.assertNumGames(test, 1, 1);
        };
      })(this));
      createLoginSession(TWO_EMAIL);
      casper.thenOpen(serverUrl, (function(_this) {
        return function() {
          return _this.assertNumGames(test, 1, 1);
        };
      })(this));
      casper.thenClick(this.lastGameSelector(true), (function(_this) {
        return function() {
          return _this.assertStonePointCounts(test, initialEmptyCount + 1, 3, 0);
        };
      })(this));
      casper.thenClick(pointSelector(1, 1), (function(_this) {
        return function() {
          return _this.assertStonePointCounts(test, initialEmptyCount + 1, 3, 0);
        };
      })(this));
      casper.thenClick(pointSelector(3, 3), (function(_this) {
        return function() {
          return _this.assertStonePointCounts(test, initialEmptyCount, 3, 1);
        };
      })(this));
      casper.thenClick('.confirm_button');
      return casper.thenClick('#not_your_turn_games li:first-child a', (function(_this) {
        return function() {
          test.assertExists('.goban', 'The Go board still exists.');
          return _this.assertEmptyBoard(test);
        };
      })(this));
    };

    return GameInterfaceTest;

  })(BrowserTest);

  registerTest(new GameInterfaceTest);

  PassAndScoringTest = (function(superClass) {
    extend(PassAndScoringTest, superClass);

    function PassAndScoringTest() {
      this.testBody = bind(this.testBody, this);
      return PassAndScoringTest.__super__.constructor.apply(this, arguments);
    }

    PassAndScoringTest.prototype.names = ['PassAndScoringTest', 'pass', 'score', 'scoring'];

    PassAndScoringTest.prototype.description = "pass moves and scoring system";

    PassAndScoringTest.prototype.numTests = 29;

    PassAndScoringTest.prototype.testBody = function(test) {
      var BLACK_EMAIL, WHITE_EMAIL, goToGame, i, len, originalImageSrc11, originalImageSrc22, p, ref;
      BLACK_EMAIL = 'black@schwarz.de';
      WHITE_EMAIL = 'white@wit.nl';
      ref = [BLACK_EMAIL, WHITE_EMAIL];
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        clearGamesForPlayer(p);
      }
      createGame(BLACK_EMAIL, WHITE_EMAIL, ['.b.wb', 'bb.wb', '...wb', 'wwwwb', 'bbbbb']);
      goToGame = (function(_this) {
        return function(email, thenFn) {
          if (thenFn == null) {
            thenFn = (function() {});
          }
          createLoginSession(email);
          casper.thenOpen(serverUrl);
          return casper.thenClick(_this.lastGameSelector(true), thenFn);
        };
      })(this);
      goToGame(BLACK_EMAIL);
      casper.thenClick('.pass_button');
      casper.thenOpen(serverUrl);
      casper.thenClick(this.lastGameSelector(false), function() {
        return test.assertDoesntExist('.pass_button:enabled');
      });
      goToGame(WHITE_EMAIL);
      casper.thenClick('.pass_button');
      originalImageSrc11 = null;
      originalImageSrc22 = null;
      goToGame(BLACK_EMAIL, (function(_this) {
        return function() {
          test.assertExists('table.goban');
          originalImageSrc11 = _this.imageSrc(1, 1);
          originalImageSrc22 = _this.imageSrc(2, 2);
          return _this.assertGeneralPointCounts(test, {
            label: "initial marking layout",
            noscore: 3 + 5 + 7 + 9,
            blackscore: 19 * 19 - 25 + 1,
            whitescore: 0
          });
        };
      })(this));
      casper.thenClick(pointSelector(0, 0), (function(_this) {
        return function() {
          return _this.assertGeneralPointCounts(test, {
            label: "after clicking empty point",
            empty: 19 * 19 - 3 - 7 - 9
          });
        };
      })(this));
      casper.thenClick(pointSelector(1, 0), (function(_this) {
        return function() {
          var imageSrc11, imageSrc22;
          imageSrc11 = _this.imageSrc(1, 1);
          test.assertNotEquals(imageSrc11, originalImageSrc11, "black stone image source is not still " + originalImageSrc11);
          imageSrc22 = _this.imageSrc(2, 2);
          test.assertNotEquals(imageSrc22, originalImageSrc22, "empty point image source is not still " + originalImageSrc22);
          return _this.assertGeneralPointCounts(test, {
            label: "black stones marked dead",
            noscore: 7 + 9,
            blackscore: 19 * 19 - 25,
            whitescore: 9,
            blackdead: 3,
            black: 9
          });
        };
      })(this));
      casper.thenClick(pointSelector(3, 3), (function(_this) {
        return function() {
          return _this.assertGeneralPointCounts(test, {
            label: "white stones marked dead",
            black: 12,
            blackdead: 0,
            noscore: 12,
            blackscore: 19 * 19 - 12,
            whitescore: 0
          });
        };
      })(this));
      casper.thenClick('.confirm_button');
      goToGame(WHITE_EMAIL, (function(_this) {
        return function() {
          return _this.assertGeneralPointCounts(test, {
            label: "White views Black's proposal",
            black: 12,
            white: 0,
            whitedead: 7,
            blackscore: 19 * 19 - 12
          });
        };
      })(this));
      casper.thenClick(pointSelector(1, 1));
      casper.thenClick('.confirm_button');
      goToGame(BLACK_EMAIL, (function(_this) {
        return function() {
          return _this.assertGeneralPointCounts(test, {
            label: "Black views White's counter-proposal",
            black: 9,
            white: 7,
            blackdead: 3
          });
        };
      })(this));
      casper.thenClick(pointSelector(3, 1));
      casper.thenClick('.confirm_button');
      goToGame(WHITE_EMAIL);
      casper.thenClick('.resume_button');
      goToGame(BLACK_EMAIL);
      casper.thenClick(pointSelector(2, 1));
      casper.thenClick('.confirm_button');
      goToGame(WHITE_EMAIL);
      casper.thenClick('.pass_button');
      goToGame(BLACK_EMAIL);
      casper.thenClick('.pass_button');
      goToGame(WHITE_EMAIL, (function(_this) {
        return function() {
          return _this.assertGeneralPointCounts(test, {
            label: "White is first to mark stones after resumption",
            black: 4 + 9,
            white: 7
          });
        };
      })(this));
      casper.thenClick(pointSelector(3, 0));
      casper.thenClick('.confirm_button');
      goToGame(BLACK_EMAIL);
      casper.thenClick('.confirm_button');
      return casper.thenOpen(serverUrl, (function(_this) {
        return function() {
          test.assertDoesntExist(_this.lastGameSelector(true));
          return test.assertDoesntExist(_this.lastGameSelector(false));
        };
      })(this));
    };

    return PassAndScoringTest;

  })(BrowserTest);

  registerTest(new PassAndScoringTest);

  ResignTest = (function(superClass) {
    extend(ResignTest, superClass);

    function ResignTest() {
      this.testBody = bind(this.testBody, this);
      return ResignTest.__super__.constructor.apply(this, arguments);
    }

    ResignTest.prototype.names = ['ResignTest', 'resign'];

    ResignTest.prototype.description = "resignation";

    ResignTest.prototype.numTests = 2;

    ResignTest.prototype.testBody = function(test) {
      var BLACK_EMAIL, WHITE_EMAIL, i, len, p, ref;
      BLACK_EMAIL = "quitter@nomo.re";
      WHITE_EMAIL = "recipient@easyw.in";
      ref = [BLACK_EMAIL, WHITE_EMAIL];
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        clearGamesForPlayer(p);
      }
      createGame(BLACK_EMAIL, WHITE_EMAIL);
      createLoginSession(BLACK_EMAIL);
      casper.thenOpen(serverUrl);
      casper.thenClick(this.lastGameSelector(true));
      casper.thenClick('.resign_button');
      return casper.thenOpen(serverUrl, (function(_this) {
        return function() {
          test.assertDoesntExist(_this.lastGameSelector(true), "Black no longer sees the resigned game on his status page");
          return test.assertDoesntExist(_this.lastGameSelector(false), "it's not in the off-turn games list either");
        };
      })(this));
    };

    return ResignTest;

  })(BrowserTest);

  registerTest(new ResignTest);

  clearGamesForPlayer = function(email) {
    return casper.thenOpen(serverUrl + "/testing_clear_games_for_player", {
      method: 'post',
      data: {
        'email': email
      }
    });
  };

  createGame = function(black_email, white_email, stones) {
    if (stones == null) {
      stones = [];
    }
    return casper.thenOpen(serverUrl + "/testing_create_game", {
      method: 'post',
      data: {
        'black_email': black_email,
        'white_email': white_email,
        'stones': JSON.stringify(stones)
      }
    });
  };

  createLoginSession = function(email) {
    "Add steps to the stack to create a login session on the server.";
    return casper.thenOpen(serverUrl + "/testing_create_login_session", {
      method: 'post',
      data: {
        'email': email
      }
    });
  };

  pointSelector = function(x, y) {
    return ".col-" + x + ".row-" + y;
  };

  if (casper.cli.has("single")) {
    runTest(casper.cli.options['single']);
  } else {
    runAll();
  }

  casper.run(function() {
    casper.log("shutting down...");
    return casper.open('http://localhost:5000/shutdown', {
      method: 'post'
    });
  });

}).call(this);
