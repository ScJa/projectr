import  unittest, os, logging
from recommender.database import Database

class TestBase(unittest.TestCase):
    __db__ = Database.getInstance()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def getSession(self):
        return TestBase.__db__.getSession()

if __name__ == '__main__':
    logger = logging.getLogger("main")
    path = os.path.abspath("tests/..")
    logger.error(path)
    all_tests = unittest.defaultTestLoader.discover(path, pattern='*.py')
    unittest.TextTestRunner().run(all_tests)

