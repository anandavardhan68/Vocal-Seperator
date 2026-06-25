const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
    region: "auto",
    
    endpoint: process.env.R2_ACCOUNT_ID,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  
});

module.exports = { s3Client };