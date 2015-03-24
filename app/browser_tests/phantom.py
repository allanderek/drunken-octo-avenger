from __future__ import (
        absolute_import, division, print_function, unicode_literals)
from builtins import (ascii, bytes, chr, dict, filter, hex, input,  # noqa
                      int, map, next, oct, open, pow, range, round,
                      str, super, zip)
from future import standard_library
standard_library.install_aliases()

import logging
import shlex
import subprocess
import time
import unittest
from urllib.error import URLError
from urllib.request import urlopen

import config

# importing main enables logging, we switch it off again here to prevent
# selenium debug lines from flooding the test output
logging.disable(logging.CRITICAL)

class PhantomTest(unittest.TestCase):

    def test_run(self):
        try:
            self._spawn_live_server()
            self.run_phantom_test()
        finally:
            self._post_teardown()
            self._terminate_live_server()

    def _spawn_live_server(self):
        self.port = config.LIVESERVER_PORT
        self._server_url = 'http://localhost:{}'.format(self.port)
        command_line = 'python manage.py run_test_server'
        self._process = subprocess.Popen(shlex.split(command_line))
        # wait a few seconds for the server to start listening
        timeout = 5
        start_time = time.time()
        while time.time() - start_time < timeout:
            time.sleep(0.5)
            try:
                urlopen(self._server_url)
            except URLError:
                pass
            else:
                break
        else:
            assert False, "timed out waiting for server to respond"

    def _post_teardown(self):
        if getattr(self, '_ctx', None) is not None:
            self._ctx.pop()
            del self._ctx

    def _terminate_live_server(self):
        if self._process:
            self._process.terminate()

    def run_phantom_test(self):
        subprocess.call(["cake", "build"])
        return_code = subprocess.call([
                "./node_modules/.bin/casperjs", "test",
                "--fail-fast",  # stop at first failed assertion
                "app/static/tests/browser.js"])
        self.assertEqual(return_code, 0, "phantomjs test failed")

if __name__ == "__main__":
    tester = PhantomTest()
    tester.run()