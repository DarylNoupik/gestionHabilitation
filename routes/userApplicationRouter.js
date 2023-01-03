const express = require("express");
const router = express.Router();
const tokenVerification = require("../middlewares/tokenVerification")
const validate = require('../middlewares/validation');
const { UserApplicationController } = require("../controllers/index")

router
    .route('/:user')
    .get(tokenVerification.tokenVerifie, UserApplicationController.getFirst);

router
    .route('/:user/:application')
    .get(tokenVerification.tokenVerifie, UserApplicationController.getAppRessourceByApplication);

module.exports = router