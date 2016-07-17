from recommender.database import transactional
from recommender.database.daos import UserDao, ProjectDao, PositionDao, PositionSkillDao, SkillDao, UserSkillsDao
from recommender.core.user import UserWithSkills
from recommender.core.distance import MatchDistance
from recommender.core.vectorizer import FeatureVectorizer
from recommender.util import log, Timer

MATCH_STR = '%s %s has a match of %.2f %% (distance: %s)'

class DatabaseUserDataProvider(object):

    def __init__(self, ):
        self.logger = log.getLogger(DatabaseUserDataProvider)
        self.skillDataProvider = DatabaseSkillDataProvider()

    @transactional
    def getUserById(self, userId, session=None):
        return UserDao(session).getById(userId)

    @transactional
    def getMatchingUsers(self, position, n, session=None):
        """
        Generates a list of best matching users for a position based on their skills.
        """
        positionSkills = PositionSkillDao(session).getForPosition(position.id)
        positionSkillsIds = [skill.skillId for skill in positionSkills]
        self.logger.info("Got position skills: %s" % positionSkillsIds)

        allSkills = self.skillDataProvider.getSkillsAndParents()

        userVectorizer = FeatureVectorizer(targetFeatures=positionSkillsIds)
        for user in self.getUsersWithSkills(position.type, positionSkillsIds, allSkills):
            userVectorizer.set(user, user.getSkills())
            #self.logger.info("User skills: %s" % user.getSkills())

        closestUsers = list()
        if len(userVectorizer.getItems()) == 0: return closestUsers

        for user, euclideanDistance, match in MatchDistance(userVectorizer).getClosest(n=n):
            #self.logger.info(MATCH_STR % ("User", user.user.email, match * 100, euclideanDistance))
            closestUsers.append((user, match))
        return closestUsers


    @transactional
    def getUsersWithSkills(self, positionType, positionSkillIds, allSkills=None, session=None):
        usersWithSkills = list()
        for user in UserDao(session).getAllWithSkills(positionType, positionSkillIds):
            #self.logger.info(user)
            user = UserWithSkills(user)
            user.setSkills(self.getUserSkills(user.user, allSkills))
            usersWithSkills.append(user)
        return usersWithSkills

    @transactional
    def getUserSkills(self, user, allSkills=None, session=None):
        skills = dict()
        for userSkill in UserSkillsDao(session).getSkills(user.id):
            skills[userSkill.skillId] = userSkill.weight
        return self.skillDataProvider.getExtendedSkills(skills, allSkills=allSkills)



class DatabaseProjectDataProvider(object):

    def __init__(self):
        self.logger = log.getLogger(DatabaseProjectDataProvider)
        self.skillDataProvider = DatabaseSkillDataProvider()

    @transactional
    def getPositionById(self, positionId, session=None):
        return PositionDao(session).getById(positionId)

    @transactional
    def getProjectById(self, projectId, session=None):
        return ProjectDao(session).getById(projectId)

    @transactional
    def getSimilarAndNonSimilarProjects(self, project, n, session=None):
        """
        Finds similar projects in the database.
        :param project:
        :param session:
        :return:
        """
        timer = Timer(self.logger)
        knownSkills = self.skillDataProvider.getSkillsAndParents()

        timer.start("a")
        skills = self.getProjectSkills(project, knownSkills)
        timer.stop("a")

        projectVectorizer = FeatureVectorizer(targetFeatures=list(skills.keys()))

        timer.start("b")
        for otherProject in ProjectDao(session).getAllWithSkills(skills.keys()):
            if otherProject.id == project.id: continue
            otherProjectSkills = self.getProjectSkills(otherProject, knownSkills)
            projectVectorizer.set(otherProject, otherProjectSkills)
        timer.stop("b")

        timer.start("c")
        similarProjects = list()
        for project, euclideanDistance, match in MatchDistance(projectVectorizer).getClosest(n=n):
            similarProjects.append((project, match))
        timer.stop("c")

        timer.start("d")
        nonSimilarProjects = list()
        for project, euclideanDistance, match in MatchDistance(projectVectorizer).getFarthest(n=n):
            nonSimilarProjects.append((project, match))
        timer.stop("d")

        return similarProjects, nonSimilarProjects


    @transactional
    def getProjectSkills(self, project, allSkills=None, session=None):
        skills = dict()
        for skillId in ProjectDao(session).getSkillsForProject(project.id):
            skills[skillId] = 1
        return self.skillDataProvider.getExtendedSkills(skills, allSkills=allSkills)

    @transactional
    def getOpenProjectPositions(self, projectId, session=None):
        return PositionDao(session).getOpenPositionsForProject(projectId)

    @transactional
    def getProjectForPositionId(self, positionId, session=None):
        position = PositionDao(session).getById(positionId)
        return ProjectDao(session).getById(position.projectId)

    @transactional
    def setPositionMatch(self, positionId, matchScore, session=None):
        PositionDao(session).setMatchScore(positionId, matchScore)

    @transactional
    def getAssignedPositionsForProject(self, projectId, session=None):
        return PositionDao(session).getAssignedPositionsForProject(projectId)


class DatabaseSkillDataProvider(object):

    @transactional
    def getSkillsAndParents(self, session=None):
        return SkillDao(session).getSkillsAndParents()

    def getExtendedSkills(self, skills, allSkills=None):
        if allSkills is None: allSkills = self.getSkillsAndParents()
        parents = set(skills.keys())

        while len(parents) > 0:
            newParents = set()
            for skillId in parents:
                if not skillId in allSkills: raise Exception("Skill with id %s is unknown!" % skillId)
                parentId = allSkills[skillId]
                if not parentId is None:
                    newParents.add(parentId)
                    skills[parentId] = 0.5

            parents = newParents

        return skills