var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
}, "bufferToFormData");

// node_modules/hono/dist/utils/body.js
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match3, index) => {
    const mark = `@${index}`;
    groups.push([mark, match3]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match3 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match3) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match3[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match3[1], new RegExp(`^${match3[2]}(?=/${next})`)] : [label, match3[1], new RegExp(`^${match3[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match3[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str2, decoder) => {
  try {
    return decoder(str2);
  } catch {
    return str2.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match3) => {
      try {
        return decoder(match3);
      } catch {
        return match3;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str2) => tryDecode(str2, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str2) => tryDecode(str2, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str2, phase, preserveCallbacks, context, buffer) => {
  if (typeof str2 === "object" && !(str2 instanceof String)) {
    if (!(str2 instanceof Promise)) {
      str2 = str2.toString();
    }
    if (str2 instanceof Promise) {
      str2 = await str2;
    }
  }
  const callbacks = str2.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str2);
  }
  if (buffer) {
    buffer[0] += str2;
  } else {
    buffer = [str2];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str22) => resolveCallback(str22, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m2 of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m2.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input, requestInit, Env2, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env2, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env2,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match22 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match22;
  return match22(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m2) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m2];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h2]) => [h2, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h2, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h2, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m2) => {
          middleware[m2][path] ||= findMiddleware(middleware[m2], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(middleware[m2]).forEach((p) => {
            re.test(p) && middleware[m2][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(routes[m2]).forEach(
            (p) => re.test(p) && routes[m2][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          routes[m2][path2] ||= [
            ...findMiddleware(middleware[m2], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m2][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m2 = /* @__PURE__ */ Object.create(null);
      m2[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m2];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m2 = node.#methods[i];
      const handlerSet = m2[method] || m2[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m2 = matcher.exec(restPathString);
            if (m2) {
              params[name] = m2[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m2[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m2[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/grammy/out/web.mjs
var filterQueryCache = /* @__PURE__ */ new Map();
function matchFilter(filter) {
  const queries = Array.isArray(filter) ? filter : [
    filter
  ];
  const key = queries.join(",");
  const predicate = filterQueryCache.get(key) ?? (() => {
    const parsed = parse(queries);
    const pred = compile(parsed);
    filterQueryCache.set(key, pred);
    return pred;
  })();
  return (ctx) => predicate(ctx);
}
__name(matchFilter, "matchFilter");
function parse(filter) {
  return Array.isArray(filter) ? filter.map((q) => q.split(":")) : [
    filter.split(":")
  ];
}
__name(parse, "parse");
function compile(parsed) {
  const preprocessed = parsed.flatMap((q) => check(q, preprocess(q)));
  const ltree = treeify(preprocessed);
  const predicate = arborist(ltree);
  return (ctx) => !!predicate(ctx.update, ctx);
}
__name(compile, "compile");
function preprocess(filter) {
  const valid = UPDATE_KEYS;
  const expanded = [
    filter
  ].flatMap((q) => {
    const [l1, l2, l3] = q;
    if (!(l1 in L1_SHORTCUTS)) return [
      q
    ];
    if (!l1 && !l2 && !l3) return [
      q
    ];
    const targets = L1_SHORTCUTS[l1];
    const expanded2 = targets.map((s2) => [
      s2,
      l2,
      l3
    ]);
    if (l2 === void 0) return expanded2;
    if (l2 in L2_SHORTCUTS && (l2 || l3)) return expanded2;
    return expanded2.filter(([s2]) => !!valid[s2]?.[l2]);
  }).flatMap((q) => {
    const [l1, l2, l3] = q;
    if (!(l2 in L2_SHORTCUTS)) return [
      q
    ];
    if (!l2 && !l3) return [
      q
    ];
    const targets = L2_SHORTCUTS[l2];
    const expanded2 = targets.map((s2) => [
      l1,
      s2,
      l3
    ]);
    if (l3 === void 0) return expanded2;
    return expanded2.filter(([, s2]) => !!valid[l1]?.[s2]?.[l3]);
  });
  if (expanded.length === 0) {
    throw new Error(`Shortcuts in '${filter.join(":")}' do not expand to any valid filter query`);
  }
  return expanded;
}
__name(preprocess, "preprocess");
function check(original, preprocessed) {
  if (preprocessed.length === 0) throw new Error("Empty filter query given");
  const errors = preprocessed.map(checkOne).filter((r) => r !== true);
  if (errors.length === 0) return preprocessed;
  else if (errors.length === 1) throw new Error(errors[0]);
  else {
    throw new Error(`Invalid filter query '${original.join(":")}'. There are ${errors.length} errors after expanding the contained shortcuts: ${errors.join("; ")}`);
  }
}
__name(check, "check");
function checkOne(filter) {
  const [l1, l2, l3, ...n] = filter;
  if (l1 === void 0) return "Empty filter query given";
  if (!(l1 in UPDATE_KEYS)) {
    const permitted = Object.keys(UPDATE_KEYS);
    return `Invalid L1 filter '${l1}' given in '${filter.join(":")}'. Permitted values are: ${permitted.map((k) => `'${k}'`).join(", ")}.`;
  }
  if (l2 === void 0) return true;
  const l1Obj = UPDATE_KEYS[l1];
  if (!(l2 in l1Obj)) {
    const permitted = Object.keys(l1Obj);
    return `Invalid L2 filter '${l2}' given in '${filter.join(":")}'. Permitted values are: ${permitted.map((k) => `'${k}'`).join(", ")}.`;
  }
  if (l3 === void 0) return true;
  const l2Obj = l1Obj[l2];
  if (!(l3 in l2Obj)) {
    const permitted = Object.keys(l2Obj);
    return `Invalid L3 filter '${l3}' given in '${filter.join(":")}'. ${permitted.length === 0 ? `No further filtering is possible after '${l1}:${l2}'.` : `Permitted values are: ${permitted.map((k) => `'${k}'`).join(", ")}.`}`;
  }
  if (n.length === 0) return true;
  return `Cannot filter further than three levels, ':${n.join(":")}' is invalid!`;
}
__name(checkOne, "checkOne");
function treeify(paths) {
  const tree = {};
  for (const [l1, l2, l3] of paths) {
    const subtree = tree[l1] ??= {};
    if (l2 !== void 0) {
      const set = subtree[l2] ??= /* @__PURE__ */ new Set();
      if (l3 !== void 0) set.add(l3);
    }
  }
  return tree;
}
__name(treeify, "treeify");
function or(left, right) {
  return (obj, ctx) => left(obj, ctx) || right(obj, ctx);
}
__name(or, "or");
function concat(get, test) {
  return (obj, ctx) => {
    const nextObj = get(obj, ctx);
    return nextObj && test(nextObj, ctx);
  };
}
__name(concat, "concat");
function leaf(pred) {
  return (obj, ctx) => pred(obj, ctx) != null;
}
__name(leaf, "leaf");
function arborist(tree) {
  const l1Predicates = Object.entries(tree).map(([l1, subtree]) => {
    const l1Pred = /* @__PURE__ */ __name((obj) => obj[l1], "l1Pred");
    const l2Predicates = Object.entries(subtree).map(([l2, set]) => {
      const l2Pred = /* @__PURE__ */ __name((obj) => obj[l2], "l2Pred");
      const l3Predicates = Array.from(set).map((l3) => {
        const l3Pred = l3 === "me" ? (obj, ctx) => {
          const me = ctx.me.id;
          return testMaybeArray(obj, (u) => u.id === me);
        } : (obj) => testMaybeArray(obj, (e) => e[l3] || e.type === l3);
        return l3Pred;
      });
      return l3Predicates.length === 0 ? leaf(l2Pred) : concat(l2Pred, l3Predicates.reduce(or));
    });
    return l2Predicates.length === 0 ? leaf(l1Pred) : concat(l1Pred, l2Predicates.reduce(or));
  });
  if (l1Predicates.length === 0) {
    throw new Error("Cannot create filter function for empty query");
  }
  return l1Predicates.reduce(or);
}
__name(arborist, "arborist");
function testMaybeArray(t, pred) {
  const p = /* @__PURE__ */ __name((x) => x != null && pred(x), "p");
  return Array.isArray(t) ? t.some(p) : p(t);
}
__name(testMaybeArray, "testMaybeArray");
var ENTITY_KEYS = {
  mention: {},
  hashtag: {},
  cashtag: {},
  bot_command: {},
  url: {},
  email: {},
  phone_number: {},
  bold: {},
  italic: {},
  underline: {},
  strikethrough: {},
  spoiler: {},
  blockquote: {},
  expandable_blockquote: {},
  code: {},
  pre: {},
  text_link: {},
  text_mention: {},
  custom_emoji: {},
  date_time: {}
};
var USER_KEYS = {
  me: {},
  is_bot: {},
  is_premium: {},
  added_to_attachment_menu: {}
};
var FORWARD_ORIGIN_KEYS = {
  user: {},
  hidden_user: {},
  chat: {},
  channel: {}
};
var STICKER_KEYS = {
  is_video: {},
  is_animated: {},
  premium_animation: {}
};
var REACTION_KEYS = {
  emoji: {},
  custom_emoji: {},
  paid: {}
};
var GIFT_INFO_KEYS = {
  can_be_upgraded: {},
  is_upgrade_separate: {},
  is_private: {}
};
var COMMON_MESSAGE_KEYS = {
  forward_origin: FORWARD_ORIGIN_KEYS,
  is_topic_message: {},
  is_automatic_forward: {},
  guest_query_id: {},
  business_connection_id: {},
  text: {},
  rich_message: {},
  animation: {},
  audio: {},
  document: {},
  live_photo: {},
  paid_media: {},
  photo: {},
  sticker: STICKER_KEYS,
  story: {},
  video: {},
  video_note: {},
  voice: {},
  contact: {},
  dice: {},
  game: {},
  poll: {},
  venue: {},
  location: {},
  entities: ENTITY_KEYS,
  caption_entities: ENTITY_KEYS,
  caption: {},
  link_preview_options: {
    url: {},
    prefer_small_media: {},
    prefer_large_media: {},
    show_above_text: {}
  },
  effect_id: {},
  paid_star_count: {},
  has_media_spoiler: {},
  new_chat_title: {},
  new_chat_photo: {},
  delete_chat_photo: {},
  message_auto_delete_timer_changed: {},
  pinned_message: {},
  invoice: {},
  proximity_alert_triggered: {},
  chat_background_set: {},
  giveaway_created: {},
  giveaway: {
    only_new_members: {},
    has_public_winners: {}
  },
  giveaway_winners: {
    only_new_members: {},
    was_refunded: {}
  },
  giveaway_completed: {},
  gift: GIFT_INFO_KEYS,
  gift_upgrade_sent: GIFT_INFO_KEYS,
  unique_gift: {
    transfer_star_count: {}
  },
  paid_message_price_changed: {},
  video_chat_scheduled: {},
  video_chat_started: {},
  video_chat_ended: {},
  video_chat_participants_invited: {},
  web_app_data: {}
};
var MESSAGE_KEYS = {
  ...COMMON_MESSAGE_KEYS,
  direct_messages_topic: {},
  chat_owner_left: {
    new_owner: {}
  },
  chat_owner_changed: {},
  new_chat_members: USER_KEYS,
  left_chat_member: USER_KEYS,
  group_chat_created: {},
  supergroup_chat_created: {},
  migrate_to_chat_id: {},
  migrate_from_chat_id: {},
  successful_payment: {},
  refunded_payment: {},
  users_shared: {},
  chat_shared: {},
  connected_website: {},
  managed_bot_created: {},
  write_access_allowed: {},
  passport_data: {},
  boost_added: {},
  forum_topic_created: {
    is_name_implicit: {}
  },
  forum_topic_edited: {
    name: {},
    icon_custom_emoji_id: {}
  },
  forum_topic_closed: {},
  forum_topic_reopened: {},
  general_forum_topic_hidden: {},
  general_forum_topic_unhidden: {},
  checklist: {
    others_can_add_tasks: {},
    others_can_mark_tasks_as_done: {}
  },
  checklist_tasks_done: {},
  checklist_tasks_added: {},
  poll_option_added: {},
  poll_option_deleted: {},
  suggested_post_info: {},
  suggested_post_approved: {},
  suggested_post_approval_failed: {},
  suggested_post_declined: {},
  suggested_post_paid: {},
  suggested_post_refunded: {},
  sender_boost_count: {}
};
var CHANNEL_POST_KEYS = {
  ...COMMON_MESSAGE_KEYS,
  channel_chat_created: {},
  direct_message_price_changed: {},
  is_paid_post: {}
};
var BUSINESS_CONNECTION_KEYS = {
  can_reply: {},
  is_enabled: {}
};
var MESSAGE_REACTION_KEYS = {
  old_reaction: REACTION_KEYS,
  new_reaction: REACTION_KEYS
};
var MESSAGE_REACTION_COUNT_UPDATED_KEYS = {
  reactions: REACTION_KEYS
};
var CALLBACK_QUERY_KEYS = {
  data: {},
  game_short_name: {}
};
var CHAT_MEMBER_UPDATED_KEYS = {
  from: USER_KEYS
};
var UPDATE_KEYS = {
  message: MESSAGE_KEYS,
  edited_message: MESSAGE_KEYS,
  channel_post: CHANNEL_POST_KEYS,
  edited_channel_post: CHANNEL_POST_KEYS,
  business_connection: BUSINESS_CONNECTION_KEYS,
  business_message: MESSAGE_KEYS,
  edited_business_message: MESSAGE_KEYS,
  deleted_business_messages: {},
  guest_message: MESSAGE_KEYS,
  inline_query: {},
  chosen_inline_result: {},
  callback_query: CALLBACK_QUERY_KEYS,
  shipping_query: {},
  pre_checkout_query: {},
  poll: {},
  poll_answer: {},
  my_chat_member: CHAT_MEMBER_UPDATED_KEYS,
  chat_member: CHAT_MEMBER_UPDATED_KEYS,
  managed_bot: {},
  chat_join_request: {},
  message_reaction: MESSAGE_REACTION_KEYS,
  message_reaction_count: MESSAGE_REACTION_COUNT_UPDATED_KEYS,
  chat_boost: {},
  removed_chat_boost: {},
  purchased_paid_media: {}
};
var L1_SHORTCUTS = {
  "": [
    "message",
    "channel_post"
  ],
  msg: [
    "message",
    "channel_post"
  ],
  edit: [
    "edited_message",
    "edited_channel_post"
  ]
};
var L2_SHORTCUTS = {
  "": [
    "entities",
    "caption_entities"
  ],
  media: [
    "photo",
    "live_photo",
    "video"
  ],
  file: [
    "photo",
    "live_photo",
    "animation",
    "audio",
    "document",
    "video",
    "video_note",
    "voice",
    "sticker"
  ]
};
var checker = {
  filterQuery(filter) {
    const pred = matchFilter(filter);
    return (ctx) => pred(ctx);
  },
  text(trigger) {
    const hasText = checker.filterQuery([
      ":text",
      ":caption"
    ]);
    const trg = triggerFn(trigger);
    return (ctx) => {
      if (!hasText(ctx)) return false;
      const msg = ctx.message ?? ctx.channelPost;
      const txt = msg.text ?? msg.caption;
      return match2(ctx, txt, trg);
    };
  },
  command(command) {
    const hasEntities = checker.filterQuery(":entities:bot_command");
    const atCommands = /* @__PURE__ */ new Set();
    const noAtCommands = /* @__PURE__ */ new Set();
    toArray(command).forEach((cmd) => {
      if (cmd.startsWith("/")) {
        throw new Error(`Do not include '/' when registering command handlers (use '${cmd.substring(1)}' not '${cmd}')`);
      }
      const set = cmd.includes("@") ? atCommands : noAtCommands;
      set.add(cmd);
    });
    return (ctx) => {
      if (!hasEntities(ctx)) return false;
      const msg = ctx.message ?? ctx.channelPost;
      const txt = msg.text ?? msg.caption;
      return msg.entities.some((e) => {
        if (e.type !== "bot_command") return false;
        if (e.offset !== 0) return false;
        const cmd = txt.substring(1, e.length);
        if (noAtCommands.has(cmd) || atCommands.has(cmd)) {
          ctx.match = txt.substring(cmd.length + 1).trimStart();
          return true;
        }
        const index = cmd.indexOf("@");
        if (index === -1) return false;
        const atTarget = cmd.substring(index + 1).toLowerCase();
        const username = ctx.me.username.toLowerCase();
        if (atTarget !== username) return false;
        const atCommand = cmd.substring(0, index);
        if (noAtCommands.has(atCommand)) {
          ctx.match = txt.substring(cmd.length + 1).trimStart();
          return true;
        }
        return false;
      });
    };
  },
  reaction(reaction) {
    const hasMessageReaction = checker.filterQuery("message_reaction");
    const normalized = typeof reaction === "string" ? [
      {
        type: "emoji",
        emoji: reaction
      }
    ] : (Array.isArray(reaction) ? reaction : [
      reaction
    ]).map((emoji2) => typeof emoji2 === "string" ? {
      type: "emoji",
      emoji: emoji2
    } : emoji2);
    const emoji = new Set(normalized.filter((r) => r.type === "emoji").map((r) => r.emoji));
    const customEmoji = new Set(normalized.filter((r) => r.type === "custom_emoji").map((r) => r.custom_emoji_id));
    const paid = normalized.some((r) => r.type === "paid");
    return (ctx) => {
      if (!hasMessageReaction(ctx)) return false;
      const { old_reaction, new_reaction } = ctx.messageReaction;
      for (const reaction2 of new_reaction) {
        let isOld = false;
        if (reaction2.type === "emoji") {
          for (const old of old_reaction) {
            if (old.type !== "emoji") continue;
            if (old.emoji === reaction2.emoji) {
              isOld = true;
              break;
            }
          }
        } else if (reaction2.type === "custom_emoji") {
          for (const old of old_reaction) {
            if (old.type !== "custom_emoji") continue;
            if (old.custom_emoji_id === reaction2.custom_emoji_id) {
              isOld = true;
              break;
            }
          }
        } else if (reaction2.type === "paid") {
          for (const old of old_reaction) {
            if (old.type !== "paid") continue;
            isOld = true;
            break;
          }
        } else {
        }
        if (isOld) continue;
        if (reaction2.type === "emoji") {
          if (emoji.has(reaction2.emoji)) return true;
        } else if (reaction2.type === "custom_emoji") {
          if (customEmoji.has(reaction2.custom_emoji_id)) return true;
        } else if (reaction2.type === "paid") {
          if (paid) return true;
        } else {
          return true;
        }
      }
      return false;
    };
  },
  chatType(chatType) {
    const set = new Set(toArray(chatType));
    return (ctx) => ctx.chat?.type !== void 0 && set.has(ctx.chat.type);
  },
  callbackQuery(trigger) {
    const hasCallbackQuery = checker.filterQuery("callback_query:data");
    const trg = triggerFn(trigger);
    return (ctx) => hasCallbackQuery(ctx) && match2(ctx, ctx.callbackQuery.data, trg);
  },
  gameQuery(trigger) {
    const hasGameQuery = checker.filterQuery("callback_query:game_short_name");
    const trg = triggerFn(trigger);
    return (ctx) => hasGameQuery(ctx) && match2(ctx, ctx.callbackQuery.game_short_name, trg);
  },
  inlineQuery(trigger) {
    const hasInlineQuery = checker.filterQuery("inline_query");
    const trg = triggerFn(trigger);
    return (ctx) => hasInlineQuery(ctx) && match2(ctx, ctx.inlineQuery.query, trg);
  },
  chosenInlineResult(trigger) {
    const hasChosenInlineResult = checker.filterQuery("chosen_inline_result");
    const trg = triggerFn(trigger);
    return (ctx) => hasChosenInlineResult(ctx) && match2(ctx, ctx.chosenInlineResult.result_id, trg);
  },
  preCheckoutQuery(trigger) {
    const hasPreCheckoutQuery = checker.filterQuery("pre_checkout_query");
    const trg = triggerFn(trigger);
    return (ctx) => hasPreCheckoutQuery(ctx) && match2(ctx, ctx.preCheckoutQuery.invoice_payload, trg);
  },
  shippingQuery(trigger) {
    const hasShippingQuery = checker.filterQuery("shipping_query");
    const trg = triggerFn(trigger);
    return (ctx) => hasShippingQuery(ctx) && match2(ctx, ctx.shippingQuery.invoice_payload, trg);
  }
};
var Context2 = class _Context {
  static {
    __name(this, "Context");
  }
  update;
  api;
  me;
  match;
  constructor(update, api2, me) {
    this.update = update;
    this.api = api2;
    this.me = me;
  }
  get message() {
    return this.update.message;
  }
  get editedMessage() {
    return this.update.edited_message;
  }
  get channelPost() {
    return this.update.channel_post;
  }
  get editedChannelPost() {
    return this.update.edited_channel_post;
  }
  get businessConnection() {
    return this.update.business_connection;
  }
  get businessMessage() {
    return this.update.business_message;
  }
  get editedBusinessMessage() {
    return this.update.edited_business_message;
  }
  get deletedBusinessMessages() {
    return this.update.deleted_business_messages;
  }
  get guestMessage() {
    return this.update.guest_message;
  }
  get messageReaction() {
    return this.update.message_reaction;
  }
  get messageReactionCount() {
    return this.update.message_reaction_count;
  }
  get inlineQuery() {
    return this.update.inline_query;
  }
  get chosenInlineResult() {
    return this.update.chosen_inline_result;
  }
  get callbackQuery() {
    return this.update.callback_query;
  }
  get shippingQuery() {
    return this.update.shipping_query;
  }
  get preCheckoutQuery() {
    return this.update.pre_checkout_query;
  }
  get poll() {
    return this.update.poll;
  }
  get pollAnswer() {
    return this.update.poll_answer;
  }
  get myChatMember() {
    return this.update.my_chat_member;
  }
  get chatMember() {
    return this.update.chat_member;
  }
  get managedBot() {
    return this.update.managed_bot;
  }
  get chatJoinRequest() {
    return this.update.chat_join_request;
  }
  get chatBoost() {
    return this.update.chat_boost;
  }
  get removedChatBoost() {
    return this.update.removed_chat_boost;
  }
  get purchasedPaidMedia() {
    return this.update.purchased_paid_media;
  }
  get msg() {
    return this.message ?? this.editedMessage ?? this.channelPost ?? this.editedChannelPost ?? this.businessMessage ?? this.editedBusinessMessage ?? this.guestMessage ?? this.callbackQuery?.message;
  }
  get chat() {
    return (this.msg ?? this.deletedBusinessMessages ?? this.messageReaction ?? this.messageReactionCount ?? this.myChatMember ?? this.chatMember ?? this.chatJoinRequest ?? this.chatBoost ?? this.removedChatBoost)?.chat;
  }
  get senderChat() {
    return this.msg?.sender_chat;
  }
  get from() {
    return (this.businessConnection ?? this.messageReaction ?? this.managedBot ?? (this.chatBoost?.boost ?? this.removedChatBoost)?.source)?.user ?? (this.callbackQuery ?? this.msg ?? this.inlineQuery ?? this.chosenInlineResult ?? this.shippingQuery ?? this.preCheckoutQuery ?? this.myChatMember ?? this.chatMember ?? this.chatJoinRequest ?? this.purchasedPaidMedia)?.from;
  }
  get msgId() {
    return this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id;
  }
  get chatId() {
    return this.chat?.id ?? this.businessConnection?.user_chat_id;
  }
  get inlineMessageId() {
    return this.callbackQuery?.inline_message_id ?? this.chosenInlineResult?.inline_message_id;
  }
  get businessConnectionId() {
    return this.msg?.business_connection_id ?? this.businessConnection?.id ?? this.deletedBusinessMessages?.business_connection_id;
  }
  entities(types) {
    const message = this.msg;
    if (message === void 0) return [];
    const text = message.text ?? message.caption;
    if (text === void 0) return [];
    let entities = message.entities ?? message.caption_entities;
    if (entities === void 0) return [];
    if (types !== void 0) {
      const filters = new Set(toArray(types));
      entities = entities.filter((entity) => filters.has(entity.type));
    }
    return entities.map((entity) => ({
      ...entity,
      text: text.substring(entity.offset, entity.offset + entity.length)
    }));
  }
  reactions() {
    const emoji = [];
    const emojiAdded = [];
    const emojiKept = [];
    const emojiRemoved = [];
    const customEmoji = [];
    const customEmojiAdded = [];
    const customEmojiKept = [];
    const customEmojiRemoved = [];
    let paid = false;
    let paidAdded = false;
    const r = this.messageReaction;
    if (r !== void 0) {
      const { old_reaction, new_reaction } = r;
      for (const reaction of new_reaction) {
        if (reaction.type === "emoji") {
          emoji.push(reaction.emoji);
        } else if (reaction.type === "custom_emoji") {
          customEmoji.push(reaction.custom_emoji_id);
        } else if (reaction.type === "paid") {
          paid = paidAdded = true;
        }
      }
      for (const reaction of old_reaction) {
        if (reaction.type === "emoji") {
          emojiRemoved.push(reaction.emoji);
        } else if (reaction.type === "custom_emoji") {
          customEmojiRemoved.push(reaction.custom_emoji_id);
        } else if (reaction.type === "paid") {
          paidAdded = false;
        }
      }
      emojiAdded.push(...emoji);
      customEmojiAdded.push(...customEmoji);
      for (let i = 0; i < emojiRemoved.length; i++) {
        const len = emojiAdded.length;
        if (len === 0) break;
        const rem = emojiRemoved[i];
        for (let j = 0; j < len; j++) {
          if (rem === emojiAdded[j]) {
            emojiKept.push(rem);
            emojiRemoved.splice(i, 1);
            emojiAdded.splice(j, 1);
            i--;
            break;
          }
        }
      }
      for (let i = 0; i < customEmojiRemoved.length; i++) {
        const len = customEmojiAdded.length;
        if (len === 0) break;
        const rem = customEmojiRemoved[i];
        for (let j = 0; j < len; j++) {
          if (rem === customEmojiAdded[j]) {
            customEmojiKept.push(rem);
            customEmojiRemoved.splice(i, 1);
            customEmojiAdded.splice(j, 1);
            i--;
            break;
          }
        }
      }
    }
    return {
      emoji,
      emojiAdded,
      emojiKept,
      emojiRemoved,
      customEmoji,
      customEmojiAdded,
      customEmojiKept,
      customEmojiRemoved,
      paid,
      paidAdded
    };
  }
  static has = checker;
  has(filter) {
    return _Context.has.filterQuery(filter)(this);
  }
  hasText(trigger) {
    return _Context.has.text(trigger)(this);
  }
  hasCommand(command) {
    return _Context.has.command(command)(this);
  }
  hasReaction(reaction) {
    return _Context.has.reaction(reaction)(this);
  }
  hasChatType(chatType) {
    return _Context.has.chatType(chatType)(this);
  }
  hasCallbackQuery(trigger) {
    return _Context.has.callbackQuery(trigger)(this);
  }
  hasGameQuery(trigger) {
    return _Context.has.gameQuery(trigger)(this);
  }
  hasInlineQuery(trigger) {
    return _Context.has.inlineQuery(trigger)(this);
  }
  hasChosenInlineResult(trigger) {
    return _Context.has.chosenInlineResult(trigger)(this);
  }
  hasPreCheckoutQuery(trigger) {
    return _Context.has.preCheckoutQuery(trigger)(this);
  }
  hasShippingQuery(trigger) {
    return _Context.has.shippingQuery(trigger)(this);
  }
  reply(text, other, signal) {
    const msg = this.msg;
    return this.api.sendMessage(orThrow(this.chatId, "sendMessage"), text, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithRichMessage(rich_message, other, signal) {
    const msg = this.msg;
    return this.api.sendRichMessage(orThrow(this.chatId, "sendRichMessage"), rich_message, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  forwardMessage(chat_id, other, signal) {
    const msg = this.msg;
    return this.api.forwardMessage(chat_id, orThrow(this.chatId, "forwardMessage"), orThrow(this.msgId, "forwardMessage"), {
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  forwardMessages(chat_id, message_ids, other, signal) {
    const msg = this.msg;
    return this.api.forwardMessages(chat_id, orThrow(this.chatId, "forwardMessages"), message_ids, {
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  copyMessage(chat_id, other, signal) {
    const msg = this.msg;
    return this.api.copyMessage(chat_id, orThrow(this.chatId, "copyMessage"), orThrow(this.msgId, "copyMessage"), {
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  copyMessages(chat_id, message_ids, other, signal) {
    const msg = this.msg;
    return this.api.copyMessages(chat_id, orThrow(this.chatId, "copyMessages"), message_ids, {
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithPhoto(photo, other, signal) {
    const msg = this.msg;
    return this.api.sendPhoto(orThrow(this.chatId, "sendPhoto"), photo, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithLivePhoto(live_photo, photo, other, signal) {
    const msg = this.msg;
    return this.api.sendLivePhoto(orThrow(this.chatId, "sendLivePhoto"), live_photo, photo, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithAudio(audio, other, signal) {
    const msg = this.msg;
    return this.api.sendAudio(orThrow(this.chatId, "sendAudio"), audio, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithDocument(document1, other, signal) {
    const msg = this.msg;
    return this.api.sendDocument(orThrow(this.chatId, "sendDocument"), document1, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithVideo(video, other, signal) {
    const msg = this.msg;
    return this.api.sendVideo(orThrow(this.chatId, "sendVideo"), video, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithAnimation(animation, other, signal) {
    const msg = this.msg;
    return this.api.sendAnimation(orThrow(this.chatId, "sendAnimation"), animation, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithVoice(voice, other, signal) {
    const msg = this.msg;
    return this.api.sendVoice(orThrow(this.chatId, "sendVoice"), voice, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithVideoNote(video_note, other, signal) {
    const msg = this.msg;
    return this.api.sendVideoNote(orThrow(this.chatId, "sendVideoNote"), video_note, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  sendPaidMedia(...args) {
    return this.replyWithPaidMedia(...args);
  }
  replyWithPaidMedia(star_count, media, other, signal) {
    const msg = this.msg;
    return this.api.sendPaidMedia(orThrow(this.chatId, "sendPaidMedia"), star_count, media, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: this.msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithMediaGroup(media, other, signal) {
    const msg = this.msg;
    return this.api.sendMediaGroup(orThrow(this.chatId, "sendMediaGroup"), media, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithLocation(latitude, longitude, other, signal) {
    const msg = this.msg;
    return this.api.sendLocation(orThrow(this.chatId, "sendLocation"), latitude, longitude, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  editMessageLiveLocation(latitude, longitude, other, signal) {
    const inlineId = this.inlineMessageId;
    return inlineId !== void 0 ? this.api.editMessageLiveLocationInline(inlineId, latitude, longitude, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal) : this.api.editMessageLiveLocation(orThrow(this.chatId, "editMessageLiveLocation"), orThrow(this.msgId, "editMessageLiveLocation"), latitude, longitude, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal);
  }
  stopMessageLiveLocation(other, signal) {
    const inlineId = this.inlineMessageId;
    return inlineId !== void 0 ? this.api.stopMessageLiveLocationInline(inlineId, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal) : this.api.stopMessageLiveLocation(orThrow(this.chatId, "stopMessageLiveLocation"), orThrow(this.msgId, "stopMessageLiveLocation"), {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal);
  }
  replyWithVenue(latitude, longitude, title2, address, other, signal) {
    const msg = this.msg;
    return this.api.sendVenue(orThrow(this.chatId, "sendVenue"), latitude, longitude, title2, address, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithContact(phone_number, first_name, other, signal) {
    const msg = this.msg;
    return this.api.sendContact(orThrow(this.chatId, "sendContact"), phone_number, first_name, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithPoll(question, options, other, signal) {
    const msg = this.msg;
    return this.api.sendPoll(orThrow(this.chatId, "sendPoll"), question, options, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      ...other
    }, signal);
  }
  replyWithChecklist(checklist, other, signal) {
    return this.api.sendChecklist(orThrow(this.businessConnectionId, "sendChecklist"), orThrow(this.chatId, "sendChecklist"), checklist, other, signal);
  }
  editMessageChecklist(checklist, other, signal) {
    const msg = orThrow(this.msg, "editMessageChecklist");
    const target = msg.checklist_tasks_done?.checklist_message ?? msg.checklist_tasks_added?.checklist_message ?? msg;
    return this.api.editMessageChecklist(orThrow(this.businessConnectionId, "editMessageChecklist"), orThrow(target.chat.id, "editMessageChecklist"), orThrow(target.message_id, "editMessageChecklist"), checklist, other, signal);
  }
  replyWithDice(emoji, other, signal) {
    const msg = this.msg;
    return this.api.sendDice(orThrow(this.chatId, "sendDice"), emoji, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  replyWithChatAction(action, other, signal) {
    const msg = this.msg;
    return this.api.sendChatAction(orThrow(this.chatId, "sendChatAction"), action, {
      business_connection_id: this.businessConnectionId,
      message_thread_id: msg?.message_thread_id,
      ...other
    }, signal);
  }
  react(reaction, other, signal) {
    return this.api.setMessageReaction(orThrow(this.chatId, "setMessageReaction"), orThrow(this.msgId, "setMessageReaction"), typeof reaction === "string" ? [
      {
        type: "emoji",
        emoji: reaction
      }
    ] : (Array.isArray(reaction) ? reaction : [
      reaction
    ]).map((emoji) => typeof emoji === "string" ? {
      type: "emoji",
      emoji
    } : emoji), other, signal);
  }
  replyWithDraft(text, other, signal) {
    const msg = this.msg;
    return this.api.sendMessageDraft(orThrow(this.chatId, "sendMessageDraft"), this.update.update_id, text, {
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      ...other
    }, signal);
  }
  replyWithRichMessageDraft(rich_message, other, signal) {
    const msg = this.msg;
    return this.api.sendRichMessageDraft(orThrow(this.chatId, "sendMessageDraft"), this.update.update_id, rich_message, {
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      ...other
    }, signal);
  }
  getUserProfilePhotos(other, signal) {
    return this.api.getUserProfilePhotos(orThrow(this.from, "getUserProfilePhotos").id, other, signal);
  }
  getUserProfileAudios(other, signal) {
    return this.api.getUserProfileAudios(orThrow(this.from, "getUserProfileAudios").id, other, signal);
  }
  setUserEmojiStatus(other, signal) {
    return this.api.setUserEmojiStatus(orThrow(this.from, "setUserEmojiStatus").id, other, signal);
  }
  getUserChatBoosts(chat_id, signal) {
    return this.api.getUserChatBoosts(chat_id ?? orThrow(this.chatId, "getUserChatBoosts"), orThrow(this.from, "getUserChatBoosts").id, signal);
  }
  getUserGifts(other, signal) {
    return this.api.getUserGifts(orThrow(this.from, "getUserGifts").id, other, signal);
  }
  getChatGifts(other, signal) {
    return this.api.getChatGifts(orThrow(this.chatId, "getChatGifts"), other, signal);
  }
  getBusinessConnection(signal) {
    return this.api.getBusinessConnection(orThrow(this.businessConnectionId, "getBusinessConnection"), signal);
  }
  getManagedBotToken(signal) {
    return this.api.getManagedBotToken(orThrow(this.managedBot, "getManagedBotToken").bot.id, signal);
  }
  replaceManagedBotToken(signal) {
    return this.api.replaceManagedBotToken(orThrow(this.managedBot, "getManagedBotToken").bot.id, signal);
  }
  getManagedBotAccessSettings(signal) {
    return this.api.getManagedBotAccessSettings(orThrow(this.managedBot, "getManagedBotAccessSettings").bot.id, signal);
  }
  setManagedBotAccessSettings(is_access_restricted, other, signal) {
    return this.api.setManagedBotAccessSettings(orThrow(this.managedBot, "setManagedBotAccessSettings").bot.id, is_access_restricted, other, signal);
  }
  getFile(signal) {
    const m2 = orThrow(this.msg, "getFile");
    const file = m2.photo !== void 0 ? m2.photo[m2.photo.length - 1] : m2.animation ?? m2.audio ?? m2.document ?? m2.video ?? m2.video_note ?? m2.voice ?? m2.sticker;
    return this.api.getFile(orThrow(file, "getFile").file_id, signal);
  }
  kickAuthor(...args) {
    return this.banAuthor(...args);
  }
  banAuthor(other, signal) {
    return this.api.banChatMember(orThrow(this.chatId, "banAuthor"), orThrow(this.from, "banAuthor").id, other, signal);
  }
  kickChatMember(...args) {
    return this.banChatMember(...args);
  }
  banChatMember(user_id, other, signal) {
    return this.api.banChatMember(orThrow(this.chatId, "banChatMember"), user_id, other, signal);
  }
  unbanChatMember(user_id, other, signal) {
    return this.api.unbanChatMember(orThrow(this.chatId, "unbanChatMember"), user_id, other, signal);
  }
  restrictAuthor(permissions, other, signal) {
    return this.api.restrictChatMember(orThrow(this.chatId, "restrictAuthor"), orThrow(this.from, "restrictAuthor").id, permissions, other, signal);
  }
  restrictChatMember(user_id, permissions, other, signal) {
    return this.api.restrictChatMember(orThrow(this.chatId, "restrictChatMember"), user_id, permissions, other, signal);
  }
  promoteAuthor(other, signal) {
    return this.api.promoteChatMember(orThrow(this.chatId, "promoteAuthor"), orThrow(this.from, "promoteAuthor").id, other, signal);
  }
  promoteChatMember(user_id, other, signal) {
    return this.api.promoteChatMember(orThrow(this.chatId, "promoteChatMember"), user_id, other, signal);
  }
  setChatAdministratorAuthorCustomTitle(custom_title, signal) {
    return this.api.setChatAdministratorCustomTitle(orThrow(this.chatId, "setChatAdministratorAuthorCustomTitle"), orThrow(this.from, "setChatAdministratorAuthorCustomTitle").id, custom_title, signal);
  }
  setChatAdministratorCustomTitle(user_id, custom_title, signal) {
    return this.api.setChatAdministratorCustomTitle(orThrow(this.chatId, "setChatAdministratorCustomTitle"), user_id, custom_title, signal);
  }
  setAuthorTag(tag, signal) {
    return this.api.setChatMemberTag(orThrow(this.chatId, "setChatMemberTag"), orThrow(this.from, "setChatMemberTag").id, tag, signal);
  }
  setChatMemberTag(user_id, tag, signal) {
    return this.api.setChatMemberTag(orThrow(this.chatId, "setChatMemberTag"), user_id, tag, signal);
  }
  banChatSenderChat(sender_chat_id, signal) {
    return this.api.banChatSenderChat(orThrow(this.chatId, "banChatSenderChat"), sender_chat_id, signal);
  }
  unbanChatSenderChat(sender_chat_id, signal) {
    return this.api.unbanChatSenderChat(orThrow(this.chatId, "unbanChatSenderChat"), sender_chat_id, signal);
  }
  setChatPermissions(permissions, other, signal) {
    return this.api.setChatPermissions(orThrow(this.chatId, "setChatPermissions"), permissions, other, signal);
  }
  exportChatInviteLink(signal) {
    return this.api.exportChatInviteLink(orThrow(this.chatId, "exportChatInviteLink"), signal);
  }
  createChatInviteLink(other, signal) {
    return this.api.createChatInviteLink(orThrow(this.chatId, "createChatInviteLink"), other, signal);
  }
  editChatInviteLink(invite_link, other, signal) {
    return this.api.editChatInviteLink(orThrow(this.chatId, "editChatInviteLink"), invite_link, other, signal);
  }
  createChatSubscriptionInviteLink(subscription_period, subscription_price, other, signal) {
    return this.api.createChatSubscriptionInviteLink(orThrow(this.chatId, "createChatSubscriptionInviteLink"), subscription_period, subscription_price, other, signal);
  }
  editChatSubscriptionInviteLink(invite_link, other, signal) {
    return this.api.editChatSubscriptionInviteLink(orThrow(this.chatId, "editChatSubscriptionInviteLink"), invite_link, other, signal);
  }
  revokeChatInviteLink(invite_link, signal) {
    return this.api.revokeChatInviteLink(orThrow(this.chatId, "editChatInviteLink"), invite_link, signal);
  }
  approveChatJoinRequest(user_id, signal) {
    return this.api.approveChatJoinRequest(orThrow(this.chatId, "approveChatJoinRequest"), user_id, signal);
  }
  declineChatJoinRequest(user_id, signal) {
    return this.api.declineChatJoinRequest(orThrow(this.chatId, "declineChatJoinRequest"), user_id, signal);
  }
  answerChatJoinRequestQuery(result, signal) {
    return this.api.answerChatJoinRequestQuery(orThrow(this.chatJoinRequest?.query_id, "answerChatJoinRequestQuery"), result, signal);
  }
  replyWithChatJoinRequestWebApp(web_app_url, signal) {
    return this.api.sendChatJoinRequestWebApp(orThrow(this.chatJoinRequest?.query_id, "answerChatJoinRequestQuery"), web_app_url, signal);
  }
  approveSuggestedPost(other, signal) {
    return this.api.approveSuggestedPost(orThrow(this.chatId, "approveSuggestedPost"), orThrow(this.msgId, "approveSuggestedPost"), other, signal);
  }
  declineSuggestedPost(other, signal) {
    return this.api.declineSuggestedPost(orThrow(this.chatId, "declineSuggestedPost"), orThrow(this.msgId, "declineSuggestedPost"), other, signal);
  }
  setChatPhoto(photo, signal) {
    return this.api.setChatPhoto(orThrow(this.chatId, "setChatPhoto"), photo, signal);
  }
  deleteChatPhoto(signal) {
    return this.api.deleteChatPhoto(orThrow(this.chatId, "deleteChatPhoto"), signal);
  }
  setChatTitle(title2, signal) {
    return this.api.setChatTitle(orThrow(this.chatId, "setChatTitle"), title2, signal);
  }
  setChatDescription(description, signal) {
    return this.api.setChatDescription(orThrow(this.chatId, "setChatDescription"), description, signal);
  }
  pinChatMessage(message_id, other, signal) {
    return this.api.pinChatMessage(orThrow(this.chatId, "pinChatMessage"), message_id, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal);
  }
  unpinChatMessage(message_id, other, signal) {
    return this.api.unpinChatMessage(orThrow(this.chatId, "unpinChatMessage"), message_id, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal);
  }
  unpinAllChatMessages(signal) {
    return this.api.unpinAllChatMessages(orThrow(this.chatId, "unpinAllChatMessages"), signal);
  }
  leaveChat(signal) {
    return this.api.leaveChat(orThrow(this.chatId, "leaveChat"), signal);
  }
  getChat(signal) {
    return this.api.getChat(orThrow(this.chatId, "getChat"), signal);
  }
  getChatAdministrators(other, signal) {
    return this.api.getChatAdministrators(orThrow(this.chatId, "getChatAdministrators"), other, signal);
  }
  getChatMembersCount(...args) {
    return this.getChatMemberCount(...args);
  }
  getChatMemberCount(signal) {
    return this.api.getChatMemberCount(orThrow(this.chatId, "getChatMemberCount"), signal);
  }
  getAuthor(signal) {
    return this.api.getChatMember(orThrow(this.chatId, "getAuthor"), orThrow(this.from, "getAuthor").id, signal);
  }
  getChatMember(user_id, signal) {
    return this.api.getChatMember(orThrow(this.chatId, "getChatMember"), user_id, signal);
  }
  getUserPersonalChatMessages(limit, signal) {
    return this.api.getUserPersonalChatMessages(orThrow(this.from, "getUserPersonalChatMessages").id, limit, signal);
  }
  setChatStickerSet(sticker_set_name, signal) {
    return this.api.setChatStickerSet(orThrow(this.chatId, "setChatStickerSet"), sticker_set_name, signal);
  }
  deleteChatStickerSet(signal) {
    return this.api.deleteChatStickerSet(orThrow(this.chatId, "deleteChatStickerSet"), signal);
  }
  createForumTopic(name, other, signal) {
    return this.api.createForumTopic(orThrow(this.chatId, "createForumTopic"), name, other, signal);
  }
  editForumTopic(other, signal) {
    const message = orThrow(this.msg, "editForumTopic");
    const thread = orThrow(message.message_thread_id, "editForumTopic");
    return this.api.editForumTopic(message.chat.id, thread, other, signal);
  }
  closeForumTopic(signal) {
    const message = orThrow(this.msg, "closeForumTopic");
    const thread = orThrow(message.message_thread_id, "closeForumTopic");
    return this.api.closeForumTopic(message.chat.id, thread, signal);
  }
  reopenForumTopic(signal) {
    const message = orThrow(this.msg, "reopenForumTopic");
    const thread = orThrow(message.message_thread_id, "reopenForumTopic");
    return this.api.reopenForumTopic(message.chat.id, thread, signal);
  }
  deleteForumTopic(signal) {
    const message = orThrow(this.msg, "deleteForumTopic");
    const thread = orThrow(message.message_thread_id, "deleteForumTopic");
    return this.api.deleteForumTopic(message.chat.id, thread, signal);
  }
  unpinAllForumTopicMessages(signal) {
    const message = orThrow(this.msg, "unpinAllForumTopicMessages");
    const thread = orThrow(message.message_thread_id, "unpinAllForumTopicMessages");
    return this.api.unpinAllForumTopicMessages(message.chat.id, thread, signal);
  }
  editGeneralForumTopic(name, signal) {
    return this.api.editGeneralForumTopic(orThrow(this.chatId, "editGeneralForumTopic"), name, signal);
  }
  closeGeneralForumTopic(signal) {
    return this.api.closeGeneralForumTopic(orThrow(this.chatId, "closeGeneralForumTopic"), signal);
  }
  reopenGeneralForumTopic(signal) {
    return this.api.reopenGeneralForumTopic(orThrow(this.chatId, "reopenGeneralForumTopic"), signal);
  }
  hideGeneralForumTopic(signal) {
    return this.api.hideGeneralForumTopic(orThrow(this.chatId, "hideGeneralForumTopic"), signal);
  }
  unhideGeneralForumTopic(signal) {
    return this.api.unhideGeneralForumTopic(orThrow(this.chatId, "unhideGeneralForumTopic"), signal);
  }
  unpinAllGeneralForumTopicMessages(signal) {
    return this.api.unpinAllGeneralForumTopicMessages(orThrow(this.chatId, "unpinAllGeneralForumTopicMessages"), signal);
  }
  answerCallbackQuery(other, signal) {
    return this.api.answerCallbackQuery(orThrow(this.callbackQuery, "answerCallbackQuery").id, typeof other === "string" ? {
      text: other
    } : other, signal);
  }
  answerGuestQuery(result, signal) {
    return this.api.answerGuestQuery(orThrow(this.guestMessage?.guest_query_id, "answerGuestQuery"), result, signal);
  }
  setChatMenuButton(other, signal) {
    return this.api.setChatMenuButton(other, signal);
  }
  getChatMenuButton(other, signal) {
    return this.api.getChatMenuButton(other, signal);
  }
  setMyDefaultAdministratorRights(other, signal) {
    return this.api.setMyDefaultAdministratorRights(other, signal);
  }
  getMyDefaultAdministratorRights(other, signal) {
    return this.api.getMyDefaultAdministratorRights(other, signal);
  }
  editMessageText(text, other, signal) {
    const inlineId = this.inlineMessageId;
    return inlineId !== void 0 ? this.api.editMessageTextInline(inlineId, text, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal) : this.api.editMessageText(orThrow(this.chatId, "editMessageText"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "editMessageText"), text, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal);
  }
  editMessageCaption(other, signal) {
    const inlineId = this.inlineMessageId;
    return inlineId !== void 0 ? this.api.editMessageCaptionInline(inlineId, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal) : this.api.editMessageCaption(orThrow(this.chatId, "editMessageCaption"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "editMessageCaption"), {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal);
  }
  editMessageMedia(media, other, signal) {
    const inlineId = this.inlineMessageId;
    return inlineId !== void 0 ? this.api.editMessageMediaInline(inlineId, media, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal) : this.api.editMessageMedia(orThrow(this.chatId, "editMessageMedia"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "editMessageMedia"), media, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal);
  }
  editMessageReplyMarkup(other, signal) {
    const inlineId = this.inlineMessageId;
    return inlineId !== void 0 ? this.api.editMessageReplyMarkupInline(inlineId, {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal) : this.api.editMessageReplyMarkup(orThrow(this.chatId, "editMessageReplyMarkup"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "editMessageReplyMarkup"), {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal);
  }
  stopPoll(other, signal) {
    return this.api.stopPoll(orThrow(this.chatId, "stopPoll"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "stopPoll"), {
      business_connection_id: this.businessConnectionId,
      ...other
    }, signal);
  }
  deleteMessage(signal) {
    return this.api.deleteMessage(orThrow(this.chatId, "deleteMessage"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "deleteMessage"), signal);
  }
  deleteMessages(message_ids, signal) {
    return this.api.deleteMessages(orThrow(this.chatId, "deleteMessages"), message_ids, signal);
  }
  deleteMessageReaction(other, signal) {
    const reaction = orThrow(this.messageReaction, "deleteMessageReaction");
    if (reaction.user !== void 0) {
      return this.deleteMessageReactionUser(reaction.user.id, other, signal);
    } else if (reaction.actor_chat !== void 0) {
      return this.deleteMessageReactionChat(reaction.actor_chat.id, other, signal);
    } else {
      throw new Error("Missing information from message_reaction update for API call to deleteMessageReaction");
    }
  }
  deleteMessageReactionUser(user_id, other, signal) {
    return this.api.deleteMessageReactionUser(orThrow(this.chatId, "deleteMessageReactionUser"), orThrow(this.msgId, "deleteMessageReactionUser"), user_id, other, signal);
  }
  deleteMessageReactionChat(actor_chat_id, other, signal) {
    return this.api.deleteMessageReactionChat(orThrow(this.chatId, "deleteMessageReactionChat"), orThrow(this.msgId, "deleteMessageReactionChat"), actor_chat_id, other, signal);
  }
  deleteAllMessageReactions(other, signal) {
    const chatId = orThrow(this.chatId, "deleteAllMessageReactions");
    const actor = this.messageReaction?.actor_chat ?? this.senderChat ?? this.pollAnswer?.voter_chat;
    if (actor !== void 0) {
      return this.api.deleteAllMessageReactionsChat(chatId, actor.id, other, signal);
    }
    const userId = orThrow(this.from, "deleteAllMessageReactions").id;
    return this.api.deleteAllMessageReactionsUser(chatId, userId, other, signal);
  }
  deleteAllMessageReactionsUser(user_id, other, signal) {
    return this.api.deleteAllMessageReactionsUser(orThrow(this.chatId, "deleteAllMessageReactionsUser"), user_id, other, signal);
  }
  deleteAllMessageReactionsChat(actor_chat_id, other, signal) {
    return this.api.deleteAllMessageReactionsChat(orThrow(this.chatId, "deleteAllMessageReactionsChat"), actor_chat_id, other, signal);
  }
  deleteBusinessMessages(message_ids, signal) {
    return this.api.deleteBusinessMessages(orThrow(this.businessConnectionId, "deleteBusinessMessages"), message_ids, signal);
  }
  setBusinessAccountName(first_name, other, signal) {
    return this.api.setBusinessAccountName(orThrow(this.businessConnectionId, "setBusinessAccountName"), first_name, other, signal);
  }
  setBusinessAccountUsername(username, signal) {
    return this.api.setBusinessAccountUsername(orThrow(this.businessConnectionId, "setBusinessAccountUsername"), username, signal);
  }
  setBusinessAccountBio(bio, signal) {
    return this.api.setBusinessAccountBio(orThrow(this.businessConnectionId, "setBusinessAccountBio"), bio, signal);
  }
  setBusinessAccountProfilePhoto(photo, other, signal) {
    return this.api.setBusinessAccountProfilePhoto(orThrow(this.businessConnectionId, "setBusinessAccountProfilePhoto"), photo, other, signal);
  }
  removeBusinessAccountProfilePhoto(other, signal) {
    return this.api.removeBusinessAccountProfilePhoto(orThrow(this.businessConnectionId, "removeBusinessAccountProfilePhoto"), other, signal);
  }
  setBusinessAccountGiftSettings(show_gift_button, accepted_gift_types, signal) {
    return this.api.setBusinessAccountGiftSettings(orThrow(this.businessConnectionId, "setBusinessAccountGiftSettings"), show_gift_button, accepted_gift_types, signal);
  }
  getBusinessAccountStarBalance(signal) {
    return this.api.getBusinessAccountStarBalance(orThrow(this.businessConnectionId, "getBusinessAccountStarBalance"), signal);
  }
  transferBusinessAccountStars(star_count, signal) {
    return this.api.transferBusinessAccountStars(orThrow(this.businessConnectionId, "transferBusinessAccountStars"), star_count, signal);
  }
  getBusinessAccountGifts(other, signal) {
    return this.api.getBusinessAccountGifts(orThrow(this.businessConnectionId, "getBusinessAccountGifts"), other, signal);
  }
  convertGiftToStars(owned_gift_id, signal) {
    return this.api.convertGiftToStars(orThrow(this.businessConnectionId, "convertGiftToStars"), owned_gift_id, signal);
  }
  upgradeGift(owned_gift_id, other, signal) {
    return this.api.upgradeGift(orThrow(this.businessConnectionId, "upgradeGift"), owned_gift_id, other, signal);
  }
  transferGift(owned_gift_id, new_owner_chat_id, star_count, signal) {
    return this.api.transferGift(orThrow(this.businessConnectionId, "transferGift"), owned_gift_id, new_owner_chat_id, star_count, signal);
  }
  postStory(content, active_period, other, signal) {
    return this.api.postStory(orThrow(this.businessConnectionId, "postStory"), content, active_period, other, signal);
  }
  repostStory(active_period, other, signal) {
    const story = orThrow(this.msg?.story, "repostStory");
    return this.api.repostStory(orThrow(this.businessConnectionId, "repostStory"), story.chat.id, story.id, active_period, other, signal);
  }
  editStory(story_id, content, other, signal) {
    return this.api.editStory(orThrow(this.businessConnectionId, "editStory"), story_id, content, other, signal);
  }
  deleteStory(story_id, signal) {
    return this.api.deleteStory(orThrow(this.businessConnectionId, "deleteStory"), story_id, signal);
  }
  replyWithSticker(sticker, other, signal) {
    const msg = this.msg;
    return this.api.sendSticker(orThrow(this.chatId, "sendSticker"), sticker, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  getCustomEmojiStickers(signal) {
    return this.api.getCustomEmojiStickers((this.msg?.entities ?? []).filter((e) => e.type === "custom_emoji").map((e) => e.custom_emoji_id), signal);
  }
  replyWithGift(gift_id, other, signal) {
    return this.api.sendGift(orThrow(this.from, "sendGift").id, gift_id, other, signal);
  }
  giftPremiumSubscription(month_count, star_count, other, signal) {
    return this.api.giftPremiumSubscription(orThrow(this.from, "giftPremiumSubscription").id, month_count, star_count, other, signal);
  }
  replyWithGiftToChannel(gift_id, other, signal) {
    return this.api.sendGiftToChannel(orThrow(this.chat, "sendGift").id, gift_id, other, signal);
  }
  answerInlineQuery(results, other, signal) {
    return this.api.answerInlineQuery(orThrow(this.inlineQuery, "answerInlineQuery").id, results, other, signal);
  }
  savePreparedInlineMessage(result, other, signal) {
    return this.api.savePreparedInlineMessage(orThrow(this.from, "savePreparedInlineMessage").id, result, other, signal);
  }
  savePreparedKeyboardButton(button, signal) {
    return this.api.savePreparedKeyboardButton(orThrow(this.from, "savePreparedKeyboardButton").id, button, signal);
  }
  replyWithInvoice(title2, description, payload, currency, prices, other, signal) {
    const msg = this.msg;
    return this.api.sendInvoice(orThrow(this.chatId, "sendInvoice"), title2, description, payload, currency, prices, {
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      direct_messages_topic_id: msg?.direct_messages_topic?.topic_id,
      ...other
    }, signal);
  }
  answerShippingQuery(ok2, other, signal) {
    return this.api.answerShippingQuery(orThrow(this.shippingQuery, "answerShippingQuery").id, ok2, other, signal);
  }
  answerPreCheckoutQuery(ok2, other, signal) {
    return this.api.answerPreCheckoutQuery(orThrow(this.preCheckoutQuery, "answerPreCheckoutQuery").id, ok2, typeof other === "string" ? {
      error_message: other
    } : other, signal);
  }
  refundStarPayment(signal) {
    return this.api.refundStarPayment(orThrow(this.from, "refundStarPayment").id, orThrow(this.msg?.successful_payment, "refundStarPayment").telegram_payment_charge_id, signal);
  }
  editUserStarSubscription(telegram_payment_charge_id, is_canceled, signal) {
    return this.api.editUserStarSubscription(orThrow(this.from, "editUserStarSubscription").id, telegram_payment_charge_id, is_canceled, signal);
  }
  verifyUser(other, signal) {
    return this.api.verifyUser(orThrow(this.from, "verifyUser").id, other, signal);
  }
  verifyChat(other, signal) {
    return this.api.verifyChat(orThrow(this.chatId, "verifyChat"), other, signal);
  }
  removeUserVerification(signal) {
    return this.api.removeUserVerification(orThrow(this.from, "removeUserVerification").id, signal);
  }
  removeChatVerification(signal) {
    return this.api.removeChatVerification(orThrow(this.chatId, "removeChatVerification"), signal);
  }
  readBusinessMessage(signal) {
    return this.api.readBusinessMessage(orThrow(this.businessConnectionId, "readBusinessMessage"), orThrow(this.chatId, "readBusinessMessage"), orThrow(this.msgId, "readBusinessMessage"), signal);
  }
  setPassportDataErrors(errors, signal) {
    return this.api.setPassportDataErrors(orThrow(this.from, "setPassportDataErrors").id, errors, signal);
  }
  replyWithGame(game_short_name, other, signal) {
    const msg = this.msg;
    return this.api.sendGame(orThrow(this.chatId, "sendGame"), game_short_name, {
      business_connection_id: this.businessConnectionId,
      ...msg?.is_topic_message ? {
        message_thread_id: msg.message_thread_id
      } : {},
      ...other
    }, signal);
  }
};
function orThrow(value, method) {
  if (value === void 0) {
    throw new Error(`Missing information for API call to ${method}`);
  }
  return value;
}
__name(orThrow, "orThrow");
function triggerFn(trigger) {
  return toArray(trigger).map((t) => typeof t === "string" ? (txt) => txt === t ? t : null : (txt) => txt.match(t));
}
__name(triggerFn, "triggerFn");
function match2(ctx, content, triggers) {
  for (const t of triggers) {
    const res = t(content);
    if (res) {
      ctx.match = res;
      return true;
    }
  }
  return false;
}
__name(match2, "match");
function toArray(e) {
  return Array.isArray(e) ? e : [
    e
  ];
}
__name(toArray, "toArray");
var BotError = class extends Error {
  static {
    __name(this, "BotError");
  }
  error;
  ctx;
  constructor(error, ctx) {
    super(generateBotErrorMessage(error));
    this.error = error;
    this.ctx = ctx;
    this.name = "BotError";
    if (error instanceof Error) this.stack = error.stack;
  }
};
function generateBotErrorMessage(error) {
  let msg;
  if (error instanceof Error) {
    msg = `${error.name} in middleware: ${error.message}`;
  } else {
    const type = typeof error;
    msg = `Non-error value of type ${type} thrown in middleware`;
    switch (type) {
      case "bigint":
      case "boolean":
      case "number":
      case "symbol":
        msg += `: ${error}`;
        break;
      case "string":
        msg += `: ${String(error).substring(0, 50)}`;
        break;
      default:
        msg += "!";
        break;
    }
  }
  return msg;
}
__name(generateBotErrorMessage, "generateBotErrorMessage");
function flatten(mw) {
  return typeof mw === "function" ? mw : (ctx, next) => mw.middleware()(ctx, next);
}
__name(flatten, "flatten");
function concat1(first, andThen) {
  return async (ctx, next) => {
    let nextCalled = false;
    await first(ctx, async () => {
      if (nextCalled) throw new Error("`next` already called before!");
      else nextCalled = true;
      await andThen(ctx, next);
    });
  };
}
__name(concat1, "concat1");
function pass(_ctx, next) {
  return next();
}
__name(pass, "pass");
var leaf1 = /* @__PURE__ */ __name(() => Promise.resolve(), "leaf1");
async function run(middleware, ctx) {
  await middleware(ctx, leaf1);
}
__name(run, "run");
var Composer = class _Composer {
  static {
    __name(this, "Composer");
  }
  handler;
  constructor(...middleware) {
    this.handler = middleware.length === 0 ? pass : middleware.map(flatten).reduce(concat1);
  }
  middleware() {
    return this.handler;
  }
  use(...middleware) {
    const composer = new _Composer(...middleware);
    this.handler = concat1(this.handler, flatten(composer));
    return composer;
  }
  on(filter, ...middleware) {
    return this.filter(Context2.has.filterQuery(filter), ...middleware);
  }
  hears(trigger, ...middleware) {
    return this.filter(Context2.has.text(trigger), ...middleware);
  }
  command(command, ...middleware) {
    return this.filter(Context2.has.command(command), ...middleware);
  }
  reaction(reaction, ...middleware) {
    return this.filter(Context2.has.reaction(reaction), ...middleware);
  }
  chatType(chatType, ...middleware) {
    return this.filter(Context2.has.chatType(chatType), ...middleware);
  }
  callbackQuery(trigger, ...middleware) {
    return this.filter(Context2.has.callbackQuery(trigger), ...middleware);
  }
  gameQuery(trigger, ...middleware) {
    return this.filter(Context2.has.gameQuery(trigger), ...middleware);
  }
  inlineQuery(trigger, ...middleware) {
    return this.filter(Context2.has.inlineQuery(trigger), ...middleware);
  }
  chosenInlineResult(resultId, ...middleware) {
    return this.filter(Context2.has.chosenInlineResult(resultId), ...middleware);
  }
  preCheckoutQuery(trigger, ...middleware) {
    return this.filter(Context2.has.preCheckoutQuery(trigger), ...middleware);
  }
  shippingQuery(trigger, ...middleware) {
    return this.filter(Context2.has.shippingQuery(trigger), ...middleware);
  }
  filter(predicate, ...middleware) {
    const composer = new _Composer(...middleware);
    this.branch(predicate, composer, pass);
    return composer;
  }
  drop(predicate, ...middleware) {
    return this.filter(async (ctx) => !await predicate(ctx), ...middleware);
  }
  fork(...middleware) {
    const composer = new _Composer(...middleware);
    const fork = flatten(composer);
    this.use((ctx, next) => Promise.all([
      next(),
      run(fork, ctx)
    ]));
    return composer;
  }
  lazy(middlewareFactory) {
    return this.use(async (ctx, next) => {
      const middleware = await middlewareFactory(ctx);
      const arr = Array.isArray(middleware) ? middleware : [
        middleware
      ];
      await flatten(new _Composer(...arr))(ctx, next);
    });
  }
  route(router, routeHandlers, fallback = pass) {
    return this.lazy(async (ctx) => {
      const route = await router(ctx);
      return (route === void 0 || !routeHandlers[route] ? fallback : routeHandlers[route]) ?? [];
    });
  }
  branch(predicate, trueMiddleware, falseMiddleware) {
    return this.lazy(async (ctx) => await predicate(ctx) ? trueMiddleware : falseMiddleware);
  }
  errorBoundary(errorHandler2, ...middleware) {
    const composer = new _Composer(...middleware);
    const bound = flatten(composer);
    this.use(async (ctx, next) => {
      let nextCalled = false;
      const cont = /* @__PURE__ */ __name(() => (nextCalled = true, Promise.resolve()), "cont");
      try {
        await bound(ctx, cont);
      } catch (err) {
        nextCalled = false;
        await errorHandler2(new BotError(err, ctx), cont);
      }
      if (nextCalled) await next();
    });
    return composer;
  }
};
var s = 1e3;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
var ms = /* @__PURE__ */ __name(function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === "string" && val.length > 0) {
    return parse1(val);
  } else if (type === "number" && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
}, "ms");
function parse1(str2) {
  str2 = String(str2);
  if (str2.length > 100) {
    return;
  }
  var match3 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str2);
  if (!match3) {
    return;
  }
  var n = parseFloat(match3[1]);
  var type = (match3[2] || "ms").toLowerCase();
  switch (type) {
    case "years":
    case "year":
    case "yrs":
    case "yr":
    case "y":
      return n * y;
    case "weeks":
    case "week":
    case "w":
      return n * w;
    case "days":
    case "day":
    case "d":
      return n * d;
    case "hours":
    case "hour":
    case "hrs":
    case "hr":
    case "h":
      return n * h;
    case "minutes":
    case "minute":
    case "mins":
    case "min":
    case "m":
      return n * m;
    case "seconds":
    case "second":
    case "secs":
    case "sec":
    case "s":
      return n * s;
    case "milliseconds":
    case "millisecond":
    case "msecs":
    case "msec":
    case "ms":
      return n;
    default:
      return void 0;
  }
}
__name(parse1, "parse1");
function fmtShort(ms2) {
  var msAbs = Math.abs(ms2);
  if (msAbs >= d) {
    return Math.round(ms2 / d) + "d";
  }
  if (msAbs >= h) {
    return Math.round(ms2 / h) + "h";
  }
  if (msAbs >= m) {
    return Math.round(ms2 / m) + "m";
  }
  if (msAbs >= s) {
    return Math.round(ms2 / s) + "s";
  }
  return ms2 + "ms";
}
__name(fmtShort, "fmtShort");
function fmtLong(ms2) {
  var msAbs = Math.abs(ms2);
  if (msAbs >= d) {
    return plural(ms2, msAbs, d, "day");
  }
  if (msAbs >= h) {
    return plural(ms2, msAbs, h, "hour");
  }
  if (msAbs >= m) {
    return plural(ms2, msAbs, m, "minute");
  }
  if (msAbs >= s) {
    return plural(ms2, msAbs, s, "second");
  }
  return ms2 + " ms";
}
__name(fmtLong, "fmtLong");
function plural(ms2, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
}
__name(plural, "plural");
function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
__name(defaultSetTimout, "defaultSetTimout");
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
}
__name(defaultClearTimeout, "defaultClearTimeout");
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
var globalContext;
if (typeof window !== "undefined") {
  globalContext = window;
} else if (typeof self !== "undefined") {
  globalContext = self;
} else {
  globalContext = {};
}
if (typeof globalContext.setTimeout === "function") {
  cachedSetTimeout = setTimeout;
}
if (typeof globalContext.clearTimeout === "function") {
  cachedClearTimeout = clearTimeout;
}
function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    return setTimeout(fun, 0);
  }
  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }
  try {
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e2) {
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}
__name(runTimeout, "runTimeout");
function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    return clearTimeout(marker);
  }
  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }
  try {
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      return cachedClearTimeout.call(null, marker);
    } catch (e2) {
      return cachedClearTimeout.call(this, marker);
    }
  }
}
__name(runClearTimeout, "runClearTimeout");
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    drainQueue();
  }
}
__name(cleanUpNextTick, "cleanUpNextTick");
function drainQueue() {
  if (draining) {
    return;
  }
  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;
  while (len) {
    currentQueue = queue;
    queue = [];
    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }
    queueIndex = -1;
    len = queue.length;
  }
  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}
__name(drainQueue, "drainQueue");
function nextTick(fun) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }
  queue.push(new Item(fun, args));
  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}
__name(nextTick, "nextTick");
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
__name(Item, "Item");
Item.prototype.run = function() {
  this.fun.apply(null, this.array);
};
var title = "browser";
var platform = "browser";
var browser = true;
var argv = [];
var version = "";
var versions = {};
var release = {};
var config = {};
function noop() {
}
__name(noop, "noop");
var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;
function binding(name) {
  throw new Error("process.binding is not supported");
}
__name(binding, "binding");
function cwd() {
  return "/";
}
__name(cwd, "cwd");
function chdir(dir) {
  throw new Error("process.chdir is not supported");
}
__name(chdir, "chdir");
function umask() {
  return 0;
}
__name(umask, "umask");
var performance = globalContext.performance || {};
var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
  return (/* @__PURE__ */ new Date()).getTime();
};
function hrtime(previousTimestamp) {
  var clocktime = performanceNow.call(performance) * 1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor(clocktime % 1 * 1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds < 0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [
    seconds,
    nanoseconds
  ];
}
__name(hrtime, "hrtime");
var startTime = /* @__PURE__ */ new Date();
function uptime() {
  var currentTime = /* @__PURE__ */ new Date();
  var dif = currentTime - startTime;
  return dif / 1e3;
}
__name(uptime, "uptime");
var process = {
  nextTick,
  title,
  browser,
  env: {
    NODE_ENV: "production"
  },
  argv,
  version,
  versions,
  on,
  addListener,
  once,
  off,
  removeListener,
  removeAllListeners,
  emit,
  binding,
  cwd,
  chdir,
  umask,
  hrtime,
  platform,
  release,
  config,
  uptime
};
function createCommonjsModule(fn, basedir, module) {
  return module = {
    path: basedir,
    exports: {},
    require: /* @__PURE__ */ __name(function(path, base) {
      return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
    }, "require")
  }, fn(module, module.exports), module.exports;
}
__name(createCommonjsModule, "createCommonjsModule");
function commonjsRequire() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
__name(commonjsRequire, "commonjsRequire");
function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = ms;
  createDebug.destroy = destroy2;
  Object.keys(env).forEach((key) => {
    createDebug[key] = env[key];
  });
  createDebug.names = [];
  createDebug.skips = [];
  createDebug.formatters = {};
  function selectColor(namespace) {
    let hash = 0;
    for (let i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0;
    }
    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }
  __name(selectColor, "selectColor");
  createDebug.selectColor = selectColor;
  function createDebug(namespace) {
    let prevTime;
    let enableOverride = null;
    let namespacesCache;
    let enabledCache;
    function debug4(...args) {
      if (!debug4.enabled) {
        return;
      }
      const self2 = debug4;
      const curr = Number(/* @__PURE__ */ new Date());
      const ms2 = curr - (prevTime || curr);
      self2.diff = ms2;
      self2.prev = prevTime;
      self2.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);
      if (typeof args[0] !== "string") {
        args.unshift("%O");
      }
      let index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, (match3, format) => {
        if (match3 === "%%") {
          return "%";
        }
        index++;
        const formatter = createDebug.formatters[format];
        if (typeof formatter === "function") {
          const val = args[index];
          match3 = formatter.call(self2, val);
          args.splice(index, 1);
          index--;
        }
        return match3;
      });
      createDebug.formatArgs.call(self2, args);
      const logFn = self2.log || createDebug.log;
      logFn.apply(self2, args);
    }
    __name(debug4, "debug");
    debug4.namespace = namespace;
    debug4.useColors = createDebug.useColors();
    debug4.color = createDebug.selectColor(namespace);
    debug4.extend = extend;
    debug4.destroy = createDebug.destroy;
    Object.defineProperty(debug4, "enabled", {
      enumerable: true,
      configurable: false,
      get: /* @__PURE__ */ __name(() => {
        if (enableOverride !== null) {
          return enableOverride;
        }
        if (namespacesCache !== createDebug.namespaces) {
          namespacesCache = createDebug.namespaces;
          enabledCache = createDebug.enabled(namespace);
        }
        return enabledCache;
      }, "get"),
      set: /* @__PURE__ */ __name((v) => {
        enableOverride = v;
      }, "set")
    });
    if (typeof createDebug.init === "function") {
      createDebug.init(debug4);
    }
    return debug4;
  }
  __name(createDebug, "createDebug");
  function extend(namespace, delimiter) {
    const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
    newDebug.log = this.log;
    return newDebug;
  }
  __name(extend, "extend");
  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.namespaces = namespaces;
    createDebug.names = [];
    createDebug.skips = [];
    const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
    for (const ns of split) {
      if (ns[0] === "-") {
        createDebug.skips.push(ns.slice(1));
      } else {
        createDebug.names.push(ns);
      }
    }
  }
  __name(enable, "enable");
  function matchesTemplate(search, template) {
    let searchIndex = 0;
    let templateIndex = 0;
    let starIndex = -1;
    let matchIndex = 0;
    while (searchIndex < search.length) {
      if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
        if (template[templateIndex] === "*") {
          starIndex = templateIndex;
          matchIndex = searchIndex;
          templateIndex++;
        } else {
          searchIndex++;
          templateIndex++;
        }
      } else if (starIndex !== -1) {
        templateIndex = starIndex + 1;
        matchIndex++;
        searchIndex = matchIndex;
      } else {
        return false;
      }
    }
    while (templateIndex < template.length && template[templateIndex] === "*") {
      templateIndex++;
    }
    return templateIndex === template.length;
  }
  __name(matchesTemplate, "matchesTemplate");
  function disable() {
    const namespaces = [
      ...createDebug.names,
      ...createDebug.skips.map((namespace) => "-" + namespace)
    ].join(",");
    createDebug.enable("");
    return namespaces;
  }
  __name(disable, "disable");
  function enabled(name) {
    for (const skip of createDebug.skips) {
      if (matchesTemplate(name, skip)) {
        return false;
      }
    }
    for (const ns of createDebug.names) {
      if (matchesTemplate(name, ns)) {
        return true;
      }
    }
    return false;
  }
  __name(enabled, "enabled");
  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }
    return val;
  }
  __name(coerce, "coerce");
  function destroy2() {
    console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  }
  __name(destroy2, "destroy2");
  createDebug.enable(createDebug.load());
  return createDebug;
}
__name(setup, "setup");
var common = setup;
var browser$1 = createCommonjsModule(function(module, exports) {
  exports.formatArgs = formatArgs2;
  exports.save = save2;
  exports.load = load2;
  exports.useColors = useColors2;
  exports.storage = localstorage();
  exports.destroy = /* @__PURE__ */ (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function useColors2() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && "Cloudflare-Workers" && "Cloudflare-Workers".toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    let m2;
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && "Cloudflare-Workers" && (m2 = "Cloudflare-Workers".toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m2[1], 10) >= 31 || typeof navigator !== "undefined" && "Cloudflare-Workers" && "Cloudflare-Workers".toLowerCase().match(/applewebkit\/(\d+)/);
  }
  __name(useColors2, "useColors2");
  function formatArgs2(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match3) => {
      if (match3 === "%%") {
        return;
      }
      index++;
      if (match3 === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  __name(formatArgs2, "formatArgs2");
  exports.log = console.debug || console.log || (() => {
  });
  function save2(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {
    }
  }
  __name(save2, "save2");
  function load2() {
    let r;
    try {
      r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
    } catch (error) {
    }
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  __name(load2, "load2");
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {
    }
  }
  __name(localstorage, "localstorage");
  module.exports = common(exports);
  const { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});
browser$1.colors;
browser$1.destroy;
browser$1.formatArgs;
browser$1.load;
browser$1.log;
browser$1.save;
browser$1.storage;
browser$1.useColors;
var itrToStream = /* @__PURE__ */ __name((itr) => {
  const it = itr[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller) {
      const chunk = await it.next();
      if (chunk.done) controller.close();
      else controller.enqueue(chunk.value);
    }
  });
}, "itrToStream");
var baseFetchConfig = /* @__PURE__ */ __name((_apiRoot) => ({}), "baseFetchConfig");
var debug = browser$1("grammy:warn");
var GrammyError = class extends Error {
  static {
    __name(this, "GrammyError");
  }
  method;
  payload;
  ok;
  error_code;
  description;
  parameters;
  constructor(message, err, method, payload) {
    super(`${message} (${err.error_code}: ${err.description})`);
    this.method = method;
    this.payload = payload;
    this.ok = false;
    this.name = "GrammyError";
    this.error_code = err.error_code;
    this.description = err.description;
    this.parameters = err.parameters ?? {};
  }
};
function toGrammyError(err, method, payload) {
  switch (err.error_code) {
    case 401:
      debug("Error 401 means that your bot token is wrong, talk to https://t.me/BotFather to check it.");
      break;
    case 409:
      debug("Error 409 means that you are running your bot several times on long polling. Consider revoking the bot token if you believe that no other instance is running.");
      break;
  }
  return new GrammyError(`Call to '${method}' failed!`, err, method, payload);
}
__name(toGrammyError, "toGrammyError");
var HttpError = class extends Error {
  static {
    __name(this, "HttpError");
  }
  error;
  constructor(message, error) {
    super(message);
    this.error = error;
    this.name = "HttpError";
  }
};
function isTelegramError(err) {
  return typeof err === "object" && err !== null && "status" in err && "statusText" in err;
}
__name(isTelegramError, "isTelegramError");
function toHttpError(method, sensitiveLogs, err) {
  let msg = `Network request for '${method}' failed!`;
  if (isTelegramError(err)) msg += ` (${err.status}: ${err.statusText})`;
  if (sensitiveLogs && err instanceof Error) msg += ` ${err.message}`;
  return new HttpError(msg, err);
}
__name(toHttpError, "toHttpError");
function checkWindows() {
  const global = globalThis;
  const platform2 = global.process?.platform;
  if (typeof platform2 === "string") return platform2.startsWith("win");
  const os = global.Deno?.build?.os;
  if (typeof os === "string") return os === "windows";
  return global.navigator?.platform?.startsWith("Win") ?? false;
}
__name(checkWindows, "checkWindows");
var isWindows = checkWindows();
function assertPath(path) {
  if (typeof path !== "string") {
    throw new TypeError(`Path must be a string, received "${JSON.stringify(path)}"`);
  }
}
__name(assertPath, "assertPath");
function stripSuffix(name, suffix) {
  if (suffix.length >= name.length) {
    return name;
  }
  const lenDiff = name.length - suffix.length;
  for (let i = suffix.length - 1; i >= 0; --i) {
    if (name.charCodeAt(lenDiff + i) !== suffix.charCodeAt(i)) {
      return name;
    }
  }
  return name.slice(0, -suffix.length);
}
__name(stripSuffix, "stripSuffix");
function lastPathSegment(path, isSep, start = 0) {
  let matchedNonSeparator = false;
  let end = path.length;
  for (let i = path.length - 1; i >= start; --i) {
    if (isSep(path.charCodeAt(i))) {
      if (matchedNonSeparator) {
        start = i + 1;
        break;
      }
    } else if (!matchedNonSeparator) {
      matchedNonSeparator = true;
      end = i + 1;
    }
  }
  return path.slice(start, end);
}
__name(lastPathSegment, "lastPathSegment");
function assertArgs(path, suffix) {
  assertPath(path);
  if (path.length === 0) return path;
  if (typeof suffix !== "string") {
    throw new TypeError(`Suffix must be a string, received "${JSON.stringify(suffix)}"`);
  }
}
__name(assertArgs, "assertArgs");
function assertArg(url) {
  url = url instanceof URL ? url : new URL(url);
  if (url.protocol !== "file:") {
    throw new TypeError(`URL must be a file URL: received "${url.protocol}"`);
  }
  return url;
}
__name(assertArg, "assertArg");
function fromFileUrl(url) {
  url = assertArg(url);
  return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
__name(fromFileUrl, "fromFileUrl");
function stripTrailingSeparators(segment, isSep) {
  if (segment.length <= 1) {
    return segment;
  }
  let end = segment.length;
  for (let i = segment.length - 1; i > 0; i--) {
    if (isSep(segment.charCodeAt(i))) {
      end = i;
    } else {
      break;
    }
  }
  return segment.slice(0, end);
}
__name(stripTrailingSeparators, "stripTrailingSeparators");
function isPosixPathSeparator(code) {
  return code === 47;
}
__name(isPosixPathSeparator, "isPosixPathSeparator");
function basename(path, suffix = "") {
  if (path instanceof URL) {
    path = fromFileUrl(path);
  }
  assertArgs(path, suffix);
  const lastSegment = lastPathSegment(path, isPosixPathSeparator);
  const strippedSegment = stripTrailingSeparators(lastSegment, isPosixPathSeparator);
  return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
__name(basename, "basename");
function isPathSeparator(code) {
  return code === 47 || code === 92;
}
__name(isPathSeparator, "isPathSeparator");
function isWindowsDeviceRoot(code) {
  return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
__name(isWindowsDeviceRoot, "isWindowsDeviceRoot");
function fromFileUrl1(url) {
  url = assertArg(url);
  let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  if (url.hostname !== "") {
    path = `\\\\${url.hostname}${path}`;
  }
  return path;
}
__name(fromFileUrl1, "fromFileUrl1");
function basename1(path, suffix = "") {
  if (path instanceof URL) {
    path = fromFileUrl1(path);
  }
  assertArgs(path, suffix);
  let start = 0;
  if (path.length >= 2) {
    const drive = path.charCodeAt(0);
    if (isWindowsDeviceRoot(drive)) {
      if (path.charCodeAt(1) === 58) start = 2;
    }
  }
  const lastSegment = lastPathSegment(path, isPathSeparator, start);
  const strippedSegment = stripTrailingSeparators(lastSegment, isPathSeparator);
  return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
__name(basename1, "basename1");
function basename2(path, suffix = "") {
  return isWindows ? basename1(path, suffix) : basename(path, suffix);
}
__name(basename2, "basename2");
var InputFile = class {
  static {
    __name(this, "InputFile");
  }
  consumed = false;
  fileData;
  filename;
  constructor(file, filename) {
    this.fileData = file;
    filename ??= this.guessFilename(file);
    this.filename = filename;
  }
  guessFilename(file) {
    if (typeof file === "string") return basename2(file);
    if (typeof file !== "object") return void 0;
    if ("url" in file) return basename2(file.url);
    if (!(file instanceof URL)) return void 0;
    return basename2(file.pathname) || basename2(file.hostname);
  }
  toRaw() {
    if (this.consumed) {
      throw new Error("Cannot reuse InputFile data source!");
    }
    const data = this.fileData;
    if (data instanceof Blob) return data.stream();
    if (data instanceof URL) return fetchFile(data);
    if ("url" in data) return fetchFile(data.url);
    if (!(data instanceof Uint8Array)) this.consumed = true;
    return data;
  }
  toJSON() {
    throw new Error("InputFile instances must be sent via grammY");
  }
};
async function* fetchFile(url) {
  const { body } = await fetch(url);
  if (body === null) {
    throw new Error(`Download failed, no response body from '${url}'`);
  }
  yield* body;
}
__name(fetchFile, "fetchFile");
function requiresFormDataUpload(payload) {
  return payload instanceof InputFile || typeof payload === "object" && payload !== null && Object.values(payload).some((v) => Array.isArray(v) ? v.some(requiresFormDataUpload) : v instanceof InputFile || requiresFormDataUpload(v));
}
__name(requiresFormDataUpload, "requiresFormDataUpload");
function str(value) {
  return JSON.stringify(value, (_, v) => v ?? void 0);
}
__name(str, "str");
function createJsonPayload(payload) {
  return {
    method: "POST",
    headers: {
      "content-type": "application/json",
      connection: "keep-alive"
    },
    body: str(payload)
  };
}
__name(createJsonPayload, "createJsonPayload");
async function* protectItr(itr, onError) {
  try {
    yield* itr;
  } catch (err) {
    onError(err);
  }
}
__name(protectItr, "protectItr");
function createFormDataPayload(payload, onError) {
  const boundary = createBoundary();
  const itr = payloadToMultipartItr(payload, boundary);
  const safeItr = protectItr(itr, onError);
  const stream = itrToStream(safeItr);
  return {
    method: "POST",
    headers: {
      "content-type": `multipart/form-data; boundary=${boundary}`,
      connection: "keep-alive"
    },
    body: stream
  };
}
__name(createFormDataPayload, "createFormDataPayload");
function createBoundary() {
  return "----------" + randomId(32);
}
__name(createBoundary, "createBoundary");
function randomId(length = 16) {
  return Array.from(Array(length)).map(() => Math.random().toString(36)[2] || 0).join("");
}
__name(randomId, "randomId");
var enc = new TextEncoder();
async function* payloadToMultipartItr(payload, boundary) {
  const files = collectFiles(payload);
  yield enc.encode(`--${boundary}\r
`);
  const separator = enc.encode(`\r
--${boundary}\r
`);
  let first = true;
  for (const [key, value] of Object.entries(payload)) {
    if (value == null) continue;
    if (!first) yield separator;
    yield valuePart(key, value instanceof InputFile ? value.toJSON() : typeof value === "object" ? str(value) : value);
    first = false;
  }
  for (const { id, origin, file } of files) {
    if (!first) yield separator;
    yield* filePart(id, origin, file);
    first = false;
  }
  yield enc.encode(`\r
--${boundary}--\r
`);
}
__name(payloadToMultipartItr, "payloadToMultipartItr");
function collectFiles(value) {
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([k, v]) => {
    if (Array.isArray(v)) return v.flatMap((p) => collectFiles(p));
    else if (v instanceof InputFile) {
      const id = randomId();
      Object.assign(v, {
        toJSON: /* @__PURE__ */ __name(() => `attach://${id}`, "toJSON")
      });
      const origin = k === "media" && "type" in value && typeof value.type === "string" ? value.type : k;
      return {
        id,
        origin,
        file: v
      };
    } else return collectFiles(v);
  });
}
__name(collectFiles, "collectFiles");
function valuePart(key, value) {
  return enc.encode(`content-disposition:form-data;name="${key}"\r
\r
${value}`);
}
__name(valuePart, "valuePart");
async function* filePart(id, origin, input) {
  const filename = input.filename || `${origin}.${getExt(origin)}`;
  if (filename.includes("\r") || filename.includes("\n")) {
    throw new Error(`File paths cannot contain carriage-return (\\r) or newline (\\n) characters! Filename for property '${origin}' was:
"""
${filename}
"""`);
  }
  yield enc.encode(`content-disposition:form-data;name="${id}";filename=${filename}\r
content-type:application/octet-stream\r
\r
`);
  const data = await input.toRaw();
  if (data instanceof Uint8Array) yield data;
  else yield* data;
}
__name(filePart, "filePart");
function getExt(key) {
  switch (key) {
    case "certificate":
      return "pem";
    case "photo":
    case "thumbnail":
      return "jpg";
    case "voice":
      return "ogg";
    case "audio":
      return "mp3";
    case "animation":
    case "video":
    case "video_note":
      return "mp4";
    case "sticker":
      return "webp";
    default:
      return "dat";
  }
}
__name(getExt, "getExt");
var debug1 = browser$1("grammy:core");
function concatTransformer(prev, trans) {
  return (method, payload, signal) => trans(prev, method, payload, signal);
}
__name(concatTransformer, "concatTransformer");
var ApiClient = class {
  static {
    __name(this, "ApiClient");
  }
  token;
  webhookReplyEnvelope;
  options;
  fetch;
  hasUsedWebhookReply;
  installedTransformers;
  constructor(token, options = {}, webhookReplyEnvelope = {}) {
    this.token = token;
    this.webhookReplyEnvelope = webhookReplyEnvelope;
    this.hasUsedWebhookReply = false;
    this.installedTransformers = [];
    this.call = async (method, p, signal) => {
      const payload = p ?? {};
      debug1(`Calling ${method}`);
      if (signal !== void 0) validateSignal(method, payload, signal);
      const opts = this.options;
      const formDataRequired = requiresFormDataUpload(payload);
      if (this.webhookReplyEnvelope.send !== void 0 && !this.hasUsedWebhookReply && !formDataRequired && opts.canUseWebhookReply(method)) {
        this.hasUsedWebhookReply = true;
        const config3 = createJsonPayload({
          ...payload,
          method
        });
        await this.webhookReplyEnvelope.send(config3.body);
        return {
          ok: true,
          result: true
        };
      }
      const controller = createAbortControllerFromSignal(signal);
      const timeout = createTimeout(controller, opts.timeoutSeconds, method);
      const streamErr = createStreamError(controller);
      const url = opts.buildUrl(opts.apiRoot, this.token, method, opts.environment);
      const config2 = formDataRequired ? createFormDataPayload(payload, (err) => streamErr.catch(err)) : createJsonPayload(payload);
      const sig = controller.signal;
      const options2 = {
        ...opts.baseFetchConfig,
        signal: sig,
        ...config2
      };
      const successPromise = this.fetch(url, options2).then((res) => res.json());
      const operations = [
        successPromise,
        streamErr.promise,
        timeout.promise
      ];
      try {
        return await Promise.race(operations);
      } catch (error) {
        throw toHttpError(method, opts.sensitiveLogs, error);
      } finally {
        if (timeout.handle !== void 0) clearTimeout(timeout.handle);
      }
    };
    const apiRoot = options.apiRoot ?? "https://api.telegram.org";
    const environment = options.environment ?? "prod";
    const { fetch: customFetch } = options;
    const fetchFn = customFetch ?? fetch;
    this.options = {
      apiRoot,
      environment,
      buildUrl: options.buildUrl ?? defaultBuildUrl,
      timeoutSeconds: options.timeoutSeconds ?? 500,
      baseFetchConfig: {
        ...baseFetchConfig(apiRoot),
        ...options.baseFetchConfig
      },
      canUseWebhookReply: options.canUseWebhookReply ?? (() => false),
      sensitiveLogs: options.sensitiveLogs ?? false,
      fetch: /* @__PURE__ */ __name((...args) => fetchFn(...args), "fetch")
    };
    this.fetch = this.options.fetch;
    if (this.options.apiRoot.endsWith("/")) {
      throw new Error(`Remove the trailing '/' from the 'apiRoot' option (use '${this.options.apiRoot.substring(0, this.options.apiRoot.length - 1)}' instead of '${this.options.apiRoot}')`);
    }
  }
  call;
  use(...transformers) {
    this.call = transformers.reduce(concatTransformer, this.call);
    this.installedTransformers.push(...transformers);
    return this;
  }
  async callApi(method, payload, signal) {
    const data = await this.call(method, payload, signal);
    if (data.ok) return data.result;
    else throw toGrammyError(data, method, payload);
  }
};
function createRawApi(token, options, webhookReplyEnvelope) {
  const client = new ApiClient(token, options, webhookReplyEnvelope);
  const proxyHandler = {
    get(_, m2) {
      return m2 === "toJSON" ? "__internal" : m2 === "getMe" || m2 === "getWebhookInfo" || m2 === "getForumTopicIconStickers" || m2 === "getAvailableGifts" || m2 === "logOut" || m2 === "close" || m2 === "getMyStarBalance" || m2 === "removeMyProfilePhoto" ? client.callApi.bind(client, m2, {}) : client.callApi.bind(client, m2);
    },
    ...proxyMethods
  };
  const raw2 = new Proxy({}, proxyHandler);
  const installedTransformers = client.installedTransformers;
  const api2 = {
    raw: raw2,
    installedTransformers,
    use: /* @__PURE__ */ __name((...t) => {
      client.use(...t);
      return api2;
    }, "use")
  };
  return api2;
}
__name(createRawApi, "createRawApi");
var defaultBuildUrl = /* @__PURE__ */ __name((root, token, method, env) => {
  const prefix = env === "test" ? "test/" : "";
  return `${root}/bot${token}/${prefix}${method}`;
}, "defaultBuildUrl");
var proxyMethods = {
  set() {
    return false;
  },
  defineProperty() {
    return false;
  },
  deleteProperty() {
    return false;
  },
  ownKeys() {
    return [];
  }
};
function createTimeout(controller, seconds, method) {
  let handle = void 0;
  const promise = new Promise((_, reject) => {
    handle = setTimeout(() => {
      const msg = `Request to '${method}' timed out after ${seconds} seconds`;
      reject(new Error(msg));
      controller.abort();
    }, 1e3 * seconds);
  });
  return {
    promise,
    handle
  };
}
__name(createTimeout, "createTimeout");
function createStreamError(abortController) {
  let onError = /* @__PURE__ */ __name((err) => {
    throw err;
  }, "onError");
  const promise = new Promise((_, reject) => {
    onError = /* @__PURE__ */ __name((err) => {
      reject(err);
      abortController.abort();
    }, "onError");
  });
  return {
    promise,
    catch: onError
  };
}
__name(createStreamError, "createStreamError");
function createAbortControllerFromSignal(signal) {
  const abortController = new AbortController();
  if (signal === void 0) return abortController;
  const sig = signal;
  function abort() {
    abortController.abort();
    sig.removeEventListener("abort", abort);
  }
  __name(abort, "abort");
  if (sig.aborted) abort();
  else sig.addEventListener("abort", abort);
  return {
    abort,
    signal: abortController.signal
  };
}
__name(createAbortControllerFromSignal, "createAbortControllerFromSignal");
function validateSignal(method, payload, signal) {
  if (typeof signal?.addEventListener === "function") {
    return;
  }
  let payload0 = JSON.stringify(payload);
  if (payload0.length > 20) {
    payload0 = payload0.substring(0, 16) + " ...";
  }
  let payload1 = JSON.stringify(signal);
  if (payload1.length > 20) {
    payload1 = payload1.substring(0, 16) + " ...";
  }
  throw new Error(`Incorrect abort signal instance found! You passed two payloads to '${method}' but you should merge the second one containing '${payload1}' into the first one containing '${payload0}'! If you are using context shortcuts, you may want to use a method on 'ctx.api' instead.

If you want to prevent such mistakes in the future, consider using TypeScript. https://www.typescriptlang.org/`);
}
__name(validateSignal, "validateSignal");
var Api = class {
  static {
    __name(this, "Api");
  }
  token;
  options;
  raw;
  config;
  constructor(token, options, webhookReplyEnvelope) {
    this.token = token;
    this.options = options;
    const { raw: raw2, use, installedTransformers } = createRawApi(token, options, webhookReplyEnvelope);
    this.raw = raw2;
    this.config = {
      use,
      installedTransformers: /* @__PURE__ */ __name(() => installedTransformers.slice(), "installedTransformers")
    };
  }
  getUpdates(other, signal) {
    return this.raw.getUpdates({
      ...other
    }, signal);
  }
  setWebhook(url, other, signal) {
    return this.raw.setWebhook({
      url,
      ...other
    }, signal);
  }
  deleteWebhook(other, signal) {
    return this.raw.deleteWebhook({
      ...other
    }, signal);
  }
  getWebhookInfo(signal) {
    return this.raw.getWebhookInfo(signal);
  }
  getMe(signal) {
    return this.raw.getMe(signal);
  }
  logOut(signal) {
    return this.raw.logOut(signal);
  }
  close(signal) {
    return this.raw.close(signal);
  }
  sendMessage(chat_id, text, other, signal) {
    return this.raw.sendMessage({
      chat_id,
      text,
      ...other
    }, signal);
  }
  sendRichMessage(chat_id, rich_message, other, signal) {
    return this.raw.sendRichMessage({
      chat_id,
      rich_message,
      ...other
    }, signal);
  }
  forwardMessage(chat_id, from_chat_id, message_id, other, signal) {
    return this.raw.forwardMessage({
      chat_id,
      from_chat_id,
      message_id,
      ...other
    }, signal);
  }
  forwardMessages(chat_id, from_chat_id, message_ids, other, signal) {
    return this.raw.forwardMessages({
      chat_id,
      from_chat_id,
      message_ids,
      ...other
    }, signal);
  }
  copyMessage(chat_id, from_chat_id, message_id, other, signal) {
    return this.raw.copyMessage({
      chat_id,
      from_chat_id,
      message_id,
      ...other
    }, signal);
  }
  copyMessages(chat_id, from_chat_id, message_ids, other, signal) {
    return this.raw.copyMessages({
      chat_id,
      from_chat_id,
      message_ids,
      ...other
    }, signal);
  }
  sendPhoto(chat_id, photo, other, signal) {
    return this.raw.sendPhoto({
      chat_id,
      photo,
      ...other
    }, signal);
  }
  sendLivePhoto(chat_id, live_photo, photo, other, signal) {
    return this.raw.sendLivePhoto({
      chat_id,
      live_photo,
      photo,
      ...other
    }, signal);
  }
  sendAudio(chat_id, audio, other, signal) {
    return this.raw.sendAudio({
      chat_id,
      audio,
      ...other
    }, signal);
  }
  sendDocument(chat_id, document1, other, signal) {
    return this.raw.sendDocument({
      chat_id,
      document: document1,
      ...other
    }, signal);
  }
  sendVideo(chat_id, video, other, signal) {
    return this.raw.sendVideo({
      chat_id,
      video,
      ...other
    }, signal);
  }
  sendAnimation(chat_id, animation, other, signal) {
    return this.raw.sendAnimation({
      chat_id,
      animation,
      ...other
    }, signal);
  }
  sendVoice(chat_id, voice, other, signal) {
    return this.raw.sendVoice({
      chat_id,
      voice,
      ...other
    }, signal);
  }
  sendVideoNote(chat_id, video_note, other, signal) {
    return this.raw.sendVideoNote({
      chat_id,
      video_note,
      ...other
    }, signal);
  }
  sendPaidMedia(chat_id, star_count, media, other, signal) {
    return this.raw.sendPaidMedia({
      chat_id,
      star_count,
      media,
      ...other
    }, signal);
  }
  sendMediaGroup(chat_id, media, other, signal) {
    return this.raw.sendMediaGroup({
      chat_id,
      media,
      ...other
    }, signal);
  }
  sendLocation(chat_id, latitude, longitude, other, signal) {
    return this.raw.sendLocation({
      chat_id,
      latitude,
      longitude,
      ...other
    }, signal);
  }
  editMessageLiveLocation(chat_id, message_id, latitude, longitude, other, signal) {
    return this.raw.editMessageLiveLocation({
      chat_id,
      message_id,
      latitude,
      longitude,
      ...other
    }, signal);
  }
  editMessageLiveLocationInline(inline_message_id, latitude, longitude, other, signal) {
    return this.raw.editMessageLiveLocation({
      inline_message_id,
      latitude,
      longitude,
      ...other
    }, signal);
  }
  stopMessageLiveLocation(chat_id, message_id, other, signal) {
    return this.raw.stopMessageLiveLocation({
      chat_id,
      message_id,
      ...other
    }, signal);
  }
  stopMessageLiveLocationInline(inline_message_id, other, signal) {
    return this.raw.stopMessageLiveLocation({
      inline_message_id,
      ...other
    }, signal);
  }
  sendVenue(chat_id, latitude, longitude, title2, address, other, signal) {
    return this.raw.sendVenue({
      chat_id,
      latitude,
      longitude,
      title: title2,
      address,
      ...other
    }, signal);
  }
  sendContact(chat_id, phone_number, first_name, other, signal) {
    return this.raw.sendContact({
      chat_id,
      phone_number,
      first_name,
      ...other
    }, signal);
  }
  sendPoll(chat_id, question, options, other, signal) {
    const opts = options.map((o) => typeof o === "string" ? {
      text: o
    } : o);
    return this.raw.sendPoll({
      chat_id,
      question,
      options: opts,
      ...other
    }, signal);
  }
  sendChecklist(business_connection_id, chat_id, checklist, other, signal) {
    return this.raw.sendChecklist({
      business_connection_id,
      chat_id,
      checklist,
      ...other
    }, signal);
  }
  editMessageChecklist(business_connection_id, chat_id, message_id, checklist, other, signal) {
    return this.raw.editMessageChecklist({
      business_connection_id,
      chat_id,
      message_id,
      checklist,
      ...other
    }, signal);
  }
  sendDice(chat_id, emoji, other, signal) {
    return this.raw.sendDice({
      chat_id,
      emoji,
      ...other
    }, signal);
  }
  setMessageReaction(chat_id, message_id, reaction, other, signal) {
    return this.raw.setMessageReaction({
      chat_id,
      message_id,
      reaction,
      ...other
    }, signal);
  }
  sendMessageDraft(chat_id, draft_id, text, other, signal) {
    return this.raw.sendMessageDraft({
      chat_id,
      draft_id,
      text,
      ...other
    }, signal);
  }
  sendRichMessageDraft(chat_id, draft_id, rich_message, other, signal) {
    return this.raw.sendRichMessageDraft({
      chat_id,
      draft_id,
      rich_message,
      ...other
    }, signal);
  }
  sendChatAction(chat_id, action, other, signal) {
    return this.raw.sendChatAction({
      chat_id,
      action,
      ...other
    }, signal);
  }
  getUserProfilePhotos(user_id, other, signal) {
    return this.raw.getUserProfilePhotos({
      user_id,
      ...other
    }, signal);
  }
  getUserProfileAudios(user_id, other, signal) {
    return this.raw.getUserProfileAudios({
      user_id,
      ...other
    }, signal);
  }
  setUserEmojiStatus(user_id, other, signal) {
    return this.raw.setUserEmojiStatus({
      user_id,
      ...other
    }, signal);
  }
  getUserChatBoosts(chat_id, user_id, signal) {
    return this.raw.getUserChatBoosts({
      chat_id,
      user_id
    }, signal);
  }
  getUserGifts(user_id, other, signal) {
    return this.raw.getUserGifts({
      user_id,
      ...other
    }, signal);
  }
  getChatGifts(chat_id, other, signal) {
    return this.raw.getChatGifts({
      chat_id,
      ...other
    }, signal);
  }
  getBusinessConnection(business_connection_id, signal) {
    return this.raw.getBusinessConnection({
      business_connection_id
    }, signal);
  }
  getManagedBotToken(user_id, signal) {
    return this.raw.getManagedBotToken({
      user_id
    }, signal);
  }
  replaceManagedBotToken(user_id, signal) {
    return this.raw.replaceManagedBotToken({
      user_id
    }, signal);
  }
  getManagedBotAccessSettings(user_id, signal) {
    return this.raw.getManagedBotAccessSettings({
      user_id
    }, signal);
  }
  setManagedBotAccessSettings(user_id, is_access_restricted, other, signal) {
    return this.raw.setManagedBotAccessSettings({
      user_id,
      is_access_restricted,
      ...other
    }, signal);
  }
  getFile(file_id, signal) {
    return this.raw.getFile({
      file_id
    }, signal);
  }
  kickChatMember(...args) {
    return this.banChatMember(...args);
  }
  banChatMember(chat_id, user_id, other, signal) {
    return this.raw.banChatMember({
      chat_id,
      user_id,
      ...other
    }, signal);
  }
  unbanChatMember(chat_id, user_id, other, signal) {
    return this.raw.unbanChatMember({
      chat_id,
      user_id,
      ...other
    }, signal);
  }
  restrictChatMember(chat_id, user_id, permissions, other, signal) {
    return this.raw.restrictChatMember({
      chat_id,
      user_id,
      permissions,
      ...other
    }, signal);
  }
  promoteChatMember(chat_id, user_id, other, signal) {
    return this.raw.promoteChatMember({
      chat_id,
      user_id,
      ...other
    }, signal);
  }
  setChatAdministratorCustomTitle(chat_id, user_id, custom_title, signal) {
    return this.raw.setChatAdministratorCustomTitle({
      chat_id,
      user_id,
      custom_title
    }, signal);
  }
  setChatMemberTag(chat_id, user_id, tag, signal) {
    return this.raw.setChatMemberTag({
      chat_id,
      user_id,
      tag
    }, signal);
  }
  banChatSenderChat(chat_id, sender_chat_id, signal) {
    return this.raw.banChatSenderChat({
      chat_id,
      sender_chat_id
    }, signal);
  }
  unbanChatSenderChat(chat_id, sender_chat_id, signal) {
    return this.raw.unbanChatSenderChat({
      chat_id,
      sender_chat_id
    }, signal);
  }
  setChatPermissions(chat_id, permissions, other, signal) {
    return this.raw.setChatPermissions({
      chat_id,
      permissions,
      ...other
    }, signal);
  }
  exportChatInviteLink(chat_id, signal) {
    return this.raw.exportChatInviteLink({
      chat_id
    }, signal);
  }
  createChatInviteLink(chat_id, other, signal) {
    return this.raw.createChatInviteLink({
      chat_id,
      ...other
    }, signal);
  }
  editChatInviteLink(chat_id, invite_link, other, signal) {
    return this.raw.editChatInviteLink({
      chat_id,
      invite_link,
      ...other
    }, signal);
  }
  createChatSubscriptionInviteLink(chat_id, subscription_period, subscription_price, other, signal) {
    return this.raw.createChatSubscriptionInviteLink({
      chat_id,
      subscription_period,
      subscription_price,
      ...other
    }, signal);
  }
  editChatSubscriptionInviteLink(chat_id, invite_link, other, signal) {
    return this.raw.editChatSubscriptionInviteLink({
      chat_id,
      invite_link,
      ...other
    }, signal);
  }
  revokeChatInviteLink(chat_id, invite_link, signal) {
    return this.raw.revokeChatInviteLink({
      chat_id,
      invite_link
    }, signal);
  }
  approveChatJoinRequest(chat_id, user_id, signal) {
    return this.raw.approveChatJoinRequest({
      chat_id,
      user_id
    }, signal);
  }
  declineChatJoinRequest(chat_id, user_id, signal) {
    return this.raw.declineChatJoinRequest({
      chat_id,
      user_id
    }, signal);
  }
  answerChatJoinRequestQuery(chat_join_request_query_id, result, signal) {
    return this.raw.answerChatJoinRequestQuery({
      chat_join_request_query_id,
      result
    }, signal);
  }
  sendChatJoinRequestWebApp(chat_join_request_query_id, web_app_url, signal) {
    return this.raw.sendChatJoinRequestWebApp({
      chat_join_request_query_id,
      web_app_url
    }, signal);
  }
  approveSuggestedPost(chat_id, message_id, other, signal) {
    return this.raw.approveSuggestedPost({
      chat_id,
      message_id,
      ...other
    }, signal);
  }
  declineSuggestedPost(chat_id, message_id, other, signal) {
    return this.raw.declineSuggestedPost({
      chat_id,
      message_id,
      ...other
    }, signal);
  }
  setChatPhoto(chat_id, photo, signal) {
    return this.raw.setChatPhoto({
      chat_id,
      photo
    }, signal);
  }
  deleteChatPhoto(chat_id, signal) {
    return this.raw.deleteChatPhoto({
      chat_id
    }, signal);
  }
  setChatTitle(chat_id, title2, signal) {
    return this.raw.setChatTitle({
      chat_id,
      title: title2
    }, signal);
  }
  setChatDescription(chat_id, description, signal) {
    return this.raw.setChatDescription({
      chat_id,
      description
    }, signal);
  }
  pinChatMessage(chat_id, message_id, other, signal) {
    return this.raw.pinChatMessage({
      chat_id,
      message_id,
      ...other
    }, signal);
  }
  unpinChatMessage(chat_id, message_id, other, signal) {
    return this.raw.unpinChatMessage({
      chat_id,
      message_id,
      ...other
    }, signal);
  }
  unpinAllChatMessages(chat_id, signal) {
    return this.raw.unpinAllChatMessages({
      chat_id
    }, signal);
  }
  leaveChat(chat_id, signal) {
    return this.raw.leaveChat({
      chat_id
    }, signal);
  }
  getChat(chat_id, signal) {
    return this.raw.getChat({
      chat_id
    }, signal);
  }
  getChatAdministrators(chat_id, other, signal) {
    return this.raw.getChatAdministrators({
      chat_id,
      ...other
    }, signal);
  }
  getChatMembersCount(...args) {
    return this.getChatMemberCount(...args);
  }
  getChatMemberCount(chat_id, signal) {
    return this.raw.getChatMemberCount({
      chat_id
    }, signal);
  }
  getChatMember(chat_id, user_id, signal) {
    return this.raw.getChatMember({
      chat_id,
      user_id
    }, signal);
  }
  getUserPersonalChatMessages(user_id, limit, signal) {
    return this.raw.getUserPersonalChatMessages({
      user_id,
      limit
    }, signal);
  }
  setChatStickerSet(chat_id, sticker_set_name, signal) {
    return this.raw.setChatStickerSet({
      chat_id,
      sticker_set_name
    }, signal);
  }
  deleteChatStickerSet(chat_id, signal) {
    return this.raw.deleteChatStickerSet({
      chat_id
    }, signal);
  }
  getForumTopicIconStickers(signal) {
    return this.raw.getForumTopicIconStickers(signal);
  }
  createForumTopic(chat_id, name, other, signal) {
    return this.raw.createForumTopic({
      chat_id,
      name,
      ...other
    }, signal);
  }
  editForumTopic(chat_id, message_thread_id, other, signal) {
    return this.raw.editForumTopic({
      chat_id,
      message_thread_id,
      ...other
    }, signal);
  }
  closeForumTopic(chat_id, message_thread_id, signal) {
    return this.raw.closeForumTopic({
      chat_id,
      message_thread_id
    }, signal);
  }
  reopenForumTopic(chat_id, message_thread_id, signal) {
    return this.raw.reopenForumTopic({
      chat_id,
      message_thread_id
    }, signal);
  }
  deleteForumTopic(chat_id, message_thread_id, signal) {
    return this.raw.deleteForumTopic({
      chat_id,
      message_thread_id
    }, signal);
  }
  unpinAllForumTopicMessages(chat_id, message_thread_id, signal) {
    return this.raw.unpinAllForumTopicMessages({
      chat_id,
      message_thread_id
    }, signal);
  }
  editGeneralForumTopic(chat_id, name, signal) {
    return this.raw.editGeneralForumTopic({
      chat_id,
      name
    }, signal);
  }
  closeGeneralForumTopic(chat_id, signal) {
    return this.raw.closeGeneralForumTopic({
      chat_id
    }, signal);
  }
  reopenGeneralForumTopic(chat_id, signal) {
    return this.raw.reopenGeneralForumTopic({
      chat_id
    }, signal);
  }
  hideGeneralForumTopic(chat_id, signal) {
    return this.raw.hideGeneralForumTopic({
      chat_id
    }, signal);
  }
  unhideGeneralForumTopic(chat_id, signal) {
    return this.raw.unhideGeneralForumTopic({
      chat_id
    }, signal);
  }
  unpinAllGeneralForumTopicMessages(chat_id, signal) {
    return this.raw.unpinAllGeneralForumTopicMessages({
      chat_id
    }, signal);
  }
  answerCallbackQuery(callback_query_id, other, signal) {
    return this.raw.answerCallbackQuery({
      callback_query_id,
      ...other
    }, signal);
  }
  answerGuestQuery(guest_query_id, result, signal) {
    return this.raw.answerGuestQuery({
      guest_query_id,
      result
    }, signal);
  }
  setMyName(name, other, signal) {
    return this.raw.setMyName({
      name,
      ...other
    }, signal);
  }
  getMyName(other, signal) {
    return this.raw.getMyName(other ?? {}, signal);
  }
  setMyCommands(commands, other, signal) {
    return this.raw.setMyCommands({
      commands,
      ...other
    }, signal);
  }
  deleteMyCommands(other, signal) {
    return this.raw.deleteMyCommands({
      ...other
    }, signal);
  }
  getMyCommands(other, signal) {
    return this.raw.getMyCommands({
      ...other
    }, signal);
  }
  setMyDescription(description, other, signal) {
    return this.raw.setMyDescription({
      description,
      ...other
    }, signal);
  }
  getMyDescription(other, signal) {
    return this.raw.getMyDescription({
      ...other
    }, signal);
  }
  setMyShortDescription(short_description, other, signal) {
    return this.raw.setMyShortDescription({
      short_description,
      ...other
    }, signal);
  }
  getMyShortDescription(other, signal) {
    return this.raw.getMyShortDescription({
      ...other
    }, signal);
  }
  setMyProfilePhoto(photo, signal) {
    return this.raw.setMyProfilePhoto({
      photo
    }, signal);
  }
  removeMyProfilePhoto(signal) {
    return this.raw.removeMyProfilePhoto(signal);
  }
  setChatMenuButton(other, signal) {
    return this.raw.setChatMenuButton({
      ...other
    }, signal);
  }
  getChatMenuButton(other, signal) {
    return this.raw.getChatMenuButton({
      ...other
    }, signal);
  }
  setMyDefaultAdministratorRights(other, signal) {
    return this.raw.setMyDefaultAdministratorRights({
      ...other
    }, signal);
  }
  getMyDefaultAdministratorRights(other, signal) {
    return this.raw.getMyDefaultAdministratorRights({
      ...other
    }, signal);
  }
  getMyStarBalance(signal) {
    return this.raw.getMyStarBalance(signal);
  }
  editMessageText(chat_id, message_id, text_or_rich_message, other, signal) {
    return this.raw.editMessageText(typeof text_or_rich_message === "string" ? {
      chat_id,
      message_id,
      text: text_or_rich_message,
      ...other
    } : {
      chat_id,
      message_id,
      rich_message: text_or_rich_message,
      ...other
    }, signal);
  }
  editMessageTextInline(inline_message_id, text_or_rich_message, other, signal) {
    return this.raw.editMessageText(typeof text_or_rich_message === "string" ? {
      inline_message_id,
      text: text_or_rich_message,
      ...other
    } : {
      inline_message_id,
      rich_message: text_or_rich_message,
      ...other
    }, signal);
  }
  editMessageCaption(chat_id, message_id, other, signal) {
    return this.raw.editMessageCaption({
      chat_id,
      message_id,
      ...other
    }, signal);
  }
  editMessageCaptionInline(inline_message_id, other, signal) {
    return this.raw.editMessageCaption({
      inline_message_id,
      ...other
    }, signal);
  }
  editMessageMedia(chat_id, message_id, media, other, signal) {
    return this.raw.editMessageMedia({
      chat_id,
      message_id,
      media,
      ...other
    }, signal);
  }
  editMessageMediaInline(inline_message_id, media, other, signal) {
    return this.raw.editMessageMedia({
      inline_message_id,
      media,
      ...other
    }, signal);
  }
  editMessageReplyMarkup(chat_id, message_id, other, signal) {
    return this.raw.editMessageReplyMarkup({
      chat_id,
      message_id,
      ...other
    }, signal);
  }
  editMessageReplyMarkupInline(inline_message_id, other, signal) {
    return this.raw.editMessageReplyMarkup({
      inline_message_id,
      ...other
    }, signal);
  }
  stopPoll(chat_id, message_id, other, signal) {
    return this.raw.stopPoll({
      chat_id,
      message_id,
      ...other
    }, signal);
  }
  deleteMessage(chat_id, message_id, signal) {
    return this.raw.deleteMessage({
      chat_id,
      message_id
    }, signal);
  }
  deleteMessages(chat_id, message_ids, signal) {
    return this.raw.deleteMessages({
      chat_id,
      message_ids
    }, signal);
  }
  deleteMessageReactionUser(chat_id, message_id, user_id, other, signal) {
    return this.raw.deleteMessageReaction({
      chat_id,
      message_id,
      user_id,
      ...other
    }, signal);
  }
  deleteMessageReactionChat(chat_id, message_id, actor_chat_id, other, signal) {
    return this.raw.deleteMessageReaction({
      chat_id,
      message_id,
      actor_chat_id,
      ...other
    }, signal);
  }
  deleteAllMessageReactionsUser(chat_id, user_id, other, signal) {
    return this.raw.deleteAllMessageReactions({
      chat_id,
      user_id,
      ...other
    }, signal);
  }
  deleteAllMessageReactionsChat(chat_id, actor_chat_id, other, signal) {
    return this.raw.deleteAllMessageReactions({
      chat_id,
      actor_chat_id,
      ...other
    }, signal);
  }
  deleteBusinessMessages(business_connection_id, message_ids, signal) {
    return this.raw.deleteBusinessMessages({
      business_connection_id,
      message_ids
    }, signal);
  }
  setBusinessAccountName(business_connection_id, first_name, other, signal) {
    return this.raw.setBusinessAccountName({
      business_connection_id,
      first_name,
      ...other
    }, signal);
  }
  setBusinessAccountUsername(business_connection_id, username, signal) {
    return this.raw.setBusinessAccountUsername({
      business_connection_id,
      username
    }, signal);
  }
  setBusinessAccountBio(business_connection_id, bio, signal) {
    return this.raw.setBusinessAccountBio({
      business_connection_id,
      bio
    }, signal);
  }
  setBusinessAccountProfilePhoto(business_connection_id, photo, other, signal) {
    return this.raw.setBusinessAccountProfilePhoto({
      business_connection_id,
      photo,
      ...other
    }, signal);
  }
  removeBusinessAccountProfilePhoto(business_connection_id, other, signal) {
    return this.raw.removeBusinessAccountProfilePhoto({
      business_connection_id,
      ...other
    }, signal);
  }
  setBusinessAccountGiftSettings(business_connection_id, show_gift_button, accepted_gift_types, signal) {
    return this.raw.setBusinessAccountGiftSettings({
      business_connection_id,
      show_gift_button,
      accepted_gift_types
    }, signal);
  }
  getBusinessAccountStarBalance(business_connection_id, signal) {
    return this.raw.getBusinessAccountStarBalance({
      business_connection_id
    }, signal);
  }
  transferBusinessAccountStars(business_connection_id, star_count, signal) {
    return this.raw.transferBusinessAccountStars({
      business_connection_id,
      star_count
    }, signal);
  }
  getBusinessAccountGifts(business_connection_id, other, signal) {
    return this.raw.getBusinessAccountGifts({
      business_connection_id,
      ...other
    }, signal);
  }
  convertGiftToStars(business_connection_id, owned_gift_id, signal) {
    return this.raw.convertGiftToStars({
      business_connection_id,
      owned_gift_id
    }, signal);
  }
  upgradeGift(business_connection_id, owned_gift_id, other, signal) {
    return this.raw.upgradeGift({
      business_connection_id,
      owned_gift_id,
      ...other
    }, signal);
  }
  transferGift(business_connection_id, owned_gift_id, new_owner_chat_id, star_count, signal) {
    return this.raw.transferGift({
      business_connection_id,
      owned_gift_id,
      new_owner_chat_id,
      star_count
    }, signal);
  }
  postStory(business_connection_id, content, active_period, other, signal) {
    return this.raw.postStory({
      business_connection_id,
      content,
      active_period,
      ...other
    }, signal);
  }
  repostStory(business_connection_id, from_chat_id, from_story_id, active_period, other, signal) {
    return this.raw.repostStory({
      business_connection_id,
      from_chat_id,
      from_story_id,
      active_period,
      ...other
    }, signal);
  }
  editStory(business_connection_id, story_id, content, other, signal) {
    return this.raw.editStory({
      business_connection_id,
      story_id,
      content,
      ...other
    }, signal);
  }
  deleteStory(business_connection_id, story_id, signal) {
    return this.raw.deleteStory({
      business_connection_id,
      story_id
    }, signal);
  }
  sendSticker(chat_id, sticker, other, signal) {
    return this.raw.sendSticker({
      chat_id,
      sticker,
      ...other
    }, signal);
  }
  getStickerSet(name, signal) {
    return this.raw.getStickerSet({
      name
    }, signal);
  }
  getCustomEmojiStickers(custom_emoji_ids, signal) {
    return this.raw.getCustomEmojiStickers({
      custom_emoji_ids
    }, signal);
  }
  uploadStickerFile(user_id, sticker_format, sticker, signal) {
    return this.raw.uploadStickerFile({
      user_id,
      sticker_format,
      sticker
    }, signal);
  }
  createNewStickerSet(user_id, name, title2, stickers, other, signal) {
    return this.raw.createNewStickerSet({
      user_id,
      name,
      title: title2,
      stickers,
      ...other
    }, signal);
  }
  addStickerToSet(user_id, name, sticker, signal) {
    return this.raw.addStickerToSet({
      user_id,
      name,
      sticker
    }, signal);
  }
  setStickerPositionInSet(sticker, position, signal) {
    return this.raw.setStickerPositionInSet({
      sticker,
      position
    }, signal);
  }
  deleteStickerFromSet(sticker, signal) {
    return this.raw.deleteStickerFromSet({
      sticker
    }, signal);
  }
  replaceStickerInSet(user_id, name, old_sticker, sticker, signal) {
    return this.raw.replaceStickerInSet({
      user_id,
      name,
      old_sticker,
      sticker
    }, signal);
  }
  setStickerEmojiList(sticker, emoji_list, signal) {
    return this.raw.setStickerEmojiList({
      sticker,
      emoji_list
    }, signal);
  }
  setStickerKeywords(sticker, keywords, signal) {
    return this.raw.setStickerKeywords({
      sticker,
      keywords
    }, signal);
  }
  setStickerMaskPosition(sticker, mask_position, signal) {
    return this.raw.setStickerMaskPosition({
      sticker,
      mask_position
    }, signal);
  }
  setStickerSetTitle(name, title2, signal) {
    return this.raw.setStickerSetTitle({
      name,
      title: title2
    }, signal);
  }
  deleteStickerSet(name, signal) {
    return this.raw.deleteStickerSet({
      name
    }, signal);
  }
  setStickerSetThumbnail(name, user_id, thumbnail, format, signal) {
    return this.raw.setStickerSetThumbnail({
      name,
      user_id,
      thumbnail,
      format
    }, signal);
  }
  setCustomEmojiStickerSetThumbnail(name, custom_emoji_id, signal) {
    return this.raw.setCustomEmojiStickerSetThumbnail({
      name,
      custom_emoji_id
    }, signal);
  }
  getAvailableGifts(signal) {
    return this.raw.getAvailableGifts(signal);
  }
  sendGift(user_id, gift_id, other, signal) {
    return this.raw.sendGift({
      user_id,
      gift_id,
      ...other
    }, signal);
  }
  giftPremiumSubscription(user_id, month_count, star_count, other, signal) {
    return this.raw.giftPremiumSubscription({
      user_id,
      month_count,
      star_count,
      ...other
    }, signal);
  }
  sendGiftToChannel(chat_id, gift_id, other, signal) {
    return this.raw.sendGift({
      chat_id,
      gift_id,
      ...other
    }, signal);
  }
  answerInlineQuery(inline_query_id, results, other, signal) {
    return this.raw.answerInlineQuery({
      inline_query_id,
      results,
      ...other
    }, signal);
  }
  answerWebAppQuery(web_app_query_id, result, signal) {
    return this.raw.answerWebAppQuery({
      web_app_query_id,
      result
    }, signal);
  }
  savePreparedInlineMessage(user_id, result, other, signal) {
    return this.raw.savePreparedInlineMessage({
      user_id,
      result,
      ...other
    }, signal);
  }
  savePreparedKeyboardButton(user_id, button, signal) {
    return this.raw.savePreparedKeyboardButton({
      user_id,
      button
    }, signal);
  }
  sendInvoice(chat_id, title2, description, payload, currency, prices, other, signal) {
    return this.raw.sendInvoice({
      chat_id,
      title: title2,
      description,
      payload,
      currency,
      prices,
      ...other
    }, signal);
  }
  createInvoiceLink(title2, description, payload, provider_token, currency, prices, other, signal) {
    return this.raw.createInvoiceLink({
      title: title2,
      description,
      payload,
      provider_token,
      currency,
      prices,
      ...other
    }, signal);
  }
  answerShippingQuery(shipping_query_id, ok2, other, signal) {
    return this.raw.answerShippingQuery({
      shipping_query_id,
      ok: ok2,
      ...other
    }, signal);
  }
  answerPreCheckoutQuery(pre_checkout_query_id, ok2, other, signal) {
    return this.raw.answerPreCheckoutQuery({
      pre_checkout_query_id,
      ok: ok2,
      ...other
    }, signal);
  }
  getStarTransactions(other, signal) {
    return this.raw.getStarTransactions({
      ...other
    }, signal);
  }
  refundStarPayment(user_id, telegram_payment_charge_id, signal) {
    return this.raw.refundStarPayment({
      user_id,
      telegram_payment_charge_id
    }, signal);
  }
  editUserStarSubscription(user_id, telegram_payment_charge_id, is_canceled, signal) {
    return this.raw.editUserStarSubscription({
      user_id,
      telegram_payment_charge_id,
      is_canceled
    }, signal);
  }
  verifyUser(user_id, other, signal) {
    return this.raw.verifyUser({
      user_id,
      ...other
    }, signal);
  }
  verifyChat(chat_id, other, signal) {
    return this.raw.verifyChat({
      chat_id,
      ...other
    }, signal);
  }
  removeUserVerification(user_id, signal) {
    return this.raw.removeUserVerification({
      user_id
    }, signal);
  }
  removeChatVerification(chat_id, signal) {
    return this.raw.removeChatVerification({
      chat_id
    }, signal);
  }
  readBusinessMessage(business_connection_id, chat_id, message_id, signal) {
    return this.raw.readBusinessMessage({
      business_connection_id,
      chat_id,
      message_id
    }, signal);
  }
  setPassportDataErrors(user_id, errors, signal) {
    return this.raw.setPassportDataErrors({
      user_id,
      errors
    }, signal);
  }
  sendGame(chat_id, game_short_name, other, signal) {
    return this.raw.sendGame({
      chat_id,
      game_short_name,
      ...other
    }, signal);
  }
  setGameScore(chat_id, message_id, user_id, score, other, signal) {
    return this.raw.setGameScore({
      chat_id,
      message_id,
      user_id,
      score,
      ...other
    }, signal);
  }
  setGameScoreInline(inline_message_id, user_id, score, other, signal) {
    return this.raw.setGameScore({
      inline_message_id,
      user_id,
      score,
      ...other
    }, signal);
  }
  getGameHighScores(chat_id, message_id, user_id, signal) {
    return this.raw.getGameHighScores({
      chat_id,
      message_id,
      user_id
    }, signal);
  }
  getGameHighScoresInline(inline_message_id, user_id, signal) {
    return this.raw.getGameHighScores({
      inline_message_id,
      user_id
    }, signal);
  }
};
var debug2 = browser$1("grammy:bot");
var debugWarn = browser$1("grammy:warn");
var debugErr = browser$1("grammy:error");
var DEFAULT_UPDATE_TYPES = [
  "message",
  "edited_message",
  "channel_post",
  "edited_channel_post",
  "business_connection",
  "business_message",
  "edited_business_message",
  "deleted_business_messages",
  "guest_message",
  "inline_query",
  "chosen_inline_result",
  "callback_query",
  "shipping_query",
  "pre_checkout_query",
  "purchased_paid_media",
  "poll",
  "poll_answer",
  "my_chat_member",
  "managed_bot",
  "chat_join_request",
  "chat_boost",
  "removed_chat_boost"
];
var Bot = class extends Composer {
  static {
    __name(this, "Bot");
  }
  token;
  pollingRunning;
  pollingAbortController;
  lastTriedUpdateId;
  api;
  me;
  mePromise;
  clientConfig;
  ContextConstructor;
  observedUpdateTypes;
  errorHandler;
  constructor(token, config2) {
    super();
    this.token = token;
    this.pollingRunning = false;
    this.lastTriedUpdateId = 0;
    this.observedUpdateTypes = /* @__PURE__ */ new Set();
    this.errorHandler = async (err) => {
      console.error("Error in middleware while handling update", err.ctx?.update?.update_id, err.error);
      console.error("No error handler was set!");
      console.error("Set your own error handler with `bot.catch = ...`");
      if (this.pollingRunning) {
        console.error("Stopping bot");
        await this.stop();
      }
      throw err;
    };
    if (!token) throw new Error("Empty token!");
    this.me = config2?.botInfo;
    this.clientConfig = config2?.client;
    this.ContextConstructor = config2?.ContextConstructor ?? Context2;
    this.api = new Api(token, this.clientConfig);
  }
  set botInfo(botInfo) {
    this.me = botInfo;
  }
  get botInfo() {
    if (this.me === void 0) {
      throw new Error("Bot information unavailable! Make sure to call `await bot.init()` before accessing `bot.botInfo`!");
    }
    return this.me;
  }
  on(filter, ...middleware) {
    for (const [u] of parse(filter).flatMap(preprocess)) {
      this.observedUpdateTypes.add(u);
    }
    return super.on(filter, ...middleware);
  }
  reaction(reaction, ...middleware) {
    this.observedUpdateTypes.add("message_reaction");
    return super.reaction(reaction, ...middleware);
  }
  isInited() {
    return this.me !== void 0;
  }
  async init(signal) {
    if (!this.isInited()) {
      debug2("Initializing bot");
      this.mePromise ??= withRetries(() => this.api.getMe(signal), signal);
      let me;
      try {
        me = await this.mePromise;
      } finally {
        this.mePromise = void 0;
      }
      if (this.me === void 0) this.me = me;
      else debug2("Bot info was set by now, will not overwrite");
    }
    debug2(`I am ${this.me.username}!`);
  }
  async handleUpdates(updates) {
    for (const update of updates) {
      this.lastTriedUpdateId = update.update_id;
      try {
        await this.handleUpdate(update);
      } catch (err) {
        if (err instanceof BotError) {
          await this.errorHandler(err);
        } else {
          console.error("FATAL: grammY unable to handle:", err);
          throw err;
        }
      }
    }
  }
  async handleUpdate(update, webhookReplyEnvelope) {
    if (this.me === void 0) {
      throw new Error("Bot not initialized! Either call `await bot.init()`, or directly set the `botInfo` option in the `Bot` constructor to specify a known bot info object.");
    }
    debug2(`Processing update ${update.update_id}`);
    const api2 = new Api(this.token, this.clientConfig, webhookReplyEnvelope);
    const t = this.api.config.installedTransformers();
    if (t.length > 0) api2.config.use(...t);
    const ctx = new this.ContextConstructor(update, api2, this.me);
    try {
      await run(this.middleware(), ctx);
    } catch (err) {
      debugErr(`Error in middleware for update ${update.update_id}`);
      throw new BotError(err, ctx);
    }
  }
  async start(options) {
    const setup2 = [];
    if (!this.isInited()) {
      setup2.push(this.init(this.pollingAbortController?.signal));
    }
    if (this.pollingRunning) {
      await Promise.all(setup2);
      debug2("Simple long polling already running!");
      return;
    }
    this.pollingRunning = true;
    this.pollingAbortController = new AbortController();
    try {
      setup2.push(withRetries(async () => {
        await this.api.deleteWebhook({
          drop_pending_updates: options?.drop_pending_updates
        }, this.pollingAbortController?.signal);
      }, this.pollingAbortController?.signal));
      await Promise.all(setup2);
      await options?.onStart?.(this.botInfo);
    } catch (err) {
      this.pollingRunning = false;
      this.pollingAbortController = void 0;
      throw err;
    }
    if (!this.pollingRunning) return;
    validateAllowedUpdates(this.observedUpdateTypes, options?.allowed_updates);
    this.use = noUseFunction;
    debug2("Starting simple long polling");
    await this.loop(options);
    debug2("Middleware is done running");
  }
  async stop() {
    if (this.pollingRunning) {
      debug2("Stopping bot, saving update offset");
      this.pollingRunning = false;
      this.pollingAbortController?.abort();
      const offset = this.lastTriedUpdateId + 1;
      await this.api.getUpdates({
        offset,
        limit: 1
      }).finally(() => this.pollingAbortController = void 0);
    } else {
      debug2("Bot is not running!");
    }
  }
  isRunning() {
    return this.pollingRunning;
  }
  catch(errorHandler2) {
    this.errorHandler = errorHandler2;
  }
  async loop(options) {
    const limit = options?.limit;
    const timeout = options?.timeout ?? 30;
    let allowed_updates = options?.allowed_updates ?? [];
    try {
      while (this.pollingRunning) {
        const updates = await this.fetchUpdates({
          limit,
          timeout,
          allowed_updates
        });
        if (updates === void 0) break;
        await this.handleUpdates(updates);
        allowed_updates = void 0;
      }
    } finally {
      this.pollingRunning = false;
    }
  }
  async fetchUpdates({ limit, timeout, allowed_updates }) {
    const offset = this.lastTriedUpdateId + 1;
    let updates = void 0;
    do {
      try {
        updates = await this.api.getUpdates({
          offset,
          limit,
          timeout,
          allowed_updates
        }, this.pollingAbortController?.signal);
      } catch (error) {
        await this.handlePollingError(error);
      }
    } while (updates === void 0 && this.pollingRunning);
    return updates;
  }
  async handlePollingError(error) {
    if (!this.pollingRunning) {
      debug2("Pending getUpdates request cancelled");
      return;
    }
    let sleepSeconds = 3;
    if (error instanceof GrammyError) {
      debugErr(error.message);
      if (error.error_code === 401 || error.error_code === 409) {
        throw error;
      } else if (error.error_code === 429) {
        debugErr("Bot API server is closing.");
        sleepSeconds = error.parameters.retry_after ?? sleepSeconds;
      }
    } else debugErr(error);
    debugErr(`Call to getUpdates failed, retrying in ${sleepSeconds} seconds ...`);
    await sleep(sleepSeconds);
  }
};
async function withRetries(task, signal) {
  const INITIAL_DELAY = 50;
  let lastDelay = 50;
  async function handleError(error) {
    let delay = false;
    let strategy = "rethrow";
    if (error instanceof HttpError) {
      delay = true;
      strategy = "retry";
    } else if (error instanceof GrammyError) {
      if (error.error_code >= 500) {
        delay = true;
        strategy = "retry";
      } else if (error.error_code === 429) {
        const retryAfter = error.parameters.retry_after;
        if (typeof retryAfter === "number") {
          await sleep(retryAfter, signal);
          lastDelay = INITIAL_DELAY;
        } else {
          delay = true;
        }
        strategy = "retry";
      }
    }
    if (delay) {
      if (lastDelay !== 50) {
        await sleep(lastDelay, signal);
      }
      const TWENTY_MINUTES = 20 * 60 * 1e3;
      lastDelay = Math.min(TWENTY_MINUTES, 2 * lastDelay);
    }
    return strategy;
  }
  __name(handleError, "handleError");
  let result = {
    ok: false
  };
  while (!result.ok) {
    try {
      result = {
        ok: true,
        value: await task()
      };
    } catch (error) {
      debugErr(error);
      const strategy = await handleError(error);
      switch (strategy) {
        case "retry":
          continue;
        case "rethrow":
          throw error;
      }
    }
  }
  return result.value;
}
__name(withRetries, "withRetries");
async function sleep(seconds, signal) {
  let handle;
  let reject;
  function abort() {
    reject?.(new Error("Aborted delay"));
    if (handle !== void 0) clearTimeout(handle);
  }
  __name(abort, "abort");
  try {
    await new Promise((res, rej) => {
      reject = rej;
      if (signal?.aborted) {
        abort();
        return;
      }
      signal?.addEventListener("abort", abort);
      handle = setTimeout(res, 1e3 * seconds);
    });
  } finally {
    signal?.removeEventListener("abort", abort);
  }
}
__name(sleep, "sleep");
function validateAllowedUpdates(updates, allowed = DEFAULT_UPDATE_TYPES) {
  const impossible = Array.from(updates).filter((u) => !allowed.includes(u));
  if (impossible.length > 0) {
    debugWarn(`You registered listeners for the following update types, but you did not specify them in \`allowed_updates\` so they may not be received: ${impossible.map((u) => `'${u}'`).join(", ")}`);
  }
}
__name(validateAllowedUpdates, "validateAllowedUpdates");
function noUseFunction() {
  throw new Error(`It looks like you are registering more listeners on your bot from within other listeners! This means that every time your bot handles a message like this one, new listeners will be added. This list grows until your machine crashes, so grammY throws this error to tell you that you should probably do things a bit differently. If you're unsure how to resolve this problem, you can ask in the group chat: https://telegram.me/grammyjs

On the other hand, if you actually know what you're doing and you do need to install further middleware while your bot is running, consider installing a composer instance on your bot, and in turn augment the composer after the fact. This way, you can circumvent this protection against memory leaks.`);
}
__name(noUseFunction, "noUseFunction");
var ALL_UPDATE_TYPES = [
  ...DEFAULT_UPDATE_TYPES,
  "chat_member",
  "message_reaction",
  "message_reaction_count"
];
var ALL_CHAT_PERMISSIONS = {
  can_send_messages: true,
  can_send_audios: true,
  can_send_documents: true,
  can_send_photos: true,
  can_send_videos: true,
  can_send_video_notes: true,
  can_send_voice_notes: true,
  can_send_polls: true,
  can_send_other_messages: true,
  can_add_web_page_previews: true,
  can_react_to_messages: true,
  can_change_info: true,
  can_invite_users: true,
  can_edit_tag: true,
  can_pin_messages: true,
  can_manage_topics: true
};
var API_CONSTANTS = {
  DEFAULT_UPDATE_TYPES,
  ALL_UPDATE_TYPES,
  ALL_CHAT_PERMISSIONS
};
Object.freeze(API_CONSTANTS);
var debug3 = browser$1("grammy:session");
var SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token";
var SECRET_HEADER_LOWERCASE = SECRET_HEADER.toLowerCase();
var WRONG_TOKEN_ERROR = "secret token is wrong";
var ok = /* @__PURE__ */ __name(() => new Response(null, {
  status: 200
}), "ok");
var okJson = /* @__PURE__ */ __name((json) => new Response(json, {
  status: 200,
  headers: {
    "Content-Type": "application/json"
  }
}), "okJson");
var unauthorized = /* @__PURE__ */ __name(() => new Response('"unauthorized"', {
  status: 401,
  statusText: WRONG_TOKEN_ERROR
}), "unauthorized");
var awsLambda = /* @__PURE__ */ __name((event, _context, callback) => ({
  get update() {
    return JSON.parse(event.body ?? "{}");
  },
  header: event.headers[SECRET_HEADER] ?? event.headers[SECRET_HEADER_LOWERCASE],
  end: /* @__PURE__ */ __name(() => callback(null, {
    statusCode: 200
  }), "end"),
  respond: /* @__PURE__ */ __name((json) => callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: json
  }), "respond"),
  unauthorized: /* @__PURE__ */ __name(() => callback(null, {
    statusCode: 401
  }), "unauthorized")
}), "awsLambda");
var awsLambdaAsync = /* @__PURE__ */ __name((event, _context) => {
  let resolveResponse;
  return {
    get update() {
      return JSON.parse(event.body ?? "{}");
    },
    header: event.headers[SECRET_HEADER] ?? event.headers[SECRET_HEADER_LOWERCASE],
    end: /* @__PURE__ */ __name(() => resolveResponse({
      statusCode: 200
    }), "end"),
    respond: /* @__PURE__ */ __name((json) => resolveResponse({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: json
    }), "respond"),
    unauthorized: /* @__PURE__ */ __name(() => resolveResponse({
      statusCode: 401
    }), "unauthorized"),
    handlerReturn: new Promise((res) => resolveResponse = res)
  };
}, "awsLambdaAsync");
var azure = /* @__PURE__ */ __name((context, request) => ({
  get update() {
    return request.body;
  },
  header: request.headers?.[SECRET_HEADER_LOWERCASE],
  end: /* @__PURE__ */ __name(() => context.res = {
    status: 200,
    body: ""
  }, "end"),
  respond: /* @__PURE__ */ __name((json) => {
    context.res?.set?.("Content-Type", "application/json");
    context.res?.send?.(json);
  }, "respond"),
  unauthorized: /* @__PURE__ */ __name(() => {
    context.res?.send?.(401, WRONG_TOKEN_ERROR);
  }, "unauthorized")
}), "azure");
var azureV4 = /* @__PURE__ */ __name((request) => {
  let resolveResponse;
  return {
    get update() {
      return request.json();
    },
    header: request.headers.get(SECRET_HEADER) || void 0,
    end: /* @__PURE__ */ __name(() => resolveResponse({
      status: 204
    }), "end"),
    respond: /* @__PURE__ */ __name((json) => resolveResponse({
      jsonBody: json
    }), "respond"),
    unauthorized: /* @__PURE__ */ __name(() => resolveResponse({
      status: 401,
      body: WRONG_TOKEN_ERROR
    }), "unauthorized"),
    handlerReturn: new Promise((resolve) => resolveResponse = resolve)
  };
}, "azureV4");
var bun = /* @__PURE__ */ __name((request) => {
  let resolveResponse;
  return {
    get update() {
      return request.json();
    },
    header: request.headers.get(SECRET_HEADER) || void 0,
    end: /* @__PURE__ */ __name(() => {
      resolveResponse(ok());
    }, "end"),
    respond: /* @__PURE__ */ __name((json) => {
      resolveResponse(okJson(json));
    }, "respond"),
    unauthorized: /* @__PURE__ */ __name(() => {
      resolveResponse(unauthorized());
    }, "unauthorized"),
    handlerReturn: new Promise((res) => resolveResponse = res)
  };
}, "bun");
var cloudflare = /* @__PURE__ */ __name((event) => {
  let resolveResponse;
  event.respondWith(new Promise((resolve) => {
    resolveResponse = resolve;
  }));
  return {
    get update() {
      return event.request.json();
    },
    header: event.request.headers.get(SECRET_HEADER) || void 0,
    end: /* @__PURE__ */ __name(() => {
      resolveResponse(ok());
    }, "end"),
    respond: /* @__PURE__ */ __name((json) => {
      resolveResponse(okJson(json));
    }, "respond"),
    unauthorized: /* @__PURE__ */ __name(() => {
      resolveResponse(unauthorized());
    }, "unauthorized")
  };
}, "cloudflare");
var cloudflareModule = /* @__PURE__ */ __name((request) => {
  let resolveResponse;
  return {
    get update() {
      return request.json();
    },
    header: request.headers.get(SECRET_HEADER) || void 0,
    end: /* @__PURE__ */ __name(() => {
      resolveResponse(ok());
    }, "end"),
    respond: /* @__PURE__ */ __name((json) => {
      resolveResponse(okJson(json));
    }, "respond"),
    unauthorized: /* @__PURE__ */ __name(() => {
      resolveResponse(unauthorized());
    }, "unauthorized"),
    handlerReturn: new Promise((res) => resolveResponse = res)
  };
}, "cloudflareModule");
var express = /* @__PURE__ */ __name((req, res) => ({
  get update() {
    return req.body;
  },
  header: req.header(SECRET_HEADER),
  end: /* @__PURE__ */ __name(() => res.end(), "end"),
  respond: /* @__PURE__ */ __name((json) => {
    res.set("Content-Type", "application/json");
    res.send(json);
  }, "respond"),
  unauthorized: /* @__PURE__ */ __name(() => {
    res.status(401).send(WRONG_TOKEN_ERROR);
  }, "unauthorized")
}), "express");
var fastify = /* @__PURE__ */ __name((request, reply) => ({
  get update() {
    return request.body;
  },
  header: request.headers[SECRET_HEADER_LOWERCASE],
  end: /* @__PURE__ */ __name(() => reply.send(""), "end"),
  respond: /* @__PURE__ */ __name((json) => reply.headers({
    "Content-Type": "application/json"
  }).send(json), "respond"),
  unauthorized: /* @__PURE__ */ __name(() => reply.code(401).send(WRONG_TOKEN_ERROR), "unauthorized")
}), "fastify");
var hono = /* @__PURE__ */ __name((c) => {
  let resolveResponse;
  return {
    get update() {
      return c.req.json();
    },
    header: c.req.header(SECRET_HEADER),
    end: /* @__PURE__ */ __name(() => {
      resolveResponse(c.body(""));
    }, "end"),
    respond: /* @__PURE__ */ __name((json) => {
      resolveResponse(c.json(json));
    }, "respond"),
    unauthorized: /* @__PURE__ */ __name(() => {
      c.status(401);
      resolveResponse(c.body(""));
    }, "unauthorized"),
    handlerReturn: new Promise((res) => resolveResponse = res)
  };
}, "hono");
var http = /* @__PURE__ */ __name((req, res) => {
  const secretHeaderFromRequest = req.headers[SECRET_HEADER_LOWERCASE];
  return {
    get update() {
      return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk)).once("end", () => {
          const raw2 = Buffer.concat(chunks).toString("utf-8");
          try {
            resolve(JSON.parse(raw2));
          } catch (err) {
            reject(err);
          }
        }).once("error", reject);
      });
    },
    header: Array.isArray(secretHeaderFromRequest) ? secretHeaderFromRequest[0] : secretHeaderFromRequest,
    end: /* @__PURE__ */ __name(() => res.end(), "end"),
    respond: /* @__PURE__ */ __name((json) => res.writeHead(200, {
      "Content-Type": "application/json"
    }).end(json), "respond"),
    unauthorized: /* @__PURE__ */ __name(() => res.writeHead(401).end(WRONG_TOKEN_ERROR), "unauthorized")
  };
}, "http");
var koa = /* @__PURE__ */ __name((ctx) => ({
  get update() {
    return ctx.request.body;
  },
  header: ctx.get(SECRET_HEADER) || void 0,
  end: /* @__PURE__ */ __name(() => {
    ctx.body = "";
  }, "end"),
  respond: /* @__PURE__ */ __name((json) => {
    ctx.set("Content-Type", "application/json");
    ctx.response.body = json;
  }, "respond"),
  unauthorized: /* @__PURE__ */ __name(() => {
    ctx.status = 401;
  }, "unauthorized")
}), "koa");
var nextJs = /* @__PURE__ */ __name((request, response) => ({
  get update() {
    return request.body;
  },
  header: request.headers[SECRET_HEADER_LOWERCASE],
  end: /* @__PURE__ */ __name(() => response.end(), "end"),
  respond: /* @__PURE__ */ __name((json) => response.status(200).json(json), "respond"),
  unauthorized: /* @__PURE__ */ __name(() => response.status(401).send(WRONG_TOKEN_ERROR), "unauthorized")
}), "nextJs");
var nhttp = /* @__PURE__ */ __name((rev) => ({
  get update() {
    return rev.body;
  },
  header: rev.headers.get(SECRET_HEADER) || void 0,
  end: /* @__PURE__ */ __name(() => rev.response.sendStatus(200), "end"),
  respond: /* @__PURE__ */ __name((json) => rev.response.status(200).send(json), "respond"),
  unauthorized: /* @__PURE__ */ __name(() => rev.response.status(401).send(WRONG_TOKEN_ERROR), "unauthorized")
}), "nhttp");
var oak = /* @__PURE__ */ __name((ctx) => ({
  get update() {
    return ctx.request.body.json();
  },
  header: ctx.request.headers.get(SECRET_HEADER) || void 0,
  end: /* @__PURE__ */ __name(() => {
    ctx.response.status = 200;
  }, "end"),
  respond: /* @__PURE__ */ __name((json) => {
    ctx.response.type = "json";
    ctx.response.body = json;
  }, "respond"),
  unauthorized: /* @__PURE__ */ __name(() => {
    ctx.response.status = 401;
  }, "unauthorized")
}), "oak");
var serveHttp = /* @__PURE__ */ __name((requestEvent) => ({
  get update() {
    return requestEvent.request.json();
  },
  header: requestEvent.request.headers.get(SECRET_HEADER) || void 0,
  end: /* @__PURE__ */ __name(() => requestEvent.respondWith(ok()), "end"),
  respond: /* @__PURE__ */ __name((json) => requestEvent.respondWith(okJson(json)), "respond"),
  unauthorized: /* @__PURE__ */ __name(() => requestEvent.respondWith(unauthorized()), "unauthorized")
}), "serveHttp");
var stdHttp = /* @__PURE__ */ __name((req) => {
  let resolveResponse;
  return {
    get update() {
      return req.json();
    },
    header: req.headers.get(SECRET_HEADER) || void 0,
    end: /* @__PURE__ */ __name(() => {
      if (resolveResponse) resolveResponse(ok());
    }, "end"),
    respond: /* @__PURE__ */ __name((json) => {
      if (resolveResponse) resolveResponse(okJson(json));
    }, "respond"),
    unauthorized: /* @__PURE__ */ __name(() => {
      if (resolveResponse) resolveResponse(unauthorized());
    }, "unauthorized"),
    handlerReturn: new Promise((res) => resolveResponse = res)
  };
}, "stdHttp");
var sveltekit = /* @__PURE__ */ __name(({ request }) => {
  let resolveResponse;
  return {
    get update() {
      return request.json();
    },
    header: request.headers.get(SECRET_HEADER) || void 0,
    end: /* @__PURE__ */ __name(() => {
      if (resolveResponse) resolveResponse(ok());
    }, "end"),
    respond: /* @__PURE__ */ __name((json) => {
      if (resolveResponse) resolveResponse(okJson(json));
    }, "respond"),
    unauthorized: /* @__PURE__ */ __name(() => {
      if (resolveResponse) resolveResponse(unauthorized());
    }, "unauthorized"),
    handlerReturn: new Promise((res) => resolveResponse = res)
  };
}, "sveltekit");
var worktop = /* @__PURE__ */ __name((req, res) => ({
  get update() {
    return req.json();
  },
  header: req.headers.get(SECRET_HEADER) ?? void 0,
  end: /* @__PURE__ */ __name(() => res.end(null), "end"),
  respond: /* @__PURE__ */ __name((json) => res.send(200, json), "respond"),
  unauthorized: /* @__PURE__ */ __name(() => res.send(401, WRONG_TOKEN_ERROR), "unauthorized")
}), "worktop");
var elysia = /* @__PURE__ */ __name((ctx) => {
  let resolveResponse;
  return {
    get update() {
      return ctx.body;
    },
    header: ctx.headers[SECRET_HEADER_LOWERCASE],
    end() {
      resolveResponse("");
    },
    respond(json) {
      ctx.set.headers["content-type"] = "application/json";
      resolveResponse(json);
    },
    unauthorized() {
      ctx.set.status = 401;
      resolveResponse("");
    },
    handlerReturn: new Promise((res) => resolveResponse = res)
  };
}, "elysia");
var adapters = {
  "aws-lambda": awsLambda,
  "aws-lambda-async": awsLambdaAsync,
  azure,
  "azure-v4": azureV4,
  bun,
  cloudflare,
  "cloudflare-mod": cloudflareModule,
  elysia,
  express,
  fastify,
  hono,
  http,
  https: http,
  koa,
  "next-js": nextJs,
  nhttp,
  oak,
  serveHttp,
  "std/http": stdHttp,
  sveltekit,
  worktop
};
var debugErr1 = browser$1("grammy:error");
var callbackAdapter = /* @__PURE__ */ __name((update, callback, header, unauthorized2 = () => callback('"unauthorized"')) => ({
  update: Promise.resolve(update),
  respond: callback,
  header,
  unauthorized: unauthorized2
}), "callbackAdapter");
var adapters1 = {
  ...adapters,
  callback: callbackAdapter
};

