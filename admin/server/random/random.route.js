const express = require("express");
const router = express.Router();

const RandomController = require("./random.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

//get online host thumblist
router.get("/onlinehost", RandomController.onlineHost);

//get live hopst thumb list
router.get("/thumblist", RandomController.liveHost);
router.get("/hostisbusy", RandomController.isHostBusy);
router.get("/hostisonline", RandomController.isHostOnline);

router.get("/random", RandomController.onlineHost);

module.exports = router;
