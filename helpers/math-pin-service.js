require('seneca')()
	.use('math')
	//* listen for role:math messages
	//! must match client
	.listen({ type: 'tcp', pin: 'role:math' });

//* run file with node => node math-pin-service.js
