const { AuthServices } = require("../services/index");
const jwt = require("jsonwebtoken");

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'SGC Habilitation', {
        expiresIn: maxAge
    });
}

const loginView = (req, res) => {
    const result = {
        statut: 200,
        data: [],
        rowCount: 0,
        session: {},
        error: false,
        errorInfo: "",
    };
    res.render('auth', {data: result});
}

const login = async (req, res) => {
    const data = {
        username: req.body.username,
        password: req.body.password,
    };

    const result = await AuthServices.login(data);
    if (result.statut == 200) {
        const token = createToken(result.session);
        res.cookie('SGB Habilitation',  token).redirect(`/application/view/view1`);
    } else {
        res.render('auth', { data: result });
    }
}

const logout = async (req, res) => {
    const result = {
        statut: 200,
        data: [],
        rowCount: 0,
        session: {},
        error: false,
        errorInfo: "",
    };
    res.clearCookie("SGB Habilitation").render('auth', {data: result});
}

const getSetting = async (req, res) => {
    const data = {
        id: req.params.id,
    };

    const result = await AuthServices.getSetting(data);
    if (result.statut == 200) {
        res.render('admin/setting', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const getFirstUser = async (req, res) => {
    const result = await AuthServices.firstUser();
    console.log(result)
    res.render('auth', { data: result });
}

module.exports = {
    loginView,
    login,
    logout,
    getSetting,
    getFirstUser
}