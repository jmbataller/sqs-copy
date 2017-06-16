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

      var params = {
         QueueUrl: origin,
         MaxNumberOfMessages: 1, // how many messages do we wanna retrieve?
         VisibilityTimeout: 60, // seconds - how long we want a lock on this job
         WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
       }

      sqs.receiveMessage(params, function(err, data) {

        if(err) { console.log("Receive error", err); throw err; }

       // If there are any messages to get
       if ((data !== undefined) && (data !== null) && data.Messages) {
            // Get the first message (should be the only one since we said to only get one above)
            var message = data.Messages[0];
            //body = JSON.parse(message.Body);
            // Now this is where you'd do something with this message
            //doSomethingCool(body, message);  // whatever you wanna do
            console.log("message: %s", message.Body)

            sendMessage(destination, message.Body);

            // Clean up after yourself... delete this message from the queue, so it's not executed again
            removeFromQueue(origin, message);  // We'll do this in a second
         }
       });


  })
  .parse(process.argv);



/**
 *  Send message to a queue
 */
var sendMessage = function(queueUrl, body) {

  var params = {
    DelaySeconds: 10,
    MessageAttributes: {
      "cid": {
        DataType: "String",
        StringValue: "test"
      }
    },
    MessageBody: body,
    QueueUrl: queueUrl
  };

  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.log("Error", err);
      throw err;
    } else {
      console.log("Success", data.MessageId);
    }
  });
}

/**
 *  Remove message from queue after reading it
 */
var removeFromQueue = function(queueUrl, message) {
   sqs.deleteMessage({
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle
   }, function(err, data) {
      // If we errored, tell us that we did
      err && console.log(err);
   });
};
