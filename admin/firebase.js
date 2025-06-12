const admin = require("firebase-admin");
// const initializeSettings = require("./index");
const initializeSettings = require("./initializeSettings");

const initFirebase = async () => {
    try {
        await initializeSettings;
        admin.initializeApp({
            credential: admin.credential.cert(global.settingJSON.firebaseKey),
        });
        console.log("Firebase Admin SDK initialized successfully");
        return admin;
    } catch (error) {
        console.error("Failed to initialize Firebase Admin SDK:", error);
        throw error;
    }
};

module.exports = initFirebase();
