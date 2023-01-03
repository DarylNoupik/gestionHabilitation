// This file content the default configuration for our application

// Use for access to .env file
const dotenv = require("dotenv");
// Use for use a true paths depending of OS
const path = require("path");
// Use specify a structur of ours .env entries
const joi = require("joi");
// My log configuration
const logger = require("./logger")

dotenv.config({path: path.join(__dirname, '../.env')});

var envVarSchema = joi.object().keys({
    NODE_ENV: joi.string().valid('production', 'development', 'test').required(),
    PORT: joi.number().default(4000),
    USER_DATABASE: joi.string().description("Name of database"),
    PASSWORD_DATABASE: joi.string().required().description("Password of database"),
    SERVER_DATABASE_ADDRESS: joi.string().default("localhost").description("Address of database"),
    DATABASE_NAME: joi.string().required(),
    DRIVER: joi.string(),
    DEFAULT_USER_PASSWORD: joi.string().required(),
}).unknown();
const {value: envVars, error} = envVarSchema.prefs({errors: {label: "key"}}).validate(process.env);

if (error) {
    envVars.NODE_ENV == "production" && logger.error(error.message);
    envVars.NODE_ENV == "development" && new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    sql: {
        url: envVars.SERVER_DATABASE_ADDRESS,
        database: envVars.DATABASE_NAME,
        user: envVars.USER_DATABASE,
        password: envVars.PASSWORD_DATABASE,
        driver: envVars.DRIVER,
    },
    default_user_password: envVars.DEFAULT_USER_PASSWORD
};