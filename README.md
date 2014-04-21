RideSF
======
[![Build Status](https://travis-ci.org/nathanjordan/RideSF.svg?branch=master)](https://travis-ci.org/nathanjordan/RideSF)
[![Coverage Status](https://coveralls.io/repos/nathanjordan/RideSF/badge.png)](https://coveralls.io/r/nathanjordan/RideSF)

RideSF is a proof of concept full-stack responsive web application for finding bike parking in San Francisco.

#### Mobile

<img width="300" src="http://i57.tinypic.com/10cu3bs.png"/>

#### Desktop

<img src="http://i57.tinypic.com/am36nm.png"/>

## Functional Spec

Bicycle Parking

## Technical Specs

This is a full-stack application

### Back-end

To create the back-end, I used Python and the Flask web application framework.
Flask handles serving the page as well as handling requests for parking
locations sent from Backbone. I chose Flask because its lighter than Django
and makes sense for smaller projects like this that do not require a large
set of database entities or the need for other features Django provides like
form validation and admin pages. For the database, I chose to use PostgreSQL
because of the GIS features that are provided by PostGIS such as distance
queries that were very useful for this application. There is also a 'feed'
module that makes a request to the data.sfgov website to get the parking
data from an XML feed.
I chose the XML feed in lieu of the JSON one because it seemed to be structured
in a less confusing manner (the JSON feed has a bunch of metadata that needs
to be analyzed to get the right columns, etc.). To handle the testing and
coverage percentage I used the Nose test runner with the standard unittest
module. Below is a list of technologies I used for the back-end and my
experience with them.

* Python (Proficient)
* Flask (Proficient)
* SQLAlchemy (Somewhat experienced)
* GeoAlchemy (Never used before)
* lxml (Somewhat experienced)
* Nose (Somewhat experienced)
* Coverage (Somewhat experienced)

### Front-end

To implement the front-end part of the application, I used Bootstrap as the
front-end UI framework and Backbone as the Javascript framework. Bootstrap
provides a lot of UI elements that speed development time as well as making
it easy to make the page responsive (try the app on your Android or iPhone).
I chose Backbone because I've never used it before and wanted to get some
experience with a new front-end Javascript framework (I'm used to Angular). I used
the Google Maps Javascript API to create and interact with the map for things
like creating markers and providing the user with directions. For styling
I used LESS instead of raw CSS because it's more succinct and eliminates a lot
of duplicate styling. I also made use of jQuery and Underscore as
utility libraries in my Javascript code.  I created the logo and map markers
in Adobe Illustrator which are SVG's so they will scale to any size well. I
used Mocha as the testing framework for the client-side code. I also made use
of the Chai assertion library and Sinon for function spying in test cases. Mocha
lets you test in a browser and in a headless environment like PhantomJS which
makes it ideal for testing on Travis. Below is a list of technologies I used
for the front-end and my experience with them.

* Bootstrap (Proficient)
* Backbone (Never used before, I've always used Angular)
* jQuery (Proficient)
* LESS (Somewhat experienced)
* Google Maps JS API (Never used before)
* Underscore (Proficient)
* Node (Proficient)
* Mocha (Novice)
* Chai (Never used before)
* Sinon (Never used before)

### Integration

I used Travis-CI for running the tests and calculated coverage. Coverage is
reported to Coveralls to track coverage over time.

### Hosting

The prototype is hosted on an Amazon EC2 instance located at:

[http://recursiveiteration.net:5000/](http://recursiveiteration.net:5000/)

The applications GitHub repository is located at:

[https://github.com/nathanjordan/RideSF](https://github.com/nathanjordan/RideSF)

### Project Notes

The first thing that irks me about this project is how I didn't make a
backbone view for the map. I'm not sure if this would force the Google Maps
API to redraw the entire map every time the view was re-rendered; a possible
experiment in the future. I also would have used Require.js if I had more time
for dependency loading and Grunt for task running like js minification and LESS
compiling. I also would have implemented more thorough testing.
Due to time constraints I wasn't able to get the client-side testing completely
working, so there are some functions that are not adequately tested. Also, I
wasn't entirely sure how to combine coverage stats for Python and Javascript
so the coverage reported is the Python code coverage.

As for additional features, theres a few things I would add. I'd make it so you
can add favorite parking spots, add the ability to filter by parking type and
allow users to optionally see proposed parking spots (with a different
marker color). A loading indicator would also be nice to show users that the
app is still working and not broken while fetching the geolocation and markers.
