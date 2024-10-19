const amqp = require('amqplib/callback_api');

let channel;

// Establish connection to RabbitMQ and create a channel
amqp.connect('amqp://localhost', (err, conn) => {
  if (err) throw err;

  conn.createChannel((err, ch) => {
    if (err) throw err;
    channel = ch;
    const queue = 'matching_queue';
    ch.assertQueue(queue, { durable: false });
    console.log('RabbitMQ connected, queue asserted:', queue);
  });
});

// Function to send messages to the queue
const sendToQueue = (message) => {
  const queue = 'matching_queue';
  if (!channel) {
    console.error('RabbitMQ channel not initialised');
    return;
  }
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log('Sent message to RabbitMQ:', message);
};

module.exports = { sendToQueue };
