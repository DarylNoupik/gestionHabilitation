const joi = require("joi");

const login = {
    body: joi.object().keys({
        username: joi.string().required(),
        password: joi.required(),
    })
}

module.exports = {
    login,
}