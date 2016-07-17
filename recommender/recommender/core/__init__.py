from recommender.util import log
from recommender.database import transactional
from recommender.core.user import UserWithSkills
from recommender.core.distance import MatchDistance
from recommender.core.vectorizer import FeatureVectorizer
from recommender.core.classifier import Classifier
from recommender.util import Timer, measure

class Recommender(object):

    @measure
    def __init__(self, userDataProvider, projectDataProvider, skillDataProvider):
        self.logger = log.getLogger(Recommender)
        self.maxSimilarProjectsToConsider = 30
        self.maxNonSimilarProjectsToConsider = 30
        self.maxMatchingUsersToConsider = 30
        self.negativeClass = 0
        self.positiveClass = 1
        self.avgRatingForUsersWithoutRatings = 2.5
        self.userDataProvider = userDataProvider
        self.projectDataProvider = projectDataProvider
        self.skillDataProvider = skillDataProvider
        self.timer = Timer(self.logger)
        self.allSkills = skillDataProvider.getSkillsAndParents()
        #--------
        self.positionClassifier = Classifier()
        self.trained = False

    @transactional
    @measure
    def prepare(self, projectId, session=None):
        project = self.projectDataProvider.getProjectById(projectId)
        self.logger.info('Doing project: %s' % project)

        # 2. generate training set
        similarProjects, nonSimilarProjects = self.getProjectsToConsider(project)

        # 3.1 get similar projects and add their developers as class 1
        trainingInstances, trainingClasses = self._makeTrainingSet(session, similarProjects, self.positiveClass)

        # 3.2 get non-similar projects and add their developers as class 0
        instances, classes = self._makeTrainingSet(session, nonSimilarProjects, self.negativeClass)
        trainingInstances.extend(instances)
        trainingClasses.extend(classes)

        self.logger.info('Training classifier with %s instances.' % len(trainingClasses))
        if len(trainingClasses) > 0:
            self.timer.start('Training')
            self.positionClassifier.train(trainingInstances, trainingClasses)
            self.timer.stop('Training')
            self.trained = True


    @transactional
    @measure
    def recommend(self, positionId, n=10, session=None):
        """
        Generates recommendations for a given position.
        :param positionId: The database ID of the position.
        :param n: Max number of recommendations to generate.
        :param session:
        :return: A list of UserData objects ranked by best matching.
        """
        position = self.projectDataProvider.getPositionById(positionId)
        self.logger.info('Doing position: %s' % position)
        if not position.status in  ['open', 'rejected']: return list()

        # 1. find best matching users
        matchingUsersDict, matchingUsers = self.findBestMatchingUsers(position)

        if len(matchingUsers) <= 10:
            self.logger.warn('Skipped classification, because I only found %s matching users.' % len(matchingUsers))
            return matchingUsers

        # 4. classify
        if self.trained:
            results = self.classify(matchingUsers, matchingUsersDict, session, n)
            if len(results) == 0:
                self.logger.warn('No classification results.')
                return matchingUsers[0:n]
            else:
                self.logger.warn('Got %s classified results.' % len(results))
                return results

        else:
            self.logger.warn('No classification done. Could not find data to train classifier.')
            return matchingUsers[0:n]


    @measure
    def classify(self, matchingUsers, matchingUsersDict, session, n):
        results = list()
        self.timer.start('Classification')
        for user, match in matchingUsers:
            if len(results) == n: break
            userData = user.getUserDataForClassifier(session, match, self.avgRatingForUsersWithoutRatings)
            classification = self.positionClassifier.predict([userData])[0]
            #self.logger.warn('%s: %s' % (user, classification))
            if classification != self.negativeClass:
                results.append((user, matchingUsersDict[user.user.id] * classification))
        self.timer.stop('Classification')
        return results

    @measure
    def getProjectsToConsider(self, project):
        return self.projectDataProvider.getSimilarAndNonSimilarProjects(project, self.maxSimilarProjectsToConsider)


    @measure
    def findBestMatchingUsers(self, position):
        matchingUsers = self.userDataProvider.getMatchingUsers(position, self.maxMatchingUsersToConsider)
        matchingUsersDict = dict([(user.user.id, match) for user, match in matchingUsers])
        self.logger.info('Found %s matching users.' % len(matchingUsers))
        return matchingUsersDict, matchingUsers


    @measure
    def _makeTrainingSet(self, session, projects, classValue):
        """
        Generates the training set according to accepted recommendations in similar projects.
        :param session:
        :param projects:
        :param classValue:
        :return:
        """
        trainingInstances = list()
        trainingClasses = list()

        for project, _ in projects:
            skills = self.projectDataProvider.getProjectSkills(project, allSkills=self.allSkills)
            projectVectorizer = FeatureVectorizer(targetFeatures=list(skills.keys()))
            matcher = MatchDistance(projectVectorizer)

            for position in self.projectDataProvider.getAssignedPositionsForProject(project.id):
                if not position.userId: continue

                user = UserWithSkills(self.userDataProvider.getUserById(position.userId))

                if not position.matchScore is None:
                    match = position.matchScore

                else:
                    user.setSkills(self.userDataProvider.getUserSkills(user.user, allSkills=self.allSkills))
                    projectVectorizer.set(user.getID(), user.getSkills())
                    _, _, match = matcher.getSingle(user.getID())
                    self.projectDataProvider.setPositionMatch(position.id, match)

                trainingData = user.getUserDataForClassifier(session, match, self.avgRatingForUsersWithoutRatings)
                trainingInstances.append(trainingData)
                trainingClasses.append(classValue)

        return trainingInstances, trainingClasses








