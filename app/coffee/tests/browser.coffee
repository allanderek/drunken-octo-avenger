# compute server url from arguments

defaultHost = "http://localhost"
host = casper.cli.options['host'] or defaultHost
port = casper.cli.options['port'] or
  if host is defaultHost then "5000" else "80"

portString = if port == "80" or port == 80 then "" else ":#{port}"

unless (host.match /localhost/) or (host.match /staging/)
  casper.die "Server url contains neither 'localhost' nor 'staging', aborting"

serverUrl = "#{host}#{portString}"
casper.echo "Testing against server at #{serverUrl}"

# test suites

casper.test.begin 'Test the login procedure', 2, (test) ->
  casper.start serverUrl, ->
    test.assertTitle 'Go', 'The front page title is the one expected'

  casper.thenClick '#persona_login'
  casper.waitForPopup /persona/
  casper.withPopup /persona/, ->
    test.assertTitleMatch /Persona/i, 'Persona login popup has expected title'

  casper.then ->
    test.done()

casper.test.begin "Game interface", 1, (test) ->

  ONE_EMAIL = 'player@one.com'
#  TWO_EMAIL = 'playa@dos.es'
#  # create a couple of games
#  clear_games_for_player ONE_EMAIL
#  clear_games_for_player TWO_EMAIL
#  create_game ONE_EMAIL, TWO_EMAIL
#  create_game ONE_EMAIL, TWO_EMAIL
#
  # -- PLAYER ONE
  # player one logs in and gets the front page; should see a page listing
  # games
  create_login_session ONE_EMAIL
  casper.start serverUrl, ->
    test.assertExists '#logout'

  casper.then ->
    test.done()

# helper functions

clear_games_for_player = (email) ->
  casper.open "#{serverUrl}/testing_clear_games_for_player",
    method: 'post'
    data:
      'email': email

create_game = (black_email, white_email) ->
  casper.open "#{serverUrl}/testing_create_game",
    method: 'post'
    data:
      'black_email': black_email
      'white_email': white_email

create_login_session = (email) ->
  casper.open "#{serverUrl}/testing_create_login_session",
    method: 'post'
    data:
      'email': email

# @fill "form[action='/search']", q: "casperjs", true

# casper.then ->
  # aggregate results for the 'casperjs' search
#   links = @evaluate getLinks
  # search for 'phantomjs' from google form
#   @fill "form[action='/search']", q: "phantomjs", true

# casper.then ->
  # concat results for the 'phantomjs' search
#   links = links.concat @evaluate(getLinks)

# casper.run ->
  # display results
#  @echo links.length + " links found:"
#  @echo(" - " + links.join("\n - ")).exit()

casper.run ->
  casper.log "shutting down..."
  casper.open 'http://localhost:5000/shutdown',
    method: 'post'
