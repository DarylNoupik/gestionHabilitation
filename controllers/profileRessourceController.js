const { ProfileRessourceServices } = require("../services/index");

const getWithPagination = async (req, res) => {
    const data = {
        application: req.params.id,
        page: req.params.page,
        limit: req.params.limit,
    };

    const result = await ProfileRessourceServices.getWithPagination(data);
    if (result.statut == 200) {
        res.render('admin/profileRessource', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const search = async (req, res) => {
    const data = {
        application: req.params.id,
        searchItem: req.body.searchItem,
    };

    const result = await ProfileRessourceServices.search(data);
    if (result.statut == 200) {
        res.render('admin/profileRessource', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const getFirst = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    const result = await ProfileRessourceServices.getFirst(data);
    if (result.statut == 200) {
        res.render('admin/profileRessource', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const save = async (req, res) => {
    const data = {
        application: req.params.id,
        name: req.body.name,
    };

    await ProfileRessourceServices.save(data);
    res.redirect(`/profileRessource/${data.application}`);
};

const edit = async (req, res) => {
    const data = {
        application: req.params.id,
        id: req.body.id,
        name: req.body.name,
    };

    await ProfileRessourceServices.edit(data);
    res.redirect(`/profileRessource/${data.application}`);
};
const getSuspendedWithPagination = async (req, res) => {
    const data = {
        application: req.params.id,
        page: req.params.page,
        limit: req.params.limit,
    };

    const result = await ProfileRessourceServices.getSuspendedWithPagination(data);
    if (result.statut == 200) {
        res.render('admin/profileRessourceRemove', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const remove = async (req, res) => {
    const data = {
        application: req.params.application,
        id: req.params.id,
    };
    await ProfileRessourceServices.remove(data);
    res.redirect(`/profileRessource/${data.application}`);
};

const back = (req, res) => {
    const data = {
        application: req.params.id,
    };
    res.redirect(`/profileRessource/${data.application}`);
};

const searchRemove = async (req, res) => {
    const data = {
        application: req.params.id,
        searchItem: req.body.searchItem,
    };

    const result = await ProfileRessourceServices.searchRemove(data);
    res.render('admin/applicationsRemove', { data: result });
};

const restort = async (req, res) => {
    const data = {
        application: req.params.application,
        id: req.params.id,
    };
    await ProfileRessourceServices.restort(data);
    res.redirect(`/profileRessource/remove/${data.application}/1/10`);
};

module.exports = {
    getWithPagination,
    getSuspendedWithPagination,
    search,
    getFirst,
    save,
    edit,
    remove,
    back,
    searchRemove,
    restort,
};