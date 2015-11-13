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
