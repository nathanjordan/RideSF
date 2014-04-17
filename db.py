from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from geoalchemy2 import Geography, func
from geoalchemy2.elements import WKTElement
import json


engine = create_engine('postgresql://postgres:postgres@localhost/ridesf')
Base = declarative_base()
Session = sessionmaker(bind=engine)
session = Session()


class ParkingLocation(Base):

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
    pl = ParkingLocation(loc_name=loc_name, address=address,
                         parking_type=parking_type, placement=placement,
                         status=status, loc="Point(%f %f)" % (lon, lat))
    session.add(pl)
    session.commit()


def clear_data():
    session.query(ParkingLocation).delete()


def get_parking_in_radius(location, radius):
    lat = location[0]
    lon = location[1]
    res = session.query(ParkingLocation, func.ST_AsGeoJSON(ParkingLocation.loc)).filter(
        func.ST_DWithin(ParkingLocation.loc,
                        WKTElement('POINT(%f %f)' % (lon, lat),
                                   srid=4326),
                        radius)).all()
    model_list = list(res)
    return [serialize_parking_location(model) for model in model_list]


def serialize_parking_location(model):
    geo_json = json.loads(model[1])
    model = model[0]
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
    model = session.query(ParkingLocation,
                          func.ST_AsGeoJSON(ParkingLocation.loc)).get(id)
    if not model:
        return None
    else:
        return serialize_parking_location(model)
