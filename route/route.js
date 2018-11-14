var express = require("express");
var router = express.Router();
var SigController = require("../controller/SigController.js");
var SqliteManager = require('../controller/SqliteManager.js')

// ABOUT

router.get("/", SigController);
router.get("/geo_point", SqliteManager.getPoint);
router.get("/geo_arc", SqliteManager.getArc);
router.get("/geo_version", SqliteManager.getVersion);


module.exports = router;