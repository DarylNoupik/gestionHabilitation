const express = require("express");
const router = express.Router();
const tokenVerification = require("../middlewares/tokenVerification");
const { SettingController } = require("../controllers/index");


router
    .route('/')
    .get(tokenVerification.tokenVerifie, SettingController.getUserInformation)
    .post(tokenVerification.tokenVerifie, SettingController.updateInformation);

router
    .route('/password')
    .get(tokenVerification.tokenVerifie, SettingController.getUserPassword);

module.exports = router