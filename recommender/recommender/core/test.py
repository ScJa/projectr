import json
import os

from recommender.core.classifier import Classifier
from recommender.core.distance import MatchDistance

from recommender.core.vectorizer import FeatureVectorizer


def loadUsers():
    f = open(os.path.abspath('../../../test/resources/randomUserDataWithWeight.json'), 'r')
    userdata = json.load(f)
    f.close()
    return userdata

def loadProjects():
    f = open(os.path.abspath('../../../test/resources/projectdata.json'), 'r')
    projectdata = json.load(f)
    f.close()
    return projectdata




if __name__ == '__main__':
    targetProject = "puppet"
    userdata = loadUsers()
    projectdata = loadProjects()

    userVectorizer = FeatureVectorizer(targetFeatures=projectdata[targetProject])

    #1. find best matching users
    for user in userdata.keys():
        userVectorizer.set(user, userdata[user]['skills'])

    closestUsers = dict()
    for user, distance, match in MatchDistance(userVectorizer).getClosest(n=50):
        print('User %s has a match of %.2f %% (distance: %s)' % (user, match*100, distance))
        print(userdata[user])
        closestUsers[user] = (userdata[user], match)

    #2.find closest projects
    projectVectorizer = FeatureVectorizer(targetFeatures=projectdata[targetProject])
    for project in projectdata.keys():
        if project == targetProject: continue
        projectVectorizer.set(project, dict([(k, 1) for k in projectdata[project]]) )

    closestProjects = dict()
    for project, distance, match in MatchDistance(projectVectorizer).getClosest(n=5):
        closestProjects[project] = projectdata[project]
        print('project %s has a match of %.2f %% (distance: %s)' % (project, match*100, distance))

    trainingSet = list() # match, userRating, activeProjects
    trainingClasses = list() # 0=no, 1=maybe, 2=yes

    # 3. get the users of successful projects as training set
    # we dont have that at the moment so I just take random users
    for project in closestProjects.keys():
        closeProjectVectorizer = FeatureVectorizer(targetFeatures=projectdata[project])
        for user in userdata.keys():
            closeProjectVectorizer.set(user, userdata[user]['skills'])

        avgMatch = list()
        usersByRating = list()
        for user, distance, match in MatchDistance(closeProjectVectorizer).getClosest(n=100):
            usersByRating.append((userdata[user]['avgRating'], match, user))
            avgMatch.append(match)

        avgMatch = (sum(avgMatch) / len(avgMatch)) * 0.9

        for rating, match, user in usersByRating:
            activeProjects = userdata[user]['activeProjects']
            avgRating = userdata[user]['avgRating']
            data = [match, avgRating, activeProjects]
            trainingSet.append(data)
            if match >= avgMatch and avgRating > 2 and activeProjects <= 4:
                trainingClasses.append(2)
            elif match >= avgMatch and avgRating > 2 and activeProjects > 4:
                trainingClasses.append(1)
            else:
                trainingClasses.append(0)

    for row in trainingSet:
        print(row)

    print(trainingClasses)


    # 3. classify
    classifier = Classifier()
    classifier.train(trainingSet, trainingClasses)
    for user in closestUsers.keys():
        userStats, match = closestUsers[user]
        activeProjects = userStats['activeProjects']
        avgRating = userStats['avgRating']
        data = [match, avgRating, activeProjects]
        print('Project: %s' % projectdata[targetProject])
        print(data)
        print('User: %s' % userdata[user])
        print('%s: %s' % (user, classifier.predict([data])))


    # get the average rating for each user

    # User-Item Collaborative Filtering: “Customers who are similar to you also liked …
    # -> find similar projects





    # trainingSet = []
    # trainingClasses = []
    # for user, distance, match in matchDistance.getClosest():
    #     trainingSet.append(vectorizer.getVector(user))
    #     if match > 0.7:
    #         trainingClasses.append(1)
    #     else:
    #         trainingClasses.append(0)

    #print(trainingSet)
    #print(trainingClasses)
