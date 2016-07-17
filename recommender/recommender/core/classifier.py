from sklearn import svm
from sklearn.externals import joblib
import logging

class Classifier(object):

    def __init__(self, classifier=svm.SVC):
        self.classifier = classifier()
        self.logger = logging.getLogger(Classifier.__name__)

    def train(self, trainingInstances, instanceClasses, sampleWeight=None):
        """
            Trains the classifier with the training instances and the corresponding classes of the instances.
        """
        self.logger.info("Fitting classifier with %s training instances." % len(trainingInstances))
        self.classifier.fit(trainingInstances, instanceClasses, sample_weight=sampleWeight)

    def predict(self, samples):
        """
            Perform classification on sample instances. Returns predicted classes.
        """
        self.logger.info("Classifying %s" % str(samples))
        return self.classifier.predict(samples)

    def dump(self, filePath):
        return joblib.dump(self.classifier, filePath)

    def load(self, filePath):
        self.classifier = joblib.load(filePath)
