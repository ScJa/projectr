var helper = require("../testinghelper");

describe("user: when logged out", function() {
    this.timeout(5000);
    it("/user responds with Sign In", (done) => {
        helper.request.get("/user").expect((res) => {
            helper.assert.isTrue(res.text.includes("Redirecting"));
        }).expect(302).end(done)
    });

    it("/user responds with Sign In", (done) => {
        helper.request.get("/user").expect(302).expect((res) => {
            helper.assert.isTrue(res.text.includes("Redirecting"));
        }).end(done)
    });

    it("/user/register responds with registration form", (done) => {
        helper.request.get("/user/register").expect((res) => {
            helper.assert.isTrue(res.text.includes("Register!"));
            helper.assert.isTrue(res.text.includes("form"));
            helper.assert.isTrue(res.text.includes("E-Mail"));
            helper.assert.isTrue(res.text.includes("First Name"));
        }).expect(200).end(done)
    });

    it("/user/edit responds with Sign In", (done) => {
        helper.request.get("/user/edit").expect(302).expect((res) => {
            helper.assert.isTrue(res.text.includes("Redirecting"));
        }).end(done)
    });

    it("/admin responds with forbidden", (done) => {
        helper.request.get("/admin").expect(403).end(done)
    });

    it("show profile", (done) => {
        var req = helper.get("/user/9");
        req.expect(302).end(done)
    });

    it("show short profile", (done) => {
        var req = helper.get("/user/profileShort/9");
        req.expect(302).end(done)
    });

    it("/user/delete responds with Sign In", (done) => {
        helper.request.get("/user/delete").expect(404).expect((res) => {
        }).end(done)
    });

    it("/user/delete responds with Sign In", (done) => {
        helper.request.post("/user/delete").expect(302).expect((res) => {
            helper.assert.isTrue(res.text.includes("Redirecting"));
        }).end(done)
    });

    it("/user/upload-avatar responds with Sign In", (done) => {
        helper.request.get("/user/upload-avatar").expect(302).expect((res) => {
            helper.assert.isTrue(res.text.includes("Redirecting"));
        }).end(done)
    });

    it("/user/upload-avatar responds with Sign In", (done) => {
        helper.request.post("/user/upload-avatar").expect(302).expect((res) => {
            helper.assert.isTrue(res.text.includes("Redirecting"));
        }).end(done)
    });

    it("/user/register/develop responds with Sign In", (done) => {
        helper.request.get("/user/register/develop").expect(302).expect((res) => {
            helper.assert.isTrue(res.text.includes("Redirecting"));
        }).end(done)
    });

    it("/user/rate responds with Sign In", (done) => {
        helper.request.post("/user/rate").expect(302).expect((res) => {
            helper.assert.isTrue(res.text.includes("Redirecting"));
        }).end(done)
    });
});


