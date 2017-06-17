var apiez = require('./index'),
	assert = require('assert');

test(function(a /**/ ) {
	/*
		a

		 b
	*/
}, '{"anonymous":{"args":["a /**/"],"doc":["a",""," b"]}}');

test(function a(a /**/ ) {
	//
	// a
	//
	//  b
	//
}, '{"a":{"args":["a /**/"],"doc":["a",""," b"]}}');

test({
	a: function(a /**/ ) {
		//
		// a
		//
		//  b
		//
	}
}, '{"a":{"args":["a /**/"],"doc":["a",""," b"]}}');

function A() {
	/*A*/
}

A.prototype.a = function(a /**/ ) {
	/*
	 a

	  b
	*/

	// After the blank line is not a document
}

A.prototype.b = function a(a /**/ ) {
	//
	// a
	//
	//  b
	//

	// After the blank line is not a document
}

test(A, '{"A":{"methods":{' +
	'"a":{"args":["a /**/"],"doc":["a",""," b"]},' +
	'"b":{"args":["a /**/"],"doc":["a",""," b"]}' +
	'}}}')

test({ B: A }, '{"B":{"methods":{' +
	'"a":{"args":["a /**/"],"doc":["a",""," b"]},' +
	'"b":{"args":["a /**/"],"doc":["a",""," b"]}' +
	'}}}')

function test(x, s) {
	assert.equal(apiez(x, JSON.stringify), s)
}
