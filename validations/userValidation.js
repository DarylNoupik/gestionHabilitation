const joi = require("joi");

const getWithPagination = {
    params: joi.object().keys({
        page: joi.number().required(),
        limit: joi.number().required(),
    })
};

const search = {
    body: joi.object().keys({
        searchItem: joi.string().required(),
    })
};

const save = {
    body : joi.object().keys({
        firstname: joi.string().required(),
        lastname: joi.string().required(),
        email: joi.string().required(),
        profileMetierId: joi.number().required(),
    }),
};

const edit = {
    body : joi.object().keys({
        id: joi.number().required(),
        firstname: joi.string().required(),
        lastname: joi.string().required(),
        email: joi.string().required(),
        profileMetierId: joi.number().required(),
    }),
};

const saveUserInfo = {
    params: joi.object().keys({
        user: joi.number().required(),
    }),
    body: joi.object().keys({
        name: joi.string().required(),
        typeConnection: joi.number().required(),
    })
}

module.exports = {
    getWithPagination,
    search,
    save,
    edit,
    saveUserInfo,
}