const express = require("express");
const router = express.Router();
const tokenVerification = require("../middlewares/tokenVerification")
const validate = require('../middlewares/validation');
const { UserApplicationController } = require("../controllers/index")

router
    .route('/specialsAppulications/:user')
    .post(tokenVerification.tokenVerifie, UserApplicationController.addSpecialApplicationForUser);

router
    .route('/specialsAppulications/:user/:application')
    .get(tokenVerification.tokenVerifie, UserApplicationController.deleteSpecialApplicationForUser);

router
    .route('/specialsAppulications/:user/:page/:limit')
    .get(tokenVerification.tokenVerifie, UserApplicationController.getSpecialApplicationForUser);

router
    .route('/:user/:page/:limit')
    .get(tokenVerification.tokenVerifie, UserApplicationController.getFirst);

// router
//     .route('/:user/:application')
//     .get(tokenVerification.tokenVerifie, UserApplicationController.getAppRessourceByApplication);

module.exports = router