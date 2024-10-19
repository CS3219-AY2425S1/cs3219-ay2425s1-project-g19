const amqp = require('amqplib/callback_api');
const { sendWsMessage } = require('./ws');

// In-memory store to track unmatched users
let unmatchedUsers = [];

// Function to set up RabbitMQ consumer
const setupConsumer = () => {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) throw err;

    conn.createChannel((err, ch) => {
      if (err) throw err;
      const queue = 'matching_queue';
      ch.assertQueue(queue, { durable: false });

      console.log('Listening for messages in RabbitMQ queue...');
      ch.consume(queue, (msg) => {
        const userRequest = JSON.parse(msg.content.toString());
        console.log('Received user request:', userRequest);

        // Check if there's a matching user in unmatchedUsers
        const match = unmatchedUsers.find(u => u.topic === userRequest.topic);

        if (match) {
          console.log(`Matched user ${userRequest.userId} with user ${match.userId}`);

          // Notify both users via ws
          sendWsMessage(match.userId, { status: 'matched', matchedUserId: userRequest.userId });
          sendWsMessage(userRequest.userId, { status: 'matched', matchedUserId: match.userId });

          // Remove the matched user from unmatchedUsers
          unmatchedUsers = unmatchedUsers.filter(u => u.userId !== match.userId);
        } else {
          unmatchedUsers.push(userRequest);

          // Set a timeout to remove unmatched users after 30 seconds
          setTimeout(() => {
            unmatchedUsers = unmatchedUsers.filter(u => u.userId !== userRequest.userId);
            sendWsMessage(userRequest.userId, { status: 'timeout' });
          }, 30000);  // 30 seconds timeout
        }

        ch.ack(msg);  // Acknowledge message processing
      });
    });
  });
};

module.exports = { setupConsumer };