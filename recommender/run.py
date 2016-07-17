from recommender.web import RecommenderWebApp

if __name__ == '__main__':
    app = RecommenderWebApp(__name__)
    app.run(port=5000, host="0.0.0.0")