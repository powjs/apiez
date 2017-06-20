#!/usr/bin/env node

var apiez = require('./index'),
	args = process.argv.slice(2),
	api,
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
	f = typeof f == 'function' && f || null
} catch (e) {
	console.error(e.message)
	process.exit(1)
}

api = apiez(x)

if (f) {
	console.log(f(api))
} else
	echo(api)

function echo(api) {
	Object.keys(api).forEach(function(name) {
		console.log(format('', name, api[name]).join('\n'))
	}, api)
}

function format(prefix, name, x, lines) {
	lines = lines || []
	lines.push(prefix + name);
	if (x.extends) lines.push(
			prefix + '    extends ' + x.extends)
	if (x.params) {
		lines.push(prefix + '    params');
		x.params.forEach(function(a) {
			lines.push(prefix + '        ' + a[0])
			a.forEach(function(c, i) {
				if (!i) return
				lines.push(prefix + '            ' + c)
			})
		})
	}

	if (x.notes) {
		lines.push(prefix + '    notes');
		x.notes.forEach(function(c) {
			lines.push(prefix + '        ' + c)
		})
	}

	if (x.methods) {
		lines.push(prefix + '    methods');
		Object.keys(x.methods).forEach(function(name) {
			format(prefix + '        ', name, x.methods[name], lines)
		})
	} else
		lines.push('\n')
	return lines
}

process.exit(0)
