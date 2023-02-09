import json
import socket
import time
from subprocess import check_output
from sys import platform

# Properties
BUFSIZE = 65535
PORT = 37029
LISTEN_PORT = 37030
DEVICES_LICENSED_FILE_URL = '/home/david/bionet/test/tauri-app/extensions/spawnedProcess/discovery/license.json'
UDP_MESSAGE_TEXT = 'Looking for Rosita instances'
URL_DOMAIN = 'bionet.local'

# Get my info by network
# En algunos linux no funciona bien la busqueda de ip por socket
if platform == 'win32': #work in windows
    networks = socket.getaddrinfo(host=socket.gethostname(), port=None, family=socket.AF_INET)
    myIps = [network[-1][0] for network in networks]
else: #work in linux
    ips = check_output(['hostname', '--all-ip-addresses'])
    myIps = ips.decode("utf-8").replace(' \n', '').replace('\n', '').split(' ')

# Read the license file
with open(DEVICES_LICENSED_FILE_URL) as json_file:
    devices = json.load(json_file)['devices']

try:
    for ip in myIps:
        # Create a UDP socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        # bind the socket to any valid IP address and a specific port
        sock.bind((ip, LISTEN_PORT))

        # Start looking for Rosita instances
        sock.sendto(UDP_MESSAGE_TEXT.encode('ascii'), ("<broadcast>", PORT))

        deltaT = 5.0
        limitTime = time.time() + deltaT  # Timeout after 5 seconds

        # Wait for a response from the server (or timeout)
        while set((x['sn'] for x in devices)).__len__() > 0:
            try:
                if time.time() >= limitTime:
                    raise Exception()
                sock.settimeout(deltaT)
                data, address = sock.recvfrom(BUFSIZE)
            except Exception as ex:
                break

            try:
                json_recv = json.loads(data.decode('ascii'))
            except Exception:
                # Only accepts answers in json format
                pass
            else:
                for data in json_recv:
                    resp = next((x for x in devices if x['sn'] == data['sn']), None)
                    if resp is not None:
                        ip = address[0]
                        url = address[0].replace('.', '') + '.' + URL_DOMAIN
                        # Update in-memory license.json with IPs and url
                        resp.setdefault('ip', ip)
                        resp.setdefault('url', url)

except Exception as ex:
    pass

# Return result to Neutralino spawnProcess event
print(json.dumps(devices, default=lambda o: o.__dict__, sort_keys=True, indent=4))
