import sys
import uuid
import websocket
import json
import logging.config
from customlogger.CustomLogger import RositaLoggerAdapter, logger_starter

from config.PropertiesManager import PropertiesManager
from config.loggingConstants import LOGGING_EXTENSION, ADAPTER_GROUP

from asgi_correlation_id.context import correlation_id


correlation_id.set(str(uuid.uuid4()))
logging.config.dictConfig(logger_starter(PropertiesManager().logging_config_path))
log_ex = RositaLoggerAdapter(logging.getLogger(), {ADAPTER_GROUP: LOGGING_EXTENSION})

NL_TOKEN, NL_PORT, NL_EXTID = None, None, None
for var in sys.argv:
    if var.startswith('--nl-token='):
        NL_TOKEN = var[11:]
    if var.startswith('--nl-port='):
        NL_PORT = var[10:]
    if var.startswith('--nl-extension-id='):
        NL_EXTID = var[18:]

log_ex.info("Start extension with setup:")
log_ex.info("NL_TOKEN: %s", NL_TOKEN)
log_ex.info("NL_PORT: %s", NL_PORT)
log_ex.info("NL_EXTID: %s", NL_EXTID)


def on_message(ws, data):
    message = ReceivedMessage(data)

    if message.event == 'eventToExtension':
        log_ex.debug("Received message: %s", data)
        json_message = SendMessage(data='Hello from multi: ' + message.data).toJSON()
        log_ex.debug("[eventToExtension] Sending message: %s", json_message)
        ws.send(json_message)
    elif message.success == True:
        log_ex.debug("Sending message: %s", message.data)


def on_error(ws, error):
    log_ex.error("Error: %s", error)


def on_close(ws, close_status_code, close_msg):
    log_ex.debug("Closed connection with status code: %s, message: %s", close_status_code, close_msg)


def on_open(ws):
    ws.send("Hello")
    log_ex.debug("Connection opened")


class SendMessage:
    def __init__(self, id=str(uuid.uuid4()), method='app.broadcast', accessToken=NL_TOKEN, event='eventFromExtension',
                 data=''):
        self.id = id
        self.method = method
        self.accessToken = accessToken
        self.data = {
            'event': event,
            'data': data
        }

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__)


class ReceivedMessage:
    def __init__(self, message):
        json_message = json.loads(message)
        self.data = json_message['data'] if json_message.__contains__('data') else ''
        self.event = json_message['event'] if json_message.__contains__('event') else ''
        self.success = self.data['success'] if type(self.data) is dict and self.data.__contains__('success') else ''


if __name__ == "__main__":
    try:
        websocket.enableTrace(True)
        ws = websocket.WebSocketApp("ws://localhost:" + NL_PORT + "?extensionId=" + NL_EXTID,
                                    on_open=on_open,
                                    on_message=on_message,
                                    on_error=on_error,
                                    on_close=on_close)

        ws.run_forever()
    except Exception as e:
        log_ex.error("Exception: %s", e)
