/**
 * Created by stefan on 03.07.16.
 */

var helper = require("../testinghelper");

describe("Skills: when logged in", function () {
    this.timeout(150000);
    before(helper.login);

    it("get all skills", (done) => {
        var req = helper.get("/skills");
        req.expect("Content-Type", /json/).expect((res) => {
            res.body.should.be.instanceof(Array);
            res.body.should.not.be.empty;
        }).expect(200).end(done);
    });

    it("get skills by search term", (done) => {
        var req = helper.get("/skills/java");
        req.expect("Content-Type", /json/).expect((res) => {
            res.body.should.be.instanceof(Array);
            res.body.should.not.be.empty;
            res.body.forEach((s) => {
                s.should.have.property("name");
                s.name.should.not.be.null;
                helper.assert.isTrue(s.name.toLowerCase().indexOf("java") != -1);
            });
        }).expect(200).end(done);
    });

    it("get no skills by search term", (done) => {
        var req = helper.get("/skills/notexistingsearchterm");
        req.expect("Content-Type", /json/).expect((res) => {
            res.body.should.be.instanceof(Array);
            res.body.should.be.empty;
        }).expect(200).end(done);
    });

    after(helper.logout);
});

describe("Skills: when logged out", function () {
    this.timeout(5000);
    before(helper.logout);

    it("get redirected when accessing skills", (done) => {
        helper.request.get("/skills").expect((res) => {
            helper.assert.isTrue(res.text.includes("Redirecting"));
        }).expect(302).end(done);
    });
});