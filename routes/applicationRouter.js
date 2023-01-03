const express = require("express");
const router = express.Router();
const tokenVerification = require("../middlewares/tokenVerification")
const validate = require('../middlewares/validation');
const { ApplicationValidation } = require('../validations/index');
const { ApplicationController } = require("../controllers/index")

// Login
router
    .route('/back/:view')
    .get(tokenVerification.tokenVerifie, ApplicationController.back);

router
    .route('/view/:view')
    .get(tokenVerification.tokenVerifie, ApplicationController.getFirst)
    .post(tokenVerification.tokenVerifie, validate(ApplicationValidation.save), ApplicationController.save);

router
    .route('/remove/:page/:limit')
    .get(tokenVerification.tokenVerifie, validate(ApplicationValidation.getWithPagination), ApplicationController.getApplicationSuspendedWithPagination);

router
    .route('/removeOne/:view/:id')
    .get(tokenVerification.tokenVerifie, ApplicationController.remove);

router
    .route('/restort/:id')
    .get(tokenVerification.tokenVerifie, ApplicationController.restort);

router
    .route('/edit/:view')
    .post(tokenVerification.tokenVerifie, validate(ApplicationValidation.edit), ApplicationController.edit);
    
router
    .route('/search/:view')
    .post(tokenVerification.tokenVerifie, validate(ApplicationValidation.search), ApplicationController.search);

router
    .route('/searchRemove')
    .post(tokenVerification.tokenVerifie, validate(ApplicationValidation.search), ApplicationController.searchRemove);

router
    .route('/:page/:limit')
    .get(tokenVerification.tokenVerifie, validate(ApplicationValidation.getApplicationWithPagination), ApplicationController.getApplicationWithPagination);

module.exports = router;