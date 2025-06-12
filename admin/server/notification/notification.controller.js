const Notification = require("./notification.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const dayjs = require("dayjs");

const { baseURL } = require("../../config");

const admin = require("../../firebase");

//for android user
exports.getUserNotification = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    const [user, notification] = await Promise.all([
      User.findById(req.query.user_id),
      Notification.find({
        user_id: req.query.user_id,
      })
        .skip(start)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    if (!user) return res.status(200).json({ status: false, message: "User does not Exist!!" });

    if (!notification) {
      return res.status(200).json({ status: false, message: "not found" });
    }
    let now = dayjs();

    const notification_ = notification.map((data) => ({
      _id: data._id,
      title: data.title,
      description: data.description,
      type: data.type,
      image: data.image,
      user_id: data.user_id,
      time:
        now.diff(data.createdAt, "minute") <= 60 && now.diff(data.createdAt, "minute") >= 0
          ? now.diff(data.createdAt, "minute") + " minutes ago"
          : now.diff(data.createdAt, "hour") >= 24
          ? now.diff(data.createdAt, "day") + " days ago"
          : now.diff(data.createdAt, "hour") + " hours ago",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      __v: data.__v,
    }));
    return res.status(200).json({ status: true, message: "success", data: notification_ });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

//for host
exports.getHostNotification = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    const [host, notification] = await Promise.all([
      Host.findById(req.query.host_id),
      Notification.find({
        host_id: req.query.host_id,
      })
        .skip(start)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    if (!host) return res.status(200).json({ status: false, message: "Host does not Exist!!" });

    if (!notification) {
      return res.status(200).json({ status: false, message: "not found" });
    }
    let now = dayjs();

    const notification_ = notification.map((data) => ({
      _id: data._id,
      title: data.title,
      description: data.description,
      type: data.type,
      image: data.image,
      host_id: data.host_id,
      time:
        now.diff(data.createdAt, "minute") <= 60 && now.diff(data.createdAt, "minute") >= 0
          ? now.diff(data.createdAt, "minute") + " minutes ago"
          : now.diff(data.createdAt, "hour") >= 24
          ? now.diff(data.createdAt, "day") + " days ago"
          : now.diff(data.createdAt, "hour") + " hours ago",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      __v: data.__v,
    }));
    return res.status(200).json({ status: true, message: "success", data: notification_ });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    if (req.body.type.trim().toLowerCase() === "all") {
      const fcmTokens = await User.find().distinct("fcm_token");

      var payload = {
        tokens: fcmTokens,

        notification: {
          body: req.body.description,
          title: req.body.title,
          image: baseURL + req.file.path,
        },
        data: {
          type: "Notification",
        },
      };

      console.log("payload---------------", payload);
      const adminPromise = await admin;
      adminPromise
        .messaging()
        .sendMulticast(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message:      ", error);
        });
    } else if (req.body.type.trim().toLowerCase() === "join") {
      //today join user
      const user = await User.aggregate([
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            dateString: {
              $eq: new Date().toISOString().slice(0, 10),
            },
          },
        },
      ]);

      await user.map(async (data) => {
        if (data.isLogout === false && data.block === false) {
          const payload = {
            token: data.fcm_token,
            notification: {
              body: req.body.description,
              title: req.body.title,
              image: baseURL + req.file.path,
            },
            data: {
              type: "Notification",
            },
          };

          if (user && user.fcm_token !== null) {
            try {
              const adminPromise = await admin;
              console.log("admin---------------", admin);
              const response = await adminPromise.messaging().send(payload);
              console.log("Successfully sent message:", response);
            } catch (error) {
              console.log("Error sending message:", error);
            }
          }
        }
      });
    } else if (req.body.type.trim().toLowerCase() === "paid") {
      const user = await User.find({
        isVIP: true,
        plan_start_date: { $ne: null },
        block: false,
        isLogout: false,
      });

      console.log("user in paid type:  ", user);
      console.log("user in paid type user.length:  ", user.length);

      if (user.length === 0) {
        res.status(200).json({
          status: false,
          message: "user does not found with type paid",
          data: false,
        });
      }

      await user.map(async (data) => {
        const payload = {
          token: data?.fcm_token,
          notification: {
            body: req.body.description,
            title: req.body.title,
            image: baseURL + req.file.path,
          },
          data: {
            type: "Notification",
          },
        };
        console.log("payload---------------", payload);
        if (user && user.fcm_token !== null) {
          try {
            const adminPromise = await admin;
            console.log("admin---------------", admin);
            const response = await adminPromise.messaging().send(payload);
            console.log("Successfully sent message:", response);
          } catch (error) {
            console.log("Error sending message:", error);
          }
        }
      });
    } else if (req.body.type.trim().toLowerCase() === "online") {
      const user = await User.find({
        isOnline: true,
        block: false,
      });

      console.log("user in paid type:  ", user);
      console.log("user in paid type user.length:  ", user.length);

      if (user.length === 0) {
        res.status(200).json({
          status: false,
          message: "user does not found with type paid",
          data: false,
        });
      }

      await user.map(async (data) => {
        const payload = {
          token: data?.fcm_token,
          notification: {
            body: req.body.description,
            title: req.body.title,
            image: baseURL + req.file.path,
          },
          data: {
            type: "Notification",
          },
        };
        console.log("payload---------------", payload);
        if (user && user.fcm_token !== null) {
          try {
            const adminPromise = await admin;
            console.log("admin---------------", admin);
            const response = await adminPromise.messaging().send(payload);
            console.log("Successfully sent message:", response);
          } catch (error) {
            console.log("Error sending message:", error);
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

exports.profileVisitNotification = async (req, res) => {
  try {
    if (req.body.user_id && req.body.host_id) {
      const [user, host] = await Promise.all([User.findById(req.body.user_id), Host.findById(req.body.host_id)]);

      if (!user) return res.status(200).json({ status: false, message: "User does not Exist!!" });

      if (!host) return res.status(200).json({ status: false, message: "Host does not Exist!!" });

      const notification = await Notification.create({
        title: "You got New Visitor",
        description: `${user.name} Visited your Profile.`,
        type: "follow",
        image: user.image,
        host_id: req.body.host_id,
      });
      res.status(200).json({ status: true, message: "Success!!" });

      const payload = {
        token: host.fcm_token,
        notification: {
          body: `${user.name} Visited your Profile.`,
        },
        data: {
          data: JSON.stringify({}),
          type: "ProfileVisit",
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
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//call missCall notification
exports.missCallNotification = async (req, res) => {
  try {
    if (req.body.user_id && req.body.host_id) {
      const [user, host] = await Promise.all([User.findById(req.body.user_id), Host.findById(req.body.host_id)]);

      if (!user) return res.status(200).json({ status: false, message: "User does not Exist!!" });

      if (!host) return res.status(200).json({ status: false, message: "Host does not Exist!!" });

      const payload = {
        token: host.fcm_token,
        notification: {
          title: "Missed call",
          body: `${user.name}`,
        },
        data: {
          type: "MissedCall",
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
      return res.status(200).json({ status: true, message: "Success!!" });
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};
