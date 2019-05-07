import serial
def read_serial(ser):
    s = ser.read(size=2)# .decode("utf-8")
    l = list()
    l.append(int(s[0]))
    l.append(int(s[1]))
    return l

ser1 = serial.Serial('COM3', 9600) #, timeout=1, bytesize=8, parity='N', stopbits=2, xonxoff=1, rtscts=1)
ser2 = serial.Serial('COM4', 9600)

for i in range(100):
    l1 = read_serial(ser1)
    l2 = read_serial(ser2)
    print(l1, l2)