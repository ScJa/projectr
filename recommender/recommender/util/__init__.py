import time
from recommender.util.log import getLogger

class Timer(object):

    def __init__(self, logger=None):
        self.logger = logger
        if self.logger is None: self.logger = getLogger(self)
        self.measurements = dict()

    def start(self, name=None):
        self.measurements[name] = time.time()

    def stop(self, name=None, printToLog=True):
        start = self.measurements.pop(name, None)
        if start is None:
            if printToLog: self.logger.warn("Start not called for %s!" % name)
            return  None
        else:
            diff = time.time() - start
            if printToLog: self.logger.info("%s took %.4f seconds." % (name, diff))
            return diff

def measure(f, logger=None):
    def deco(self, *args, **kwargs):
        timer = Timer(logger=logger)
        timer.start(f.__name__)
        result = f(self, *args, **kwargs)
        timer.stop(f.__name__)
        return result
    return deco