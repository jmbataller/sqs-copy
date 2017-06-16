# sqs-copy
Copy messages from AWS SQS queue to another AWS SQS

* Messages are only removed from origin queue if they have been successfully
sent to the destination queue.


## Install tool

> npm install -g sqs-copy


## Run tool

> sqs-copy <origin_queue_url> <destination_queue_url>
