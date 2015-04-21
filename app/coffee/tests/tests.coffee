# helpers

$pointAt = (x, y) -> $(".row-#{y}.col-#{x}")
imageSrc = ($point) -> $point.find('img').attr('src')

isPointEmpty = ($point) ->
  (imageSrc($point).indexOf('e.gif') > -1) and ($point.hasClass('nostone'))
isPointBlack = ($point) ->
  (imageSrc($point).indexOf('b.gif') > -1) and ($point.hasClass('blackstone'))
isPointWhite = ($point) ->
  (imageSrc($point).indexOf('w.gif') > -1) and ($point.hasClass('whitestone'))
isPointBlackScore = ($point) ->
  (imageSrc($point).indexOf('bp.gif') > -1) and
    ($point.hasClass('blackscore'))
isPointWhiteScore = ($point) ->
  (imageSrc($point).indexOf('wp.gif') > -1) and
    ($point.hasClass('whitescore'))


# ============================================================================


module 'Persona'

test 'init function sets request and logout callbacks', ->
  requestCalled = false
  logoutCalled = false
  watchCalled = false
  mockNavigator =
    id:
      logout: -> logoutCalled = true
      request: -> requestCalled = true
      watch: (params) ->
        p_user = params.loggedInUser
        t_user = tesuji_charm.currentPersonaEmail
        ok(
          (t_user == '' and p_user == null) or
          (t_user != '' and p_user == t_user),
            'navigator.id.watch passed good loggedInUser')
        ok typeof params.onlogin is 'function',
          'navigator.id.watch passed function for onlogin'
        ok typeof params.onlogout is 'function',
          'navigator.id.watch passed function for onlogout'
        watchCalled = true
  # main test sequence begins here
  equal watchCalled, false
  tesuji_charm.currentPersonaEmail = ''
  tesuji_charm.persona.initialize mockNavigator
  equal watchCalled, true, 'navigator.id.watch called'
  tesuji_charm.currentPersonaEmail = 'bob@example.com'
  tesuji_charm.persona.initialize mockNavigator

  equal requestCalled, false
  equal logoutCalled, false
  $('#persona_login').click()
  equal requestCalled, true, 'login request called correctly'
  equal logoutCalled, false
  $('#logout').click()
  equal logoutCalled, true, 'logout callback called correctly'


# ============================================================================


module "common game page functions"


test "helper function readBoardState", (assert) ->
  tesuji_charm.game_common._updateBoardChars [
    'wb'
    '..'
  ]
  expected = [
    ['white', 'black', 'empty']
    ['empty', 'empty', 'empty']
    ['empty', 'empty', 'empty']
  ]
  assert.deepEqual tesuji_charm.game_common.readBoardState(), expected

test "helper function updateBoardChars", (assert) ->
  tesuji_charm.game_common._updateBoardChars [
    '.b.'
    'bw.'
    '.b.'
  ]
  assert.ok isPointBlack($pointAt(1, 0))
  assert.ok isPointWhite($pointAt(1, 1))
  assert.ok isPointEmpty($pointAt(2, 1))
  tesuji_charm.game_common._updateBoardChars [
    '...'
    '...'
    '...'
  ]
  assert.ok isPointEmpty($pointAt(1, 0))
  assert.ok isPointEmpty($pointAt(1, 1))


# ============================================================================


module 'Basic game page',
  setup: ->
    $('input#move_no').val "0"
    $('input#row').val ""
    $('input#column').val ""
    tesuji_charm.game_basic.initialize()

test 'clicking multiple points moves black stone', ->
  $point1 = $pointAt 0, 0
  $point2 = $pointAt 1, 2

  ok isPointEmpty($point1), 'first point is initially empty'
  $point1.click()
  notOk isPointEmpty($point1), 'after click, no longer empty'
  ok isPointBlack($point1), 'after click, is black stone'
  $point2.click()
  ok isPointEmpty($point1), 'after second click, first clicked point clear'
  ok isPointBlack($point2), 'after second click, second clicked point black'

