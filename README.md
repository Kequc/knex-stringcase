# knex-stringcase

**Used with [npm knex](https://www.npmjs.com/package/knex) to convert database column names for use by a node application.**

By default this library assumes your database columns use snakecase `my_key` and your node application uses camelcase `myKey`, however these settings can be changed.

## Why

If the database has column names that are all in snakecase for example (a common practice), then that can be sub-ideal in your application.

With this library:

```javascript
const user = await db('users')
    .first('key', 'isVerified')
    .where({ id: params.userId, deletedAt: null });
```

Returns an object `{ key: 'xxxx', isVerified: true }` from a database where columns are named `id`, `key`, `is_verified`, and `deleted_at`. Removing your snakecase concerns.

## How

By leveraging these configuration options provided by knex `postProcessResponse` and `wrapIdentifier`.

* http://knexjs.org/#Installation-post-process-response

* http://knexjs.org/#Installation-wrap-identifier

Knex provides these options but this library acts as a helper to make the conversions simpler.

## Upgrading 1.3.0 -> 1.4.0

* Option `dbStringcase` is renamed `stringcase`.
* Option `ignoreStringcase` has been removed.
* Objects are not converted recursively anymore you must explicitly define which nested objects to convert using the `recursiveStringcase` option.

## Installation

```
npm i knex --save
npm i knex-stringcase --save
```

## Usage

```javascript
const knex = require('knex');
const knexStringcase = require('knex-stringcase');

const configFromKnexReadme = {
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test'
  }
};

const options = knexStringcase(configFromKnexReadme);
const db = knex(options);
```

The two knex config options this library overrides are `wrapIdentifier` and `postProcessResponse`. If you provide those options they will be run when keys are in database format. If you wish to run when keys are in application format use `appWrapIdentifier` and `appPostProcessResponse` instead.

## New options

#### appWrapIdentifier

```javascript
(value: string, queryContext: object) => string
```

A function which will run before modifications made by this library, when keys are still in application format on the way to the database.

#### appPostProcessResponse

```javascript
(result: array|object, queryContext: object) => array|object
```

A function which will run after modifications made by this library, when keys are in application format.

#### appStringcase

```
default 'camelcase'
```

A function or a string which describes how keys should re-enter your application from the database. If a string is provided keys will be modified by their respective function found in [npm stringcase](https://www.npmjs.com/package/stringcase). Alternatively a function can be passed, taking the string in its current state which will give you more control to suit your needs.

This parameter may be an array describing more than one alteration in sequence. eg `['snakecase', 'uppercase']`.

#### stringcase

```
default 'snakecase'
```

A function or a string which describes how keys should be modified when headed to the database. This attribute may also be be an array and operates very similarly to `appStringcase` above.

#### recursiveStringcase

```javascript
(obj: array|object, name: string, queryContext: object) => boolean
```

A function which can be used to perform conversion on nested objects returned from the database. If true is returned the object is converted. This is useful in case you are using sub queries or just want your processed JSON fields converted.

`recursiveStringcase: () => true`

The second parameter will give you the name of the field in database format in dot notation prefixed with root `"root.name.name"`.

`recursiveStringcase: (obj, name) => name === 'root.my_field'`

## Contribute

Sure! Except for typescript definitions and anything with a dependency.
