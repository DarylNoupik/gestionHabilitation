const express = require("express");
const router = express.Router();
const tokenVerification = require("../middlewares/tokenVerification")
const validate = require('../middlewares/validation');
const { ProfileMetierValidation } = require('../validations/index');
const { ProfileMetierController } = require("../controllers/index");

// Login
router
    .route('/removeOne/:id')
    .get(tokenVerification.tokenVerifie, ProfileMetierController.remove);

router
    .route('/restort/:id')
    .get(tokenVerification.tokenVerifie, ProfileMetierController.restort);

router
    .route('/')
    .get(tokenVerification.tokenVerifie, ProfileMetierController.getFirst)
    .post(tokenVerification.tokenVerifie, validate(ProfileMetierValidation.save), ProfileMetierController.save);

router
    .route('/edit')
    .post(tokenVerification.tokenVerifie, validate(ProfileMetierValidation.edit), ProfileMetierController.edit);

router
    .route('/search')
    .post(tokenVerification.tokenVerifie, validate(ProfileMetierValidation.search), ProfileMetierController.search);

router
    .route('/searchRemove')
    .post(tokenVerification.tokenVerifie, validate(ProfileMetierValidation.search), ProfileMetierController.searchRemove);

router
    .route('/application/:id')
    .get(tokenVerification.tokenVerifie, ProfileMetierController.getApplication)
    .post(tokenVerification.tokenVerifie, ProfileMetierController.addApplication);

router
    .route('/application/:profileMetier/:application')
    .get(tokenVerification.tokenVerifie, ProfileMetierController.removeApplication);

router
    .route('/profileRessource/:profileMetier/:application')
    .get(tokenVerification.tokenVerifie, ProfileMetierController.getprofileRessourceByApplication)
    .post(tokenVerification.tokenVerifie, ProfileMetierController.addProfileRessource);

router
    .route('/profileRessource/:profileMetier/:application/:profileRessource')
    .get(tokenVerification.tokenVerifie, ProfileMetierController.removeProfileRessource);
    
router
    .route('/:page/:limit')
    .get(tokenVerification.tokenVerifie, validate(ProfileMetierValidation.getWithPagination), ProfileMetierController.getProfileMetierWithPagination);
    
router
    .route('/remove/:page/:limit')
    .get(tokenVerification.tokenVerifie, validate(ProfileMetierValidation.getWithPagination), ProfileMetierController.getProfileMetierSuspendedWithPagination);

router
    .route('/back')
    .get(tokenVerification.tokenVerifie, ProfileMetierController.back);

module.exports = router;