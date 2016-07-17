from recommender.database.daos import PositionDao, RatingDao


class UserWithSkills(object):

    def __init__(self, user):
        self.user = user
        self.skills = None

    def getSkills(self):
        if self.skills is None:
            raise Exception("You need to call loadSkills or loadExtendedSkills first!")
        return self.skills

    def setSkills(self, skills):
        self.skills = skills

    def getID(self):
        return self.user.id

    def __str__(self):
        return 'UserWithSkills: %s %s, %s' % (self.user.firstName, self.user.lastName, str(self.skills))


    def getUserDataForClassifier(self, session, match, fallbackAvgRating):
        """
        Gathers user data from the DB for better machine learning results.
        :param session:
        :param fallbackAvgRating:
        :param match:
        :return:
        """
        positionDao = PositionDao(session)
        ratingDao = RatingDao(session)

        activeProjects = len(positionDao.getPositionsOfUser(self.user.id))

        userRatings = [rating.rating for rating in ratingDao.getRatingsForUser(self.user.id)]
        if len(userRatings) > 0:
            avgRating = sum(userRatings) / len(userRatings)
        else:
            avgRating = fallbackAvgRating

        #TODO hours already occupied in other projects
        return [match, activeProjects, avgRating]