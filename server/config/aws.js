const AWS = require('aws-sdk');

// Check if environment variables are loaded
if (!process.env.AWS_ACCESS_KEY_ID) {
  console.error('ERROR: AWS_ACCESS_KEY_ID is not defined!');
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('ERROR: AWS_SECRET_ACCESS_KEY is not defined!');
}
if (!process.env.AWS_REGION) {
  console.error('ERROR: AWS_REGION is not defined!');
}
if (!process.env.AWS_S3_BUCKET_NAME) {
  console.error('ERROR: AWS_S3_BUCKET_NAME is not defined!');
}

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Debug log
console.log('=== AWS S3 Configuration ===');
console.log('Region:', process.env.AWS_REGION);
console.log('Bucket:', bucketName);
console.log('Access Key (first 4):', process.env.AWS_ACCESS_KEY_ID?.substring(0, 4));
console.log('============================');

module.exports = { s3, bucketName };