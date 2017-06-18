#!/usr/bin/env node

var program = require('commander');
var AWS = require('aws-sdk');

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

program
  .arguments('<origin> <destination>')
  .action(function(origin, destination) {

    console.log('origin: %s destination: %s', origin, destination);
    copyNextMessage(origin, destination);
  })
  .parse(process.argv);


/**
 *  Copy mesage from one queue to another
 */
function copyNextMessage(originQueueUrl, destinationQueueUrl) {

  var params = {
     QueueUrl: originQueueUrl,
     MaxNumberOfMessages: 1, // how many messages do we wanna retrieve?
     VisibilityTimeout: 10, // seconds - how long we want a lock on this job
     WaitTimeSeconds: 3, // seconds - how long should we wait for a message?
     AttributeNames: [ "All" ],
     MessageAttributeNames: [ "All" ]
   }

   sqs.receiveMessage(params, function(err, data) {

     if(err) { console.log("Receive message error", err); throw err; }

    // If there are any messages to get
    if ((data !== undefined) && (data !== null) && data.Messages) {
         // get first message (should be the only one since we said to only get one above)
         var message = data.Messages[0];
         console.log("message: %s received", message.MessageId)
         //console.log(JSON.stringify(message))

         // send message to destination queue
         sendMessage(destinationQueueUrl, message, originQueueUrl, removeFromQueue);

         copyNextMessage(originQueueUrl, destinationQueueUrl)
      }
    });
}


/**
 *  Send message to a queue
 */
var sendMessage = function(queueUrl, message, originQueueUrl, callback) {

  var params = {
    DelaySeconds: 10,
    //MessageAttributes: message.MessageAttributes,
    MessageBody: message.Body,
    QueueUrl: queueUrl
  };

  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.log("Send message error", err);
      callback(err, null, null)
    } else {
      console.log("message %s sent", data.MessageId);
      callback(null, originQueueUrl, message)
    }
  });
}

/**
 *  Remove message from queue after reading it
 */
var removeFromQueue = function(err, queueUrl, message) {

   if(err) throw err;

   sqs.deleteMessage({
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle
   }, function(err, data) {
      // Show error message if error
      err && console.log(err);
   });
};
