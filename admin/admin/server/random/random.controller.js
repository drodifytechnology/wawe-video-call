const Host = require("../host/host.model");
const LiveView = require("../liveView/liveView.model");
const shuffleArray = require("../../util/shuffle");
const ArraySort = require("array-sort");
const setting = require("../../setting");
const FakeHost = require("../fakeHost/fakeHost.model");

exports.onlineHost = async (req, res) => {
  try {
    const { country, start, limit } = req.query;

    let query = { block: false };
    let fakeQuery = {};

    if (country !== "GLOBAL") {
      query.hostCountry = country;
      fakeQuery.hostCountry = country;
    }

    const [ host, fakeHost] = await Promise.all([

      Host.aggregate([
        { $match: query },
        { $sort: { isOnline: -1 } },
        { $skip: start ? parseInt(start) : 0 },
        { $limit: limit ? parseInt(limit) : 20 },
      ]),
      FakeHost.find(fakeQuery)
        .sort({ createdAt: -1 })
        .skip(start ? parseInt(start) : 0)
        .limit(limit ? parseInt(limit) : 20)
        .populate("hostCountry")
        .lean(),
    ]);

    const responseData = setting.isFakeData
      ? [...host, ...fakeHost.map(fh => ({ ...fh, isFake: true, view: 0 }))]
      : host;

    return res.status(200).json({ status: true, message: "Success!!", data: responseData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: "Server error" });
  }
};

//get thumb list of live host
exports.liveHost = async (req, res) => {
  try {
    let host;
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    if (!req.query.country) {
      return res
        .status(200)
        .json({ status: false, error: "Country is Require" });
    }

    if (req.query.country === "GLOBAL") {
      host = await Host.find({ isLive: true })
        .sort({
          createdAt: 1,
        })
        .skip(start)
        .limit(limit)
        .populate("hostCountry");
    } else {
      host = await Host.find({ hostCountry: req.query.country, isLive: true })
        .sort({
          createdAt: 1,
        })
        .skip(start)
        .limit(limit)
        .populate("hostCountry");
    }

    let fakeHost;

    // if (req.query.country === "GLOBAL") {
    //   fakeHost = await FakeHost.find()
    //     .sort({
    //       createdAt: 1,
    //     })
    //     .skip(start)
    //     .limit(limit)
    //     .populate("hostCountry");
    // } else {
    //   fakeHost = await FakeHost.find({ hostCountry: req.query.country })
    //     .sort({
    //       createdAt: 1,
    //     })
    //     .skip(start)
    //     .limit(limit)
    //     .populate("hostCountry");
    // }

    let mainArr = [];

    for (var i = 0; i < host.length; i++) {
      let count = 0;
      if (
        host[i].isLive === true &&
        host[i].token !== null &&
        host[i].channel !== null
      ) {
        count = await LiveView.aggregate([
          { $match: { user_id: host[i]._id } },
        ]);

        const obj_ = {
          image: host[i].image,
          host_id: host[i]._id,
          name: host[i].name,
          country: host[i].country ? host[i].country : "USA",
          isBusy: host[i].isBusy,
          liveStreamingHistoryId: host[i].liveStreamingHistoryId,
          coin: host[i].coin,
          token: host[i].token,
          channel: host[i].channel,
          view: count.length,
        };
        mainArr.push(obj_);
      }
    }

    shuffleArray(mainArr);
    ArraySort(mainArr, "isLive");

    // const setting = await Setting.findOne({});
    // console.log("setting.isFakeData", setting.isFakeData);
    // if (setting.isFakeData) {
    //   return res.status(200).json({
    //     status: true,
    //     message: "Success!!",
    //     data: [...mainArr, ...fakeHost],
    //   });
    // } else {
    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: mainArr });
    // }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//check host is busy or not
exports.isHostBusy = async (req, res) => {
  try {
    if (!req.query.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is required." });

    const host = await Host.findById(req.query.host_id);

    if (!host) {
      return res.status(200).json({ status: false, message: "host not found" });
    }
    if (host.isBusy === true)
      return res
        .status(200)
        .json({ status: true, message: "This host is busy : true" });
    else
      return res
        .status(200)
        .json({ status: false, message: "This host is busy : false" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//check host is online or not
exports.isHostOnline = async (req, res) => {
  try {
    if (!req.query.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is required." });
    const host = await Host.findById(req.query.host_id);
    if (!host) {
      return res.status(200).json({ status: false, message: "host not found" });
    }

    if (host.isOnline === true)
      return res
        .status(200)
        .json({ status: true, message: "This host is online : true" });
    else
      return res
        .status(200)
        .json({ status: false, message: "This host is not online : false" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
