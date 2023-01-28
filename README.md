# express-api-version

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Code Coverage][codecov-img]][codecov-url]

> The module adds convenient versioning to your project. You can specify versions anywhere of request (path, query, headers). Use `semver` format. Before each handler, put a middleware with a version check, if it does not satisfies, there will be a continue to the next handler.

## Install

```bash
npm install express-api-version
```

## Usage

Add `versionParser` middleware and specialize the path to version relative to the `Request`.

```ts
import express from 'express'
import { versionParser, versionSatisfies } from 'express-api-version'

const app = express()

app.use(versionParser('query.v')) // Request.query.v

// curl -s localhost:5000/test?v=1.1.2
app.get('/test', versionSatisfies('1.0.0 - 1.2.3'), (req, res) => {
  return res.send('1')
})

// curl -s localhost:5000/test?v=0.3.0
app.get('/test', versionSatisfies('<1.0.0'), (req, res) => {
  return res.send('0')
})

app.listen(5000)
```

For using `x-api-version` header:

```ts
app.use(versionParser('headers.x-api-version'))
```

[npm-img]: https://img.shields.io/npm/v/express-api-version
[npm-url]: https://www.npmjs.com/package/express-api-version
[build-img]: https://github.com/SoprachevAK/express-api-version/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/SoprachevAK/express-api-version/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/express-api-version
[downloads-url]: https://www.npmtrends.com/express-api-version
[codecov-img]: https://codecov.io/gh/SoprachevAK/express-api-version/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/SoprachevAK/express-api-version
