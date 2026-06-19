import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: process.env.NEXT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `resumes/${timestamp}-${sanitizedFileName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // Optional: Make file publicly readable
      // ACL: 'public-read',
    });

    await s3Client.send(command);

    // Generate file URL
    const fileUrl = `https://${process.env.NEXT_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_AWS_REGION}.amazonaws.com/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}