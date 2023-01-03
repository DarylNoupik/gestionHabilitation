const joi = require("joi");

const save = {
    body : joi.object().keys({
        name: joi.string().required(),
        abreviation: joi.string().required(),
    }),
};

const edit = {
    body : joi.object().keys({
        id: joi.number().required(),
        name: joi.string().required(),
        abreviation: joi.string().required(),
    }),
};

const search = {
    body: joi.object().keys({
        searchItem: joi.string().required(),
    })
};

const getWithPagination = {
    params: joi.object().keys({
        page: joi.number().required(),
        limit: joi.number().required(),
    })
};

module.exports = {
    save,
    edit,
    search,
    getWithPagination,
}