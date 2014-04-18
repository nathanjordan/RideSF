import unittest
import app.server
import json
import urllib


class TestFlaskRoutes(unittest.TestCase):

    def setUp(self):
        flask_app = app.server.app
        flask_app.testing = True
        self.app = flask_app.test_client()


class TestParkingRoute(TestFlaskRoutes):

    def test_bad_id(self):
        res = self.app.get('/location/0')
        self.assertTrue('error' in json.loads(res.get_data()))

    def test_bad_type(self):
        res = self.app.get('/location/a_string')
        self.assertTrue(res.status_code == 404)

    def test_correct_id(self):
        res = self.app.get('/location/1')
        id = json.loads(res.get_data())['id']
        self.assertTrue(id == 1)

class TestFindParkingRoute(TestFlaskRoutes):

    def _locations_with_param(self, params):
        query = urllib.urlencode(params)
        res = self.app.get('/locations?%s' % query)
        return json.loads(res.get_data())

    def test_no_lat(self):
        params = {
            "lon": 23.0,
            "radius": 24.0
        }
        res = self._locations_with_param(params)
        self.assertTrue('error' in res)

    def test_no_lon(self):
        params = {
            "lon": 23.0,
            "radius": 24.0
        }
        res = self._locations_with_param(params)
        self.assertTrue('error' in res)

    def test_no_radius(self):
        params = {
            "lat": 10.0,
            "lon": 23.0
        }
        res = self._locations_with_param(params)
        self.assertTrue('error' in res)

    def test_nothing(self):
        params = {
        }
        res = self._locations_with_param(params)
        self.assertTrue('error' in res)

    def test_correct(self):
        params = {
            "lat": 10.0,
            "lon": 15.0,
            "radius": 100
        }
        res = self._locations_with_param(params)
        self.assertTrue('results' in res)

class TestIndexRoute(TestFlaskRoutes):

    def test_check_page_served(self):
        res = self.app.get('/')
        self.assertTrue(res.status_code == 200)
        self.assertTrue(len(res.get_data()))

class TestStaticRoute(TestFlaskRoutes):

    def test_serve_app(self):
        res = self.app.get('/assets/js/ridesf/app.js')
        self.assertTrue(res.status_code == 200)
        self.assertTrue(len(res.get_data()))

