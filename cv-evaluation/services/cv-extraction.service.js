const mammoth = require('mammoth');
const { s3 } = require('../config/aws');

// For PDF parsing
let pdfjsLib = null;
try {
  // Try to load pdf-parse first (v1.1.1)
  const pdfParse = require('pdf-parse');
  pdfjsLib = null;
} catch (e) {
  // If pdf-parse fails, use pdfjs-dist
  try {
    pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  } catch (err) {
    console.error('No PDF library found. Install with: npm install pdf-parse@1.1.1');
  }
}

/**
 * Extract text from PDF or DOCX file stored in S3
 */
exports.extractTextFromS3 = async (fileUrl) => {
  try {
    console.log('📄 Extracting text from:', fileUrl);
    
    // Download file from S3
    const fileBuffer = await downloadFromS3(fileUrl);
    console.log('✅ File downloaded, size:', fileBuffer.length, 'bytes');
    
    // Determine file type and extract text
    if (fileUrl.toLowerCase().endsWith('.pdf')) {
      return await extractFromPDF(fileBuffer);
    } else if (fileUrl.toLowerCase().endsWith('.docx')) {
      return await extractFromDOCX(fileBuffer);
    } else if (fileUrl.toLowerCase().endsWith('.doc')) {
      throw new Error('Legacy .doc format not supported. Please convert to .docx or PDF');
    } else {
      throw new Error('Unsupported file format. Only PDF and DOCX are supported');
    }
  } catch (error) {
    console.error('❌ Text extraction error:', error);
    throw new Error('Failed to extract text from CV: ' + error.message);
  }
};

/**
 * Download file from S3
 */
async function downloadFromS3(fileUrl) {
  try {
    const urlParts = fileUrl.split('.amazonaws.com/');
    if (urlParts.length < 2) {
      throw new Error('Invalid S3 URL format');
    }
    
    // Decode URL-encoded characters (%20, %28, etc.)
    const key = decodeURIComponent(urlParts[1]);
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    console.log('📥 Downloading from S3:', { bucket: bucketName, key });
    
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    const data = await s3.getObject(params).promise();
    return data.Body;
  } catch (error) {
    console.error('❌ S3 download error:', error);
    throw new Error('Failed to download file from S3: ' + error.message);
  }
}

/**
 * Extract text from PDF
 */
async function extractFromPDF(buffer) {
  try {
    console.log('📖 Parsing PDF...');
    
    // Try pdf-parse first
    if (!pdfjsLib) {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      console.log('✅ PDF parsed with pdf-parse, pages:', data.numpages, 'chars:', data.text.length);
      return cleanText(data.text);
    }
    
    // Fallback to pdfjs-dist
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      standardFontDataUrl: null
    });
    
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    console.log('📄 PDF has', numPages, 'pages');
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    console.log('✅ PDF parsed with pdfjs-dist, chars:', fullText.length);
    return cleanText(fullText);
    
  } catch (error) {
    console.error('❌ PDF parsing error:', error);
    throw new Error('Failed to parse PDF: ' + error.message);
  }
}

/**
 * Extract text from DOCX
 */
async function extractFromDOCX(buffer) {
  try {
    console.log('📖 Parsing DOCX...');
    const result = await mammoth.extractRawText({ buffer });
    console.log('✅ DOCX parsed, chars:', result.value.length);
    return cleanText(result.value);
  } catch (error) {
    console.error('❌ DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX: ' + error.message);
  }
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text) {
  if (!text) {
    throw new Error('No text extracted from document');
  }
  
  return text
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')       // Remove excessive line breaks
    .replace(/\s{2,}/g, ' ')          // Remove excessive spaces
    .replace(/[^\S\n]+/g, ' ')        // Normalize whitespace
    .trim();
}

/**
 * Validate extracted text
 */
exports.validateExtractedText = (text) => {
  if (!text || text.length < 100) {
    throw new Error('Extracted text is too short. The CV might be corrupted or empty.');
  }
  
  if (text.length > 50000) {
    console.warn('⚠️  Warning: CV text is very long. Truncating to 50000 characters.');
    return text.substring(0, 50000);
  }
  
  return text;
};