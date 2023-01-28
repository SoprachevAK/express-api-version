import { Request, Response, NextFunction } from 'express';
import { parse, coerce, satisfies, Range, SemVer } from 'semver';

declare global {
  namespace Express {
    export interface Request {
      apiSemver?: SemVer;
    }
  }
}

declare type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

function resolve(path: string | string[], obj: Object, separator = '.') {
  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev: any, curr) => prev?.[curr], obj);
}

/**
 * Create a middleware that parses a version from a request
 * @param versionPath The path to the version in the request. Can be a string or an array of strings
 * @param allowCoerce Whether or not to allow coerced versions. For example, `v1.2` will be coerced to `1.2.0`
 * @example
 * versionParser('headers.x-api-version')
 * versionParser(['headers', 'x-api-version'])
 * versionParser('headers.x-api-version', false)
 */

export function versionParser(versionPath: string | string[], allowCoerce: boolean = true): Middleware {
  return (req, res, next) => {
    const version = resolve(versionPath, req);
    if (version === undefined)
      return res.status(400).send(`Missing version in request.${Array.isArray(versionPath) ? versionPath.join('.') : versionPath}`);

    const semver = parse(allowCoerce ? coerce(version) : version);

    if (semver === null)
      return res.status(400).send(`Invalid version: ${version}. Expected semver format ${allowCoerce ? 'or coerceable' : ''}}`);

    req.apiSemver = semver;

    next();
  };
}

/**
 * Create a middleware that will pass control to the next matching
 * route if the requested version does not satisfy the provided range.
 *
 * @param {string} version - The version range to check against.
 * @example versionSatisfies('1.0.0 - 1.2.3')
 * versionSatisfies('>=1.0.0')
 */

export function versionSatisfies(version: string): Middleware {
  const range = new Range(version);

  return (req, res, next) => {
    const semver = req.apiSemver;
    if (semver === undefined) return next('route');

    if (!satisfies(semver, range)) return next('route');

    next();
  };
}
