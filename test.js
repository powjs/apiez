var apiez = require('./index'),
	assert = require('assert');

function test(x, expected) {
	assert.equal(JSON.stringify(apiez(x)), JSON.stringify(expected))
}

test(function() {}, { "": { } }); // anonymous

test(function name() {}, { name: { } });

test(function(a, b) {}, { "": { params: [["a"], ["b"]] } });
test(function(a
/*
	c1
	c2
*/
) {}, { "": { params: [["a", "c1", "c2"]] } });

test(function(a /**/ ) {
	/*
		a

		 b
	*/
}, { "": { params: [["a"]], notes: ["a", "", " b"] } });

test(function a(a /*c*/ ) {
	//
	// a
	//
	//  b
	//
}, { a: { params: [["a", "c"]], notes: ["a", "", " b"] } });

test({
a: function(a /**/ ) {
	//
	// a
	//
	//  b
	//
}
}, { a: { params: [["a"]], notes: ["a", "", " b"] } });

test(function a( /*ignore*/ a , /*c,*/ /*ignore*/ b /*,c
	c*/ , /*ignore*/ c /*c*/
) {
	1 + 1
}, { a: { params: [["a", "c,"], ["b", ",c", "c"], ["c", "c"]] } })

function A() {
	/*A*/
}

A.prototype.a = function(a /**/ ) {
	/**
	 * a
	 *
	 * b
	**/

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

test(A,
	{
	A: {
	notes: ["A"],
	methods: {
	a: { params: [["a"]], notes: ["a", "", "b"] },
	b: { params: [["a"]], notes: ["a", "", " b"] }
	}
	}
	}
)

test({ B: A },
	{
	B: {
	notes: ["A"],
	methods: {
	a: { params: [["a"]], notes: ["a", "", "b"] },
	b: { params: [["a"]], notes: ["a", "", " b"] }
	}
	}
	}
)

class Cat {
	constructor(name) {}
	speak() {}
}

class Lion extends Cat {
	speak() {}
}

test(Cat, { Cat: { extends: 'function', methods: { speak: { } } } })

test(Lion, { Lion: { extends: 'Cat', methods: { speak: { } } } })

test(
	function(defaults = { a: b()[1] } ) {},
	{
	'': {
	params: [['defaults', 'default { a: b()[1] }']]
	}
	}
)