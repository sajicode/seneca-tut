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

//* seneca loads four built-in by default: basic, transport, web & mem-store.
//* These provide core functionalities for basic microservices
router.get('/math-plugin', (req, res) => {
	function math(options) {
		this.add('role:math, cmd:sum', (msg, respond) => {
			respond(null, { answer1: msg.left + msg.right });
		});

		this.add('role:math,cmd:product', (msg, respond) => {
			respond(null, { answer2: msg.left * msg.right });
		});
	}

	require('seneca')().use(math).act('role:math,cmd:sum,left:1,right:2', console.log);

	res.send('Maths plugin');
});

//* with Seneca, you build up your system by defining a set of patterns that correspond to messages.
//* These patterns can be organized into plugins to make logging & debugging easier.
//* One or more plugins can then be combined into microservices.

//* Do not call `seneca.act` at all in the plugin function - call `seneca.add` only.

//* To initialize a plugin, you add a special action pattern: `init:<plugin-name>`. This action pattern is called in sequence for each plugin.

//* The init function must call its `respond` callback without errors. If plugin initialization fails, then Seneca exits the Node.js process.

//* All plugins must complete initialization before any actions are executed.

//* <<<<<< Demonstrating Initialization >>>>>>
router.get('/plugin-init', (req, res) => {
	const fs = require('fs');

	function math(options) {
		//* the logging function, built by init
		var log;

		//* place all the patterns together
		//* this makes it easier to see them at a glance
		this.add('role:math,cmd:sum', sum);
		this.add('role:math,cmd:product', product);

		//* this is the special initialization pattern
		this.add('init:math', init);

		//* The init function opens/creates a file. This is appropriate since it runs before any action occurs
		function init(msg, respond) {
			//* log a custom file
			fs.open(options.logfile, 'a', function(err, fd) {
				//* cannot open for writing, so fail
				//* this error is fatal to Seneca
				if (err) return respond(err);

				log = make_log(fd);
				respond();
			});
		}

		function sum(msg, respond) {
			var out = { answer1: msg.left + msg.right };
			log('sum ' + msg.left + '+' + msg.right + '=' + out.answer1 + '\n');
			respond(null, out);
		}

		function product(msg, respond) {
			var out = { answer2: msg.left * msg.right };
			log('product ' + msg.left + '*' + msg.right + '=' + out.answer2 + '\n');
			respond(null, out);
		}

		function make_log(fd) {
			//* it is important to note `entry` is the argument passed to `log` in functions `sum` & `product`.
			//* in essence, we are expecting whatever receives the invocation of `make_log` (in this case, <log>) to pass arguments which will serve as the value of entry.
			return function(entry) {
				fs.write(fd, new Date().toISOString() + ' ' + entry, null, 'utf8', function(err) {
					if (err) return console.log(err);

					//* ensure log entry is flushed
					fs.fsync(fd, function(err) {
						if (err) return console.log(err);
					});
				});
			};
		}
	}

	require('seneca')().use(math, { logfile: './math.log' }).act('role:math,cmd:product,left:1,right:2', console.log);

	res.send('Maths plugin with initialization');
});

module.exports = router;
