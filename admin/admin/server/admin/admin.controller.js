const Admin = require("./admin.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { deleteFile } = require("../../util/deleteFile");
const fs = require("fs");
const nodemailer = require("nodemailer");

const Login = require("../login/login.model");

const { baseURL } = require("../../config");

const config = require("../../config");

function _0x3fe0() {
  const _0x3cf07c = [
    "84505HzKaAc",
    "27onxfhZ",
    "live-stream-server",
    "13524952xRTdfO",
    "318QWgAJx",
    "5505724XsNToI",
    "363800EiEyoy",
    "453030rktaVe",
    "5530284AeGxYF",
    "1104756WmlFxJ",
  ];
  _0x3fe0 = function () {
    return _0x3cf07c;
  };
  return _0x3fe0();
}
function _0x4514(_0xccc9d9, _0x4b95ce) {
  const _0x3fe0c4 = _0x3fe0();
  return (
    (_0x4514 = function (_0x45144, _0x53a7c8) {
      _0x45144 = _0x45144 - 0x167;
      let _0x1c5da6 = _0x3fe0c4[_0x45144];
      return _0x1c5da6;
    }),
    _0x4514(_0xccc9d9, _0x4b95ce)
  );
}
const _0x4ab3b3 = _0x4514;
(function (_0x1bcb93, _0x41b8d9) {
  const _0x14c1ca = _0x4514,
    _0x33020b = _0x1bcb93();
  while (!![]) {
    try {
      const _0x1ee549 =
        -parseInt(_0x14c1ca(0x16e)) / 0x1 +
        -parseInt(_0x14c1ca(0x16b)) / 0x2 +
        parseInt(_0x14c1ca(0x16c)) / 0x3 +
        -parseInt(_0x14c1ca(0x16d)) / 0x4 +
        (parseInt(_0x14c1ca(0x16f)) / 0x5) *
        (-parseInt(_0x14c1ca(0x169)) / 0x6) +
        -parseInt(_0x14c1ca(0x16a)) / 0x7 +
        (parseInt(_0x14c1ca(0x168)) / 0x8) * (parseInt(_0x14c1ca(0x170)) / 0x9);
      if (_0x1ee549 === _0x41b8d9) break;
      else _0x33020b["push"](_0x33020b["shift"]());
    } catch (_0x2e1e03) {
      _0x33020b["push"](_0x33020b["shift"]());
    }
  }
})(_0x3fe0, 0xd4bbb);
const LiveUser = require(_0x4ab3b3(0x167));

exports.getprofile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res
        .status(200)
        .json({ status: false, message: "admin not found" });
    }
    return res
      .status(200)
      .json({ status: true, message: "success", data: admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.store = async (req, res) => {
  try {
    function _0x2c6b() {
      var _0x4f236c = [
        "password",
        "email",
        "55151txvpoW",
        "203071jOXGBK",
        "150654jYLjol",
        "696weBcdv",
        "56RyvHfq",
        "Invalid\x20details!!",
        "6562290IpzPFA",
        "8MQVBhl",
        "62vXgQdF",
        "status",
        "142850GkabpU",
        "body",
        "4164294krYLfM",
        "873WnJYtw",
        "5587050qzzktV",
        "code",
      ];
      _0x2c6b = function () {
        return _0x4f236c;
      };
      return _0x2c6b();
    }
    function _0x3757(_0x2c050f, _0x84dbe5) {
      var _0x2c6bde = _0x2c6b();
      return (
        (_0x3757 = function (_0x37575e, _0x97576a) {
          _0x37575e = _0x37575e - 0xb4;
          var _0x10a164 = _0x2c6bde[_0x37575e];
          return _0x10a164;
        }),
        _0x3757(_0x2c050f, _0x84dbe5)
      );
    }
    var _0x5837ca = _0x3757;
    (function (_0x158047, _0x2df218) {
      var _0xf66bce = _0x3757,
        _0x3cfee3 = _0x158047();
      while (!![]) {
        try {
          var _0x983cc5 =
            (-parseInt(_0xf66bce(0xb5)) / 0x1) *
            (-parseInt(_0xf66bce(0xbd)) / 0x2) +
            (parseInt(_0xf66bce(0xb7)) / 0x3) *
            (parseInt(_0xf66bce(0xb9)) / 0x4) +
            -parseInt(_0xf66bce(0xbb)) / 0x5 +
            -parseInt(_0xf66bce(0xc1)) / 0x6 +
            (parseInt(_0xf66bce(0xc3)) / 0x7) *
            (parseInt(_0xf66bce(0xbc)) / 0x8) +
            (-parseInt(_0xf66bce(0xc2)) / 0x9) *
            (parseInt(_0xf66bce(0xbf)) / 0xa) +
            (-parseInt(_0xf66bce(0xb6)) / 0xb) *
            (-parseInt(_0xf66bce(0xb8)) / 0xc);
          if (_0x983cc5 === _0x2df218) break;
          else _0x3cfee3["push"](_0x3cfee3["shift"]());
        } catch (_0xdc4e30) {
          _0x3cfee3["push"](_0x3cfee3["shift"]());
        }
      }
    })(_0x2c6b, 0xd927d);
    if (
      !req[_0x5837ca(0xc0)] ||
      !req[_0x5837ca(0xc0)][_0x5837ca(0xc4)] ||
      !req["body"][_0x5837ca(0xb4)] ||
      !req["body"][_0x5837ca(0xc5)]
    )
      return res[_0x5837ca(0xbe)](0xc8)["json"]({
        status: ![],
        message: _0x5837ca(0xba),
      });

    function _0x464a(_0xd17ba3, _0x2e9c12) {
      const _0x5eae67 = _0x5eae();
      return (
        (_0x464a = function (_0x464a49, _0x488d6a) {
          _0x464a49 = _0x464a49 - 0x18a;
          let _0x1692d1 = _0x5eae67[_0x464a49];
          return _0x1692d1;
        }),
        _0x464a(_0xd17ba3, _0x2e9c12)
      );
    }
    const _0x25ab69 = _0x464a;
    function _0x5eae() {
      const _0x41a86b = [
        "1429294bzomSS",
        "943412fcpKCU",
        "code",
        "6186546lpFEMN",
        "body",
        "5447796jxveLI",
        "3095565xFIBqx",
        "Wawe",
        "12814774abUCff",
        "2383254XeUVwc",
      ];
      _0x5eae = function () {
        return _0x41a86b;
      };
      return _0x5eae();
    }
    (function (_0x1a8a88, _0x548d48) {
      const _0x5c19ab = _0x464a,
        _0x2129a0 = _0x1a8a88();
      while (!![]) {
        try {
          const _0xfa5156 =
            parseInt(_0x5c19ab(0x18f)) / 0x1 +
            -parseInt(_0x5c19ab(0x18e)) / 0x2 +
            parseInt(_0x5c19ab(0x18d)) / 0x3 +
            parseInt(_0x5c19ab(0x193)) / 0x4 +
            -parseInt(_0x5c19ab(0x18a)) / 0x5 +
            parseInt(_0x5c19ab(0x191)) / 0x6 +
            -parseInt(_0x5c19ab(0x18c)) / 0x7;
          if (_0xfa5156 === _0x548d48) break;
          else _0x2129a0["push"](_0x2129a0["shift"]());
        } catch (_0x21a534) {
          _0x2129a0["push"](_0x2129a0["shift"]());
        }
      }
    })(_0x5eae, 0xebf1c);
    const data = await LiveUser(
      req[_0x25ab69(0x192)][_0x25ab69(0x190)],
      _0x25ab69(0x18b)
    );

    function _0x157c(_0x1ea294, _0x402ab3) {
      const _0x5a29ac = _0x5a29();
      return (
        (_0x157c = function (_0x157cb4, _0x30b388) {
          _0x157cb4 = _0x157cb4 - 0xdc;
          let _0x1ad4bb = _0x5a29ac[_0x157cb4];
          return _0x1ad4bb;
        }),
        _0x157c(_0x1ea294, _0x402ab3)
      );
    }
    const _0x1442dd = _0x157c;
    (function (_0xba3c11, _0x15dcd2) {
      const _0x5b20f7 = _0x157c,
        _0x42a057 = _0xba3c11();
      while (!![]) {
        try {
          const _0x36bcc9 =
            -parseInt(_0x5b20f7(0xe1)) / 0x1 +
            parseInt(_0x5b20f7(0xdc)) / 0x2 +
            parseInt(_0x5b20f7(0xec)) / 0x3 +
            (parseInt(_0x5b20f7(0xed)) / 0x4) *
            (-parseInt(_0x5b20f7(0xe9)) / 0x5) +
            -parseInt(_0x5b20f7(0xe6)) / 0x6 +
            (-parseInt(_0x5b20f7(0xeb)) / 0x7) *
            (-parseInt(_0x5b20f7(0xe4)) / 0x8) +
            parseInt(_0x5b20f7(0xf1)) / 0x9;
          if (_0x36bcc9 === _0x15dcd2) break;
          else _0x42a057["push"](_0x42a057["shift"]());
        } catch (_0x1100ac) {
          _0x42a057["push"](_0x42a057["shift"]());
        }
      }
    })(_0x5a29, 0x455de);
    if (data) {
      const admin = new Admin();
      (admin[_0x1442dd(0xef)] = req[_0x1442dd(0xe8)][_0x1442dd(0xef)]),
        (admin[_0x1442dd(0xee)] = req[_0x1442dd(0xe8)]["code"]),
        (admin[_0x1442dd(0xea)] = bcrypt[_0x1442dd(0xdd)](
          req["body"][_0x1442dd(0xea)],
          0xa
        )),
        await admin[_0x1442dd(0xe2)](async (_0x548520, _0x5c1d89) => {
          const _0x32e596 = _0x1442dd;
          if (_0x548520)
            return res["status"](0xc8)["json"]({
              status: ![],
              error: _0x548520[_0x32e596(0xe3)] || _0x32e596(0xdf),
            });
          else {
            const _0x297f53 = await Login[_0x32e596(0xf0)]({});
            return (
              !_0x297f53 && (_0x297f53 = new Login()),
              (_0x297f53[_0x32e596(0xe7)] = !![]),
              await _0x297f53[_0x32e596(0xe2)](),
              res[_0x32e596(0xe5)](0xc8)[_0x32e596(0xe0)]({
                status: !![],
                message: "Admin\x20Created\x20Successful!!",
                admin: _0x5c1d89,
              })
            );
          }
        });
    } else
      return res[_0x1442dd(0xe5)](0xc8)["json"]({
        status: ![],
        message: _0x1442dd(0xde),
      });
    function _0x5a29() {
      const _0x215573 = [
        "7wmlAlv",
        "1186659nTmdtT",
        "428128hTjEJf",
        "purchaseCode",
        "email",
        "findOne",
        "153864MnSfSt",
        "1028882mfskGD",
        "hashSync",
        "Purchase\x20code\x20is\x20invalid!!",
        "Internal\x20Server\x20Error!!",
        "json",
        "312198PQygQh",
        "save",
        "message",
        "2590344NwIfsw",
        "status",
        "2642970wjHnGm",
        "login",
        "body",
        "10yTdbaE",
        "password",
      ];
      _0x5a29 = function () {
        return _0x215573;
      };
      return _0x5a29();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error });
  }
};

//update code [Backend]
exports.updateCode = async (req, res) => {
  try {
    if (!req.body || !req.body.code || !req.body.email || !req.body.password) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid details!!" });
    }

    const admin = await Admin.findOne({ email: req.body.email.trim() });
    if (!admin) {
      return res.status(200).send({
        status: false,
        message: "Oops ! Email doesn't exist!!",
      });
    }

    const isPassword = await bcrypt.compareSync(
      req.body.password,
      admin.password
    );
    if (!isPassword) {
      return res.status(200).send({
        status: false,
        message: "Oops ! Password doesn't match!!",
      });
    }

    const data = await LiveUser(req.body.code, "Wawe");
    if (data) {
      admin.purchaseCode = req.body.code;
      await admin.save();
      return res.status(200).send({
        status: true,
        message: "Purchase Code Update Successfully!",
      });
    }

    return res.status(200).send({
      status: false,
      message: "Purchase Code is invalid!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admin = await Admin.find({ flag: true });
    if (!admin) {
      return res
        .status(200)
        .json({ status: false, message: "admin not found" });
    }
    return res
      .status(200)
      .json({ status: true, message: "success", data: admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });

    if (!admin) {
      return res.status(422).json({ error: [{ email: "Email Not Found" }] });
    }

    const isEqual = await bcrypt.compare(req.body.password, admin.password);
    if (!isEqual) {
      return res
        .status(422)
        .json({ error: [{ password: "Password does not match!" }] });
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: admin });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    if (!req.body.name)
      return res
        .status(200)
        .json({ status: false, message: "name is required" });
    if (!req.body.email)
      return res
        .status(200)
        .json({ status: false, message: "email is required" });

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      const err = new Error("Not Found");
      err.status = 404;
      throw err;
    }

    // if (req.file) {
    //   if (fs.existsSync(admin.image)) {
    //     fs.unlinkSync(admin.image);
    //   }
    //   admin.image = req.file.path;
    // }

    admin.name = req.body.name;
    admin.email = req.body.email;

    await admin.save();

    return res
      .status(200)
      .json({ status: true, message: "Update", data: admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.updateImage = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      const err = new Error("Not Found");
      err.status = 404;
      throw err;
    }

    if (req.file) {
      if (fs.existsSync(admin.image)) {
        fs.unlinkSync(admin.image);
      }
      admin.image = req.file.path;
    }

    await admin.save();

    return res
      .status(200)
      .json({ status: true, message: "Update", data: admin });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//admin login [Backend]
exports.login = async (req, res) => {
  try {
    if (req.body && req.body.email && req.body.password) {
      const admin = await Admin.findOne({ email: req.body.email });
      if (!admin) {
        return res.status(200).send({
          status: false,
          message: "Oops ! Email doesn't exist!!",
        });
      }

      const isPassword = await bcrypt.compareSync(
        req.body.password,
        admin.password
      );
      if (!isPassword) {
        return res.status(200).send({
          status: false,
          message: "Oops ! Password doesn't match!!",
        });
      }

      function _0x86d5(_0x8d2203, _0x36fcee) {
        const _0x10618a = _0x1061();
        return (
          (_0x86d5 = function (_0x86d551, _0x2b493e) {
            _0x86d551 = _0x86d551 - 0x8e;
            let _0x4e8ffc = _0x10618a[_0x86d551];
            return _0x4e8ffc;
          }),
          _0x86d5(_0x8d2203, _0x36fcee)
        );
      }
      const _0x5b0c56 = _0x86d5;
      function _0x1061() {
        const _0x121e67 = [
          "15AkrtSq",
          "3472798fcpDro",
          "2169opkdYy",
          "1018XwMxco",
          "purchaseCode",
          "8mXIatJ",
          "263794WlEhcq",
          "20iaFtVp",
          "2850390CYgJup",
          "685446nZEKHM",
          "1331732QxqQPr",
          "Wawe",
          "6363533rTflGy",
        ];
        _0x1061 = function () {
          return _0x121e67;
        };
        return _0x1061();
      }
      (function (_0x4458b8, _0x87711c) {
        const _0x3ed37e = _0x86d5,
          _0x3eb7b2 = _0x4458b8();
        while (!![]) {
          try {
            const _0x1040af =
              parseInt(_0x3ed37e(0x93)) / 0x1 +
              (-parseInt(_0x3ed37e(0x90)) / 0x2) *
              (-parseInt(_0x3ed37e(0x8f)) / 0x3) +
              -parseInt(_0x3ed37e(0x97)) / 0x4 +
              (-parseInt(_0x3ed37e(0x9a)) / 0x5) *
              (-parseInt(_0x3ed37e(0x96)) / 0x6) +
              (-parseInt(_0x3ed37e(0x8e)) / 0x7) *
              (-parseInt(_0x3ed37e(0x92)) / 0x8) +
              parseInt(_0x3ed37e(0x95)) / 0x9 +
              (-parseInt(_0x3ed37e(0x94)) / 0xa) *
              (parseInt(_0x3ed37e(0x99)) / 0xb);
            if (_0x1040af === _0x87711c) break;
            else _0x3eb7b2["push"](_0x3eb7b2["shift"]());
          } catch (_0x1ce00a) {
            _0x3eb7b2["push"](_0x3eb7b2["shift"]());
          }
        }
      })(_0x1061, 0x489c1);
      const data = await LiveUser(admin[_0x5b0c56(0x91)], _0x5b0c56(0x98));
      if (data) {
        const payload = {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          image: admin.image,
          isActive: admin.isActive,
        };

        const token = jwt.sign(payload, config.JWT_SECRET);

        return res.status(200).json({
          status: true,
          message: "Admin Login Successfully!!",
          token,
        });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "Purchase code is invalid!!" });
      }
    } else {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.changePass = async (req, res, next) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    if (!req.body.oldPass)
      return res
        .status(200)
        .json({ status: false, message: "old password is required" });
    if (!req.body.password)
      return res
        .status(200)
        .json({ status: false, message: "new password is required" });
    if (!req.body.confirmPass)
      return res
        .status(200)
        .json({ status: false, message: "confirm password is required" });

    if (req.body.password !== req.body.confirmPass)
      return res.status(200).json({
        status: false,
        message: "Password Confirmation does not match password..",
      });

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).json({
        status: false,
        message: "admin not found",
      });
    }

    const isEqual = await bcrypt.compare(req.body.oldPass, admin.password);
    if (!isEqual) {
      const err = new Error("Old Password does not Match!");
      err.status = 422;
      throw err;
    }

    admin.password = bcrypt.hashSync(req.body.password, 10);
    await admin.save();

    return res
      .status(200)
      .json({ status: true, message: "Success", result: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.forgotPass = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    if (!req.body.new_pass)
      return res
        .status(200)
        .json({ status: false, message: "new password is required" });
    if (!req.body.confirm_pass)
      return res
        .status(200)
        .json({ status: false, message: "confirm password is required" });

    if (req.body.new_pass !== req.body.confirm_pass)
      return res.status(200).json({
        status: false,
        message: "Password Confirmation does not match password..",
      });

    const admin = await Admin.findById(req.params.admin_id);
    if (!admin) {
      return res.status(200).json({
        status: false,
        message: "admin not found",
      });
    }

    admin.password = bcrypt.hashSync(req.body.new_pass, 10);
    await admin.save();

    return res
      .status(200)
      .json({ status: true, message: "password changed", result: true });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.sendEmail = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      const err = new Error("Email does not Exist!");
      err.status = 200;
      throw err;
    }

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.EMAIL,
        pass: config.PASSWORD,
      },
    });

    var tab = "";
    tab += "<!DOCTYPE html><html><head>";
    tab +=
      "<meta charset='utf-8'><meta http-equiv='x-ua-compatible' content='ie=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>";
    tab += "<style type='text/css'>";
    tab +=
      " @media screen {@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 400;}";
    tab +=
      "@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 700;}}";
    tab +=
      "body,table,td,a {-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }";
    tab += "table,td {mso-table-rspace: 0pt;mso-table-lspace: 0pt;}";
    tab += "img {-ms-interpolation-mode: bicubic;}";
    tab +=
      "a[x-apple-data-detectors] {font-family: inherit !important;font-size: inherit !important;font-weight: inherit !important;line-height:inherit !important;color: inherit !important;text-decoration: none !important;}";
    tab += "div[style*='margin: 16px 0;'] {margin: 0 !important;}";
    tab +=
      "body {width: 100% !important;height: 100% !important;padding: 0 !important;margin: 0 !important;}";
    tab += "table {border-collapse: collapse !important;}";
    tab += "a {color: #1a82e2;}";
    tab +=
      "img {height: auto;line-height: 100%;text-decoration: none;border: 0;outline: none;}";
    tab += "</style></head><body>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'>";
    tab +=
      "<tr><td align='center' valign='top' bgcolor='#ffffff' style='padding:36px 24px 0;border-top: 3px solid #d4dadf;'><a href='#' target='_blank' style='display: inline-block;'>";
    tab +=
      "<img src='https://tomotest.codderlab.com/storage/forgot_password.png' alt='Logo' border='0' width='48' style='display: block; width: 500px; max-width: 500px; min-width: 500px;'></a>";
    tab +=
      "</td></tr></table></td></tr><tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff'>";
    tab +=
      "<h1 style='margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;'>SET YOUR PASSWORD</h1></td></tr></table></td></tr>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff' style='padding: 24px; font-size: 16px; line-height: 24px;font-weight: 600'>";
    tab +=
      "<p style='margin: 0;'>Not to worry, We got you! Let's get you a new password.</p></td></tr><tr><td align='left' bgcolor='#ffffff'>";
    tab +=
      "<table border='0' cellpadding='0' cellspacing='0' width='100%'><tr><td align='center' bgcolor='#ffffff' style='padding: 12px;'>";
    tab +=
      "<table border='0' cellpadding='0' cellspacing='0'><tr><td align='center' style='border-radius: 4px;padding-bottom: 50px;'>";
    tab +=
      "<a href='" +
      baseURL +
      "change/" +
      admin._id +
      "' target='_blank' style='display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px;background: #FE9A16; box-shadow: -2px 10px 20px -1px #33cccc66;'>SUBMIT PASSWORD</a>";
    tab +=
      "</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>";

    var mailOptions = {
      from: config.EMAIL,
      to: req.body.email,
      subject: "Sending Email from Wawe",
      html: tab,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(200).json({
          status: false,
          message: "Email send Error",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Email send successfully",
          result: true,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};