test 'clicking multiple points updates hidden form', ->
  $point1 = $pointAt 0, 0
  $point2 = $pointAt 1, 2
  $row = $('input#row')
  $column = $('input#column')

  $point1.click()
  equal $row.val(), "0", "first stone sets correct row"
  equal $column.val(), "0", "first stone sets correct column"
  $point2.click()
  equal $row.val(), "2", "second stone sets correct row"
  equal $column.val(), "1", "second stone sets correct column"

test 'Confirm button disabled until stone placed', ->
  $button = $('button.confirm_button')
  equal $button.prop('disabled'), true,
    'starts out disabled'
  $('table.goban td').first().click()
  equal $button.prop('disabled'), false,
    'enabled after stone placed'

test "clicking a pre-existing stone does nothing", (assert) ->
  $point = $pointAt 1, 1
  tesuji_charm.game_common._updateBoardChars [
    '..'
    '.w'
  ]
  tesuji_charm.game_basic._reloadBoard()
  # test
  $point.click()
  assert.notOk isPointBlack($point), "point has not become black"
  assert.notEqual $('input#row').val(), "1", "row not set"
  assert.notEqual $('input#column').val(), "1", "column not set"

test "captured stones are removed from the board", (assert) ->
  tesuji_charm.game_common._updateBoardChars [
    'wb'
    '..'
  ]
  tesuji_charm.game_basic._reloadBoard()
  # now make the capture
  $pointAt(0, 1).click()
  # corner should be blank now
  assert.ok isPointEmpty($pointAt(0, 0)), "corner point is now empty"


# ============================================================================


module 'Game page with marking interface',
  beforeEach: ->
    $("#qunit-fixture").append $("<div/>",
                                 id: 'with_scoring'
                                 class: 'with_scoring')

test "clicking empty points in marking mode does nothing", (assert) ->
  $point = $pointAt(1, 1)
  assert.ok isPointEmpty($point), "centre point starts empty"
  $point.click()
  assert.ok isPointEmpty($point), "still empty after click"

test "mixed scoring board", (assert) ->
  tesuji_charm.game_common._updateBoardChars [
    '.b.'
    'bww'
    '.w.'
  ]
  tesuji_charm.game_marking.initialize()
  assert.ok isPointBlackScore($pointAt(0, 0)), "(0,0) black"
  assert.notOk isPointWhiteScore($pointAt(0, 0)), "(0,0) white"
  assert.notOk isPointBlackScore($pointAt(0, 1)), "(0,1) black"
  assert.notOk isPointWhiteScore($pointAt(0, 1)), "(0,1) white"
  assert.notOk isPointBlackScore($pointAt(0, 2)), "(0,2) black"
  assert.notOk isPointWhiteScore($pointAt(0, 2)), "(0,2) white"
  assert.notOk isPointBlackScore($pointAt(1, 0)), "(1,0) black"
  assert.notOk isPointWhiteScore($pointAt(1, 0)), "(1,0) white"
  assert.notOk isPointBlackScore($pointAt(1, 1)), "(1,1) black"
  assert.notOk isPointWhiteScore($pointAt(1, 1)), "(1,1) white"
  assert.notOk isPointBlackScore($pointAt(1, 2)), "(1,2) black"
  assert.notOk isPointWhiteScore($pointAt(1, 2)), "(1,2) white"
  assert.notOk isPointBlackScore($pointAt(2, 0)), "(2,0) black"
  assert.notOk isPointWhiteScore($pointAt(2, 0)), "(2,0) white"
  assert.notOk isPointBlackScore($pointAt(2, 1)), "(2,1) black"
  assert.notOk isPointWhiteScore($pointAt(2, 1)), "(2,1) white"
  assert.notOk isPointBlackScore($pointAt(2, 2)), "(2,2) black"
  assert.ok isPointWhiteScore($pointAt(2, 2)), "(2,2) white"

