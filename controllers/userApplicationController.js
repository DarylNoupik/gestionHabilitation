const { UserApplicationServices } = require("../services/index");

const getFirst = async (req, res) => {
    const data = {
        user: req.params.user,
        page: req.params.page,
        limit: req.params.limit,
    };
    const result = await UserApplicationServices.getApplication(data);
    res.render('admin/userApplication', { data: result });
};

const getAppRessourceByApplication = async (res, req) => {
    const data = {
        user: req.params.user,
    };
    const result = await UserApplicationServices.getApplication(data);
    res.render('admin/userApplication', { data: result });
};

const getSpecialApplicationForUser = async (req, res) => {
    const data = {
        user: req.params.user,
        page: req.params.page,
        limit: req.params.limit,
    };
    const result = await UserApplicationServices.getSpecialApplicationForUser(data);
    res.render('admin/userSpecialApplication', { data: result });
};

const addSpecialApplicationForUser = async (req, res) => {
    const data = {
        user: req.params.user,
        application: req.body.application,
    };

    await UserApplicationServices.addSpecialApplicationForUser(data);
    res.redirect(`/userApplication/specialsAppulications/${data.user}/1/10`);
};

const deleteSpecialApplicationForUser = async (req, res) => {
    const data = {
        user: req.params.user,
        application: req.params.application,
    };

    await UserApplicationServices.deleteSpecialApplicationForUser(data);
    res.redirect(`/userApplication/specialsAppulications/${data.user}/1/10`);
};

module.exports = {
    getFirst,
    getAppRessourceByApplication,
    getSpecialApplicationForUser,
    addSpecialApplicationForUser,
    deleteSpecialApplicationForUser,
}