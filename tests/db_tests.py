import unittest
from app.db import DatabaseService, ParkingLocation
from sqlalchemy import create_engine


class TestDatabaseService(DatabaseService):
    """ Testing database service """

    def __init__(self):
        super(TestDatabaseService, self).__init__()
        self.clear_data()
        model1 = ParkingLocation(
            id=1,
            loc_name="Test Location",
            address="984 Harrison Street",
            parking_type="RACK",
            placement="SIDEWALK",
            status="INSTALLED",
            loc="Point(%f %f)" % (-122.403748, 37.777695)
        )
        model2 = ParkingLocation(
            id=2,
            loc_name="Test Location 2",
            address="420 Folsom Street",
            parking_type="RACK",
            placement="SIDEWALK",
            status="INSTALLED",
            loc="Point(%f %f)" % (-122.3940241, 37.7877584)
        )
        model3 = ParkingLocation(
            id=3,
            loc_name="Test Location 3",
            address="806 S Van Ness Ave",
            parking_type="RACK",
            placement="SIDEWALK",
            status="INSTALLED",
            loc="Point(%f %f)" % (-122.4191725, 37.7621478)
        )
        self.session.add(model1)
        self.session.add(model2)
        self.session.add(model3)
        self.session.commit()

    def _create_alchemy_engine(self):
        # Create a test db for tests
        return create_engine('postgresql://postgres:postgres@localhost/ridesf_test', echo=True)


class DBTest(unittest.TestCase):

    def setUp(self):
        self.db_service = TestDatabaseService()


class CreateLocationTests(DBTest):

    def test_create_location(self):
        loc_name = "Test Location 4"
        address = "647 Valencia Street"
        parking_type = "RACK"
        placement = "SIDEWALK"
        status = "INSTALLED"
        lat = 37.7621648
        lon = -122.4198591
        id = self.db_service.create_location(
            loc_name=loc_name,
            parking_type=parking_type,
            placement=placement,
            status=status,
            address=address,
            lat=float(lat),
            lon=float(lon)
        )
        self.assertTrue(self.db_service.get_location_by_id(id))


class ClearDataTests(DBTest):

    def test_clear_data(self):
        self.db_service.clear_data()
        models = self.db_service.session.query(ParkingLocation).all()
        locations = list(models)
        self.assertFalse(len(locations))


class ParkingLocatorTests(DBTest):

    def test_find_parking_1(self):
        # This is right around SOMA
        loc = (37.7873395, -122.3944626)
        # spatial assertions are weird
        parking = self.db_service.get_parking_in_radius(loc, 500)
        self.assertTrue(len(parking) == 1)

    def test_find_parking_2(self):
        # This is right around mission dolores
        loc = (37.764901, -122.4182699)
        # spatial assertions are weird
        parking = self.db_service.get_parking_in_radius(loc, 500)
        self.assertTrue(len(parking) == 1)

    def test_find_parking_none(self):
        # This is right around oakland
        loc = (37.804438, -122.271152)
        # spatial assertions are weird
        parking = self.db_service.get_parking_in_radius(loc, 500)
        self.assertFalse(len(parking))


class LocByIDTests(DBTest):

    def test_by_id_found(self):
        loc = self.db_service.get_location_by_id(1)
        self.assertTrue(loc['id'] == 1)

    def test_by_id_not_found(self):
        loc = self.db_service.get_location_by_id(0)
        self.assertFalse(loc)
