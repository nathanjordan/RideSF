from flask import Flask, render_template, send_from_directory, jsonify, request
import db

# Create a new Flask server
app = Flask(__name__)

# Enable debugging
app.debug = True


@app.route('/parking', methods=['GET'])
def parking_route():
    if 'lat' not in request.args and 'lon' not in request.args:
        return jsonify({'error': "Query needs 'lat' and 'lon' args"})
    if 'meters' not in request.args:
        return jsonify({'error': "Query needs 'meters' arg"})
    lat = float(request.args.get('lat'))
    lon = float(request.args.get('lon'))
    meters = float(request.args.get('meters'))
    res = db.get_parking_in_radius((lat, lon), meters)
    return jsonify({'results': res})


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/assets/<path:resource>')
def serveStaticResource(resource):
    return send_from_directory('static/assets/', resource)

if __name__ == "__main__":
    app.run('localhost', 5000)
