const express = require("express");
const router = express.Router();
const tokenVerification = require("../middlewares/tokenVerification")
const validate = require('../middlewares/validation');
const { TypeConnectionValidation } = require('../validations/index');
const { TypeConnectionController } = require("../controllers/index")

// Login
router
    .route('/')
    .get(tokenVerification.tokenVerifie, TypeConnectionController.getFirst)
    .post(tokenVerification.tokenVerifie, validate(TypeConnectionValidation.save), TypeConnectionController.save);

router
    .route('/:page/:limit')
    .get(tokenVerification.tokenVerifie, validate(TypeConnectionValidation.getApplicationWithPagination), TypeConnectionController.getApplicationWithPagination);

router
    .route('/search')
    .post(tokenVerification.tokenVerifie, validate(TypeConnectionValidation.search), TypeConnectionController.search);

router
    .route('/edit')
    .post(tokenVerification.tokenVerifie, validate(TypeConnectionValidation.edit), TypeConnectionController.edit);

module.exports = router;