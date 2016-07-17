from recommender.database.models import User, UserSkill, Project, Rating, Position, PositionSkill, Skill

class DaoBase(object):

    def __init__(self, cls, session):
        self.cls = cls
        self.session = session

    def getAll(self):
        raise NotImplementedError

    def getById(self, objId):
        raise NotImplementedError

    def getQuery(self, *args):
        raise NotImplementedError

class UserDao(DaoBase):
    def __init__(self, session):
        super().__init__(User, session)

    def getAllWithSkills(self, positionType, skillIds):
        all = list()
        for objId in range(0, 100):
            all.append(Mock({"id": objId, "firstName": "f_%s" % objId, "lastName": "l_%s" % objId, "email": "%s@email.com" % objId,
                "owner": True, "designer": True, "developer": True}))
        return all

    def getById(self, objId):
        return Mock({"id": objId, "firstName": "f_%s" % objId, "lastName": "l_%s" % objId, "email": "%s@email.com" % objId,
                "owner": True, "designer": True, "developer": True})

class UserSkillsDao(DaoBase):
    def __init__(self, session):
        super().__init__(UserSkill, session)

    def getSkills(self, userId):
        return [Mock({"skillId": userId % 10, "weight":float("0.%s" % userId)})]

class ProjectDao(DaoBase):
    def __init__(self, session):
        super().__init__(Project, session)

    def getProjectsForUser(self, userId):
        raise NotImplementedError

    def getActiveProjectsForUser(self, userId):
        raise NotImplementedError

    def getAllWithSkills(self, skillIds):
        raise NotImplementedError

    def getSkillsForProject(self, projectId):
        raise NotImplementedError


class RatingDao(DaoBase):
    def __init__(self, session):
        super().__init__(Rating, session)

    def getRatingsForUser(self, userId):
        raise NotImplementedError

class PositionDao(DaoBase):
    def __init__(self, session):
        super().__init__(Position, session)

    def getPositionsForProject(self, projectId):
        raise NotImplementedError

    def getAssignedPositionsForProject(self, projectId):
        raise NotImplementedError

    def getOpenPositionsForProject(self, projectId):
        raise NotImplementedError

    def getPositionsOfUser(self, userId):
        raise NotImplementedError

    def getAllWithSkills(self, skillIds):
        raise NotImplementedError

    def setMatchScore(self, positionId, matchScore):
        raise NotImplementedError

    def getById(self, objId):
        return Mock({"id": objId, "status": "open", "type":"Developer"})

class PositionSkillDao(DaoBase):
    def __init__(self, session):
        super().__init__(PositionSkill, session)

    def getForPosition(self, positionId):
        return [Mock({"id":1, "skillId":1}), Mock({"id":2, "skillId":2})]

class SkillDao(DaoBase):
    def __init__(self, session):
        super().__init__(Skill, session)

    def getParent(self, id):
        raise NotImplementedError

    def getSkillsAndParents(self):
        skills = dict()
        for i in range(0, 100):
            if i % 10 == 0 and i != 0:
                skills[i] = i-1
            else:
                skills[i] = None
        return skills


class Mock:
    def __init__(self, data):
        for key in data.keys():
            setattr(self, key, data[key])