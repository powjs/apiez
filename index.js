"use strict"

module.exports = function apiez(FunctionOrObject, formatter) {
    // FunctionOrObject  function or object with methds
    // formatter         format function
    // results           object or formatter(object)
    var doc = Object.create(null);

    docez(FunctionOrObject, doc)

    if (typeof formatter == 'function')
        return formatter(doc)
    if (formatter) return format(doc)

    return doc
}

function format(doc) {
    return JSON.stringify(doc, null, '    ')
}

function docez(x, doc) {
    var k;
    if (!x) return
    if (typeof x == 'function') {
        k = x.name || 'anonymous'
        doc[k] = Object.create(null)
        func(x, doc[k])
        return
    }

    if (typeof x == 'object' && !Array.isArray(x))
        Object.keys(x).forEach(function(k) {
            if (typeof x[k] != 'function') return
            if (!doc[k])
                doc[k] = Object.create(null);
            func(x[k], doc[k])
        })

}

function func(x, doc) {
    setDoc(x, doc)
    x = x.prototype
    if (x && typeof x == 'object' && !Array.isArray(x)) {
        Object.keys(x).forEach(function(k) {
            if (typeof x[k] != 'function') return
            if (!doc.methods)
                doc.methods = Object.create(null);
            doc.methods[k] = Object.create(null);
            setDoc(x[k], doc.methods[k])
        })
    }
}

function setDoc(x, doc) {
    var code = x.toString(),
        match = code.match(/^function[^(]*\(([^)]*)\)[^{]*\{/);
    var d = genArgs((match[1] || '')) || null

    if (d)
        doc.args = d

    d = genDoc(code.slice(match[0].length).trimLeft())

    if (d)
        doc.doc = d
}

function genArgs(code) {
    var i = 0,
        a = '',
        c = '',
        args = [];

    while (code.length) {
        i = code.search(/,|\/\*/)

        if (i == -1) {
            a = code.trim()
            if (a) args.push(a)
            break
        }

        a = code.substring(0, i).trim()
        c = code[i]
        code = code.slice(i + (c == ',' && 1 || 2)).trim()

        if (c == ',') {
            // (a , /*c,*/ b)
            if (!code.startsWith('/*')) {
                if (a) args.push(a)
                continue
            }
            code = code.slice(2).trim()
        }

        i = code.indexOf('*/')
        c = code.substring(0, i)
            .replace(/^\*+/, '')
            .replace(/\*+\*$/, '')
            .trim()

        code = code.slice(i + 2).trim()
        if (a.endsWith(','))
            a = a.slice(0, -1)
        else if (code && code[0] == ',')
            code = code.slice(1)

        if (!a) continue

        if (!c)
            args.push(a)
        else if (-1 == c.search(/\n\r|\n|\r/))
            args.push([a, c])
        else
            args.push([a].concat(c.split(/\n\r|\n|\r/).map(function(s) {
                return s.trim()
            }).filter(function(s) {
                return !!s
            })))
    }
    return args.length && args || null
}

function genDoc(code) {
    var i,
        j,
        prefix,
        lines;

    if (!code || code[0] != '/') return null

    if (code[1] == '/') {
        lines = []
        while (code.length > 2 && code[0] == '/' && code[1] == '/') {
            i = code.search(/\n\r|\n|\r/)
            if (i == -1)
                i = code.length

            prefix = code.slice(code[2] == ' ' && 3 || 2, i).trimRight()

            if (prefix || lines.length)
                lines.push(prefix)

            i++
            if (code[i] == '\r') i++
            j = code.indexOf('/', i)
            if (j == -1) break
            prefix = code.slice(i, j)
            if (prefix.search(/\n\r|\n|\r/) != -1) break

            code = code.slice(i).trimLeft()
        }

        i = lines.length
        while (i && !lines[i - 1]) {
            lines.pop();
            i--;
        }

        return lines.length && lines || null
    }

    if (code[1] != '*') return null;

    i = 1
    while (code[i] == '*') i++;
    j = code.indexOf('*/')

    if (j == -1) return null

    while (j && code[j] == '*') j--;
    lines = code.slice(i, j).trimRight().split(/\n\r|\n|\r/)

    i = 0
    lines.some(function(s) {
        s = s.trimRight()
        if (!s) return i++ && false

        if (s[0] == ' ' || s[0] == '\t')
            prefix = s.substring(0, s.length - s.trimLeft().length)
        return true
    })

    if (i)
        lines = lines.slice(i);

    j = 0
    lines = lines.map(function(s) {
        if (prefix && s.startsWith(prefix))
            s = s.slice(prefix.length)
        s = s.trimRight()
        if (s) j++
        return s
    })

    if (!j) return null

    return lines
}
