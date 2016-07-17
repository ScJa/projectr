import logging

# Log Config
LOG_FORMAT = "%(asctime)s - %(levelname)s: %(name)s - %(message)s"
LOG_LEVEL = logging.INFO
LOG_FILE = "recommender.log"
LOG_FILE_MAX_BYTES = 1024 * 1024
LOG_FILE_BACKUP_COUNT = 0

# DB Config
TYPE = ''
USER = ''
PASSWORD = ''
HOST = ''
PORT = 0
DB = ''
