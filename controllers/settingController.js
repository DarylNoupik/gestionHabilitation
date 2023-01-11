const { SettingServices } = require("../services/index");

const getUserInformation = async (req, res) => {
    const token = req.cookies['SGB Habilitation'];

    const result = await SettingServices.getUserInformation(token);
    res.render('admin/setting', { data: result });
};

const getUserPassword = async (req, res) => {
    res.render('admin/settingPassword');
};

const updateInformation = async (req, res) => {
    const data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        token: req.cookies['SGB Habilitation'],
    };

    const result = await SettingServices.updateInformation(data);
    res.redirect(`/setting`);
};

module.exports = {
    getUserInformation,
    updateInformation,
    getUserPassword,
}