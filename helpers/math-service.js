//* Microservce process
//* This is not a web server, HTTP is just being used as the transport mechanism for messages

require('seneca')().use('math').listen();
