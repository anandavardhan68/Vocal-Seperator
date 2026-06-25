const express =require('express');
const cors=require('cors');
const {s3Client}=require('./config/s3client.js');
const {PutObjectCommand, GetObjectCommand }=require('@aws-sdk/client-s3');
const{getSignedUrl}=require('@aws-sdk/s3-request-presigner');

const app=express();
app.use(cors());
app.use(express.json());
app.post('/get-upload-url', async (req, res) => {
    try {
        const fileName = req.body.filename;
        const contentType = req.body.contentType; // React sends this
        const file_Id = Date.now() + "-" + fileName.replace(/\s+/g, "_");
        
        const upload_url = await getSignedUrl(s3Client, new PutObjectCommand({
            Bucket: 'vocal-seperator',
            Key: file_Id,
            ContentType: contentType, // We must include it here
        }), { 
            expiresIn: 300,
            
        });
        
        res.status(200).json({
            message: 'success',
            uploadUrl: upload_url,
            fileKey: file_Id,
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'failed to generate url'});
    }
});
app.listen(5000,()=>{
    console.log("server running successfully");
})