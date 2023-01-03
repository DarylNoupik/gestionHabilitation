const joi = require("joi");

const getApplicationWithPagination = {
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
        name: joi.string().required(),
        description: joi.string().required(),
        typeConnection: joi.number().required(),
    }),
};

const edit = {
    body : joi.object().keys({
        id: joi.number().required(),
        name: joi.string().required(),
        description: joi.string().required(),
        typeConnection: joi.number().required(),
    }),
};

module.exports = {
    getApplicationWithPagination,
    search,
    save,
    edit,
}