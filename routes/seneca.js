const router = require('express').Router();
const seneca = require('seneca')();

router.get('/math', (req, res) => {
	seneca.add('role:math,cmd:sum', (msg, reply) => {
		reply(null, { answer: msg.left + msg.right });
	});

	seneca.act({ role: 'math', cmd: 'sum', left: 1, right: 2 }, (err, result) => {
		if (err) console.error(err);
		console.log(JSON.stringify(result, null, 2));
	});

	res.send('Seneca in Action');
});

module.exports = router;
