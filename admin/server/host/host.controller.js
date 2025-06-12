const Host = require("./host.model");
const Follower = require("../userFollower/userFollower.model");
const Notification = require("../notification/notification.model");
const Country = require("../country/country.model");
const History = require("../history/history.model");
const Level = require("../level/level.model");
const setting = require("../../setting");
const User = require("../user/user.model");
const Agency = require("../agency/agency.model");
const CallHistory = require("../callHistory/callHistory.model");
const LiveStreamingHistory = require("../liveStreamingHistory/liveStreamingHistory.model");
const LoginHistory = require("./loginHistory.model");
const hostFollower = require("../hostFollower/hostFollower.model");

const { deleteFile } = require("../../util/deleteFile");
const fs = require("fs");
const shuffleArray = require("../../util/shuffle");
const { baseURL } = require("../../config");

const mongoose = require("mongoose");

//encrypt decrypt
const Cryptr = require("cryptr");
const crypt = new Cryptr("myTotalySecretKey");

const admin = require("../../firebase");

//get list of host
exports.index = async (req, res) => {
  try {
    const host = await Host.find().populate("agencyId").sort({ createdAt: -1 });

    if (!host) {
      throw new Error();
    }

    await host.map((host) => {
      host.password = crypt.decrypt(host.password);
    });

    return res.status(200).json({ status: true, message: "Success", data: host });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Server Error",
    });
  }
};

