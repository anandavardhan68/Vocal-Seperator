const express=require('express');
const router=express.Router();
const {uploadurl}=require('../controller/url_upload');
router.post('/',uploadurl);
module.exports=router;  