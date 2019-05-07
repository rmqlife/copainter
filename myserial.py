import serial

def read_serial(ser):
    ser.flushInput()
    s = ser.read(size=2)# .decode("utf-8")
    l = list()
    l.append(int(s[0]))
    l.append(int(s[1]))
    return l

def parse_serial():
    global has_ser
    global ser1
    global ser2
    if not has_ser:
        import serial
        # ser = serial.Serial('COM3', 9600, xonxoff=0)
        ser1 = serial.Serial('COM3', 9600, timeout=1, bytesize=8, parity='N', stopbits=1, xonxoff=1, rtscts=1)
        ser2 = serial.Serial('COM4', 9600, timeout=1, bytesize=8, parity='N', stopbits=1, xonxoff=1, rtscts=1)
        has_ser=True
    l1 = read_serial(ser1)
    l2 = read_serial(ser2)
    return l1+l2
