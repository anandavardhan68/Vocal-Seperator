const { s3Client } = require('../config/s3client');
const{GetObjectCommand}=require('@aws-sdk/client-s3');
const{pipeline}=require('stream/promises');
const fs=require('fs');
const {spawn}=require('child_process');
const path = require('path');
async function processAudio(jobdata) {
    //deriving the paths
    const fileKey=jobdata.fileKey;         //uploads/filename.ext
    const fileName=path.basename(fileKey); //filename.ext  
    const songName=path.basename(fileKey, path.extname(fileKey));
    const resDirfolder=`./temp/results/ ${path.basename(fileKey ,path.extname(fileKey))}`; //temp/filename
    const resDir=`./temp/results`         //temp/res
    const localInputpath=`./temp/${fileName}`;   //temp/filename.ext
    const vocalPath=`${resDirfolder}/vocals.wav`;
    const accompanimentPath=`${resDirfolder}/accompaniment.wav`;
    const vocalsCloudKey=`results/${songName}-vocals`;
    const accompanimentKey=`results/${songName}-accompaniment`;

    
    //downloading the file
    try{
        const command=new GetObjectCommand({
            Bucket:'vocal-seperator',
            Key:jobdata.fileKey,
        });
        const response=await s3Client.send(command);
        //connvert raw data to mp3
        await pipeline(response.Body,fs.createWriteStream(localInputpath));      
        
    }
    catch(err){
        console.log(err);
    }

    //after we have downloaded the files then only we proceed to spawning the process
    try{
        await run_spleeter(localInputpath,resDir) ;
    }
    catch(err){
        console.log(err);
    }

   //audio prcoessing is done now we upload the results to the cloud
    const vocalUpload=new PutObjectCommand({
    Bucket:'vocal-seperator',
    Key:vocalsCloudKey,
    Body:fs.createReadStream(vocalPath),
   });

   const accompanimentUpload=new PutObjectCommand({
    Bucket:'vocal-seperator',
    Key:accompanimentKey,
    Body:fs.createReadStream(accompanimentPath),
   });
   
   await Promise.all([s3Client.send(vocalUpload),s3client.send(accompanimentUpload)]);
   console.log("uploaded successfully ")

   //cleanup 
try{

    await fs.unlink(localInputpath);
    await fs.rm(resDir,{recursive:true,force:true});
}
catch(err){
    console.log(err);   
}
}


 
 

module.exports=(processAudio);

   

  
  
   