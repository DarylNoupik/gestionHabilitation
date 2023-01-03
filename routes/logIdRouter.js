const express = require("express");
const router = express.Router();
const tokenVerification = require("../middlewares/tokenVerification")
const validate = require('../middlewares/validation');
const { LogIdValidation } = require('../validations/index');
const { LogIdController } = require("../controllers/index")

// Login
router
    .route('/')
    .get(tokenVerification.tokenVerifie, LogIdController.getFirst);

module.exports = router;