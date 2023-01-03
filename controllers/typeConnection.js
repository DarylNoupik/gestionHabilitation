const { TypeConnectionServices } = require("../services/index");

const getFirst = async (req, res) => {

    const result = await TypeConnectionServices.getFirst();
    if (result.statut == 200) {
        res.render('admin/typeConnection', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const getApplicationWithPagination = async (req, res) => {
    const data = {
        page: req.params.page,
        limit: req.params.limit,
    };

    const result = await TypeConnectionServices.getApplicationWithPagination(data);
    if (result.statut == 200) {
        res.render('admin/typeConnection', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const search = async (req, res) => {
    const data = {
        searchItem: req.body.searchItem,
    };

    const result = await TypeConnectionServices.search(data);
    if (result.statut == 200) {
        res.render('admin/typeConnection', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const save = async (req, res) => {
    const data = {
        name: req.body.name,
    };

    await TypeConnectionServices.save(data);
    res.redirect(`/typeConnection`);
};

const edit = async (req, res) => {
    const data = {
        id: req.body.id,
        name: req.body.name,
    };

    await TypeConnectionServices.edit(data);
    res.redirect(`/typeConnection`);
};

module.exports = {
    getFirst,
    getApplicationWithPagination,
    search,
    save,
    edit
};