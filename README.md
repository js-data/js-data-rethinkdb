<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="96" height="96" />

# js-data-rethinkdb

[![Slack][1]][2]
[![NPM][3]][4]
[![Tests][5]][6]
[![Downloads][7]][8]
[![Coverage][9]][10]

RethinkDB adapter for the [JSData Node.js ORM][11].

### Installation

    npm install --save js-data js-data-rethinkdb

### Usage

```js
import { RethinkDBAdapter } from 'js-data-rethinkdb';

// Create an instance of RethinkDBAdapter
const adapter = new RethinkDBAdapter();

// Other JSData setup hidden

// Register the adapter instance
store.registerAdapter('rethinkdb', adapter, { default: true });
```

### JSData + RethinkDB Tutorial

Start with the [JSData + RethinkDB tutorial][12] or checkout the [API Reference Documentation][13].

### Need help?

Please [post a question][14] on Stack Overflow. **This is the preferred method.**

You can also chat with folks on the [Slack Channel][15]. If you end up getting
your question answered, please still consider consider posting your question to
Stack Overflow (then possibly answering it yourself). Thanks!

### Want to contribute?

Awesome! You can get started over at the [Contributing guide][16].

Thank you!

### License

[The MIT License (MIT)][17]

Copyright (c) 2014-2017 [js-data-rethinkdb project authors][18]

[1]: http://slack.js-data.io/badge.svg
[2]: http://slack.js-data.io
[3]: https://img.shields.io/npm/v/js-data-rethinkdb.svg?style=flat
[4]: https://www.npmjs.org/package/js-data-rethinkdb
[5]: https://img.shields.io/circleci/project/js-data/js-data-rethinkdb.svg?style=flat
[6]: https://circleci.com/gh/js-data/js-data-rethinkdb
[7]: https://img.shields.io/npm/dm/js-data-rethinkdb.svg?style=flat
[8]: https://www.npmjs.org/package/js-data-rethinkdb
[9]: https://img.shields.io/codecov/c/github/js-data/js-data-rethinkdb.svg?style=flat
[10]: https://codecov.io/github/js-data/js-data-rethinkdb
[11]: http://www.js-data.io/
[12]: http://www.js-data.io/docs/js-data-rethinkdb
[13]: http://api.js-data.io/js-data-rethinkdb
[14]: http://stackoverflow.com/questions/tagged/jsdata
[15]: http://slack.js-data.io/
[16]: https://github.com/js-data/js-data-rethinkdb/blob/master/.github/CONTRIBUTING.md
[17]: https://github.com/js-data/js-data-rethinkdb/blob/master/LICENSE
[18]: https://github.com/js-data/js-data-rethinkdb/blob/master/AUTHORS
