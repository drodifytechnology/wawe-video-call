const FakeHost = require("./fakeHost.model");
const Country = require("../country/country.model");

const { baseURL } = require("../../config");

const { deleteFile } = require("../../util/deleteFile");
const fs = require("fs");

exports.store = async (req, res) => {
  console.log("req.files", req.files);
  try {
    if (!req.body.name) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Name is required." });
    }

    if (!req.files)
      return res
        .status(200)
        .json({ status: false, message: "Please select an Image and video" });

    if (!req.body.bio) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "bio is required." });
    }
    let [isHostExist, country] = await Promise.all([
      FakeHost.findOne({ name: req.body.name }),
      Country.find({ name: "INDIA" }),
    ]);

    if (isHostExist)
      return res.status(200).json({
        status: false,
        message: "Host is already Exist with Same Name!",
      });

    const host = new FakeHost();

    host.name = req.body.name;
    host.image = baseURL + req.files?.image[0]?.path;
    host.video = baseURL + req.files?.video[0]?.path;

    //host country add  //default india add
    if (country.length === 0) {
      country = await Country.create({ name: "INDIA" });
      host.hostCountry = country._id;
    } else {
      host.hostCountry = country[0]._id;
    }

    host.bio = req.body.bio;
    host.uniqueId =
      Math.floor(Math.random() * (99999999 - 11111111)) + 11111111;

    await host.save();

    const data = await FakeHost.findById(host._id);

    return res.status(200).json({ status: true, message: "success", data });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.index = async (req, res) => {
  try {
    const [host, total] = await Promise.all([
      FakeHost.find().sort({ createdAt: -1 }),
      FakeHost.countDocuments(),
    ]);

    if (!host) {
      throw new Error();
    }

    return res
      .status(200)
      .json({ status: true, message: "Success", data: host, total });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Server Error",
    });
  }
};

exports.update = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const fakeHost = await FakeHost.findById(req.params.hostId);

    if (!fakeHost) {
      if (req.file) {
        deleteFile(req?.file);
      }
      return res
        .status(200)
        .json({ status: false, message: "Host not Found!!" });
    }

    fakeHost.name = req.body.name ? req.body.name : fakeHost.name;
    fakeHost.bio = req.body.bio ? req.body.bio : fakeHost.bio;

    if (req.files?.image) {
      if (fakeHost?.image !== null) {
        const image = fakeHost?.image.split("storage");
        if (image) {
          if (fs.existsSync(`storage${image[1]}`)) {
            fs.unlinkSync(`storage${image[1]}`);
          }
        }
      }
      fakeHost.image = baseURL + req.files?.image[0]?.path;
    }

    if (req.files?.video) {
      if (fakeHost?.video !== null) {
        const video = fakeHost?.video?.split("storage");
        if (video) {
          if (fs.existsSync(`storage${video[1]}`)) {
            fs.unlinkSync(`storage${video[1]}`);
          }
        }
      }
      fakeHost.video = baseURL + req.files?.video[0]?.path;
    }
    await fakeHost.save();
    const data = await FakeHost.findById(fakeHost?._id);
    return res.status(200).json({ status: true, message: "success", data });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.isOnlineSwitch = async (req, res) => {
  try {
    const fakeHost = await FakeHost.findById(req.params.id);
    if (!fakeHost) {
      return res.status(200).json({ status: false, message: "not found" });
    }

    fakeHost.isLive = !fakeHost.isLive;
    await fakeHost.save();

    return res
      .status(200)
      .json({ status: true, message: "success", data: fakeHost });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
