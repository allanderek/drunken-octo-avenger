// Generated by CoffeeScript 1.9.1
(function() {
  var defaultHost, host, port, portString, serverUrl;

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
    casper.then(function() {
      return casper.open('http://localhost:5000/shutdown', {
        method: 'post'
      });
    });
    return casper.run(function() {
      return test.done();
    });
  });

}).call(this);
