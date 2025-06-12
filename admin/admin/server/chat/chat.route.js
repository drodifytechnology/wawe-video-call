const express = require("express");
const router = express.Router();

const ChatController = require("./chat.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

router.post("/add", ChatController.store);
router.get("/userOldChat", ChatController.getUserOldChat);
router.get("/hostOldChat", ChatController.getHostOldChat);

module.exports = router;