// src/core/db.ts
async function saveUser(db, profile) {
  const { telegram_id, username, first_name, last_name, language_code, is_premium, start_param } = profile;
  await db.prepare(`
    INSERT INTO users (telegram_id, username, first_name, last_name, language_code, is_premium, start_param) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(telegram_id) DO UPDATE SET 
      username = excluded.username,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      language_code = excluded.language_code,
      is_premium = excluded.is_premium
  `).bind(
    telegram_id,
    username || null,
    first_name || null,
    last_name || null,
    language_code || null,
    is_premium ? 1 : 0,
    start_param || null
  ).run();
}
__name(saveUser, "saveUser");
async function updateUserPhone(db, telegram_id, phone_number) {
  await db.prepare(`UPDATE profiles SET phone_number = ? WHERE user_id = ?`).bind(phone_number, telegram_id).run();
}
__name(updateUserPhone, "updateUserPhone");
async function logUsage(db, user_id, action, metadata = {}) {
  await db.prepare(`INSERT INTO user_usage_logs (user_id, action, metadata) VALUES (?, ?, ?)`).bind(user_id, action, JSON.stringify(metadata)).run();
}
__name(logUsage, "logUsage");

// src/bot/admin.ts
function setupAdmin(bot2) {
}
__name(setupAdmin, "setupAdmin");

