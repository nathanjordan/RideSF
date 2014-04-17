from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from geoalchemy2 import Geography, func
from geoalchemy2.elements import WKTElement
import json


# Create database engine
engine = create_engine('postgresql://postgres:postgres@localhost/ridesf')
# Declarative sqlalchemy
Base = declarative_base()
# create session
Session = sessionmaker(bind=engine)
session = Session()


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

Base.metadata.create_all(engine)


def create_location(loc_name, address, parking_type, placement, status, lat,
                    lon):
    """ Creates a new parking location entity and adds it to the database """
    pl = ParkingLocation(loc_name=loc_name, address=address,
                         parking_type=parking_type, placement=placement,
                         status=status, loc="Point(%f %f)" % (lon, lat))
    session.add(pl)
    session.commit()


def clear_data():
    """ Clears the parking location data from the database """
    session.query(ParkingLocation).delete()


def get_parking_in_radius(location, radius):
    lat = location[0]
    lon = location[1]
    # create a WKT of the point we're searching for
    wkt = WKTElement('POINT(%f %f)' % (lon, lat), srid=4326)
    res = session.query(ParkingLocation,
                        func.ST_AsGeoJSON(ParkingLocation.loc)).filter(
                            func.ST_DWithin(ParkingLocation.loc, wkt, radius)
                        ).all()
    # turn the iterable into a list
    model_list = list(res)
    # return a list of serialized models
    return [serialize_parking_location(model) for model in model_list]


def serialize_parking_location(model_geo_tuple):
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


def get_location_by_id(id):
    """ Gets a parking location by its ID """
    model = session.query(ParkingLocation,
                          func.ST_AsGeoJSON(ParkingLocation.loc)).get(id)
    # If we didn't get anything, return None
    if not model:
        return None
    # otherwise serialize the object
    else:
        return serialize_parking_location(model)
