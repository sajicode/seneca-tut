const router = require('express').Router();
const seneca = require('seneca')();

router.get('/math', (req, res) => {
	//* add two numbers
	seneca.add('role:math,cmd:sum', (msg, reply) => {
		reply(null, { answer: msg.left + msg.right });
	});

	//* multiply two numbers
	seneca.add('role: math, cmd: product', (msg, respond) => {
		const product = msg.left * msg.right;
		respond(null, { reply: product });
	});

	seneca
		.act({ role: 'math', cmd: 'sum', left: 1, right: 2 }, console.log)
		.act({ role: 'math', cmd: 'product', left: 4, right: 5 }, console.log);

	res.send('Seneca in Action');
});

router.get('/maths', (req, res) => {
	seneca.add({ role: 'math', cmd: 'sum', integer: true }, (msg, respond) => {
		var sum = Math.floor(msg.left) + Math.floor(msg.right);
		respond(null, { answer: sum });
	});

	seneca.act({ role: 'math', cmd: 'sum', left: 1.5, right: 2.5, integer: true }, console.log);

	res.send('Extending Seneca functionality');
});

//? adding more patterns to a system
//* seneca chooses the one to use by specificity i.e.
//* the pattern with the highest number of attributes has precedence

router.get('/specific', (req, res) => {
	seneca.add({ role: 'math', cmd: 'sum' }, (msg, respond) => {
		var sum = msg.left + msg.right;
		respond(null, { answer1: sum });
	});

	//* the next two messages match role: math, cmd: sum
	seneca
		.act({ role: 'math', cmd: 'sum', left: 1.5, right: 2.5 }, console.log)
		.act({ role: 'math', cmd: 'sum', left: 1.5, right: 2.5 }, console.log);

	seneca.add({ role: 'math', cmd: 'sum', integer: true }, (msg, respond) => {
		var sum = Math.floor(msg.left) + Math.floor(msg.right);
		respond(null, { answer2: sum });
	});

	//* the next message still matches role: math, cmd: sum
	seneca.act({ role: 'math', cmd: 'sum', left: 1.5, right: 2.5 }, console.log);

	//* the next msg matches role:math,cmd:sum,integer:true
	//* because it's more specific - more properties match
	seneca.act({ role: 'math', cmd: 'sum', left: 1.5, right: 2.5, integer: true }, console.log);

	res.send('Seneca Specificity');
});

module.exports = router;
