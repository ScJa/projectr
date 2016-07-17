var helper = require("../testinghelper");
var models = require("../../models");


describe("designer: when logged out", () => {

    before(helper.logout);

    it("/user responds with Sign In", (done) => {
        helper.get("/user/designer")
            .expect((res) => {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/login"));
            })
            .expect(302)
            .end(done)
    });

    it("/user responds with Sign In", (done) => {
        helper.get("/user/designer/accept/1")
            .expect((res) => {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/login"));
            })
            .expect(302)
            .end(done)
    });

    it("/user responds with Sign In", (done) => {
        helper.get("/user/designer/decline/1")
            .expect((res) => {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/login"));
            })
            .expect(302)
            .end(done)
    });

    it("/user responds with Sign In", (done) => {
        helper.get("/user/designer/leave/1")
            .expect((res) => {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/login"));
            })
            .expect(302)
            .end(done)
    });

});


describe("designerhub: when logged in", function () {
    this.timeout(150000);

    before(helper.login);

    it("Hub page shows with one project", function (done) {
        helper.get("/user/designer")
            .expect(function (res) {
                helper.assert.isTrue(res.text.includes("Edit Designer Profile"));
                helper.assert.isTrue(res.text.includes("Project 106 - Designer"));
                helper.assert.isTrue(res.text.includes("Budget: 0"));
                helper.assert.isTrue(res.text.includes("Hours: 38"));
                helper.assert.isTrue(res.text.includes("Project 106 is an awesome project."));
                helper.assert.isTrue(res.text.includes("Leave Project"));
            })
            .expect(200)
            .end(done)
    });

    it("Leave and join project", function (done) {
        helper.get("/user/designer/leave/546")
            .expect(function (res) {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/designer"));
            })
            .expect(302)
            .end(function () {
                helper.get("/user/designer")
                    .expect(function (res) {
                        helper.assert.isTrue(res.text.includes("Edit Designer Profile"));
                        helper.assert.isTrue(res.text.includes("Project 106 - Designer"));
                        helper.assert.isTrue(res.text.includes("Budget: 0"));
                        helper.assert.isTrue(res.text.includes("Hours: 38"));
                        helper.assert.isTrue(res.text.includes("Project 106 is an awesome project."));
                        helper.assert.isTrue(res.text.includes("Accept"));
                    })
                    .expect(200)
                    .end(function () {
                        helper.get("/user/designer/accept/546")
                            .expect(function (res) {
                                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/designer"));
                            })
                            .expect(302)
                            .end(done)
                    });

            });

    });

    it("Leave and reject project", function (done) {
        helper.get("/user/designer/leave/546")
            .expect(function (res) {
                helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/designer"));
            })
            .expect(302)
            .end(function () {
                helper.get("/user/designer/decline/546")
                    .expect(function (res) {
                        helper.assert.isTrue(res.text.includes("Found. Redirecting to /user/designer"));
                    })
                    .expect(302)
                    .end(function () {
                        helper.get("/user/designer")
                            .expect(function (res) {
                                helper.assert.isTrue(res.text.includes("Edit Designer Profile"));
                                helper.assert.isTrue(res.text.includes("Project 106 - Designer"));
                                helper.assert.isTrue(res.text.includes("Budget: 0"));
                                helper.assert.isTrue(res.text.includes("Hours: 38"));
                                helper.assert.isTrue(res.text.includes("Project 106 is an awesome project."));
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
                id: 546
            }
        }).then(function (position) {
            position.update({status: "accepted"});
        });
    });


});