describe("user: when logged in", function() {
    this.timeout(15000);
    before(helper.login);

    it("show profile", (done) => {
        var req = helper.get("/user/9");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes("Moreno"));
            helper.assert.isTrue(res.text.includes("imoreno8@shutterfly.com"));
            helper.assert.isTrue(res.text.includes("34 h/week"));
            helper.assert.isTrue(res.text.includes("Project 203 - Developer"));
            helper.assert.isTrue(res.text.includes("Project 106 - Designer"));
            helper.assert.isTrue(res.text.includes("ISLISP"));
            helper.assert.isTrue(res.text.includes("LISP"));
            helper.assert.isTrue(res.text.includes("UNITY"));
            helper.assert.isTrue(res.text.includes("TADS"));
            helper.assert.isTrue(res.text.includes("ALGOL W"));
            helper.assert.isTrue(res.text.includes("Edinburgh IMP"));
            helper.assert.isTrue(res.text.includes('<i class="material-icons" title="Designer">web</i>'));
            helper.assert.isTrue(res.text.includes('<i class="material-icons" title="Developer">settings</i>'));
            helper.assert.isTrue(res.text.includes('<i class="material-icons" title="Project Owner">mode_edit</i>'));
        }).end(done)
    });

    it("/user shows the overview for the current user", (done) => {
        var req = helper.get("/user");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes("Welcome Back"));
        }).expect(200).end(done)
    });

    it("/user/edit responds with a settings dialogue", (done) => {
        var req = helper.get("/user/edit");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes("Save changes"));
        }).expect(200).end(done)
    });

    it("/admin responds with forbidden when not an admin", (done) => {
        var req = helper.get("/admin");
        req.expect(403).end(done)
    });

    it("conversation contains history", (done) => {
        var req = helper.get("/user/conversations/1001");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes("qwe"));
            helper.assert.isTrue(res.text.includes("Message"));
            helper.assert.isTrue(res.text.includes("Send"));
        }).end(done)
    });

    it("should show all conversations in the overview", (done) => {
        var req = helper.get("/user/conversations");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes("Test Test"));
        }).end(done)
    });

    it("show profile", (done) => {
        var req = helper.get("/user/9");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes("Irene Moreno"));
            helper.assert.isTrue(res.text.includes("imoreno8@shutterfly.com"));
            helper.assert.isTrue(res.text.includes("34 h/week"));
            helper.assert.isTrue(res.text.includes("Project 203 - Developer"));
            helper.assert.isTrue(res.text.includes("Project 106 - Designer"));
            helper.assert.isTrue(res.text.includes("ISLISP"));
            helper.assert.isTrue(res.text.includes("LISP"));
            helper.assert.isTrue(res.text.includes("UNITY"));
            helper.assert.isTrue(res.text.includes("TADS"));
            helper.assert.isTrue(res.text.includes("ALGOL W"));
            helper.assert.isTrue(res.text.includes("Edinburgh IMP"));
            helper.assert.isTrue(res.text.includes('<i class="material-icons" title="Designer">web</i>'));
            helper.assert.isTrue(res.text.includes('<i class="material-icons" title="Developer">settings</i>'));
            helper.assert.isTrue(res.text.includes('<i class="material-icons" title="Project Owner">mode_edit</i>'));
        }).end(done)
    });

    it("/user/register redirects to /user", (done) => {
        helper.get("/user/register").expect(302).end(done);
    });

    it("show short profile", (done) => {
        helper.get("/user/profileShort/9").expect((res) => {
            helper.assert.isTrue(res.text.includes("Irene Moreno"));
        }).end(done);
    });

    it("/user/upload-avatar", (done) => {
        helper.get("/user/upload-avatar").expect((res) => {
            helper.assert.isTrue(res.text.includes("Choose your Avatar"));
            helper.assert.isTrue(res.text.includes("/user/upload-avatar"));
            helper.assert.isTrue(res.text.includes("Choose your Avatar"));
            helper.assert.isTrue(res.text.includes("Choose your Avatar"));
        }).end(done);
    });

    it("/user/register/develop", (done) => {
        helper.get("/user/register/develop").expect((res) => {
            helper.assert.isTrue(res.text.includes("LinkedIn"));
            helper.assert.isTrue(res.text.includes("Xing"));
            helper.assert.isTrue(res.text.includes("GitHub"));
            helper.assert.isTrue(res.text.includes("Guru"));
            helper.assert.isTrue(res.text.includes("Expert"));
            helper.assert.isTrue(res.text.includes("Advanced"));
            helper.assert.isTrue(res.text.includes("Basic"));
        }).end(done);
    });

    it("/user/register/design", (done) => {
        helper.get("/user/register/design").expect((res) => {
            helper.assert.isTrue(res.text.includes("DeviantArt"));
            helper.assert.isTrue(res.text.includes("Guru"));
            helper.assert.isTrue(res.text.includes("Expert"));
            helper.assert.isTrue(res.text.includes("Advanced"));
            helper.assert.isTrue(res.text.includes("Basic"));
        }).end(done);
    });

    it("/user/register/create", (done) => {
        helper.get("/user/register/create").expect((res) => {
            helper.assert.isTrue(res.text.includes("/user/register/develop"));
            helper.assert.isTrue(res.text.includes("name"));
            helper.assert.isTrue(res.text.includes("description"));
            helper.assert.isTrue(res.text.includes("budget"));
            helper.assert.isTrue(res.text.includes("check-later"));
            helper.assert.isTrue(res.text.includes("checkbox"));
        }).end(done);
    });

    after(helper.logout);
});