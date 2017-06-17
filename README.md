# apiez

Easily generate API documentation for javascript from runtime instead of source.

Contract:

	The document is a continuous comment at the top of the function body

## Install

```shell
$ npm install apiez
```

## Useage

```js
var apidoc = require('apiez');

apidoc(require('buffer'))
```

cli

```shell
$ apiez buffer
```

## Example

```js
var apiez = require('apiez'),
	assert = require('assert');

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

function test(x, s) {
	assert.equal(apiez(x, JSON.stringify), s)
}

test(A, '{"A":{"methods":{' +
	'"a":{"args":["a /**/"],"doc":["a",""," b"]},' +
	'"b":{"args":["a /**/"],"doc":["a",""," b"]}' +
	'}}}')

test({ B: A }, '{"B":{"methods":{' +
	'"a":{"args":["a /**/"],"doc":["a",""," b"]},' +
	'"b":{"args":["a /**/"],"doc":["a",""," b"]}' +
	'}}}')
```

# License

MIT License

Copyright (c) 2017 powjs.
