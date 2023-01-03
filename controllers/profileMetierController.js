const { ProfileMetierServices } = require("../services/index");

const getFirst = async (req, res) => {

    const result = await ProfileMetierServices.getFirst();
    if (result.statut == 200) {
        res.render('admin/profileMetier', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const save = async (req, res) => {
    const data = {
        name: req.body.name,
        abreviation: req.body.abreviation,
    };

    await ProfileMetierServices.save(data);
    res.redirect(`/profileMetier`);
};

const edit = async (req, res) => {
    const data = {
        id: req.body.id,
        name: req.body.name,
        abreviation: req.body.abreviation,
    };

    await ProfileMetierServices.edit(data);
    res.redirect(`/profileMetier`);
};

const search = async (req, res) => {
    const data = {
        searchItem: req.body.searchItem,
    };

    const result = await ProfileMetierServices.search(data);
    res.render('admin/profileMetier', { data: result });
};

const getProfileMetierWithPagination = async (req, res) => {
    const data = {
        page: req.params.page,
        limit: req.params.limit,
    };

    const result = await ProfileMetierServices.getProfileMetierWithPagination(data);
    if (result.statut == 200) {
        res.render('admin/profileMetier', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const getProfileMetierSuspendedWithPagination = async (req, res) => {
    const data = {
        page: req.params.page,
        limit: req.params.limit,
    };

    const result = await ProfileMetierServices.getProfileMetierSuspendedWithPagination(data);
    if (result.statut == 200) {
        res.render('admin/profileMetierRemove', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const remove = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    await ProfileMetierServices.remove(data);
    res.redirect(`/profileMetier`);
};

const back = (req, res) => {
    res.redirect(`/profileMetier`);
};

const searchRemove = async (req, res) => {
    const data = {
        searchItem: req.body.searchItem,
    };

    const result = await ProfileMetierServices.searchRemove(data);
    res.render('admin/profileMetierRemove', { data: result });
};

const restort = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    await ProfileMetierServices.restort(data);
    res.redirect(`/profileMetier/remove/1/10`);
};

const getApplication = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    const result = await ProfileMetierServices.getApplication(data);
    res.render('admin/pmApplication', { data: result });
};

const addApplication = async (req, res) => {
    const data = {
        application: req.body.application,
        profileMetier: req.params.id,
    };
    await ProfileMetierServices.addApplication(data);
    res.redirect(`/profileMetier/application/${data.profileMetier}`);
};

const removeApplication = async (req, res) => {
    const data = {
        application: req.params.application,
        profileMetier: req.params.profileMetier,
    };
    await ProfileMetierServices.removeApplication(data);
    res.redirect(`/profileMetier/application/${data.profileMetier}`);
};

const getprofileRessourceByApplication = async (req, res) => {
    const data = {
        application: req.params.application,
        profileMetier: req.params.profileMetier,
    };
    const result = await ProfileMetierServices.getprofileRessourceByApplication(data);
    res.render('admin/pmAppProfileRessource', { data: result });
};

const addProfileRessource = async (req, res) => {
    const data = {
        application: req.params.application,
        profileMetier: req.params.profileMetier,
        profileRessource: req.body.profileRessource,
    };
    await ProfileMetierServices.addProfileRessource(data);
    res.redirect(`/profileMetier/profileRessource/${data.profileMetier}/${data.application}`);
};

const removeProfileRessource = async (req, res) => {
    const data = {
        application: req.params.application,
        profileMetier: req.params.profileMetier,
        profileRessource: req.params.profileRessource,
    };
    await ProfileMetierServices.removeProfileRessource(data);
    res.redirect(`/profileMetier/profileRessource/${data.profileMetier}/${data.application}`);
};

module.exports = {
    getFirst,
    save,
    edit,
    search,
    searchRemove,
    getProfileMetierWithPagination,
    getProfileMetierSuspendedWithPagination,
    back,
    remove,
    restort,
    getApplication,
    addApplication,
    removeApplication,
    getprofileRessourceByApplication,
    addProfileRessource,
    removeProfileRessource,
}