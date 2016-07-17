from flask import Blueprint, json
from recommender.core import Recommender
from recommender.database.providers import DatabaseUserDataProvider, DatabaseProjectDataProvider, DatabaseSkillDataProvider
from recommender.util import log

index = Blueprint("index", __name__)
logger = log.getLogger("routes")

def recommend(positionIds, projectId, n=10):
    recommendations = dict()
    try:
        userDataProvider = DatabaseUserDataProvider()
        projectDataProvider = DatabaseProjectDataProvider()
        skillDataProvider = DatabaseSkillDataProvider()
        recommender = Recommender(userDataProvider, projectDataProvider, skillDataProvider)
        recommender.prepare(projectId)

        for positionId in positionIds:
            data = dict()
            count = 0
            for user, score in recommender.recommend(positionId, n=n):
                data[count] = {'id': user.user.id, 'email': user.user.email, 'firstName':user.user.firstName,
                               'lastName':user.user.lastName, 'score': score}
                count += 1
            recommendations[positionId] = data

    except Exception as e:
        logger.exception(e)

    return recommendations

@index.route("/recommend/position/<int:positionId>")
def recommendPosition(positionId):
    """
    Endpoint for getting recommendations for a single position.
    :param positionId: The database ID of the position.
    :return: JSON list
    """
    logger.info("Got request for position %s" % positionId)
    projectId = DatabaseProjectDataProvider().getProjectForPositionId(positionId).id
    data = recommend([positionId], projectId)[positionId]
    logger.info("Returning: %s" % data)
    return json.dumps(data)

@index.route("/recommend/position/<int:positionId>/<int:n>")
def recommendPositionN(positionId, n):
    """
    Endpoint for getting N recommendations for a single position.
    :param positionId: The database ID of the position.
    :param n: The number of recommendations to return.
    :return: JSON list
    """
    logger.info("Got request for position %s" % positionId)
    projectId = DatabaseProjectDataProvider().getProjectForPositionId(positionId).id
    data = recommend([positionId], projectId, n=n)[positionId]
    logger.info("Returning: %s" % data)
    return json.dumps(data)


@index.route("/recommend/project/<int:projectId>")
def recommendAll(projectId):
    """
    for getting recommendations for all positions of a project.
    :param projectId: The database ID of the project.
    :return: JSON list
    """
    logger.info("Got request for project %s" % projectId)
    positionIds = [position.id for position in DatabaseProjectDataProvider().getOpenProjectPositions(projectId)]
    data = recommend(positionIds, projectId)
    logger.info("Returning: %s" % data)
    return json.dumps(data)


@index.route("/")
def hello():
    return """<html><body><table style="width: 100%; border: solid 1px;">
        <h2 style="color: #00897b;">Projectr Recommender</h2>
        <tr>
            <td>Recommendations for a single position:</td>
            <td>/recommend/position/int:positionId</td>
        </tr>
        <tr>
            <td>N recommendations for a single position:</td>
            <td>/recommend/position/int:positionId/int:n</td>
        </tr>
        <tr>
            <td>Recommendations for all project positions:</td>
            <td>/recommend/project/int:projectId</td>
        </tr>
        </table></body></html>"""