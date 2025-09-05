// config/twilio.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACab608142fb88b0f8beebca044ba7b705';
const authToken = process.env.TWILIO_AUTH_TOKEN; // Store this securely in environment variables
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || 'MG815137f7a3ec76f4b7623779d9d83f41';

const client = twilio(accountSid, authToken);

const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      messagingServiceSid,
      to: `+91${to}` // Assuming Indian numbers, adjust as needed
    });
    console.log('SMS sent successfully:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };