/**
 * Created by stefan on 26.06.16.
 */

var helper = require("../testinghelper");

describe("myprojects: when logged in", function() {
    this.timeout(15000);
    before(helper.login);

    it("Overview for the current user's projects", (done) => {
        var req = helper.get("/user/myprojects");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes("Positions"));
            helper.assert.isTrue(res.text.includes("Recommendations"));
            helper.assert.isTrue(res.text.includes("Budget"));
            helper.assert.isTrue(res.text.includes("Description"));
            helper.assert.isTrue(res.text.includes("Delete"));
            helper.assert.isTrue(res.text.includes("lock_open"));
            helper.assert.isTrue(res.text.includes("lock"));
            helper.assert.isTrue(res.text.includes("pan_tool"));

            helper.assert.isTrue(res.text.includes("Project 7"));
            helper.assert.isTrue(res.text.includes("Dorothy Grant"));
            helper.assert.isTrue(res.text.includes("Eugene Graham"));
            helper.assert.isTrue(res.text.includes("Anne Romero"));
            helper.assert.isTrue(res.text.includes("10397.33"));
            helper.assert.isTrue(res.text.includes("Project 7 is an awesome project. Yes it is! Ow hhhaaaaddasd"));

            helper.assert.isTrue(res.text.includes("Project 8"));
            helper.assert.isTrue(res.text.includes("Amanda Ortiz"));
            helper.assert.isTrue(res.text.includes("Jessica Johnston"));
            helper.assert.isTrue(res.text.includes("Louise Henry"));
            helper.assert.isTrue(res.text.includes("Julia Dunn"));
            helper.assert.isTrue(res.text.includes("111.79"));
            helper.assert.isTrue(res.text.includes("Project 8 is an awesome project."));

        }).end(done);
    });

    it("Form for creating a new project", (done) => {
        var req = helper.get("/user/myprojects/create");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes('<input type="text" id="name" name="name" />'));
            helper.assert.isTrue(res.text.includes('<textarea id="short_description" class="materialize-textarea" name="short_description"></textarea>'));
            helper.assert.isTrue(res.text.includes('<textarea id="public_description" class="materialize-textarea" name="public_description"></textarea>'));
            helper.assert.isTrue(res.text.includes('<textarea id="private_description" class="materialize-textarea" name="private_description"></textarea>'));
            helper.assert.isTrue(res.text.includes('<input type="number" id="budget" name="budget" />'));
            helper.assert.isTrue(res.text.includes('<button class="amber darken-1 btn" type="submit" name="action">'));
        }).end(done);
    });

    it("should show the project edit form", (done) => {
        var req = helper.get("/user/myprojects/project/7/edit");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes('Name'));
            helper.assert.isTrue(res.text.includes('Project 7'));
            helper.assert.isTrue(res.text.includes('10397.33'));
            helper.assert.isTrue(res.text.includes('Budget'));
            helper.assert.isTrue(res.text.includes('Short description'));
            helper.assert.isTrue(res.text.includes('Public description'));
            helper.assert.isTrue(res.text.includes('Private description'));
            helper.assert.isTrue(res.text.includes('Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'));
        }).end(done);
    });

    it("should show the positions edit form", (done) => {
        var req = helper.get("/user/myprojects/project/7/positions");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes('Designer'));
            helper.assert.isTrue(res.text.includes('Developer'));
            helper.assert.isTrue(res.text.includes('Davis'));
            helper.assert.isTrue(res.text.includes('Fisher'));
            helper.assert.isTrue(res.text.includes('Grant'));
            helper.assert.isTrue(res.text.includes('Graham'));
            helper.assert.isTrue(res.text.includes('Romero'));
            helper.assert.isTrue(res.text.includes('Add Position'));
        }).end(done);
    });

    it("should show the position edit form", (done) => {
        var req = helper.get("/user/myprojects/project/7/position/edit/40");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes('Designer'));
            helper.assert.isTrue(res.text.includes('Developer'));
            helper.assert.isTrue(res.text.includes('Budget'));
            helper.assert.isTrue(res.text.includes('Hours'));
            helper.assert.isTrue(res.text.includes('Type'));
            helper.assert.isTrue(res.text.includes('Position Skills'));
            helper.assert.isTrue(res.text.includes('Guru'));
            helper.assert.isTrue(res.text.includes('Expert'));
            helper.assert.isTrue(res.text.includes('Advanced'));
            helper.assert.isTrue(res.text.includes('Basic'));
            helper.assert.isTrue(res.text.includes('Transaction Application Language'));
        }).end(done);
    });

    it("should show the add positions form", (done) => {
        var req = helper.get("/user/myprojects/project/7/position/add");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes('Name'));
            helper.assert.isTrue(res.text.includes('Budget'));
            helper.assert.isTrue(res.text.includes('Type'));
            helper.assert.isTrue(res.text.includes('Hours'));
            helper.assert.isTrue(res.text.includes('Add Position'));
        }).end(done);
    });

    it("should show a loading bar and load recommendations", (done) => {
        var req = helper.get("/user/myprojects/project/8/recommend/44");
        req.expect((res) => {
            helper.assert.isTrue(res.text.includes('/images/loading.gif'));
            helper.assert.isTrue(res.text.includes('/user/myprojects'));
        }).end(done);
    });

    after(helper.logout);
});

