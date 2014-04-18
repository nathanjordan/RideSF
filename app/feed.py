import requests
import db
from lxml import etree

# Parking locations URL
FEED_URL = "https://data.sfgov.org/api/views/w969-5mn4/rows.xml"


def update_bike_parking():
    """ Reads from the xml feed and adds entries to the database """

    # Create a database service
    database_service = db.DatabaseService()

    # Load the feed
    r = requests.get(FEED_URL)

    # Clear the existing data
    db.clear_data()

    # get the row element that contains all the others
    root = etree.fromstring(r.text)
    rows = root[0]

    # parse and add each row
    for row in rows:
        loc_name = row.find("location_name").text
        # XML Feed has a bug I guess
        address = row.find("yr_inst").text
        parking_type = row.find("bike_parking").text
        placement = row.find("placement").text
        status = row.find("status").text
        lat = row.find("coordinates").get("latitude")
        lon = row.find("coordinates").get("longitude")
        # Add to the database
        database_service.create_location(
            loc_name=loc_name,
            parking_type=parking_type,
            placement=placement,
            status=status,
            address=address,
            lat=float(lat),
            lon=float(lon)
        )

# Update the DB if we're running this script directly
if __name__ == "__main__":
    update_bike_parking()
