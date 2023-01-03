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
        name: joi.string().required(),
        application: joi.string().required(),
    }),
};

const edit = {
    body : joi.object().keys({
        id: joi.number().required(),
        name: joi.string().required(),
    }),
};

module.exports = {
    getWithPagination,
    search,
    save,
    edit,
}