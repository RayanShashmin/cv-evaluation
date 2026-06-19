require('dotenv').config();
const amqp = require('amqplib');

async function purgeQueue() {
  try {
    console.log('🔄 Connecting to CloudAMQP...');
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    const queue = process.env.CV_EVAL_QUEUE;
    
    console.log('🗑️  Purging queue:', queue);
    await channel.purgeQueue(queue);
    
    console.log('✅ Queue purged successfully!');
    
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

purgeQueue();