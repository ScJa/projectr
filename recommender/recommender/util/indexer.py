

class Indexer(object):

    def __init__(self, startIndex=1):
        self.features = dict()
        self.indices = dict()
        self.index = startIndex
        self.startIndex = startIndex

    def clear(self):
        self.features.clear()
        self.indices.clear()
        self.index = self.startIndex

    def getIndex(self, element):
        if not element in self.features:
            self.features[element] = self.index
            self.indices[self.index] = element
            self.index += 1
        return self.features[element]

    def getElement(self, index):
        return self.indices[index]

    def getIndexVector(self, elements):
        indices = list()
        for element in elements:
            indices.append(self.getIndex(element))
        return indices