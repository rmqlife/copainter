import numpy
import json
from flask import Flask
from flask import request, render_template, send_from_directory, jsonify
from collections import deque
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
center1_prev = None
center2_prev = None
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
    ret, frame = vs.read()
    if not ret:
    	print('Error in reading frame.')
    	return tracker()

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


@app.route('/getData')
def get_points_data():
    global idx
    idx += 1
    data = {}
    
    center1, center2 = tracker()
    if center1 is None:
    	center1 = center1_prev
    if center2 is None:
    	center2 = center2_prev
    # data["gx"] = center1[0] if center1 else None
    # data["gy"] = center1[1] if center1 else None
    # data["rx"] = center2[0] if center2 else None
    # data["ry"] = center2[1] if center2 else None
    data["gx"] = center1[0]
    data["gy"] = center1[1]
    data["rx"] = center2[0]
    data["ry"] = center2[1]
    center1_prev, center2_prev = center1, center2

    data["gpressed"] = 1
    data["gjstick"] = -1
    data["rpressed"] = 1
    data["rjstick"] = -1
    
    return json.dumps(data)

## run the server app
if __name__ == "__main__":
    # Init tracker
    vs = cv2.VideoCapture(0)
    time.sleep(2.0)
    if not vs.isOpened():
    	vs.open()

    idx = -1
    app.run(host='0.0.0.0', port=8010, debug=True)


    # End the application
    vs.release()