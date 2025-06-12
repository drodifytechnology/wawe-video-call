




var path = require("path");

const view = path.join(__dirname,'View');

const baseUrl = 'https://social.drodifytechnology.xyz/admin/backend/';

const MONGODB_CONNECTION_STRING = 'mongodb+srv://devdrodify:eJrr4f8opjgbygup@cluster0.a8fr7np.mongodb.net/social_backend?retryWrites=true&w=majority';

const PORT = 3000;

module.exports = { view, baseUrl, MONGODB_CONNECTION_STRING, PORT };

