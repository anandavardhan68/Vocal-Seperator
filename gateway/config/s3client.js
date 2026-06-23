const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();
if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_KEY) {
    console.error("Cloudflare R2 credentials are missing from the .env file.");
    process.exit(1);
}
const s3Client = new S3Client({
    region: "auto",
    endpoint: "",
    credentials: {
        accessKeyId:,
        secretAccessKey:,
    },
});

module.exports = {
    s3Client
}
