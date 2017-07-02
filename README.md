# sqs-copy
Copy messages from AWS SQS queue to another AWS SQS

_Messages are only removed from origin queue if they have been successfully sent to the destination queue._


## Install tool

> npm install -g sqs-copy


## Run tool

Configure config.json with AWS credentials:

```
{
 "accessKeyId": "********",
 "secretAccessKey": "*********",
 "region": "eu-west-1"
}
```

> sqs-copy <origin_queue_url> <destination_queue_url>
