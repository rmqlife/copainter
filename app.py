import numpy
import json
from flask import Flask
from flask import request, render_template, send_from_directory, jsonify



CUSTOM_STATIC_DIRECTORY = "/public/"
STATIC_FOLDER = "public"

## serve index.html
app = Flask(__name__, static_folder=STATIC_FOLDER, static_path=CUSTOM_STATIC_DIRECTORY)


@app.route("/")
def index():
    return app.send_static_file('index.html')

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('public/js/', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('public/css/', path)


## creating a bunch of points to draw circle:
def circlePoints(points, radius, center):
    shape = []
    slices = 2 * 3.14 / points
    for i in range(points):
        angle = slices * i
        new_x = int(center[0] + radius * numpy.cos(angle))
        new_y = int(center[1] + radius * numpy.sin(angle))

        p = (new_x, new_y)
        shape.append(p)
    return shape

points = circlePoints(99, 100, (300, 300))


from myserial import parse_serial

@app.route('/serial')
def serial():
    l = parse_serial()
    return str(l[0]) +" and " + str(l[1]) + " and " + str(l[2]) + " and " + str(l[3])

@app.route('/getData')
def get_points_data():
    global idx
    idx += 1
    data = {}

    pressed = 1
    jstick = 255
    # l = parse_serial()
    # pressed = l[0]
    # jstick = l[1]
    l = parse_serial()
    data["pressed"] = l[0]
    data['jstick'] = l[1]

    if (idx < 99):
        data["x"] = points[idx][0]
        data["y"] = points[idx][1]
        #if ((idx > 10) and (idx < 45)) or ((idx > 50) and (idx < 95)):
        #    data['pressed'] = pressed
        #else:
        #    data['pressed'] = 0

    if (idx == 99):
        data["x"] = -1
        data["y"] = -1
        data["pressed"] = 1
        data["jstick"] = -1
    
    return json.dumps(data)

## run the server app
if __name__ == "__main__":
    has_ser = False
    idx = -1
    app.run(host='0.0.0.0', port=8080, debug=True)
