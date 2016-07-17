from test import TestBase
from recommender.core.vectorizer import FeatureVectorizer
from recommender.core.distance import MatchDistance

class UserDataTest(TestBase):

    def test_vectorizer(self):
        targets = ["a", "b", "c"]
        fv = FeatureVectorizer(targetFeatures=targets)
        fv.set("user1", {"a":0.1, "b":0.2, "d":0.5, "e":0.2})
        fv.set("user2", {"a": 0.8})
        fv.set("user3", {"a": 1, "b":1, "c":1})

        md = MatchDistance(vectorizer=fv)
        results = md.getClosest(3)

        self.assertTrue(results[0][0] == 'user3')
        self.assertTrue(results[0][2] == 1)

        self.assertTrue(results[1][0] == 'user2')
        self.assertTrue(results[1][2] > 0.17)

        self.assertTrue(results[2][0] == 'user1')
        self.assertTrue(results[2][2] > 0.09)


    def test_feature_vector(self):
        fv = FeatureVectorizer(targetFeatures=["a", "b", "c"])
        self.assertTrue(len(fv.getFeatureVector()) == 3)
        self.assertTrue(fv.getFeatureVector()[0] == 1)
        self.assertTrue(fv.getFeatureVector()[0] == 1)
        self.assertTrue(fv.getFeatureVector()[0] == 1)


    def test_inverse_feature_vector(self):
        fv = FeatureVectorizer(targetFeatures=["a", "b", "c"])
        self.assertTrue(len(fv.getInverseFeatureVector()) == 3)
        self.assertTrue(fv.getInverseFeatureVector()[0] == 0)
        self.assertTrue(fv.getInverseFeatureVector()[0] == 0)
        self.assertTrue(fv.getInverseFeatureVector()[0] == 0)

    def test_keys(self):
        fv = FeatureVectorizer(targetFeatures=["a", "b", "c"])
        fv.set("user1", {"a": 0.1, "b": 0.2, "d": 0.5, "e": 0.2})
        fv.set("user2", {"a": 0.8})
        fv.set("user3", {"a": 1, "b": 1, "c": 1})
        self.assertTrue(len(fv.getKeys()) == 3)
        self.assertTrue("user1" in fv.getKeys())
        self.assertTrue("user2" in fv.getKeys())
        self.assertTrue("user3" in fv.getKeys())

    def test_vectors(self):
        fv = FeatureVectorizer(targetFeatures=["a", "b", "c"])
        fv.set("user1", {"a": 0.1, "b": 0.2, "d": 0.5, "e": 0.2})
        fv.set("user2", {"a": 0.8})
        fv.set("user3", {"a": 1, "b": 1, "c": 1})
        self.assertTrue(len(fv.getVectors()) == 3)