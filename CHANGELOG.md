##### 3.0.0-rc.3 - 17 October 2016

###### Bug fixes
- #24 - Fixed update throwing error when record was unchanged.

##### 3.0.0-rc.2 - 23 August 2016

###### Backwards compatible changes
- Add support for `fields` option to `find` and `findAll`.

##### 3.0.0-rc.1 - 15 August 2016

###### Backwards compatible changes
- Upgrade dependencies

##### 3.0.0-beta.8 - 08 July 2016

###### Backwards compatible changes
- RethinkDBAdapter now inherits from Adapter via the `extend` method

##### 3.0.0-beta.7 - 29 June 2016

###### Backwards compatible changes
- Upgraded dependencies

##### 3.0.0-beta.6 - 17 May 2016

###### Backwards compatible changes
- Added support for grouped "where" clauses

##### 3.0.0-beta.5 - 10 May 2016

###### Breaking changes
- Removed default import, which wasn't working

##### 3.0.0-beta.4 - 10 May 2016

###### Breaking changes
- Moved `rethinkdbdash` options to `RethinkDBAdapter#rOpts`.

##### 3.0.0-beta.3 - 30 April 2016

- Upgraded to `js-data-adapter` v0.6.1

##### 3.0.0-beta.2 - 29 April 2016

###### Breaking changes
- How you must now import in ES2015:

    ```js
    import RethinkDBAdapter from 'js-data-rethinkdb'
    const adapter = new RethinkDBAdapter()
    ```
    or
    ```js
    import {RethinkDBAdapter, version} from 'js-data-rethinkdb'
    console.log(version)
    const adapter = new RethinkDBAdapter()
    ```

- How you must now import in ES5:

    ```js
    var JSDataRethinkDB = require('js-data-rethinkdb')
    var RethinkDBAdapter = JSDataRethinkDB.RethinkDBAdapter
    var adapter = new RethinkDBAdapter()
    ```

- `OPERATORS` is now an export, not a static property of the `RethinkDBAdapter` class.
- Moved some `dist` files to `release` to reduce noise

###### Other
- Upgraded dependencies
- Improved JSDoc comments
- Now using js-data JSDoc template

##### 3.0.0-beta.1 - 17 April 2016

Official v3 beta release

###### Other
- Upgraded dependencies

##### 3.0.0-alpha.13 - 17 March 2016

###### Backwards incompatible API changes
- Added sum and count methods

##### 3.0.0-alpha.12 - 10 March 2016

###### Other
- Moved more common adapter functionality into js-data-adapter

##### 3.0.0-alpha.11 - 06 March 2016

###### Backwards compatible bug fixes
- create() now makes use of withoutRelations()
- More use of Adapter#respond() more consistent

##### 3.0.0-alpha.10 - 06 March 2016

###### Backwards compatible API changes
- Now making use of makeHasManyForeignKeys

##### 3.0.0-alpha.9 - 06 March 2016

###### Other
- Upgraded js-data-adapter

##### 3.0.0-alpha.8 - 06 March 2016

###### Other
- Extracted common adapter functionality into js-data-adapter
- Extracted common js-data repo utility scripts into js-data-repo-tools

##### 3.0.0-alpha.7 - 03 March 2016

###### Backwards compatible API changes
- Added RethinkDBAdapter.extend

##### 3.0.0-alpha.6 - 01 March 2016

###### Backwards compatible bug fixes
- Couple of fixes based on the latest js-data-adapter-tests

##### 3.0.0-alpha.5 - 27 February 2016

###### Backwards compatible API changes
- Added ability to override query operators used by RethinkDBAdapter#filterSequence.

###### Other
- Improved JSDoc comments.

##### 3.0.0-alpha.4 - 26 February 2016

###### Other
- Finished JSDoc comments

##### 3.0.0-alpha.3 - 26 February 2016

###### Backwards compatible API changes
- Removed returnDeletedIds option
- Added insertOpts, updateOpts, deleteOpts, and runOpts options

##### 3.0.0-alpha.2 - 26 February 2016

###### Backwards compatible bug fixes
- Fixed edge case with returnDeletedIds

##### 3.0.0-alpha.1 - 26 February 2016

###### Breaking API changes
- Now depends on js-data 3.x
- Now longer uses internal `defaults` property, settings are on the adapter instance itself

###### Backwards compatible API changes
- Added createMany and updateMany methods
- Added lifecycle hooks for all methods
- Added contains, notContains, |contains, and |notContains operators

##### 2.2.0 - 25 February 2016

###### Other
- General improvements

##### 2.1.0 - 26 October 2015

###### Backwards compatible bug fixes
- #16 - Handle cursor errors by @BBB

###### Other
- Removed Grunt
- Tests now use yield and generators

##### 2.0.3 - 13 October 2015

###### Backwards compatible bug fixes
- #13, #14 - Using `where` in a query without an operator breaks by @internalfx

##### 2.0.2 - 09 September 2015

###### Backwards compatible bug fixes
- #9 - CI tests failing because of outdated npm

##### 2.0.1 - 03 July 2015

###### Backwards compatible bug fixes
- #8 - update/updateAll fail if there are no changes

##### 2.0.0 - 02 July 2015

Stable Version 2.0.0

##### 1.2.0 - 26 March 2015

###### Backwards compatible API changes
- #3 - Add support for loading relations
- #4 - Add support for auto-creating secondary indexes based on the relation definitions

###### Backwards compatible bug fixes
- #5 - Should not be saving relations (duplicating data)
- #6 - Need to use removeCircular

##### 1.1.2 - 07 March 2015

###### Other
- Converted to ES6, using Babel.js to transpile to ES5.

##### 1.1.1 - 25 February 2015

- Updated dependencies

##### 1.1.0 - 05 February 2015

- #3, #4 - Added the `with` option to `DSRethinkDBAdapter#find` which allows for loading relations.

##### 1.0.0 - 03 February 2015

Stable Version 1.0.0

##### 1.0.0-beta.1 - 12 January 2015

Now in beta.

##### 1.0.0-alpha.5 - 28 November 2014

###### Backwards compatible API changes
- Added isectEmpty, isectNotEmpty, |isectEmpty, and |isectNotEmpty filter operators.

##### 1.0.0-alpha.4 - 23 November 2014

###### Backwards compatible bug fixes
- Fixed improper use of r.row in nested queries

##### 1.0.0-alpha.3 - 23 November 2014

###### Backwards compatible bug fixes
- Fixed the "in", "notIn", "|in", and "|notIn" operators

##### 1.0.0-alpha.2 - 23 November 2014

Upgraded dependencies

##### 1.0.0-alpha.1 - 01 November 2014

###### Backwards compatible API changes
- #1 - auto create db and tables if they don't exist

##### 0.2.0 - 03 October 2014

###### Breaking API changes
- #2 - use something other than resourceConfig.endpoint for determining the table for a resource

##### 0.1.1 - 03 October 2014

- Now using db correctly

##### 0.1.0 - 03 October 2014

- Initial Release
