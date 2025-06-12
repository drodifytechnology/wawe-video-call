//handle global.settingJSON when pm2 restart

//import model
const Setting = require("./server/setting/setting.model");

const settingJson = require("./setting");

async function initializeSettings() {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (setting) {
      global.settingJSON = setting;
    } else {
      global.settingJSON = settingJson;
    }

    console.log("initialize setting");
  } catch (error) {
    console.error("Failed to initialize settings:", error);
  }
}

module.exports = initializeSettings();