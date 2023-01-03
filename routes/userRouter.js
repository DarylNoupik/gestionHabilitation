const express = require("express");
const router = express.Router();
const tokenVerification = require("../middlewares/tokenVerification")
const validate = require('../middlewares/validation');
const { UserValidation } = require('../validations/index');
const { UserController } = require("../controllers/index");

// Login
router
    .route('/back/:view')
    .get(tokenVerification.tokenVerifie, UserController.back);

router
    .route('/view/:view')
    .get(tokenVerification.tokenVerifie, UserController.getFirst)
    .post(tokenVerification.tokenVerifie, validate(UserValidation.save), UserController.save);

router
    .route('/resetPassword/:view/:id')
    .get(tokenVerification.tokenVerifie, UserController.resetPassword);

router
    .route('/putAdmin/:view/:id')
    .get(tokenVerification.tokenVerifie, UserController.putAdmin);

router
    .route('/removeAdmin/:view/:id')
    .get(tokenVerification.tokenVerifie, UserController.removeAdmin);

router
    .route('/remove/:page/:limit')
    .get(tokenVerification.tokenVerifie, validate(UserValidation.getWithPagination), UserController.getUsersSuspendedWithPagination);

router
    .route('/removeOne/:view/:id')
    .get(tokenVerification.tokenVerifie, UserController.remove);

router
    .route('/restort/:id')
    .get(tokenVerification.tokenVerifie, UserController.restort);

router
    .route('/edit/:view')
    .post(tokenVerification.tokenVerifie, validate(UserValidation.edit), UserController.edit);
    
router
    .route('/search/:view')
    .post(tokenVerification.tokenVerifie, validate(UserValidation.search), UserController.search);

router
    .route('/searchRemove')
    .post(tokenVerification.tokenVerifie, validate(UserValidation.search), UserController.searchRemove);

router
    .route('/userInfo/:id')
    .get(tokenVerification.tokenVerifie, UserController.userInfo)
    .post(tokenVerification.tokenVerifie, validate(UserValidation.saveUserInfo), UserController.saveUserInfo);

router
    .route('/:page/:limit')
    .get(tokenVerification.tokenVerifie, validate(UserValidation.getWithPagination), UserController.getUsersWithPagination);

module.exports = router;