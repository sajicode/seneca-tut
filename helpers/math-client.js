//* this is the microservice client
//* This receives messages from the math-service
require('seneca')().client().act('role:math,cmd:sum,left:3,right:4', console.log);
