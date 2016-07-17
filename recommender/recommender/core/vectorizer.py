
class FeatureVectorizer(object):

    def __init__(self, targetFeatures=list()):
        self.targetFeatures = targetFeatures
        self.useTargetFeatures = (not targetFeatures is None) and len(targetFeatures) > 0
        self.elementFeatures = dict()

    def set(self, key, features):
        """
        :param key:
        :param features: a map of feature:weight
        :return:
        """
        features = dict([(elem, features[elem]) for elem in features.keys()])
        if not self.useTargetFeatures:
            for feature in features:
                if not feature in self.targetFeatures:
                    self.targetFeatures.append(feature)
        self.elementFeatures[key] = features

    def setMap(self, aMap):
        for key, values in aMap.items():
            self.set(key, values)

    def getFeatureVector(self):
        return [1] * len(self.targetFeatures)

    def getInverseFeatureVector(self):
        return [0] * len(self.targetFeatures)

    def getVectors(self):
        vectors = dict()
        for key in self.elementFeatures.keys():
            vectors[key] = self.getVector(key)
        return vectors

    def getVector(self, key):
        vector = list()

        for feature in self.targetFeatures:
            if feature in self.elementFeatures[key]:
                vector.append(1*self.elementFeatures[key][feature])
            else:
                vector.append(0)
        return vector

    def getKeys(self):
        return self.elementFeatures.keys()

    def getItems(self):
        return [(key, self.getVector(key)) for key in self.getKeys()]

    def clear(self):
        self.elementFeatures = dict()