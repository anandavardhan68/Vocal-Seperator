
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const {processAudio}=require('./processor');
const {Worker,Queue}=require('bullmq');

const audioWorker=new Worker(
    'audio-processor',
    async(job)=>{

        await processAudio(job);
    },
    {                    // 3. Options
    connection: { host: "localhost", port: 6379, maxRetriesPerRequest: null },
    concurrency: 2,
    lockDuration: 60000 // 1 minute lock for heavy audio tasks
  },

     
    //download the files
    //call the spawning program
    //store the results 
    //send to cloud
    //delete data created by this job 

);

