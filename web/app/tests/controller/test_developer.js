var helper = require("../testinghelper");
var models = require("../../models");


describe("developerhub: when logged out", () => {

    before(helper.logout);
    
    it("/user responds with Sign In", (done) => {
        helper.get("/user/developer")
            .expect((res) => {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/login"));
            })
            .expect(302)
            .end(done)
    });

    it("/user responds with Sign In", (done) => {
        helper.get("/user/developer/accept/1")
            .expect((res) => {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/login"));
            })
            .expect(302)
            .end(done)
    });

    it("/user responds with Sign In", (done) => {
        helper.get("/user/developer/decline/1")
            .expect((res) => {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/login"));
            })
            .expect(302)
            .end(done)
    });

    it("/user responds with Sign In", (done) => {
        helper.get("/user/developer/leave/1")
            .expect((res) => {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/login"));
            })
            .expect(302)
            .end(done)
    });

});


describe("developerhub: when logged in", function () {
    this.timeout(150000);

    before(helper.login);

    it("Hub page shows with one project", function (done) {
        helper.get("/user/developer")
            .expect(function (res) {
                helper.assert.isTrue(res.text.includes("Edit Developer Profile"));
                helper.assert.isTrue(res.text.includes("Project 203 - Developer"));
                helper.assert.isTrue(res.text.includes("Budget: 0"));
                helper.assert.isTrue(res.text.includes("Hours: 13"));
                helper.assert.isTrue(res.text.includes("Project 203 is an awesome project."));
                helper.assert.isTrue(res.text.includes("Leave Project"));
            })
            .expect(200)
            .end(done)
    });

    it("Leave and join project", function (done) {
        helper.get("/user/developer/leave/987")
            .expect(function (res) {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/developer"));
            })
            .expect(302)
            .end(function () {
                helper.get("/user/developer")
                    .expect(function (res) {
                        helper.assert.isTrue(res.text.includes("Edit Developer Profile"));
                        helper.assert.isTrue(res.text.includes("Project 203 - Developer"));
                        helper.assert.isTrue(res.text.includes("Budget: 0"));
                        helper.assert.isTrue(res.text.includes("Hours: 13"));
                        helper.assert.isTrue(res.text.includes("Project 203 is an awesome project."));
                        helper.assert.isTrue(res.text.includes("Accept"));
                    })
                    .expect(200)
                    .end(function () {
                        helper.get("/user/developer/accept/987")
                            .expect(function (res) {
                                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/developer"));
                            })
                            .expect(302)
                            .end(done)
                    });

            });

    });

    it("Leave and reject project", function (done) {
        helper.get("/user/developer/leave/987")
            .expect(function (res) {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/developer"));
            })
            .expect(302)
            .end(function () {
                helper.get("/user/developer/decline/987")
                    .expect(function (res) {
                        helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/developer"));
                    })
                    .expect(302)
                    .end(function () {
                        helper.get("/user/developer")
                            .expect(function (res) {
                                helper.assert.isTrue(res.text.includes("Edit Developer Profile"));
                                helper.assert.isTrue(res.text.includes("Project 203 - Developer"));
                                helper.assert.isTrue(res.text.includes("Budget: 0"));
                                helper.assert.isTrue(res.text.includes("Hours: 13"));
                                helper.assert.isTrue(res.text.includes("Project 203 is an awesome project."));
                                helper.assert.isFalse(res.text.includes("Accept"));
                                helper.assert.isFalse(res.text.includes("Leave Project"));
                            })
                            .expect(200)
                            .end(done);
                    });

            });

    });

    after(function () {
        models.Position.find({
            where: {
                id: 987
            }
        }).then(function (position) {
            position.update({status: "accepted"});
        });
    });


});