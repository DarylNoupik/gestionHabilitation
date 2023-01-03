const { ApplicationServices } = require("../services/index");

const getApplicationWithPagination = async (req, res) => {
    const data = {
        page: req.params.page,
        limit: req.params.limit,
    };

    const result = await ApplicationServices.getApplicationWithPagination(data);
    if (result.statut == 200) {
        if (req.params.view == "view1") {
            res.render('admin/applications', { data: result });
        } 
        if (req.params.view == "view2") {
            res.render('admin/applicationsV2', { data: result });
        }
    } else {
        res.render('auth', { data: result });
    }
};

const search = async (req, res) => {
    const data = {
        searchItem: req.body.searchItem,
    };

    const result = await ApplicationServices.search(data);
    if (result.statut == 200) {
        if (req.params.view == "view1") {
            res.render('admin/applications', { data: result });
        } 
        if (req.params.view == "view2") {
            res.render('admin/applicationsV2', { data: result });
        }
    } else {
        res.render('auth', { data: result });
    }
};

const getFirst = async (req, res) => {

    const result = await ApplicationServices.getFirst();
    if (result.statut == 200) {
        if (req.params.view == "view1") {
            res.render('admin/applications', { data: result });
        } 
        if (req.params.view == "view2") {
            res.render('admin/applicationsV2', { data: result });
        }
    } else {
        res.render('auth', { data: result });
    }
};

const save = async (req, res) => {
    const data = {
        name: req.body.name,
        description: req.body.description,
        typeConnection: req.body.typeConnection,
    };

    await ApplicationServices.save(data);
    if (req.params.view == "view1") {
        res.redirect(`/application/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/application/view/view2`);
    }
};

const edit = async (req, res) => {
    const data = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        typeConnection: req.body.typeConnection,
    };

    await ApplicationServices.edit(data);
    if (req.params.view == "view1") {
        res.redirect(`/application/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/application/view/view2`);
    }
};
const getApplicationSuspendedWithPagination = async (req, res) => {
    const data = {
        page: req.params.page,
        limit: req.params.limit,
    };

    const result = await ApplicationServices.getApplicationSuspendedWithPagination(data);
    if (result.statut == 200) {
        res.render('admin/applicationsRemove', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const remove = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    await ApplicationServices.remove(data);
    if (req.params.view == "view1") {
        res.redirect(`/application/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/application/view/view2`);
    }
};

const back = (req, res) => {
    if (req.params.view == "view1") {
        res.redirect(`/application/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/application/view/view2`);
    }
};

const searchRemove = async (req, res) => {
    const data = {
        searchItem: req.body.searchItem,
    };

    const result = await ApplicationServices.searchRemove(data);
    res.render('admin/applicationsRemove', { data: result });
};

const restort = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    await ApplicationServices.restort(data);
    res.redirect(`/application/remove/1/10`);
};

module.exports = {
    getApplicationWithPagination,
    getApplicationSuspendedWithPagination,
    search,
    getFirst,
    save,
    edit,
    remove,
    back,
    searchRemove,
    restort,
};