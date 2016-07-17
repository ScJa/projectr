from test import TestBase
from recommender.core.vectorizer import FeatureVectorizer

class UserDataTest(TestBase):

    def test_vectorizer(self):
        targets = ["a", "b", "c"]
        fv = FeatureVectorizer(targetFeatures=targets)
        fv.set("user1", {"a":0.1, "b":0.2, "d":0.5, "e":0.2})
        fv.set("user2", {"a": 0.1, "b": 0.2})
        self.assertTrue(sum(fv.getFeatureVector()) == 3)
        self.assertTrue(sum(fv.getInverseFeatureVector()) == 0)
        self.assertTrue(len(fv.getKeys()) == 2)
