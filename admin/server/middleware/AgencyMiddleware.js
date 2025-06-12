const Agency = require("../agency/agency.model");
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../../config");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");

    if (!Authorization) {
      throw new Error();
    }

    const decodeToken = await jwt.verify(Authorization, JWT_SECRET);
    const agency = await Agency.findById(decodeToken._id);
    req.agency = agency;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: error.message || "Unauthorized" });
  }
};
