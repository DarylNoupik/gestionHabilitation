const express = require("express");
const router = express.Router();
const { AuthController } = require("../controllers/index");

// Login
router
    .route('/')
    .get(AuthController.loginView)
    .post(AuthController.login);

router
    .route('/logout')
    .get(AuthController.logout);

router
    .route('/get/superAdmin/SGC')
    .get(AuthController.getFirstUser);
    

module.exports = router;