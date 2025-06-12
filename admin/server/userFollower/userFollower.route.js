const express = require("express");
const router = express.Router();

const FollowerController = require("./userFollower.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

router.get("/following", FollowerController.followingList);
router.get("/follower", FollowerController.followerList);
router.get("/follow", FollowerController.follow);
router.get("/unFollow", FollowerController.unFollow);

module.exports = router;