test "clicking live stones makes them dead, " + \
     "clicking again brings them back", (assert) ->
  tesuji_charm.game_common._updateBoardChars [
    '.bw'
    'bb.'
    'www'
  ]
  tesuji_charm.game_marking.initialize()
  $pointAt(1, 1).click()
  assert.notOk isPointBlackScore($pointAt(0, 0)),
    "(0, 0) no longer counts for black with black stones dead"
  assert.ok isPointWhiteScore($pointAt(0, 0)),
    "(0, 0) becomes white with black stones dead"
  assert.notOk isPointBlackScore($pointAt(2, 1)),
    "(2, 1) no longer counts for black with black stones dead"
  assert.ok isPointWhiteScore($pointAt(2, 1)),
    "(2, 1) becomes white with black stones dead"
  assert.ok isPointWhiteScore($pointAt(1, 0)),
    "dead black stone has white score class"
  assert.ok $pointAt(1, 0).hasClass('blackdead'),
    "dead black stone has dead black stone class"

  $pointAt(1, 1).click()
  assert.ok isPointBlackScore($pointAt(0, 0)),
    "(0, 0) counts for black again with black stones restored"
  assert.notOk isPointWhiteScore($pointAt(0, 0)),
    "(0, 0) no longer white with black stones restored"
  assert.notOk isPointWhiteScore($pointAt(2, 1)),
    "(2, 1) no longer white with black stones restored"
  assert.notOk isPointWhiteScore($pointAt(1, 0)),
    "restored black stone no longer has white score class"
  assert.notOk $pointAt(1, 0).hasClass('blackdead'),
    "restored black stone no longer has dead black stone class"


# ============================================================================


module 'Go rules'

go_rules = tesuji_charm.go_rules

QUnit.assert.legal = (color, x, y, state, message) ->
  go_rules.getNewState(color, x, y, state)
  @push true, true, true, message ? "move is legal"

QUnit.assert.illegal = (color, x, y, state, message) ->
  try
    go_rules.getNewState(color, x, y, state)
  catch error
    if error.message is 'illegal move'
      @push true, false, false, message ? "move is illegal"
      return
  @push false, true, false, message ? "move is illegal"

test "playing on an existing stone is illegal", (assert) ->
  board = [ ['empty', 'black'], ['empty', 'empty'] ]
  assert.legal('white', 0, 1, board)
  assert.illegal('white', 1, 0, board)

test "playing a stone with no liberties is illegal", (assert) ->
  board = [ ['empty', 'black'], ['black', 'empty'] ]
  assert.illegal 'white', 0, 0, board,
    "white stone surrounded by black"
  board = [ ['empty', 'black'], ['black', 'black'] ]
  assert.illegal 'black', 0, 0, board,
    "black stone filling the board with black"

test "a move that would have no liberties is legal if it captures", (assert) ->
  board = [ ['empty', 'black'], ['black', 'black'] ]
  assert.legal 'white', 0, 0, board

test "playing a move sets the point color", (assert) ->
  board = [ ['empty', 'black'], ['empty', 'empty'] ]
  plusBlack = [ ['empty', 'black'], ['black', 'empty'] ]
  plusWhite = [ ['empty', 'black'], ['white', 'empty'] ]
  assert.deepEqual(
    go_rules.getNewState('black', 0, 1, board), plusBlack)
  assert.deepEqual(
    go_rules.getNewState('white', 0, 1, board), plusWhite)

test "removing a single stone's last liberty removes it", (assert) ->
  board = [ ['white', 'black'], ['empty', 'empty'] ]
  afterCapture = [ ['empty', 'black'], ['black', 'empty'] ]
  assert.deepEqual(
    go_rules.getNewState('black', 0, 1, board), afterCapture)

