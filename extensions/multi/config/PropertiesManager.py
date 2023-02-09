import configparser
import os

from pattern.Singleton import Singleton

PROPERTIES_INI_FILE_PATH = 'extensions/multi/resources/config.ini'

# Char to chain properties.
PROPERTIES_SPLIT_CHAR = ','


# Split properties separated by PROPERTIES_SPLIT_CHAR.
def split_property(prop):
    return str(prop).split(PROPERTIES_SPLIT_CHAR)


class PropertiesManager(metaclass=Singleton):

    def __init__(self):
        config = configparser.ConfigParser()
        config.read(PROPERTIES_INI_FILE_PATH)

        # LOGGING
        #  path to properties file for customlogger system.
        self.__logging_config_path = str(config['LOGGING']['logging.config.file.path'])

    @property
    def logging_config_path(self):
        return self.__logging_config_path
