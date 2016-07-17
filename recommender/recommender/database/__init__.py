from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from recommender.config import TYPE, USER, PASSWORD, HOST, PORT, DB

class Database(object):
    __database__ = None
    @staticmethod
    def getInstance():
        if Database.__database__ is None:
            Database.__database__ = Database()
        return Database.__database__

    def __init__(self):
        connect = '%s://%s:%s@%s:%s/%s' % (TYPE, USER, PASSWORD, HOST, PORT, DB)
        self.engine = create_engine(connect, echo=False)
        self.Session = sessionmaker(bind=self.engine)

    def getSession(self):
        return self.Session()


def transactional(f, readOnly=True, autoClose=True, rollbackFor=Exception):
    def deco(self, *args, **kwargs):
        session = Database.getInstance().getSession()
        kwargs['session'] = session
        try:
            result = f(self, *args, **kwargs)
            if not readOnly: session.commit()
            return result
        except Exception as ex:
            if isinstance(ex, rollbackFor): session.rollback()
            raise ex
        finally:
            if autoClose: session.close()
    return deco
