<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## js-data-rethinkdb

RethinkDB adapter for [js-data](http://www.js-data.io/js-data).

## API Documentation
[DSRethinkDBAdapter](https://github.com/js-data/js-data/wiki/DSRethinkDBAdapter)

## Project Status

| Branch | Master |
| ------ | ------ |
| NPM | [![NPM version](https://badge.fury.io/js/js-data-rethinkdb.png)](http://badge.fury.io/js/js-data-rethinkdb) |
| Build Status | [![Build Status](https://travis-ci.org/js-data/js-data-rethinkdb.png?branch=master)](https://travis-ci.org/js-data/js-data-rethinkdb) |
| Code Climate | [![Code Climate](https://codeclimate.com/github/js-data/js-data-rethinkdb.png)](https://codeclimate.com/github/js-data/js-data-rethinkdb) |
| Dependency Status | [![Dependency Status](https://gemnasium.com/js-data/js-data-rethinkdb.png)](https://gemnasium.com/js-data/js-data-rethinkdb) |
| Coverage | [![Coverage Status](https://coveralls.io/repos/js-data/js-data-rethinkdb/badge.png?branch=master)](https://coveralls.io/r/js-data/js-data-rethinkdb?branch=master) |

## Quick Start
`npm install --save js-data js-data-rethinkdb`.

```js
var JSData = require('js-data');
var DSRethinkDBAdapter = require('js-data-rethinkdb');

var store = new JSData.DS();

// "r" will be available at adapter.r
var adapter = new DSRethinkDBAdapter();

store.registerAdapter('rethinkdb', adapter, { default: true });

// "store" will now use the RethinkDB adapter for all async operations
```

## Changelog
[CHANGELOG.md](https://github.com/js-data/js-data-rethinkdb/blob/master/CHANGELOG.md)

## Community
- [Mailing List](https://groups.io/org/groupsio/jsdata) - Ask your questions!
- [Issues](https://github.com/js-data/js-data-rethinkdb/issues) - Found a bug? Feature request? Submit an issue!
- [GitHub](https://github.com/js-data/js-data-rethinkdb) - View the source code for js-data.
- [Contributing Guide](https://github.com/js-data/js-data-rethinkdb/blob/master/CONTRIBUTING.md)

## Contributing

First, feel free to contact me with questions. [Mailing List](https://groups.io/org/groupsio/jsdata). [Issues](https://github.com/js-data/js-data-rethinkdb/issues).

1. Contribute to the issue that is the reason you'll be developing in the first place
1. Fork js-data-rethinkdb
1. `git clone https://github.com/<you>/js-data-rethinkdb.git`
1. `cd js-data-rethinkdb; npm install; bower install;`
1. `grunt go` (builds and starts a watch)
1. (in another terminal) `grunt karma:dev` (runs the tests)
1. Write your code, including relevant documentation and tests
1. Submit a PR and we'll review

## License

The MIT License (MIT)

Copyright (c) 2014 Jason Dobry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
