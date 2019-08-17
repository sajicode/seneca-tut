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

router.get('/reuse', (req, res) => {
	seneca.add('role: math, cmd: sum', (msg, respond) => {
		let sum = msg.left + msg.right;
		respond(null, { answer1: sum });
	});

	seneca.add('role: math,cmd:sum, integer: true', function(msg, respond) {
		//* reuse role:math, cmd:sum
		this.act(
			{
				role: 'math',
				cmd: 'sum',
				left: Math.floor(msg.left),
				right: Math.floor(msg.right)
			},
			respond
		);
	});

	//* this matches role:math, cmd:sum
	seneca.act('role:math, cmd:sum, left: 1.5, right: 2.5', console.log);

	//* this matches role:math, cmd:sum, integer:true
	seneca.act('role:math, cmd: sum, left: 1.5, right: 2.5, integer: true', console.log);

	res.send('Code Reuse with patterns');
});

//* Defined action patterns are unique & can only trigger one function
//* Patterns resolve using the following rules..
//* 1. More properties win
//* 2. If the patterns have the same number of properties, they are matched in alphabetical

//* Enhancement & Validation checks w/ debugging info
router.get('/enhance', (req, res) => {
	seneca
		.add('role:math,cmd:sum', (msg, respond) => {
			let sum = msg.left + msg.right;
			respond(null, { answer: sum });
		})
		//* override role:math,cmd:sum with additional functionality
		.add('role:math,cmd:sum', function(msg, respond) {
			//* bail out early if there is a problem
			if (!Number.isFinite(msg.left) || !Number.isFinite(msg.right)) {
				return respond(new Error('Expected left and right to be numbers'));
			}

			//* call previous action function for role:math,cmd:sum
			this.prior(
				{
					role: 'math',
					cmd: 'sum',
					left: msg.left,
					right: msg.right
				},
				(err, result) => {
					if (err) return respond(err);

					result.info = msg.left + '+' + msg.right;
					respond(null, result);
				}
			);
		})
		//* enhanced role:math,cmd:sum
		.act('role:math,cmd:sum,left:1.5,right:2.5', console.log);
	//* prints {answer: 4, info: '1.5+2.5'}
	res.send('Enhanced patterns');
});

router.get('/plugins', (req, res) => {
	const minimal_plugin = (options) => {
		console.log(options);
	};

	require('seneca')().use(minimal_plugin, { foo: 'bar' });

	//* seneca.use method takes two parameters...
	//* plugin: plugin definition function or plugin name
	//* options: options object for the plugin
	res.send('Plugins activated');
	//* A seneca instance is just a set of action patterns
	//* You can organize action patterns using namespacing conventions, such as role:math
	//* A seneca plugin is just a set of action patterns
});

module.exports = router;
