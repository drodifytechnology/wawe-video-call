const CallHistory = require("./callHistory.model");
const User = require("../user/user.model");
const mongoose = require("mongoose");
const Host = require("../host/host.model");
const arraySort = require("array-sort");

//create call history when user or host do call
exports.store = async (req, res) => {
  try {
    if (req.body.user_id && req.body.host_id && req.body.type) {
      const [isUserExist, isHostExist] = await Promise.all([User.findById(req.body.user_id), Host.findById(req.body.host_id)]);

      if (!isUserExist) return res.status(200).json({ status: false, message: "User does not Exist!!" });

      if (!isHostExist) return res.status(200).json({ status: false, message: "Host does not Exist!!" });

      if (req.body.type.trim().toLowerCase() == "user") {
        if (isHostExist?.isOnline) {
          if (isHostExist?.isBusy) {
            return res.status(200).json({ status: false, message: "Host is busy !!" });
          }

          const callHistory = await CallHistory.create({
            type: req.body.type.trim().toLowerCase(),
            user_id: req.body.user_id,
            host_id: req.body.host_id,
          });

          const call = await CallHistory.findById(callHistory?._id).populate("user_id", "name image username bio ").populate("host_id", "name image username bio ");
          return res.status(200).json({ status: true, message: "Success!!", callId: call });
        } else {
          return res.status(200).json({ status: false, message: "Host Is Not Online !!" });
        }
      } else {
        console.log("type : ");
        if (isUserExist?.isOnline) {
          const callHistory = new CallHistory();
          callHistory.type = req.body.type.trim().toLowerCase();
          callHistory.user_id = req.body.user_id;
          callHistory.host_id = req.body.host_id;
          await callHistory.save();

          const call = await CallHistory.findById(callHistory?._id).populate("user_id", "name image username bio ").populate("host_id", "name image username bio ");

          return res.status(200).json({ status: true, message: "Success!!", callId: call });
        } else {
          return res.status(200).json({ status: false, message: "User Is Not Online !!" });
        }
      }

      // const host = await Host.find({
      //   isOnline: true,
      //   block: false,
      //   isBusy: false,
      // });

      // if (host?.length > 0) {
      //   const callHistory = new CallHistory();

      //   callHistory.type = req.body.type.trim().toLowerCase();
      //   callHistory.user_id = req.body.user_id;
      //   callHistory.host_id = host[0]?._id;

      //   await callHistory.save();

      //   const call = await CallHistory.findById(callHistory?._id)
      //     .populate("user_id", "name image username bio ")
      //     .populate("host_id", "name image username bio ");
      //   return res
      //     .status(200)
      //     .json({ status: true, message: "Success!!", callId: call });
      // } else {
      //   return res
      //     .status(200)
      //     .json({ status: false, message: "No Any One Is Free" });
      // }
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//receive call
exports.receiveCall = async (req, res) => {
  try {
    if (req.body.callId && req.body.coin) {
      const callHistory = await CallHistory.findById(req.body.callId);

      if (!callHistory) return res.status(200).json({ status: false, message: "Call Id not Found!!" });

      const user = await User.findById(callHistory.user_id);
      if (!user) return res.status(200).json({ status: false, message: "User does not Exist!!" });

      if (user.coin < parseInt(req.body.coin)) {
        return res.status(200).json({ status: false, message: "Insufficient Coin." });
      }

      user.coin -= parseInt(req.body.coin);
      user.spendCoin += parseInt(req.body.coin);
      await user.save();

      const host = await Host.findById(callHistory.host_id);
      if (!host) return res.status(200).json({ status: false, message: "Host does not Exist!!" });
      host.coin += parseInt(req.body.coin);
      host.receivedCoin += parseInt(req.body.coin);
      await host.save();
      callHistory.coin += parseInt(req.body.coin);
      await callHistory.save();

      return res.status(200).json({
        status: true,
        message: "Success!!",
        callId: callHistory._id,
        user,
      });
    } else {
      return res.status(200).json({ status: false, message: "Invalid Details!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//user call history
exports.userCallHistory = async (req, res) => {
  try {
    if (!req.query.user_id) return res.status(200).json({ status: false, message: "User Id is Required!" });
    const callHistory = await CallHistory.find({
      user_id: req.query.user_id,
      userDelete: false,
    })
      .populate("host_id", "image name")
      .sort({ createdAt: -1 })
      .skip(parseInt(req.query?.start))
      .limit(parseInt(req.query?.limit));

    const history = await callHistory.map((data) => ({
      _id: data._id,
      user_id: data.user_id,
      host_id: data.host_id._id,
      image: data.host_id ? data.host_id.image : "",
      name: data.host_id ? data.host_id.name : "",
      coin: data.coin,
      date: data.createdAt,
      time: data.time,
      type: data.type === "user" ? "Outgoing" : data.coin === 0 && data.time === 0 ? "MissedCall" : "Incoming",
    }));

    return res.status(200).json({ status: true, message: "Success!!", CallHistory: history });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//host call history
exports.hostCallHistory = async (req, res) => {
  try {
    if (!req.query.host_id) return res.status(200).json({ status: false, message: "Host Id is Required!" });

    const callHistory = await CallHistory.find({
      host_id: req.query.host_id,
      hostDelete: false,
    })
      .populate("user_id", "image name")
      .sort({ createdAt: -1 })
      .skip(parseInt(req.query?.start))
      .limit(parseInt(req.query?.limit));

    const history = await callHistory
      .map((data) => ({
        _id: data?._id,
        host_id: data?.host_id,
        user_id: data.user_id?._id,
        image: data.user_id ? data.user_id?.image : "",
        name: data.user_id ? data.user_id?.name : "",
        coin: data?.coin,
        date: data?.createdAt,
        time: data?.time,
        type: data?.type === "host" ? "Outgoing" : data?.coin === 0 && data?.time === 0 ? "MissedCall" : "Incoming",
      }))
      .filter((data) => data?.user_id !== null);

    return res.status(200).json({ status: true, message: "Success!!", CallHistory: history });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//host call history
exports.delete = async (req, res) => {
  try {
    if (!req.query.Id || !req.query.type) return res.status(200).json({ status: false, message: "Host Id is Required!" });
    if (req.query.type == "host") {
      await CallHistory.updateMany({ host_id: req.query.Id, hostDelete: false }, { hostDelete: true });
    } else {
      await CallHistory.updateMany({ user_id: req.query.Id, userDelete: false }, { userDelete: true });
    }

    return res.status(200).json({ status: true, message: "Success!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//host call history
exports.getPerDayHistory = async (req, res) => {
  try {
    if (!req.query.Id || !req.query.type) return res.status(200).json({ status: false, message: "Id and Type are Required!" });
    let match;
    if (req.query.type === "user") {
      match = {
        user_id: mongoose.Types.ObjectId(req.query.Id),
        callConnect: true,
        callStartTime: { $ne: null },
      };
    } else {
      match = {
        host_id: mongoose.Types.ObjectId(req.query.Id),
        callConnect: true,
        callStartTime: { $ne: null },
      };
    }
    const addFieldQuery_ = {
      shortDate: {
        $toDate: { $arrayElemAt: [{ $split: ["$callStartTime", ", "] }, 0] },
      },
    };
    let dateFilterQuery = {};
    if (req.body?.startDate && req.body?.endDate) {
      const startD = new Date(req.body.startDate);
      const endD = new Date(req.body.endDate);
      endD.setHours(23, 59, 59, 999);
      dateFilterQuery = {
        shortDate: { $gte: startD, $lte: endD },
      };
    }

    const hostCallHistory = await CallHistory.aggregate([
      { $match: match },
      {
        $addFields: addFieldQuery_,
      },
      {
        $match: dateFilterQuery,
      },
      {
        $group: {
          _id: "$shortDate",
          total: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "Success!!", hostCallHistory });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};
