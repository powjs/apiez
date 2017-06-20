# apiez

Easily generate API documentation at runtime, rather than from the source code.

Results details to see [test](./test.js) and [test-class](./test-class.js)

## Install

```shell
$ npm install apiez
```

## Useage

```js
var apiez = require('apiez');

apiez(apiez)
```

cli

```shell
$ apiez apiez
```

output

```
apiez
    params
        funcInside
            a function or object
        results
            default Object.create(null)
            object as

            {
            	name:{
            		params:[["paramN","doc"...]...],
            		notes:["doc"...]
            	}
            }
    notes
        Generate API documentation object for funcInside.

        Contract:

            The summary is a continuous comment at the top of the function body
            Anonymous functions named ""

        Feature:

            Parameter Comment
            Prototype methods
            Extends class
            Constructor, if it is first method
            Remove head and tail empty lines
            Remove the same indent white-spaces
```

# License

MIT License

Copyright (c) 2017 powjs.
