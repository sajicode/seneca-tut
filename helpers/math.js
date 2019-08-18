module.exports = function math(options) {
	this.add('role:math,cmd:sum', function sum(msg, respond) {
		respond(null, { answer1: msg.left + msg.right });
	});

	this.add('role:math,cmd:product', function product(msg, respond) {
		respond(null, { answer2: msg.left * msg.right });
	});

	//* seneca.wrap is utilized in this case to ensure that the left & right properties are parsed as numeric values even if they are provided as strings.
	this.wrap('role:math', function(msg, respond) {
		msg.left = Number(msg.left).valueOf();
		msg.right = Number(msg.right).valueOf();
		this.prior(msg, respond);
	});
};

//* The seneca.wrap method matches a set of patterns and overrides all of them with the same action extension function.

//* This is the same as calling seneca.add manually for each one

//* It takes two parameters - pin & action
//* A pin is a pattern that matches other patterns (it `pins` them).
//* The pin <role:math> matches the patterns <role:math,cmd:sum> & <role:math,cmd:product> that are registered with Seneca.
