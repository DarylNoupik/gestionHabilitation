const { UserServices } = require("../services/index");

const getUsersWithPagination = async (req, res) => {
    const data = {
        page: req.params.page,
        limit: req.params.limit,
    };

    const result = await UserServices.getUsersWithPagination(data);
    if (result.statut == 200) {
        if (req.params.view == "view1") {
            res.render('admin/users', { data: result });
        } 
        if (req.params.view == "view2") {
            res.render('admin/usersV2', { data: result });
        }
    } else {
        res.render('auth', { data: result });
    }
};

const search = async (req, res) => {
    const data = {
        searchItem: req.body.searchItem,
    };

    const result = await UserServices.search(data);
    if (result.statut == 200) {
        if (req.params.view == "view1") {
            res.render('admin/users', { data: result });
        } 
        if (req.params.view == "view2") {
            res.render('admin/usersV2', { data: result });
        }
    } else {
        res.render('auth', { data: result });
    }
};

const getFirst = async (req, res) => {

    const result = await UserServices.getFirst();
    if (result.statut == 200) {
        if (req.params.view == "view1") {
            res.render('admin/users', { data: result });
        } 
        if (req.params.view == "view2") {
            res.render('admin/usersV2', { data: result });
        }
    } else {
        res.render('auth', { data: result });
    }
};

const save = async (req, res) => {
    const data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        profileMetier: req.body.profileMetier,
    };

    await UserServices.save(data);
    if (req.params.view == "view1") {
        res.redirect(`/user/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/user/view/view2`);
    }
};

const edit = async (req, res) => {
    const data = {
        id: req.body.id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        profileMetier: req.body.profileMetier,
    };

    await UserServices.edit(data);
    if (req.params.view == "view1") {
        res.redirect(`/user/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/user/view/view2`);
    }
};

const resetPassword = async (req, res) => {
    const data = {
        id: req.body.id,
    };

    await UserServices.resetPassword(data);
    if (req.params.view == "view1") {
        res.redirect(`/user/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/user/view/view2`);
    }
};

const getUsersSuspendedWithPagination = async (req, res) => {
    const data = {
        page: req.params.page,
        limit: req.params.limit,
    };

    const result = await UserServices.getUsersSuspendedWithPagination(data);
    if (result.statut == 200) {
        res.render('admin/usersRemove', { data: result });
    } else {
        res.render('auth', { data: result });
    }
};

const remove = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    await UserServices.remove(data);
    if (req.params.view == "view1") {
        res.redirect(`/user/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/user/view/view2`);
    }
};

const putAdmin = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    await UserServices.putAdmin(data);
    if (req.params.view == "view1") {
        res.redirect(`/user/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/user/view/view2`);
    }
};

const removeAdmin = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    await UserServices.removeAdmin(data);
    if (req.params.view == "view1") {
        res.redirect(`/user/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/user/view/view2`);
    }
};

const back = (req, res) => {
    if (req.params.view == "view1") {
        res.redirect(`/user/view/view1`);
    } 
    if (req.params.view == "view2") {
        res.redirect(`/user/view/view2`);
    }
};

const searchRemove = async (req, res) => {
    const data = {
        searchItem: req.body.searchItem,
    };

    const result = await UserServices.searchRemove(data);
    res.render('admin/usersRemove', { data: result });
};

const restort = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    await UserServices.restort(data);
    res.redirect(`/user/remove/1/10`);
};

const userInfo = async (req, res) => {
    const data = {
        id: req.params.id,
    };
    const result = await UserServices.userInfo(data);
    res.render('admin/usersInfo', { data: result });
};

const saveUserInfo = async (req, res) => {
    const data = {
        user: req.params.id,
        name: req.body.name,
        typeConnection: req.body.typeConnection,
    };

    await UserServices.saveUserInfo(data);
    res.redirect(`/user/userInfo/${data.user}`);
};

module.exports = {
    getUsersWithPagination,
    getUsersSuspendedWithPagination,
    search,
    getFirst,
    save,
    edit,
    remove,
    back,
    searchRemove,
    restort,
    resetPassword,
    userInfo,
    saveUserInfo,
    putAdmin,
    removeAdmin,
};