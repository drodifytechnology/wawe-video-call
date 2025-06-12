const Chat = require("./chat.model");
const ChatTopic = require("./../chatTopic/chatTopic.model");

const User = require("../user/user.model");
const Host = require("../host/host.model");
const admin = require("../../firebase");

exports.getUserOldChat = async (req, res) => {
  try {
    if (!req.query.user_id || !req.query.topic) return res.status(200).json({ status: false, message: "Invalid details." });

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const chat = await Chat.find({
      user_id: req.query.user_id,
      topic: req.query.topic,
      userChatDelete: false,
    })
      .skip(start)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "success", data: chat });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};
exports.getHostOldChat = async (req, res) => {
  try {
    if (!req.query.host_id || !req.query.topic) return res.status(200).json({ status: false, message: "Invalid details." });

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    const chat = await Chat.find({
      host_id: req.query.host_id,
      topic: req.query.topic,
      hostChatDelete: false,
    })
      .skip(start)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "success", data: chat });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};

exports.store = async (req, res) => {
  try {
    if (!req.body) return res.status(200).json({ status: false, message: "Invalid details." });
    if (!req.body.host_id) return res.status(200).json({ status: false, message: "Host id is Required!" });
    if (!req.body.user_id) return res.status(200).json({ status: false, message: "User id is Required!" });
    if (!req.body.message) return res.status(200).json({ status: false, message: "Message is Required!" });
    if (!req.body.topic) return res.status(200).json({ status: false, message: "Topic is Required!" });
    if (!req.body.sender) return res.status(200).json({ status: false, message: "Sender type is Required!" });

    const [user, host] = await Promise.all([User.findById(req.body.user_id), Host.findById(req.body.host_id)]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not Exist!!" });
    }

    if (!host) {
      return res.status(200).json({ status: false, message: "Host does not Exist!!" });
    }

    const chat = await Chat.create({
      user_id: req.body.user_id,
      host_id: req.body.host_id,
      message: req.body.message,
      topic: req.body.topic,
      sender: req.body.sender,
    });

    await ChatTopic.updateOne({ _id: req.body.topic }, { chat: chat._id });

    if (!chat) {
      throw new Error();
    }

    res.status(200).json({ status: true, message: "success", data: chat });

    const chatData = await Chat.findById(chat._id).populate("user_id host_id");
    if (req.body.sender === "user") {
      const adminPromise = await admin;

      const payload = {
        token: chatData.host_id.fcm_token,
        notification: {
          body: req.body.message,
          title: chatData.user_id.name,
        },
        data: {
          data: JSON.stringify({
            userId: chatData.user_id._id.toString(),
            name: chatData.user_id.name,
            image: chatData.user_id.image,
            notificationType: "chat",
          }),
          type: "Chat",
        },
      };

      if (chatData.host_id.isLogout === false && chatData.host_id.block === false && chatData.host_id.fcm_token !== null) {
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
      const adminPromise = await admin;

      const payload = {
        token: chatData.user_id.fcm_token,
        notification: {
          body: req.body.message,
          title: chatData.host_id.name,
        },

        data: {
          data: JSON.stringify({
            hostId: chatData.host_id._id.toString(),
            name: chatData.host_id.name,
            image: chatData.host_id.image,
            notificationType: "chat",
          }),
          type: "Chat",
        },
      };

      if (chatData.user_id.isLogout === false && chatData.user_id.block === false && chatData.user_id.fcm_token !== null) {
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
    await ChatTopic.updateOne({ _id: req.body.topic }, { chat: chat?._id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "server error" });
  }
};
