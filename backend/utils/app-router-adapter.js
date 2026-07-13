import { NextResponse } from 'next/server';

export function wrapHandler(pagesHandler) {
  return async (request, { params } = {}) => {
    const req = {
      method: request.method,
      headers: Object.fromEntries(request.headers),
      query: Object.fromEntries(request.nextUrl.searchParams),
      user: null,
    };

    if (params) {
      req.query = { ...req.query, ...params };
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        req.body = await request.clone().json();
      } catch {
        req.body = {};
      }
    }

    let resolveResponse;
    const responsePromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });

    let statusCode = 200;

    const res = {
      _responded: false,
      _data: null,
      status(code) {
        if (this._responded) return this;
        statusCode = code;
        return this;
      },
      json(data) {
        if (this._responded) return;
        this._responded = true;
        this._data = data;
        resolveResponse({ status: statusCode, data });
      },
      setHeader() {
        return this;
      },
      end() {
        if (!this._responded) {
          this._responded = true;
          resolveResponse({ status: statusCode, data: this._data });
        }
      },
    };

    pagesHandler(req, res);

    const { status, data } = await responsePromise;
    return NextResponse.json(data, { status });
  };
}
