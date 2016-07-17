from test import TestBase
from recommender.core import Recommender
from test.mock.providers import DatabaseUserDataProvider, DatabaseProjectDataProvider, DatabaseSkillDataProvider

class RecommenderTest(TestBase):

    def test_recommend(self):
        userDataProvider = DatabaseUserDataProvider()
        projectDataProvider = DatabaseProjectDataProvider()
        databaseSkillDataProvider = DatabaseSkillDataProvider()
        recommender = Recommender(userDataProvider, projectDataProvider, databaseSkillDataProvider)
        results = recommender.recommend(1) #position number 1 has skills 1 and 2 according to the mock provider

        self.assertTrue(len(results) == 10)

        lastScore = None
        for result in recommender.recommend(1):
            if not lastScore: lastScore = result[1]
            skills = result[0].getSkills()
            self.assertTrue(1 in skills or 2 in skills)
            self.assertTrue(result[1] <= lastScore)
            #print('%s : %s' % (result[1], result[0]))
            lastScore = result[1]


    def test_recommend_5(self):
        userDataProvider = DatabaseUserDataProvider()
        projectDataProvider = DatabaseProjectDataProvider()
        databaseSkillDataProvider = DatabaseSkillDataProvider()
        recommender = Recommender(userDataProvider, projectDataProvider, databaseSkillDataProvider)
        results = recommender.recommend(1, 5)  # position number 1 has skills 1 and 2 according to the mock provider

        self.assertTrue(len(results) == 5)

        lastScore = None
        for result in recommender.recommend(1):
            if not lastScore: lastScore = result[1]
            skills = result[0].getSkills()
            self.assertTrue(1 in skills or 2 in skills)
            self.assertTrue(result[1] <= lastScore)
            # print('%s : %s' % (result[1], result[0]))
            lastScore = result[1]


    def test_recommend_20(self):
        userDataProvider = DatabaseUserDataProvider()
        projectDataProvider = DatabaseProjectDataProvider()
        databaseSkillDataProvider = DatabaseSkillDataProvider()
        recommender = Recommender(userDataProvider, projectDataProvider, databaseSkillDataProvider)
        results = recommender.recommend(1, 20)  # position number 1 has skills 1 and 2 according to the mock provider

        self.assertTrue(len(results) == 20)

        lastScore = None
        for result in recommender.recommend(1):
            if not lastScore: lastScore = result[1]
            skills = result[0].getSkills()
            self.assertTrue(1 in skills or 2 in skills)
            self.assertTrue(result[1] <= lastScore)
            # print('%s : %s' % (result[1], result[0]))
            lastScore = result[1]