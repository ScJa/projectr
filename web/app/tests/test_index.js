/**
 * Created by stefan on 26.06.16.
 */

var helper = require("./testinghelper");

describe('GET /', function() {
    it('Index page content', function(done) {
        helper.request.get('/').expect(200).expect((res) => {
            helper.assert.isTrue(res.text.includes("http://fonts.googleapis.com/icon?family=Material+Icons"));
            helper.assert.isTrue(res.text.includes("/css/materialize.min.css"));
            helper.assert.isTrue(res.text.includes("/css/style.css"));
            helper.assert.isTrue(res.text.includes("http://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css"));
            helper.assert.isTrue(res.text.includes("/css/fontawesome-stars-o.css"));

            helper.assert.isTrue(res.text.includes("/js/jquery-2.1.1.min.js"));
            helper.assert.isTrue(res.text.includes("/js/socketio.min.js"));
            helper.assert.isTrue(res.text.includes("/js/jquery-ui-1.11.4.min.js"));
            helper.assert.isTrue(res.text.includes("/js/materialize.min.js"));
            helper.assert.isTrue(res.text.includes("/js/initParallaxTemplate.js"));
            helper.assert.isTrue(res.text.includes("/js/jquery.barrating.js"));
            helper.assert.isTrue(res.text.includes("/js/starrating.js"));
            helper.assert.isTrue(res.text.includes("/js/projectr.js"));

            helper.assert.isTrue(res.text.includes("html"));
            helper.assert.isTrue(res.text.includes("head"));
            helper.assert.isTrue(res.text.includes("body"));
            helper.assert.isTrue(res.text.includes("header"));

            helper.assert.isTrue(res.text.includes("Get work done"));
            helper.assert.isTrue(res.text.includes("Bring your ideas to life!"));

            helper.assert.isTrue(res.text.includes("/images/pexels-photo.jpg"));

            helper.assert.isTrue(res.text.includes("ABOUT US"));
            helper.assert.isTrue(res.text.includes("FAQ"));
            helper.assert.isTrue(res.text.includes("CONTACT US"));
        }).end(done);
    });
});