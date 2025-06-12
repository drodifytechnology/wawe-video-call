//host follower model
const Follower = require('./hostFollower.model');
const User = require('../user/user.model');
const Host = require('../host/host.model');
const UserFollower = require('../userFollower/userFollower.model');
const Notification = require('../notification/notification.model');

const admin = require('../../firebase')

exports.follow = async (req, res) => {
  try {
    const { user_id, host_id } = req.query;

    console.log("come here");

    if (!user_id || !host_id) {
      return res.status(400).json({ status: false, message: 'Invalid details' });
    }

    const [user, host] = await Promise.all([
      User.findById(user_id),
      Host.findById(host_id),
    ]);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User does not exist' });
    }

    if (!host) {
      return res.status(404).json({ status: false, message: 'Host does not exist' });
    }

    const followHost = await Follower.findOne({ user_id: user._id, host_id: host._id });

    console.log("followHost-----------------", followHost);

    if (followHost) {
      return res.status(200).send({ status: true, message: 'Already following' });
    }

    const follower = new Follower({ user_id: user._id, host_id: host._id });

    await follower.save();

    console.log("follower---------------------", follower);

    await User.updateOne({ _id: user_id }, { $inc: { followers_count: 1 } });
    await Host.updateOne({ _id: host_id }, { $inc: { following_count: 1 } });

    const notification = new Notification({
      title: 'New Follower',
      description: `${host.name} started following you.`,
      type: 'follow',
      image: host.image,
      user_id,
    });

    await notification.save();

    if (!user.isLogout && !user.block && user.fcm_token) {
      const payload = {
        token: user.fcm_token,
        notification: {
          title: 'New Follower',
          body: `${host.name} started following you.`,
        },
        data: { type: 'Follower' },
      };

      try {
        const adminPromise = await admin
        const adminResponse = await adminPromise.messaging().send(payload);
        console.log("Successfully sent with response:", adminResponse);
      } catch (messagingError) {
        console.log("Error sending message:", messagingError);
      }
    }

    return res.status(200).send({ status: true, message: 'Follow successful' });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
  }
};


exports.unFollow = async (req, res) => {
  try {
    const { user_id, host_id } = req.query;

    if (!user_id || !host_id) {
      return res.status(200).json({ status: false, message: 'Invalid details' });
    }

    const deleteResult = await Follower.deleteOne({ user_id, host_id });

    if (deleteResult.deletedCount === 0) {
      return res.status(200).json({ status: false, message: 'Follow relationship not found' });
    }

    await User.updateOne({ _id: user_id }, { $inc: { followers_count : -1 } });
    await Host.updateOne({ _id: host_id }, { $inc: { following_count: -1 } });

    return res.status(200).json({ status: true, message: 'UnFollow successful' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
  }
};


exports.followerList = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    if (req.query.host_id) {
      UserFollower.find({ host_id: req.query.host_id }, { user_id: 1 })
        .populate('user_id')
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
    if (req.query.host_id) {
      Follower.find({ host_id: req.query.host_id }, { host_id: 1 })
        .populate('user_id')
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