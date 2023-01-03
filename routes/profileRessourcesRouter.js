const express = require("express");
const router = express.Router();
const tokenVerification = require("../middlewares/tokenVerification")
const validate = require('../middlewares/validation');
const { ProfileRessourcesValidation } = require('../validations/index');
const { ProfileRessourcesController } = require("../controllers/index")

router
    .route('/back/:id')
    .get(tokenVerification.tokenVerifie, ProfileRessourcesController.back);

router
    .route('/remove/:id/:page/:limit')
    .get(tokenVerification.tokenVerifie, validate(ProfileRessourcesValidation.getWithPagination), ProfileRessourcesController.getSuspendedWithPagination);

router
    .route('/removeOne/:application/:id')
    .get(tokenVerification.tokenVerifie, ProfileRessourcesController.remove);

router
    .route('/restort/:application/:id')
    .get(tokenVerification.tokenVerifie, ProfileRessourcesController.restort);

router
    .route('/edit/:id')
    .post(tokenVerification.tokenVerifie, validate(ProfileRessourcesValidation.edit), ProfileRessourcesController.edit);
    
router
    .route('/search/:id')
    .post(tokenVerification.tokenVerifie, validate(ProfileRessourcesValidation.search), ProfileRessourcesController.search);

router
    .route('/searchRemove/:id')
    .post(tokenVerification.tokenVerifie, validate(ProfileRessourcesValidation.search), ProfileRessourcesController.searchRemove);

router
    .route('/:id')
    .get(tokenVerification.tokenVerifie, ProfileRessourcesController.getFirst)
    .post(tokenVerification.tokenVerifie, validate(ProfileRessourcesValidation.save), ProfileRessourcesController.save);

router
    .route('/:page/:limit')
    .get(tokenVerification.tokenVerifie, validate(ProfileRessourcesValidation.getWithPagination), ProfileRessourcesController.getWithPagination);

module.exports = router;