// src/bot.ts
var bot;
function initBot(env) {
  if (bot) return bot;
  bot = new Bot(env.BOT_TOKEN, {
    botInfo: {
      id: 8818123904,
      is_bot: true,
      first_name: "Garavoli-bot",
      username: "Garavoli_bot",
      can_join_groups: true,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
      supports_guest_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
      has_topics_enabled: false,
      allows_users_to_create_topics: false,
      can_manage_bots: false,
      supports_join_request_queries: false
    }
  });
  bot.use(async (ctx, next) => {
    ctx.env = env;
    await next();
  });
  setupAdmin(bot);
  async function getBotMessage(db, key, lang, defaultText) {
    try {
      const res = await db.prepare("SELECT message_value FROM translations WHERE message_key = ? AND lang_code = ?").bind(key, lang).first();
      if (res && res.message_value) return res.message_value;
      const fallback = await db.prepare("SELECT message_value FROM translations WHERE message_key = ? AND lang_code = 'en'").bind(key).first();
      if (fallback && fallback.message_value) return fallback.message_value;
    } catch (e) {
    }
    return defaultText;
  }
  __name(getBotMessage, "getBotMessage");
  bot.command("start", async (ctx) => {
    const profile = {
      telegram_id: ctx.from?.id,
      username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
      language_code: ctx.from?.language_code || "en",
      is_premium: ctx.from?.is_premium,
      start_param: ctx.match
    };
    await saveUser(ctx.env.DB, profile);
    await logUsage(ctx.env.DB, profile.telegram_id, "START_BOT", { start_param: profile.start_param });
    const webAppUrl = "https://tlg-bot.m-pazouki-dev.workers.dev/";
    const existingProfile = await ctx.env.DB.prepare(`
      SELECT p.phone_number, l.code as lang_code 
      FROM profiles p 
      LEFT JOIN languages l ON p.language_id = l.id 
      WHERE p.user_id = ?
    `).bind(profile.telegram_id).first();
    const hasPhoneNumber = !!(existingProfile && existingProfile.phone_number);
    const lang = existingProfile?.lang_code || "fa";
    if (!hasPhoneNumber) {
      const msg = await getBotMessage(ctx.env.DB, "bot_request_contact", lang, "Please share your phone number to continue.");
      const btn = await getBotMessage(ctx.env.DB, "bot_btn_share_contact", lang, "\u{1F4DE} Share Phone Number");
      await ctx.reply(msg, {
        reply_markup: {
          keyboard: [
            [{ text: btn, request_contact: true }]
          ],
          resize_keyboard: true,
          is_persistent: true
        }
      });
    } else {
      const msg = await getBotMessage(ctx.env.DB, "bot_welcome", lang, "Welcome! Click below to open the app.");
      const btn = await getBotMessage(ctx.env.DB, "bot_btn_open_app", lang, "\u{1F4F1} Open App");
      await ctx.reply(msg, {
        reply_markup: {
          inline_keyboard: [
            [{ text: btn, web_app: { url: webAppUrl } }]
          ]
        }
      });
    }
  });
  bot.on("message:contact", async (ctx) => {
    const contact = ctx.message.contact;
    const tgId = ctx.from?.id;
    const lang = ctx.from?.language_code || "en";
    if (contact && tgId) {
      if (contact.user_id === tgId) {
        await updateUserPhone(ctx.env.DB, tgId, contact.phone_number);
        await logUsage(ctx.env.DB, tgId, "SHARE_CONTACT", { phone_number: contact.phone_number });
        try {
          await ctx.deleteMessage();
        } catch (e) {
        }
        const msg = await getBotMessage(ctx.env.DB, "bot_contact_success", lang, "Thank you! Open the app below.");
        const btn = await getBotMessage(ctx.env.DB, "bot_btn_open_app", lang, "\u{1F4F1} Open App");
        const webAppUrl = "https://tlg-bot.m-pazouki-dev.workers.dev/";
        await ctx.reply(msg, {
          reply_markup: {
            inline_keyboard: [
              [{ text: btn, web_app: { url: webAppUrl } }]
            ]
          }
        });
      } else {
        const msg = await getBotMessage(ctx.env.DB, "bot_contact_invalid", lang, "Please share your own contact number.");
        await ctx.reply(msg);
      }
    }
  });
  bot.on("message:text", async (ctx) => {
    if (ctx.from) {
      await logUsage(ctx.env.DB, ctx.from.id, "SEND_TEXT_MESSAGE", { text: ctx.message.text });
      const lang = ctx.from.language_code || "en";
      const msg = await getBotMessage(ctx.env.DB, "bot_fallback", lang, "Please use the Mini App.");
      const btn = await getBotMessage(ctx.env.DB, "bot_btn_open_app", lang, "\u{1F4F1} Open App");
      const webAppUrl = "https://tlg-bot.m-pazouki-dev.workers.dev/";
      await ctx.reply(msg, {
        reply_markup: {
          inline_keyboard: [
            [{ text: btn, web_app: { url: webAppUrl } }]
          ]
        }
      });
    }
  });
  return bot;
}
__name(initBot, "initBot");

