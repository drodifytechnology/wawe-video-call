//user follower model
const Follower = require('./userFollower.model');
const User = require('../user/user.model');
const Host = require('../host/host.model');
const HostFollower = require('../hostFollower/hostFollower.model');
const Notification = require('../notification/notification.model');

const admin = require('../../firebase')


exports.follow = async (req, res) => {
  try {
    const { user_id, host_id } = req.query;

    if (!user_id || !host_id) {
      return res.status(400).json({ status: false, message: 'Invalid details' });
    }

    const [user, host, followHost] = await Promise.all([
      User.findById(user_id),
      Host.findById(host_id),
      Follower.exists({ user_id, host_id }),
    ]);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User does not exist' });
    }

    if (!host) {
      return res.status(404).json({ status: false, message: 'Host does not exist' });
    }

    if (followHost) {
      return res.status(200).json({ status: true, message: 'Already following' });
    }

    const follower = new Follower({ user_id, host_id });
    await follower.save();

    await Promise.all([
      User.updateOne({ _id: user_id }, { $inc: { following_count: 1 } }),
      Host.updateOne({ _id: host_id }, { $inc: { followers_count: 1 } }),
    ]);

    const notification = new Notification({
      title: 'New Follower',
      description: `${user.name} started following you.`,
      type: 'follow',
      image: user.image,
      user_id,
    });
    await notification.save();

    if (!host.isLogout && !host.block && host.fcm_token) {
      const payload = {
        token: host.fcm_token,
        notification: {
          title: 'New Follower',
          body: `${user.name} started following you.`,
        },
        data: { type: 'Follower' },
      };

      try {
        const response = await admin.messaging().send(payload);
        console.log("Successfully sent with response:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    return res.status(200).json({ status: true, message: 'Follow successful' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
  }
};


exports.unFollow = async (req, res) => {
  try {
    const { user_id, host_id } = req.query;

    if (!user_id || !host_id) {
      return res.status(200).json({ status: false, message: 'Invalid details' });
    }

    const result = await Follower.deleteOne({ user_id, host_id });

    if (result.deletedCount === 0) {
      return res.status(200).json({ status: false, message: 'Follow relationship not found' });
    }

    await User.updateOne({ _id: user_id }, { $inc: { following_count: -1 } });
    await Host.updateOne({ _id: host_id }, { $inc: { followers_count: -1 } });

    return res.status(200).send({ status: true, message: 'UnFollow successful' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
  }
};


exports.followerList = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    if (req.query.user_id) {
      HostFollower.find({ user_id: req.query.user_id }, { host_id: 1 })
        .populate('host_id')
        .skip(start)
        .limit(limit)
        .exec((err, followers) => {
          if (err)
            return res
              .status(500)
              .send({ status: false, message: 'Internal server error' });
          else {
            return res.status(200).send({
              status: true,
              message: 'Followers list successful',
              followers,
            });
          }
        });
    } else {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'server error' });
  }
};

exports.followingList = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    if (req.query.user_id) {
      Follower.find({ user_id: req.query.user_id }, { host_id: 1 })
        .populate('host_id')
        .skip(start)
        .limit(limit)
        .exec((err, followers) => {
          if (err)
            return res
              .status(500)
              .send({ status: false, message: 'Internal server error' });
          else {
            return res.status(200).send({
              status: true,
              message: 'Following list successful',
              followers,
            });
          }
        });
    } else {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid details' });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || 'server error' });
  }
};
