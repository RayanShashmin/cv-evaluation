require('dotenv').config();
const amqp = require('amqplib');

async function testConnection() {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('🔄 Testing CloudAMQP Connection...');
    console.log('═══════════════════════════════════════════');
    
    // Check if URL exists
    if (!process.env.RABBITMQ_URL) {
      console.error('❌ ERROR: RABBITMQ_URL not found in .env file!');
      console.log('\n📝 Please add this to your .env file:');
      console.log('RABBITMQ_URL=amqps://username:password@server.rmq.cloudamqp.com/vhost');
      return;
    }
    
    // Show sanitized URL (hide password)
    const url = process.env.RABBITMQ_URL;
    const sanitizedUrl = url.replace(/:([^:@]+)@/, ':****@');
    console.log('🔗 Connecting to:', sanitizedUrl);
    console.log('');
    
    console.log('⏳ Attempting connection...');
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    console.log('✅ Connected to CloudAMQP successfully!');
    
    console.log('⏳ Creating channel...');
    const channel = await connection.createChannel();
    console.log('✅ Channel created!');
    
    console.log('⏳ Creating queues...');
    await channel.assertQueue(process.env.CV_EVAL_QUEUE, { durable: true });
    await channel.assertQueue(process.env.RESULT_QUEUE, { durable: true });
    
    console.log('✅ Queues created successfully!');
    console.log('   📬 Queue 1:', process.env.CV_EVAL_QUEUE);
    console.log('   📬 Queue 2:', process.env.RESULT_QUEUE);
    console.log('');
    
    console.log('⏳ Sending test message...');
    channel.sendToQueue(
      process.env.CV_EVAL_QUEUE,
      Buffer.from(JSON.stringify({ 
        test: 'Hello CloudAMQP!',
        timestamp: new Date().toISOString() 
      })),
      { persistent: true }
    );
    console.log('✅ Test message sent!');
    console.log('');
    
    console.log('⏳ Closing connections...');
    await channel.close();
    await connection.close();
    
    console.log('═══════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('✨ Your CloudAMQP is working perfectly!');
    console.log('🚀 You can now start your microservice.');
    
  } catch (error) {
    console.error('═══════════════════════════════════════════');
    console.error('❌ CONNECTION FAILED');
    console.error('═══════════════════════════════════════════');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('');
    
    // Specific error handling
    if (error.message.includes('ENOTFOUND')) {
      console.error('🔍 Diagnosis: Cannot find CloudAMQP server');
      console.error('');
      console.error('💡 Solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify the CloudAMQP URL is correct');
      console.error('   3. Make sure you copied the FULL URL from CloudAMQP dashboard');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🔍 Diagnosis: Connection refused by server');
      console.error('');
      console.error('💡 Solutions:');
      console.error('   1. Check if CloudAMQP instance is active');
      console.error('   2. Try creating a new instance in a different region');
    } else if (error.message.includes('ACCESS-REFUSED') || error.message.includes('403')) {
      console.error('🔍 Diagnosis: Authentication failed');
      console.error('');
      console.error('💡 Solutions:');
      console.error('   1. Check username and password in URL');
      console.error('   2. Copy the URL again from CloudAMQP dashboard');
      console.error('   3. Make sure there are no extra spaces');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
      console.error('🔍 Diagnosis: Connection timeout');
      console.error('');
      console.error('💡 Solutions:');
      console.error('   1. Check your firewall settings');
      console.error('   2. Try a VPN or different network');
      console.error('   3. Use a different CloudAMQP region');
    } else {
      console.error('🔍 Full Error Details:');
      console.error(error);
    }
    
    console.error('');
    console.error('═══════════════════════════════════════════');
  }
}

testConnection();