//get agency wise host count and total earning [for main admin]
exports.agencyWiseHostCount = async (req, res) => {
  try {
    const matchQuery = {
      _id: { $ne: new mongoose.Types.ObjectId("644b6ae7bb20ea6dd3dc7495") }, //demo agency _id for demo host
    };

    const agency = await Agency.find(matchQuery);

    let agencyData = [];
    for (var i = 0; i < agency.length; i++) {
      const count = await Host.find({
        agencyId: agency[i]._id,
      }).countDocuments();

      agencyData.push({
        _id: agency[i]._id,
        name: agency[i].name,
        count: count || 0,
        earningCoin: agency[i].totalCoin,
        createdAt: agency[i].createdAt,
        updatedAt: agency[i].updatedAt,
      });
    }

    console.log("agency data length:  ", agencyData.length);

    return res.status(200).json({ status: true, message: "Success!!", data: agencyData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//get list of host agency wise
exports.agencyWiseHost = async (req, res) => {
  try {
    const host = await Host.find({ agencyId: req.params.agency_id }).populate("agencyId").sort({ createdAt: -1 });

    if (!host) {
      throw new Error();
    }
    //TotalLoginTime  startLoginTime
    const endTime = new Date();
    await host.map((host) => {
      host.password = crypt.decrypt(host.password);
      if (host.startLoginTime) {
        const timeDifference = endTime - host.startLoginTime; // Difference in milliseconds
        const totalMinutes = timeDifference / (1000 * 60);
        host.TotalLoginTime += parseInt(totalMinutes);
      }
    });

    return res.status(200).json({ status: true, message: "Success", data: host });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Server Error",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const host = await Host.findById(req.query.host_id);
    if (!host) return res.status(200).json({ status: false, message: "Host not Found" });
    return res.status(200).json({ status: true, message: "Success!!", host });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};


exports.hostProfile = async (req, res) => {
  try {
    const host = await Host.findById(req.query.host_id).populate('agencyId');
    if (!host) return res.status(200).json({ status: false, message: "Host not Found" });

    host.password = crypt.decrypt(host.password);

    return res.status(200).json({ status: true, message: "Success!!", host });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.addTrueFollowerCount = async (req, res) => {
  try {
    const [host, follower, following] = await Promise.all([
      Host.findById(req.query.host_id),
      Follower.countDocuments({
        host_id: req.query.host_id,
      }),
      hostFollower.countDocuments({
        host_id: req.query.host_id,
      }),
    ]);
    if (!host) return res.status(200).json({ status: false, message: "Host not Found" });

    host.followers_count = follower;
    host.following_count = following;

    await host.save();

    return res.status(200).json({ status: true, message: "Success!!", host });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

exports.otherUserProfile = async (req, res) => {
  try {
    if (!req.query?.host_id || !req.query?.user_id) return res.status(200).json({ status: false, message: "Host not Found" });

    const [host, user] = await Promise.all([Host.findById(req.query.host_id), User.findById(req.query?.user_id)]);

    const isFollow = await hostFollower.exists({
      host_id: host._id,
      user_id: user._id,
    });

    console.log("isFollow", isFollow);
    console.log("user", user);
    console.log("host", host);

    if (!host) return res.status(200).json({ status: false, message: "Host not Found" });

    if (!user) return res.status(200).json({ status: false, message: "User not Found" });

    return res.status(200).json({ status: true, message: "Success!!", isFollow, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//create host
exports.store = async (req, res) => {
  try {
    if (!req.body.name) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Name is required." });
    }

    if (!req.file) return res.status(200).json({ status: false, message: "Please select an Image" });

    if (!req.body.username) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Username is required." });
    }
    if (!req.body.hostId) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: "host Id is required." });
    }
    if (!req.body.password) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: "password is required." });
    }
    if (!req.body.bio) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: "bio is required." });
    }
    if (!req.body.agencyId) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: "agency Id is required." });
    }

    let [isHostExist, country] = await Promise.all([Host.findOne({ hostId: req.body.hostId }), Country.find({ name: "INDIA" })]);

    if (isHostExist) return res.status(200).json({ status: false, message: "Host Id already Exist!" });

    const host = new Host();

    host.hostId = req.body.hostId;
    host.password = crypt.encrypt(req.body.password);
    host.name = req.body.name;
    host.image = baseURL + req.file.path;
    host.username = req.body.username;

    //host country add  //default india add
    if (country.length === 0) {
      country = new Country();
      country.name = "INDIA";
      await country.save();
      host.hostCountry = country._id;
    } else {
      host.hostCountry = country[0]._id;
    }

    host.bio = req.body.bio;
    host.agencyId = req.body.agencyId;
    host.uniqueId = Math.floor(Math.random() * (99999999 - 11111111)) + 11111111;

    await host.save();

    const data = await Host.findById(host._id).populate("agencyId");
    data.password = crypt.decrypt(data.password);

    return res.status(200).json({ status: true, message: "success", host: data });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//for Android
exports.updateProfile = async (req, res) => {
  try {
    const host = await Host.findById(req.body.host_id);
    if (!host) {
      if (req.file) {
        deleteFile(req.file);
      }
      return res.status(200).json({ status: false, message: "host not found" });
    }

    if (req.file) {
      var image_ = host.image?.split("storage");
      if (image_ && image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }
      host.image = baseURL + req.file.path;
    }

    if (req.body.name) {
      host.name = req.body.name;
    }
    if (req.body.username) {
      host.username = req.body.username;
    }
    if (req.body.bio) {
      host.bio = req.body.bio;
    }
    // if (req.body.rate) {
    //   host.rate = req.body.rate;
    // }

    await host.save();

    return res.status(200).json({ status: true, message: "success", host });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file);
    }
    console.log(error);
    return res.status(500).json({ error: error.message || "server error" });
  }
};

