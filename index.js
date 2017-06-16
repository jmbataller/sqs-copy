#!/usr/bin/env node

var program = require('commander');

program
  .arguments('<origin_SQS_queue> <destination_SQS_queue>')
  .option('-u, --username <aws_username>', 'AWS user')
  .option('-p, --password <aws_password>', 'AWS password')
  .action(function(file) {
    console.log('user: %s pass: %s file: %s',
        program.username, program.password, file);
  })
  .parse(process.argv);
