const ChatTopic = require('./chatTopic.model');
const Chat = require('../chat/chat.model');
const User = require('../user/user.model');
const Host = require('../host/host.model');
const arraySort = require('array-sort');
const mongoose = require('mongoose');

const dayjs = require('dayjs');

//get chat thumb list for user
exports.chatUserList = async (req, res) => {
  try {
    if (!req.query.user_id) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details!!' });
    }

    const [user, list] = await Promise.all([
      User.findById(req.query.user_id),
      ChatTopic.aggregate([
        {
          $match: { user_id: new mongoose.Types.ObjectId(req.query.user_id) },
        },
        {
          $lookup: {
            from: 'hosts',
            localField: 'host_id',
            foreignField: '_id',
            as: 'host',
          },
        },
        {
          $unwind: {
            path: '$host',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: 'chats',
            localField: 'chat',
            foreignField: '_id',
            as: 'chat',
          },
        },
        {
          $unwind: {
            path: '$chat',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            $expr: {
              $eq: ['$chat.userChatDelete', false],
            },
          },
        },
        {
          $project: {
            topic: '$_id',
            message: '$chat.message',
            createdAt: '$chat.createdAt',
            _id: '$host._id',
            name: '$host.name',
            image: '$host.image',
            country_name: '$host.country',
            sender: '$chat.sender',
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: req.query.start ? parseInt(req.query.start) : 0 }, // how many records you want to skip
        { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
      ]),
    ]);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User Does not Exist!!' });
    }

    let now = dayjs();
    const chatList = list.map((data) => ({
      ...data,
      time:
        now.diff(data.createdAt, 'minute') <= 60 &&
        now.diff(data.createdAt, 'minute') >= 0
          ? now.diff(data.createdAt, 'minute') + ' minutes ago'
          : now.diff(data.createdAt, 'hour') >= 24
          ? dayjs(data.createdAt).format('DD MMM, YYYY')
          : now.diff(data.createdAt, 'hour') + ' hour ago',
    }));
    return res
      .status(200)
      .json({ status: true, message: 'success', data: chatList });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: error.status,
      message: error.errors || error.message || 'server error',
    });
  }
};
//get chat thumb list for host
exports.chatHostList = async (req, res) => {
  try {
    if (!req.query.host_id) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details!!' });
    }

    const [host, list] = await Promise.all([
      Host.findById(req.query.host_id),
      ChatTopic.aggregate([
        {
          $match: { host_id: new mongoose.Types.ObjectId(req.query.host_id) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: 'chats',
            localField: 'chat',
            foreignField: '_id',
            as: 'chat',
          },
        },
        {
          $unwind: {
            path: '$chat',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            $expr: {
              $eq: ['$chat.hostChatDelete', false],
            },
          },
        },
        {
          $project: {
            topic: '$_id',
            message: '$chat.message',
            createdAt: '$chat.createdAt',
            _id: '$user._id',
            name: '$user.name',
            image: '$user.image',
            country_name: '$user.country',
            sender: '$chat.sender',
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: req.query.start ? parseInt(req.query.start) : 0 }, // how many records you want to skip
        { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
      ]),
    ]);
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: 'Host Does not Exist!!' });
    }

    let now = dayjs();
    const chatList = list.map((data) => ({
      ...data,
      time:
        now.diff(data.createdAt, 'minute') <= 60 &&
        now.diff(data.createdAt, 'minute') >= 0
          ? now.diff(data.createdAt, 'minute') + ' minutes ago'
          : now.diff(data.createdAt, 'hour') >= 24
          ? dayjs(data.createdAt).format('DD MMM, YYYY')
          : now.diff(data.createdAt, 'hour') + ' hour ago',
    }));

    return res
      .status(200)
      .json({ status: true, message: 'success', data: chatList });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: error.status,
      message: error.errors || error.message || 'server error',
    });
  }
};

