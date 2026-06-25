const express = require('express');
const cors = require('cors');
const uploadurlrouter = require('./routes/upload.js');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/get-upload-url', uploadurlrouter);
app.listen(5000, () => {
    console.log("server running successfully");
});
