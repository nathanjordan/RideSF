from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from geoalchemy2 import Geography, func
from geoalchemy2.elements import WKTElement
import json

Base = declarative_base()


class ParkingLocation(Base):
    """ Parking location object """

    __tablename__ = 'parking_location'

    id = Column(Integer, primary_key=True)
    loc_name = Column(String)
    address = Column(String)
    parking_type = Column(String)
    placement = Column(String)
    status = Column(String)
    loc = Column(Geography(geometry_type='POINT'))


class DatabaseService(object):
    """ Abstracts database operations """

    def __init__(self):
        engine = self._create_alchemy_engine()
        self.session = self._create_session()
        Base.metadata.create_all(engine)

    def _create_alchemy_engine(self):
        # Create database engine
        return create_engine('postgresql://postgres:postgres@localhost/ridesf')

    def _create_session(self, engine):
        # create session
        Session = sessionmaker(bind=engine)
        return Session()

    def create_location(self, loc_name, address, parking_type, placement,
                        status, lat, lon):
        """ Creates a new parking location entity and adds it to the
            database """
        pl = ParkingLocation(loc_name=loc_name, address=address,
                             parking_type=parking_type, placement=placement,
                             status=status, loc="Point(%f %f)" % (lon, lat))
        self.session.add(pl)
        self.session.commit()

    def clear_data(self):
        """ Clears the parking location data from the database """
        self.session.query(ParkingLocation).delete()

    def get_parking_in_radius(self, location, radius):
        """ Gets parking spots around a location within a radius specified in
            meters """
        lat = location[0]
        lon = location[1]
        # create a WKT of the point we're searching for
        wkt = WKTElement('POINT(%f %f)' % (lon, lat), srid=4326)
        res = self.session.query(
            ParkingLocation,
            func.ST_AsGeoJSON(ParkingLocation.loc)).filter(
            func.ST_DWithin(ParkingLocation.loc, wkt, radius)
        ).all()
        # turn the iterable into a list
        model_list = list(res)
        # return a list of serialized models
        return [self._serialize_parking_location(model)
                for model in model_list]

    def _serialize_parking_location(self, model_geo_tuple):
        """ Takes the SQLAlchemy model and returns a dict representation of
            the parking location """
        # load the geojson string
        geo_json = json.loads(model_geo_tuple[1])
        # grab the model
        model = model_geo_tuple[0]
        # create the dict
        loc = {
            'id': model.id,
            'loc_name': model.loc_name,
            'address': model.address,
            'parking_type': model.parking_type,
            'placement': model.placement,
            'status': model.status,
            'location': geo_json
        }
        return loc

    def get_location_by_id(self, id):
        """ Gets a parking location by its ID """
        model = self.session.query(
            ParkingLocation,
            func.ST_AsGeoJSON(ParkingLocation.loc)).get(id)
        # If we didn't get anything, return None
        if not model:
            return None
        # otherwise serialize the object
        else:
            return self._serialize_parking_location(model)
