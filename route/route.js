var express = require("express");
var router = express.Router();
var SigController = require("../controller/SigController.js");
var SqliteManager = require("../controller/SqliteManager.js");
var DijkstraController = require("../controller/DijkstraController.js");

// ABOUT

router.get("/", SigController.template);
router.get("/table", SigController.createTable);
router.get("/parcourLargeur", SigController.parcourLargeur);
router.get("/dijkstra", DijkstraController.dijkstra);
router.get("/allBus", DijkstraController.getAllLigne);
router.get("/arcBusLigne", DijkstraController.showBusLigne)
router.get("/geo_point", SqliteManager.getPoint);
router.get("/geo_arc", SqliteManager.getArc);
router.get("/geo_version", SqliteManager.getVersion);

module.exports = router;