exports.store = async (req, res) => {
  try {
    if (!req.body?.user_id || !req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details !!' });

    const [user, host, isTopicExist] = await Promise.all([
      User.findById(req.body.user_id),
      Host.findById(req.body.host_id),
      ChatTopic.findOne({
        user_id: req.body.user_id,
        host_id: req.body.host_id,
      }),
    ]);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: 'User does not Exist!!' });
    }
    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: 'Host does not Exist!!' });
    }

    if (isTopicExist) {
      return res
        .status(200)
        .json({ status: true, message: 'success', data: isTopicExist });
    }
    const chatTopic = await ChatTopic.create({
      user_id: req.body.user_id,
      host_id: req.body.host_id,
    });
    return res
      .status(200)
      .json({ status: true, message: 'success', data: chatTopic });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'server error' });
  }
};
exports.userSearch = async (req, res) => {
  try {
    var response = [];
    let now = dayjs();
    const start = req.query?.start ? parseInt(req.query?.start) : 0;
    const limit = req.query?.limit ? parseInt(req.query?.limit) : 5;

    const user = await User.findById(req.query?.user_id);

    if (!user)
      return res
        .status(200)
        .json({ status: false, message: 'User does not Exist!!' });

    if (req.query?.name) {
      req.query?.name === '@#'
        ? (response = await Host.find().skip(start).limit(limit))
        : (response = await Host.find({
            name: { $regex: req.query?.name, $options: 'i' },
            uniqueId: { $ne: user.uniqueId },
          })
            .skip(start)
            .limit(limit));

      let data = [];
      for (let i = 0; i < response.length; i++) {
        let chatTopic = await ChatTopic.findOne({
          host_id: response[i]._id,
          user_id: req.query?.user_id,
        });

        if (chatTopic) {
          let chat = await Chat.findOne({
            topic: chatTopic._id,
          }).sort({ createdAt: -1 });

          let time = '';

          if (chat) {
            time =
              now.diff(chat.createdAt, 'minute') <= 60 &&
              now.diff(chat.createdAt, 'minute') >= 0
                ? now.diff(chat.createdAt, 'minute') + ' minutes ago'
                : now.diff(chat.createdAt, 'hour') >= 24
                ? now.diff(chat.createdAt, 'day') + ' days ago'
                : now.diff(chat.createdAt, 'hour') + ' hours ago';
          }

          data.push({
            _id: response[i]._id,
            name: response[i].name,
            image: response[i].image,
            country_name: response[i].country,
            message: chat ? chat.message : response[i].bio,
            topic: chat ? chat.topic : '',
            time: time === '0 minutes ago' ? 'now' : time,
            createdAt: chat ? chat.createdAt : '',
          });
        } else {
          data.push({
            _id: response[i]._id,
            name: response[i].name,
            image: response[i].image ? response[i].image : '',
            country_name: response[i].country,
            message: response[i].bio,
            topic: '',
            time: 'New User',
            createdAt: '',
          });
        }
      }

      const test = arraySort(data, 'createdAt', { reverse: true });

      return res
        .status(200)
        .json({ status: true, message: 'success', data: test });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'server error' });
  }
};

exports.hostSearch = async (req, res) => {
  try {
    var response = [];
    let now = dayjs();
    const start = req.query?.start ? parseInt(req.query?.start) : 0;
    const limit = req.query?.limit ? parseInt(req.query?.limit) : 5;

    const hostFollower = await Host.findById(req.query?.host_id);

    if (!hostFollower)
      return res
        .status(200)
        .json({ status: false, message: 'Host does not Exist!!' });
    if (req.query?.name) {
      req.query?.name === '@#'
        ? (response = await User.find().skip(start).limit(limit))
        : (response = await User.find({
            name: { $regex: req.query?.name, $options: 'i' },
          })
            .skip(start)
            .limit(limit));

      let data = [];
      for (let i = 0; i < response.length; i++) {
        let chatTopic = await ChatTopic.findOne({
          user_id: response[i]._id,
          host_id: req.query?.host_id,
        });

        if (chatTopic) {
          let chat = await Chat.findOne({
            topic: chatTopic._id,
          }).sort({ createdAt: -1 });

          let time = '';

          if (chat) {
            time =
              now.diff(chat.createdAt, 'minute') <= 60 &&
              now.diff(chat.createdAt, 'minute') >= 0
                ? now.diff(chat.createdAt, 'minute') + ' minutes ago'
                : now.diff(chat.createdAt, 'hour') >= 24
                ? now.diff(chat.createdAt, 'day') + ' days ago'
                : now.diff(chat.createdAt, 'hour') + ' hours ago';
          }

          data.push({
            _id: response[i]._id,
            name: response[i].name,
            image: response[i].image,
            country_name: response[i].country,
            message: chat ? chat.message : '',
            topic: chat ? chat.topic : response[i].bio,
            time: time === '0 minutes ago' ? 'now' : time,
            createdAt: chat ? chat.createdAt : '',
          });
        } else {
          data.push({
            _id: response[i]._id,
            name: response[i].name,
            image: response[i].image ? response[i].image : '',
            country_name: response[i].country,
            message: response[i].bio,
            topic: '',
            time: 'New User',
            createdAt: '',
          });
        }
      }

      const test = arraySort(data, 'createdAt', { reverse: true });

      return res
        .status(200)
        .json({ status: true, message: 'success', data: test });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'server error' });
  }
};

//get chat thumb list for host
exports.delete = async (req, res) => {
  try {
    if (!req.query.type || !req.query.Id) {
      return res
        .status(200)
        .json({ status: false, message: 'Invalid Details !!' });
    }
    if (req.query.type == 'user') {
      const [user] = await Promise.all([
        User.findById(req.query.Id),
        Chat.updateMany(
          { user_id: req.query.Id, userChatDelete: false },
          {
            userChatDelete: true,
          }
        ),
      ]);
      if (!user) {
        return res
          .status(200)
          .json({ status: false, message: 'User Does not Exist!!' });
      }
    } else {
      const [host] = await Promise.all([
        Host.findById(req.query.Id),
        Chat.updateMany(
          { host_id: req.query.Id, hostChatDelete: false },
          {
            hostChatDelete: true,
          }
        ),
      ]);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: 'Host Does not Exist!!' });
      }
    }
    res.status(200).json({ status: true, message: 'success' });
    await Chat.deleteMany({ userChatDelete: true, hostChatDelete: true });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: error.status,
      message: error.errors || error.message || 'server error',
    });
  }
};
