// Simple notification stub — logs notifications and returns a resolved promise.
const util = require('util');

async function sendNotification(userId, type, payload) {
  // In a real app you'd enqueue or call an external provider.
  // Here we simply log to console for demonstration and return success.
  const msg = { to: userId, type, payload, at: new Date().toISOString() };
  // keep logs concise
  console.log('NOTIFICATION:', util.inspect(msg, { depth: 2 }));
  return Promise.resolve({ ok: true });
}

module.exports = { sendNotification };
