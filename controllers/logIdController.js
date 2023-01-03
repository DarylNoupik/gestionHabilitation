const { LogIdServices } = require("../services/index");

const getFirst = async (req, res) => {

    const result = await LogIdServices.getFirst();
    if (result.statut == 200) {
        res.render('admin/logIds', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

module.exports = {
    getFirst,
}