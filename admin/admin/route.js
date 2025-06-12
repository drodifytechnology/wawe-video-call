const express = require("express");
const route = express.Router();
const path = require("path");

const AdminRoute = require("./server/admin/admin.route");
route.use("/admin", AdminRoute);

//user routes
const UserRoute = require("./server/user/user.route");
route.use("/user", UserRoute);

//country routes
const CountryRoute = require("./server/country/country.route");
route.use("/country", CountryRoute);

//chat route
const ChatRoute = require("./server/chat/chat.route");
route.use("/chat", ChatRoute);

//chat topic route
const ChatTopicRoute = require("./server/chatTopic/chatTopic.route");
route.use("/chatTopic", ChatTopicRoute);

//sticker route
const StickerRoute = require("./server/sticker/sticker.route");
route.use("/sticker", StickerRoute);

//emoji route
const EmojiRoute = require("./server/emoji/emoji.route");
route.use("/emoji", EmojiRoute);

//random route
const RandomRoute = require("./server/random/random.route");
route.use("/", RandomRoute);

//live comment route
const LiveCommentRoute = require("./server/liveComment/liveComment.route");
route.use("/livecomment", LiveCommentRoute);

//live view route
const LiveViewRoute = require("./server/liveView/liveView.route");
route.use("/liveview", LiveViewRoute);

//category route
const CategoryRoute = require("./server/category/category.route");
route.use("/category", CategoryRoute);

//gift route
const GiftRoute = require("./server/gift/gift.route");
route.use("/gift", GiftRoute);

//favorite route
const FavouriteRoute = require("./server/favourite/favourite.route");
route.use("/", FavouriteRoute);

//plan route
const PlanRoute = require("./server/plan/plan.route");
route.use("/plan", PlanRoute);

//VIP plan route
const VIPPlanRoute = require("./server/VIP plan/VIPplan.route");
route.use("/VIPplan", VIPPlanRoute);

//history route
const HistoryRoute = require("./server/history/history.route");
route.use("/history", HistoryRoute);

//notification route
const NotificationRoute = require("./server/notification/notification.route");
route.use("/", NotificationRoute);

//dashboard route
const DashboardRoute = require("./server/dashboard/dashboard.route");
route.use("/dashboard", DashboardRoute);

//setting route
const SettingRoute = require("./server/setting/setting.route");
route.use("/setting", SettingRoute);

//report user route
const ReportRoute = require("./server/report/report.route");
route.use("/report", ReportRoute);

//advertisement route
const AdvertisementRoute = require("./server/advertisement/advertisement.route");
route.use("/advertisement", AdvertisementRoute);

//redeem User
const RedeemRoute = require("./server/redeem/redeem.route");
route.use("/redeem", RedeemRoute);

//host route
const HostRoute = require("./server/host/host.route");
route.use("/host", HostRoute);

//agency route
const AgencyRoute = require("./server/agency/agency.route");
route.use("/agency", AgencyRoute);

//request route
const RequestRoute = require("./server/request/request.route");
route.use("/request", RequestRoute);

//call history route
const CallHistoryRoute = require("./server/callHistory/callHistory.route");
route.use("/callHistory", CallHistoryRoute);

//user follower route
const UserFollowerRoute = require("./server/userFollower/userFollower.route");
route.use("/userFollower", UserFollowerRoute);

//host follower route
const HostFollowerRoute = require("./server/hostFollower/hostFollower.route");
route.use("/hostFollower", HostFollowerRoute);

//level route
const LevelRoute = require("./server/level/level.route");
route.use("/level", LevelRoute);

//agency redeem route
const AgencyRedeemRoute = require("./server/agencyRedeem/agencyRedeem.route");
route.use("/agencyRedeem", AgencyRedeemRoute);

const LoginRoute = require("./server/login/login.route");
route.use("/", LoginRoute);

//complain route
const ComplainRoute = require("./server/complain/complain.route");
route.use("/complain", ComplainRoute);

//live streaming history route
const LiveStreamingHistoryRoute = require("./server/liveStreamingHistory/liveStreamingHistory.route");
route.use("/liveStream", LiveStreamingHistoryRoute);

//banner route
const BannerRoute = require("./server/banner/banner.route");
route.use("/banner", BannerRoute);

const FakeHostRoute = require("./server/fakeHost/fakeHost.route");
route.use("/fakeHost", FakeHostRoute);

route.use(express.static(path.join(__dirname, "public")));
route.use("/storage", express.static(path.join(__dirname, "storage")));
route.get("/*", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = route;
