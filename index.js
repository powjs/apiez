"use strict"

let reg = /^\s*,?\s*\/(?:\/(.*)(?:\n[\r]|\r)?|[*]+([\s\S]*?)[*]+\/)/;

module.exports = apiez

function apiez(
	funcInside,   // a function or object
	results = Object.create(null)
	/**
	 * object as
	 *
	 * {
	 *	name:{
	 *		params:[["paramN","doc"...]...],
	 *		notes:["doc"...]
	 *	}
	 * }
	**/

) {
	// Generate API documentation object for funcInside.
	//
	// Contract:
	//
	//     The summary is a continuous comment at the top of the function body
	//     Anonymous functions named ""
	//
	// Feature:
	//
	//     Parameter comments
	//     Parameter default value
	//     Prototype methods
	//     Extends class
	//     Constructor, if it is first method
	//     Remove head and tail empty lines
	//     Remove the same indent white-spaces
	//
	var k = typeof funcInside
	if (k == 'function') {
		k = funcInside.name || ''
		results[k] = Object.create(null)
		func(funcInside, results[k])
		return results
	}

	return k == 'object' && !Array.isArray(funcInside) &&
		walkObject(funcInside, results, 2) && results || null
}

function walkObject(funcInside, results, depth) {
	var yes = false;
	Object.getOwnPropertyNames(funcInside).forEach(function(k) {
		if (k == 'constructor')
			return
		if (typeof this[k] != 'function') {
			if (depth && typeof this[k] == 'object' && !Array.isArray(this[k])) {
				var doc = Object.create(null);
				if (walkObject(this[k], doc, depth--)) {
					results[k] = Object.create(null);
					results[k].methods = doc
					yes = true
				}
			}
			return
		}

		if (!results[k])
			results[k] = Object.create(null);
		func(this[k], results[k])
		yes = true
	}, funcInside)

	return yes
}

function func(x, doc) {
	setDoc(x, doc)
	x = x.prototype
	if (typeof x == 'object' && !Array.isArray(x)) {

		Object.getOwnPropertyNames(x).forEach(function(k) {
			if (typeof this[k] != 'function' || k == 'constructor') return
			if (!doc.methods)
				doc.methods = Object.create(null);
			doc.methods[k] = Object.create(null);
			setDoc(this[k], doc.methods[k])
		}, x)
	}
}

function setDoc(x, doc) {
	var code = x.toString(),
		i = code.indexOf(code.search(/^class\b/) == 0 && '{' || '(');

	if (code[i] == '(') {
		code = setParams(code.slice(i + 1), doc)
		code = cleanComments(code, true)

		if (code[0] == '{')
			setNotes(code.slice(1), doc)
		return
	}

	if (code[i] != '{') return
	// class X
	doc.extends = (code.slice(0, i)
		.match(/\s+extends\s+(\w+)/) || ['', 'function'])[1];

	setConstructor(code.slice(i + 1), doc)
}

function setConstructor(code, doc) {
	code = code.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '')
}

function setParams(code, doc) {
	var i = 0,
		a = '',
		defaults = '',
		m = null;

	while (code.length && code[0] != ')') {
		code = cleanComments(code, true)
		i = code.search(/[=,/)]/)
		a = code.substring(0, i).trim()

		if (code[i] == '=') {
			defaults = fetchDefault(code.slice(i + 1))
			code = code.slice(i + 1 + defaults.length).trimLeft()
			i = code.search(/[,/)]/)
		} else {
			defaults = ''
		}

		if (code[i] == ',') {
			m = cleanComments(code.slice(i + 1), false)
		} else {
			m = cleanComments(code.slice(i), false)
		}

		code = m.pop()
		if (code && code[0] == ',')
			code = code.slice(1)

		if (defaults)
			m.unshift('default ' + defaults.trim().replace(/\n\r/, '\n'))

		m.unshift(a)


		if (!doc.params)
			doc.params = [m]
		else
			doc.params.push(m)
	}

	return code.slice(1)
}

function fetchDefault(code) {
	var i = 0,
		c = code[0],
		closing = '';

	while (c != ')' || closing) {
		if (c == ',' && !closing) break
		if (c == '/' && (code[i + 1] == '/' || code[i + 1] == '*')) break

		if (closing && c == closing[0]) {
			c = code[++i]
			closing = closing.slice(1)
			continue
		}

		switch (c) {
			case '"':
			case "'":
				i++
				while (code[i] != c) {
					if (code[i] == '\\') i++
					i++
				}
				break
			case '{':
				closing = '}' + closing
				i++
				break
			case '(':
				closing = ')' + closing
				i++
				break
			case '[':
				closing = ']' + closing
				i++
				break
			default:
				i++
		}
		c = code[i]
	}

	return code.slice(0, i)
}

function setNotes(code, doc) {
	var m = cleanComments(code, false);
	m.pop()
	if (m.length)
		doc.notes = m
}

function cleanComments(code, discard) {
	// return null | [raw-length, pure-line-comment...]
	var c,
		i;
	code = code.trimLeft()
	if (!code || code[0] != '/')
		return !discard && [code] || code;

	if (code[1] == '/') {
		c = code.match(/^(?:\s*[/]+[^\n\r]*(?:\n\r?|\r))+/)[0]
		if (discard) return cleanComments(code.slice(c.length), discard)
		i = 0
		return eachTrim(/^\s*[/]+/, c.split(/\n[\r]?|\r/).filter(
			function(s) {
				if (i == -1) return false
				i = s.indexOf('/')
				/*
					// dd

					// ignore after the blank line
				 */
				return i != -1
			}),
			code.slice(c.length).trimLeft()
		)
	}

	i = code.indexOf('*/')

	if (discard) return cleanComments(code.slice(i + 2), discard)

	c = code.substring(1, i)
	return eachTrim(/^\s*[*]+/, c.split(/\n[\r]?|\r/),
		code.slice(i + 2).trimLeft())
}

function eachTrim(reg, lines, tail) {
	var i,
		prefix = null;
	lines = lines.map(function(s) {
		s = s.replace(reg, '').trimRight()
		if (!s) return s
		if (prefix == null) {
			if (s[0] == ' ')
				prefix = s.substring(0, s.search(/[^ ]/))
			else if (s[0] == '\t')
				prefix = s.substring(0, s.search(/[^\t]/))
		}

		if (prefix)
			s = !s.startsWith(prefix) && s || s.slice(prefix.length)
		return s
	})

	i = lines.length
	while (i && !lines[--i]) lines.pop();
	i = 0
	while (i < lines.length && !lines[i]) i++;
	lines.push(tail)
	return !i && lines || lines.slice(i)
}

function trimPrefix(lines) {
	// for defaults only
	var prefix = '';
	lines.forEach(function(s, i) {
		if (!i) return
		if (s[0] == ' ')
			prefix = s.substring(0, s.search(/[^ ]/))
		else if (s[0] == '\t')
			prefix = s.substring(0, s.search(/[^\t]/))
	})
	return lines
}