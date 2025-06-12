const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = require("../../util/multer");

const fakeHostController = require("./fakeHost.controller");

const upload = multer({
  storage,
});

var checkAccessWithSecretKey = require("../../checkAccess");

// router.use(checkAccessWithSecretKey());

router.get("/getAll",fakeHostController.index)
router.post("/",  upload.fields([{ name: 'video' },{ name: 'image' }]), fakeHostController.store);
router.patch("/update/:hostId" ,upload.fields([{ name: 'video' },{ name: 'image' }]),fakeHostController.update)
router.patch("/isOnlineSwitch/:id",fakeHostController.isOnlineSwitch)

module.exports = router;
