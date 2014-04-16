from flask import Flask, render_template, send_from_directory, jsonify, request
import db

# Create a new Flask server
app = Flask(__name__)

# Enable debugging
app.debug = True


@app.route('/location/<int:id>')
def parking_route(id):
    loc = db.get_location_by_id(id)
    if not loc:
        return jsonify({'error': "No location with id %s exists" % id})
    else:
        return jsonify(loc)


@app.route('/locations', methods=['GET'])
def find_parking_route():
    if 'lat' not in request.args and 'lon' not in request.args:
        return jsonify({'error': "Query needs 'lat' and 'lon' args"})
    if 'radius' not in request.args:
        return jsonify({'error': "Query needs 'radius' arg"})
    lat = float(request.args.get('lat'))
    lon = float(request.args.get('lon'))
    radius = float(request.args.get('radius'))
    res = db.get_parking_in_radius((lat, lon), radius)
    return jsonify({'results': res})


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/assets/<path:resource>')
def serveStaticResource(resource):
    return send_from_directory('static/assets/', resource)

if __name__ == "__main__":
    app.run('localhost', 5000)
