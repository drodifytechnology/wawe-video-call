const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
var logger = require("morgan");

const Host = require("./server/host/host.model");
const Country = require("./server/country/country.model");

const fs = require("fs");
const moment = require("moment");

const app = express();
app.use(express.json());
app.use(cors());
app.use(logger("dev"));

const config = require("./config");

//socket io
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
//Declare global variable

global.settingJSON = {};


const Route = require("./route");
app.use("/", Route);


//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.");
};

// app.use("/admin", AdminRoute);  

function _0x4416() {
  const _0x15955d = [
    "./node_mod",
    "519840NmYJsO",
    "603246ddPIKd",
    "27ctVbJD",
    "736353xdTklg",
    "308344XpfTeD",
    "use",
    "10573670eqwXzT",
    "682822EqwJLq",
    "38202zheuCM",
    "/live",
    "stream-ser",
    "ules/live-",
    "ver/servic",
    "8DCzIOE",
    "705YXCeiK",
  ];
  _0x4416 = function () {
    return _0x15955d;
  };
  return _0x4416();
}
const _0x1dab94 = _0x300a;
(function (_0x5d97cc, _0x539118) {
  const _0x31c87a = _0x300a,
    _0x48c953 = _0x5d97cc();
  while (!![]) {
    try {
      const _0x42f105 =
        -parseInt(_0x31c87a(0x126)) / (-0x15d2 + 0x1563 + -0x4 * -0x1c) +
        -parseInt(_0x31c87a(0x11f)) / (-0xad * 0xb + -0x2186 + 0x28f7) +
        (-parseInt(_0x31c87a(0x121)) / (-0x19d * -0x6 + 0x8cc * -0x1 + 0xdf * -0x1)) * (parseInt(_0x31c87a(0x123)) / (-0x1309 * 0x2 + -0x1df + 0x27f5)) +
        (-parseInt(_0x31c87a(0x11d)) / (-0x24d8 + 0x19 * 0x14 + 0x22e9)) * (-parseInt(_0x31c87a(0x127)) / (0x1a56 + -0x155d + -0x7 * 0xb5)) +
        (-parseInt(_0x31c87a(0x120)) / (-0x1865 + 0x9a4 + 0xec8)) * (-parseInt(_0x31c87a(0x11c)) / (-0xabb * -0x1 + -0x154b + 0xa98)) +
        parseInt(_0x31c87a(0x122)) / (-0x9fb + -0x20fb + 0x2aff) +
        parseInt(_0x31c87a(0x125)) / (-0x682 + -0x1 * 0x751 + 0xddd);
      if (_0x42f105 === _0x539118) break;
      else _0x48c953["push"](_0x48c953["shift"]());
    } catch (_0x51ce47) {
      _0x48c953["push"](_0x48c953["shift"]());
    }
  }
})(_0x4416, 0x22 * -0x2439 + 0xc4e7b + -0x1228);
function _0x300a(_0x31f1f0, _0x2eaf15) {
  const _0x28f867 = _0x4416();
  return (
    (_0x300a = function (_0xe3c397, _0x22f450) {
      _0xe3c397 = _0xe3c397 - (0x1 * -0x262c + 0xa * 0x13 + 0x1343 * 0x2);
      let _0xdb2dd4 = _0x28f867[_0xe3c397];
      return _0xdb2dd4;
    }),
    _0x300a(_0x31f1f0, _0x2eaf15)
  );
}
const liveRouter = require(_0x1dab94(0x11e) + _0x1dab94(0x11a) + _0x1dab94(0x119) + _0x1dab94(0x11b) + "e");
app[_0x1dab94(0x124)](_0x1dab94(0x118), liveRouter);

//mongodb connection
mongoose.connect(config.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("MONGO: successfully connected to db");
  
});

//import model
const CallHistory = require("./server/callHistory/callHistory.model");
const Chat = require("./server/chat/chat.model");
const ChatTopic = require("./server/chatTopic/chatTopic.model");
const History = require("./server/history/history.model");
const LiveView = require("./server/liveView/liveView.model");
const User = require("./server/user/user.model");



//private key
const admin = require("./firebase");



