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

module.exports = router;
