from flask import Flask
import logging
from recommender.web.routes import index
from recommender.util import log

class RecommenderWebApp(Flask):

    def __init__(self, import_name):
        super().__init__(import_name)
        log.configureLogger(logging.getLogger('werkzeug'), logging.DEBUG)
        log.configureLogger(self.logger)
        self.register_blueprint(index)

    def run(self, host=None, port=None, debug=None, **options):
        if not port: port = 5000
        if not "threaded" in options: options["threaded"] = True
        super().run(host=host, port=port, debug=debug, **options)