//socket io
io.on("connect", async (socket) => {
  const socketQuery = socket.handshake.query;

  console.log("Connection done : ", socketQuery);

  const { globalRoom } = socket.handshake.query;
  console.log("globalRoom connected: ", globalRoom);

  const id = globalRoom && globalRoom.split(":")[1];
  console.log("id: ", id);

  const func = async (socket) => {
    const socket1 = await io.in(globalRoom).fetchSockets();
    if (socket1?.length == 0) {
      console.log("Socket IN JOIN !!");
      socket.join(globalRoom);
      console.log(socket.id);
    } else {
      console.log("Socket ALREADY EXISTS ====================");
    }
  };

  func(socket);

  if (globalRoom) {
    const user = await User.findById(id);
    if (user) {
      user.isOnline = true;
      await user.save();
    }
  }

  socket.on("liveRoomConnect", async (data) => {
    console.log("liveRoomConnect  connected:   ", data);

    await Host.updateOne({ _id: data.hostId }, { isBusy: true, liveStreamingHistoryId: data.liveStreamingId }, { new: true });
    const userRoom = "globalRoom:" + data?.hostId;
    const socket = await io.in(userRoom).fetchSockets();

    socket?.length ? socket[0]?.join(data?.liveStreamingId) : console.log("socket not able to join");
    io.in(data.liveStreamingId).emit("liveRoomConnect", data);
  });

  socket.on("liveRejoin", async (data) => {
    console.log("data in live rejoin : ========", data);

    if (data.type == "host") {
      const host = await Host.findById(data.Id);
      host.isLive = true;
      host.isBusy = true;
      host.liveStreamingHistoryId = data?.liveStreamingId;
      await host.save();
    }
    const socket1 = await io.in("globalRoom:" + data.Id).fetchSockets();

    socket1?.length ? socket1[0].join(data.liveStreamingId) : console.log("socket1 are not able to join");
    // socket.join(data.liveStreamingId);
    io.in(data.liveStreamingId).emit("liveRejoin", data);
  });

  // make call event
  socket.on("makeCall", async (data) => {
    console.log("make call event =============", data);
    try {
      const isUserExist = await User.findById(data.user_id);

      const isHostExist = await Host.findById(data.host_id);

      console.log("isHostExist000000", isHostExist?.name);
      console.log("isUserExist111111111", isUserExist?.name);
      console.log("isHostExist?.isBusy2222222222", isHostExist?.isBusy);
      if (isHostExist?.isOnline) {
        if (!isHostExist?.isBusy) {
          const callHistory = new CallHistory();
          isHostExist.callId = callHistory?._id;
          await isHostExist.save();

          callHistory.type = data.type.trim().toLowerCase();
          callHistory.user_id = isUserExist?._id;
          callHistory.host_id = isHostExist?._id;
          await callHistory.save();

          const call = await CallHistory.findById(callHistory?._id).populate("user_id", "name image username bio ").populate("host_id", "name image username bio ");
          const socket0 = await io.in("globalRoom:" + isUserExist?._id).fetchSockets();
          console.log("host available  =============4444444 ", socket0?.length);
          return io.in("globalRoom:" + isUserExist?._id).emit("makeCall", call, null);
        } else {
          return socket.emit("makeCall", null, "Host is Busy !!");
        }
      } else {
        return socket.emit("makeCall", null, "Host is not online !!");
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("vGift", async (data) => {
    //{'user_id':'658be7b218baa0a50dad9f1c','callId':'659d3e8656ed5f358fce870c','coin':100,'giftId':'65759788b72121a69df4a433','image':'storage/1702205320790Rose.gif','username':'Mona Lisa'}
    console.log("data in VGift: ==== ", data);
    const dataV = JSON.parse(data);
    let user = await User.findById(dataV?.user_id);
    let host = await Host.findById(dataV?.host_id);
    if (user.coin <= 0 || user.coin < dataV?.coin) {
      io.in(dataV?.callId).emit("vGift", null, null, null);
    }
    if (user) {
      user.coin = user.coin - parseInt(dataV?.coin);
      user.spendCoin = user.spendCoin + parseInt(dataV?.coin);
      user.save();
    }
    if (host) {
      host.coin = host.coin + parseInt(dataV?.coin);
      host.receivedCoin = host.receivedCoin + parseInt(dataV?.coin);
      host.save();
    }

    io.in(dataV?.callId).emit("vGift", data, user, host);
    let callHistory = await CallHistory.findById(dataV?.callId);
    if (callHistory) {
      callHistory.gift.push(dataV?.giftId);
      await callHistory.save();
    }
    let history = new History();
    history.user_id = dataV?.user_id;
    history.host_id = dataV?.host_id;
    history.coin = dataV?.coin;
    await history.save();
  });

  socket.on("RequestGift", (data) => {
    const Data = JSON.parse(data);
    console.log("data in RequestGift : ==== ", Data?.callId);
    io.in(Data?.callId).emit("RequestGift", data);
  });

  socket.on("isOnline", async (data) => {
    console.log("data in isOnline : ==== ", data);
    const host = await Host.findById(data.host_id);
    if (host) {
      console.log("host in isOnline : ==== ", host?.name);

      host.isOnline = data?.isOnline;
      if (data?.isOnline) {
        host.channel = data?.channel;
        host.token = data?.token;
        if (!host?.hostCountry) {
          const country = await Country.find({
            name: data.country.trim().replace(/\s+/g, " ").toUpperCase(),
          });

          if (country.length === 0) {
            const country = new Country();
            country.name = data?.country?.trim().replace(/\s+/g, " ").toUpperCase();
            await country.save();
            host.hostCountry = country?._id;
          } else {
            host.hostCountry = country[0]?._id;
          }
        }
      }
      await host.save();
    }
    io.in(data?.liveStreamingId).emit("gif", data);
  });

  socket.on("comment", (data) => {
    console.log("data in comment : ==== ", data);
    io.in(data?.callId).emit("comment", data);
  });

  socket.on("msg", (data) => {
    console.log("data in msg : ==== ", data);
    io.in(data?.liveStreamingId).emit("msg", data);
  });

  socket.on("isBusyOrNot", async (data) => {
    console.log("data in isBusyOrNot : ==== ", data);

    let data_;
    if (data?.type == "user") {
      data_ = await Host.findById(data.Id);
    } else {
      data_ = await User.findById(data.Id);
    }
    console.log(data_?.isOnline, data_?.isBusy);
    socket.emit("isBusyOrNot", {
      isOnline: data_?.isOnline,
      isBusy: data_?.isBusy,
    });
  });

  socket.on("socketReconnectedJoin", async (data) => {
    console.log("rejopinnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", data);
    const userRoom = "globalRoom:" + data?.id;

    const socket = await io.in(userRoom).fetchSockets();

    socket?.length ? socket[0]?.join(data?.roomId) : console.log("socket not able to join");
  });

  socket.on("filter", (data) => {
    console.log("data in filter : ==== ", data);
    io.in(data?.liveStreamingId).emit("filter", data);
  });

  socket.on("gif", (data) => {
    console.log("data in gif : ==== ", data);

    io.in(data?.liveStreamingId).emit("gif", data);
  });

  socket.on("sticker", (data) => {
    console.log("data in sticker : ==== ", data);
    io.in(data?.liveStreamingId).emit("sticker", data);
  });

  socket.on("emoji", (data) => {
    console.log("data in emoji : ==== ", data);
    const data_ = JSON.parse(data);

    io.in(data_?.liveStreamingId).emit("emoji", data);
  });

  socket.on("gift", async (data_) => {
    const data = JSON.parse(data_);
    console.log("data in gift : ==== ", data);
    let user = await User.findById(data?.user_id);
    let host = await Host.findById(data?.host_id);
    if (user.coin <= 0 || user.coin < data?.coin) {
      io.in(data?.liveStreamingId).emit("gift", null, null, null);
    }
    if (user) {
      user.coin = user.coin - parseInt(data?.coin);
      user.spendCoin = user.spendCoin + parseInt(data?.coin);
      user.save();
    }
    if (host) {
      host.coin = host.coin + parseInt(data?.coin);
      host.receivedCoin = host.receivedCoin + parseInt(data?.coin);
      host.save();
    }
    io.in(data?.liveStreamingId).emit("gift", data, user, host);
    let history = new History();
    history.user_id = data?.user_id;
    history.host_id = data?.host_id;
    history.coin = data?.coin;
    await history.save();
  });

  socket.on("chat", async (data) => {
    console.log("data in chat : ==== ", data);
    const user = await User.findById(data?.user_id);
    const host = await Host.findById(data?.host_id);
    if (data?.sender == "user" && user && !user?.isVIP && data?.userChatCharge > 0) {
      if (user?.coin < data?.userChatCharge) {
        console.log("user coin is less in chat : ==== ");
        return io.in("globalRoom:" + data?.user_id).emit("chat", null, null);
      }
      user.coin = user.coin - parseInt(data?.userChatCharge);
      user.spendCoin = user.spendCoin + parseInt(data?.userChatCharge);
      user.save();
      host.coin = host.coin + parseInt(data?.userChatCharge);
      host.receivedCoin = host.receivedCoin + parseInt(data?.userChatCharge);
      host.save();
      console.log("coin charge cut: ==== ", user?.coin, host?.coin);

      const history = new History();
      history.user_id = data.user_id;
      history.host_id = data.host_id;
      history.coin = data.userChatCharge;
      await history.save();
    }
    const chat = await new Chat({
      user_id: data?.user_id,
      host_id: data?.host_id,
      message: data?.message,
      topic: data?.topic,
      sender: data?.sender,
    }).save();
    await ChatTopic.updateOne({ _id: data?.topic }, { chat: chat._id });
    io.in("globalRoom:" + data?.user_id).emit("chat", data, user);
    io.in("globalRoom:" + data?.host_id).emit("chat", data, host);
    if (data?.sender === "user") {
      if (host.isLogout === false && host.block === false) {
        const payload = {
          token: host?.fcm_token,
          notification: {
            body: data?.message,
            title: user?.name,
          },
          data: {
            data: JSON.stringify({
              userId: user?._id.toString(),
              name: user?.name,
              image: user?.image,
              notificationType: "chat",
            }),
            type: "Chat",
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
    } else {
      if (user.isLogout === false && user.block === false) {
        const payload = {
          token: user?.fcm_token,
          notification: {
            body: data?.message,
            title: host?.name,
          },
          data: {
            data: JSON.stringify({
              hostId: host._id.toString(),
              name: host?.name,
              image: host?.image,
              notificationType: "chat",
            }),
            type: "Chat",
          },
        };
        if (user.fcm_token !== null) {
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
  });

  socket.on("blockedList", (data) => {
    console.log("data in blockedList : ==== ", data);
    io.in(data?.liveStreamingId).emit("blockedList", data);
  });

  socket.on("viewadd", async (data) => {
    console.log("data in viewadd : ==== ", data);
    const isUserExist = await LiveView.findOne({
      user_id: data.user_id,
      token: data.token,
    });
    const userRoom = "globalRoom:" + data.user_id;
    const socket = await io.in(userRoom).fetchSockets();

    socket?.length ? socket[0]?.join(data.liveStreamingId) : console.log("socekt are not able to join");

    if (!isUserExist) {
      const view = new LiveView();
      view.user_id = data.user_id;
      view.name = data.name;
      view.image = data.image;
      view.token = data.token;
      await view.save();
    }

    const count = await LiveView.find({ token: data.token }).countDocuments();
    io.to(data.liveStreamingId).emit("view", count);
  });

  socket.on("viewless", async (data) => {
    console.log("data in viewless : =============== ", data);
    socket.leave(data?.liveStreamingId);
    const view = await LiveView.findOne({
      $and: [{ user_id: data.user_id }, { token: data.token }],
    });
    if (view) {
      await view.deleteOne({});
    }

    const count = await LiveView.find({ token: data.token }).countDocuments();
    const socket0 = await io.in(data?.liveStreamingId).fetchSockets();
    console.log("VIEW LESS EVENET   ============= ", socket0?.length);

    io.in(data?.liveStreamingId).emit("view", count);
  });

  socket.on("ended", (data) => {
    console.log("data in ended : ==== ", data);
    io.emit("oneLiveDisconnect", data);
    io.in(data?.liveStreamingId).emit("ended", data);
  });

  socket.on("refresh", (data) => {
    console.log("data in refresh : ==== ", globalRoom, data);
    io.in(data?.liveStreamingId).emit("refresh", data);
  });

  socket.on("call", async (data) => {
    console.log("data in call : ==== ", data);

    try {
      const data_ = JSON.parse(data);
      io.in("globalRoom:" + data_?.ClientId).emit("call", data);
      io.in("globalRoom:" + data_?.hostId).emit("call", data);
      const socket0 = await io.in("globalRoom:" + data_?.hostId).fetchSockets();
      const socket1 = await io.in("globalRoom:" + data_?.ClientId).fetchSockets();
      console.log("socket1 available  ============= ", socket1?.length);

      console.log("host available  ============= ", socket0?.length);
      console.log("host available  ============= ", socket0[0].id);
    } catch (e) {}
  });

  socket.on("callCancel", async (data) => {
    console.log("callCancel--------------", data);
    const host = await Host.updateOne(
      {
        _id: data?.hostId,
      },
      { callId: null, isBusy: false }
    );
    console.log("host update in callCancel ==== ", host);
    if (data?.type === "user") {
      const hostRoom = "globalRoom:" + data?.hostId;
      return io.in(hostRoom).emit("callCancel", data);
    } else {
      const userRoom = "globalRoom:" + data?.userId;
      return io.in(userRoom).emit("callCancel", data);
    }
  });

  socket.on("callAnswer", async (data) => {
    console.log("Received callAnswer data:", data);

    try {
      const data_ = JSON.parse(data);

      const userRoom = "globalRoom:" + data_?.ClientId;
      const hostRoom = "globalRoom:" + data_?.hostId;

      console.log("User Room:", userRoom);
      console.log("Host Room:", hostRoom);

      // Fetch sockets in the specified rooms
      const [socket1, socket2] = await Promise.all([io.in(userRoom).fetchSockets(), io.in(hostRoom).fetchSockets()]);

      // Check if the sockets exist and make them join the 'callId' room
      socket1?.length ? socket1[0]?.join(data_.callId) : console.log("socket1 not able to join");
      socket2?.length ? socket2[0]?.join(data_.callId) : console.log("socket2 not able to join");

      // Update the CallHistory document with the call start time
      if (data_.isAccepted) {
        const host = await Host.updateOne(
          { _id: data_.hostId },
          {
            isBusy: true,
          }
        );
        await CallHistory.updateOne(
          { _id: data_.callId },
          {
            callStartTime: moment().format("HH:mm:ss"),
            callConnect: true,
          }
        );
      } else {
        const host = await Host.updateOne(
          { _id: data_.hostId },
          {
            isBusy: false,
            callId: null,
          }
        );
        console.log("callAnswer : FALSE >>>> host update ", host);
      }

      // Emit the 'callAnswer' event to the appropriate rooms
      io.in(data_.callId).emit("callAnswer", data);
    } catch (error) {
      console.error("Error in callAnswer event:", error);
    }
  });

  // call disconnect for call cut
  socket.on("callDisconnect", async (data) => {
    console.log("callDisconnect ==============================", data);
    const callHistory = await CallHistory.findById(data);
    if (callHistory) {
      io.in("globalRoom:" + callHistory?.user_id?.toString()).emit("callDisconnect", data);
      io.in("globalRoom:" + callHistory?.host_id?.toString()).emit("callDisconnect", data);

      callHistory.callEndTime = moment().format("HH:mm:ss");

      await callHistory.save();

      console.log("callHistory.callEndTime ", callHistory.callEndTime);

      var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
      var date2 = moment(callHistory.callEndTime, "HH:mm:ss");

      console.log("date1 ", date1);
      console.log("date2 ", date2);

      var timeDifference = date2.diff(date1);
      var duration = moment.duration(timeDifference);
      var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

      callHistory.time = durationTime;
      await callHistory.save();

      const user = await User.findById(callHistory.user_id);
      if (user) {
        user.isBusy = false;
        await user.save();
      }

      let host = await Host.findById(callHistory.host_id);
      if (host) {
        host.isBusy = false;
        host.callId = null;
        await host.save();
      }
    }
  });

  socket.on("disconnect", async () => {
    if (globalRoom) {
      console.log("globalRoom disconnected ..........");

      const socket1 = await io.in(globalRoom).fetchSockets();
      if (socket1?.length == 0) {
        let user = await User.findById(id);
        if (user) {
          console.log("user disconnected ..........", user.name);
          if (user?.liveStreamingHistoryId) {
            await LiveView.deleteMany({ user_id: user._id });
          }
          user.isOnline = false;
          user.liveStreamingHistoryId = null;
          await user.save();
        } else {
          let host = await Host.findById(id);
          if (host) {
            console.log("host disconnected ..........", host.name);

            if (host?.isLive) {
              let liveStreamingHistoryIdRoom = host?.liveStreamingHistoryId.toString();
              io.in(liveStreamingHistoryIdRoom).emit("liveHostEnd", host?.liveStreamingHistoryId);
              io?.socketsLeave(liveStreamingHistoryIdRoom);
            }
            if (host?.callId) {
              const callHistory = await CallHistory.findById(host?.callId);
              if (!callHistory.callEndTime) {
                callHistory.callEndTime = moment().format("HH:mm:ss");

                var date1 = moment(callHistory.startTime, "HH:mm:ss");
                var date2 = moment(callHistory.endTime, "HH:mm:ss");

                var timeDifference = date2.diff(date1);
                var duration = moment.duration(timeDifference);
                var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

                callHistory.time = durationTime;

                console.log("callHistory.time ", callHistory.time);

                await callHistory.save();
              }
            }
            host.isOnline = false;
            host.callId = null;
            host.isLive = false;
            host.liveStreamingHistoryId = null;
            host.isBusy = false;
            await host.save();
          }
        }
      }
    }
  });
});


const AdminRoute = require("./server/admin/admin.route");
app.use("/admin", AdminRoute);  // ✅ Correct usage is `app.use`, not `route.use`

app.use((req, res, next) => {
  console.log("404 - Not Found:", req.originalUrl);
  res.status(404).send("Route not found");
});

//start the server
server.listen(config.PORT, () => {
  console.log("Magic happens on port " + config.PORT);
});
