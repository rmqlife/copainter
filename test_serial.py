import serial
import sys
import glob
def serial_ports():
    """ Lists serial port names

        :raises EnvironmentError:
            On unsupported or unknown platforms
        :returns:
            A list of the serial ports available on the system
    """
    if sys.platform.startswith('win'):
        ports = ['COM%s' % (i + 1) for i in range(256)]
    elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
        # this excludes your current terminal "/dev/tty"
        ports = glob.glob('/dev/tty[A-Za-z]*')
    elif sys.platform.startswith('darwin'):
        ports = glob.glob('/dev/tty.*')
    else:
        raise EnvironmentError('Unsupported platform')

    result = []
    for port in ports:
        try:
            s = serial.Serial(port)
            s.close()
            result.append(port)
        except (OSError, serial.SerialException):
            pass
    return result


def read_serial(ser):
    s = ser.read(size=4)# .decode("utf-8")
    l = list()

    for i in range(len(s)):
        if int(s[i])==111 and int(s[(i+3)%4])==222:
            l.append(int(s[(i+1)%4]))
            l.append(int(s[(i+2)%4]))
            return l
    l.append(-1)
    l.append(-1)
    return l

if __name__=="__main__":
    ports = serial_ports()
    print("ports", ports)
    sers = list()
    for port in ports:
        ser = serial.Serial(port, 9600) #, timeout=1, bytesize=8, parity='N', stopbits=2, xonxoff=1, rtscts=1)
        sers.append(ser)

    

    for i in range(50):
        l_final = []
        for ser in sers:
            l = read_serial(ser)
            print(l)
            l_final += l
        print(l_final)