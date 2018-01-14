Used with [npm knex](https://www.npmjs.com/package/knex) to convert key case. By default this library assumes your database keys to use snakecase `my_key` and your node application to use camelcase `myKey` however these settings can be changed.

# Why

So that you can use knex with a database that uses column names in a non-ideal format for use with Javascript. If the database is storing keys in snakecase for example (a common practice), that is sub-ideal inside of your application.

Using this library:

```
const user = await db('users')
    .first('key', 'isVerified')
    .where({ id: params.userId, deletedAt: null });
```

Returns an object `{ key: 'xxxx', isVerified: true }` from a database where columns are named `id`, `key`, `is_verified`, and `deleted_at`. Which removes your snakecase concerns.

# How

By leveraging configuration options provided by knex `postProcessResponse` and `wrapIdentifier`.

* http://knexjs.org/#Installation-post-process-response

* http://knexjs.org/#Installation-wrap-identifier

You could probably do what this library does by hand if you really want, or:

# Installation

```
npm i knex --save
npm i knex-stringcase --save
```

# Usage

```
const knex = require('knex');
const knexStringcase = require('knex-stringcase');

const exampleConfigFromKnexReadme = {
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test'
  }
};

const options = knexStringcase(exampleConfigFromKnexReadme);
const db = knex(options);
```

All regular knex config options are unchanged. The two that this library decorates are extended and work as though you passed them directly.

The two knex config options this library overrides are `postProcessResponse` and `wrapIdentifier`. If you provide those options they will be run after string conversion has already taken place. If you wish to run before conversion has taken place use `beforePostProcessResponse` and `beforeWrapIdentifier` instead.

# New options

#### beforePostProcessResponse (value: string) => string

A function which runs before modifications made by this library if needed.

#### beforeWrapIdentifier (value: string) => string

A function which runs before modifications made by this library if needed.

#### dbStringcase <default: 'snakecase'>

A function or a string which describes how keys should be modified when headed to the database. If a string is provided keys will be modified by their respective function provided by the [npm stringcase](https://www.npmjs.com/package/stringcase) library. Alternatively a function can be used directly, taking the string in its current state which will give you more specific control to suit your needs.

This attribute can also be an array describing more than one alteration in sequence. eg `['snakecase', 'uppercase']`.

#### appStringcase <default: 'camelcase'>

A function or a string which describes how keys should re-enter your application from the database. This attribute may also be be an array and operates very similarly to `dbStringcase` above.

# Contribute

Sure!
