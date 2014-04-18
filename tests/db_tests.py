import unittest
import app.db
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker


class TestDatabaseService(app.db.DatabaseService):
    """ Testing database service using in-memory SQLite """

    def __init__(self):
        # TODO make this dynamic
        spatialite_location = "/usr/local/lib/python2.7/site-packages/pyspatialite/_spatialite.so"
        engine = self._create_alchemy_engine()

        @event.listens_for(engine, "connect")
        def connect(dbapi_connection, connection_rec):
            dbapi_connection.enable_load_extension(True)

        session = sessionmaker(bind=engine)()
        self.session = session
        # TODO  this causes a Python core segmentation fault
        #session.execute("select load_extension('%s');" % spatialite_location)
        #session.execute("SELECT InitSpatialMetaData();")
        #session.execute("INSERT INTO spatial_ref_sys (srid, auth_name, auth_srid, ref_sys_name, proj4text) VALUES (4326, 'epsg', 4326, 'WGS 84', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');")
        app.db.Base.metadata.create_all(engine)

    def _create_alchemy_engine(self):
        # Create a test db for tests
        return create_engine('sqlite:///test.db')


class DBTest(unittest.TestCase):

    def setUp(self):
        self.db_service = TestDatabaseService()

    #def test_create_location(self):
    #    pass

    #def test_clear_data(self):
    #    pass
