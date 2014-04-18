from flask import Flask, render_template, send_from_directory, jsonify, request
import db
import os

# Create a new Flask server
app = Flask(__name__)

# Create the database service
if os.environ.get('TEST'):
    app.database_service = db.MockDatabaseService()
else:
    app.database_service = db.DatabaseService()

# Enable debugging if the DEBUG env is set
if os.environ.get('DEBUG'):
    app.debug = True


@app.route('/location/<int:id>')
def parking_route(id):
    """ Route for getting a specific location """
    loc = app.database_service.get_location_by_id(id)
    if not loc:
        return jsonify({'error': "No location with id %s exists" % id})
    else:
        return jsonify(loc)


@app.route('/locations', methods=['GET'])
def find_parking_route():
    """ Route for finding locations in a certain area """
    # Check if the client supplied the right query parameters
    if 'lat' not in request.args and 'lon' not in request.args:
        return jsonify({'error': "Query needs 'lat' and 'lon' args"})
    if 'radius' not in request.args:
        return jsonify({'error': "Query needs 'radius' arg"})
    # cast the parameters
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        radius = float(request.args.get('radius'))
    except ValueError:
        return jsonify({'error': "Invalid query parameters"})
    # Get and return the locations
    res = app.database_service.get_parking_in_radius((lat, lon), radius)
    return jsonify({'results': res})


@app.route('/', methods=['GET'])
def index():
    """ Return the view of the application """
    return render_template('index.html')


@app.route('/assets/<path:resource>')
def serveStaticResource(resource):
    """ Serve static resources like images/css/scripts """
    return send_from_directory('static/assets/', resource)

# Start the server if we're running this file
if __name__ == "__main__":
    app.run('0.0.0.0', 5000)
