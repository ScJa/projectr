from sqlalchemy import or_
from recommender.database.models import User, UserSkill, Project, Rating, Position, PositionSkill, Skill

class DaoBase(object):

    def __init__(self, cls, session):
        self.cls = cls
        self.session = session

    def getAll(self):
        return self.session.query(self.cls).all()

    def getById(self, objId):
        return self.session.query(self.cls).filter(self.cls.id == objId).one()

    def getQuery(self, *args):
        if not args or len(args) == 0: args = [self.cls]
        return self.session.query(*args)

class UserDao(DaoBase):
    def __init__(self, session):
        super().__init__(User, session)

    def getAllWithSkills(self, positionType, skillIds):
        if len(skillIds) == 0: return []
        query = self.session.query(self.cls).\
            filter(UserSkill.userId == self.cls.id).\
            filter(UserSkill.skillId.in_(skillIds)).\
            filter(self.cls.deletedAt.is_(None))
        
        if positionType == "Designer":
            query = query.filter(User.designer == True)
        elif positionType == "Developer" :
            query = query.filter(User.developer == True)

        return query.distinct().all()

class UserSkillsDao(DaoBase):
    def __init__(self, session):
        super().__init__(UserSkill, session)

    def getSkills(self, userId):
        return self.getQuery().filter(self.cls.userId == userId).distinct().all()

class ProjectDao(DaoBase):
    def __init__(self, session):
        super().__init__(Project, session)

    def getProjectsForUser(self, userId):
        return self.getQuery().filter(self.cls.id == Position.projectId).filter(Position.userId == userId).distinct().all()

    def getActiveProjectsForUser(self, userId):
        return self.getQuery().filter(self.cls.id == Position.projectId).filter(Position.userId == userId).filter(self.cls == 'running').distinct().all()

    def getAllWithSkills(self, skillIds):
        if len(skillIds) == 0: return []
        return self.session.query(Project). \
            filter(Project.id == Position.projectId). \
            filter(Position.status == 'accepted').\
            filter(PositionSkill.positionId == Position.id). \
            filter(PositionSkill.skillId.in_(skillIds)).distinct().all()

    def getSkillsForProject(self, projectId):
        q = self.getQuery(PositionSkill.skillId).\
            filter(projectId == Position.projectId). \
            filter(Position.id == PositionSkill.positionId). \
            distinct()
        return [e[0] for e in q.all()]

class RatingDao(DaoBase):
    def __init__(self, session):
        super().__init__(Rating, session)

    def getRatingsForUser(self, userId):
        return self.getQuery().filter(self.cls.userId == userId).distinct().all()

class PositionDao(DaoBase):
    def __init__(self, session):
        super().__init__(Position, session)

    def getPositionsForProject(self, projectId):
        return self.getQuery().filter(self.cls.projectId == projectId).distinct().all()

    def getAssignedPositionsForProject(self, projectId):
        return self.getQuery().filter(self.cls.projectId == projectId).filter(
            self.cls.status == 'accepted').distinct().all()

    def getOpenPositionsForProject(self, projectId):
        return self.getQuery().filter(self.cls.projectId == projectId).filter(
            or_(self.cls.status == 'open', self.cls.status == 'rejected')).distinct().all()

    def getPositionsOfUser(self, userId):
        return self.getQuery().filter(self.cls.userId == userId).distinct().all()

    def getAllWithSkills(self, skillIds):
        if len(skillIds) == 0: return []
        return self.session.query(Position). \
            filter(PositionSkill.positionId == Position.id). \
            filter(PositionSkill.skillId.in_(skillIds)).distinct().all()

    def setMatchScore(self, positionId, matchScore):
        position = self.getById(positionId)
        position.matchScore = matchScore
        self.session.commit()

class PositionSkillDao(DaoBase):
    def __init__(self, session):
        super().__init__(PositionSkill, session)

    def getForPosition(self, positionId):
        return self.getQuery().filter(self.cls.positionId == positionId).distinct().all()

class SkillDao(DaoBase):
    def __init__(self, session):
        super().__init__(Skill, session)

    def getParent(self, id):
        parentId = self.getById(id).parentSkillId
        if parentId:
            return self.getById(parentId)
        else:
            return None

    def getSkillsAndParents(self):
        skills = dict()
        for skill in self.getQuery().all():
            skills[skill.id] = skill.parentSkillId
        return skills
