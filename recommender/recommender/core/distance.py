from scipy.spatial import distance

from recommender.core.vectorizer import FeatureVectorizer


class MatchDistance(object):

    def __init__(self, vectorizer: FeatureVectorizer, ignoreZeroVectors=False):
        self.vectorizer = vectorizer
        self.ignoreZeroVectors = ignoreZeroVectors

    def getMaxDistance(self):
        if len(self.vectorizer.getFeatureVector()) == 0:
            return 0
        return distance.euclidean(self.vectorizer.getFeatureVector(), self.vectorizer.getInverseFeatureVector())

    def getAll(self):
        maxDist = self.getMaxDistance()
        featureVector = self.vectorizer.getFeatureVector()

        vectors = list()
        for key, vector in self.vectorizer.getItems():
            if self.ignoreZeroVectors and sum(vector) == 0: continue
            dist = distance.euclidean(featureVector, vector)
            match = (1 - (dist / maxDist))
            vectors.append((key, dist, match))

        return vectors

    def getSingle(self, key):
        maxDist = self.getMaxDistance()
        featureVector = self.vectorizer.getFeatureVector()
        vector = self.vectorizer.getVector(key)
        dist = distance.euclidean(featureVector, vector)
        match = (1 - (dist / maxDist))
        return key, dist, match

    def getClosest(self, n=-1):
        vectors = self.getAll()
        vectors.sort(key=lambda x: x[1])
        if n > -1: vectors = vectors[0:n]
        return vectors

    def getFarthest(self, n=-1):
        vectors = self.getAll()
        vectors.sort(key=lambda x: x[1], reverse=True)
        if n > -1: vectors = vectors[0:n]
        return vectors