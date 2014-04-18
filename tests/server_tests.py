import unittest
import app.server


class TestParkingRoute(unittest.TestCase):

    def setUp(self):
        app = app.server.app
        app.testing = True
        self.app = app.test_client()

    def test_f(self):
        pass
