# knex-stringcase

**Easily convert database column names for use in your Node.js application when using [knex](https://www.npmjs.com/package/knex).**

By default, this library assumes your database uses **snake_case** (e.g., `my_key`) and your Node.js application uses **camelCase** (e.g., `myKey`). However, these settings can be customized.

---

## 🚀 Why Use knex-stringcase?

If your database columns follow a snake_case convention (a common practice), you might want to convert them into a more JavaScript-friendly camelCase for use in your application.

For example, you might have database columns like `id`, `is_verified`, `deleted_at`, but your application prefers `id`, `isVerified`, `deletedAt`. This library takes care of that conversion.

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

This is mapping database fields like `is_verified` to `isVerified` and allows you to refer to `deleted_at` using `deletedAt`. No more snake_case to camelCase troubles!

---

## 🔧 How It Works

The library leverages knex’s built-in configuration options: [`postProcessResponse`](http://knexjs.org/#Installation-post-process-response) and [`wrapIdentifier`](http://knexjs.org/#Installation-wrap-identifier), streamlining the conversion process between snake_case and camelCase without manual intervention.

---

## 🌟 Features

- **Full TypeScript support** as of version 1.5.0.
- Automatic conversion between **snake_case** and **camelCase** or custom formats.
- Option to extend and modify conversion logic with custom functions.
- Handles nested objects and subqueries.

---

## 📦 Installation

To install the package:

```bash
npm i knex-stringcase
```

---

## 📘 Usage

Integrating `knex-stringcase` with knex is straightforward:

```javascript
import knex from 'knex';
import knexStringcase from 'knex-stringcase';

const knexConfig = {
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'your_database_user',
    password: 'your_database_password',
    database: 'myapp_test'
  }
};

const db = knex(knexStringcase(knexConfig));
```

The two options this library overrides are `wrapIdentifier` and `postProcessResponse`. If you provide those options they will be run when keys are in database format. If you wish to run when keys are in application format use `appWrapIdentifier` and `appPostProcessResponse` instead (detailed below).

---

## 🆕 New Configuration Options

### `appWrapIdentifier`

```javascript
(value: string, queryContext?: unknown) => string
```
Custom function to modify identifiers before conversion. Runs when keys are still in application format, on the way to the database.

### `appPostProcessResponse`

```javascript
(result: unknown, queryContext?: unknown) => unknown
```
Custom function to process the response after conversion. Runs when keys are in application format, after the data is retrieved from the database.

### `appStringcase`

**Default: 'camelcase'**

Define how keys are converted when returning to the application. Accepts a string (e.g., `'camelcase'`) found in [stringcase](https://www.npmjs.com/package/stringcase), or a custom function.

This parameter may be an array describing more than one alteration in sequence.

```javascript
appStringcase: ['snakecase', 'uppercase']
```

### `stringcase`

**Default: 'snakecase'**

Define how keys are modified when heading to the database. This attribute may also be be an array and operates closely to how `appStringcase` operates above.

### `recursiveStringcase`

```javascript
(value: object, path: string, queryContext?: unknown) => boolean
```
A function to control nested object conversions (useful for subqueries or JSON fields). The function receives the object and its path in dot notation. Return `true` to convert the object.

---

## 🔄 Upgrade Guide (1.4.0 → 1.5.0)

Starting from version 1.5.0, **TypeScript support** is available out-of-the-box.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request. Note that we avoid dependencies whenever possible.
