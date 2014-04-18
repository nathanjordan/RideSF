import unittest
from app.feed import TestFeedLoader, FeedProcessor, BadFeedException
from app.db import MockDatabaseService


class FeedTests(unittest.TestCase):

    def test_bad_xml_feed(self):
        fp = FeedProcessor(TestFeedLoader(TestFeedLoader.FEED_BAD_XML),
                           MockDatabaseService())
        with self.assertRaises(BadFeedException):
            fp.update_bike_parking()

    def test_bad_format_feed(self):
        fp = FeedProcessor(TestFeedLoader(TestFeedLoader.FEED_BAD_FORMAT),
                           MockDatabaseService())
        with self.assertRaises(BadFeedException):
            fp.update_bike_parking()

    def test_good_feed(self):
        fp = FeedProcessor(TestFeedLoader(TestFeedLoader.FEED_GOOD),
                           MockDatabaseService())
        fp.update_bike_parking()
