var config = {};

config.ENVIRONMENT = "dev";

config.DATABASE_NAME = "";
config.DATABASE_USER = "";
config.DATABASE_PASSWORD = "";
config.DATABASE_HOST = "";
config.DATABASE_PORT = 5432;
config.DATABASE_DIALECT = "postgres"; // "mysql"|"mariadb"|"sqlite"|"postgres"|"mssql"

config.DATABASE_CONFIG = {
    "host": config.DATABASE_HOST,
    "dialect": config.DATABASE_DIALECT
};

config.RECOMMENDER_HOST = "";
config.RECOMMENDER_PORT = 5000;

config.LISTEN_PORT = 8855;

config.NUNJUCKS_CONFIG = {
    // (default: true) controls if output with dangerous characters are escaped automatically.
    autoescape: true,
    // (default: false) throw errors when outputting a null/undefined value.
    throwOnUndefined: false,
    // (default: false) automatically remove trailing newlines from a block/tag.
    trimBlocks: false,
    // (default: false) automatically remove leading whitespace from a block/tag.
    lstripBlocks: false,
    // (default: false) if true, the system will automatically update templates when they are changed on the filesystem.
    watch: true,
    // (default: false) if true, the system will avoid using a cache and templates will be recompiled every single time.
    noCache: true,
    // (default: see nunjucks syntax) defines the syntax for nunjucks tags.
    tags: {}
}

config.XING_CONFIG = {
    "consumerKey" : "",
    "consumerSecret" : "",
    "apiURL": "https://api.xing.com",
    "testToken": " ",
    "tokenSecret": " "
};

config.GITHUB_CONFIG = {
    "clientId": "",
    "clientSecret" : "",
    "apiURL": "https://api.github.com",
    "testToken": " "
};

config.LinkedIn_CONFIG = {
    "clientId": "",
    "clientSecret" : "",
    "apiURL": "https://api.linkedin.com",
    "testToken": ""
};

config.DevianArt_CONFIG = {
    "clientId": "",
    "clientSecret" : "",
    "callback": "http:127.0.0.1:8855/deviantart/auth/deviantart/callback",
    "token": " ",
    "tokenSecret": " "
};


config.LOG_LEVEL = "debug"

module.exports = config;