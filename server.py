import numpy
import json
from flask import Flask
from flask import request, render_template, send_from_directory, jsonify
from collections import deque
from imutils.video import VideoStream
import cv2
import imutils
import time

CUSTOM_STATIC_DIRECTORY = "/public/"
STATIC_FOLDER = "public"

## serve index.html
app = Flask(__name__, static_folder=STATIC_FOLDER, static_path=CUSTOM_STATIC_DIRECTORY)

colorLowers = { 'GR':  (30, round(25*2.55), round(20*2.55)),
                'OR': (7, round(50*2.55), round(60*2.55)),
                'RD1': (0, round(70*2.55), round(30*2.55)),
                'RD2': (170, round(70*2.55), round(30*2.55))
                }
colorUppers = { 'GR':  (80, round(80*2.55), round(100*2.55)),
                'OR': (30, round(100*2.55), round(100*2.55)),
                'RD1': (2, round(100*2.55), round(60*2.55)),
                'RD2': (180, round(100*2.55), round(60*2.55))
                }
colorNames = ['GR', 'RD']
vs = None


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

def tracker():
    frame = vs.read()
    frame = imutils.resize(frame, width=1200)
    frame = cv2.flip(frame, 1)
    blurred = cv2.GaussianBlur(frame, (11, 11), 0)
    hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)

    centers = []
    centers_str = ''
    for i in range(len(colorNames)):
        if colorNames[i] is not 'RD':
            mask = cv2.inRange(hsv, colorLowers[colorNames[i]], colorUppers[colorNames[i]])
        else:
            mask1 = cv2.inRange(hsv, colorLowers['RD1'], colorUppers['RD1'])
            mask2 = cv2.inRange(hsv, colorLowers['RD2'], colorUppers['RD2'])
            mask = mask1 | mask2
        mask = cv2.erode(mask, None, iterations=2)
        mask = cv2.dilate(mask, None, iterations=2)

        cnts = cv2.findContours(mask.copy(), cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE)
        cnts = imutils.grab_contours(cnts)
        center = None
     
        if len(cnts) > 0:
            c = max(cnts, key=cv2.contourArea)
            ((x, y), radius) = cv2.minEnclosingCircle(c)
            M = cv2.moments(c)
            center = (int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"]))
            if radius < 5:
                center = None

        centers.append(center)
        if center is None:
            center_str = '99999999'
        else:
            center_str = '%04d%04d' % (center[0], center[1])
        centers_str += colorNames[i] + center_str

    return centers
    # return centers_str.encode('utf-8')

@app.route('/getData')
def get_points_data():
    global idx
    idx += 1
    data = {}
    
    center1, center2 = tracker()
    data["x"] = center1[0]
    data["y"] = center1[1]
    data["pressed"] = 1
    data["jstick"] = -1
    
    return json.dumps(data)

## run the server app
if __name__ == "__main__":
    # Init tracker
    vs = VideoStream(src=0).start()
    time.sleep(2.0)

    idx = -1
    app.run(host='0.0.0.0', port=8080, debug=True)


    # End the application
    vs.release()