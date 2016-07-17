from test import TestBase
from recommender.core import Recommender
from recommender.database.providers import DatabaseUserDataProvider, DatabaseProjectDataProvider, DatabaseSkillDataProvider

class RecommenderTest(TestBase):

    def test_recommend(self):
        userDataProvider = DatabaseUserDataProvider()
        projectDataProvider = DatabaseProjectDataProvider()
        databaseSkillDataProvider = DatabaseSkillDataProvider()
        recommender = Recommender(userDataProvider, projectDataProvider, databaseSkillDataProvider)
        results = recommender.recommend(42)
        self.assertTrue(len(results) == 10)
        for result in recommender.recommend(42):
            print('%s : %s' % (result[1], result[0]))


    def test_recommend_with_limit(self):
        userDataProvider = DatabaseUserDataProvider()
        projectDataProvider = DatabaseProjectDataProvider()
        databaseSkillDataProvider = DatabaseSkillDataProvider()
        recommender = Recommender(userDataProvider, projectDataProvider, databaseSkillDataProvider)
        results = recommender.recommend(42, 5)
        self.assertTrue(len(results) == 5)

