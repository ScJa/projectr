import logging
#from logging.handlers import RotatingFileHandler
from recommender import config

def getLogger(obj):
    if not isinstance(obj, str):
        if hasattr(obj, '__name__'):
            obj = obj.__name__
        elif hasattr(obj, '__class__'):
            obj = obj.__class__.__name__
        else:
            obj = type(obj).__name__
    return configureLogger(logging.getLogger(obj))

def configureLogger(logger, level=config.LOG_LEVEL):
    if not len(logger.handlers):
        formatter = logging.Formatter(config.LOG_FORMAT)
        logger.setLevel(level)

        # Setup console logging
        ch = logging.StreamHandler()
        ch.setLevel(level)
        ch.setFormatter(formatter)
        logger.addHandler(ch)

        # # Setup file logging as well
        # fh = RotatingFileHandler(config.LOG_FILE, maxBytes=config.LOG_FILE_MAX_BYTES,
        #                          backupCount=config.LOG_FILE_BACKUP_COUNT)
        # fh.setLevel(level)
        # fh.setFormatter(formatter)
        # logger.addHandler(fh)

    return logger