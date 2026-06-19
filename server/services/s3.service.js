const { s3, bucketName } = require('../config/aws');

exports.uploadToS3 = async (file) => {
  console.log('=== Backend S3 Upload ===');
  console.log('Bucket:', bucketName);
  console.log('File:', file.originalname);
  console.log('Size:', file.size);
  console.log('Type:', file.mimetype);

  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables');
  }

  if (!file || !file.buffer) {
    throw new Error('Invalid file object - missing buffer');
  }

  // Sanitize filename: remove special characters and spaces
  const sanitizedFilename = file.originalname
    .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace special chars with underscore
    .replace(/_{2,}/g, '_')            // Replace multiple underscores with single
    .replace(/\s+/g, '_');             // Replace spaces with underscore

  const params = {
    Bucket: bucketName,
    Key: `resumes/${Date.now()}-${sanitizedFilename}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  console.log('Upload params:', {
    Bucket: params.Bucket,
    Key: params.Key,
    ContentType: params.ContentType
  });

  try {
    const data = await s3.upload(params).promise();
    console.log('Upload successful:', data.Location);
    return data.Location;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload file to S3: ' + error.message);
  }
};

exports.deleteFromS3 = async (fileUrl) => {
  try {
    if (!fileUrl || !bucketName) {
      throw new Error('Invalid fileUrl or bucket name');
    }

    // Extract key from URL
    const urlParts = fileUrl.split('.amazonaws.com/');
    if (urlParts.length < 2) {
      throw new Error('Invalid S3 URL format');
    }
    
    const key = urlParts[1];
    
    const params = {
      Bucket: bucketName,
      Key: key
    };

    console.log('Deleting from S3:', params);
    
    await s3.deleteObject(params).promise();
    console.log('Delete successful');
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error('Failed to delete file from S3: ' + error.message);
  }
};

exports.getSignedUrl = async (key, expiresIn = 3600) => {
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not defined');
  }

  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expiresIn
  };
  
  try {
    return await s3.getSignedUrlPromise('getObject', params);
  } catch (error) {
    console.error('S3 Signed URL Error:', error);
    throw new Error('Failed to generate signed URL: ' + error.message);
  }
};