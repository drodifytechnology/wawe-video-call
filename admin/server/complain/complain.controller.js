const Complain = require("./complain.model");
const fs = require("fs");
const User = require("../user/user.model");
const Host = require("../host/host.model");

const Agency = require("../agency/agency.model");
const admin = require('../../firebase')



//store complain
exports.store = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });

    if (!req.body.contact)
      return res
        .status(200)
        .json({ status: false, message: "contact is required" });
    if (!req.body.message)
      return res
        .status(200)
        .json({ status: false, message: "message is required" });

    if (req.body.user_id) {
      const user = await User.findById(req.body.user_id);

      if (!user) {
        return res
          .status(200)
          .json({ status: false, message: "user not found" });
      }
    }
    if (req.body.host_id) {
      const [host, agency] = await Promise.all([
        Host.findById(req.body.host_id),
        Agency.findById(req.body.agency_id),
      ]);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "host not found" });
      }
      if (!agency) {
        return res
          .status(200)
          .json({ status: false, message: "agency not found" });
      }
    }

    const complain = new Complain();
    complain.user_id = req.body.user_id ? req.body.user_id : null;
    complain.host_id = req.body.host_id ? req.body.host_id : null;
    complain.agency_id = req.body.agency_id ? req.body.agency_id : null;
    complain.message = req.body.message;
    complain.contact = req.body.contact;
    complain.image = req.file ? req.file.path : "storage/noImage.png";

    await complain.save((error, complain) => {
      if (error) {
        return res
          .status(500)
          .json({ status: false, error: error.message || "Server Error" });
      } else
        return res.status(200).json({
          status: true,
          message: "Success",
        });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//agency wise complain count
exports.agencyWiseComplainCount = async (req, res) => {
  try {
    if (!req.query.type)
      return res
        .status(200)
        .json({ status: false, message: "Type is Required!" });

    const agency = await Agency.find().select("_id name createdAt updatedAt");

    const promises = agency.map(async (agencyItem) => {
      let count;

      if (req.query.type.trim().toLowerCase() === "pending") {
        count = await Complain.countDocuments({
          agency_id: agencyItem._id,
          solved: false,
        });
      } else if (req.query.type.trim().toLowerCase() === "solved") {
        count = await Complain.countDocuments({
          agency_id: agencyItem._id,
          solved: true,
        });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "type must be passed valid." });
      }

      return {
        count: count,
        _id: agencyItem._id,
        name: agencyItem.name,
        createdAt: agencyItem.createdAt,
        updatedAt: agencyItem.updatedAt,
      };
    });

    const results = await Promise.all(promises);

    return res
      .status(200)
      .json({ status: true, message: "Success", data: results });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get host complain agency wise
exports.agencyWiseHostComplain = async (req, res) => {
  try {
    if (!req.query.type && !req.query.agency_id)
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!" });

    const agency = await Agency.findById(req.query.agency_id);
    if (!agency)
      return res
        .status(200)
        .json({ status: false, message: "Agency does not Exist!!" });

    let complain;
    if (req.query.type.trim().toLowerCase() === "pending") {
      complain = await Complain.find({
        agency_id: req.query.agency_id,
        solved: false,
      }).populate("host_id", "name image coin");
    } else if (req.query.type.trim().toLowerCase() === "solved") {
      complain = await Complain.find({
        agency_id: req.query.agency_id,
        solved: true,
      }).populate("host_id", "name image coin");
    } else {
      return res
        .status(200)
        .json({ status: false, message: "type must be passed valid." });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success", data: complain });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get user complain [for admin]
exports.userComplain = async (req, res) => {
  try {
    if (!req.query.type)
      return res
        .status(200)
        .json({ status: false, message: "Type is Required!" });

    let complain;
    if (req.query.type.trim().toLowerCase() === "pending") {
      complain = await Complain.find({
        agency_id: null,
        host_id: null,
        solved: false,
      }).populate("user_id", "name image coin");
    } else if (req.query.type.trim().toLowerCase() === "solved") {
      complain = await Complain.find({
        agency_id: null,
        host_id: null,
        solved: true,
      }).populate("user_id", "name image coin");
    }

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: complain });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//solve complain
exports.solveComplain = async (req, res) => {
  try {
    const complain = await Complain.findById(req.params.complain_id).populate(
      "user_id host_id"
    );
    if (!complain) {
      return res
        .status(200)
        .json({ status: false, message: "Complain does not Exist!!" });
    }

    complain.solved = !complain.solved;

    await complain.save();

    res.status(200).json({ status: true, message: "success", data: complain });

    if (complain.host_id !== null && complain.agency_id !== null) {
      if (
        complain.host_id.isLogout === false &&
        complain.host_id.block === false
      ) {
        const payload = {
          token: complain.host_id.fcm_token,
          notification: {
            title: `Hello, ${complain.host_id.name}`,
            body: "Your complain has been solved!",
          },
          data: {
            type: "ComplainSolved",
          },
        };
        
        if (complain.host_id.fcm_token !== null){
          const adminPromise = await admin
          adminPromise
            .messaging()
            .send(payload)
            .then(async (response) => {
              console.log("Successfully sent with response: ", response);
            })
            .catch((error) => {
              console.log("Error sending message:      ", error);
            });
        }

      }
    } else if (complain.user_id !== null) {
      if (
        complain.user_id.isLogout === false &&
        complain.user_id.block === false
      ) {
        const payload = {
          token: complain.user_id.fcm_token,
          notification: {
            title: `Hello, ${complain.user_id.name}`,
            body: "Your complain has been solved!",
          },
          data: {
            type: "ComplainSolved",
          },
        };
        if (complain.user_id.fcm_token !== null) {

          const adminPromise = await admin
          adminPromise
            .messaging()
            .send(payload)
            .then(async (response) => {
              console.log("Successfully sent with response: ", response);
            })
            .catch((error) => {
              console.log("Error sending message:      ", error);
            });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//get user complain [for android]
exports.userComplainList = async (req, res) => {
  try {
    if (!req.query.user_id)
      return res
        .status(200)
        .json({ status: false, message: "User id is Required!" });

    const [user, complain] = await Promise.all([
      User.findById(req.query.user_id),
      Complain.find({ user_id: req.query.user_id }).sort({
        createdAt: -1,
      }),
    ]);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!!" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: complain });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get host complain [for android]
exports.hostComplainList = async (req, res) => {
  try {
    if (!req.query.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is Required!" });

    const [host, complain] = await Promise.all([
      Host.findById(req.query.host_id),
      Complain.find({ host_id: req.query.host_id }).sort({
        createdAt: -1,
      }),
    ]);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Host does not Exist!!" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: complain });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};
