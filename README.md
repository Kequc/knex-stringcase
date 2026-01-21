# knex-stringcase

Convert database column names when using knex.

This library helps map database naming conventions such as `snake_case` to application-friendly formats such as `camelCase`, and back again, using knex’s built-in hooks. By default, database keys are assumed to be `snake_case` and application keys `camelCase`.

But this can be changed if needed.

## Why

If your database uses columns like:

- `is_verified`
- `deleted_at`

but your application code prefers:

- `isVerified`
- `deletedAt`

this library performs the conversion automatically when querying and when returning results.

Example:

```js
const user = await db('users')
  .first('id', 'isVerified')
  .where({ id: params.userId, deletedAt: null });
````

Result:

```json
{
  "id": "xxxx",
  "isVerified": true
}
```

You write application-style keys. The database still uses its own conventions.

## How it works

knex exposes two configuration hooks:

* `wrapIdentifier`
* `postProcessResponse`

This library wires those hooks for you and applies configurable key conversion in both directions. You can still provide your own hooks. They will be run at the appropriate stage.

## Installation

```bash
npm install knex-stringcase
```

## Usage

### CommonJS

```js
const knexStringcase = require('knex-stringcase');
```

### ESM (recommended)

```js
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
  ...knexStringcase()
});
```

This library overwrites `wrapIdentifier` and `postProcessResponse` internally. If you want to provide your own versions, pass them as options. They will be run when keys are still in database format.

If you need hooks that run when keys are in application format, use the `app*` variants described below.

## Options

### `stringcase`

Default: `'snakecase'`

Controls how keys are converted when sending queries to the database. Accepts a string supported by the `stringcase` package or a custom function. Multiple transformations may be provided as an array.

```js
stringcase: ['snakecase', value => 'db_' + value]
// 'myKey' -> 'db_my_key'
```

### `appStringcase`

Default: `'camelcase'`

Controls how keys are converted when data is returned to the application. Accepts the same formats as `stringcase`.

### `wrapIdentifier`

Custom knex `wrapIdentifier` hook. If provided, it will run after key conversion, when keys are in database format.

See knex documentation:
[https://knexjs.org/guide/#wrapidentifier](https://knexjs.org/guide/#wrapidentifier)

### `appWrapIdentifier`

```ts
(value: string, queryContext?: unknown) => string
```

Runs before key conversion, while keys are still in application format.

### `postProcessResponse`

Custom knex `postProcessResponse` hook. If provided, it will run before application-level conversion, when keys are still in database format.

See knex documentation:
[https://knexjs.org/guide/#postprocessresponse](https://knexjs.org/guide/#postprocessresponse)

### `appPostProcessResponse`

```ts
(result: unknown, queryContext?: unknown) => unknown
```

Runs after conversion, when keys are already in application format.

### `recursiveStringcase`

```ts
(value: object, path: string, queryContext?: unknown) => boolean
```

Controls whether nested objects are converted. The function receives the object, its dot-path, and the query context. Return `true` to convert. Useful for subqueries or JSON fields.

## Upgrade notes

### 1.6

Should support esm and commonjs environments equally.

### 1.5.5

`knexStringcase()` no longer wraps the entire knex configuration object. It can now be spread directly into the options.

### 1.5.0

TypeScript support added.

## Contributing

Issues and pull requests are welcome. Dependencies are kept minimal by design.