test "removing a group's last liberty removes the group", (assert) ->
  board = [
    ['empty', 'empty', 'black', 'empty']
    ['black', 'white', 'white', 'empty']
    ['empty', 'black', 'black', 'empty']
  ]
  b1 = go_rules.getNewState('black', 3, 1, board)
  assert.equal b1[1][2], 'white',
    "white stones still around with one liberty remaining"
  b2 = go_rules.getNewState('black', 1, 0, b1)
  expected = [
    ['empty', 'black', 'black', 'empty']
    ['black', 'empty', 'empty', 'black']
    ['empty', 'black', 'black', 'empty']
  ]
  assert.deepEqual(b2, expected, "group capture succeeded")

test "capturing with own last liberty does not remove own stones", (assert) ->
  board = [
    ['empty', 'black', 'black', 'empty']
    ['black', 'white', 'white', 'black']
    ['black', 'empty', 'white', 'black']
    ['white', 'black', 'black', 'white']
    ['empty', 'white', 'white', 'empty']
  ]
  expected = [
    ['empty', 'black', 'black', 'empty']
    ['black', 'white', 'white', 'black']
    ['black', 'white', 'white', 'black']
    ['white', 'empty', 'empty', 'white']
    ['empty', 'white', 'white', 'empty']
  ]
  b1 = go_rules.getNewState('white', 1, 2, board)
  assert.deepEqual(b1, expected, "group capture succeeded")

test "helper function neighboringPoints", (assert) ->
  board = [
    ['empty', 'empty', 'empty']
    ['empty', 'empty', 'empty']
    ['empty', 'empty', 'empty']
  ]
  assert.equal(go_rules._neighbouringPoints(0, 0, board).length, 2)
  assert.equal(go_rules._neighbouringPoints(1, 0, board).length, 3)
  assert.equal(go_rules._neighbouringPoints(1, 1, board).length, 4)

test "_countLiberties: single stones", (assert) ->
  board = [
    ['black', 'empty', 'black']
    ['empty', 'black', 'white']
    ['empty', 'empty', 'empty']
  ]
  assert.equal(go_rules._countLiberties(0, 0, board), 2)
  assert.equal(go_rules._countLiberties(1, 1, board), 3)
  assert.equal(go_rules._countLiberties(2, 1, board), 1)

test "_countLiberties: groups share liberties", (assert) ->
  board = [
    ['black', 'black', 'empty']
    ['black', 'white', 'white']
    ['empty', 'black', 'empty']
  ]
  assert.equal(go_rules._countLiberties(1, 0, board), 2)
  assert.equal(go_rules._countLiberties(1, 1, board), 2)

test "_countLiberties: regression test: shared liberties not
      double counted", (assert) ->
  board = [
    ['black', 'black', 'empty']
    ['black', 'empty', 'white']
    ['empty', 'black', 'empty']
  ]
  assert.equal go_rules._countLiberties(1, 0, board), 3,
    "centre liberty counts only once, for total of 3"

test "groupPoints: identifies groups correctly", (assert) ->
  board = [
    ['black', 'black', 'empty']
    ['black', 'white', 'white']
    ['empty', 'black', 'empty']
  ]
  blackGroup = [ [1,0], [0,0], [0,1] ]
  whiteGroup = [ [1,1], [2,1] ]
  assert.deepEqual go_rules.groupPoints(1, 0, board), blackGroup,
    "black group"
  assert.deepEqual go_rules.groupPoints(1, 1, board), whiteGroup,
    "white group"

test "groupPoints: optional argument 'colors' works", (assert) ->
  board = [
    ['blackdead', 'blackdead', 'empty']
    ['black',     'empty',     'white']
    ['empty',     'black',     'white']
  ]
  expected = [ [0,0], [1,0], [1,1], [2,0] ]
  actual = go_rules.groupPoints(0, 0, board, ['empty', 'blackdead'])
  assert.deepEqual actual, expected
