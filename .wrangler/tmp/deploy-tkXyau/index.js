var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/grammy/out/web.mjs
var web_exports = {};
__export(web_exports, {
  API_CONSTANTS: () => API_CONSTANTS,
  Api: () => Api,
  Bot: () => Bot,
  BotError: () => BotError,
  Composer: () => Composer,
  Context: () => Context2,
  GrammyError: () => GrammyError,
  HttpError: () => HttpError,
  InlineKeyboard: () => InlineKeyboard,
  InlineQueryResultBuilder: () => InlineQueryResultBuilder,
  InputFile: () => InputFile,
  InputMediaBuilder: () => InputMediaBuilder,
  Keyboard: () => Keyboard,
  MemorySessionStorage: () => MemorySessionStorage,
  enhanceStorage: () => enhanceStorage,
  lazySession: () => lazySession,
  matchFilter: () => matchFilter,
  session: () => session,
  webhookCallback: () => webhookCallback
});
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
function parse(filter) {
  return Array.isArray(filter) ? filter.map((q) => q.split(":")) : [
    filter.split(":")
  ];
}
function compile(parsed) {
  const preprocessed = parsed.flatMap((q) => check(q, preprocess(q)));
  const ltree = treeify(preprocessed);
  const predicate = arborist(ltree);
  return (ctx) => !!predicate(ctx.update, ctx);
}
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
function check(original, preprocessed) {
  if (preprocessed.length === 0) throw new Error("Empty filter query given");
  const errors = preprocessed.map(checkOne).filter((r) => r !== true);
  if (errors.length === 0) return preprocessed;
  else if (errors.length === 1) throw new Error(errors[0]);
  else {
    throw new Error(`Invalid filter query '${original.join(":")}'. There are ${errors.length} errors after expanding the contained shortcuts: ${errors.join("; ")}`);
  }
}
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
function or(left, right) {
  return (obj, ctx) => left(obj, ctx) || right(obj, ctx);
}
function concat(get, test) {
  return (obj, ctx) => {
    const nextObj = get(obj, ctx);
    return nextObj && test(nextObj, ctx);
  };
}
function leaf(pred) {
  return (obj, ctx) => pred(obj, ctx) != null;
}
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
function testMaybeArray(t, pred) {
  const p = /* @__PURE__ */ __name((x) => x != null && pred(x), "p");
  return Array.isArray(t) ? t.some(p) : p(t);
}
function orThrow(value, method) {
  if (value === void 0) {
    throw new Error(`Missing information for API call to ${method}`);
  }
  return value;
}
function triggerFn(trigger) {
  return toArray(trigger).map((t) => typeof t === "string" ? (txt) => txt === t ? t : null : (txt) => txt.match(t));
}
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
function toArray(e) {
  return Array.isArray(e) ? e : [
    e
  ];
}
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
function flatten(mw) {
  return typeof mw === "function" ? mw : (ctx, next) => mw.middleware()(ctx, next);
}
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
function pass(_ctx, next) {
  return next();
}
async function run(middleware, ctx) {
  await middleware(ctx, leaf1);
}
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
function plural(ms2, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
}
function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
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
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
function noop() {
}
function binding(name) {
  throw new Error("process.binding is not supported");
}
function cwd() {
  return "/";
}
function chdir(dir) {
  throw new Error("process.chdir is not supported");
}
function umask() {
  return 0;
}
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
function uptime() {
  var currentTime = /* @__PURE__ */ new Date();
  var dif = currentTime - startTime;
  return dif / 1e3;
}
function createCommonjsModule(fn, basedir, module) {
  return module = {
    path: basedir,
    exports: {},
    require: /* @__PURE__ */ __name(function(path, base) {
      return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
    }, "require")
  }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
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
function isTelegramError(err) {
  return typeof err === "object" && err !== null && "status" in err && "statusText" in err;
}
function toHttpError(method, sensitiveLogs, err) {
  let msg = `Network request for '${method}' failed!`;
  if (isTelegramError(err)) msg += ` (${err.status}: ${err.statusText})`;
  if (sensitiveLogs && err instanceof Error) msg += ` ${err.message}`;
  return new HttpError(msg, err);
}
function checkWindows() {
  const global = globalThis;
  const platform2 = global.process?.platform;
  if (typeof platform2 === "string") return platform2.startsWith("win");
  const os = global.Deno?.build?.os;
  if (typeof os === "string") return os === "windows";
  return global.navigator?.platform?.startsWith("Win") ?? false;
}
function assertPath(path) {
  if (typeof path !== "string") {
    throw new TypeError(`Path must be a string, received "${JSON.stringify(path)}"`);
  }
}
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
function assertArgs(path, suffix) {
  assertPath(path);
  if (path.length === 0) return path;
  if (typeof suffix !== "string") {
    throw new TypeError(`Suffix must be a string, received "${JSON.stringify(suffix)}"`);
  }
}
function assertArg(url) {
  url = url instanceof URL ? url : new URL(url);
  if (url.protocol !== "file:") {
    throw new TypeError(`URL must be a file URL: received "${url.protocol}"`);
  }
  return url;
}
function fromFileUrl(url) {
  url = assertArg(url);
  return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
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
function isPosixPathSeparator(code) {
  return code === 47;
}
function basename(path, suffix = "") {
  if (path instanceof URL) {
    path = fromFileUrl(path);
  }
  assertArgs(path, suffix);
  const lastSegment = lastPathSegment(path, isPosixPathSeparator);
  const strippedSegment = stripTrailingSeparators(lastSegment, isPosixPathSeparator);
  return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
function isPathSeparator(code) {
  return code === 47 || code === 92;
}
function isWindowsDeviceRoot(code) {
  return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function fromFileUrl1(url) {
  url = assertArg(url);
  let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  if (url.hostname !== "") {
    path = `\\\\${url.hostname}${path}`;
  }
  return path;
}
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
function basename2(path, suffix = "") {
  return isWindows ? basename1(path, suffix) : basename(path, suffix);
}
async function* fetchFile(url) {
  const { body } = await fetch(url);
  if (body === null) {
    throw new Error(`Download failed, no response body from '${url}'`);
  }
  yield* body;
}
function requiresFormDataUpload(payload) {
  return payload instanceof InputFile || typeof payload === "object" && payload !== null && Object.values(payload).some((v) => Array.isArray(v) ? v.some(requiresFormDataUpload) : v instanceof InputFile || requiresFormDataUpload(v));
}
function str(value) {
  return JSON.stringify(value, (_, v) => v ?? void 0);
}
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
async function* protectItr(itr, onError) {
  try {
    yield* itr;
  } catch (err) {
    onError(err);
  }
}
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
function createBoundary() {
  return "----------" + randomId(32);
}
function randomId(length = 16) {
  return Array.from(Array(length)).map(() => Math.random().toString(36)[2] || 0).join("");
}
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
function valuePart(key, value) {
  return enc.encode(`content-disposition:form-data;name="${key}"\r
\r
${value}`);
}
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
function concatTransformer(prev, trans) {
  return (method, payload, signal) => trans(prev, method, payload, signal);
}
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
function validateAllowedUpdates(updates, allowed = DEFAULT_UPDATE_TYPES) {
  const impossible = Array.from(updates).filter((u) => !allowed.includes(u));
  if (impossible.length > 0) {
    debugWarn(`You registered listeners for the following update types, but you did not specify them in \`allowed_updates\` so they may not be received: ${impossible.map((u) => `'${u}'`).join(", ")}`);
  }
}
function noUseFunction() {
  throw new Error(`It looks like you are registering more listeners on your bot from within other listeners! This means that every time your bot handles a message like this one, new listeners will be added. This list grows until your machine crashes, so grammY throws this error to tell you that you should probably do things a bit differently. If you're unsure how to resolve this problem, you can ask in the group chat: https://telegram.me/grammyjs

On the other hand, if you actually know what you're doing and you do need to install further middleware while your bot is running, consider installing a composer instance on your bot, and in turn augment the composer after the fact. This way, you can circumvent this protection against memory leaks.`);
}
function inputMessage(queryTemplate) {
  return {
    ...queryTemplate,
    ...inputMessageMethods(queryTemplate)
  };
}
function inputMessageMethods(queryTemplate) {
  return {
    text(message_text, options = {}) {
      const content = {
        message_text,
        ...options
      };
      return {
        ...queryTemplate,
        input_message_content: content
      };
    },
    rich(rich_message, options = {}) {
      const content = {
        rich_message,
        ...options
      };
      return {
        ...queryTemplate,
        input_message_content: content
      };
    },
    location(latitude, longitude, options = {}) {
      const content = {
        latitude,
        longitude,
        ...options
      };
      return {
        ...queryTemplate,
        input_message_content: content
      };
    },
    venue(title2, latitude, longitude, address, options) {
      const content = {
        title: title2,
        latitude,
        longitude,
        address,
        ...options
      };
      return {
        ...queryTemplate,
        input_message_content: content
      };
    },
    contact(first_name, phone_number, options = {}) {
      const content = {
        first_name,
        phone_number,
        ...options
      };
      return {
        ...queryTemplate,
        input_message_content: content
      };
    },
    invoice(title2, description, payload, provider_token, currency, prices, options = {}) {
      const content = {
        title: title2,
        description,
        payload,
        provider_token,
        currency,
        prices,
        ...options
      };
      return {
        ...queryTemplate,
        input_message_content: content
      };
    }
  };
}
function transpose(grid) {
  const transposed = [];
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    for (let j = 0; j < row.length; j++) {
      const button = row[j];
      (transposed[j] ??= []).push(button);
    }
  }
  return transposed;
}
function reflow(grid, columns, { fillLastRow = false }) {
  let first = columns;
  if (fillLastRow) {
    const buttonCount = grid.map((row) => row.length).reduce((a, b) => a + b, 0);
    first = buttonCount % columns;
  }
  const reflowed = [];
  for (const row of grid) {
    for (const button of row) {
      const at = Math.max(0, reflowed.length - 1);
      const max = at === 0 ? first : columns;
      let next = reflowed[at] ??= [];
      if (next.length === max) {
        next = [];
        reflowed.push(next);
      }
      next.push(button);
    }
  }
  return reflowed;
}
function session(options = {}) {
  return options.type === "multi" ? strictMultiSession(options) : strictSingleSession(options);
}
function strictSingleSession(options) {
  const { initial, storage, getSessionKey, custom } = fillDefaults(options);
  return async (ctx, next) => {
    const propSession = new PropertySession(storage, ctx, "session", initial);
    const key = await getSessionKey(ctx);
    await propSession.init(key, {
      custom,
      lazy: false
    });
    await next();
    await propSession.finish();
  };
}
function strictMultiSession(options) {
  const props = Object.keys(options).filter((k) => k !== "type");
  const defaults = Object.fromEntries(props.map((prop) => [
    prop,
    fillDefaults(options[prop])
  ]));
  return async (ctx, next) => {
    ctx.session = {};
    const propSessions = await Promise.all(props.map(async (prop) => {
      const { initial, storage, getSessionKey, custom } = defaults[prop];
      const s2 = new PropertySession(storage, ctx.session, prop, initial);
      const key = await getSessionKey(ctx);
      await s2.init(key, {
        custom,
        lazy: false
      });
      return s2;
    }));
    await next();
    if (ctx.session == null) propSessions.forEach((s2) => s2.delete());
    await Promise.all(propSessions.map((s2) => s2.finish()));
  };
}
function lazySession(options = {}) {
  if (options.type !== void 0 && options.type !== "single") {
    throw new Error("Cannot use lazy multi sessions!");
  }
  const { initial, storage, getSessionKey, custom } = fillDefaults(options);
  return async (ctx, next) => {
    const propSession = new PropertySession(storage, ctx, "session", initial);
    const key = await getSessionKey(ctx);
    await propSession.init(key, {
      custom,
      lazy: true
    });
    await next();
    await propSession.finish();
  };
}
function fillDefaults(opts = {}) {
  let { prefix = "", getSessionKey = defaultGetSessionKey, initial, storage } = opts;
  if (storage == null) {
    debug3("Storing session data in memory, all data will be lost when the bot restarts.");
    storage = new MemorySessionStorage();
  }
  const custom = getSessionKey !== defaultGetSessionKey;
  return {
    initial,
    storage,
    getSessionKey: /* @__PURE__ */ __name(async (ctx) => {
      const key = await getSessionKey(ctx);
      return key === void 0 ? void 0 : prefix + key;
    }, "getSessionKey"),
    custom
  };
}
function defaultGetSessionKey(ctx) {
  return ctx.chatId?.toString();
}
function undef(op, opts) {
  const { lazy = false, custom } = opts;
  const reason = custom ? "the custom `getSessionKey` function returned undefined for this update" : "this update does not belong to a chat, so the session key is undefined";
  return `Cannot ${op} ${lazy ? "lazy " : ""}session data because ${reason}!`;
}
function isEnhance(value) {
  return value === void 0 || typeof value === "object" && value !== null && "__d" in value;
}
function enhanceStorage(options) {
  let { storage, millisecondsToLive, migrations } = options;
  storage = compatStorage(storage);
  if (millisecondsToLive !== void 0) {
    storage = timeoutStorage(storage, millisecondsToLive);
  }
  if (migrations !== void 0) {
    storage = migrationStorage(storage, migrations);
  }
  return wrapStorage(storage);
}
function compatStorage(storage) {
  return {
    read: /* @__PURE__ */ __name(async (k) => {
      const v = await storage.read(k);
      return isEnhance(v) ? v : {
        __d: v
      };
    }, "read"),
    write: /* @__PURE__ */ __name((k, v) => storage.write(k, v), "write"),
    delete: /* @__PURE__ */ __name((k) => storage.delete(k), "delete")
  };
}
function timeoutStorage(storage, millisecondsToLive) {
  const ttlStorage = {
    read: /* @__PURE__ */ __name(async (k) => {
      const value = await storage.read(k);
      if (value === void 0) return void 0;
      if (value.e === void 0) {
        await ttlStorage.write(k, value);
        return value;
      }
      if (value.e < Date.now()) {
        await ttlStorage.delete(k);
        return void 0;
      }
      return value;
    }, "read"),
    write: /* @__PURE__ */ __name(async (k, v) => {
      v.e = addExpiryDate(v, millisecondsToLive).expires;
      await storage.write(k, v);
    }, "write"),
    delete: /* @__PURE__ */ __name((k) => storage.delete(k), "delete")
  };
  return ttlStorage;
}
function migrationStorage(storage, migrations) {
  const versions2 = Object.keys(migrations).map((v) => parseInt(v)).sort((a, b) => a - b);
  const count = versions2.length;
  if (count === 0) throw new Error("No migrations given!");
  const earliest = versions2[0];
  const last = count - 1;
  const latest = versions2[last];
  const index = /* @__PURE__ */ new Map();
  versions2.forEach((v, i) => index.set(v, i));
  function nextAfter(current) {
    let i = last;
    while (current <= versions2[i]) i--;
    return i;
  }
  __name(nextAfter, "nextAfter");
  return {
    read: /* @__PURE__ */ __name(async (k) => {
      const val = await storage.read(k);
      if (val === void 0) return val;
      let { __d: value, v: current = earliest - 1 } = val;
      let i = 1 + (index.get(current) ?? nextAfter(current));
      for (; i < count; i++) value = migrations[versions2[i]](value);
      return {
        ...val,
        v: latest,
        __d: value
      };
    }, "read"),
    write: /* @__PURE__ */ __name((k, v) => storage.write(k, {
      v: latest,
      ...v
    }), "write"),
    delete: /* @__PURE__ */ __name((k) => storage.delete(k), "delete")
  };
}
function wrapStorage(storage) {
  return {
    read: /* @__PURE__ */ __name((k) => Promise.resolve(storage.read(k)).then((v) => v?.__d), "read"),
    write: /* @__PURE__ */ __name((k, v) => storage.write(k, {
      __d: v
    }), "write"),
    delete: /* @__PURE__ */ __name((k) => storage.delete(k), "delete")
  };
}
function addExpiryDate(value, ttl) {
  if (ttl !== void 0 && ttl < Infinity) {
    const now = Date.now();
    return {
      session: value,
      expires: now + ttl
    };
  } else {
    return {
      session: value
    };
  }
}
function compareSecretToken(header, token) {
  if (token === void 0) {
    return true;
  }
  if (header === void 0) {
    return false;
  }
  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(header);
  const tokenBytes = encoder.encode(token);
  if (headerBytes.length !== tokenBytes.length) {
    return false;
  }
  let hasDifference = 0;
  for (let i = 0; i < tokenBytes.length; i++) {
    const headerByte = headerBytes[i];
    const tokenByte = tokenBytes[i];
    hasDifference |= headerByte ^ tokenByte;
  }
  return hasDifference === 0;
}
function webhookCallback(bot2, adapter = defaultAdapter, onTimeout, timeoutMilliseconds, secretToken) {
  if (bot2.isRunning()) {
    throw new Error("Bot is already running via long polling, the webhook setup won't receive any updates!");
  } else {
    bot2.start = () => {
      throw new Error("You already started the bot via webhooks, calling `bot.start()` starts the bot with long polling and this will prevent your webhook setup from receiving any updates!");
    };
  }
  const { onTimeout: timeout = "throw", timeoutMilliseconds: ms2 = 1e4, secretToken: token } = typeof onTimeout === "object" ? onTimeout : {
    onTimeout,
    timeoutMilliseconds,
    secretToken
  };
  let initialized = false;
  const server = typeof adapter === "string" ? adapters1[adapter] : adapter;
  return async (...args) => {
    const handler = server(...args);
    if (!initialized) {
      await bot2.init();
      initialized = true;
    }
    if (!compareSecretToken(handler.header, token)) {
      await handler.unauthorized();
      return handler.handlerReturn;
    }
    let usedWebhookReply = false;
    const webhookReplyEnvelope = {
      async send(json) {
        usedWebhookReply = true;
        await handler.respond(json);
      }
    };
    await timeoutIfNecessary(bot2.handleUpdate(await handler.update, webhookReplyEnvelope), typeof timeout === "function" ? () => timeout(...args) : timeout, ms2);
    if (!usedWebhookReply) handler.end?.();
    return handler.handlerReturn;
  };
}
function timeoutIfNecessary(task, onTimeout, timeout) {
  if (timeout === Infinity) return task;
  return new Promise((resolve, reject) => {
    const handle = setTimeout(() => {
      debugErr1(`Request timed out after ${timeout} ms`);
      if (onTimeout === "throw") {
        reject(new Error(`Request timed out after ${timeout} ms`));
      } else {
        if (typeof onTimeout === "function") onTimeout();
        resolve();
      }
      const now = Date.now();
      task.finally(() => {
        const diff = Date.now() - now;
        debugErr1(`Request completed ${diff} ms after timeout!`);
      });
    }, timeout);
    task.then(resolve).catch(reject).finally(() => clearTimeout(handle));
  });
}
var filterQueryCache, ENTITY_KEYS, USER_KEYS, FORWARD_ORIGIN_KEYS, STICKER_KEYS, REACTION_KEYS, GIFT_INFO_KEYS, COMMON_MESSAGE_KEYS, MESSAGE_KEYS, CHANNEL_POST_KEYS, BUSINESS_CONNECTION_KEYS, MESSAGE_REACTION_KEYS, MESSAGE_REACTION_COUNT_UPDATED_KEYS, CALLBACK_QUERY_KEYS, CHAT_MEMBER_UPDATED_KEYS, UPDATE_KEYS, L1_SHORTCUTS, L2_SHORTCUTS, checker, Context2, BotError, leaf1, Composer, s, m, h, d, w, y, ms, cachedSetTimeout, cachedClearTimeout, globalContext, queue, draining, currentQueue, queueIndex, title, platform, browser, argv, version, versions, release, config, on, addListener, once, off, removeListener, removeAllListeners, emit, performance, performanceNow, startTime, process, common, browser$1, itrToStream, baseFetchConfig, defaultAdapter, debug, GrammyError, HttpError, isWindows, InputFile, enc, debug1, ApiClient, defaultBuildUrl, proxyMethods, Api, debug2, debugWarn, debugErr, DEFAULT_UPDATE_TYPES, Bot, ALL_UPDATE_TYPES, ALL_CHAT_PERMISSIONS, API_CONSTANTS, InlineQueryResultBuilder, InputMediaBuilder, Keyboard, InlineKeyboard, debug3, PropertySession, MemorySessionStorage, SECRET_HEADER, SECRET_HEADER_LOWERCASE, WRONG_TOKEN_ERROR, ok, okJson, unauthorized, awsLambda, awsLambdaAsync, azure, azureV4, bun, cloudflare, cloudflareModule, express, fastify, hono, http, koa, nextJs, nhttp, oak, serveHttp, stdHttp, sveltekit, worktop, elysia, adapters, debugErr1, callbackAdapter, adapters1;
var init_web = __esm({
  "node_modules/grammy/out/web.mjs"() {
    filterQueryCache = /* @__PURE__ */ new Map();
    __name(matchFilter, "matchFilter");
    __name(parse, "parse");
    __name(compile, "compile");
    __name(preprocess, "preprocess");
    __name(check, "check");
    __name(checkOne, "checkOne");
    __name(treeify, "treeify");
    __name(or, "or");
    __name(concat, "concat");
    __name(leaf, "leaf");
    __name(arborist, "arborist");
    __name(testMaybeArray, "testMaybeArray");
    ENTITY_KEYS = {
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
    USER_KEYS = {
      me: {},
      is_bot: {},
      is_premium: {},
      added_to_attachment_menu: {}
    };
    FORWARD_ORIGIN_KEYS = {
      user: {},
      hidden_user: {},
      chat: {},
      channel: {}
    };
    STICKER_KEYS = {
      is_video: {},
      is_animated: {},
      premium_animation: {}
    };
    REACTION_KEYS = {
      emoji: {},
      custom_emoji: {},
      paid: {}
    };
    GIFT_INFO_KEYS = {
      can_be_upgraded: {},
      is_upgrade_separate: {},
      is_private: {}
    };
    COMMON_MESSAGE_KEYS = {
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
    MESSAGE_KEYS = {
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
    CHANNEL_POST_KEYS = {
      ...COMMON_MESSAGE_KEYS,
      channel_chat_created: {},
      direct_message_price_changed: {},
      is_paid_post: {}
    };
    BUSINESS_CONNECTION_KEYS = {
      can_reply: {},
      is_enabled: {}
    };
    MESSAGE_REACTION_KEYS = {
      old_reaction: REACTION_KEYS,
      new_reaction: REACTION_KEYS
    };
    MESSAGE_REACTION_COUNT_UPDATED_KEYS = {
      reactions: REACTION_KEYS
    };
    CALLBACK_QUERY_KEYS = {
      data: {},
      game_short_name: {}
    };
    CHAT_MEMBER_UPDATED_KEYS = {
      from: USER_KEYS
    };
    UPDATE_KEYS = {
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
    L1_SHORTCUTS = {
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
    L2_SHORTCUTS = {
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
    checker = {
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
    Context2 = class _Context {
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
    __name(orThrow, "orThrow");
    __name(triggerFn, "triggerFn");
    __name(match2, "match");
    __name(toArray, "toArray");
    BotError = class extends Error {
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
    __name(generateBotErrorMessage, "generateBotErrorMessage");
    __name(flatten, "flatten");
    __name(concat1, "concat1");
    __name(pass, "pass");
    leaf1 = /* @__PURE__ */ __name(() => Promise.resolve(), "leaf1");
    __name(run, "run");
    Composer = class _Composer {
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
    s = 1e3;
    m = s * 60;
    h = m * 60;
    d = h * 24;
    w = d * 7;
    y = d * 365.25;
    ms = /* @__PURE__ */ __name(function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse1(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    }, "ms");
    __name(parse1, "parse1");
    __name(fmtShort, "fmtShort");
    __name(fmtLong, "fmtLong");
    __name(plural, "plural");
    __name(defaultSetTimout, "defaultSetTimout");
    __name(defaultClearTimeout, "defaultClearTimeout");
    cachedSetTimeout = defaultSetTimout;
    cachedClearTimeout = defaultClearTimeout;
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
    __name(runTimeout, "runTimeout");
    __name(runClearTimeout, "runClearTimeout");
    queue = [];
    draining = false;
    queueIndex = -1;
    __name(cleanUpNextTick, "cleanUpNextTick");
    __name(drainQueue, "drainQueue");
    __name(nextTick, "nextTick");
    __name(Item, "Item");
    Item.prototype.run = function() {
      this.fun.apply(null, this.array);
    };
    title = "browser";
    platform = "browser";
    browser = true;
    argv = [];
    version = "";
    versions = {};
    release = {};
    config = {};
    __name(noop, "noop");
    on = noop;
    addListener = noop;
    once = noop;
    off = noop;
    removeListener = noop;
    removeAllListeners = noop;
    emit = noop;
    __name(binding, "binding");
    __name(cwd, "cwd");
    __name(chdir, "chdir");
    __name(umask, "umask");
    performance = globalContext.performance || {};
    performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
      return (/* @__PURE__ */ new Date()).getTime();
    };
    __name(hrtime, "hrtime");
    startTime = /* @__PURE__ */ new Date();
    __name(uptime, "uptime");
    process = {
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
    __name(createCommonjsModule, "createCommonjsModule");
    __name(commonjsRequire, "commonjsRequire");
    __name(setup, "setup");
    common = setup;
    browser$1 = createCommonjsModule(function(module, exports) {
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
    itrToStream = /* @__PURE__ */ __name((itr) => {
      const it = itr[Symbol.asyncIterator]();
      return new ReadableStream({
        async pull(controller) {
          const chunk = await it.next();
          if (chunk.done) controller.close();
          else controller.enqueue(chunk.value);
        }
      });
    }, "itrToStream");
    baseFetchConfig = /* @__PURE__ */ __name((_apiRoot) => ({}), "baseFetchConfig");
    defaultAdapter = "cloudflare";
    debug = browser$1("grammy:warn");
    GrammyError = class extends Error {
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
    __name(toGrammyError, "toGrammyError");
    HttpError = class extends Error {
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
    __name(isTelegramError, "isTelegramError");
    __name(toHttpError, "toHttpError");
    __name(checkWindows, "checkWindows");
    isWindows = checkWindows();
    __name(assertPath, "assertPath");
    __name(stripSuffix, "stripSuffix");
    __name(lastPathSegment, "lastPathSegment");
    __name(assertArgs, "assertArgs");
    __name(assertArg, "assertArg");
    __name(fromFileUrl, "fromFileUrl");
    __name(stripTrailingSeparators, "stripTrailingSeparators");
    __name(isPosixPathSeparator, "isPosixPathSeparator");
    __name(basename, "basename");
    __name(isPathSeparator, "isPathSeparator");
    __name(isWindowsDeviceRoot, "isWindowsDeviceRoot");
    __name(fromFileUrl1, "fromFileUrl1");
    __name(basename1, "basename1");
    __name(basename2, "basename2");
    InputFile = class {
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
    __name(fetchFile, "fetchFile");
    __name(requiresFormDataUpload, "requiresFormDataUpload");
    __name(str, "str");
    __name(createJsonPayload, "createJsonPayload");
    __name(protectItr, "protectItr");
    __name(createFormDataPayload, "createFormDataPayload");
    __name(createBoundary, "createBoundary");
    __name(randomId, "randomId");
    enc = new TextEncoder();
    __name(payloadToMultipartItr, "payloadToMultipartItr");
    __name(collectFiles, "collectFiles");
    __name(valuePart, "valuePart");
    __name(filePart, "filePart");
    __name(getExt, "getExt");
    debug1 = browser$1("grammy:core");
    __name(concatTransformer, "concatTransformer");
    ApiClient = class {
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
    __name(createRawApi, "createRawApi");
    defaultBuildUrl = /* @__PURE__ */ __name((root, token, method, env) => {
      const prefix = env === "test" ? "test/" : "";
      return `${root}/bot${token}/${prefix}${method}`;
    }, "defaultBuildUrl");
    proxyMethods = {
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
    __name(createTimeout, "createTimeout");
    __name(createStreamError, "createStreamError");
    __name(createAbortControllerFromSignal, "createAbortControllerFromSignal");
    __name(validateSignal, "validateSignal");
    Api = class {
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
    debug2 = browser$1("grammy:bot");
    debugWarn = browser$1("grammy:warn");
    debugErr = browser$1("grammy:error");
    DEFAULT_UPDATE_TYPES = [
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
    Bot = class extends Composer {
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
    __name(withRetries, "withRetries");
    __name(sleep, "sleep");
    __name(validateAllowedUpdates, "validateAllowedUpdates");
    __name(noUseFunction, "noUseFunction");
    ALL_UPDATE_TYPES = [
      ...DEFAULT_UPDATE_TYPES,
      "chat_member",
      "message_reaction",
      "message_reaction_count"
    ];
    ALL_CHAT_PERMISSIONS = {
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
    API_CONSTANTS = {
      DEFAULT_UPDATE_TYPES,
      ALL_UPDATE_TYPES,
      ALL_CHAT_PERMISSIONS
    };
    Object.freeze(API_CONSTANTS);
    __name(inputMessage, "inputMessage");
    __name(inputMessageMethods, "inputMessageMethods");
    InlineQueryResultBuilder = {
      article(id, title2, options = {}) {
        return inputMessageMethods({
          type: "article",
          id,
          title: title2,
          ...options
        });
      },
      audio(id, title2, audio_url, options = {}) {
        return inputMessage({
          type: "audio",
          id,
          title: title2,
          audio_url: typeof audio_url === "string" ? audio_url : audio_url.href,
          ...options
        });
      },
      audioCached(id, audio_file_id, options = {}) {
        return inputMessage({
          type: "audio",
          id,
          audio_file_id,
          ...options
        });
      },
      contact(id, phone_number, first_name, options = {}) {
        return inputMessage({
          type: "contact",
          id,
          phone_number,
          first_name,
          ...options
        });
      },
      documentPdf(id, title2, document_url, options = {}) {
        return inputMessage({
          type: "document",
          mime_type: "application/pdf",
          id,
          title: title2,
          document_url: typeof document_url === "string" ? document_url : document_url.href,
          ...options
        });
      },
      documentZip(id, title2, document_url, options = {}) {
        return inputMessage({
          type: "document",
          mime_type: "application/zip",
          id,
          title: title2,
          document_url: typeof document_url === "string" ? document_url : document_url.href,
          ...options
        });
      },
      documentCached(id, title2, document_file_id, options = {}) {
        return inputMessage({
          type: "document",
          id,
          title: title2,
          document_file_id,
          ...options
        });
      },
      game(id, game_short_name, options = {}) {
        return {
          type: "game",
          id,
          game_short_name,
          ...options
        };
      },
      gif(id, gif_url, thumbnail_url, options = {}) {
        return inputMessage({
          type: "gif",
          id,
          gif_url: typeof gif_url === "string" ? gif_url : gif_url.href,
          thumbnail_url: typeof thumbnail_url === "string" ? thumbnail_url : thumbnail_url.href,
          ...options
        });
      },
      gifCached(id, gif_file_id, options = {}) {
        return inputMessage({
          type: "gif",
          id,
          gif_file_id,
          ...options
        });
      },
      location(id, title2, latitude, longitude, options = {}) {
        return inputMessage({
          type: "location",
          id,
          title: title2,
          latitude,
          longitude,
          ...options
        });
      },
      mpeg4gif(id, mpeg4_url, thumbnail_url, options = {}) {
        return inputMessage({
          type: "mpeg4_gif",
          id,
          mpeg4_url: typeof mpeg4_url === "string" ? mpeg4_url : mpeg4_url.href,
          thumbnail_url: typeof thumbnail_url === "string" ? thumbnail_url : thumbnail_url.href,
          ...options
        });
      },
      mpeg4gifCached(id, mpeg4_file_id, options = {}) {
        return inputMessage({
          type: "mpeg4_gif",
          id,
          mpeg4_file_id,
          ...options
        });
      },
      photo(id, photo_url, options = {}) {
        const photoUrl = typeof photo_url === "string" ? photo_url : photo_url.href;
        return inputMessage({
          type: "photo",
          id,
          photo_url: photoUrl,
          thumbnail_url: photoUrl,
          ...options
        });
      },
      photoCached(id, photo_file_id, options = {}) {
        return inputMessage({
          type: "photo",
          id,
          photo_file_id,
          ...options
        });
      },
      stickerCached(id, sticker_file_id, options = {}) {
        return inputMessage({
          type: "sticker",
          id,
          sticker_file_id,
          ...options
        });
      },
      venue(id, title2, latitude, longitude, address, options = {}) {
        return inputMessage({
          type: "venue",
          id,
          title: title2,
          latitude,
          longitude,
          address,
          ...options
        });
      },
      videoHtml(id, title2, video_url, thumbnail_url, options = {}) {
        return inputMessageMethods({
          type: "video",
          mime_type: "text/html",
          id,
          title: title2,
          video_url: typeof video_url === "string" ? video_url : video_url.href,
          thumbnail_url: typeof thumbnail_url === "string" ? thumbnail_url : thumbnail_url.href,
          ...options
        });
      },
      videoMp4(id, title2, video_url, thumbnail_url, options = {}) {
        return inputMessage({
          type: "video",
          mime_type: "video/mp4",
          id,
          title: title2,
          video_url: typeof video_url === "string" ? video_url : video_url.href,
          thumbnail_url: typeof thumbnail_url === "string" ? thumbnail_url : thumbnail_url.href,
          ...options
        });
      },
      videoCached(id, title2, video_file_id, options = {}) {
        return inputMessage({
          type: "video",
          id,
          title: title2,
          video_file_id,
          ...options
        });
      },
      voice(id, title2, voice_url, options = {}) {
        return inputMessage({
          type: "voice",
          id,
          title: title2,
          voice_url: typeof voice_url === "string" ? voice_url : voice_url.href,
          ...options
        });
      },
      voiceCached(id, title2, voice_file_id, options = {}) {
        return inputMessage({
          type: "voice",
          id,
          title: title2,
          voice_file_id,
          ...options
        });
      }
    };
    InputMediaBuilder = {
      photo(media, options = {}) {
        return {
          type: "photo",
          media,
          ...options
        };
      },
      video(media, options = {}) {
        return {
          type: "video",
          media,
          ...options
        };
      },
      animation(media, options = {}) {
        return {
          type: "animation",
          media,
          ...options
        };
      },
      audio(media, options = {}) {
        return {
          type: "audio",
          media,
          ...options
        };
      },
      document(media, options = {}) {
        return {
          type: "document",
          media,
          ...options
        };
      }
    };
    Keyboard = class _Keyboard {
      static {
        __name(this, "Keyboard");
      }
      keyboard;
      is_persistent;
      selective;
      one_time_keyboard;
      resize_keyboard;
      input_field_placeholder;
      constructor(keyboard = [
        []
      ]) {
        this.keyboard = keyboard;
      }
      add(...buttons) {
        this.keyboard[this.keyboard.length - 1]?.push(...buttons);
        return this;
      }
      row(...buttons) {
        this.keyboard.push(buttons);
        return this;
      }
      text(text, options) {
        return this.add(_Keyboard.text(text, options));
      }
      static text(text, options) {
        return typeof options === "string" ? {
          text,
          style: options
        } : {
          text,
          ...options
        };
      }
      requestUsers(text, requestId, options = {}) {
        return this.add(_Keyboard.requestUsers(text, requestId, options));
      }
      static requestUsers(text, requestId, options = {}) {
        const request_users = {
          request_id: requestId,
          ...options
        };
        return typeof text === "string" ? {
          text,
          request_users
        } : {
          ...text,
          request_users
        };
      }
      requestChat(text, requestId, options = {
        chat_is_channel: false
      }) {
        return this.add(_Keyboard.requestChat(text, requestId, options));
      }
      static requestChat(text, requestId, options = {
        chat_is_channel: false
      }) {
        const request_chat = {
          request_id: requestId,
          ...options
        };
        return typeof text === "string" ? {
          text,
          request_chat
        } : {
          ...text,
          request_chat
        };
      }
      requestContact(text) {
        return this.add(_Keyboard.requestContact(text));
      }
      static requestContact(text) {
        return typeof text === "string" ? {
          text,
          request_contact: true
        } : {
          ...text,
          request_contact: true
        };
      }
      requestLocation(text) {
        return this.add(_Keyboard.requestLocation(text));
      }
      static requestLocation(text) {
        return typeof text === "string" ? {
          text,
          request_location: true
        } : {
          ...text,
          request_location: true
        };
      }
      requestPoll(text, type) {
        return this.add(_Keyboard.requestPoll(text, type));
      }
      static requestPoll(text, type) {
        const request_poll = {
          type
        };
        return typeof text === "string" ? {
          text,
          request_poll
        } : {
          ...text,
          request_poll
        };
      }
      requestManagedBot(text, requestId, options = {}) {
        return this.add(_Keyboard.requestManagedBot(text, requestId, options));
      }
      static requestManagedBot(text, requestId, options = {}) {
        const request_managed_bot = {
          request_id: requestId,
          ...options
        };
        return typeof text === "string" ? {
          text,
          request_managed_bot
        } : {
          ...text,
          request_managed_bot
        };
      }
      webApp(text, url) {
        return this.add(_Keyboard.webApp(text, url));
      }
      static webApp(text, url) {
        const web_app = {
          url
        };
        return typeof text === "string" ? {
          text,
          web_app
        } : {
          ...text,
          web_app
        };
      }
      style(style) {
        const rows = this.keyboard.length;
        if (rows === 0) {
          throw new Error("Need to add a button before applying a style!");
        }
        const lastRow = this.keyboard[rows - 1];
        const cols = lastRow.length;
        if (cols === 0) {
          throw new Error("Need to add a button before applying a style!");
        }
        let lastButton = lastRow[cols - 1];
        if (typeof lastButton === "string") {
          lastButton = {
            text: lastButton
          };
          lastRow[cols - 1] = lastButton;
        }
        lastButton.style = style;
        return this;
      }
      danger() {
        return this.style("danger");
      }
      success() {
        return this.style("success");
      }
      primary() {
        return this.style("primary");
      }
      icon(icon) {
        const rows = this.keyboard.length;
        if (rows === 0) {
          throw new Error("Need to add a button before adding an icon!");
        }
        const lastRow = this.keyboard[rows - 1];
        const cols = lastRow.length;
        if (cols === 0) {
          throw new Error("Need to add a button before adding an icon!");
        }
        let lastButton = lastRow[cols - 1];
        if (typeof lastButton === "string") {
          lastButton = {
            text: lastButton
          };
          lastRow[cols - 1] = lastButton;
        }
        lastButton.icon_custom_emoji_id = icon;
        return this;
      }
      persistent(isEnabled = true) {
        this.is_persistent = isEnabled;
        return this;
      }
      selected(isEnabled = true) {
        this.selective = isEnabled;
        return this;
      }
      oneTime(isEnabled = true) {
        this.one_time_keyboard = isEnabled;
        return this;
      }
      resized(isEnabled = true) {
        this.resize_keyboard = isEnabled;
        return this;
      }
      placeholder(value) {
        this.input_field_placeholder = value;
        return this;
      }
      toTransposed() {
        const original = this.keyboard;
        const transposed = transpose(original);
        return this.clone(transposed);
      }
      toFlowed(columns, options = {}) {
        const original = this.keyboard;
        const flowed = reflow(original, columns, options);
        return this.clone(flowed);
      }
      clone(keyboard = this.keyboard) {
        const clone = new _Keyboard(keyboard.map((row) => row.slice()));
        clone.is_persistent = this.is_persistent;
        clone.selective = this.selective;
        clone.one_time_keyboard = this.one_time_keyboard;
        clone.resize_keyboard = this.resize_keyboard;
        clone.input_field_placeholder = this.input_field_placeholder;
        return clone;
      }
      append(...sources) {
        for (const source of sources) {
          const keyboard = _Keyboard.from(source);
          this.keyboard.push(...keyboard.keyboard.map((row) => row.slice()));
        }
        return this;
      }
      build() {
        return this.keyboard;
      }
      static from(source) {
        if (source instanceof _Keyboard) return source.clone();
        function toButton(btn) {
          return typeof btn === "string" ? _Keyboard.text(btn) : btn;
        }
        __name(toButton, "toButton");
        return new _Keyboard(source.map((row) => row.map(toButton)));
      }
    };
    InlineKeyboard = class _InlineKeyboard {
      static {
        __name(this, "InlineKeyboard");
      }
      inline_keyboard;
      constructor(inline_keyboard = [
        []
      ]) {
        this.inline_keyboard = inline_keyboard;
      }
      add(...buttons) {
        this.inline_keyboard[this.inline_keyboard.length - 1]?.push(...buttons);
        return this;
      }
      row(...buttons) {
        this.inline_keyboard.push(buttons);
        return this;
      }
      url(text, url) {
        return this.add(_InlineKeyboard.url(text, url));
      }
      static url(text, url) {
        return typeof text === "string" ? {
          text,
          url
        } : {
          ...text,
          url
        };
      }
      text(text, data = typeof text === "string" ? text : text.text) {
        return this.add(_InlineKeyboard.text(text, data));
      }
      static text(text, data = typeof text === "string" ? text : text.text) {
        return typeof text === "string" ? {
          text,
          callback_data: data
        } : {
          ...text,
          callback_data: data
        };
      }
      webApp(text, url) {
        return this.add(_InlineKeyboard.webApp(text, url));
      }
      static webApp(text, url) {
        const web_app = typeof url === "string" ? {
          url
        } : url;
        return typeof text === "string" ? {
          text,
          web_app
        } : {
          ...text,
          web_app
        };
      }
      login(text, loginUrl) {
        return this.add(_InlineKeyboard.login(text, loginUrl));
      }
      static login(text, loginUrl) {
        const login_url = typeof loginUrl === "string" ? {
          url: loginUrl
        } : loginUrl;
        return typeof text === "string" ? {
          text,
          login_url
        } : {
          ...text,
          login_url
        };
      }
      switchInline(text, query = "") {
        return this.add(_InlineKeyboard.switchInline(text, query));
      }
      static switchInline(text, query = "") {
        return typeof text === "string" ? {
          text,
          switch_inline_query: query
        } : {
          ...text,
          switch_inline_query: query
        };
      }
      switchInlineCurrent(text, query = "") {
        return this.add(_InlineKeyboard.switchInlineCurrent(text, query));
      }
      static switchInlineCurrent(text, query = "") {
        return typeof text === "string" ? {
          text,
          switch_inline_query_current_chat: query
        } : {
          ...text,
          switch_inline_query_current_chat: query
        };
      }
      switchInlineChosen(text, query = {}) {
        return this.add(_InlineKeyboard.switchInlineChosen(text, query));
      }
      static switchInlineChosen(text, query = {}) {
        return typeof text === "string" ? {
          text,
          switch_inline_query_chosen_chat: query
        } : {
          ...text,
          switch_inline_query_chosen_chat: query
        };
      }
      copyText(text, copyText) {
        return this.add(_InlineKeyboard.copyText(text, copyText));
      }
      static copyText(text, copyText) {
        const copy_text = typeof copyText === "string" ? {
          text: copyText
        } : copyText;
        return typeof text === "string" ? {
          text,
          copy_text
        } : {
          ...text,
          copy_text
        };
      }
      game(text) {
        return this.add(_InlineKeyboard.game(text));
      }
      static game(text) {
        const callback_game = {};
        return typeof text === "string" ? {
          text,
          callback_game
        } : {
          ...text,
          callback_game
        };
      }
      pay(text) {
        return this.add(_InlineKeyboard.pay(text));
      }
      static pay(text) {
        return typeof text === "string" ? {
          text,
          pay: true
        } : {
          ...text,
          pay: true
        };
      }
      style(style) {
        const rows = this.inline_keyboard.length;
        if (rows === 0) {
          throw new Error("Need to add a button before applying a style!");
        }
        const lastRow = this.inline_keyboard[rows - 1];
        const cols = lastRow.length;
        if (cols === 0) {
          throw new Error("Need to add a button before applying a style!");
        }
        lastRow[cols - 1].style = style;
        return this;
      }
      danger() {
        return this.style("danger");
      }
      success() {
        return this.style("success");
      }
      primary() {
        return this.style("primary");
      }
      icon(icon) {
        const rows = this.inline_keyboard.length;
        if (rows === 0) {
          throw new Error("Need to add a button before adding an icon!");
        }
        const lastRow = this.inline_keyboard[rows - 1];
        const cols = lastRow.length;
        if (cols === 0) {
          throw new Error("Need to add a button before adding an icon!");
        }
        lastRow[cols - 1].icon_custom_emoji_id = icon;
        return this;
      }
      toTransposed() {
        const original = this.inline_keyboard;
        const transposed = transpose(original);
        return new _InlineKeyboard(transposed);
      }
      toFlowed(columns, options = {}) {
        const original = this.inline_keyboard;
        const flowed = reflow(original, columns, options);
        return new _InlineKeyboard(flowed);
      }
      clone() {
        return new _InlineKeyboard(this.inline_keyboard.map((row) => row.slice()));
      }
      append(...sources) {
        for (const source of sources) {
          const keyboard = _InlineKeyboard.from(source);
          this.inline_keyboard.push(...keyboard.inline_keyboard.map((row) => row.slice()));
        }
        return this;
      }
      static from(source) {
        if (source instanceof _InlineKeyboard) return source.clone();
        return new _InlineKeyboard(source.map((row) => row.slice()));
      }
    };
    __name(transpose, "transpose");
    __name(reflow, "reflow");
    debug3 = browser$1("grammy:session");
    __name(session, "session");
    __name(strictSingleSession, "strictSingleSession");
    __name(strictMultiSession, "strictMultiSession");
    __name(lazySession, "lazySession");
    PropertySession = class {
      static {
        __name(this, "PropertySession");
      }
      storage;
      obj;
      prop;
      initial;
      key;
      value;
      promise;
      fetching;
      read;
      wrote;
      constructor(storage, obj, prop, initial) {
        this.storage = storage;
        this.obj = obj;
        this.prop = prop;
        this.initial = initial;
        this.fetching = false;
        this.read = false;
        this.wrote = false;
      }
      load() {
        if (this.key === void 0) {
          return;
        }
        if (this.wrote) {
          return;
        }
        if (this.promise === void 0) {
          this.fetching = true;
          this.promise = Promise.resolve(this.storage.read(this.key)).then((val) => {
            this.fetching = false;
            if (this.wrote) {
              return this.value;
            }
            if (val !== void 0) {
              this.value = val;
              return val;
            }
            val = this.initial?.();
            if (val !== void 0) {
              this.wrote = true;
              this.value = val;
            }
            return val;
          });
        }
        return this.promise;
      }
      async init(key, opts) {
        this.key = key;
        if (!opts.lazy) await this.load();
        Object.defineProperty(this.obj, this.prop, {
          enumerable: true,
          get: /* @__PURE__ */ __name(() => {
            if (key === void 0) {
              const msg = undef("access", opts);
              throw new Error(msg);
            }
            this.read = true;
            if (!opts.lazy || this.wrote) return this.value;
            this.load();
            return this.fetching ? this.promise : this.value;
          }, "get"),
          set: /* @__PURE__ */ __name((v) => {
            if (key === void 0) {
              const msg = undef("assign", opts);
              throw new Error(msg);
            }
            this.wrote = true;
            this.fetching = false;
            this.value = v;
          }, "set")
        });
      }
      delete() {
        Object.assign(this.obj, {
          [this.prop]: void 0
        });
      }
      async finish() {
        if (this.key !== void 0) {
          if (this.read) await this.load();
          if (this.read || this.wrote) {
            const value = await this.value;
            if (value == null) await this.storage.delete(this.key);
            else await this.storage.write(this.key, value);
          }
        }
      }
    };
    __name(fillDefaults, "fillDefaults");
    __name(defaultGetSessionKey, "defaultGetSessionKey");
    __name(undef, "undef");
    __name(isEnhance, "isEnhance");
    __name(enhanceStorage, "enhanceStorage");
    __name(compatStorage, "compatStorage");
    __name(timeoutStorage, "timeoutStorage");
    __name(migrationStorage, "migrationStorage");
    __name(wrapStorage, "wrapStorage");
    MemorySessionStorage = class {
      static {
        __name(this, "MemorySessionStorage");
      }
      timeToLive;
      storage;
      constructor(timeToLive) {
        this.timeToLive = timeToLive;
        this.storage = /* @__PURE__ */ new Map();
      }
      read(key) {
        const value = this.storage.get(key);
        if (value === void 0) return void 0;
        if (value.expires !== void 0 && value.expires < Date.now()) {
          this.delete(key);
          return void 0;
        }
        return value.session;
      }
      readAll() {
        return this.readAllValues();
      }
      readAllKeys() {
        return Array.from(this.storage.keys());
      }
      readAllValues() {
        return Array.from(this.storage.keys()).map((key) => this.read(key)).filter((value) => value !== void 0);
      }
      readAllEntries() {
        return Array.from(this.storage.keys()).map((key) => [
          key,
          this.read(key)
        ]).filter((pair) => pair[1] !== void 0);
      }
      has(key) {
        return this.storage.has(key);
      }
      write(key, value) {
        this.storage.set(key, addExpiryDate(value, this.timeToLive));
      }
      delete(key) {
        this.storage.delete(key);
      }
    };
    __name(addExpiryDate, "addExpiryDate");
    SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token";
    SECRET_HEADER_LOWERCASE = SECRET_HEADER.toLowerCase();
    WRONG_TOKEN_ERROR = "secret token is wrong";
    ok = /* @__PURE__ */ __name(() => new Response(null, {
      status: 200
    }), "ok");
    okJson = /* @__PURE__ */ __name((json) => new Response(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }), "okJson");
    unauthorized = /* @__PURE__ */ __name(() => new Response('"unauthorized"', {
      status: 401,
      statusText: WRONG_TOKEN_ERROR
    }), "unauthorized");
    awsLambda = /* @__PURE__ */ __name((event, _context, callback) => ({
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
    awsLambdaAsync = /* @__PURE__ */ __name((event, _context) => {
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
    azure = /* @__PURE__ */ __name((context, request) => ({
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
    azureV4 = /* @__PURE__ */ __name((request) => {
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
    bun = /* @__PURE__ */ __name((request) => {
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
    cloudflare = /* @__PURE__ */ __name((event) => {
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
    cloudflareModule = /* @__PURE__ */ __name((request) => {
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
    express = /* @__PURE__ */ __name((req, res) => ({
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
    fastify = /* @__PURE__ */ __name((request, reply) => ({
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
    hono = /* @__PURE__ */ __name((c) => {
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
    http = /* @__PURE__ */ __name((req, res) => {
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
    koa = /* @__PURE__ */ __name((ctx) => ({
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
    nextJs = /* @__PURE__ */ __name((request, response) => ({
      get update() {
        return request.body;
      },
      header: request.headers[SECRET_HEADER_LOWERCASE],
      end: /* @__PURE__ */ __name(() => response.end(), "end"),
      respond: /* @__PURE__ */ __name((json) => response.status(200).json(json), "respond"),
      unauthorized: /* @__PURE__ */ __name(() => response.status(401).send(WRONG_TOKEN_ERROR), "unauthorized")
    }), "nextJs");
    nhttp = /* @__PURE__ */ __name((rev) => ({
      get update() {
        return rev.body;
      },
      header: rev.headers.get(SECRET_HEADER) || void 0,
      end: /* @__PURE__ */ __name(() => rev.response.sendStatus(200), "end"),
      respond: /* @__PURE__ */ __name((json) => rev.response.status(200).send(json), "respond"),
      unauthorized: /* @__PURE__ */ __name(() => rev.response.status(401).send(WRONG_TOKEN_ERROR), "unauthorized")
    }), "nhttp");
    oak = /* @__PURE__ */ __name((ctx) => ({
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
    serveHttp = /* @__PURE__ */ __name((requestEvent) => ({
      get update() {
        return requestEvent.request.json();
      },
      header: requestEvent.request.headers.get(SECRET_HEADER) || void 0,
      end: /* @__PURE__ */ __name(() => requestEvent.respondWith(ok()), "end"),
      respond: /* @__PURE__ */ __name((json) => requestEvent.respondWith(okJson(json)), "respond"),
      unauthorized: /* @__PURE__ */ __name(() => requestEvent.respondWith(unauthorized()), "unauthorized")
    }), "serveHttp");
    stdHttp = /* @__PURE__ */ __name((req) => {
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
    sveltekit = /* @__PURE__ */ __name(({ request }) => {
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
    worktop = /* @__PURE__ */ __name((req, res) => ({
      get update() {
        return req.json();
      },
      header: req.headers.get(SECRET_HEADER) ?? void 0,
      end: /* @__PURE__ */ __name(() => res.end(null), "end"),
      respond: /* @__PURE__ */ __name((json) => res.send(200, json), "respond"),
      unauthorized: /* @__PURE__ */ __name(() => res.send(401, WRONG_TOKEN_ERROR), "unauthorized")
    }), "worktop");
    elysia = /* @__PURE__ */ __name((ctx) => {
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
    adapters = {
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
    debugErr1 = browser$1("grammy:error");
    callbackAdapter = /* @__PURE__ */ __name((update, callback, header, unauthorized2 = () => callback('"unauthorized"')) => ({
      update: Promise.resolve(update),
      respond: callback,
      header,
      unauthorized: unauthorized2
    }), "callbackAdapter");
    adapters1 = {
      ...adapters,
      callback: callbackAdapter
    };
    __name(compareSecretToken, "compareSecretToken");
    __name(webhookCallback, "webhookCallback");
    __name(timeoutIfNecessary, "timeoutIfNecessary");
  }
});

// node_modules/@grammyjs/conversations/out/deps.node.js
var require_deps_node = __commonJS({
  "node_modules/@grammyjs/conversations/out/deps.node.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpError = exports.GrammyError = exports.Context = exports.Composer = exports.Api = void 0;
    var grammy_1 = (init_web(), __toCommonJS(web_exports));
    Object.defineProperty(exports, "Api", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return grammy_1.Api;
    }, "get") });
    Object.defineProperty(exports, "Composer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return grammy_1.Composer;
    }, "get") });
    Object.defineProperty(exports, "Context", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return grammy_1.Context;
    }, "get") });
    Object.defineProperty(exports, "GrammyError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return grammy_1.GrammyError;
    }, "get") });
    Object.defineProperty(exports, "HttpError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return grammy_1.HttpError;
    }, "get") });
  }
});

// node_modules/@grammyjs/conversations/out/form.js
var require_form = __commonJS({
  "node_modules/@grammyjs/conversations/out/form.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConversationForm = void 0;
    var ConversationForm = class {
      static {
        __name(this, "ConversationForm");
      }
      /** Constructs a new form based on wait and skip callbacks */
      constructor(conversation) {
        this.conversation = conversation;
      }
      async build(builder) {
        const { validate, action, otherwise, next, ...waitOptions } = builder;
        const ctx = await this.conversation.wait({
          collationKey: "form",
          ...waitOptions
        });
        const result = await validate(ctx);
        if (result.ok) {
          if (action !== void 0)
            await action(ctx, result.value);
          return result.value;
        } else {
          if (otherwise !== void 0) {
            if ("error" in result) {
              const callback = otherwise;
              const reason = result.error;
              await callback(ctx, reason);
            } else {
              const callback = otherwise;
              await callback(ctx);
            }
          }
          return await this.conversation.skip({ next });
        }
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with text, and returns this text as string. Does not check
       * for captions.
       *
       * Accepts an optional options object that lets you perform actions when
       * text is received, when a non-text update is received, and more.
       *
       * @param options Optional options
       */
      async text(options) {
        return await this.build({
          collationKey: "form-text",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const text = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.text;
            if (text === void 0)
              return { ok: false };
            return { ok: true, value: text };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with text that can be parsed to a number, and returns this
       * number. Does not check captions.
       *
       * The conversion to number uses `parseFloat`.
       *
       * Accepts an optional options object that lets you perform actions when a
       * number is received, when a non-number update is received, and more.
       *
       * @param options Optional options
       */
      async number(options) {
        return await this.build({
          collationKey: "form-number",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const text = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.text;
            if (text === void 0)
              return { ok: false };
            const num = parseFloat(text);
            if (isNaN(num))
              return { ok: false };
            return { ok: true, value: num };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with text that can be parsed to an integer, and returns this
       * integer as a `number`. Does not check for captions.
       *
       * The conversion to number uses `parseInt`.
       *
       * Accepts an optional options object that lets you specify the radix to use
       * as well as perform actions when a number is received, when a non-number
       * update is received, and more.
       *
       * @param options Optional options
       */
      async int(options) {
        const { radix, ...opts } = options !== null && options !== void 0 ? options : {};
        return await this.build({
          collationKey: "form-int",
          ...opts,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const text = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.text;
            if (text === void 0)
              return { ok: false };
            const num = parseInt(text, radix);
            if (isNaN(num))
              return { ok: false };
            return { ok: true, value: num };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with one of several predefined strings, and returns the
       * actual text as string. Does not check captions.
       *
       * This is especially useful when working with custom keyboards.
       *
       * ```ts
       * const keyboard = new Keyboard()
       *   .text("A").text("B")
       *   .text("C").text("D")
       *   .oneTime()
       * await ctx.reply("A, B, C, or D?", { reply_markup: keyboard })
       * const answer = await conversation.form.select(["A", "B", "C", "D"], {
       *   otherwise: ctx => ctx.reply("Please use one of the buttons!")
       * })
       * switch (answer) {
       *   case "A":
       *   case "B":
       *   case "C":
       *   case "D":
       *   // ...
       * }
       * ```
       *
       * Accepts an optional options object that lets you perform actions when
       * text is received, when a non-text update is received, and more.
       *
       * @param entries A string array of accepted values
       * @param options Optional options
       */
      async select(entries, options) {
        const e = entries;
        return await this.build({
          collationKey: "form-select",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const text = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.text;
            if (text === void 0)
              return { ok: false };
            if (!e.includes(text))
              return { ok: false };
            return { ok: true, value: text };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a given type of message entity, and returns this
       * entity. The form field relies on `ctx.entities()` for data extraction, so
       * both texts and captions are checked.
       *
       * Accepts an optional options object that lets you perform actions when
       * text is received, when a non-text update is received, and more.
       *
       * @param type One or more types of message entities to accept
       * @param options Optional options
       */
      async entity(type, options) {
        return await this.build({
          collationKey: "form-entity",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            const entities = ctx.entities(type);
            if (entities.length === 0)
              return { ok: false };
            return { ok: true, value: entities[0] };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with an animation, and returns the received animation
       * object.
       *
       * Accepts an optional options object that lets you perform actions when an
       * animation is received, when a non-animation update is received, and more.
       *
       * @param options Optional options
       */
      async animation(options) {
        return await this.build({
          collationKey: "form-animation",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const animation = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.animation;
            if (animation === void 0)
              return { ok: false };
            return { ok: true, value: animation };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with an audio message, and returns the received audio
       * object.
       *
       * Accepts an optional options object that lets you perform actions when an
       * audio message is received, when a non-audio update is received, and more.
       *
       * @param options Optional options
       */
      async audio(options) {
        return await this.build({
          collationKey: "form-audio",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const audio = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.audio;
            if (audio === void 0)
              return { ok: false };
            return { ok: true, value: audio };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a document message, and returns the received document
       * object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * document message is received, when a non-document update is received, and
       * more.
       *
       * @param options Optional options
       */
      async document(options) {
        return await this.build({
          collationKey: "form-document",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const document2 = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.document;
            if (document2 === void 0)
              return { ok: false };
            return { ok: true, value: document2 };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with paid media, and returns the received paid media object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * paid media message is received, when a non-paid media update is received,
       * and more.
       *
       * @param options Optional options
       */
      async paidMedia(options) {
        return await this.build({
          collationKey: "form-paid_media",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const paid_media = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.paid_media;
            if (paid_media === void 0)
              return { ok: false };
            return { ok: true, value: paid_media };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a photo, and returns the received array of `PhotoSize`
       * objects.
       *
       * Accepts an optional options object that lets you perform actions when a
       * photo is received, when a non-photo update is received, and more.
       *
       * @param options Optional options
       */
      async photo(options) {
        return await this.build({
          collationKey: "form-photo",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const photo = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.photo;
            if (photo === void 0)
              return { ok: false };
            return { ok: true, value: photo };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a sticker, and returns the received sticker object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * sticker is received, when a non-sticker update is received, and more.
       *
       * @param options Optional options
       */
      async sticker(options) {
        return await this.build({
          collationKey: "form-sticker",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const sticker = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.sticker;
            if (sticker === void 0)
              return { ok: false };
            return { ok: true, value: sticker };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a story, and returns the received story object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * story is received, when a non-story update is received, and more.
       *
       * @param options Optional options
       */
      async story(options) {
        return await this.build({
          collationKey: "form-story",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const story = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.story;
            if (story === void 0)
              return { ok: false };
            return { ok: true, value: story };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a video, and returns the received video object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * video is received, when a non-video update is received, and more.
       *
       * @param options Optional options
       */
      async video(options) {
        return await this.build({
          collationKey: "form-video",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const video = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.video;
            if (video === void 0)
              return { ok: false };
            return { ok: true, value: video };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a video note, and returns the received video note
       * object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * video note is received, when a non-video note update is received, and
       * more.
       *
       * @param options Optional options
       */
      async video_note(options) {
        return await this.build({
          collationKey: "form-video_note",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const video_note = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.video_note;
            if (video_note === void 0)
              return { ok: false };
            return { ok: true, value: video_note };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a voice message, and returns the received voice object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * voice message is received, when a non-voice message update is received,
       * and more.
       *
       * @param options Optional options
       */
      async voice(options) {
        return await this.build({
          collationKey: "form-voice",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const voice = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.voice;
            if (voice === void 0)
              return { ok: false };
            return { ok: true, value: voice };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a contact, and returns the received contact object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * contact is received, when a non-contact update is received, and more.
       *
       * @param options Optional options
       */
      async contact(options) {
        return await this.build({
          collationKey: "form-contact",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const contact = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.contact;
            if (contact === void 0)
              return { ok: false };
            return { ok: true, value: contact };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with dice, and returns the received dice object.
       *
       * Accepts an optional options object that lets you perform actions when
       * dice are received, when a non-dice update is received, and more.
       *
       * @param options Optional options
       */
      async dice(options) {
        return await this.build({
          collationKey: "form-dice",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const dice = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.dice;
            if (dice === void 0)
              return { ok: false };
            return { ok: true, value: dice };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a game, and returns the received game object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * game is received, when a non-game update is received, and more.
       *
       * @param options Optional options
       */
      async game(options) {
        return await this.build({
          collationKey: "form-game",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const game = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.game;
            if (game === void 0)
              return { ok: false };
            return { ok: true, value: game };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a poll, and returns the received poll object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * poll is received, when a non-poll update is received, and more.
       *
       * @param options Optional options
       */
      async poll(options) {
        return await this.build({
          collationKey: "form-poll",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const poll = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.poll;
            if (poll === void 0)
              return { ok: false };
            return { ok: true, value: poll };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a venue, and returns the received venue object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * venue is received, when a non-venue update is received, and more.
       *
       * @param options Optional options
       */
      async venue(options) {
        return await this.build({
          collationKey: "form-venue",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const venue = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.venue;
            if (venue === void 0)
              return { ok: false };
            return { ok: true, value: venue };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a location, and returns the received location object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * location is received, when a non-location update is received, and more.
       *
       * @param options Optional options
       */
      async location(options) {
        return await this.build({
          collationKey: "form-location",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const location = (_b = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost) === null || _b === void 0 ? void 0 : _b.location;
            if (location === void 0)
              return { ok: false };
            return { ok: true, value: location };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a photo or video, and returns the received media
       * object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * media is received, when a non-media update is received, and more.
       *
       * @param options Optional options
       */
      async media(options) {
        return await this.build({
          collationKey: "form-location",
          ...options,
          validate: /* @__PURE__ */ __name((ctx) => {
            var _a, _b;
            const msg = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost;
            const media = (_b = msg === null || msg === void 0 ? void 0 : msg.photo) !== null && _b !== void 0 ? _b : msg === null || msg === void 0 ? void 0 : msg.video;
            if (media === void 0)
              return { ok: false };
            return { ok: true, value: media };
          }, "validate")
        });
      }
      /**
       * Form field that checks if the incoming update contains a message or
       * channel post with a file, calls `await ctx.getFile()`, and returns the
       * received file object.
       *
       * Accepts an optional options object that lets you perform actions when a
       * file is received, when a non-file update is received, and more.
       *
       * @param options Optional options
       */
      async file(options) {
        return await this.build({
          collationKey: "form-location",
          ...options,
          validate: /* @__PURE__ */ __name(async (ctx) => {
            if (!ctx.has(":file"))
              return { ok: false };
            const file = await ctx.getFile();
            return { ok: true, value: file };
          }, "validate")
        });
      }
    };
    exports.ConversationForm = ConversationForm;
  }
});

// node_modules/@grammyjs/conversations/out/nope.js
var require_nope = __commonJS({
  "node_modules/@grammyjs/conversations/out/nope.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.youTouchYouDie = youTouchYouDie;
    function youTouchYouDie(msg) {
      function nope() {
        throw new Error(msg);
      }
      __name(nope, "nope");
      return new Proxy({}, {
        apply: nope,
        construct: nope,
        defineProperty: nope,
        deleteProperty: nope,
        get: nope,
        getOwnPropertyDescriptor: nope,
        getPrototypeOf: nope,
        has: nope,
        isExtensible: nope,
        ownKeys: nope,
        preventExtensions: nope,
        set: nope,
        setPrototypeOf: nope
      });
    }
    __name(youTouchYouDie, "youTouchYouDie");
  }
});

// node_modules/@grammyjs/conversations/out/menu.js
var require_menu = __commonJS({
  "node_modules/@grammyjs/conversations/out/menu.js"(exports) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConversationMenu = exports.ConversationMenuRange = exports.ConversationMenuPool = void 0;
    var deps_node_js_1 = require_deps_node();
    var nope_js_1 = require_nope();
    var b = 255;
    var toNums = /* @__PURE__ */ __name((str2) => Array.from(str2).map((c) => c.codePointAt(0)), "toNums");
    var dec = new TextDecoder();
    function tinyHash(nums) {
      let hash = 17;
      for (const n of nums)
        hash = (hash << 5) + (hash << 2) + hash + n >>> 0;
      const bytes = [hash >>> 24, hash >> 16 & b, hash >> 8 & b, hash & b];
      return dec.decode(Uint8Array.from(bytes));
    }
    __name(tinyHash, "tinyHash");
    var ops = /* @__PURE__ */ Symbol("conversation menu building operations");
    var opts = /* @__PURE__ */ Symbol("conversation menu building options");
    var INJECT_METHODS = /* @__PURE__ */ new Set([
      "editMessageText",
      "editMessageCaption",
      "editMessageMedia",
      "editMessageReplyMarkup",
      "stopPoll"
    ]);
    var ConversationMenuPool = class {
      static {
        __name(this, "ConversationMenuPool");
      }
      constructor() {
        this.index = /* @__PURE__ */ new Map();
        this.dirty = /* @__PURE__ */ new Map();
      }
      /**
       * Marks a menu as dirty. When an API call will be performed that edits the
       * specified message, the given menu will be injected into the payload. If
       * no such API happens while processing an update, the all dirty menus will
       * be updated eagerly using `editMessageReplyMarkup`.
       *
       * @param chat_id The chat identifier of the menu
       * @param message_id The message identifier of the menu
       * @param menu The menu to inject into a payload
       */
      markMenuAsDirty(chat_id, message_id, menu) {
        let chat = this.dirty.get(chat_id);
        if (chat === void 0) {
          chat = /* @__PURE__ */ new Map();
          this.dirty.set(chat_id, chat);
        }
        chat.set(message_id, { menu });
      }
      /**
       * Looks up a dirty menu, returns it, and marks it as clean. Returns
       * undefined if the given message does not have a menu that is marked as
       * dirty.
       *
       * @param chat_id The chat identifier of the menu
       * @param message_id The message identifier of the menu
       */
      getAndClearDirtyMenu(chat_id, message_id) {
        const chat = this.dirty.get(chat_id);
        if (chat === void 0)
          return void 0;
        const message = chat.get(message_id);
        chat.delete(message_id);
        if (chat.size === 0)
          this.dirty.delete(chat_id);
        return message === null || message === void 0 ? void 0 : message.menu;
      }
      /**
       * Creates a new conversational menu with the given identifier and options.
       *
       * If no identifier is specified, an identifier will be auto-generated. This
       * identifier is guaranteed not to clash with any outside menu identifiers
       * used by [the menu plugin](https://grammy.dev/plugins/menu). In contrast,
       * if an identifier is passed that coincides with the identifier of a menu
       * outside the conversation, menu compatibility can be achieved.
       *
       * @param id An optional menu identifier
       * @param options An optional options object
       */
      create(id, options) {
        if (id === void 0) {
          id = createId(this.index.size);
        } else if (id.includes("/")) {
          throw new Error(`You cannot use '/' in a menu identifier ('${id}')`);
        }
        const menu = new ConversationMenu(id, options);
        this.index.set(id, menu);
        return menu;
      }
      /**
       * Looks up a menu by its identifier and returns the menu. Throws an error
       * if the identifier cannot be found.
       *
       * @param id The menu identifier to look up
       */
      lookup(id) {
        const idString = typeof id === "string" ? id : id.id;
        const menu = this.index.get(idString);
        if (menu === void 0) {
          const validIds = Array.from(this.index.keys()).map((k) => `'${k}'`).join(", ");
          throw new Error(`Menu '${idString}' is not known! Known menus are: ${validIds}`);
        }
        return menu;
      }
      /**
       * Prepares a context object for supporting conversational menus. Returns a
       * function to handle clicks.
       *
       * @param ctx The context object to prepare
       */
      install(ctx) {
        const render = /* @__PURE__ */ __name(async (id2) => {
          const self2 = this.index.get(id2);
          if (self2 === void 0)
            throw new Error("should never happen");
          const renderer = createDisplayRenderer(id2, ctx);
          const rendered = await renderer(self2[ops]);
          const fingerprint = await uniform(ctx, self2[opts].fingerprint);
          appendHashes(rendered, fingerprint);
          return rendered;
        }, "render");
        const prepare = /* @__PURE__ */ __name(async (payload2) => {
          if (payload2.reply_markup instanceof ConversationMenu) {
            const rendered = await render(payload2.reply_markup.id);
            payload2.reply_markup = { inline_keyboard: rendered };
          }
        }, "prepare");
        ctx.api.config.use(
          // Install a transformer that watches all outgoing payloads for menus
          async (prev, method, payload2, signal) => {
            const p = payload2;
            if (p !== void 0) {
              if (Array.isArray(p.results)) {
                await Promise.all(p.results.map((r) => prepare(r)));
              } else {
                await prepare(p);
              }
            }
            return await prev(method, payload2, signal);
          },
          // Install a transformer that injects dirty menus into API calls
          async (prev, method, payload2, signal) => {
            if (INJECT_METHODS.has(method) && !("reply_markup" in payload2) && "chat_id" in payload2 && payload2.chat_id !== void 0 && "message_id" in payload2 && payload2.message_id !== void 0) {
              Object.assign(payload2, {
                reply_markup: this.getAndClearDirtyMenu(payload2.chat_id, payload2.message_id)
              });
            }
            return await prev(method, payload2, signal);
          }
        );
        const skip = { handleClicks: /* @__PURE__ */ __name(() => Promise.resolve({ next: true }), "handleClicks") };
        if (!ctx.has("callback_query:data"))
          return skip;
        const data = ctx.callbackQuery.data;
        const parsed = parseId(data);
        if (parsed === void 0)
          return skip;
        const { id, parts } = parsed;
        if (parts.length < 4)
          return skip;
        const [rowStr, colStr, payload, ...rest] = parts;
        const [type, ...h2] = rest.join("/");
        const hash = h2.join("");
        if (!rowStr || !colStr)
          return skip;
        if (type !== "h" && type !== "f")
          return skip;
        const menu = this.index.get(id);
        if (menu === void 0)
          return skip;
        const row = parseInt(rowStr, 16);
        const col = parseInt(colStr, 16);
        if (row < 0 || col < 0) {
          const msg = `Invalid button position '${rowStr}/${colStr}'`;
          throw new Error(msg);
        }
        if (payload)
          ctx.match = payload;
        const nav = /* @__PURE__ */ __name(async ({ immediate } = {}, menu2) => {
          const chat = ctx.chatId;
          if (chat === void 0) {
            throw new Error("This update does not belong to a chat, so you cannot use this context object to send a menu");
          }
          const message = ctx.msgId;
          if (message === void 0) {
            throw new Error("This update does not contain a message, so you cannot use this context object to send a menu");
          }
          this.markMenuAsDirty(chat, message, menu2);
          if (immediate)
            await ctx.editMessageReplyMarkup();
        }, "nav");
        return {
          handleClicks: /* @__PURE__ */ __name(async () => {
            const controls = {
              update: /* @__PURE__ */ __name((config2) => nav(config2, menu), "update"),
              close: /* @__PURE__ */ __name((config2) => nav(config2, void 0), "close"),
              nav: /* @__PURE__ */ __name((to, config2) => nav(config2, this.lookup(to)), "nav"),
              back: /* @__PURE__ */ __name(async (config2) => {
                const p = menu[opts].parent;
                if (p === void 0) {
                  throw new Error(`Menu ${menu.id} has no parent!`);
                }
                await nav(config2, this.lookup(p));
              }, "back")
            };
            Object.assign(ctx, { menu: controls });
            const mctx = ctx;
            const menuIsOutdated = /* @__PURE__ */ __name(async () => {
              console.error(`conversational menu '${id}' was outdated!`);
              console.error(new Error("trace").stack);
              await Promise.all([
                ctx.answerCallbackQuery(),
                ctx.editMessageReplyMarkup()
              ]);
            }, "menuIsOutdated");
            const fingerprint = await uniform(ctx, menu[opts].fingerprint);
            const useFp = fingerprint !== "";
            if (useFp !== (type === "f")) {
              await menuIsOutdated();
              return { next: false };
            }
            if (useFp && tinyHash(toNums(fingerprint)) !== hash) {
              await menuIsOutdated();
              return { next: false };
            }
            const renderer = createHandlerRenderer(ctx);
            const range = await renderer(menu[ops]);
            if (!useFp && (row >= range.length || col >= range[row].length)) {
              await menuIsOutdated();
              return { next: false };
            }
            const btn = range[row][col];
            if (!("middleware" in btn)) {
              if (!useFp) {
                await menuIsOutdated();
                return { next: false };
              }
              throw new Error(`Cannot invoke handlers because menu '${id}' is outdated!`);
            }
            if (!useFp) {
              const rowCount = range.length;
              const rowLengths = range.map((row2) => row2.length);
              const label = await uniform(ctx, btn.text);
              const data2 = [rowCount, ...rowLengths, ...toNums(label)];
              const expectedHash = tinyHash(data2);
              if (hash !== expectedHash) {
                await menuIsOutdated();
                return { next: false };
              }
            }
            const c = new deps_node_js_1.Composer();
            if (menu[opts].autoAnswer) {
              c.fork((ctx2) => ctx2.answerCallbackQuery());
            }
            c.use(...btn.middleware);
            let next = false;
            await c.middleware()(mctx, () => {
              next = true;
              return Promise.resolve();
            });
            const dirtyChats = Array.from(this.dirty.entries());
            await Promise.all(dirtyChats.flatMap(([chat, messages]) => Array.from(messages.keys()).map((message) => ctx.api.editMessageReplyMarkup(chat, message))));
            return { next };
          }, "handleClicks")
        };
      }
    };
    exports.ConversationMenuPool = ConversationMenuPool;
    function createId(size) {
      return `//${size.toString(36)}`;
    }
    __name(createId, "createId");
    function parseId(data) {
      if (data.startsWith("//")) {
        const [id, ...parts] = data.substring(2).split("/");
        if (!id || isNaN(parseInt(id, 36)))
          return void 0;
        return { id: "//" + id, parts };
      } else {
        const [id, ...parts] = data.split("/");
        if (id === void 0)
          return void 0;
        return { id, parts };
      }
    }
    __name(parseId, "parseId");
    var ConversationMenuRange = class _ConversationMenuRange {
      static {
        __name(this, "ConversationMenuRange");
      }
      constructor() {
        this[_a] = [];
      }
      /**
       * This method is used internally whenever a new range is added.
       *
       * @param range A range object or a two-dimensional array of menu buttons
       */
      addRange(...range) {
        this[ops].push(...range);
        return this;
      }
      /**
       * This method is used internally whenever new buttons are added. Adds the
       * buttons to the current row.
       *
       * @param btns Menu button object
       */
      add(...btns) {
        return this.addRange([btns]);
      }
      /**
       * Adds a 'line break'. Call this method to make sure that the next added
       * buttons will be on a new row.
       */
      row() {
        return this.addRange([[], []]);
      }
      /**
       * Adds a new URL button. Telegram clients will open the provided URL when
       * the button is pressed. Note that they will not notify your bot when that
       * happens, so you cannot react to this button.
       *
       * @param text The text to display
       * @param url HTTP or tg:// url to be opened when button is pressed. Links tg://user?id=<user_id> can be used to mention a user by their ID without using a username, if this is allowed by their privacy settings.
       */
      url(text, url) {
        return this.add({ text, url });
      }
      text(text, ...middleware) {
        return this.add(typeof text === "object" ? { ...text, middleware } : { text, middleware });
      }
      /**
       * Adds a new web app button, confer https://core.telegram.org/bots/webapps
       *
       * @param text The text to display
       * @param url An HTTPS URL of a Web App to be opened with additional data
       */
      webApp(text, url) {
        return this.add({ text, web_app: { url } });
      }
      /**
       * Adds a new login button. This can be used as a replacement for the
       * Telegram Login Widget. You must specify an HTTPS URL used to
       * automatically authorize the user.
       *
       * @param text The text to display
       * @param loginUrl The login URL as string or `LoginUrl` object
       */
      login(text, loginUrl) {
        return this.add({
          text,
          login_url: typeof loginUrl === "string" ? { url: loginUrl } : loginUrl
        });
      }
      /**
       * Adds a new inline query button. Telegram clients will let the user pick a
       * chat when this button is pressed. This will start an inline query. The
       * selected chat will be prefilled with the name of your bot. You may
       * provide a text that is specified along with it.
       *
       * Your bot will in turn receive updates for inline queries. You can listen
       * to inline query updates like this:
       *
       * ```ts
       * // Listen for specifc query
       * bot.inlineQuery('my-query', ctx => { ... })
       * // Listen for any query
       * bot.on('inline_query', ctx => { ... })
       * ```
       *
       * Technically, it is also possible to wait for an inline query inside the
       * conversation using `conversation.waitFor('inline_query')`. However,
       * updates about inline queries do not contain a chat identifier. Hence, it
       * is typically not possible to handle them inside a conversation, as
       * conversation data is stored per chat by default.
       *
       * @param text The text to display
       * @param query The (optional) inline query string to prefill
       */
      switchInline(text, query = "") {
        return this.add({ text, switch_inline_query: query });
      }
      /**
       * Adds a new inline query button that acts on the current chat. The
       * selected chat will be prefilled with the name of your bot. You may
       * provide a text that is specified along with it. This will start an inline
       * query.
       *
       * Your bot will in turn receive updates for inline queries. You can listen
       * to inline query updates like this:
       *
       * ```ts
       * // Listen for specifc query
       * bot.inlineQuery('my-query', ctx => { ... })
       * // Listen for any query
       * bot.on('inline_query', ctx => { ... })
       * ```
       *
       * Technically, it is also possible to wait for an inline query inside the
       * conversation using `conversation.waitFor('inline_query')`. However,
       * updates about inline queries do not contain a chat identifier. Hence, it
       * is typically not possible to handle them inside a conversation, as
       * conversation data is stored per chat by default.
       *
       * @param text The text to display
       * @param query The (optional) inline query string to prefill
       */
      switchInlineCurrent(text, query = "") {
        return this.add({ text, switch_inline_query_current_chat: query });
      }
      /**
       * Adds a new inline query button. Telegram clients will let the user pick a
       * chat when this button is pressed. This will start an inline query. The
       * selected chat will be prefilled with the name of your bot. You may
       * provide a text that is specified along with it.
       *
       * Your bot will in turn receive updates for inline queries. You can listen
       * to inline query updates like this:
       * ```ts
       * bot.on('inline_query', ctx => { ... })
       * ```
       *
       * Technically, it is also possible to wait for an inline query inside the
       * conversation using `conversation.waitFor('inline_query')`. However,
       * updates about inline queries do not contain a chat identifier. Hence, it
       * is typically not possible to handle them inside a conversation, as
       * conversation data is stored per chat by default.
       *
       * @param text The text to display
       * @param query The query object describing which chats can be picked
       */
      switchInlineChosen(text, query = {}) {
        return this.add({ text, switch_inline_query_chosen_chat: query });
      }
      /**
       * Adds a new copy text button. When clicked, the specified text will be
       * copied to the clipboard.
       *
       * @param text The text to display
       * @param copyText The text to be copied to the clipboard
       */
      copyText(text, copyText) {
        return this.add({
          text,
          copy_text: typeof copyText === "string" ? { text: copyText } : copyText
        });
      }
      /**
       * Adds a new game query button, confer
       * https://core.telegram.org/bots/api#games
       *
       * This type of button must always be the first button in the first row.
       *
       * @param text The text to display
       */
      game(text) {
        return this.add({ text, callback_game: {} });
      }
      /**
       * Adds a new payment button, confer
       * https://core.telegram.org/bots/api#payments
       *
       * This type of button must always be the first button in the first row and can only be used in invoice messages.
       *
       * @param text The text to display
       */
      pay(text) {
        return this.add({ text, pay: true });
      }
      submenu(text, menu, ...middleware) {
        return this.text(text, middleware.length === 0 ? (ctx) => ctx.menu.nav(menu) : (ctx, next) => (ctx.menu.nav(menu), next()), ...middleware);
      }
      back(text, ...middleware) {
        return this.text(text, middleware.length === 0 ? (ctx) => ctx.menu.back() : (ctx, next) => (ctx.menu.back(), next()), ...middleware);
      }
      /**
       * This is a dynamic way to initialize the conversational menu. A typical
       * use case is when you want to create an arbitrary conversational menu,
       * using the data from your database:
       *
       * ```ts
       * const menu = conversation.menu()
       * const data = await conversation.external(() => fetchDataFromDatabase())
       * menu.dynamic(ctx => data.reduce((range, entry) => range.text(entry)), new ConversationMenuRange())
       * await ctx.reply("Menu", { reply_markup: menu })
       * ```
       *
       * @param menuFactory Async menu factory function
       */
      dynamic(rangeBuilder) {
        return this.addRange(async (ctx) => {
          const range = new _ConversationMenuRange();
          const res = await rangeBuilder(ctx, range);
          if (res instanceof ConversationMenu) {
            throw new Error("Cannot use a `Menu` instance as a dynamic range, did you mean to return an instance of `MenuRange` instead?");
          }
          return res instanceof _ConversationMenuRange ? res : range;
        });
      }
      /**
       * Appends a given range to this range. This will effectively replay all
       * operations of the given range onto this range.
       *
       * @param range A potentially raw range
       */
      append(range) {
        if (range instanceof _ConversationMenuRange) {
          this[ops].push(...range[ops]);
          return this;
        } else
          return this.addRange(range);
      }
    };
    exports.ConversationMenuRange = ConversationMenuRange;
    _a = ops;
    var ConversationMenu = class extends ConversationMenuRange {
      static {
        __name(this, "ConversationMenu");
      }
      constructor(id, options = {}) {
        var _b, _c;
        super();
        this.id = id;
        this.inline_keyboard = (0, nope_js_1.youTouchYouDie)("Something went very wrong, how did you manage to run into this error?");
        this[opts] = {
          parent: options.parent,
          autoAnswer: (_b = options.autoAnswer) !== null && _b !== void 0 ? _b : true,
          fingerprint: (_c = options.fingerprint) !== null && _c !== void 0 ? _c : (() => "")
        };
      }
    };
    exports.ConversationMenu = ConversationMenu;
    function createRenderer(ctx, buttonTransformer) {
      async function layout(keyboard, range) {
        const k = await keyboard;
        const btns = typeof range === "function" ? await range(ctx) : range;
        if (btns instanceof ConversationMenuRange) {
          return btns[ops].reduce(layout, keyboard);
        }
        let first = true;
        for (const row of btns) {
          if (!first)
            k.push([]);
          const i = k.length - 1;
          for (const button of row) {
            const j = k[i].length;
            const btn = await buttonTransformer(button, i, j);
            k[i].push(btn);
          }
          first = false;
        }
        return k;
      }
      __name(layout, "layout");
      return (ops2) => ops2.reduce(layout, Promise.resolve([[]]));
    }
    __name(createRenderer, "createRenderer");
    function createDisplayRenderer(id, ctx) {
      return createRenderer(ctx, async (btn, i, j) => {
        const text = await uniform(ctx, btn.text);
        if ("url" in btn) {
          let { url, ...rest } = btn;
          url = await uniform(ctx, btn.url);
          return { ...rest, url, text };
        } else if ("middleware" in btn) {
          const row = i.toString(16);
          const col = j.toString(16);
          const payload = await uniform(ctx, btn.payload, "");
          if (payload.includes("/")) {
            throw new Error(`Could not render menu '${id}'! Payload must not contain a '/' character but was '${payload}'`);
          }
          return {
            callback_data: `${id}/${row}/${col}/${payload}/`,
            text
          };
        } else
          return { ...btn, text };
      });
    }
    __name(createDisplayRenderer, "createDisplayRenderer");
    function createHandlerRenderer(ctx) {
      return createRenderer(ctx, (btn) => btn);
    }
    __name(createHandlerRenderer, "createHandlerRenderer");
    function uniform(ctx, value, fallback = "") {
      if (value === void 0)
        return fallback;
      else if (typeof value === "function")
        return value(ctx);
      else
        return value;
    }
    __name(uniform, "uniform");
    function appendHashes(keyboard, fingerprint) {
      const lengths = [keyboard.length, ...keyboard.map((row) => row.length)];
      for (const row of keyboard) {
        for (const btn of row) {
          if ("callback_data" in btn) {
            let type;
            let data;
            if (fingerprint) {
              type = "f";
              data = toNums(fingerprint);
            } else {
              type = "h";
              data = [...lengths, ...toNums(btn.text)];
            }
            btn.callback_data += type + tinyHash(data);
          }
        }
      }
    }
    __name(appendHashes, "appendHashes");
  }
});

// node_modules/@grammyjs/conversations/out/conversation.js
var require_conversation = __commonJS({
  "node_modules/@grammyjs/conversations/out/conversation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Conversation = void 0;
    var deps_node_js_1 = require_deps_node();
    var form_js_1 = require_form();
    var menu_js_1 = require_menu();
    var Conversation2 = class {
      static {
        __name(this, "Conversation");
      }
      /**
       * Constructs a new conversation handle.
       *
       * This is called internally in order to construct the first argument for a
       * conversation builder function. You typically don't need to construct this
       * class yourself.
       *
       * @param controls Controls for the underlying replay engine
       * @param hydrate Context construction callback
       * @param escape Callback to support outside context objects in `external`
       * @param plugins Middleware to hydrate context objects
       * @param options Additional configuration options
       */
      constructor(controls, hydrate, escape, plugins, options) {
        this.controls = controls;
        this.hydrate = hydrate;
        this.escape = escape;
        this.options = options;
        this.insideExternal = false;
        this.menuPool = new menu_js_1.ConversationMenuPool();
        this.combineAnd = makeAndCombiner(this);
        this.form = new form_js_1.ConversationForm(this);
        this.plugins = Array.isArray(plugins) ? () => plugins : plugins;
      }
      /**
       * Waits for a new update and returns the corresponding context object as
       * soon as it arrives.
       *
       * Note that wait calls terminate the conversation function, save the state
       * of execution, and only resolve when the conversation is replayed. If this
       * is not obvious to you, it means that you probably should read [the
       * documentation of this plugin](https://grammy.dev/plugins/conversations)
       * in order to avoid common pitfalls.
       *
       * You can pass a timeout in the optional options object. This lets you
       * terminate the conversation automatically if the update arrives too late.
       *
       * @param options Optional options for wait timeouts etc
       */
      wait(options = {}) {
        if (this.insideExternal) {
          throw new Error("Cannot wait for updates from inside `external`, or concurrently to it! First return your data from `external` and then resume update handling using `wait` calls.");
        }
        const makeWait = /* @__PURE__ */ __name(async () => {
          var _a;
          const limit = "maxMilliseconds" in options ? options.maxMilliseconds : this.options.maxMillisecondsToWait;
          const key = (_a = options.collationKey) !== null && _a !== void 0 ? _a : "wait";
          const before = limit !== void 0 && await this.now();
          const update = await this.controls.interrupt(key);
          if (before !== false) {
            const after = await this.now();
            if (after - before >= limit) {
              await this.halt({ next: true });
            }
          }
          const ctx = this.hydrate(update);
          const { handleClicks } = this.menuPool.install(ctx);
          let pluginsCalledNext = false;
          const middleware = await this.plugins(this);
          await new deps_node_js_1.Composer(...middleware).middleware()(ctx, () => {
            pluginsCalledNext = true;
            return Promise.resolve();
          });
          if (!pluginsCalledNext)
            return await this.wait(options);
          const { next: menuCalledNext } = await handleClicks();
          if (!menuCalledNext)
            return await this.wait(options);
          return ctx;
        }, "makeWait");
        return this.combineAnd(makeWait());
      }
      waitUntil(predicate, opts = {}) {
        const makeWait = /* @__PURE__ */ __name(async () => {
          const { otherwise, next, ...waitOptions } = opts;
          const ctx = await this.wait({
            collationKey: "until",
            ...waitOptions
          });
          if (!await predicate(ctx)) {
            await (otherwise === null || otherwise === void 0 ? void 0 : otherwise(ctx));
            await this.skip(next === void 0 ? {} : { next });
          }
          return ctx;
        }, "makeWait");
        return this.combineAnd(makeWait());
      }
      /**
       * Performs a filtered wait call that is defined by a given negated
       * predicate. In other words, this method waits for an update, and calls
       * `skip` if the received context object passed validation performed by the
       * given predicate function. That is the exact same thigs as calling
       * {@link Conversation.waitUntil} but with the predicate function being
       * negated.
       *
       * If a context object is discarded (the predicate function returns `true`
       * for it), you can perform any action by specifying `otherwise` in the
       * options.
       *
       * ```ts
       * const ctx = await conversation.waitUnless(ctx => ctx.msg?.text?.endsWith("grammY"), {
       *   otherwise: ctx => ctx.reply("Send a message that does not end with grammY!")
       * })
       * ```
       *
       * You can combine calls to `waitUnless` with other filtered wait calls by
       * chaining them.
       *
       * ```ts
       * const ctx = await conversation.waitUnless(ctx => ctx.msg?.text?.endsWith("grammY"))
       *   .andFor("::hashtag")
       * ```
       *
       * @param predicate A predicate function to discard context objects
       * @param opts Optional options object
       */
      waitUnless(predicate, opts) {
        return this.combineAnd(this.waitUntil(async (ctx) => !await predicate(ctx), {
          collationKey: "unless",
          ...opts
        }));
      }
      /**
       * Performs a filtered wait call that is defined by a filter query. In other
       * words, this method waits for an update, and calls `skip` if the received
       * context object does not match the filter query. This uses the same logic
       * as `bot.on`.
       *
       * If a context object is discarded, you can perform any action by
       * specifying `otherwise` in the options.
       *
       * ```ts
       * const ctx = await conversation.waitFor(":text", {
       *   otherwise: ctx => ctx.reply("Please send a text message!")
       * })
       * // Type inference works:
       * const text = ctx.msg.text;
       * ```
       *
       * You can combine calls to `waitFor` with other filtered wait calls by
       * chaining them.
       *
       * ```ts
       * const ctx = await conversation.waitFor(":text").andFor("::hashtag")
       * ```
       *
       * @param query A filter query to match
       * @param opts Optional options object
       */
      waitFor(query, opts) {
        return this.combineAnd(this.waitUntil(deps_node_js_1.Context.has.filterQuery(query), {
          collationKey: Array.isArray(query) ? query.join(",") : query,
          ...opts
        }));
      }
      /**
       * Performs a filtered wait call that is defined by a hears filter. In other
       * words, this method waits for an update, and calls `skip` if the received
       * context object does not contain text that matches the given text or
       * regular expression. This uses the same logic as `bot.hears`.
       *
       * If a context object is discarded, you can perform any action by
       * specifying `otherwise` in the options.
       *
       * ```ts
       * const ctx = await conversation.waitForHears(["yes", "no"], {
       *   otherwise: ctx => ctx.reply("Please send yes or no!")
       * })
       * // Type inference works:
       * const answer = ctx.match
       * ```
       *
       * You can combine calls to `waitForHears` with other filtered wait calls by
       * chaining them. For instance, this can be used to only receive text from
       * text messages—not including channel posts or media captions.
       *
       * ```ts
       * const ctx = await conversation.waitForHears(["yes", "no"])
       *   .andFor("message:text")
       * const text = ctx.message.text
       * ```
       *
       * @param trigger The text to look for
       * @param opts Optional options object
       */
      waitForHears(trigger, opts) {
        return this.combineAnd(this.waitUntil(deps_node_js_1.Context.has.text(trigger), {
          collationKey: "hears",
          ...opts
        }));
      }
      /**
       * Performs a filtered wait call that is defined by a command filter. In
       * other words, this method waits for an update, and calls `skip` if the
       * received context object does not contain the expected command. This uses
       * the same logic as `bot.command`.
       *
       * If a context object is discarded, you can perform any action by
       * specifying `otherwise` in the options.
       *
       * ```ts
       * const ctx = await conversation.waitForCommand("start", {
       *   otherwise: ctx => ctx.reply("Please send /start!")
       * })
       * // Type inference works for deep links:
       * const args = ctx.match
       * ```
       *
       * You can combine calls to `waitForCommand` with other filtered wait calls
       * by chaining them. For instance, this can be used to only receive commands
       * from text messages—not including channel posts.
       *
       * ```ts
       * const ctx = await conversation.waitForCommand("start")
       *   .andFor("message")
       * ```
       *
       * @param command The command to look for
       * @param opts Optional options object
       */
      waitForCommand(command, opts) {
        return this.combineAnd(this.waitUntil(deps_node_js_1.Context.has.command(command), {
          collationKey: "command",
          ...opts
        }));
      }
      /**
       * Performs a filtered wait call that is defined by a reaction filter. In
       * other words, this method waits for an update, and calls `skip` if the
       * received context object does not contain the expected reaction update.
       * This uses the same logic as `bot.reaction`.
       *
       * If a context object is discarded, you can perform any action by
       * specifying `otherwise` in the options.
       *
       * ```ts
       * const ctx = await conversation.waitForReaction('👍', {
       *   otherwise: ctx => ctx.reply("Please upvote a message!")
       * })
       * // Type inference works:
       * const args = ctx.messageReaction
       * ```
       *
       * You can combine calls to `waitForReaction` with other filtered wait calls
       * by chaining them.
       *
       * ```ts
       * const ctx = await conversation.waitForReaction('👍')
       *   .andFrom(ADMIN_USER_ID)
       * ```
       *
       * @param reaction The reaction to look for
       * @param opts Optional options object
       */
      waitForReaction(reaction, opts) {
        return this.combineAnd(this.waitUntil(deps_node_js_1.Context.has.reaction(reaction), {
          collationKey: "reaction",
          ...opts
        }));
      }
      /**
       * Performs a filtered wait call that is defined by a callback query filter.
       * In other words, this method waits for an update, and calls `skip` if the
       * received context object does not contain the expected callback query
       * update. This uses the same logic as `bot.callbackQuery`.
       *
       * If a context object is discarded, you can perform any action by
       * specifying `otherwise` in the options.
       *
       * ```ts
       * const ctx = await conversation.waitForCallbackQuery(/button-\d+/, {
       *   otherwise: ctx => ctx.reply("Please click a button!")
       * })
       * // Type inference works:
       * const data = ctx.callbackQuery.data
       * ```
       *
       * You can combine calls to `waitForCallbackQuery` with other filtered wait
       * calls by chaining them.
       *
       * ```ts
       * const ctx = await conversation.waitForCallbackQuery('data')
       *   .andFrom(ADMIN_USER_ID)
       * ```
       *
       * @param trigger The string to look for in the payload
       * @param opts Optional options object
       */
      waitForCallbackQuery(trigger, opts) {
        return this.combineAnd(this.waitUntil(deps_node_js_1.Context.has.callbackQuery(trigger), {
          collationKey: "callback",
          ...opts
        }));
      }
      /**
       * Performs a filtered wait call that is defined by a game query filter. In
       * other words, this method waits for an update, and calls `skip` if the
       * received context object does not contain the expected game query update.
       * This uses the same logic as `bot.gameQuery`.
       *
       * If a context object is discarded, you can perform any action by
       * specifying `otherwise` in the options.
       *
       * ```ts
       * const ctx = await conversation.waitForGameQuery(/game-\d+/, {
       *   otherwise: ctx => ctx.reply("Please play a game!")
       * })
       * // Type inference works:
       * const data = ctx.callbackQuery.game_short_name
       * ```
       *
       * You can combine calls to `waitForGameQuery` with other filtered wait
       * calls by chaining them.
       *
       * ```ts
       * const ctx = await conversation.waitForGameQuery('data')
       *   .andFrom(ADMIN_USER_ID)
       * ```
       *
       * @param trigger The string to look for in the payload
       * @param opts Optional options object
       */
      waitForGameQuery(trigger, opts) {
        return this.combineAnd(this.waitUntil(deps_node_js_1.Context.has.gameQuery(trigger), {
          collationKey: "game",
          ...opts
        }));
      }
      /**
       * Performs a filtered wait call that is defined by a user-specific filter.
       * In other words, this method waits for an update, and calls `skip` if the
       * received context object was not triggered by the given user.
       *
       * If a context object is discarded, you can perform any action by
       * specifying `otherwise` in the options.
       *
       * ```ts
       * const ctx = await conversation.waitFrom(targetUser, {
       *   otherwise: ctx => ctx.reply("I did not mean you!")
       * })
       * // Type inference works:
       * const user = ctx.from.first_name
       * ```
       *
       * You can combine calls to `waitFrom` with other filtered wait calls by
       * chaining them.
       *
       * ```ts
       * const ctx = await conversation.waitFrom(targetUser).andFor(":text")
       * ```
       *
       * @param user The user or user identifer to look for
       * @param opts Optional options object
       */
      waitFrom(user, opts) {
        const id = typeof user === "number" ? user : user.id;
        return this.combineAnd(this.waitUntil((ctx) => {
          var _a;
          return ((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) === id;
        }, { collationKey: `from-${id}`, ...opts }));
      }
      /**
       * Performs a filtered wait call that is defined by a message reply. In
       * other words, this method waits for an update, and calls `skip` if the
       * received context object does not contain a reply to a given message.
       *
       * If a context object is discarded, you can perform any action by
       * specifying `otherwise` in the options.
       *
       * ```ts
       * const ctx = await conversation.waitForReplyTo(message, {
       *   otherwise: ctx => ctx.reply("Please reply to this message!", {
       *     reply_parameters: { message_id: message.message_id }
       *   })
       * })
       * // Type inference works:
       * const id = ctx.msg.message_id
       * ```
       *
       * You can combine calls to `waitForReplyTo` with other filtered wait calls
       * by chaining them.
       *
       * ```ts
       * const ctx = await conversation.waitForReplyTo(message).andFor(":text")
       * ```
       *
       * @param message_id The message identifer or object to look for in a reply
       * @param opts Optional options object
       */
      waitForReplyTo(message_id, opts) {
        const id = typeof message_id === "number" ? message_id : message_id.message_id;
        return this.combineAnd(this.waitUntil((ctx) => {
          var _a, _b, _c, _d;
          return ((_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.reply_to_message) === null || _b === void 0 ? void 0 : _b.message_id) === id || ((_d = (_c = ctx.channelPost) === null || _c === void 0 ? void 0 : _c.reply_to_message) === null || _d === void 0 ? void 0 : _d.message_id) === id;
        }, { collationKey: `reply-${id}`, ...opts }));
      }
      /**
       * Skips the current update. The current update is the update that was
       * received in the last wait call.
       *
       * In a sense, this will undo receiving an update. The replay logs will be
       * reset so it will look like the conversation had never received the update
       * in the first place. Note, however, that any API calls performs between
       * wait and skip are not going to be reversed. In particular, messages will
       * not be unsent.
       *
       * By default, skipping an update drops it. This means that no other
       * handlers (including downstream middleware) will run. However, if this
       * conversation is marked as parallel, skip will behave differently and
       * resume middleware execution by default. This is needed for other parallel
       * conversations with the same or a different identifier to receive the
       * update.
       *
       * This behavior can be overridden by passing `{ next: true }` or `{ next:
       * false }` to skip.
       *
       * If several wait calls are used concurrently inside the same conversation,
       * they will resolve one after another until one of them does not skip the
       * update. The conversation will only skip an update when all concurrent
       * wait calls skip the update. Specifying `next` for a skip call that is not
       * the final skip call has no effect.
       *
       * @param options Optional options to control middleware resumption
       */
      async skip(options = {}) {
        const next = "next" in options ? options.next : this.options.parallel;
        return await this.controls.cancel(next ? "skip" : "drop");
      }
      /**
       * Calls any exit handlers if installed, and then terminates the
       * conversation immediately. This method never returns.
       *
       * By default, this will consume the update. Pass `{ next: true }` to make
       * sure that downstream middleware is called.
       *
       * @param options Optional options to control middleware resumption
       */
      async halt(options = {}) {
        var _a, _b;
        await ((_b = (_a = this.options).onHalt) === null || _b === void 0 ? void 0 : _b.call(_a));
        return await this.controls.cancel(options.next ? "kill" : "halt");
      }
      /**
       * Creates a new checkpoint at the current point of the conversation.
       *
       * This checkpoint can be passed to `rewind` in order to go back in the
       * conversation and resume it from an earlier point.
       *
       * ```ts
       * const check = conversation.checkpoint();
       *
       * // Later:
       * await conversation.rewind(check);
       * ```
       */
      checkpoint() {
        return this.controls.checkpoint();
      }
      /**
       * Rewinds the conversation to a previous point and continues execution from
       * there. This point is specified by a checkpoint that can be created by
       * calling {@link Conversation.checkpoint}.
       *
       * ```ts
       * const check = conversation.checkpoint();
       *
       * // Later:
       * await conversation.rewind(check);
       * ```
       *
       * @param checkpoint A previously created checkpoint
       */
      async rewind(checkpoint) {
        return await this.controls.cancel(checkpoint);
      }
      /**
       * Runs a function outside of the replay engine. This provides a safe way to
       * perform side-effects such as database communication, disk operations,
       * session access, file downloads, requests to external APIs, randomness,
       * time-based functions, and more. **It requires any data obtained from the
       * outside to be serializable.**
       *
       * Remember that a conversation function is not executed like a normal
       * JavaScript function. Instead, it is often interrupted and replayed,
       * sometimes many times for the same update. If this is not obvious to you,
       * it means that you probably should read [the documentation of this
       * plugin](https://grammy.dev/plugins/conversations) in order to avoid
       * common pitfalls.
       *
       * For instance, if you want to access to your database, you only want to
       * read or write data once, rather than doing it once per replay. `external`
       * provides an escape hatch to this situation. You can wrap your database
       * call inside `external` to mark it as something that performs
       * side-effects. The replay engine inside the conversations plugin will then
       * make sure to only execute this operation once. This looks as follows.
       *
       * ```ts
       * // Read from database
       * const data = await conversation.external(async () => {
       *   return await readFromDatabase()
       * })
       *
       * // Write to database
       * await conversation.external(async () => {
       *   await writeToDatabase(data)
       * })
       * ```
       *
       * When `external` is called, it returns whichever data the given callback
       * function returns. Note that this data has to be persisted by the plugin,
       * so you have to make sure that it can be serialized. The data will be
       * stored in the storage backend you provided when installing the
       * conversations plugin via `bot.use`. In particular, it does not work well
       * to return objects created by an ORM, as these objects have functions
       * installed on them which will be lost during serialization.
       *
       * As a rule of thumb, imagine that all data from `external` is passed
       * through `JSON.parse(JSON.stringify(data))` (even though this is not what
       * actually happens under the hood).
       *
       * The callback function passed to `external` receives the outside context
       * object from the current middleware pass. This lets you access properties
       * on the context object that are only present in the outside middleware
       * system, but that have not been installed on the context objects inside a
       * conversation. For example, you can access your session data this way.
       *
       * ```ts
       * // Read from session
       * const data = await conversation.external((ctx) => {
       *   return ctx.session.data
       * })
       *
       * // Write to session
       * await conversation.external((ctx) => {
       *   ctx.session.data = data
       * })
       * ```
       *
       * Note that while a call to `external` is running, you cannot do any of the
       * following things.
       *
       * - start a concurrent call to `external` from the same conversation
       * - start a nested call to `external` from the same conversation
       * - start a Bot API call from the same conversation
       *
       * Naturally, it is possible to have several concurrent calls to `externals`
       * if they happen in unrelated chats. This still means that you should keep
       * the code inside `external` to a minimum and actually only perform the
       * desired side-effect itself.
       *
       * If you want to return data from `external` that cannot be serialized, you
       * can specify a custom serialization function. This allows you choose a
       * different intermediate data representation during storage than what is
       * present at runtime.
       *
       * ```ts
       * // Read bigint from an API but persist it as a string
       * const largeNumber: bigint = await conversation.external({
       *   task: () => fetchCoolBigIntFromTheInternet(),
       *   beforeStore: (largeNumber) => String(largeNumber),
       *   afterLoad: (str) => BigInt(str),
       * })
       * ```
       *
       * Note how we read a bigint from the internet, but we convert it to string
       * during persistence. This now allows us to use a storage adapter that only
       * handles strings but does not need to support the bigint type.
       *
       * @param op An operation to perform outside of the conversation
       */
      // deno-lint-ignore no-explicit-any
      async external(op) {
        if (this.insideExternal) {
          throw new Error("Cannot perform nested or concurrent calls to `external`!");
        }
        const { task, afterLoad = /* @__PURE__ */ __name((x) => x, "afterLoad"), afterLoadError = /* @__PURE__ */ __name((e) => e, "afterLoadError"), beforeStore = /* @__PURE__ */ __name((x) => x, "beforeStore"), beforeStoreError = /* @__PURE__ */ __name((e) => e, "beforeStoreError") } = typeof op === "function" ? { task: op } : op;
        const action = /* @__PURE__ */ __name(async () => {
          this.insideExternal = true;
          try {
            const ret2 = await this.escape((ctx) => task(ctx));
            return { ok: true, ret: await beforeStore(ret2) };
          } catch (e) {
            try {
              return {
                ok: false,
                err: await beforeStoreError(e)
              };
            } catch (e2) {
              return {
                ok: false,
                err: `Error in beforeStoreError, failed to serialize: ${e2}`
              };
            }
          } finally {
            this.insideExternal = false;
          }
        }, "action");
        const ret = await this.controls.action(action, "external");
        const cloned = structuredClone(ret);
        if (cloned.ok) {
          return await afterLoad(cloned.ret);
        } else {
          throw await afterLoadError(cloned.err);
        }
      }
      /**
       * Takes `Date.now()` once when reached, and returns the same value during
       * every replay. Prefer this over calling `Date.now()` directly.
       */
      async now() {
        const now = await this.controls.action(() => Date.now(), "external");
        if (typeof now === "number")
          return now;
        return now.ret;
      }
      /**
       * Takes `Math.random()` once when reached, and returns the same value
       * during every replay. Prefer this over calling `Math.random()` directly.
       */
      async random() {
        const rand = await this.controls.action(() => Math.random(), "external");
        if (typeof rand === "number")
          return rand;
        return rand.ret;
      }
      /**
       * Calls `console.log` only the first time it is reached, but not during
       * subsequent replays. Prefer this over calling `console.log` directly.
       */
      async log(...data) {
        await this.controls.action(() => console.log(...data), "external");
      }
      /**
       * Calls `console.error` only the first time it is reached, but not during
       * subsequent replays. Prefer this over calling `console.error` directly.
       */
      async error(...data) {
        await this.controls.action(() => console.error(...data), "external");
      }
      /**
       * Creates a new conversational menu.
       *
       * A conversational menu is a an interactive inline keyboard that is sent to
       * the user from within a conversation.
       *
       * ```ts
       * const menu = conversation.menu()
       *   .text("Send message", ctx => ctx.reply("Hi!"))
       *   .text("Close", ctx => ctx.menu.close())
       *
       * await ctx.reply("Menu message", { reply_markup: menu })
       * ```
       *
       * If a menu identifier is specified, conversational menus enable seamless
       * navigation.
       *
       * ```ts
       * const menu = conversation.menu("root")
       *   .submenu("Open submenu", ctx => ctx.editMessageText("submenu"))
       *   .text("Close", ctx => ctx.menu.close())
       * conversation.menu("child", { parent: "root" })
       *   .back("Go back", ctx => ctx.editMessageText("Root menu"))
       *
       * await ctx.reply("Root menu", { reply_markup: menu })
       * ```
       *
       * You can also interact with the conversation from inside button handlers.
       *
       * ```ts
       * let name = ""
       * const menu = conversation.menu()
       *   .text("Set name", async ctx => {
       *     await ctx.reply("What's your name?")
       *     name = await conversation.form.text()
       *     await ctx.editMessageText(name)
       *   })
       *   .text("Clear name", ctx => {
       *     name = ""
       *     await ctx.editMessageText("No name")
       *   })
       *
       * await ctx.reply("No name (yet)", { reply_markup: menu })
       * ```
       *
       * More information about conversational menus can be found [in the
       * documentation](https://grammy.dev/plugins/conversations).
       *
       * @param id Optional menu identifier
       * @param options Optional menu options
       */
      menu(id, options) {
        return this.menuPool.create(id, options);
      }
    };
    exports.Conversation = Conversation2;
    function makeAndCombiner(conversation) {
      return /* @__PURE__ */ __name(function combineAnd(promise) {
        const ext = {
          and(predicate, opts = {}) {
            const { otherwise, ...skipOptions } = opts;
            return combineAnd(promise.then(async (ctx) => {
              if (!await predicate(ctx)) {
                await (otherwise === null || otherwise === void 0 ? void 0 : otherwise(ctx));
                await conversation.skip(skipOptions);
              }
              return ctx;
            }));
          },
          unless(predicate, opts) {
            return ext.and(async (ctx) => !await predicate(ctx), opts);
          },
          andFor(query, opts) {
            return ext.and(deps_node_js_1.Context.has.filterQuery(query), opts);
          },
          andForHears(trigger, opts) {
            return ext.and(deps_node_js_1.Context.has.text(trigger), opts);
          },
          andForCommand(command, opts) {
            return ext.and(deps_node_js_1.Context.has.command(command), opts);
          },
          andForReaction(reaction, opts) {
            return ext.and(deps_node_js_1.Context.has.reaction(reaction), opts);
          },
          andForCallbackQuery(trigger, opts) {
            return ext.and(deps_node_js_1.Context.has.callbackQuery(trigger), opts);
          },
          andForGameQuery(trigger, opts) {
            return ext.and(deps_node_js_1.Context.has.gameQuery(trigger), opts);
          },
          andFrom(user, opts) {
            const id = typeof user === "number" ? user : user.id;
            return ext.and((ctx) => {
              var _a;
              return ((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) === id;
            }, opts);
          },
          andForReplyTo(message_id, opts) {
            const id = typeof message_id === "number" ? message_id : message_id.message_id;
            return ext.and((ctx) => {
              var _a, _b, _c, _d;
              return ((_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.reply_to_message) === null || _b === void 0 ? void 0 : _b.message_id) === id || ((_d = (_c = ctx.channelPost) === null || _c === void 0 ? void 0 : _c.reply_to_message) === null || _d === void 0 ? void 0 : _d.message_id) === id;
            }, opts);
          }
        };
        return Object.assign(promise, ext);
      }, "combineAnd");
    }
    __name(makeAndCombiner, "makeAndCombiner");
  }
});

// node_modules/@grammyjs/conversations/out/resolve.js
var require_resolve = __commonJS({
  "node_modules/@grammyjs/conversations/out/resolve.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolver = resolver;
    function resolver(value) {
      const rsr = { value, isResolved: /* @__PURE__ */ __name(() => false, "isResolved") };
      rsr.promise = new Promise((resolve) => {
        rsr.resolve = (t = value) => {
          rsr.isResolved = () => true;
          rsr.value = t;
          resolve(t);
          rsr.resolve = () => {
          };
        };
      });
      return rsr;
    }
    __name(resolver, "resolver");
  }
});

// node_modules/@grammyjs/conversations/out/state.js
var require_state = __commonJS({
  "node_modules/@grammyjs/conversations/out/state.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = create;
    exports.inspect = inspect;
    exports.mutate = mutate;
    exports.cursor = cursor;
    var resolve_js_1 = require_resolve();
    function create() {
      return { send: [], receive: [] };
    }
    __name(create, "create");
    function inspect(state) {
      function opCount() {
        return state.send.length;
      }
      __name(opCount, "opCount");
      function doneCount() {
        return state.receive.length;
      }
      __name(doneCount, "doneCount");
      function payload(op) {
        if (op < 0)
          throw new Error(`Op ${op} is invalid`);
        if (op >= state.send.length)
          throw new Error(`No op ${op} in state`);
        return state.send[op].payload;
      }
      __name(payload, "payload");
      function checkpoint() {
        return [opCount(), doneCount()];
      }
      __name(checkpoint, "checkpoint");
      return { opCount, doneCount, payload, checkpoint };
    }
    __name(inspect, "inspect");
    function mutate(state) {
      function op(payload) {
        const index = state.send.length;
        state.send.push({ payload });
        return index;
      }
      __name(op, "op");
      function done(op2, result) {
        if (op2 < 0)
          throw new Error(`Op ${op2} is invalid`);
        if (op2 >= state.send.length)
          throw new Error(`No op ${op2} in state`);
        state.receive.push({ send: op2, returnValue: result });
      }
      __name(done, "done");
      function reset([op2, done2]) {
        if (op2 < 0 || done2 < 0)
          throw new Error("Invalid checkpoint");
        state.send.splice(op2);
        state.receive.splice(done2);
      }
      __name(reset, "reset");
      return { op, done, reset };
    }
    __name(mutate, "mutate");
    function cursor(state) {
      let changes = (0, resolve_js_1.resolver)();
      function notify() {
        changes.resolve();
        changes = (0, resolve_js_1.resolver)();
      }
      __name(notify, "notify");
      let send = 0;
      let receive = 0;
      function op(payload) {
        if (send < state.send.length) {
          const expected = state.send[send].payload;
          if (expected !== payload) {
            throw new Error(`Bad replay, expected op '${expected}'`);
          }
        } else {
          state.send.push({ payload });
        }
        const index = send++;
        notify();
        return index;
      }
      __name(op, "op");
      async function done(op2, result) {
        if (op2 < 0)
          throw new Error(`Op ${op2} is invalid`);
        if (op2 >= state.send.length)
          throw new Error(`No op ${op2} in state`);
        let data;
        if (receive < state.receive.length) {
          while (state.receive[receive].send !== op2) {
            await changes.promise;
            if (receive === state.receive.length) {
              return await done(op2, result);
            }
          }
          data = state.receive[receive].returnValue;
        } else {
          data = await result();
          state.receive.push({ send: op2, returnValue: data });
        }
        receive++;
        notify();
        return data;
      }
      __name(done, "done");
      async function perform(action, payload) {
        const index = op(payload);
        return await done(index, () => action(index));
      }
      __name(perform, "perform");
      function checkpoint() {
        return [send, receive];
      }
      __name(checkpoint, "checkpoint");
      return { perform, op, done, checkpoint };
    }
    __name(cursor, "cursor");
  }
});

// node_modules/@grammyjs/conversations/out/engine.js
var require_engine = __commonJS({
  "node_modules/@grammyjs/conversations/out/engine.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplayEngine = void 0;
    var resolve_js_1 = require_resolve();
    var state_js_1 = require_state();
    var ReplayEngine = class {
      static {
        __name(this, "ReplayEngine");
      }
      /**
       * Constructs a new replay engine from a builder function. The function
       * receives a single parameter that can be used to control the replay.
       *
       * @param builder A builder function to be executed and replayed
       */
      constructor(builder) {
        this.builder = builder;
      }
      /**
       * Begins a new execution of the builder function. This starts based on
       * fresh state. The execution is independent from any previously created
       * executions.
       *
       * A {@link ReplayResult} object is returned to communicate the outcome of
       * the execution.
       */
      async play() {
        const state = (0, state_js_1.create)();
        return await this.replay(state);
      }
      /**
       * Resumes execution based on a previously created replay state. This is the
       * most important method of this class.
       *
       * A {@link ReplayResult} object is returned to communicate the outcome of
       * the execution.
       *
       * @param state A previously created replay state
       */
      async replay(state) {
        return await replayState(this.builder, state);
      }
      /**
       * Creates a new replay state with a single unresolved interrupt. This state
       * can be used as a starting point to replay arbitrary builder functions.
       *
       * You need to pass the collation key for the aforementioned first
       * interrupt. This must be the same value that the builder function will
       * pass to its first interrupt.
       *
       * @param key The builder functions first collation key
       */
      static open(key) {
        const state = (0, state_js_1.create)();
        const mut = (0, state_js_1.mutate)(state);
        const int = mut.op(key);
        return [state, int];
      }
      /**
       * Mutates a given replay state by supplying a value for a given interrupt.
       * The next time the state is replayed, the targeted interrupt will return
       * this value.
       *
       * The interrupt value has to be one of the interrupts of a previously
       * received {@link Interrupted} result.
       *
       * In addition to mutating the replay state, a checkpoint is created and
       * returned. This checkpoint may be used to reset the replay state to its
       * previous value. This will undo this and all following mutations.
       *
       * @param state A replay state to mutate
       * @param interrupt An interrupt to resolve
       * @param value The value to supply
       */
      static supply(state, interrupt, value) {
        const get = (0, state_js_1.inspect)(state);
        const checkpoint = get.checkpoint();
        const mut = (0, state_js_1.mutate)(state);
        mut.done(interrupt, value);
        return checkpoint;
      }
      /**
       * Resets a given replay state to a previously received checkpoint by
       * mutating the replay state.
       *
       * @param state The state to mutate
       * @param checkpoint The checkpoint to which to return
       */
      static reset(state, checkpoint) {
        const mut = (0, state_js_1.mutate)(state);
        mut.reset(checkpoint);
      }
    };
    exports.ReplayEngine = ReplayEngine;
    async function replayState(builder, state) {
      const cur = (0, state_js_1.cursor)(state);
      let interrupted = false;
      const interrupts = [];
      let boundary = (0, resolve_js_1.resolver)();
      const actions = /* @__PURE__ */ new Set();
      function updateBoundary() {
        if (interrupted && actions.size === 0) {
          boundary.resolve();
        }
      }
      __name(updateBoundary, "updateBoundary");
      async function runBoundary() {
        while (!boundary.isResolved()) {
          await boundary.promise;
          await new Promise((r) => setTimeout(r, 0));
        }
      }
      __name(runBoundary, "runBoundary");
      let promises = 0;
      let dirty = (0, resolve_js_1.resolver)();
      let complete = false;
      function begin() {
        if (complete) {
          throw new Error("Cannot begin another operation after the replay has completed, are you missing an `await`?");
        }
        promises++;
        if (boundary.isResolved()) {
          boundary = (0, resolve_js_1.resolver)();
        }
      }
      __name(begin, "begin");
      function end() {
        promises--;
        if (promises === 0) {
          dirty.resolve();
          dirty = (0, resolve_js_1.resolver)();
        }
      }
      __name(end, "end");
      let canceled = false;
      let message = void 0;
      let returned = false;
      let returnValue = void 0;
      async function interrupt(key) {
        if (returned || interrupted && interrupts.length === 0) {
          await boom();
        }
        begin();
        const res = await cur.perform(async (op) => {
          interrupted = true;
          interrupts.push(op);
          updateBoundary();
          await boom();
        }, key);
        end();
        return res;
      }
      __name(interrupt, "interrupt");
      async function cancel(key) {
        if (complete) {
          throw new Error("Cannot perform a cancel operation after the replay has completed, are you missing an `await`?");
        }
        canceled = true;
        interrupted = true;
        message = key;
        updateBoundary();
        return await boom();
      }
      __name(cancel, "cancel");
      async function action(fn, key) {
        begin();
        const res = await cur.perform(async (op) => {
          actions.add(op);
          const ret = await fn();
          actions.delete(op);
          updateBoundary();
          return ret;
        }, key);
        end();
        return res;
      }
      __name(action, "action");
      function checkpoint() {
        return cur.checkpoint();
      }
      __name(checkpoint, "checkpoint");
      const controls = { interrupt, cancel, action, checkpoint };
      async function run2() {
        returnValue = await builder(controls);
        returned = true;
        while (promises > 0) {
          await dirty.promise;
          await new Promise((r) => setTimeout(r, 0));
        }
      }
      __name(run2, "run");
      try {
        const boundaryPromise = runBoundary();
        const runPromise = run2();
        await Promise.race([boundaryPromise, runPromise]);
        if (returned) {
          return { type: "returned", returnValue };
        } else if (boundary.isResolved()) {
          if (canceled) {
            return { type: "canceled", message };
          } else {
            return { type: "interrupted", state, interrupts };
          }
        } else {
          throw new Error("Neither returned nor interrupted!");
        }
      } catch (error) {
        return { type: "thrown", error };
      } finally {
        complete = true;
      }
    }
    __name(replayState, "replayState");
    function boom() {
      return new Promise(() => {
      });
    }
    __name(boom, "boom");
  }
});

// node_modules/@grammyjs/conversations/out/storage.js
var require_storage = __commonJS({
  "node_modules/@grammyjs/conversations/out/storage.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PLUGIN_DATA_VERSION = void 0;
    exports.pinVersion = pinVersion;
    exports.uniformStorage = uniformStorage;
    exports.PLUGIN_DATA_VERSION = 0;
    function pinVersion(version2) {
      function versionify(state) {
        return { version: [exports.PLUGIN_DATA_VERSION, version2], state };
      }
      __name(versionify, "versionify");
      function unpack(data) {
        if (data === void 0)
          return void 0;
        if (!Array.isArray(data.version)) {
          throw new Error("Unknown data format, cannot parse version");
        }
        const [pluginVersion, dataVersion] = data.version;
        if (dataVersion !== version2)
          return void 0;
        if (pluginVersion !== exports.PLUGIN_DATA_VERSION) {
          return void 0;
        }
        return data.state;
      }
      __name(unpack, "unpack");
      return { versionify, unpack };
    }
    __name(pinVersion, "pinVersion");
    function defaultStorageKey(ctx) {
      var _a;
      return (_a = ctx.chatId) === null || _a === void 0 ? void 0 : _a.toString();
    }
    __name(defaultStorageKey, "defaultStorageKey");
    function defaultStorage() {
      const store = /* @__PURE__ */ new Map();
      return {
        type: "key",
        adapter: {
          read: /* @__PURE__ */ __name((key) => store.get(key), "read"),
          write: /* @__PURE__ */ __name((key, state) => void store.set(key, state), "write"),
          delete: /* @__PURE__ */ __name((key) => void store.delete(key), "delete")
        }
      };
    }
    __name(defaultStorage, "defaultStorage");
    function uniformStorage(storage) {
      var _a;
      storage !== null && storage !== void 0 ? storage : storage = defaultStorage();
      if (storage.type === void 0) {
        return uniformStorage({ type: "key", adapter: storage });
      }
      const version2 = (_a = storage.version) !== null && _a !== void 0 ? _a : 0;
      const { versionify, unpack } = pinVersion(version2);
      if (storage.type === "key") {
        const { getStorageKey = defaultStorageKey, prefix = "", adapter } = storage;
        return (ctx) => {
          const key = prefix + getStorageKey(ctx);
          return key === void 0 ? {
            read: /* @__PURE__ */ __name(() => void 0, "read"),
            write: /* @__PURE__ */ __name(() => void 0, "write"),
            delete: /* @__PURE__ */ __name(() => void 0, "delete")
          } : {
            read: /* @__PURE__ */ __name(async () => unpack(await adapter.read(key)), "read"),
            write: /* @__PURE__ */ __name((state) => adapter.write(key, versionify(state)), "write"),
            delete: /* @__PURE__ */ __name(() => adapter.delete(key), "delete")
          };
        };
      } else {
        const { adapter } = storage;
        return (ctx) => {
          return {
            read: /* @__PURE__ */ __name(async () => unpack(await adapter.read(ctx)), "read"),
            write: /* @__PURE__ */ __name((state) => adapter.write(ctx, versionify(state)), "write"),
            delete: /* @__PURE__ */ __name(() => adapter.delete(ctx), "delete")
          };
        };
      }
    }
    __name(uniformStorage, "uniformStorage");
  }
});

// node_modules/@grammyjs/conversations/out/plugin.js
var require_plugin = __commonJS({
  "node_modules/@grammyjs/conversations/out/plugin.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.conversations = conversations2;
    exports.createConversation = createConversation3;
    exports.runParallelConversations = runParallelConversations;
    exports.enterConversation = enterConversation;
    exports.resumeConversation = resumeConversation;
    var conversation_js_1 = require_conversation();
    var deps_node_js_1 = require_deps_node();
    var engine_js_1 = require_engine();
    var nope_js_1 = require_nope();
    var storage_js_1 = require_storage();
    var internalRecursionDetection = /* @__PURE__ */ Symbol("conversations.recursion");
    var internalState = /* @__PURE__ */ Symbol("conversations.state");
    var internalCompletenessMarker = /* @__PURE__ */ Symbol("conversations.completeness");
    function controls(getData, isParallel, enter, exit, canSave) {
      async function fireExit(events) {
        if (exit === void 0)
          return;
        const len = events.length;
        for (let i = 0; i < len; i++) {
          await exit(events[i]);
        }
      }
      __name(fireExit, "fireExit");
      return {
        async enter(name, ...args) {
          var _a, _b;
          if (!canSave()) {
            throw new Error("The middleware has already completed so it is no longer possible to enter a conversation");
          }
          const data = getData();
          if (Object.keys(data).length > 0 && !isParallel(name)) {
            throw new Error(`A conversation was already entered and '${name}' is not a parallel conversation. Make sure to exit all active conversations before entering a new one, or specify { parallel: true } for '${name}' if you want it to run in parallel.`);
          }
          (_a = data[name]) !== null && _a !== void 0 ? _a : data[name] = [];
          const result = await enter(name, ...args);
          if (!canSave()) {
            throw new Error("The middleware has completed before conversation was fully entered so the conversations plugin cannot persist data anymore, did you forget to use `await`?");
          }
          switch (result.status) {
            case "complete":
              return;
            case "error":
              throw result.error;
            case "handled":
            case "skipped": {
              const args2 = result.args === void 0 ? {} : { args: result.args };
              const state = {
                ...args2,
                interrupts: result.interrupts,
                replay: result.replay
              };
              (_b = data[name]) === null || _b === void 0 ? void 0 : _b.push(state);
              return;
            }
          }
        },
        async exitAll() {
          if (!canSave()) {
            throw new Error("The middleware has already completed so it is no longer possible to exit all conversations");
          }
          const data = getData();
          const keys = Object.keys(data);
          const events = keys.flatMap((key) => Array(data[key].length).fill(key));
          keys.forEach((key) => delete data[key]);
          await fireExit(events);
        },
        async exit(name) {
          if (!canSave()) {
            throw new Error(`The middleware has already completed so it is no longer possible to exit any conversations named '${name}'`);
          }
          const data = getData();
          if (data[name] === void 0)
            return;
          const events = Array(data[name].length).fill(name);
          delete data[name];
          await fireExit(events);
        },
        async exitOne(name, index) {
          if (!canSave()) {
            throw new Error(`The middleware has already completed so it is no longer possible to exit the conversation '${name}'`);
          }
          const data = getData();
          if (data[name] === void 0 || index < 0 || data[name].length <= index)
            return;
          data[name].splice(index, 1);
          await fireExit([name]);
        },
        // deno-lint-ignore no-explicit-any
        active(name) {
          var _a, _b;
          const data = getData();
          return name === void 0 ? Object.fromEntries(Object.entries(data).map(([name2, states]) => [name2, states.length])) : (_b = (_a = data[name]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        }
      };
    }
    __name(controls, "controls");
    function conversations2(options = {}) {
      const createStorage = (0, storage_js_1.uniformStorage)(options.storage);
      return async (ctx, next) => {
        var _a, _b;
        if (internalRecursionDetection in ctx) {
          throw new Error("Cannot install the conversations plugin on context objects created by the conversations plugin!");
        }
        if (internalState in ctx) {
          throw new Error("Cannot install conversations plugin twice!");
        }
        const storage = createStorage(ctx);
        let read = false;
        const state = (_a = await storage.read()) !== null && _a !== void 0 ? _a : {};
        const empty = Object.keys(state).length === 0;
        function getData() {
          read = true;
          return state;
        }
        __name(getData, "getData");
        const index = /* @__PURE__ */ new Map();
        const exit = options.onExit !== void 0 ? async (name) => {
          var _a2;
          await ((_a2 = options.onExit) === null || _a2 === void 0 ? void 0 : _a2.call(options, name, ctx));
        } : void 0;
        async function enter(id, ...args) {
          var _a2;
          const entry = index.get(id);
          if (entry === void 0) {
            const known = Array.from(index.keys()).map((id2) => `'${id2}'`).join(", ");
            throw new Error(`The conversation '${id}' has not been registered! Known conversations are: ${known}`);
          }
          const { builder, plugins, maxMillisecondsToWait } = entry;
          await ((_a2 = options.onEnter) === null || _a2 === void 0 ? void 0 : _a2.call(options, id, ctx));
          const base = {
            update: ctx.update,
            api: ctx.api,
            me: ctx.me
          };
          const onHalt = /* @__PURE__ */ __name(async () => {
            await (exit === null || exit === void 0 ? void 0 : exit(id));
          }, "onHalt");
          return await enterConversation(builder, base, {
            args,
            ctx,
            plugins,
            onHalt,
            maxMillisecondsToWait
          });
        }
        __name(enter, "enter");
        function isParallel(name) {
          var _a2, _b2;
          return (_b2 = (_a2 = index.get(name)) === null || _a2 === void 0 ? void 0 : _a2.parallel) !== null && _b2 !== void 0 ? _b2 : true;
        }
        __name(isParallel, "isParallel");
        function canSave() {
          return !(internalCompletenessMarker in ctx);
        }
        __name(canSave, "canSave");
        const internal = {
          getMutableData: getData,
          index,
          defaultPlugins: (_b = options.plugins) !== null && _b !== void 0 ? _b : [],
          exitHandler: exit
        };
        Object.defineProperty(ctx, internalState, { value: internal });
        ctx.conversation = controls(getData, isParallel, enter, exit, canSave);
        try {
          await next();
        } finally {
          Object.defineProperty(ctx, internalCompletenessMarker, {
            value: true
          });
          if (read) {
            const keys = Object.keys(state);
            const len = keys.length;
            let del = 0;
            for (let i = 0; i < len; i++) {
              const key = keys[i];
              if (state[key].length === 0) {
                delete state[key];
                del++;
              }
            }
            if (len !== del) {
              await storage.write(state);
            } else if (!empty) {
              await storage.delete();
            }
          }
        }
      };
    }
    __name(conversations2, "conversations");
    function createConversation3(builder, options) {
      const { id = builder.name, plugins = [], maxMillisecondsToWait = void 0, parallel = false } = typeof options === "string" ? { id: options } : options !== null && options !== void 0 ? options : {};
      if (!id) {
        throw new Error("Cannot register a conversation without a name!");
      }
      return async (ctx, next) => {
        if (!(internalState in ctx)) {
          throw new Error("Cannot register a conversation without installing the conversations plugin first!");
        }
        const { index, defaultPlugins, getMutableData, exitHandler } = ctx[internalState];
        if (index.has(id)) {
          throw new Error(`Duplicate conversation identifier '${id}'!`);
        }
        const defaultPluginsFunc = typeof defaultPlugins === "function" ? defaultPlugins : () => defaultPlugins;
        const pluginsFunc = typeof plugins === "function" ? plugins : () => plugins;
        const combinedPlugins = /* @__PURE__ */ __name(async (conversation) => [
          ...await defaultPluginsFunc(conversation),
          ...await pluginsFunc(conversation)
        ], "combinedPlugins");
        index.set(id, {
          builder,
          plugins: combinedPlugins,
          maxMillisecondsToWait,
          parallel
        });
        const onHalt = /* @__PURE__ */ __name(async () => {
          await (exitHandler === null || exitHandler === void 0 ? void 0 : exitHandler(id));
        }, "onHalt");
        const mutableData = getMutableData();
        const base = {
          update: ctx.update,
          api: ctx.api,
          me: ctx.me
        };
        const options2 = {
          ctx,
          plugins: combinedPlugins,
          onHalt,
          maxMillisecondsToWait,
          parallel
        };
        const result = await runParallelConversations(
          builder,
          base,
          id,
          mutableData,
          // will be mutated on ctx
          options2
        );
        switch (result.status) {
          case "complete":
          case "skipped":
            if (result.next)
              await next();
            return;
          case "error":
            throw result.error;
          case "handled":
            return;
        }
      };
    }
    __name(createConversation3, "createConversation");
    async function runParallelConversations(builder, base, id, data, options) {
      if (!(id in data))
        return { status: "skipped", next: true };
      const states = data[id];
      const len = states.length;
      for (let i = 0; i < len; i++) {
        const state = states[i];
        const result = await resumeConversation(builder, base, state, options);
        switch (result.status) {
          case "skipped":
            if (result.next)
              continue;
            else
              return { status: "skipped", next: false };
          case "handled":
            states[i].replay = result.replay;
            states[i].interrupts = result.interrupts;
            return result;
          case "complete":
            states.splice(i, 1);
            if (states.length === 0)
              delete data[id];
            if (result.next)
              continue;
            else
              return result;
          case "error":
            states.splice(i, 1);
            if (states.length === 0)
              delete data[id];
            return result;
        }
      }
      return { status: "skipped", next: true };
    }
    __name(runParallelConversations, "runParallelConversations");
    async function enterConversation(conversation, base, options) {
      const { args = [], ...opts } = options !== null && options !== void 0 ? options : {};
      const [initialState, int] = engine_js_1.ReplayEngine.open("wait");
      const packedArgs = args.length === 0 ? {} : { args: JSON.stringify(args) };
      const state = {
        ...packedArgs,
        replay: initialState,
        interrupts: [int]
      };
      const result = await resumeConversation(conversation, base, state, opts);
      switch (result.status) {
        case "complete":
        case "error":
          return result;
        case "handled":
          return { ...packedArgs, ...result };
        case "skipped":
          return {
            ...packedArgs,
            replay: initialState,
            interrupts: state.interrupts,
            ...result
          };
      }
    }
    __name(enterConversation, "enterConversation");
    async function resumeConversation(conversation, base, state, options) {
      const { update, api: api2, me } = base;
      const args = state.args === void 0 ? [] : JSON.parse(state.args);
      const { ctx = (0, nope_js_1.youTouchYouDie)("The conversation was advanced from an event so there is no access to an outside context object"), plugins = [], onHalt, maxMillisecondsToWait, parallel } = options !== null && options !== void 0 ? options : {};
      const escape = /* @__PURE__ */ __name((fn) => fn(ctx), "escape");
      const engine = new engine_js_1.ReplayEngine(async (controls2) => {
        const hydrate = hydrateContext(controls2, api2, me);
        const convo = new conversation_js_1.Conversation(controls2, hydrate, escape, plugins, {
          onHalt,
          maxMillisecondsToWait,
          parallel
        });
        const ctx2 = await convo.wait({ maxMilliseconds: void 0 });
        await conversation(convo, ctx2, ...args);
      });
      const replayState = state.replay;
      const ints = state.interrupts;
      const len = ints.length;
      let next = true;
      INTERRUPTS: for (let i = 0; i < len; i++) {
        const int = ints[i];
        const checkpoint = engine_js_1.ReplayEngine.supply(replayState, int, update);
        let rewind;
        do {
          rewind = false;
          const result = await engine.replay(replayState);
          switch (result.type) {
            case "returned":
              return { status: "complete", next: false };
            case "thrown":
              return { status: "error", error: result.error };
            case "interrupted":
              return {
                status: "handled",
                replay: result.state,
                interrupts: result.interrupts
              };
            // TODO: disable lint until the following issue is fixed:
            // https://github.com/denoland/deno_lint/issues/1331
            // deno-lint-ignore no-fallthrough
            case "canceled":
              if (Array.isArray(result.message)) {
                const c = result.message;
                engine_js_1.ReplayEngine.reset(replayState, c);
                rewind = true;
                break;
              }
              switch (result.message) {
                case "skip":
                  engine_js_1.ReplayEngine.reset(replayState, checkpoint);
                  next = true;
                  continue INTERRUPTS;
                case "drop":
                  engine_js_1.ReplayEngine.reset(replayState, checkpoint);
                  next = false;
                  continue INTERRUPTS;
                case "halt":
                  return { status: "complete", next: false };
                case "kill":
                  return { status: "complete", next: true };
                default:
                  throw new Error("invalid cancel message received");
              }
            default:
              throw new Error("engine returned invalid replay result type");
          }
        } while (rewind);
      }
      return { status: "skipped", next };
    }
    __name(resumeConversation, "resumeConversation");
    function hydrateContext(controls2, protoApi, me) {
      return (update) => {
        const api2 = new deps_node_js_1.Api(protoApi.token, protoApi.options);
        api2.config.use(async (prev, method, payload, signal) => {
          async function action() {
            try {
              const res = await prev(method, payload, signal);
              return { ok: true, res };
            } catch (e) {
              if (e instanceof deps_node_js_1.HttpError) {
                return {
                  ok: false,
                  err: {
                    message: e.message,
                    error: JSON.stringify(e.error)
                  }
                };
              } else {
                throw new Error(
                  `Unknown error thrown in conversation while calling '${method}'`,
                  // @ts-ignore not available on old Node versions
                  { cause: e }
                );
              }
            }
          }
          __name(action, "action");
          const ret = await controls2.action(action, method);
          if (ret.ok) {
            return ret.res;
          } else {
            throw new deps_node_js_1.HttpError("Error inside conversation: " + ret.err.message, new Error(JSON.parse(ret.err.error)));
          }
        });
        const ctx = new deps_node_js_1.Context(update, api2, me);
        Object.defineProperty(ctx, internalRecursionDetection, { value: true });
        return ctx;
      };
    }
    __name(hydrateContext, "hydrateContext");
  }
});

// node_modules/@grammyjs/conversations/out/mod.js
var require_mod = __commonJS({
  "node_modules/@grammyjs/conversations/out/mod.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m2, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m2, k);
      if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m2[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m2, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m2[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p in m2) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m2, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_conversation(), exports);
    __exportStar(require_engine(), exports);
    __exportStar(require_form(), exports);
    __exportStar(require_menu(), exports);
    __exportStar(require_plugin(), exports);
    __exportStar(require_resolve(), exports);
    __exportStar(require_state(), exports);
    __exportStar(require_storage(), exports);
  }
});

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
  request = /* @__PURE__ */ __name((input, requestInit, Env3, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env3, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env3,
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

// src/bot.ts
init_web();
var import_conversations2 = __toESM(require_mod(), 1);

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
async function createOrder(db, user_id, days, gb, price) {
  const res = await db.prepare(
    "INSERT INTO orders (user_id, days, gb, price, status) VALUES (?, ?, ?, ?, ?) RETURNING id"
  ).bind(user_id, days, gb, price, "PENDING_PAYMENT").first();
  return res?.id;
}
__name(createOrder, "createOrder");
async function updateOrderStatus(db, orderId, status) {
  await db.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, orderId).run();
}
__name(updateOrderStatus, "updateOrderStatus");
async function getAdminIds(db) {
  const { results } = await db.prepare("SELECT telegram_id FROM users WHERE is_admin = 1").all();
  return results.map((r) => r.telegram_id);
}
__name(getAdminIds, "getAdminIds");

// src/bot/admin.ts
init_web();
var import_conversations = __toESM(require_mod(), 1);
async function checkAdmin(ctx, next) {
  if (!ctx.from?.id) return;
  const res = await ctx.env.DB.prepare("SELECT is_admin FROM users WHERE telegram_id = ?").bind(ctx.from.id).first();
  if (res && res.is_admin === 1) {
    await next();
  }
}
__name(checkAdmin, "checkAdmin");
async function addProductWizard(conversation, ctx) {
  await ctx.reply("\u{1F4E6} **Add New Product**\n\nWhat is the name of the product? (Type /cancel to abort)");
  const nameCtx = await conversation.waitFor(":text");
  if (nameCtx.msg.text === "/cancel") return ctx.reply("Cancelled.");
  const name = nameCtx.msg.text;
  await ctx.reply(`Name: ${name}

What is the price in USD? (Enter a number)`);
  const priceCtx = await conversation.waitFor(":text");
  const price = parseInt(priceCtx.msg.text);
  if (isNaN(price)) {
    await ctx.reply("Invalid price. Cancelled.");
    return;
  }
  await ctx.env.DB.prepare("INSERT INTO products (name, base_price, category_id) VALUES (?, ?, NULL)").bind(name, price).run();
  await ctx.reply(`\u2705 Product **${name}** added successfully for $${price}!`);
}
__name(addProductWizard, "addProductWizard");
async function editSettingWizard(conversation, ctx) {
  await ctx.reply("\u2699\uFE0F **Edit Setting**\n\nWhich setting do you want to edit?\nExample: `welcome_message`");
  const keyCtx = await conversation.waitFor(":text");
  const key = keyCtx.msg.text;
  const current = await ctx.env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first();
  const currentVal = current ? current.value : "(Not set)";
  await ctx.reply(`Current value for **${key}** is:

${currentVal}

Please send the NEW value now:`);
  const valCtx = await conversation.waitFor(":text");
  const newVal = valCtx.msg.text;
  await ctx.env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(key, newVal).run();
  await ctx.reply("\u2705 Setting updated successfully!");
}
__name(editSettingWizard, "editSettingWizard");
function setupAdmin(bot2) {
  bot2.use((0, import_conversations.createConversation)(addProductWizard));
  bot2.use((0, import_conversations.createConversation)(editSettingWizard));
  bot2.command("admin", checkAdmin, async (ctx) => {
    const kb = new InlineKeyboard().text("\u{1F4E6} Manage Products", "admin_products").row().text("\u2699\uFE0F Edit Settings", "admin_settings").row().text("\u{1F4CA} View Orders", "admin_orders");
    await ctx.reply("\u{1F510} **Admin Dashboard**\n\nSelect an option:", { reply_markup: kb });
  });
  bot2.callbackQuery("admin_products", checkAdmin, async (ctx) => {
    await ctx.answerCallbackQuery();
    const kb = new InlineKeyboard().text("\u2795 Add Product", "admin_add_product");
    await ctx.editMessageText("\u{1F4E6} **Product Management**\n\nClick below to add a new product:", { reply_markup: kb });
  });
  bot2.callbackQuery("admin_add_product", checkAdmin, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("addProductWizard");
  });
  bot2.callbackQuery("admin_settings", checkAdmin, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("editSettingWizard");
  });
  bot2.callbackQuery("admin_orders", checkAdmin, async (ctx) => {
    await ctx.answerCallbackQuery("Order stats coming soon!");
  });
}
__name(setupAdmin, "setupAdmin");

// src/bot.ts
var D1Adapter = class {
  constructor(db) {
    this.db = db;
  }
  db;
  static {
    __name(this, "D1Adapter");
  }
  async read(key) {
    const row = await this.db.prepare("SELECT value FROM sessions WHERE id = ?").bind(key).first();
    if (row && row.value) return JSON.parse(row.value);
    return void 0;
  }
  async write(key, value) {
    await this.db.prepare("INSERT INTO sessions (id, value) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value").bind(key, JSON.stringify(value)).run();
  }
  async delete(key) {
    await this.db.prepare("DELETE FROM sessions WHERE id = ?").bind(key).run();
  }
};
async function orderWizard(conversation, ctx) {
  const tgId = ctx.from?.id;
  if (!tgId) return;
  await ctx.reply("Welcome! Let's configure your order.\n\nHow many **Days** of service do you need? (Please enter a number)");
  const daysCtx = await conversation.waitFor(":text");
  const days = parseInt(daysCtx.msg.text);
  if (isNaN(days) || days <= 0) {
    await ctx.reply("Invalid number. Please run /start again.");
    return;
  }
  await ctx.reply(`Great! You want ${days} days.

How many **Gigabytes (GB)** do you need?`);
  const gbCtx = await conversation.waitFor(":text");
  const gb = parseInt(gbCtx.msg.text);
  if (isNaN(gb) || gb <= 0) {
    await ctx.reply("Invalid number. Please run /start again.");
    return;
  }
  const price = days * 1 + gb * 2;
  await ctx.reply(`Order Summary:
- Days: ${days}
- GB: ${gb}
- Price: $${price}

Please pay $${price} and **upload a screenshot of the payment receipt** (as a photo message) to continue.`);
  const photoCtx = await conversation.waitFor(":photo");
  const photo = photoCtx.msg.photo;
  const orderId = await createOrder(ctx.env.DB, tgId, days, gb, price);
  await ctx.reply("Thank you! Your payment receipt has been submitted. The admin will review it shortly.");
  const username = ctx.from?.username || "unknown";
  const adminMsg = `\u{1F4E6} **New Order #${orderId}**
User: @${username} (${tgId})
Days: ${days}
GB: ${gb}
Price: $${price}
Status: PENDING PAYMENT`;
  const adminIds = await getAdminIds(ctx.env.DB);
  if (adminIds.length === 0) {
    adminIds.push(parseInt(ctx.env.ADMIN_CHAT_ID));
  }
  for (const adminId of adminIds) {
    await ctx.api.sendPhoto(adminId, photo[0].file_id, {
      caption: adminMsg,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "\u2705 Approve", callback_data: `approve_${orderId}_${tgId}` },
            { text: "\u274C Reject", callback_data: `reject_${orderId}_${tgId}` }
          ]
        ]
      }
    }).catch(console.error);
  }
}
__name(orderWizard, "orderWizard");
async function adminDeliveryWizard(conversation, ctx) {
  const orderId = conversation.session.adminDeliveryOrderId;
  const userId = conversation.session.adminDeliveryUserId;
  if (!orderId || !userId) return;
  await ctx.reply(`Please enter the product details (e.g., link, credentials) for Order #${orderId} to deliver to the user:`);
  const detailsCtx = await conversation.waitFor(":text");
  const details = detailsCtx.msg.text;
  await updateOrderStatus(ctx.env.DB, orderId, "DELIVERED");
  await ctx.api.sendMessage(userId, `\u{1F389} Your Order #${orderId} has been approved and delivered!

Here are your details:
${details}`);
  await ctx.reply("Product delivered to the user and order marked as DELIVERED!");
}
__name(adminDeliveryWizard, "adminDeliveryWizard");
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
  bot.use(
    session({
      initial: /* @__PURE__ */ __name(() => ({}), "initial"),
      storage: new D1Adapter(env.DB)
    })
  );
  bot.use((0, import_conversations2.conversations)());
  bot.use((0, import_conversations2.createConversation)(orderWizard));
  bot.use((0, import_conversations2.createConversation)(adminDeliveryWizard));
  setupAdmin(bot);
  bot.command("start", async (ctx) => {
    const profile = {
      telegram_id: ctx.from?.id,
      username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
      language_code: ctx.from?.language_code,
      is_premium: ctx.from?.is_premium,
      start_param: ctx.match
      // from /start <payload>
    };
    await saveUser(ctx.env.DB, profile);
    await ctx.conversation.enter("orderWizard");
  });
  bot.callbackQuery(/reject_(\d+)_(\d+)/, async (ctx) => {
    const orderId = parseInt(ctx.match[1]);
    const userId = parseInt(ctx.match[2]);
    await updateOrderStatus(ctx.env.DB, orderId, "REJECTED");
    await ctx.api.sendMessage(userId, `\u274C Your payment for Order #${orderId} was rejected. Please contact support if you think this is a mistake.`);
    await ctx.editMessageCaption({ caption: ctx.msg?.caption + "\n\n\u274C REJECTED" });
    await ctx.answerCallbackQuery("Rejected.");
  });
  bot.callbackQuery(/approve_(\d+)_(\d+)/, async (ctx) => {
    const orderId = parseInt(ctx.match[1]);
    const userId = parseInt(ctx.match[2]);
    ctx.session.adminDeliveryOrderId = orderId;
    ctx.session.adminDeliveryUserId = userId;
    await ctx.conversation.enter("adminDeliveryWizard");
    await ctx.editMessageCaption({ caption: ctx.msg?.caption + "\n\n\u2705 APPROVED (Pending Delivery...)" });
    await ctx.answerCallbackQuery("Approving...");
  });
  return bot;
}
__name(initBot, "initBot");

// src/api/index.ts
var api = new Hono2();
api.use("*", async (c, next) => {
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
api.get("/catalog", async (c) => {
  const { results: categories } = await c.env.DB.prepare("SELECT * FROM categories WHERE is_active = 1").all();
  const { results: products } = await c.env.DB.prepare("SELECT * FROM products WHERE is_hidden = 0").all();
  return c.json({ categories, products });
});
var api_default = api;

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
var htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Telegram E-Commerce Mini App</title>
  <script src="https://telegram.org/js/telegram-web-app.js"><\/script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--tg-theme-bg-color, #ffffff);
      color: var(--tg-theme-text-color, #000000);
      margin: 0;
      padding: 16px;
    }
    .product {
      border: 1px solid var(--tg-theme-hint-color, #ccc);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      background-color: var(--tg-theme-secondary-bg-color, #f0f0f0);
    }
    h1 { font-size: 24px; }
  </style>
</head>
<body>
  <h1>Product Catalog</h1>
  <div id="catalog">Loading...</div>

  <script>
    const tg = window.Telegram.WebApp;
    tg.expand();

    async function loadCatalog() {
      try {
        const res = await fetch('/api/catalog', {
          headers: {
            'x-telegram-init-data': tg.initData
          }
        });
        
        if (!res.ok) throw new Error("API Error");
        
        const data = await res.json();
        const catalogDiv = document.getElementById('catalog');
        
        if (data.products && data.products.length > 0) {
          catalogDiv.innerHTML = data.products.map(p => \`
            <div class="product">
              <h3>\${p.name}</h3>
              <p>Price: $\${p.base_price}</p>
            </div>
          \`).join('');
        } else {
          catalogDiv.innerHTML = "No products available.";
        }
      } catch (e) {
        document.getElementById('catalog').innerText = "Error loading catalog. Are you testing outside of Telegram?";
      }
    }

    loadCatalog();
  <\/script>
</body>
</html>
`;
app.get("/", (c) => {
  return c.html(htmlContent);
});
var index_default = app;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