// src/api/index.ts
var api = new Hono2();
function isValidIranianNationalCode(code) {
  if (!/^\d{10}$/.test(code)) return false;
  const check2 = parseInt(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(code[i]) * (10 - i);
  const rem = sum % 11;
  return rem < 2 && check2 === rem || rem >= 2 && check2 === 11 - rem;
}
__name(isValidIranianNationalCode, "isValidIranianNationalCode");
api.use("*", async (c, next) => {
  const path = new URL(c.req.url).pathname;
  if (path === "/api/translations" || path === "/api/catalog" || path.startsWith("/api/receipt-image")) {
    return next();
  }
  const initData = c.req.header("x-telegram-init-data");
  if (!initData) {
    return c.json({ error: "Unauthorized. Missing initData." }, 401);
  }
  try {
    const params = new URLSearchParams(initData);
    const userJson = params.get("user");
    if (userJson) {
      const user = JSON.parse(decodeURIComponent(userJson));
      c.set("user", user);
    }
  } catch (e) {
    console.error("Failed to parse initData", e);
  }
  await next();
});
var supportAdminMiddleware = /* @__PURE__ */ __name(async (c, next) => {
  const user = c.get("user");
  if (!user || !user.id) return c.json({ error: "Unauthorized" }, 401);
  const { DB } = c.env;
  const dbUser = await DB.prepare(`
    SELECT r.name as role 
    FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.user_id = ?
  `).bind(user.id).first();
  if (!dbUser || dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "ADMIN" && dbUser.role !== "SUPPORT_ADMIN") {
    return c.json({ error: "Forbidden. Support Admins only." }, 403);
  }
  await next();
}, "supportAdminMiddleware");
var adminMiddleware = /* @__PURE__ */ __name(async (c, next) => {
  const user = c.get("user");
  if (!user || !user.id) return c.json({ error: "Unauthorized" }, 401);
  const { DB } = c.env;
  const dbUser = await DB.prepare(`
    SELECT r.name as role 
    FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.user_id = ?
  `).bind(user.id).first();
  if (!dbUser || dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "ADMIN") {
    return c.json({ error: "Forbidden. Admins only." }, 403);
  }
  await next();
}, "adminMiddleware");
api.get("/user", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const dbUser = await c.env.DB.prepare(`
    SELECT 
      u.*, 
      p.phone_number,
      p.wallet_status,
      p.wallet_balance,
      r.name as role,
      t.name as theme_preference,
      l.code as language_preference
    FROM users u
    LEFT JOIN profiles p ON u.telegram_id = p.user_id
    LEFT JOIN roles r ON p.role_id = r.id
    LEFT JOIN themes t ON p.theme_id = t.id
    LEFT JOIN languages l ON p.language_id = l.id
    WHERE u.telegram_id = ?
  `).bind(user.id).first();
  if (dbUser) {
    dbUser.wallet_status = dbUser.wallet_status || "UNVERIFIED";
    dbUser.wallet_balance = dbUser.wallet_balance || 0;
  }
  return c.json({ user: dbUser || user });
});
api.post("/user/preferences", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { language, theme } = await c.req.json();
  await c.env.DB.prepare(`
    UPDATE profiles 
    SET 
      language_id = (SELECT id FROM languages WHERE code = ?), 
      theme_id = (SELECT id FROM themes WHERE name = ?) 
    WHERE user_id = ?
  `).bind(language, theme, user.id).run();
  return c.json({ success: true });
});
api.post("/wallet/verify", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { national_code, date_of_birth } = await c.req.json();
  if (!isValidIranianNationalCode(national_code)) {
    return c.json({ error: "Invalid National Code" }, 400);
  }
  if (!date_of_birth) {
    return c.json({ error: "Date of birth is required" }, 400);
  }
  await c.env.DB.prepare(`
    UPDATE profiles 
    SET national_code = ?, date_of_birth = ?, wallet_status = 'PENDING'
    WHERE user_id = ?
  `).bind(national_code, date_of_birth, user.id).run();
  return c.json({ success: true });
});
api.post("/wallet/charge", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { amount, currency } = await c.req.json();
  if (!amount || amount <= 0) return c.json({ error: "Invalid amount" }, 400);
  const { meta } = await c.env.DB.prepare(
    "INSERT INTO invoices (user_id, total_price, currency, type) VALUES (?, ?, ?, 'WALLET_CHARGE')"
  ).bind(user.id, amount, currency || "USD").run();
  return c.json({ success: true, invoice_id: meta.last_row_id });
});
api.post("/invoice/:id/pay-with-wallet", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const invoiceId = c.req.param("id");
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ? AND user_id = ? AND status = 'PENDING_PAYMENT'").bind(invoiceId, user.id).first();
  if (!invoice) return c.json({ error: "Invoice not found or already paid" }, 404);
  const profile = await c.env.DB.prepare("SELECT wallet_balance FROM profiles WHERE user_id = ?").bind(user.id).first();
  if (!profile || profile.wallet_balance < invoice.total_price) {
    return c.json({ error: "Insufficient wallet balance" }, 400);
  }
  await c.env.DB.prepare("UPDATE profiles SET wallet_balance = wallet_balance - ? WHERE user_id = ?").bind(invoice.total_price, user.id).run();
  const { meta } = await c.env.DB.prepare(
    "INSERT INTO payments (invoice_id, method, status) VALUES (?, 'WALLET', 'APPROVED')"
  ).bind(invoiceId).run();
  const paymentId = meta.last_row_id;
  await c.env.DB.prepare("UPDATE invoices SET status = 'APPROVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id, invoiceId).run();
  const { results: items } = await c.env.DB.prepare(`
    SELECT ii.product_id, i.user_id, ii.snapshot_name, ii.snapshot_description, ii.snapshot_duration_days, ii.quantity
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.invoice_id = ?
  `).bind(invoiceId).all();
  const codeAssignments = [];
  for (const item of items) {
    if (item.snapshot_duration_days > 0) {
      for (let q = 0; q < item.quantity; q++) {
        const code = await c.env.DB.prepare("SELECT id, code FROM redeem_codes WHERE product_id = ? AND (is_sold = 2 OR is_sold = 0) ORDER BY is_sold DESC LIMIT 1").bind(item.product_id).first();
        if (!code) {
          return c.json({ error: `Not enough redeem codes available for ${item.snapshot_name}.` }, 400);
        }
        await c.env.DB.prepare("UPDATE redeem_codes SET is_sold = 3 WHERE id = ?").bind(code.id).run();
        codeAssignments.push({ codeId: code.id, codeStr: code.code, item });
      }
    }
  }
  for (const item of items) {
    for (let q = 0; q < item.quantity; q++) {
      const startsAt = /* @__PURE__ */ new Date();
      const endsAt = new Date(startsAt.getTime() + item.snapshot_duration_days * 24 * 60 * 60 * 1e3);
      let assignedCode = null;
      if (item.snapshot_duration_days > 0) {
        const assignObj = codeAssignments.find((ca) => ca.item.product_id === item.product_id);
        if (assignObj) {
          assignedCode = assignObj.codeStr;
          await c.env.DB.prepare("UPDATE redeem_codes SET payment_id = ?, is_sold = 1 WHERE id = ?").bind(paymentId, assignObj.codeId).run();
          codeAssignments.splice(codeAssignments.indexOf(assignObj), 1);
          const count = await c.env.DB.prepare("SELECT COUNT(*) as c FROM redeem_codes WHERE product_id = ? AND is_sold = 0").bind(item.product_id).first();
          if (count) {
            await c.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(count.c, item.product_id).run();
          }
        }
      }
      await c.env.DB.prepare(`
        INSERT INTO user_inventory (user_id, payment_id, snapshot_name, snapshot_description, access_starts_at, access_ends_at, redeem_code)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        paymentId,
        item.snapshot_name,
        item.snapshot_description || "",
        startsAt.toISOString(),
        item.snapshot_duration_days > 0 ? endsAt.toISOString() : null,
        assignedCode
      ).run();
    }
  }
  return c.json({ success: true });
});
api.post("/log", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { action, metadata, details } = await c.req.json();
  const finalMeta = details || metadata;
  await logUsage(c.env.DB, user.id, action, finalMeta);
  return c.json({ success: true });
});
api.get("/catalog", async (c) => {
  const { results: categories } = await c.env.DB.prepare("SELECT * FROM categories WHERE is_active = 1").all();
  const { results: products } = await c.env.DB.prepare("SELECT * FROM products WHERE is_hidden = 0").all();
  return c.json({ categories, products });
});
api.get("/admin/catalog", adminMiddleware, async (c) => {
  const { results: categories } = await c.env.DB.prepare("SELECT * FROM categories").all();
  const { results: products } = await c.env.DB.prepare("SELECT * FROM products").all();
  return c.json({ categories, products });
});
api.post("/admin/categories", adminMiddleware, async (c) => {
  const { id, parent_id, name, is_active } = await c.req.json();
  if (id) {
    await c.env.DB.prepare("UPDATE categories SET name = ?, parent_id = ?, is_active = ? WHERE id = ?").bind(name, parent_id || null, is_active ? 1 : 0, id).run();
  } else {
    await c.env.DB.prepare("INSERT INTO categories (name, parent_id, is_active) VALUES (?, ?, ?)").bind(name, parent_id || null, is_active !== false ? 1 : 0).run();
  }
  return c.json({ success: true });
});
api.post("/admin/products", adminMiddleware, async (c) => {
  const { id, category_id, name, description, base_price, currency, duration_days, stock, is_selling, is_hidden } = await c.req.json();
  const ccy = currency || "USD";
  const duration = duration_days || 0;
  if (id) {
    await c.env.DB.prepare(
      "UPDATE products SET category_id = ?, name = ?, description = ?, base_price = ?, currency = ?, duration_days = ?, stock = ?, is_selling = ?, is_hidden = ? WHERE id = ?"
    ).bind(category_id, name, description || null, base_price, ccy, duration, stock || -1, is_selling ? 1 : 0, is_hidden ? 1 : 0, id).run();
  } else {
    await c.env.DB.prepare(
      "INSERT INTO products (category_id, name, description, base_price, currency, duration_days, stock, is_selling, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(category_id, name, description || null, base_price, ccy, duration, stock || -1, is_selling !== false ? 1 : 0, is_hidden ? 1 : 0).run();
  }
  return c.json({ success: true });
});
api.get("/admin/products/:id/codes", adminMiddleware, async (c) => {
  const productId = c.req.param("id");
  const { results } = await c.env.DB.prepare("SELECT c.*, p.invoice_id FROM redeem_codes c LEFT JOIN payments p ON c.payment_id = p.id WHERE c.product_id = ? ORDER BY c.id DESC").bind(productId).all();
  return c.json({ codes: results });
});
api.post("/admin/products/:id/codes", adminMiddleware, async (c) => {
  const productId = c.req.param("id");
  const { code } = await c.req.json();
  if (!code) return c.json({ error: "Code is required" }, 400);
  await c.env.DB.prepare("INSERT INTO redeem_codes (product_id, code) VALUES (?, ?)").bind(productId, code).run();
  const count = await c.env.DB.prepare("SELECT COUNT(*) as c FROM redeem_codes WHERE product_id = ? AND is_sold = 0").bind(productId).first();
  if (count) {
    await c.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(count.c, productId).run();
  }
  return c.json({ success: true });
});
api.delete("/admin/products/:id/codes/:codeId", adminMiddleware, async (c) => {
  const productId = c.req.param("id");
  const codeId = c.req.param("codeId");
  await c.env.DB.prepare("DELETE FROM redeem_codes WHERE id = ? AND product_id = ? AND is_sold = 0").bind(codeId, productId).run();
  const count = await c.env.DB.prepare("SELECT COUNT(*) as c FROM redeem_codes WHERE product_id = ? AND is_sold = 0").bind(productId).first();
  if (count) {
    await c.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(count.c, productId).run();
  }
  return c.json({ success: true });
});
api.get("/admin/settings", adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare("SELECT key, value FROM settings").all();
  const settings = (results || []).reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
  return c.json({ settings });
});
api.post("/admin/settings", adminMiddleware, async (c) => {
  const { card_holder, card_number } = await c.req.json();
  await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'card_holder'").bind(card_holder || "").run();
  await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'card_number'").bind(card_number || "").run();
  return c.json({ success: true });
});
api.get("/admin/invoices", adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT i.*, u.username, u.first_name, ru.first_name as reviewer_name, ru.username as reviewer_username
      FROM invoices i
      JOIN users u ON i.user_id = u.telegram_id
      LEFT JOIN users ru ON i.reviewed_by = ru.telegram_id
      ORDER BY i.created_at DESC
  `).all();
  return c.json({ invoices: results });
});
api.get("/admin/payments", adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT p.*, i.user_id, i.total_price, i.currency, u.username, u.first_name 
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    JOIN users u ON i.user_id = u.telegram_id
    WHERE p.status = 'PENDING_APPROVAL'
  `).all();
  return c.json({ payments: results });
});
api.post("/admin/payments/:id/approve", adminMiddleware, async (c) => {
  const adminUser = c.get("user");
  const paymentId = c.req.param("id");
  const pRecord = await c.env.DB.prepare("SELECT invoice_id FROM payments WHERE id = ?").bind(paymentId).first();
  if (!pRecord) return c.json({ error: "Payment not found" }, 404);
  const invoiceId = pRecord.invoice_id;
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ?").bind(invoiceId).first();
  if (!invoice) return c.json({ error: "Invoice not found" }, 404);
  if (invoice.type === "WALLET_CHARGE") {
    await c.env.DB.prepare("UPDATE payments SET status = 'APPROVED' WHERE id = ?").bind(paymentId).run();
    await c.env.DB.prepare("UPDATE invoices SET status = 'APPROVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(adminUser.id, invoiceId).run();
    await c.env.DB.prepare("UPDATE profiles SET wallet_balance = wallet_balance + ? WHERE user_id = ?").bind(invoice.total_price, invoice.user_id).run();
    return c.json({ success: true });
  }
  const { results: items } = await c.env.DB.prepare(`
    SELECT ii.product_id, i.user_id, ii.snapshot_name, ii.snapshot_description, ii.snapshot_duration_days, ii.quantity
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.invoice_id = ?
  `).bind(invoiceId).all();
  const codeAssignments = [];
  for (const item of items) {
    if (item.snapshot_duration_days > 0) {
      for (let q = 0; q < item.quantity; q++) {
        const code = await c.env.DB.prepare("SELECT id, code FROM redeem_codes WHERE product_id = ? AND (is_sold = 2 OR is_sold = 0) ORDER BY is_sold DESC LIMIT 1").bind(item.product_id).first();
        if (!code) {
          return c.json({ error: `Not enough redeem codes available for ${item.snapshot_name}.` }, 400);
        }
        await c.env.DB.prepare("UPDATE redeem_codes SET is_sold = 3 WHERE id = ?").bind(code.id).run();
        codeAssignments.push({ codeId: code.id, codeStr: code.code, item });
      }
    }
  }
  await c.env.DB.prepare("UPDATE payments SET status = 'APPROVED' WHERE id = ?").bind(paymentId).run();
  await c.env.DB.prepare("UPDATE invoices SET status = 'APPROVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(adminUser.id, invoiceId).run();
  for (const item of items) {
    for (let q = 0; q < item.quantity; q++) {
      const startsAt = /* @__PURE__ */ new Date();
      const endsAt = new Date(startsAt.getTime() + item.snapshot_duration_days * 24 * 60 * 60 * 1e3);
      let assignedCode = null;
      if (item.snapshot_duration_days > 0) {
        const assignObj = codeAssignments.find((ca) => ca.item.product_id === item.product_id);
        if (assignObj) {
          assignedCode = assignObj.codeStr;
          await c.env.DB.prepare("UPDATE redeem_codes SET payment_id = ?, is_sold = 1 WHERE id = ?").bind(paymentId, assignObj.codeId).run();
          codeAssignments.splice(codeAssignments.indexOf(assignObj), 1);
          const count = await c.env.DB.prepare("SELECT COUNT(*) as c FROM redeem_codes WHERE product_id = ? AND is_sold = 0").bind(item.product_id).first();
          if (count) {
            await c.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(count.c, item.product_id).run();
          }
        }
      }
      await c.env.DB.prepare(`
        INSERT INTO user_inventory (user_id, payment_id, snapshot_name, snapshot_description, access_starts_at, access_ends_at, redeem_code)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        item.user_id,
        paymentId,
        item.snapshot_name,
        item.snapshot_description,
        startsAt.toISOString(),
        item.snapshot_duration_days > 0 ? endsAt.toISOString() : null,
        assignedCode
      ).run();
    }
  }
  return c.json({ success: true });
});
api.post("/admin/payments/:id/reject", adminMiddleware, async (c) => {
  const adminUser = c.get("user");
  const paymentId = c.req.param("id");
  await c.env.DB.prepare("UPDATE payments SET status = 'REJECTED' WHERE id = ?").bind(paymentId).run();
  const pRecord = await c.env.DB.prepare("SELECT invoice_id FROM payments WHERE id = ?").bind(paymentId).first();
  if (pRecord) {
    await c.env.DB.prepare("UPDATE invoices SET status = 'REJECTED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(adminUser.id, pRecord.invoice_id).run();
  }
  return c.json({ success: true });
});
api.get("/basket", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { results } = await c.env.DB.prepare(`
    SELECT b.id as basket_id, b.quantity, p.* 
    FROM baskets b 
    JOIN products p ON b.product_id = p.id 
    WHERE b.user_id = ?
  `).bind(user.id).all();
  return c.json({ basket: results });
});
api.post("/basket/add", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { product_id } = await c.req.json();
  const exists = await c.env.DB.prepare("SELECT id FROM baskets WHERE user_id = ? AND product_id = ?").bind(user.id, product_id).first();
  if (exists) {
    await c.env.DB.prepare("UPDATE baskets SET quantity = quantity + 1 WHERE id = ?").bind(exists.id).run();
  } else {
    await c.env.DB.prepare("INSERT INTO baskets (user_id, product_id) VALUES (?, ?)").bind(user.id, product_id).run();
  }
  return c.json({ success: true });
});
api.post("/basket/decrement", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { basket_id } = await c.req.json();
  const exists = await c.env.DB.prepare("SELECT id, quantity FROM baskets WHERE id = ? AND user_id = ?").bind(basket_id, user.id).first();
  if (exists) {
    if (exists.quantity > 1) {
      await c.env.DB.prepare("UPDATE baskets SET quantity = quantity - 1 WHERE id = ?").bind(basket_id).run();
    } else {
      await c.env.DB.prepare("DELETE FROM baskets WHERE id = ?").bind(basket_id).run();
    }
  }
  return c.json({ success: true });
});
api.post("/basket/remove", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { basket_id } = await c.req.json();
  await c.env.DB.prepare("DELETE FROM baskets WHERE id = ? AND user_id = ?").bind(basket_id, user.id).run();
  return c.json({ success: true });
});
api.post("/invoice/create", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { results: basketItems } = await c.env.DB.prepare(`
    SELECT b.id as basket_id, b.quantity, p.* 
    FROM baskets b 
    JOIN products p ON b.product_id = p.id 
    WHERE b.user_id = ?
  `).bind(user.id).all();
  if (!basketItems || basketItems.length === 0) {
    return c.json({ error: "Basket is empty" }, 400);
  }
  for (const item of basketItems) {
    if (item.stock === 0) {
      return c.json({ error: `Product ${item.name} is out of stock.` }, 400);
    }
  }
  const currency = basketItems[0].currency;
  const totalPrice = basketItems.reduce((acc, item) => acc + item.base_price * item.quantity, 0);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1e3);
  const { meta } = await c.env.DB.prepare(`
    INSERT INTO invoices (user_id, total_price, currency, status, expires_at) 
    VALUES (?, ?, ?, 'PENDING_PAYMENT', ?)
  `).bind(user.id, totalPrice, currency, expiresAt.toISOString()).run();
  const invoiceId = meta.last_row_id;
  for (const item of basketItems) {
    await c.env.DB.prepare(`
      INSERT INTO invoice_items (invoice_id, product_id, snapshot_name, snapshot_description, snapshot_price, snapshot_duration_days, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      invoiceId,
      item.id,
      item.name,
      item.description || "",
      item.base_price,
      item.duration_days,
      item.quantity
    ).run();
  }
  await c.env.DB.prepare("DELETE FROM baskets WHERE user_id = ?").bind(user.id).run();
  return c.json({ success: true, invoice_id: invoiceId });
});
api.post("/invoice/:id/receipt", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const invoiceId = c.req.param("id");
  const contentType = c.req.header("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return c.json({ error: "Requires multipart/form-data" }, 400);
  }
  const formData = await c.req.parseBody();
  const file = formData["receipt"];
  if (!file || !(file instanceof File)) {
    return c.json({ error: "Receipt file is required" }, 400);
  }
  if (!file.type.startsWith("image/")) {
    return c.json({ error: "Only images are allowed" }, 400);
  }
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: "File size must be less than 5MB" }, 400);
  }
  const arrayBuffer = await file.arrayBuffer();
  const uniqueId = crypto.randomUUID();
  const fileKey = `receipts/${invoiceId}_${uniqueId}_${file.name}`;
  await c.env.RECEIPTS_BUCKET.put(fileKey, arrayBuffer, {
    httpMetadata: { contentType: file.type }
  });
  const paymentData = JSON.stringify({ receipt_key: fileKey });
  await c.env.DB.prepare(`
    INSERT INTO payments (invoice_id, method, payment_data, status) 
    VALUES (?, 'CARD_TRANSFER', ?, 'PENDING_APPROVAL')
  `).bind(invoiceId, paymentData).run();
  await c.env.DB.prepare("UPDATE invoices SET status = 'PENDING_APPROVAL' WHERE id = ?").bind(invoiceId).run();
  return c.json({ success: true });
});
api.get("/receipt-image/:key", async (c) => {
  const key = c.req.param("key");
  const fullKey = `receipts/${key}`;
  const object = await c.env.RECEIPTS_BUCKET.get(fullKey);
  if (!object) return c.json({ error: "Not found" }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
});
api.get("/payments", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { results } = await c.env.DB.prepare(`
    SELECT p.*, i.total_price, i.currency 
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE i.user_id = ?
    ORDER BY p.created_at DESC
  `).bind(user.id).all();
  return c.json({ payments: results });
});
api.get("/inventory", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const { results } = await c.env.DB.prepare(`
    SELECT ui.* 
    FROM user_inventory ui
    WHERE ui.user_id = ?
    ORDER BY ui.access_starts_at DESC
  `).bind(user.id).all();
  return c.json({ inventory: results });
});
api.get("/invoice/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No user data" }, 400);
  const invoiceId = c.req.param("id");
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ? AND user_id = ?").bind(invoiceId, user.id).first();
  if (!invoice) return c.json({ error: "Invoice not found" }, 404);
  const { results: items } = await c.env.DB.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").bind(invoiceId).all();
  const { results: settings } = await c.env.DB.prepare("SELECT key, value FROM settings WHERE key IN ('card_holder', 'card_number')").all();
  const paymentInfo = (settings || []).reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
  return c.json({ invoice, items, paymentInfo });
});
api.get("/translations", async (c) => {
  const { results: langs } = await c.env.DB.prepare("SELECT id, code, is_active FROM languages").all();
  const { results: trans } = await c.env.DB.prepare("SELECT lang_code, message_key, message_value FROM translations").all();
  const translations = {};
  for (const row of trans || []) {
    if (!translations[row.lang_code]) translations[row.lang_code] = {};
    translations[row.lang_code][row.message_key] = row.message_value;
  }
  return c.json({ languages: langs, translations });
});
api.post("/admin/translations", adminMiddleware, async (c) => {
  const { lang_code, message_key, message_value } = await c.req.json();
  if (!lang_code || !message_key || !message_value) return c.json({ error: "Missing fields" }, 400);
  await c.env.DB.prepare(`
    INSERT INTO translations (lang_code, message_key, message_value) 
    VALUES (?, ?, ?) 
    ON CONFLICT(lang_code, message_key) DO UPDATE SET message_value = excluded.message_value
  `).bind(lang_code, message_key, message_value).run();
  return c.json({ success: true });
});
api.post("/admin/languages", adminMiddleware, async (c) => {
  const { code, is_active } = await c.req.json();
  await c.env.DB.prepare("UPDATE languages SET is_active = ? WHERE code = ?").bind(is_active ? 1 : 0, code).run();
  return c.json({ success: true });
});
api.get("/admin/migrate", async (c) => {
  try {
    await c.env.DB.prepare(`ALTER TABLE profiles ADD COLUMN national_code TEXT;`).run();
    await c.env.DB.prepare(`ALTER TABLE profiles ADD COLUMN date_of_birth TEXT;`).run();
    await c.env.DB.prepare(`ALTER TABLE profiles ADD COLUMN wallet_status TEXT DEFAULT 'UNVERIFIED';`).run();
    await c.env.DB.prepare(`ALTER TABLE profiles ADD COLUMN wallet_balance INTEGER DEFAULT 0;`).run();
    await c.env.DB.prepare(`ALTER TABLE invoices ADD COLUMN type TEXT DEFAULT 'PRODUCT_PURCHASE';`).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e.message });
  }
});
api.get("/admin/verifications", adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT u.telegram_id as user_id, u.first_name, u.last_name, u.username, p.national_code, p.date_of_birth, p.wallet_status
    FROM profiles p
    JOIN users u ON p.user_id = u.telegram_id
    WHERE p.wallet_status = 'PENDING'
  `).all();
  return c.json({ verifications: results });
});
api.post("/admin/verifications/:id/approve", adminMiddleware, async (c) => {
  const userId = c.req.param("id");
  await c.env.DB.prepare("UPDATE profiles SET wallet_status = 'VERIFIED' WHERE user_id = ?").bind(userId).run();
  return c.json({ success: true });
});
api.post("/admin/verifications/:id/reject", adminMiddleware, async (c) => {
  const userId = c.req.param("id");
  await c.env.DB.prepare("UPDATE profiles SET wallet_status = 'REJECTED' WHERE user_id = ?").bind(userId).run();
  return c.json({ success: true });
});
api.get("/admin/users", adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT u.telegram_id, u.username, u.first_name, u.last_name, u.created_at, p.phone_number, r.id as role_id, r.name as role
    FROM users u
    JOIN profiles p ON u.telegram_id = p.user_id
    JOIN roles r ON p.role_id = r.id
    ORDER BY u.created_at DESC
  `).all();
  return c.json({ users: results });
});
api.post("/admin/users/:id/role", adminMiddleware, async (c) => {
  const reqUser = c.get("user");
  const dbUser = await c.env.DB.prepare(`
    SELECT r.name as role FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.user_id = ?
  `).bind(reqUser.id).first();
  if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
    return c.json({ error: "Forbidden. Only Super Admins can change roles." }, 403);
  }
  const userId = c.req.param("id");
  const { role_id } = await c.req.json();
  await c.env.DB.prepare("UPDATE profiles SET role_id = ? WHERE user_id = ?").bind(role_id, userId).run();
  return c.json({ success: true });
});
api.get("/admin/users/:id/logs", adminMiddleware, async (c) => {
  const userId = c.req.param("id");
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM user_usage_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100
  `).bind(userId).all();
  return c.json({ logs: results });
});
var api_default = api;
api.get("/tickets", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { results } = await c.env.DB.prepare(`
    SELECT t.*, i.id as invoice_id_number, i.type as invoice_type, i.total_price 
    FROM tickets t 
    LEFT JOIN invoices i ON t.invoice_id = i.id 
    WHERE t.user_id = ? 
    ORDER BY t.created_at DESC
  `).bind(user.id).all();
  return c.json({ tickets: results });
});
api.post("/tickets", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { heading, message, invoice_id } = await c.req.json();
  if (!heading || !message) return c.json({ error: "Missing heading or message" }, 400);
  const { meta } = await c.env.DB.prepare(
    "INSERT INTO tickets (user_id, invoice_id, heading) VALUES (?, ?, ?)"
  ).bind(user.id, invoice_id || null, heading).run();
  const ticketId = meta.last_row_id;
  await c.env.DB.prepare(
    "INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)"
  ).bind(ticketId, user.id, message).run();
  return c.json({ success: true, ticketId });
});
api.get("/tickets/:id", async (c) => {
  const user = c.get("user");
  const ticketId = c.req.param("id");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const ticket = await c.env.DB.prepare("SELECT * FROM tickets WHERE id = ? AND user_id = ?").bind(ticketId, user.id).first();
  if (!ticket) return c.json({ error: "Not found" }, 404);
  const { results: messages } = await c.env.DB.prepare(
    "SELECT m.*, u.first_name as sender_name FROM ticket_messages m JOIN users u ON m.sender_id = u.telegram_id WHERE ticket_id = ? ORDER BY m.created_at ASC"
  ).bind(ticketId).all();
  return c.json({ ticket, messages });
});
api.post("/tickets/:id/messages", async (c) => {
  const user = c.get("user");
  const ticketId = c.req.param("id");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { message } = await c.req.json();
  if (!message) return c.json({ error: "Missing message" }, 400);
  const ticket = await c.env.DB.prepare("SELECT * FROM tickets WHERE id = ? AND user_id = ?").bind(ticketId, user.id).first();
  if (!ticket) return c.json({ error: "Not found" }, 404);
  if (ticket.status === "CLOSED") {
    return c.json({ error: "Ticket is closed" }, 400);
  }
  await c.env.DB.prepare("INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)").bind(ticketId, user.id, message).run();
  return c.json({ success: true });
});
api.post("/tickets/:id/close", async (c) => {
  const user = c.get("user");
  const ticketId = c.req.param("id");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  await c.env.DB.prepare("UPDATE tickets SET status = 'CLOSED' WHERE id = ? AND user_id = ?").bind(ticketId, user.id).run();
  return c.json({ success: true });
});
api.get("/admin/tickets", supportAdminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT t.*, u.first_name, i.type as invoice_type, i.total_price 
    FROM tickets t 
    JOIN users u ON t.user_id = u.telegram_id
    LEFT JOIN invoices i ON t.invoice_id = i.id 
    ORDER BY t.created_at DESC
  `).all();
  return c.json({ tickets: results });
});
api.get("/admin/tickets/:id", supportAdminMiddleware, async (c) => {
  const ticketId = c.req.param("id");
  const ticket = await c.env.DB.prepare(
    "SELECT t.*, u.first_name FROM tickets t JOIN users u ON t.user_id = u.telegram_id WHERE t.id = ?"
  ).bind(ticketId).first();
  if (!ticket) return c.json({ error: "Not found" }, 404);
  const { results: messages } = await c.env.DB.prepare(
    "SELECT m.*, u.first_name as sender_name FROM ticket_messages m JOIN users u ON m.sender_id = u.telegram_id WHERE ticket_id = ? ORDER BY m.created_at ASC"
  ).bind(ticketId).all();
  return c.json({ ticket, messages });
});
api.post("/admin/tickets/:id/messages", supportAdminMiddleware, async (c) => {
  const adminUser = c.get("user");
  const ticketId = c.req.param("id");
  const { message } = await c.req.json();
  if (!message) return c.json({ error: "Missing message" }, 400);
  const ticket = await c.env.DB.prepare("SELECT * FROM tickets WHERE id = ?").bind(ticketId).first();
  if (!ticket) return c.json({ error: "Not found" }, 404);
  if (ticket.status === "CLOSED") {
    return c.json({ error: "Ticket is closed" }, 400);
  }
  await c.env.DB.prepare("INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)").bind(ticketId, adminUser.id, message).run();
  return c.json({ success: true });
});
api.post("/admin/tickets/:id/close", supportAdminMiddleware, async (c) => {
  const ticketId = c.req.param("id");
  await c.env.DB.prepare("UPDATE tickets SET status = 'CLOSED' WHERE id = ?").bind(ticketId).run();
  return c.json({ success: true });
});

// src/index.ts
var app = new Hono2();
app.route("/api", api_default);
app.post("/bot", async (c) => {
  const bot2 = initBot(c.env);
  try {
    const update = await c.req.json();
    c.executionCtx.waitUntil(bot2.handleUpdate(update));
    return c.text("OK");
  } catch (err) {
    console.error(err);
    return c.text("Error", 500);
  }
});
var index_default = {
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    await env.DB.prepare(`
      DELETE FROM invoices 
      WHERE status = 'PENDING_PAYMENT' AND expires_at < datetime('now')
    `).run();
    const { results } = await env.DB.prepare(`
      SELECT p.id, p.payment_data, p.invoice_id 
      FROM payments p 
      WHERE p.status = 'REJECTED' AND p.created_at < datetime('now', '-2 days')
    `).all();
    if (results && results.length > 0) {
      for (const p of results) {
        try {
          if (p.payment_data) {
            const data = JSON.parse(p.payment_data);
            if (data.receipt_key) {
              await env.RECEIPTS_BUCKET.delete(data.receipt_key);
            }
          }
        } catch (e) {
          console.error("Failed to delete R2 object", e);
        }
        await env.DB.prepare("DELETE FROM invoices WHERE id = ?").bind(p.invoice_id).run();
      }
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
