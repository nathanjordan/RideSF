import requests
import db
from lxml import etree

FEED_URL = "https://data.sfgov.org/api/views/w969-5mn4/rows.xml"


def update_bike_parking():

    r = requests.get(FEED_URL)

    db.clear_data()

    root = etree.fromstring(r.text)
    rows = root[0]

    for row in rows:
        loc_name = row.find("location_name").text
        # XML Feed has a bug I guess
        address = row.find("yr_inst").text
        parking_type = row.find("bike_parking").text
        placement = row.find("placement").text
        status = row.find("status").text
        lat = row.find("coordinates").get("latitude")
        lon = row.find("coordinates").get("longitude")
        db.create_location(loc_name=loc_name, parking_type=parking_type,
                           placement=placement, status=status, address=address,
                           lat=float(lat), lon=float(lon))

if __name__ == "__main__":
    update_bike_parking()
