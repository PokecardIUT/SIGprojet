var express = require("express");
var router = express.Router();
var SigController = require("../controller/SigController.js");

// ABOUT

router.get("/", SigController);

module.exports = router;