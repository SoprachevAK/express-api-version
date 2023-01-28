import { versionParser, versionSatisfies } from '../src';

const createReqRes = (version: string) => {
  let req: any = { headers: { 'x-api-version': version } };

  const next = jest.fn();
  const res: any = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  }

  return { req, res, next };
}


describe('test versionParser', () => {
  it('parse allowCoerce', done => {
    const { req, res, next } = createReqRes('v1.2');
    versionParser('headers.x-api-version', true)(req, res, next);
    expect(req.apiSemver.raw).toBe('1.2.0');
    expect(next).toBeCalled();
    done();
  })

  it('parse allowCoerce by default', done => {
    const { req, res, next } = createReqRes('v1.2');
    versionParser('headers.x-api-version')(req, res, next);
    expect(req.apiSemver.raw).toBe('1.2.0');
    expect(next).toBeCalled();
    done();
  })

  it('parse disallowCoerce', done => {
    const { req, res, next } = createReqRes('v1.2');
    versionParser('headers.x-api-version', false)(req, res, next);
    expect(res.status).toBeCalledWith(400);
    done();
  })

  it('parse disallowCoerce', done => {
    const { req, res, next } = createReqRes('v1.2');
    versionParser('headers.x-api-version', true)(req, res, next);
    expect(req.apiSemver.raw).toBe('1.2.0');
    expect(next).toBeCalled();
    done();
  })

  it('wrong version allowCoerce', done => {
    const { req, res, next } = createReqRes('aboba');
    versionParser('headers.x-api-version', true)(req, res, next);
    expect(res.status).toBeCalledWith(400);
    done();
  })

  it('wrong version disallowCoerce', done => {
    const { req, res, next } = createReqRes('42.wr');
    versionParser('headers.x-api-version', false)(req, res, next);
    expect(res.status).toBeCalledWith(400);
    done();
  })

  it('version undefined', done => {
    const { req, res, next } = createReqRes('1.0.0');
    versionParser('headers.version', false)(req, res, next);
    expect(res.status).toBeCalledWith(400);
    done();
  })

  it('version undefined path like array', done => {
    const { req, res, next } = createReqRes('1.0.0');
    versionParser(['headers', 'version'], false)(req, res, next);
    expect(res.status).toBeCalledWith(400);
    done();
  })

  it('version path like array', done => {
    const { req, res, next } = createReqRes('1.2.0');
    versionParser(['headers', 'x-api-version'], false)(req, res, next);
    expect(req.apiSemver.raw).toBe('1.2.0');
    expect(next).toBeCalled();
    done();
  })
})

describe('test versionSatisfies', () => {
  it('test versionSatisfies range ok', done => {
    const { req, res, next } = createReqRes('v1.2.0');

    versionParser('headers.x-api-version', true)(req, res, () => { });
    versionSatisfies('1.0.0 - 1.2.3')(req, res, next);

    expect(next).toBeCalledWith();
    done();
  })

  it('test versionSatisfies range fail', done => {
    const { req, res, next } = createReqRes('v1.5.0');

    versionParser('headers.x-api-version', true)(req, res, () => { });
    versionSatisfies('1.0.0 - 1.2.3')(req, res, next);

    expect(next).toBeCalledWith('route');
    done();
  })

  it('test versionSatisfies without parser', done => {
    const { req, res, next } = createReqRes('v1.2.0');

    versionSatisfies('1.0.0 - 1.2.3')(req, res, next);

    expect(next).toBeCalledWith('route');
    done();
  })
})
