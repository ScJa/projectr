module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks("gruntify-eslint");
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        shell: {
            docs: {
                command: "documentation build app/app.js -o docs -f html"
            },

            db: {
                command: "node seed_db.js"
            }
        },

        eslint: {
            src: ["app/**/*.js"]
        },

        mochaTest: {
            all: {
                options: {
                    reporter: "spec",
                    captureFile: "app/tests/logs/test.log",
                    quiet: false
                },
                src: ["app/tests/**/*.js"]
            }
        },

        express: {
            dev: {
                options: {
                    script: "app/app.js"
                }
            }
        },

        watch: {
            options: {
                livereload: true,
            },
            express: {
                files: ["app/**/*.js"],
                tasks: ["express:dev"],
                options: {
                    spawn: false,
                }
            }
        },

    });

    grunt.registerTask("lint", ["eslint"]);
    grunt.registerTask("test", ["mochaTest"]);
    grunt.registerTask("run", ["express:dev", "watch"]);
    grunt.registerTask("docs", ["shell:docs"]);
    grunt.registerTask("default", ["lint", "test", "express:dev", "watch"]);
    grunt.registerTask("all", ["shell:docs", "lint", "test", "express:dev", "watch"]);
    grunt.registerTask("precommit", ["lint", "test"]);
    grunt.registerTask("db", ["shell:db"]);
};