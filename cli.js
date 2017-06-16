#!/usr/bin/env node

var docez = require('./index'),
	args = process.argv.slice(2),
	x,
	f;

if (!args.length) {
	console.log('Usage:\n\n  apiez package [formatter]')
	process.exit(0)
}

try {
	x = require(args[0])
	if (args.length > 1)
		f = require(args[1])

} catch (e) {
	console.error(e.message)
	process.exit(1)
}

console.log(docez(x, f || true))

process.exit(0)
