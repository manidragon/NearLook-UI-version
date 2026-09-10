const { getMessaging } = require('firebase-admin/messaging');
const app = require('../config/firebase');

/**
 * Sends a push notification via Firebase Cloud Messaging.
 * 
 * @param {string} token - The recipient's FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
const sendPushNotification = async (token, title, body, data = {}) => {
    if (!token) return;

    try {
        const message = {
            notification: {
                title,
                body
            },
            data: {
                ...data,
                click_action: "FLUTTER_NOTIFICATION_CLICK" // useful if migrating to flutter, harmless here
            },
            token: token
        };

        const response = await getMessaging(app).send(message);
        console.log("Successfully sent push notification:", response);
        return response;
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
};

module.exports = { sendPushNotification };
