import requests
import db
import os
from lxml import etree

# Parking locations URL
FEED_URL = "https://data.sfgov.org/api/views/w969-5mn4/rows.xml"

# Testing directory
test_dir = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '../',
    'tests/xml')


class FeedLoader(object):

    def get_feed(self):  # pragma: no cover
        return requests.get(FEED_URL).text


class TestFeedLoader(FeedLoader):  # pragma: no cover

    FEED_GOOD = "test_feed.xml"
    FEED_BAD_XML = "test_feed_bad_xml.xml"
    FEED_BAD_FORMAT = "test_feed_bad_format.xml"

    def __init__(self, feed_type):
        self.feed_filename = feed_type

    def get_feed(self):
        return open(test_dir + '/' + self.feed_filename).read()


class BadFeedException(Exception):  # pragma: no cover

    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)


class FeedProcessor(object):

    def __init__(self, feed_loader, db_service):
        self.feed_loader = feed_loader
        self.db_service = db_service

    def update_bike_parking(self):
        """ Reads from the xml feed and adds entries to the database """
        # Load the feed
        xml = self.feed_loader.get_feed()
        # Create a record count
        record_count = 0
        # get the row element that contains all the others
        try:
            rows = etree.fromstring(xml).find('row')
        except etree.XMLSyntaxError as e:
            raise BadFeedException(e.message)
        if not len(rows.findall('row')):
            raise BadFeedException("XML recieved is incorrect! Perhaps the \
                                   spec has changed?")
        # parse and add each row
        for row in rows:
            try:
                loc_name = row.find("location_name").text
                # XML Feed has a bug I guess
                address = row.find("yr_inst").text
                parking_type = row.find("bike_parking").text
                placement = row.find("placement").text
                status = row.find("status").text
                lat = row.find("coordinates").get("latitude")
                lon = row.find("coordinates").get("longitude")
            # If we find an error skip to the next one
            except AttributeError:
                continue
            # Add to the database
            try:
                self.db_service.create_location(
                    loc_name=loc_name,
                    parking_type=parking_type,
                    placement=placement,
                    status=status,
                    address=address,
                    lat=float(lat),
                    lon=float(lon)
                )
            # likewise, skip over bad rows
            except Exception:
                continue
            record_count += 1
        return record_count

# Update the DB if we're running this script directly
if __name__ == "__main__":  # pragma: no cover
    # Clear the existing data
    db.clear_data()
    # create a new feed processor
    fp = FeedProcessor(FeedLoader(), db.DatabaseService())
    # Add the new data from the feed
    fp.update_bike_parking()
