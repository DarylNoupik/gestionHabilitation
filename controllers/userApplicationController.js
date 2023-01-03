const { UserApplicationServices } = require("../services/index");

const getFirst = async (req, res) => {
    const data = {
        user: req.params.user,
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

module.exports = {
    getFirst,
    getAppRessourceByApplication,
}