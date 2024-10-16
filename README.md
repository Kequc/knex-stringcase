# knex-stringcase

**Easily convert database column names for use in your Node.js application when using [knex](https://www.npmjs.com/package/knex).**

By default, this library assumes your database uses **snake_case** and your Node.js application uses **camelCase**. However, these settings can be changed.

## 🚀 Why Knex Stringcase?

If your database columns follow a snake_case convention (a common practice), you might want to convert them into a more JavaScript-friendly camelCase for use in your application.

For example, you might have database columns `id`, `is_verified`, `deleted_at`, but your application prefers `id`, `isVerified`, `deletedAt`. This library takes care of that conversion.

Example usage:

```javascript
const user = await db('users')
    .first('id', 'isVerified')
    .where({ id: params.userId, deletedAt: null });
```

This will return an object:
```json
{
  "id": "xxxx",
  "isVerified": true
}
```

This is maps database field `is_verified` to `isVerified` and allows you to refer to `deleted_at` using `deletedAt`. No more snake_case to camelCase troubles!

## 🔧 How It Works

By leveraging knex’s built-in configuration options: [`wrapIdentifier`](http://knexjs.org/#Installation-wrap-identifier) and [`postProcessResponse`](http://knexjs.org/#Installation-post-process-response). You can use these configuration options yourself, this library just makes the conversions simpler.

## 🌟 Features

- **Full TypeScript support** as of version 1.5.0.
- Automatic conversion between **snake_case** and **camelCase** or custom formats.
- Extend and modify conversion logic with custom functions.
- Handles nested objects and subqueries.

## 📦 Installation

Use npm (or yarn, pnpm, etc.):

```bash
npm i knex-stringcase
```

## 📘 Usage

Add `knex-stringcase` to your knex configuration.

```javascript
import knex from 'knex';
import knexStringcase from 'knex-stringcase';

const db = knex({
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'your_database_user',
    password: 'your_database_password',
    database: 'myapp_test'
  },
  ...knexStringcase(),
});
```

This library overwrites `wrapIdentifier` and `postProcessResponse` pass them as library options instead, they will be run when keys are in database format. If you wish to run when keys are in application format use `appWrapIdentifier` and `appPostProcessResponse`.

## 📰 Library Options

### `stringcase`

**Default: 'snakecase'**

Define how keys are modified when heading to the database. Accepts a string found in [`stringcase`](https://www.npmjs.com/package/stringcase) (e.g. `'snakecase'`), or a custom function.

This parameter may be an array describing more than one alteration in sequence.

```javascript
stringcase: ['snakecase', (value) => 'db_' + value]
// 'myKey' => 'db_my_key'
```

### `appStringcase`

**Default: 'camelcase'**

Define how keys are converted when returning to the application. This attribute may also be be an array and operates closely to how `stringcase` operates above.

### `wrapIdentifier`

In order to use this knex feature with the library ensure that you pass it as a parameter.

[`Knex documentation`](http://knexjs.org/#Installation-wrap-identifier)

### `appWrapIdentifier`

```javascript
(value: string, queryContext?: unknown) => string
```
Custom function to modify identifiers before conversion. Runs when keys are still in application format, on the way to the database.

### `postProcessResponse`

In order to use this knex feature with the library ensure that you pass it as a parameter.

[`Knex documentation`](http://knexjs.org/#Installation-post-process-response)

### `appPostProcessResponse`

```javascript
(result: unknown, queryContext?: unknown) => unknown
```
Custom function to process the response after conversion. Runs when keys are in application format, after the data is retrieved from the database.

### `recursiveStringcase`

```javascript
(value: object, path: string, queryContext?: unknown) => boolean
```
A function to control nested object conversions (useful for subqueries or JSON fields). The function receives the object and its path in dot notation. Return `true` to convert the object.

## 🔄 Upgrade Guide (1.5.0 → 1.5.5)

`1.5.5`: `knexStringcase()` no longer has to wrap your entire knex configuration instead you can insert it into the options.

`1.5.0`: **TypeScript support** is available out-of-the-box.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request. Note that we avoid dependencies whenever possible.
