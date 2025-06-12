const Setting = require("./setting.model");
const setting = require("../../setting");

exports.index = async (req, res) => {
  try {
    const data = global.settingJSON ? global.settingJSON : null;

    if (!data) {
      throw new Error();
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.store = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details." });
    if (!req.body.googlePayId)
      return res
        .status(200)
        .json({ status: false, message: "google pay id is required" });
    if (!req.body.agoraId)
      return res
        .status(200)
        .json({ status: false, message: "agora id is required" });
    if (!req.body.policyLink)
      return res
        .status(200)
        .json({ status: false, message: "policy link is required" });
    if (!req.body.hostCharge)
      return res
        .status(200)
        .json({ status: false, message: "host charge is required" });
    if (!req.body.loginBonus)
      return res
        .status(200)
        .json({ status: false, message: "login bonus is required" });

    const setting = new Setting();

    setting.googlePayId = req.body.googlePayId;
    setting.agoraId = req.body.agoraId;
    setting.policyLink = req.body.policyLink;
    setting.hostCharge = req.body.hostCharge;
    setting.loginBonus = req.body.loginBonus;


    await setting.save();

    if (!setting) {
      throw new Error();
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.update = async (req, res) => {
  try {
    
    const setting = await Setting.findById(req.params.setting_id);

    if (!setting) {
      return res.status(200).send({
        status: false,
        message: "setting not found"
      })
    }
    if (Math.floor(req.body.howManyCoins) == 0) {
      return res
        .status(200)
        .json({ status: false, message: "coins is invalid" });
    }
    setting.googlePayId = req.body.googlePayId
      ? req.body.googlePayId
      : setting.googlePayId;
    setting.agoraId = req.body.agoraId ? req.body.agoraId : setting.googlePayId;
    setting.agoraCertificate = req.body.agoraCertificate
      ? req.body.agoraCertificate
      : setting.agoraCertificate;
    setting.policyLink = req.body.policyLink
      ? req.body.policyLink
      : setting.policyLink;
    setting.hostCharge = req.body.hostCharge
      ? Math.floor(req.body.hostCharge)
      : setting.hostCharge;
    setting.loginBonus = req.body.loginBonus
      ? Math.floor(req.body.loginBonus)
      : setting.loginBonus;
    setting.redeemGateway = req.body.redeemGateway
      ? req.body.redeemGateway
      : setting.redeemGateway;
    setting.currency = req.body.currency ? req.body.currency : setting.currency;
    setting.howManyCoins = req.body.howManyCoins
      ? Math.floor(req.body.howManyCoins)
      : setting.howManyCoins;
    setting.toCurrency = req.body.toCurrency
      ? Math.floor(req.body.toCurrency)
      : setting.toCurrency;
    setting.minPoints = req.body.minPoints
      ? Math.floor(req.body.minPoints)
      : setting.minPoints;
    setting.streamingMinValue = req.body.streamingMinValue
      ? Math.floor(req.body.streamingMinValue)
      : setting.streamingMinValue;
    setting.streamingMaxValue = req.body.streamingMaxValue
      ? Math.floor(req.body.streamingMaxValue)
      : setting.streamingMaxValue;
    setting.dailyTaskMinValue = req.body.dailyTaskMinValue
      ? Math.floor(req.body.dailyTaskMinValue)
      : setting.dailyTaskMinValue;
    setting.dailyTaskMaxValue = req.body.dailyTaskMaxValue
      ? Math.floor(req.body.dailyTaskMaxValue)
      : setting.dailyTaskMaxValue;
    setting.razorPayId = req.body.razorPayId
      ? req.body.razorPayId
      : setting.razorPayId;
    setting.stripeId = req.body.stripeId ? req.body.stripeId : setting.stripeId;
    setting.userCallCharge = req.body.userCallCharge
      ? Math.floor(req.body.userCallCharge) 
      : setting.userCallCharge;
    setting.userLiveStreamingCharge = req.body.userLiveStreamingCharge
      ? Math.floor(req.body.userLiveStreamingCharge)
      : setting.userLiveStreamingCharge;
    setting.stripeSecreteKey = req.body.stripeSecreteKey
      ? req.body.stripeSecreteKey
      : setting.stripeSecreteKey;
    setting.stripePublishableKey = req.body.stripePublishableKey
      ? req.body.stripePublishableKey
      : setting.stripePublishableKey;
    setting.redeemDay = req.body.redeemDay
      ? req.body.redeemDay
      : setting.redeemDay;
    setting.bonus = req.body.bonus ? Math.floor(req.body.bonus) : setting.bonus;
    setting.chatCharge = req.body.chatCharge
      ? Math.floor(req.body.chatCharge)
      : setting.chatCharge;

    setting.firebaseKey = req.body.firebaseKey
      ? JSON.parse(req.body.firebaseKey.trim())
      : setting.firebaseKey;
      
    await setting.save();

    updateSettingFile(setting);
    return res
      .status(200)
      .json({ status: true, message: "success", data: setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//enable & disable  google pay
exports.googlePaySwitch = async (req, res) => {
  try {
    
    if (!setting) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    setting.googlePaySwitch = !setting.googlePaySwitch;
    await setting.save();
    updateSettingFile(setting);
    return res
      .status(200)
      .json({ status: true, message: "success", data: setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.fakeDataSwitch = async (req, res) => {
  try {
    if (!setting) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    setting.isFakeData = !setting.isFakeData;
    await setting.save();
    updateSettingFile(setting);
    return res
      .status(200)
      .json({ status: true, message: "success", data: setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
//enable & disable  razor pay
exports.razorPaySwitch = async (req, res) => {
  try {
    if (!setting) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    setting.razorPaySwitch = !setting.razorPaySwitch;
    await setting.save();
    updateSettingFile(setting);
    return res
      .status(200)
      .json({ status: true, message: "success", data: setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
//enable & disable  stripe
exports.stripeSwitch = async (req, res) => {
  try {
    if (!setting) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    setting.stripeSwitch = !setting.stripeSwitch;
    await setting.save();

    updateSettingFile(setting);
    return res
      .status(200)
      .json({ status: true, message: "success", data: setting });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
