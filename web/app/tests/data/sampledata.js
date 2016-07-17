module.exports = [
    {
        "model": "User",
        "data": {
            "id": 2,
            "first_name": "first_name",
            "last_name": "last_name",
            "passwordhash": "paswordhash",
            "passwordsalt": "passwordsalt",
            "avatar": "path",
            "email": "email@server.com",
            "developer": true,
            "owner": false,
            "designer": false,
            "free_hours": 10,
            "avg_rating_owner": 0.4,
            "avg_rating_developer": 0.4,
            "avg_rating_designer": 0.4
        }
    },

    {
        "model": "Notification",
        "data": {
            "id": 1,
            "parent_User_id": "2",
            "content": "This is a sample notification.",
            "datetime": "2016-05-01 04:05:06",
            "read": false
        }
    },


    {
        "model": "LinkedServices",
        "data": {
            "id": 2,
            "UserId": 2,
            "token": "token1",
            "service_id": "GitHub"
        }
    },


    {
        "model": "Project",
        "data": {
            "id": 1,
            "UserId": 2,
            "name": "project1",
            "short_description": "project1",
            "private_description": "project1",
            "public_description": "project1",
            "budget": 10000,
            "status": "running"
        }
    },



    {
        "model": "Position",
        "data": {
            "id": 1,
            "hours": 2,
            "budget": 1000,
            "name": "position1",
            "type": "Developer",
            "ProjectId": 1,
            "status": "accepted"
        }
    },
    {
        "model": "Position",
        "data": {
            "id": 2,
            "hours": 2,
            "budget": 1000,
            "name": "position2",
            "type": "Designer",
            "UserId": 2,
            "ProjectId": 1,
            "status": "rejected",
        }
    },

    {
        "model": "Rating",
        "data": {
            "id": 1,
            "rating": 0.5,
            "feedback": "1000",
            "UserId": 2,
            "PositionId": 2
        }
    },

    {
        "model": "Skill",
        "data": {
            "id": 1,
            "name": "JAVA"
        }
    },



    {
        "model": "Skill",
        "data": {
            "id": 2,
            "name": "JPA",
            "parent_Skill_id": 1
        }
    },
    {
        "model": "User_Skill",
        "data": {
            "id": 1,
            "weight": 0.4,
            "SkillId": 1,
            "UserId": 2
        }
    },




    {
        "model": "Position_Skill",
        "data": {
            "id": 1,
            "weight": 0.4,
            "PositionId": 1,
            "SkillId": 1
        }
    }
];