#!/usr/bin/env node

const mockDataGenerator = require('./mockDataGen').gen;
var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {


    //Topic1 test:CUSTOMER:USER_REGISTER
    const topic1 = 'CUSTOMER:USER_REGISTER';
    var msg = {
      first_name: mockDataGenerator('first_name'),
      last_name: mockDataGenerator('last_name'),
      email: mockDataGenerator('email'),
      customer_id: mockDataGenerator('customer_id'),
      phone: mockDataGenerator('phone'),
    }

    ch.assertQueue(topic1, {durable: true});
    // Note: on Node 6 Buffer.from(msg) should be used
    ch.sendToQueue(topic1, new Buffer(JSON.stringify(msg)));

    //Topic2 test:CUSTOMER:AUTOMATIC_USER_REGISTER
    const topic2 = 'CUSTOMER:AUTOMATIC_USER_REGISTER';
    

  });
  setTimeout(function() { conn.close(); process.exit(0) }, 500);
});