//update host
exports.update = async (req, res) => {
  try {
    const [host, isHostExist] = await Promise.all([
      Host.findById(req.params?.host_id),
      Host.findOne({
        _id: { $ne: req.params?.host_id },
        hostId: req.body.hostId,
      }),
    ]);

    if (!host) {
      if (req.file) {
        deleteFile(req?.file);
      }
      return res.status(200).json({ status: false, message: "Host not Found!!" });
    }

    if (isHostExist) {
      if (req.file) {
        deleteFile(req.file);
      }
      return res.status(200).json({ status: false, message: "Host Id already Exist!!" });
    }

    host.hostId = req.body.hostId;
    host.password = crypt.encrypt(req.body.password);
    host.name = req.body.name;
    if (req.file) {
      var image_ = host.image?.split("storage");
      if (image_ && image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }
      host.image = baseURL + req.file.path;
    }
    host.username = req.body.username;
    host.bio = req.body.bio;
    host.agencyId = req.body.agencyId ? req.body.agencyId : host.agencyId;

    await host.save();

    const data = await Host.findById(host._id).populate("agencyId");
    data.password = crypt.decrypt(data.password);

    return res.status(200).json({ status: true, message: "success", host: data });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//host login
exports.login = async (req, res) => {
  try {
    if (!req.body.hostId) return res.status(200).json({ status: false, message: "host Id is required." });
    if (!req.body.password) return res.status(200).json({ status: false, message: "password is required." });
    if (!req.body.fcmtoken) return res.status(200).json({ status: false, message: "fcm token is required." });
    if (!req.body.IPAddress) return res.status(200).json({ status: false, message: "IPAddress is required." });
    if (!req.body.country) return res.status(200).json({ status: false, message: "country is required." });

    const host = await Host.findOne({ hostId: req.body.hostId });
    if (!host) return res.status(200).json({ status: false, message: "Host Id is not Valid!!" });
    if (crypt.decrypt(host.password) !== req.body.password) return res.status(200).json({ status: false, message: "Password Not match!!" });
    const agency = await Agency.findById(host.agencyId);
    if (agency.isDisable) return res.status(200).json({ status: false, message: "Agency is Disabled !!" });
    if (host.block) {
      return res.status(200).json({ status: false, message: "You are blocked by admin!" });
    }

    host.fcm_token = req.body.fcmtoken;
    host.IPAddress = req.body.IPAddress;
    host.country = req.body.country;
    host.startLoginTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    host.isLogout = false;
    host.isOnline = false;
    host.isLive = false;
    host.isBusy = false;
    host.identity = req.body.identity;

    await host.save();
    const loginHistory = new LoginHistory();
    loginHistory.host_id = host._id;
    loginHistory.startTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    await loginHistory.save();
    return res.status(200).json({ status: true, message: "Success!!", host });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//host demo login
exports.demoLogin = async (req, res) => {
  try {
    if (!req.body.hostId) return res.status(200).json({ status: false, message: "host Id is required." });
    if (!req.body.password) return res.status(200).json({ status: false, message: "password is required." });

    const host = await Host.findOne({ hostId: "9876543210" });
    if (!host) {
      return res.status(200).json({ status: false, message: "Host Id does not found!" });
    }

    if (host.block) {
      return res.status(200).json({ status: false, message: "You are blocked by admin!" });
    }

    if (crypt.decrypt(host.password) !== "9876543210") return res.status(200).json({ status: false, message: "Password Not match!!" });

    host.fcm_token = req.body.fcmToken;
    host.isLogout = false;
    await host.save();

    return res.status(200).json({
      status: true,
      message: "Success",
      host: host,
      isdemoLogin: true,
    });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res.status(500).json({ status: false, error: error.message || "Internal server error" });
  }
};

//block unblock host
exports.blockUnblockHost = async (req, res) => {
  try {
    const host = await Host.findById(req.params.host_id);
    if (!host) {
      return res.status(200).json({ status: false, message: "host not found" });
    }

    host.block = !host.block;
    await host.save();

    return res.status(200).json({ status: true, message: "success", data: host });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//host is online
exports.hostIsOnline = async (req, res) => {
  try {
    if (req.body.host_id && req.body.token && req.body.channel && req.body.country) {
      const host = await Host.findById(req.body.host_id);

      if (!host) {
        return res.status(200).json({ status: false, message: "Host not Found!" });
      }

      if (!host.hostCountry) {
        const country = await Country.find({
          name: req.body.country.trim().replace(/\s+/g, " ").toUpperCase(),
        });

        if (country.length === 0) {
          const country = new Country();
          country.name = req.body.country?.trim().replace(/\s+/g, " ").toUpperCase();
          await country.save();
          host.hostCountry = country._id;
        } else {
          host.hostCountry = country[0]._id;
        }
      }
      host.isOnline = true;
      host.isBusy = false;
      host.isLive = false;
      host.token = req.body.token;
      host.channel = req.body.channel;

      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//host is live
exports.hostIsLive = async (req, res) => {
  try {
    if (req.body.host_id && req.body.token && req.body.channel && req.body.country) {
      const [host, country, followers] = await Promise.all([
        Host.findById(req.body.host_id),
        Country.find({
          name: req.body?.country?.trim().replace(/\s+/g, " ").toUpperCase(),
        }),
        Follower.find({
          host_id: req.body.host_id,
        }).populate("user_id host_id"),
      ]);

      if (!host) {
        return res.status(200).json({ status: false, message: "Host not Found!" });
      }

      if (!host.hostCountry) {
        if (country.length === 0) {
          const country = new Country();
          country.name = req.body.country.trim().replace(/\s+/g, " ").toUpperCase();
          await country.save();
          host.hostCountry = country._id;
        } else {
          host.hostCountry = country[0]._id;
        }
      }

      host.isOnline = false;
      host.isLive = true;
      host.token = req.body.token;
      host.channel = req.body.channel;
      await host.save();

      res.status(200).json({ status: true, message: "Success" });

      followers.map(async (data) => {
        const notification = new Notification();

        notification.title = `${data.host_id.name} is live`;
        notification.description = data.host_id.username;
        notification.type = "live";
        notification.image = data.host_id.image;
        notification.user_id = data.user_id._id;

        await notification.save();

        if (data.user_id.isLogout === false && data.user_id.block === false) {
          const payload = {
            token: data.user_id.fcm_token,
            notification: {
              body: `${data.host_id.name} is Live Now`,
            },
            data: {
              data: JSON.stringify({
                image: host.image,
                host_id: host._id.toString(),
                name: host.name,
                country_id: host.hostCountry.toString(),
                type: "real",
                coin: host.coin.toString(),
                token: host.token,
                channel: host.channel,
                view: "0",
                notificationType: "live",
              }),
              type: "Live",
            },
          };

          if (data.user_id.fcm_token !== null) {
            const adminPromise = await admin;
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
      });
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//host is offline
exports.hostIsOffline = async (req, res) => {
  try {
    if (req.query.host_id) {
      const host = await Host.findById(req.query.host_id);

      if (!host) {
        return res.status(200).json({ status: false, message: "Host not Found!" });
      }

      const country = await Country.findById(host.hostCountry);

      if (country) {
        const host = await Host.find({
          hostCountry: country._id,
          _id: { $ne: req.query.host_id },
        }).countDocuments();

        if (host === 0) {
          const country_ = await Country.findById(country._id);
          if (country_) {
            country_.deleteOne();
          }
        }
      }

      host.isOnline = false;
      host.isLive = false;
      host.isBusy = false;
      host.token = null;
      host.channel = null;
      // host.hostCountry = null;

      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//remove host from live
exports.hostIsUnLive = async (req, res) => {
  try {
    if (req.query.host_id) {
      const host = await Host.findById(req.query.host_id);

      if (!host) {
        return res.status(200).json({ status: false, message: "Host not Found!" });
      }

      host.isBusy = false;
      host.isLive = false;
      host.liveStreamingHistoryId = null;
      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//host is busy (connect call)
exports.hostIsBusy = async (req, res) => {
  try {
    if (req.query.host_id) {
      const host = await Host.findById(req.query.host_id);

      if (!host) {
        return res.status(200).json({ status: false, message: "Host not Found!" });
      }

      if (!host.isOnline) {
        return res.status(200).json({ status: false, message: "Host is not online!" });
      }

      host.isBusy = true;

      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//host is free (disconnect call)
exports.hostIsFree = async (req, res) => {
  try {
    if (req.query.host_id) {
      const host = await Host.findById(req.query.host_id);

      if (!host) {
        return res.status(200).json({ status: false, message: "Host not Found!" });
      }

      if (!host.isOnline) {
        return res.status(200).json({ status: false, message: "Host is not online!" });
      }

      host.isBusy = false;

      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//random host for match [android]
exports.randomHost = async (req, res) => {
  try {
    const host = await Host.aggregate([{ $match: { isOnline: true, isBusy: false } }, { $sample: { size: 1 } }]);
    console.log("host >>>>>", host);
    if (!host.length > 0) {
      return res.status(200).json({ status: false, message: "No one is Online !" });
    }
    return res.status(200).json({ status: true, message: "Success", host: host[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//analytic of earning report of gift and call [for admin]
exports.callGiftAnalytic = async (req, res) => {
  try {
    const [history, callHistory] = await Promise.all([
      History.aggregate([
        {
          $match: {
            host_id: mongoose.Types.ObjectId(req.params.host_id),
            plan_id: { $eq: null },
          },
        },
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                dateString: {
                  $gte: req.query.start,
                  $lte: req.query.end,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users", // Assuming your users collection is named "users"
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]),
      CallHistory.aggregate([
        {
          $match: {
            host_id: mongoose.Types.ObjectId(req.params.host_id),
            time: { $ne: null },
            coin: { $ne: 0 },
          },
        },
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                dateString: {
                  $gte: req.query.start,
                  $lte: req.query.end,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users", // Assuming your users collection is named "users"
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]),
    ]);

    let historyData = [];
    let totalGiftCoin = 0;

    await history.map((data) => {
      totalGiftCoin += data.coin;
      historyData.push({
        type: data.user_id ? "Gift" : "Bonus",
        name: data.user_id ? data.user_id.name : "By Admin",
        time: 0,
        image: data.user_id ? data.user_id.image : "",
        coin: data.coin,
        date: data.createdAt,
      });
    });

    const calHistoryData = [];
    let totalCallCoin = 0;

    await callHistory.map((data) => {
      totalCallCoin += data.coin;
      calHistoryData.push({
        type: "Call",
        name: data.user_id ? data.user_id.name : "",
        image: data.user_id ? data.user_id.image : "",
        time: data.time,
        coin: data.coin,
        gift: data.gift.length,
        date: data.createdAt,
      });
    });

    const analytic = calHistoryData.concat(historyData);

    return res.status(200).json({
      status: true,
      message: "Success!!",
      data: analytic,
      totalCoin: { totalCallCoin, totalGiftCoin },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//analytic of earning report of live streaming [for admin]
exports.liveStreamingAnalytic = async (req, res) => {
  try {
    const liveStreamingHistory = await LiveStreamingHistory.aggregate([
      {
        $match: {
          host_id: mongoose.Types.ObjectId(req.params.host_id),
          time: { $ne: null },
          coin: { $ne: 0 },
        },
      },
      {
        $addFields: {
          dateString: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              dateString: {
                $gte: req.query.start,
                $lte: req.query.end,
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    let historyData = [];
    let totalCoin = 0;
    await liveStreamingHistory.map((data) => {
      totalCoin += data.coin;
      historyData.push({
        time: data.time,
        user: data.user,
        gift: data.gift,
        coin: data.coin,
        date: data.createdAt,
      });
    });

    return res.status(200).json({
      status: true,
      message: "Success!!",
      data: historyData,
      totalCoin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//get level of host
exports.getLevel = async (req, res) => {
  try {
    const [host, level] = await Promise.all([
      Host.findById(req.query.host_id),
      Level.find({ type: { $in: ["host"] } }).sort({
        rupee: 1,
      }),
    ]);

    if (!host) return res.status(200).json({ status: false, message: "Host does not Exist!!" });

    let temp = level.length > 0 && level[0].name;
    await level.map(async (data) => {
      if (data.rupee <= host.receivedCoin) {
        return (temp = data.name);
      }
    });

    return res.status(200).json({ status: true, level: temp, levels: level });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//add extra bonus in host by admin
exports.bonusSwitch = async (req, res) => {
  try {
    const host = await Host.findById(req.params.host_id);

    if (!host) return res.status(200).json({ status: false, message: "Host does not Exist!!" });

    if (host.bonusSwitch) {
      host.bonusSwitch = false;
    } else {
      host.coin += setting.bonus;

      if (setting.bonus > 0) {
        const history = new History();

        history.user_id = null;
        history.host_id = req.params.host_id;
        history.coin = setting.bonus;
        await history.save();
      }
      host.bonusSwitch = true;

      await host.save();

      res.status(200).json({ status: true, message: "Success!!", data: host });

      if (host.isLogout === false && host.block === false) {
        const payload = {
          token: host.fcm_token,
          notification: {
            title: `Hello, ${host.name}`,
            body: `You got ${setting.bonus} coin Reward from Admin!!`,
          },
          data: {
            type: "Bonus",
          },
        };

        if (host.fcm_token !== null) {
          const adminPromise = await admin;
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
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//get analytic of streaming, gift and video call for android
exports.hostAnalytic = async (req, res, next) => {
  try {
    let totalGiftCoin = 0;
    let totalCallCoin = 0;
    let totalDuration = 0;
    let totalLiveStreamingCoin = 0;
    let totalLiveStreamingDuration = 0;

    const giftFilter = {
      host_id: mongoose.Types.ObjectId(req.query.host_id),
      coin: { $ne: 0 },
      plan_id: null,
    };

    const callFilter = {
      host_id: mongoose.Types.ObjectId(req.query.host_id),
      coin: { $ne: 0 },
      time: { $ne: null },
    };

    const liveStreamingFilter = {
      host_id: mongoose.Types.ObjectId(req.query.host_id),
      coin: { $ne: 0 },
      time: { $ne: null },
    };

    let [host, giftHistory, callHistory, liveStreamingHistory] = await Promise.all([
      History.find({ host_id: req.query.host_id }),
      History.aggregate([
        { $match: giftFilter },
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                dateString: {
                  $gte: req.query.start,
                  $lte: req.query.end === "null" ? req.query.start : req.query.end,
                },
              },
            ],
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]),
      CallHistory.aggregate([
        { $match: callFilter },
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                dateString: {
                  $gte: req.query.start,
                  $lte: req.query.end === "null" ? req.query.start : req.query.end,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            timeInSeconds: {
              $sum: [
                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$time", ":"] }, 0] } }, 3600] }, // Hours to seconds
                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$time", ":"] }, 1] } }, 60] }, // Minutes to seconds
                { $toInt: { $arrayElemAt: [{ $split: ["$time", ":"] }, 2] } }, // Seconds
              ],
            },
          },
        },
        {
          $group: {
            _id: "$host_id",
            totalCallCoin: { $sum: "$coin" },
            totalTimeInSeconds: { $sum: "$timeInSeconds" },
          },
        },
        {
          $addFields: {
            hours: { $floor: { $divide: ["$totalTimeInSeconds", 3600] } },
            minutes: { $mod: [{ $floor: { $divide: ["$totalTimeInSeconds", 60] } }, 60] },
            seconds: { $mod: ["$totalTimeInSeconds", 60] },
          },
        },
        {
          $addFields: {
            totalDuration: {
              $concat: [
                { $cond: { if: { $lte: ["$hours", 9] }, then: { $concat: ["0", { $toString: "$hours" }] }, else: { $toString: "$hours" } } },
                ":",
                { $cond: { if: { $lte: ["$minutes", 9] }, then: { $concat: ["0", { $toString: "$minutes" }] }, else: { $toString: "$minutes" } } },
                ":",
                { $cond: { if: { $lte: ["$seconds", 9] }, then: { $concat: ["0", { $toString: "$seconds" }] }, else: { $toString: "$seconds" } } },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            host_id: "$_id",
            totalCallCoin: 1,
            totalDuration: 1,
          },
        },
      ]),
      LiveStreamingHistory.aggregate([
        { $match: liveStreamingFilter },
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                dateString: {
                  $gte: req.query.start,
                  $lte: req.query.end === "null" ? req.query.start : req.query.end,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            timeInSeconds: {
              $sum: [
                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$time", ":"] }, 0] } }, 3600] }, // Hours to seconds
                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$time", ":"] }, 1] } }, 60] }, // Minutes to seconds
                { $toInt: { $arrayElemAt: [{ $split: ["$time", ":"] }, 2] } }, // Seconds
              ],
            },
          },
        },
        {
          $group: {
            _id: "$host_id",
            totalLiveStreamingCoin: { $sum: "$coin" },
            totalTimeInSeconds: { $sum: "$timeInSeconds" },
          },
        },
        {
          $addFields: {
            hours: { $floor: { $divide: ["$totalTimeInSeconds", 3600] } },
            minutes: { $mod: [{ $floor: { $divide: ["$totalTimeInSeconds", 60] } }, 60] },
            seconds: { $mod: ["$totalTimeInSeconds", 60] },
          },
        },
        {
          $addFields: {
            totalDuration: {
              $concat: [
                { $cond: { if: { $lte: ["$hours", 9] }, then: { $concat: ["0", { $toString: "$hours" }] }, else: { $toString: "$hours" } } },
                ":",
                { $cond: { if: { $lte: ["$minutes", 9] }, then: { $concat: ["0", { $toString: "$minutes" }] }, else: { $toString: "$minutes" } } },
                ":",
                { $cond: { if: { $lte: ["$seconds", 9] }, then: { $concat: ["0", { $toString: "$seconds" }] }, else: { $toString: "$seconds" } } },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            host_id: "$_id",
            totalLiveStreamingCoin: 1,
            totalDuration: 1,
          },
        },
      ]),
    ]);

    console.log(liveStreamingHistory[0]?.totalLiveStreamingCoin);

    if (!host) {
      return res.status(200).json({ status: false, message: "Host does not Exist!!" });
    }

    giftHistory.forEach((data) => {
      totalGiftCoin += data.coin;
    });

    return res.status(200).json({
      status: true,
      message: "Success",
      totalGift: giftHistory.length,
      totalGiftCoin,
      totalCallCoin: callHistory[0].totalCallCoin || 0,
      totalCallDuration: callHistory[0].totalDuration || "00:00:00",
      totalLiveStreamingCoin: liveStreamingHistory[0]?.totalLiveStreamingCoin || 0,
      totalLiveStreamingDuration: liveStreamingHistory[0]?.totalDuration || "00:00:00",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const host = await Host.findById(req.query.host_id);
    if (!host) {
      return res.status(200).json({ status: false, message: "host not found" });
    }

    host.isLogout = true;
    res.status(200).json({ status: true, message: "success" });

    try {
      if (host.startLoginTime) {
        const endTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const timeDifference = new Date(endTime) - new Date(host.startLoginTime); // Difference in milliseconds
        const totalMinutes = timeDifference / (1000 * 60); //in minutes
        host.startLoginTime = null;
        host.TotalLoginTime += parseInt(totalMinutes);

        const loginHistory = await LoginHistory.findOne({
          host_id: host?._id,
        }).sort({
          createdAt: -1,
        });
        if (loginHistory && loginHistory.startTime && !loginHistory.endTime) {
          loginHistory.endTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          const timeDifference = new Date(loginHistory.endTime) - new Date(loginHistory.startTime); ////  milliseconds
          const hours = Math.floor(timeDifference / (1000 * 60 * 60));
          const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
          const formattedDifference = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
          loginHistory.duration = formattedDifference;
          await loginHistory.save();
        }
      }
    } catch (error) {
      console.log("error in logout : ", error);
    }
    await host.save();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message || "server error" });
  }
};

exports.loginHistory = async (req, res) => {
  try {
    const [host, loginHistory] = await Promise.all([
      Host.findById(req.query.host_id),
      LoginHistory.find({
        host_id: req.query.host_id,
      }).sort({
        createdAt: -1,
      }),
    ]);

    if (!host) {
      return res.status(200).json({ status: false, message: "host not found" });
    }

    return res.status(200).json({ status: true, message: "success", loginHistory });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message || "server error" });
  }
};

// online for penal
exports.fcm_token = async (req, res) => {
  try {
    if (!req?.query?.Id || !req?.query?.type || !req?.query.fcm_token) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }
    if (req?.query?.type == "user") {
      const user = await User.findById(req?.query?.Id);
      if (user) {
        user.fcm_token = req?.query.fcm_token;
        await user.save();
      }
    } else {
      const host = await Host.findById(req?.query?.Id);
      if (host) {
        host.fcm_token = req?.query.fcm_token;
        await host.save();
      }
    }
    return res.status(200).send({ status: true, message: "success!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error || "Internal server error" });
  }
};
