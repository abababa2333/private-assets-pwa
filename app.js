"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // asset-plugin/src/core.js
  var require_core = __commonJS({
    "asset-plugin/src/core.js"(exports, module) {
      "use strict";
      var SCALE = 100000000n;
      var CURRENCIES = ["CNY", "HKD", "USD", "SGD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"];
      var CATEGORIES = { cash: "\u73B0\u91D1", deposit: "\u5B9A\u671F\u5B58\u6B3E", stock: "\u80A1\u7968 / ETF", fund: "\u57FA\u91D1", crypto: "\u52A0\u5BC6\u8D44\u4EA7", other: "\u5176\u4ED6\u8D44\u4EA7", debt: "\u8D1F\u503A" };
      function assert(ok, message) {
        if (!ok) throw new Error(message);
      }
      function decimal(v) {
        assert(typeof v === "string" || typeof v === "number", "\u91D1\u989D\u5FC5\u987B\u4E3A\u6570\u5B57\u6216\u5341\u8FDB\u5236\u6587\u672C");
        const s = String(v).trim();
        assert(/^-?\d{1,13}(\.\d{1,8})?$/.test(s), "\u91D1\u989D\u683C\u5F0F\u65E0\u6548\uFF1A\u6700\u591A 8 \u4F4D\u5C0F\u6570\uFF0C\u4E0D\u63A5\u53D7\u79D1\u5B66\u8BA1\u6570\u6CD5\u6216\u5343\u4F4D\u9017\u53F7");
        const neg = s[0] === "-", a = (neg ? s.slice(1) : s).split(".");
        return (BigInt(a[0]) * SCALE + BigInt((a[1] || "").padEnd(8, "0"))) * (neg ? -1n : 1n);
      }
      function dec(n) {
        const sign = n < 0n ? "-" : "";
        const v = n < 0n ? -n : n;
        return sign + String(v / SCALE) + (v % SCALE ? "." + String(v % SCALE).padStart(8, "0").replace(/0+$/, "") : "");
      }
      function divide(a, b) {
        assert(b !== 0n, "\u4E0D\u80FD\u9664\u4EE5\u96F6");
        const neg = a < 0n !== b < 0n, x = a < 0n ? -a : a, y = b < 0n ? -b : b;
        return (x + y / 2n) / y * (neg ? -1n : 1n);
      }
      var mul = (a, b) => divide(a * b, SCALE);
      function money(n) {
        if (n === null) return "\u5F85\u6298\u7B97";
        const cents = divide(n, 1000000n), a = cents < 0n ? -cents : cents;
        return (cents < 0n ? "-" : "") + String(a / 100n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + String(a % 100n).padStart(2, "0");
      }
      function date(s) {
        assert(typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && (/* @__PURE__ */ new Date(s + "T00:00:00Z")).toISOString().slice(0, 10) === s, "\u65E5\u671F\u65E0\u6548");
        return s;
      }
      function str(v, label, max = 120) {
        assert(typeof v === "string" && v.trim().length > 0 && v.length <= max, label + "\u4E0D\u80FD\u4E3A\u7A7A\u6216\u8FC7\u957F");
        return v.trim();
      }
      function id(v) {
        assert(typeof v === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(v), "\u8BB0\u5F55\u7F16\u53F7\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u548C\u77ED\u6A2A\u7EBF");
        return v;
      }
      function clean(type, v) {
        if (v === null) return null;
        assert(v && typeof v === "object" && !Array.isArray(v), "\u8BB0\u5F55\u683C\u5F0F\u65E0\u6548");
        if (type === "account") return { id: id(v.id), name: str(v.name, "\u8D26\u6237\u540D\u79F0"), institution: str(v.institution, "\u673A\u6784"), region: str(v.region || "\u5176\u4ED6", "\u5730\u533A", 30), logo: typeof v.logo === "string" && /^[a-z]+$/.test(v.logo) ? v.logo : "other" };
        if (type === "asset") {
          assert(Object.hasOwn(CATEGORIES, v.category), "\u8D44\u4EA7\u7C7B\u578B\u65E0\u6548");
          assert(CURRENCIES.includes(v.currency), "\u5E01\u79CD\u4E0D\u652F\u6301");
          const r = { id: id(v.id), accountId: id(v.accountId), name: str(v.name, "\u8D44\u4EA7\u540D\u79F0"), category: v.category, currency: v.currency, date: date(v.date) };
          assert((v.quantity == null || v.quantity === "") === (v.unitPrice == null || v.unitPrice === ""), "\u4EFD\u989D\u548C\u5355\u4EF7\u5FC5\u987B\u540C\u65F6\u586B\u5199");
          if (v.quantity != null && v.quantity !== "") {
            const q = decimal(v.quantity), p = decimal(v.unitPrice);
            assert(q >= 0n && p >= 0n, "\u4EFD\u989D\u548C\u5355\u4EF7\u4E0D\u80FD\u4E3A\u8D1F");
            r.quantity = dec(q);
            r.unitPrice = dec(p);
            r.amount = dec(mul(q, p));
            if (v.amount != null && v.amount !== "") assert(decimal(v.amount) === decimal(r.amount), "\u91D1\u989D\u4E0E\u4EFD\u989D \xD7 \u5355\u4EF7\u4E0D\u4E00\u81F4");
          } else {
            const a = decimal(v.amount);
            assert(a >= 0n, "\u8D44\u4EA7\u548C\u8D1F\u503A\u91D1\u989D\u5747\u586B\u6B63\u6570");
            r.amount = dec(a);
          }
          for (const k of ["symbol", "note"]) if (v[k]) r[k] = str(v[k], k, k === "note" ? 300 : 80);
          if (v.maturity) r.maturity = date(v.maturity);
          if (v.apr != null && v.apr !== "") {
            const a = decimal(v.apr);
            assert(a >= 0n && a <= 100n * SCALE, "\u5E74\u5229\u7387\u9700\u5728 0\u2014100%");
            r.apr = dec(a);
          }
          if (v.unitCost != null && v.unitCost !== "") {
            assert(r.quantity !== void 0, "\u6210\u672C\u9700\u8981\u6301\u4ED3\u4EFD\u989D");
            const c = decimal(v.unitCost);
            assert(c >= 0n, "\u6210\u672C\u4E0D\u80FD\u4E3A\u8D1F");
            r.unitCost = dec(c);
          }
          return r;
        }
        if (type === "rate") {
          assert(CURRENCIES.includes(v.id) && v.id !== "CNY", "\u6C47\u7387\u5E01\u79CD\u65E0\u6548");
          const n = decimal(v.rate);
          assert(n > 0n, "\u6C47\u7387\u987B\u4E3A\u6B63\u6570");
          return { id: v.id, rate: dec(n), date: date(v.date), source: str(v.source, "\u6C47\u7387\u6765\u6E90") };
        }
        throw new Error("\u672A\u77E5\u8BB0\u5F55\u7C7B\u578B");
      }
      var newId = () => crypto.randomUUID();
      function empty() {
        return { version: 1, vaultId: newId(), events: [] };
      }
      function canonical(v) {
        if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
        if (v && typeof v === "object") return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canonical(v[k])).join(",") + "}";
        return JSON.stringify(v);
      }
      function validate(book) {
        assert(book && book.version === 1 && typeof book.vaultId === "string" && book.vaultId.length <= 100 && Array.isArray(book.events) && book.events.length <= 3e4, "\u8D26\u672C\u683C\u5F0F\u65E0\u6548\u6216\u8D85\u8FC7 30,000 \u6761\u5386\u53F2\u4E0A\u9650");
        id(book.vaultId);
        assert(Object.keys(book).every((k) => ["version", "vaultId", "events"].includes(k)), "\u8D26\u672C\u542B\u672A\u5141\u8BB8\u7684\u5B57\u6BB5");
        const map = /* @__PURE__ */ new Map();
        for (const e of book.events) {
          id(e?.id);
          assert(Object.keys(e).every((k) => ["id", "type", "entityId", "parents", "at", "source", "value"].includes(k)), "\u5386\u53F2\u542B\u672A\u5141\u8BB8\u7684\u5B57\u6BB5");
          assert(e && typeof e.id === "string" && e.id.length <= 100 && !map.has(e.id), "\u5386\u53F2\u7F16\u53F7\u91CD\u590D\u6216\u65E0\u6548");
          assert(["account", "asset", "rate"].includes(e.type), "\u5386\u53F2\u7C7B\u578B\u65E0\u6548");
          id(e.entityId);
          assert(Array.isArray(e.parents) && new Set(e.parents).size === e.parents.length && e.parents.length <= 100, "\u5386\u53F2\u7236\u7248\u672C\u65E0\u6548");
          assert(typeof e.at === "string" && e.at.length <= 40 && Number.isFinite(Date.parse(e.at)), "\u5386\u53F2\u65F6\u95F4\u65E0\u6548");
          assert(typeof e.source === "string" && e.source.length <= 100, "\u6765\u6E90\u65E0\u6548");
          if (e.value !== null) {
            assert(e.value?.id === e.entityId, "\u8BB0\u5F55\u7F16\u53F7\u4E0D\u4E00\u81F4");
            assert(canonical(clean(e.type, e.value)) === canonical(e.value), "\u5305\u542B\u4E0D\u5141\u8BB8\u4FDD\u5B58\u7684\u5B57\u6BB5");
          }
          map.set(e.id, e);
        }
        const done = /* @__PURE__ */ new Set(), active = /* @__PURE__ */ new Set();
        for (const initial of book.events) {
          if (done.has(initial.id)) continue;
          const stack = [[initial, false]];
          while (stack.length) {
            const [e, leaving] = stack.pop();
            if (leaving) {
              active.delete(e.id);
              done.add(e.id);
              continue;
            }
            if (done.has(e.id)) continue;
            assert(!active.has(e.id), "\u5386\u53F2\u5F15\u7528\u5F62\u6210\u5FAA\u73AF");
            active.add(e.id);
            stack.push([e, true]);
            for (const pid of e.parents) {
              const p = map.get(pid);
              assert(p && p.type === e.type && p.entityId === e.entityId, "\u5386\u53F2\u7248\u672C\u5F15\u7528\u7F3A\u5931");
              stack.push([p, false]);
            }
          }
        }
        return book;
      }
      function heads(book) {
        const superseded = new Set(book.events.flatMap((e) => e.parents));
        const result = /* @__PURE__ */ new Map();
        for (const e of book.events) if (!superseded.has(e.id)) {
          const key = e.type + ":" + e.entityId;
          if (!result.has(key)) result.set(key, []);
          result.get(key).push(e);
        }
        return result;
      }
      function state2(book) {
        const h = heads(book), s = { accounts: [], assets: [], rates: [], conflicts: [] };
        for (const [key, list] of h) {
          if (list.length > 1) s.conflicts.push({ key, events: list });
          else if (list[0].value) s[{ account: "accounts", asset: "assets", rate: "rates" }[list[0].type]].push({ ...list[0].value, revision: list[0].id });
        }
        return s;
      }
      function edit(book, type, value, options = {}) {
        validate(book);
        const entityId = value === null ? id(options.entityId) : id(value.id);
        const prev = heads(book).get(type + ":" + entityId) || [];
        assert(prev.length < 2 || options.resolve === true, "\u8FD9\u6761\u8BB0\u5F55\u6709\u540C\u6B65\u51B2\u7A81\uFF0C\u8BF7\u5148\u5904\u7406");
        if (options.expected !== void 0) assert(canonical(prev.map((e2) => e2.id).sort()) === canonical(options.expected.slice().sort()), "\u8BB0\u5F55\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u6253\u5F00\u518D\u4FEE\u6539");
        const c = clean(type, value);
        if (c && prev.length === 1 && canonical(c) === canonical(prev[0].value)) return book;
        if (type === "asset" && c) assert(state2(book).accounts.some((a) => a.id === c.accountId), "\u6240\u5C5E\u8D26\u6237\u4E0D\u5B58\u5728\u6216\u6709\u51B2\u7A81");
        const e = { id: options.eventId || newId(), type, entityId, parents: prev.map((x) => x.id).sort(), at: options.at || (/* @__PURE__ */ new Date()).toISOString(), source: options.source || "manual", value: c };
        assert(!book.events.some((x) => x.id === e.id), "\u5386\u53F2\u7F16\u53F7\u91CD\u590D");
        return validate({ ...book, events: [...book.events, e] });
      }
      function merge(a, b) {
        validate(a);
        validate(b);
        assert(a.vaultId === b.vaultId, "\u8FDC\u7AEF\u5C5E\u4E8E\u53E6\u4E00\u4E2A\u8D26\u672C\uFF1B\u8BF7\u4F7F\u7528\u201C\u4E0B\u8F7D\u5DF2\u6709\u8D26\u672C\u201D\u8FDE\u63A5\uFF0C\u672A\u8986\u76D6\u4EFB\u4F55\u6570\u636E");
        const map = new Map(a.events.map((e) => [e.id, e]));
        for (const e of b.events) {
          assert(!map.has(e.id) || canonical(map.get(e.id)) === canonical(e), "\u76F8\u540C\u5386\u53F2\u7F16\u53F7\u7684\u5185\u5BB9\u4E0D\u4E00\u81F4");
          map.set(e.id, e);
        }
        return validate({ ...a, events: [...map.values()].sort((a2, b2) => a2.at.localeCompare(b2.at) || a2.id.localeCompare(b2.id)) });
      }
      function convert(n, from, to, rates) {
        if (from === to) return n;
        const rate = (c) => c === "CNY" ? SCALE : rates.find((r) => r.id === c) ? decimal(rates.find((r) => r.id === c).rate) : null;
        const a = rate(from), b = rate(to);
        return a === null || b === null ? null : divide(n * a, b);
      }
      function summary2(book, base2 = "CNY") {
        const s = state2(book);
        let assets = 0n, debt = 0n, cash = 0n;
        const groups = {}, currencies = {}, missing = [];
        for (const p of s.assets) {
          if (!s.accounts.some((a) => a.id === p.accountId)) {
            missing.push(p.id);
            continue;
          }
          const n = convert(decimal(p.amount), p.currency, base2, s.rates);
          if (n === null) {
            missing.push(p.id);
            continue;
          }
          if (p.category === "debt") {
            debt += n;
            continue;
          }
          assets += n;
          if (p.category === "cash") cash += n;
          groups[p.category] = (groups[p.category] || 0n) + n;
          currencies[p.currency] = (currencies[p.currency] || 0n) + n;
        }
        return { ...s, totalAssets: assets, debt, cash, net: assets - debt, groups, currencies, missing, complete: missing.length === 0 && s.conflicts.length === 0 };
      }
      function prepareImport(book, input) {
        assert(input && input.version === 1 && Array.isArray(input.assets), "\u66F4\u65B0\u5305\u683C\u5F0F\u9519\u8BEF\uFF0C\u9700 version: 1 \u548C assets \u6570\u7EC4");
        const batch = id(input.batchId);
        assert(input.assets.length <= 5e3 && (input.accounts || []).length <= 1e3 && (input.rates || []).length <= 20, "\u66F4\u65B0\u5305\u8FC7\u5927");
        const keys = /* @__PURE__ */ new Set(), changes = [];
        for (const type of ["account", "asset", "rate"]) for (const raw of input[{ account: "accounts", asset: "assets", rate: "rates" }[type]] || []) {
          const value = clean(type, raw), key = type + ":" + value.id;
          assert(!keys.has(key), "\u66F4\u65B0\u5305\u5B58\u5728\u91CD\u590D\u8BB0\u5F55\u7F16\u53F7");
          keys.add(key);
          const h = heads(book).get(key) || [];
          assert(h.length < 2, "\u66F4\u65B0\u6D89\u53CA\u51B2\u7A81\u8BB0\u5F55\uFF0C\u8BF7\u5148\u5904\u7406\u51B2\u7A81");
          if (h.length && canonical(h[0].value) === canonical(value)) continue;
          assert(!book.events.some((e) => e.source === "import:" + batch), "\u6B64\u6279\u6B21\u7F16\u53F7\u5DF2\u4F7F\u7528\u4E14\u5185\u5BB9\u6709\u53D8\u5316\uFF0C\u8BF7\u751F\u6210\u65B0\u6279\u6B21\u7F16\u53F7");
          if (type === "asset" && h[0]?.value) assert(value.date >= h[0].value.date, "\u66F4\u65B0\u5305\u5305\u542B\u8F83\u65E7\u8D44\u4EA7\u5FEB\u7167\uFF1A" + value.name);
          changes.push({ type, value, expected: h.map((e) => e.id), action: h.length ? "\u66F4\u65B0" : "\u65B0\u589E" });
        }
        let test = book;
        for (const c of changes) test = edit(test, c.type, c.value, { expected: c.expected, source: "import:" + batch });
        return { batch, changes, ignored: (input.accounts || []).length + input.assets.length + (input.rates || []).length - changes.length };
      }
      function applyImport(book, plan) {
        let next = book;
        for (const c of plan.changes) next = edit(next, c.type, c.value, { expected: c.expected, source: "import:" + plan.batch });
        return next;
      }
      var MAX_TEXT = 8 * 1024 * 1024;
      function decode(text, label = "\u8D26\u672C") {
        assert(typeof text === "string", "\u6CA1\u6709\u53EF\u8BFB\u53D6\u7684\u5185\u5BB9");
        assert(text.length < MAX_TEXT, "" + label + "\u8D85\u8FC7 8 MiB \u4E0A\u9650\uFF0C\u8BF7\u5148\u5F52\u6863\u5386\u53F2");
        let value;
        try {
          value = JSON.parse(text);
        } catch {
          throw new Error(label + "\u4E0D\u662F\u6709\u6548\u7684 JSON\uFF0C\u672A\u4FEE\u6539\u4EFB\u4F55\u6570\u636E");
        }
        return validate(value);
      }
      module.exports = { SCALE, CURRENCIES, CATEGORIES, MAX_TEXT, decimal, dec, divide, mul, money, date, id, clean, empty, validate, canonical, heads, state: state2, edit, merge, convert, summary: summary2, prepareImport, applyImport, newId, assert, decode };
    }
  });

  // asset-plugin/src/demo-data.js
  var require_demo_data = __commonJS({
    "asset-plugin/src/demo-data.js"(exports, module) {
      "use strict";
      var rates = Object.freeze({ CNY: 1, HKD: 0.9, USD: 7, SGD: 5.2 });
      var providers = [
        ["cmb", "\u62DB\u5546\u94F6\u884C", "\u4E2D\u56FD\u5185\u5730", "\u8D26\u5355\u5BFC\u5165", "\u6D3B\u671F\u3001\u5B9A\u5B58\u3001\u4FE1\u7528\u5361\u5206\u522B\u5BFC\u5165\uFF1B\u7406\u8D22\u4E0E\u57FA\u91D1\u9700\u8981\u5BF9\u5E94\u4EA7\u54C1\u660E\u7EC6\u3002", "\u672A\u6838\u5B9E\u4E2A\u4EBA\u76F4\u8FDE", "\u62DB"],
        ["boc", "\u4E2D\u56FD\u94F6\u884C", "\u4E2D\u56FD\u5185\u5730", "\u8D26\u5355\u5BFC\u5165", "\u9700\u4E2A\u4EBA\u94F6\u884C\u8D26\u5355\uFF0C\u4E0D\u80FD\u628A\u5BF9\u516C\u5F00\u653E\u94F6\u884C\u63A5\u53E3\u5F53\u4F5C\u4E2A\u4EBA\u63A5\u53E3\u3002", "\u672A\u6838\u5B9E\u4E2A\u4EBA\u76F4\u8FDE", "\u4E2D"],
        ["abc", "\u519C\u4E1A\u94F6\u884C", "\u4E2D\u56FD\u5185\u5730", "\u8D26\u5355\u5BFC\u5165", "\u9700\u9A8C\u8BC1\u4E2A\u4EBA\u8D26\u5355\u683C\u5F0F\u3001\u5B9A\u5B58\u660E\u7EC6\u548C\u5916\u5E01\u8D26\u6237\u8986\u76D6\u3002", "\u5F85\u6837\u672C\u9A8C\u8BC1", "\u519C"],
        ["citic", "\u4E2D\u4FE1\u94F6\u884C", "\u4E2D\u56FD\u5185\u5730", "\u8D26\u5355\u5BFC\u5165", "\u5185\u5730\u4E2D\u4FE1\u4E0E\u4E2D\u4FE1\u94F6\u884C\uFF08\u56FD\u9645\uFF09\u662F\u4E0D\u540C\u63A5\u5165\u5BF9\u8C61\u3002", "\u5F85\u6837\u672C\u9A8C\u8BC1", "\u4FE1"],
        ["ccb", "\u5EFA\u8BBE\u94F6\u884C", "\u4E2D\u56FD\u5185\u5730", "\u8D26\u5355\u5BFC\u5165", "\u94F6\u4F01\u67E5\u8BE2\u670D\u52A1\u4E0D\u80FD\u63A8\u5B9A\u666E\u901A\u4E2A\u4EBA\u53EF\u7528\uFF1B\u4F18\u5148\u9A8C\u8BC1\u4E2A\u4EBA\u5B98\u65B9\u8D26\u5355\u3002", "\u5F85\u6837\u672C\u9A8C\u8BC1", "\u5EFA"],
        ["wechat", "\u5FAE\u4FE1\u652F\u4ED8", "\u4E2D\u56FD\u5185\u5730", "\u8D26\u5355\u5BFC\u5165", "\u6D88\u8D39\u6D41\u6C34\u4E0E\u94F6\u884C\u5361\u6263\u6B3E\u9700\u53BB\u91CD\uFF1B\u96F6\u94B1\u901A\u6301\u4ED3\u53E6\u53D6\u3002", "\u4EA4\u6613\u4E0D\u7B49\u4E8E\u5168\u90E8\u8D44\u4EA7", "\u5FAE"],
        ["alipay", "\u652F\u4ED8\u5B9D", "\u4E2D\u56FD\u5185\u5730", "\u8D26\u5355\u5BFC\u5165", "\u4F59\u989D\u3001\u4F59\u989D\u5B9D\u3001\u57FA\u91D1\u548C\u82B1\u5457\u5206\u5F00\uFF1B\u5546\u5BB6\u63A5\u53E3\u4E0D\u662F\u4E2A\u4EBA\u5168\u90E8\u6D41\u6C34\u3002", "\u4EA4\u6613\u4E0D\u7B49\u4E8E\u5168\u90E8\u8D44\u4EA7", "\u652F"],
        ["bochk", "\u4E2D\u94F6\u9999\u6E2F", "\u4E2D\u56FD\u9999\u6E2F", "\u9700\u9A8C\u8BC1\u8D44\u683C", "\u5F00\u653E\u94F6\u884C\u5B58\u5728 TSP \u6388\u6743\u8DEF\u5F84\uFF1B\u4E2A\u4EBA\u81EA\u5EFA\u63A5\u5165\u4E0E\u6295\u8D44\u4EA7\u54C1\u8986\u76D6\u9700\u9A8C\u8BC1\u3002", "\u6709\u6761\u4EF6\u63A5\u5165", "\u4E2D"],
        ["hsbc", "\u6C47\u4E30\u9999\u6E2F", "\u4E2D\u56FD\u9999\u6E2F", "\u9700\u9A8C\u8BC1\u8D44\u683C", "\u4E2A\u4EBA\u8D26\u6237\u4FE1\u606F API \u9700\u8981 TSP \u51C6\u5165\uFF1B\u5B58\u6B3E\u4E0E\u94F6\u884C\u8BC1\u5238\u6301\u4ED3\u5206\u5F00\u6838\u9A8C\u3002", "\u6709\u6761\u4EF6\u63A5\u5165", "\u6C47"],
        ["za", "\u4F17\u5B89\u94F6\u884C ZA", "\u4E2D\u56FD\u9999\u6E2F", "\u9700\u9A8C\u8BC1\u8D44\u683C", "\u4E2A\u4EBA\u751F\u4EA7\u63A5\u53E3\u3001\u5B9A\u5B58\u548C\u6295\u8D44\u4EA7\u54C1\u7684\u8986\u76D6\u5C1A\u672A\u5B9E\u6D4B\u3002", "\u6709\u6761\u4EF6\u63A5\u5165", "ZA"],
        ["icbc", "\u5DE5\u94F6\u4E9A\u6D32", "\u4E2D\u56FD\u9999\u6E2F", "\u9700\u9A8C\u8BC1\u8D44\u683C", "\u5B98\u7F51\u5217\u4E2A\u4EBA\u8D26\u6237\u4FE1\u606F\u67E5\u8BE2\uFF1B\u5B9E\u9645\u51C6\u5165\u4E0E\u6570\u636E\u8303\u56F4\u4ECD\u9700\u786E\u8BA4\u3002", "\u6709\u6761\u4EF6\u63A5\u5165", "\u5DE5"],
        ["dbs", "DBS / POSB", "\u65B0\u52A0\u5761", "\u8D26\u5355\u5BFC\u5165", "SGFinDex \u662F\u53C2\u4E0E\u673A\u6784\u7684\u5171\u4EAB\u673A\u5236\uFF0C\u4E0D\u7B49\u4E8E\u5F00\u653E\u7ED9\u4E2A\u4EBA\u81EA\u5EFA\u7A0B\u5E8F\u7684\u901A\u7528 API\u3002", "\u4E2A\u4EBA\u76F4\u8FDE\u5F85\u6838\u5B9E", "D"],
        ["wise", "Wise", "\u8DE8\u5883\u94B1\u5305", "\u9700\u9A8C\u8BC1\u8D44\u683C", "\u6838\u5B9E\u8D26\u6237\u5730\u533A\u3001\u4E2A\u4EBA/\u4F01\u4E1A\u7C7B\u578B\u3001token \u6743\u9650\u548C\u4F59\u989D/\u8D26\u5355\u53EF\u8BFB\u8303\u56F4\u3002", "\u6709\u6761\u4EF6\u63A5\u5165", "W"],
        ["paypal", "PayPal", "\u8DE8\u5883\u94B1\u5305", "\u9700\u9A8C\u8BC1\u8D44\u683C", "\u751F\u4EA7 REST \u96C6\u6210\u8981\u6C42 Business \u8D26\u6237\uFF1B\u4E2A\u4EBA\u8D26\u6237\u5148\u6838\u5B9E\u8D26\u5355\u5BFC\u51FA\u3002", "\u6309\u8D26\u6237\u7C7B\u578B\u9A8C\u8BC1", "P"],
        ["virtual", "\u5176\u4ED6\u865A\u62DF\u5361", "\u8DE8\u5883\u94B1\u5305", "\u9700\u9A8C\u8BC1\u8D44\u683C", "\u6309\u5B9E\u9645\u53D1\u5361\u673A\u6784\u6838\u9A8C\uFF1B\u591A\u5F20\u5361\u5171\u4EAB\u540C\u4E00\u8D44\u91D1\u6C60\u65F6\u53EA\u8BA1\u7B97\u4E00\u6B21\u3002", "\u9700\u5177\u4F53\u4EA7\u54C1\u540D\u79F0", "\u5361"],
        ["cnsecurities", "\u5185\u5730\u5238\u5546 / \u540C\u82B1\u987A", "\u4E2D\u56FD\u5185\u5730", "\u8D26\u5355\u5BFC\u5165", "\u9700\u5B9E\u9645\u5F00\u6237\u5238\u5546\u540D\u79F0\uFF1B\u540C\u82B1\u987A\u662F\u5165\u53E3\uFF0C\u4E0D\u80FD\u7528\u884C\u60C5 API \u83B7\u53D6\u4E2A\u4EBA\u4ED3\u4F4D\u3002", "\u9700\u5238\u5546\u4FE1\u606F", "\u8BC1"],
        ["futu", "\u5BCC\u9014 Futu", "\u6D77\u5916\u8BC1\u5238", "\u5B98\u65B9\u67E5\u8BE2\u8DEF\u5F84", "Mac \u672C\u5730 OpenD \u53EF\u67E5\u8BE2\u8D44\u4EA7/\u6301\u4ED3\uFF1B\u767B\u5F55\u4F1A\u8BDD\u4E0D\u7B49\u4E8E\u673A\u6784\u5C42\u53EA\u8BFB token\u3002", "\u9700\u5B89\u88C5\u4E0E\u8D26\u6237\u5B9E\u6D4B", "\u5BCC"],
        ["ibkr", "Interactive Brokers", "\u6D77\u5916\u8BC1\u5238", "\u5B98\u65B9\u67E5\u8BE2\u8DEF\u5F84", "Flex Web Service \u62C9\u53D6\u914D\u7F6E\u597D\u7684\u62A5\u8868\u3002\u9002\u5408\u5B9A\u65F6\u6C47\u603B\uFF0C\u4E0D\u662F\u5B9E\u65F6\u884C\u60C5\u63A5\u53E3\u3002", "\u9700\u672C\u5730\u914D\u7F6E\u67E5\u8BE2 token", "IB"],
        ["binance", "\u5E01\u5B89 Binance", "\u52A0\u5BC6\u8D44\u4EA7", "\u5B98\u65B9\u67E5\u8BE2\u8DEF\u5F84", "\u53EA\u8BFB API Key\uFF1B\u73B0\u8D27\u3001\u8D44\u91D1\u3001\u7406\u8D22\u3001\u6760\u6746\u3001\u5408\u7EA6\u9010\u9879\u9002\u914D\u3002", "\u9700\u9A8C\u8BC1\u5BC6\u94A5\u6743\u9650", "B"],
        ["safepal", "SafePal / \u94FE\u4E0A\u94B1\u5305", "\u52A0\u5BC6\u8D44\u4EA7", "\u5B98\u65B9\u67E5\u8BE2\u8DEF\u5F84", "\u7528\u5730\u5740\u89C2\u5BDF\u5404\u6761\u94FE\uFF0C\u4E0D\u9700\u8981\u52A9\u8BB0\u8BCD\uFF1BDeFi \u548C\u591A\u5730\u5740\u4F59\u989D\u9700\u4E13\u95E8\u9002\u914D\u3002", "\u9700\u786E\u5B9A\u94FE\u4E0E\u5730\u5740\u8303\u56F4", "S"],
        ["other", "\u5176\u4ED6\u8D44\u4EA7", "\u5176\u4ED6", "\u4F30\u503C\u8BB0\u5F55", "\u623F\u4EA7\u3001\u4FDD\u5355\u73B0\u91D1\u4EF7\u503C\u3001\u5B9E\u7269\u6216\u501F\u51FA\u6B3E\u6309\u6765\u6E90\u4E0E\u4F30\u503C\u65E5\u8BB0\u5F55\u3002", "\u4F30\u503C\u6765\u6E90\u9700\u786E\u8BA4", "\u25C7"]
      ].map(([id, name, region, route2, note, condition, mark]) => ({ id, name, region, route: route2, note, condition, mark }));
      var positions = [
        { id: "p1", account: "cmb", name: "\u4EBA\u6C11\u5E01\u6D3B\u671F", category: 0, currency: "CNY", quantity: 1, price: 38600, date: "2026-09-30", info: "\u8D26\u9762\u4F59\u989D\u542B\u51BB\u7ED3\u90E8\u5206\uFF1B\u6B64\u793A\u4F8B\u65E0\u51BB\u7ED3\u91D1\u989D\u3002", liquid: true },
        { id: "p2", account: "cmb", name: "\u4E09\u4E2A\u6708\u5B9A\u671F\u5B58\u6B3E", category: 1, currency: "CNY", quantity: 1, price: 1e5, date: "2026-09-30", maturity: "2026-10-18", apr: "1.20%", start: "2026-07-18", info: "\u672C\u91D1\u4F30\u503C\uFF1B\u5E94\u8BA1\u5229\u606F\u672A\u8BA1\u5165\u603B\u989D\u3002\u5229\u7387\u4E3A\u865A\u6784\u793A\u4F8B\u3002" },
        { id: "p3", account: "hsbc", name: "\u6E2F\u5E01\u50A8\u84C4", category: 0, currency: "HKD", quantity: 1, price: 48e3, date: "2026-09-30", info: "\u4E0E\u8BC1\u5238\u7ED3\u7B97\u8D44\u91D1\u5206\u5F00\u3002", liquid: true },
        { id: "p4", account: "hsbc", name: "\u7F8E\u5143\u5B9A\u671F\u5B58\u6B3E", category: 1, currency: "USD", quantity: 1, price: 15e3, date: "2026-09-30", maturity: "2026-12-12", apr: "3.50%", start: "2026-09-12", info: "\u672C\u91D1\u4F30\u503C\uFF1B\u5230\u671F\u5904\u7406\u793A\u4F8B\u4E3A\u672C\u606F\u8F6C\u6D3B\u671F\u3002" },
        { id: "p5", account: "hsbc", name: "\u817E\u8BAF\u63A7\u80A1", symbol: "HK.00700", category: 2, currency: "HKD", quantity: 200, price: 420, cost: 390, date: "2026-09-30", info: "\u94F6\u884C\u8BC1\u5238\u5B50\u8D26\u6237\u3002\u6301\u4ED3\u4E0E\u94F6\u884C\u6C47\u603B\u53EA\u8BA1\u7B97\u4E00\u6B21\u3002" },
        { id: "p6", account: "dbs", name: "\u65B0\u5143\u50A8\u84C4", category: 0, currency: "SGD", quantity: 1, price: 12600, date: "2026-09-28", info: "\u6B64\u793A\u4F8B\u6E90\u6570\u636E\u8F83\u65E9\uFF0C\u9700\u8981\u66F4\u65B0\u3002", liquid: true, stale: true },
        { id: "p7", account: "dbs", name: "\u65B0\u5143\u5B9A\u671F\u5B58\u6B3E", category: 1, currency: "SGD", quantity: 1, price: 2e4, date: "2026-09-28", maturity: "2027-01-08", apr: "2.10%", start: "2026-07-08", info: "\u672C\u91D1\u4F30\u503C\uFF1B\u63D0\u524D\u652F\u53D6\u6761\u6B3E\u9700\u4ECE\u771F\u5B9E\u5408\u7EA6\u53D6\u5F97\u3002", stale: true },
        { id: "p8", account: "wise", name: "\u7F8E\u5143\u4F59\u989D", category: 0, currency: "USD", quantity: 1, price: 1600, date: "2026-09-30", info: "\u5B9E\u4F53\u5361\u548C\u865A\u62DF\u5361\u5171\u4EAB\u6B64\u8D44\u91D1\u6C60\uFF0C\u4E0D\u518D\u6B21\u7D2F\u8BA1\u5361\u4F59\u989D\u3002", liquid: true },
        { id: "p9", account: "wise", name: "\u65B0\u5143\u4F59\u989D", category: 0, currency: "SGD", quantity: 1, price: 850, date: "2026-09-30", info: "\u4E0E\u7F8E\u5143\u4F59\u989D\u4E3A\u72EC\u7ACB\u5E01\u79CD\u5B50\u8D26\u6237\u3002", liquid: true },
        { id: "p10", account: "wechat", name: "\u96F6\u94B1", category: 0, currency: "CNY", quantity: 1, price: 680, date: "2026-09-30", info: "\u4E0D\u5305\u62EC\u5FAE\u4FE1\u96F6\u94B1\u901A\u3002\u96F6\u94B1\u901A\u672A\u7EB3\u5165\u6B64\u793A\u4F8B\u3002", liquid: true },
        { id: "p11", account: "alipay", name: "\u4F59\u989D", category: 0, currency: "CNY", quantity: 1, price: 320, date: "2026-09-30", info: "\u94F6\u884C\u5361\u7ED1\u5B9A\u5173\u7CFB\u4E0D\u662F\u652F\u4ED8\u5B9D\u8D44\u4EA7\u3002", liquid: true },
        { id: "p12", account: "alipay", name: "\u8D27\u5E01\u57FA\u91D1\uFF08\u4F59\u989D\u5B9D\u793A\u4F8B\uFF09", symbol: "DEMO-MMF", category: 3, currency: "CNY", quantity: 18e3, price: 1, date: "2026-09-30", info: "\u865A\u6784\u8D27\u5E01\u57FA\u91D1\u793A\u4F8B\uFF1B\u5B9E\u9645\u57FA\u91D1\u540D\u79F0\u548C\u4EFD\u989D\u4EE5\u4EA7\u54C1\u6301\u4ED3\u4E3A\u51C6\u3002" },
        { id: "p13", account: "cnsecurities", name: "\u6CAA\u6DF1 300 ETF\uFF08\u793A\u4F8B\uFF09", symbol: "SH.510300", category: 2, currency: "CNY", quantity: 6e3, price: 4.2, cost: 4, date: "2026-09-30", info: "\u771F\u5B9E\u6570\u636E\u6765\u6E90\u5E94\u4E3A\u5B9E\u9645\u5238\u5546\u3002\u540C\u82B1\u987A\u4E0D\u989D\u5916\u521B\u5EFA\u4E00\u4EFD\u76F8\u540C\u6301\u4ED3\u3002" },
        { id: "p14", account: "futu", name: "\u963F\u91CC\u5DF4\u5DF4", symbol: "HK.09988", category: 2, currency: "HKD", quantity: 300, price: 110, cost: 100, date: "2026-09-30", info: "\u6570\u91CF\u548C\u884C\u60C5\u5747\u4E3A\u6F14\u793A\u3002" },
        { id: "p15", account: "ibkr", name: "Vanguard S&P 500 ETF", symbol: "US.VOO", category: 2, currency: "USD", quantity: 35, price: 520, cost: 480, date: "2026-09-30", info: "\u6309\u62A5\u8868\u65F6\u70B9\u4F30\u503C\uFF1B\u4E0D\u4EE3\u8868\u5F53\u524D\u5E02\u573A\u4EF7\u3002" },
        { id: "p16", account: "ibkr", name: "\u7F8E\u5143\u7ED3\u7B97\u73B0\u91D1", category: 0, currency: "USD", quantity: 1, price: 2200, date: "2026-09-30", info: "\u73B0\u91D1\u4E0E\u6301\u4ED3\u5206\u5217\uFF0C\u603B\u8D44\u4EA7\u7531\u660E\u7EC6\u6C42\u548C\u3002", liquid: true },
        { id: "p17", account: "binance", name: "Bitcoin", symbol: "BTC", category: 4, currency: "USD", quantity: 0.12, price: 9e4, cost: 8e4, date: "2026-09-30", info: "\u73B0\u8D27\u793A\u4F8B\u3002\u7406\u8D22\u548C\u5408\u7EA6\u672A\u7EB3\u5165\u6B64\u6F14\u793A\u3002" },
        { id: "p18", account: "binance", name: "Tether USD", symbol: "USDT", category: 4, currency: "USD", quantity: 2400, price: 0.999, date: "2026-09-30", info: "\u6F14\u793A\u4EF7\u4E3A 0.999 USD\uFF0C\u5E76\u975E\u56FA\u5B9A\u6309 1 \u7F8E\u5143\u8BA1\u7B97\u3002" },
        { id: "p19", account: "safepal", name: "Ethereum", symbol: "ETH \xB7 Ethereum", category: 4, currency: "USD", quantity: 1.4, price: 3200, date: "2026-09-30", info: "\u89C2\u5BDF\u5730\u5740\u4F59\u989D\uFF1B\u6CA1\u6709\u5BFC\u5165\u79C1\u94A5\u3002\u6210\u672C\u5386\u53F2\u4E0D\u8DB3\uFF0C\u56E0\u6B64\u4E0D\u663E\u793A\u6536\u76CA\u3002" },
        { id: "p20", account: "other", name: "\u5B9E\u7269\u9EC4\u91D1 \xB7 20 g", category: 5, currency: "CNY", quantity: 20, price: 650, date: "2026-09-25", info: "\u4EBA\u5DE5\u4F30\u503C\u793A\u4F8B\uFF0C\u975E\u5B9E\u65F6\u884C\u60C5\u6216\u53EF\u6210\u4EA4\u56DE\u8D2D\u4EF7\u3002", stale: true }
      ];
      var liabilities = [{ account: "cmb", name: "\u4FE1\u7528\u5361\u5F85\u8FD8\u6B3E\uFF08\u793A\u4F8B\uFF09", amount: 4200, currency: "CNY", date: "2026-09-30" }];
      module.exports = { rates, providers, positions, liabilities };
    }
  });

  // asset-plugin/src/demo.js
  var require_demo = __commonJS({
    "asset-plugin/src/demo.js"(exports, module) {
      "use strict";
      var C2 = require_core();
      var data = require_demo_data();
      function demo2() {
        let book = { version: 1, vaultId: "demo-ledger", events: [] };
        const type = ["cash", "deposit", "stock", "fund", "crypto", "other"];
        for (const p of data.providers.filter((p2) => data.positions.some((x) => x.account === p2.id))) {
          book = C2.edit(book, "account", { id: p.id, name: p.name, institution: p.name, region: p.region, logo: p.id }, { at: "2026-09-15T08:00:00.000Z", source: "demo" });
        }
        for (const [id, rate] of Object.entries(data.rates)) if (id !== "CNY") book = C2.edit(book, "rate", { id, rate: String(rate), date: "2026-09-15", source: "\u6F14\u793A\u6C47\u7387" }, { at: "2026-09-15T08:01:00.000Z", source: "demo" });
        for (const p of data.positions) {
          const value = { id: p.id, accountId: p.account, name: p.name, category: type[p.category], currency: p.currency, date: "2026-09-15", amount: String(p.price * p.quantity), symbol: p.symbol, maturity: p.maturity, apr: p.apr?.replace("%", ""), note: "\u865A\u6784\u793A\u4F8B" };
          if (p.category >= 2) {
            value.quantity = String(p.quantity);
            value.unitPrice = String(p.price);
            value.amount = void 0;
            if (p.cost !== void 0) value.unitCost = String(p.cost);
          }
          book = C2.edit(book, "asset", value, { at: "2026-09-15T08:02:00.000Z", source: "demo" });
        }
        book = C2.edit(book, "asset", { id: "debt-cmb", accountId: "cmb", name: "\u4FE1\u7528\u5361\u5F85\u8FD8\u6B3E", category: "debt", currency: "CNY", amount: "4200", date: "2026-09-15" }, { at: "2026-09-15T08:03:00.000Z", source: "demo" });
        for (const [date, amount2] of [["2026-09-30", "42600"], ["2026-10-05", "48600"]]) {
          const p = C2.state(book).assets.find((x) => x.id === "p1");
          book = C2.edit(book, "asset", { ...p, amount: amount2, date }, { at: date + "T08:00:00.000Z", source: "demo" });
        }
        return book;
      }
      module.exports = { demo: demo2 };
    }
  });

  // pwa/src/store.js
  var require_store = __commonJS({
    "pwa/src/store.js"(exports, module) {
      "use strict";
      var DB_NAME = "private-assets-pwa";
      var STORE = "state";
      function openDb() {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(DB_NAME, 1);
          request.onupgradeneeded = () => request.result.createObjectStore(STORE);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
      async function withStore(mode, action) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, mode);
          const request = action(tx.objectStore(STORE));
          let result;
          request.onsuccess = () => {
            result = request.result;
          };
          tx.oncomplete = () => {
            db.close();
            resolve(result);
          };
          tx.onerror = tx.onabort = () => {
            db.close();
            reject(tx.error || request.error);
          };
        });
      }
      var read = (key) => withStore("readonly", (store) => store.get(key));
      var write = (key, value) => withStore("readwrite", (store) => store.put(value, key));
      module.exports = { read, write };
    }
  });

  // pwa/src/ledger.js
  var require_ledger = __commonJS({
    "pwa/src/ledger.js"(exports, module) {
      "use strict";
      var C2 = require_core();
      var store = require_store();
      var Ledger2 = class {
        constructor() {
          this.book = null;
          this.syncState = "\u4EC5\u672C\u673A";
          this.listeners = /* @__PURE__ */ new Set();
        }
        async load() {
          const saved = await store.read("ledger");
          this.book = saved ? C2.validate(saved) : C2.empty();
          this.emit();
          return this.book;
        }
        subscribe(listener) {
          this.listeners.add(listener);
          return () => this.listeners.delete(listener);
        }
        emit() {
          for (const listener of this.listeners) listener(this.book);
        }
        async save(next) {
          const validated = C2.validate(next);
          await store.write("ledger", validated);
          this.book = validated;
          this.syncState = "\u672C\u673A\u5DF2\u4FDD\u5B58";
          this.emit();
          return validated;
        }
        async update(fn) {
          return this.save(fn(this.book));
        }
        async replace(next) {
          return this.save(next);
        }
      };
      module.exports = { Ledger: Ledger2 };
    }
  });

  // pwa/src/onedrive.js
  var require_onedrive = __commonJS({
    "pwa/src/onedrive.js"(exports, module) {
      "use strict";
      var C2 = require_core();
      var FILE_PATH = "asset-ledger.json";
      var GRAPH = "https://graph.microsoft.com/v1.0/me/drive/special/approot:";
      var OneDriveLedger2 = class {
        constructor(tokenProvider) {
          this.tokenProvider = tokenProvider;
        }
        async request(path, options = {}) {
          const token = await this.tokenProvider();
          const response = await fetch(GRAPH + path, {
            ...options,
            headers: {
              Authorization: `Bearer ${token}`,
              ...options.headers
            }
          });
          if (response.status === 401 || response.status === 403) {
            throw new Error("OneDrive \u767B\u5F55\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u8FDE\u63A5");
          }
          return response;
        }
        async read() {
          const meta = await this.request(`/${FILE_PATH}`);
          if (meta.status === 404) return null;
          if (!meta.ok) throw new Error("\u65E0\u6CD5\u8BFB\u53D6 OneDrive \u8D26\u672C\u4FE1\u606F");
          const metadata = await meta.json();
          const file = await this.request(`/${FILE_PATH}:/content`);
          if (!file.ok) throw new Error("\u65E0\u6CD5\u4E0B\u8F7D OneDrive \u8D26\u672C");
          const text = await file.text();
          if (text.length > 12 * 1024 * 1024) throw new Error("OneDrive \u8D26\u672C\u8D85\u8FC7 12 MiB \u4E0A\u9650");
          let book;
          try {
            book = C2.validate(JSON.parse(text));
          } catch {
            throw new Error("OneDrive \u8D26\u672C\u683C\u5F0F\u65E0\u6548\uFF0C\u672A\u8986\u76D6\u672C\u673A\u6570\u636E");
          }
          return { book, etag: metadata.eTag };
        }
        async write(book, etag) {
          const text = JSON.stringify(C2.validate(book));
          const response = await this.request(`/${FILE_PATH}:/content`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...etag ? { "If-Match": etag } : { "If-None-Match": "*" }
            },
            body: text
          });
          if (response.status === 409 || response.status === 412) {
            const error = new Error("OneDrive \u8D26\u672C\u521A\u521A\u88AB\u53E6\u4E00\u53F0\u8BBE\u5907\u66F4\u65B0");
            error.conflict = true;
            throw error;
          }
          if (!response.ok) throw new Error("OneDrive \u4FDD\u5B58\u5931\u8D25\uFF0C\u672C\u673A\u4FEE\u6539\u5DF2\u4FDD\u7559");
          return (await response.json()).eTag;
        }
        async sync(local, persist) {
          let combined = C2.validate(local);
          for (let attempt = 0; attempt < 3; attempt += 1) {
            const remote = await this.read();
            if (remote) {
              if (combined.events.length === 0) combined = remote.book;
              else if (remote.book.events.length > 0) combined = C2.merge(combined, remote.book);
              await persist(combined);
              if (C2.state(combined).conflicts.length) {
                return { book: combined, status: "conflict", uploaded: false };
              }
              if (C2.canonical(combined.events) === C2.canonical(remote.book.events)) {
                return { book: combined, status: "synced", uploaded: false };
              }
            }
            try {
              await this.write(combined, remote?.etag);
              return { book: combined, status: "synced", uploaded: true };
            } catch (error) {
              if (!error.conflict || attempt === 2) throw error;
            }
          }
          throw new Error("OneDrive \u540C\u6B65\u91CD\u8BD5\u5931\u8D25\uFF0C\u672C\u673A\u4FEE\u6539\u5DF2\u4FDD\u7559");
        }
      };
      module.exports = { OneDriveLedger: OneDriveLedger2, FILE_PATH };
    }
  });

  // node_modules/@azure/msal-browser/lib/msal-browser.cjs
  var require_msal_browser = __commonJS({
    "node_modules/@azure/msal-browser/lib/msal-browser.cjs"(exports) {
      "use strict";
      var Constants = {
        LIBRARY_NAME: "MSAL.JS",
        SKU: "msal.js.common",
        // default authority
        DEFAULT_AUTHORITY: "https://login.microsoftonline.com/common/",
        DEFAULT_AUTHORITY_HOST: "login.microsoftonline.com",
        DEFAULT_COMMON_TENANT: "common",
        // ADFS String
        ADFS: "adfs",
        DSTS: "dstsv2",
        // Default AAD Instance Discovery Endpoint
        AAD_INSTANCE_DISCOVERY_ENDPT: "https://login.microsoftonline.com/common/discovery/instance?api-version=1.1&authorization_endpoint=",
        // CIAM URL
        CIAM_AUTH_URL: ".ciamlogin.com",
        AAD_TENANT_DOMAIN_SUFFIX: ".onmicrosoft.com",
        // Resource delimiter - used for certain cache entries
        RESOURCE_DELIM: "|",
        // Placeholder for non-existent account ids/objects
        NO_ACCOUNT: "NO_ACCOUNT",
        // Claims
        CLAIMS: "claims",
        // Consumer UTID
        CONSUMER_UTID: "9188040d-6c67-4c5b-b112-36a304b66dad",
        // Default scopes
        OPENID_SCOPE: "openid",
        PROFILE_SCOPE: "profile",
        OFFLINE_ACCESS_SCOPE: "offline_access",
        EMAIL_SCOPE: "email",
        CODE_GRANT_TYPE: "authorization_code",
        RT_GRANT_TYPE: "refresh_token",
        S256_CODE_CHALLENGE_METHOD: "S256",
        URL_FORM_CONTENT_TYPE: "application/x-www-form-urlencoded;charset=utf-8",
        AUTHORIZATION_PENDING: "authorization_pending",
        NOT_DEFINED: "not_defined",
        EMPTY_STRING: "",
        NOT_APPLICABLE: "N/A",
        NOT_AVAILABLE: "Not Available",
        FORWARD_SLASH: "/",
        IMDS_ENDPOINT: "http://169.254.169.254/metadata/instance/compute/location",
        IMDS_VERSION: "2020-06-01",
        IMDS_TIMEOUT: 2e3,
        AZURE_REGION_AUTO_DISCOVER_FLAG: "TryAutoDetect",
        REGIONAL_AUTH_PUBLIC_CLOUD_SUFFIX: "login.microsoft.com",
        KNOWN_PUBLIC_CLOUDS: [
          "login.microsoftonline.com",
          "login.windows.net",
          "login.microsoft.com",
          "sts.windows.net"
        ],
        SHR_NONCE_VALIDITY: 240,
        INVALID_INSTANCE: "invalid_instance"
      };
      var HttpStatus = {
        SUCCESS: 200,
        SUCCESS_RANGE_START: 200,
        SUCCESS_RANGE_END: 299,
        REDIRECT: 302,
        CLIENT_ERROR: 400,
        CLIENT_ERROR_RANGE_START: 400,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        REQUEST_TIMEOUT: 408,
        GONE: 410,
        TOO_MANY_REQUESTS: 429,
        CLIENT_ERROR_RANGE_END: 499,
        SERVER_ERROR: 500,
        SERVER_ERROR_RANGE_START: 500,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
        SERVER_ERROR_RANGE_END: 599,
        MULTI_SIDED_ERROR: 600
      };
      var HttpMethod = {
        GET: "GET",
        POST: "POST"
      };
      var OIDC_DEFAULT_SCOPES = [
        Constants.OPENID_SCOPE,
        Constants.PROFILE_SCOPE,
        Constants.OFFLINE_ACCESS_SCOPE
      ];
      var OIDC_SCOPES = [...OIDC_DEFAULT_SCOPES, Constants.EMAIL_SCOPE];
      var HeaderNames = {
        CONTENT_TYPE: "Content-Type",
        CONTENT_LENGTH: "Content-Length",
        RETRY_AFTER: "Retry-After",
        CCS_HEADER: "X-AnchorMailbox",
        WWWAuthenticate: "WWW-Authenticate",
        AuthenticationInfo: "Authentication-Info",
        X_MS_REQUEST_ID: "x-ms-request-id",
        X_MS_HTTP_VERSION: "x-ms-httpver"
      };
      var PersistentCacheKeys = {
        ACTIVE_ACCOUNT_FILTERS: "active-account-filters"
        // new cache entry for active_account for a more robust version for browser
      };
      var AADAuthorityConstants = {
        COMMON: "common",
        ORGANIZATIONS: "organizations",
        CONSUMERS: "consumers"
      };
      var ClaimsRequestKeys = {
        ACCESS_TOKEN: "access_token",
        XMS_CC: "xms_cc"
      };
      var PromptValue = {
        LOGIN: "login",
        SELECT_ACCOUNT: "select_account",
        CONSENT: "consent",
        NONE: "none",
        CREATE: "create",
        NO_SESSION: "no_session"
      };
      var OAuthResponseType = {
        CODE: "code",
        IDTOKEN_TOKEN_REFRESHTOKEN: "id_token token refresh_token"
      };
      var ServerResponseType = {
        QUERY: "query",
        FRAGMENT: "fragment"
      };
      var ResponseMode = {
        QUERY: "query"
      };
      var GrantType = {
        AUTHORIZATION_CODE_GRANT: "authorization_code",
        REFRESH_TOKEN_GRANT: "refresh_token"
      };
      var CacheAccountType = {
        MSSTS_ACCOUNT_TYPE: "MSSTS",
        ADFS_ACCOUNT_TYPE: "ADFS",
        GENERIC_ACCOUNT_TYPE: "Generic"
        // NTLM, Kerberos, FBA, Basic etc
      };
      var Separators = {
        CACHE_KEY_SEPARATOR: "-",
        CLIENT_INFO_SEPARATOR: "."
      };
      var CredentialType = {
        ID_TOKEN: "IdToken",
        ACCESS_TOKEN: "AccessToken",
        ACCESS_TOKEN_WITH_AUTH_SCHEME: "AccessToken_With_AuthScheme",
        REFRESH_TOKEN: "RefreshToken"
      };
      var APP_METADATA = "appmetadata";
      var CLIENT_INFO = "client_info";
      var THE_FAMILY_ID = "1";
      var AUTHORITY_METADATA_CONSTANTS = {
        CACHE_KEY: "authority-metadata",
        REFRESH_TIME_SECONDS: 3600 * 24
        // 24 Hours
      };
      var AuthorityMetadataSource = {
        CONFIG: "config",
        CACHE: "cache",
        NETWORK: "network",
        HARDCODED_VALUES: "hardcoded_values"
      };
      var SERVER_TELEM_CONSTANTS = {
        SCHEMA_VERSION: 5,
        MAX_LAST_HEADER_BYTES: 330,
        MAX_CACHED_ERRORS: 50,
        CACHE_KEY: "server-telemetry",
        CATEGORY_SEPARATOR: "|",
        VALUE_SEPARATOR: ",",
        OVERFLOW_TRUE: "1",
        OVERFLOW_FALSE: "0",
        UNKNOWN_ERROR: "unknown_error"
      };
      var AuthenticationScheme = {
        BEARER: "Bearer",
        POP: "pop",
        SSH: "ssh-cert"
      };
      var ThrottlingConstants = {
        // Default time to throttle RequestThumbprint in seconds
        DEFAULT_THROTTLE_TIME_SECONDS: 60,
        // Default maximum time to throttle in seconds, overrides what the server sends back
        DEFAULT_MAX_THROTTLE_TIME_SECONDS: 3600,
        // Prefix for storing throttling entries
        THROTTLING_PREFIX: "throttling",
        // Value assigned to the x-ms-lib-capability header to indicate to the server the library supports throttling
        X_MS_LIB_CAPABILITY_VALUE: "retry-after, h429"
      };
      var Errors = {
        INVALID_GRANT_ERROR: "invalid_grant",
        CLIENT_MISMATCH_ERROR: "client_mismatch"
      };
      var RegionDiscoverySources = {
        FAILED_AUTO_DETECTION: "1",
        INTERNAL_CACHE: "2",
        ENVIRONMENT_VARIABLE: "3",
        IMDS: "4"
      };
      var RegionDiscoveryOutcomes = {
        CONFIGURED_NO_AUTO_DETECTION: "2",
        AUTO_DETECTION_REQUESTED_SUCCESSFUL: "4",
        AUTO_DETECTION_REQUESTED_FAILED: "5"
      };
      var CacheOutcome = {
        // When a token is found in the cache or the cache is not supposed to be hit when making the request
        NOT_APPLICABLE: "0",
        // When the token request goes to the identity provider because force_refresh was set to true. Also occurs if claims were requested
        FORCE_REFRESH_OR_CLAIMS: "1",
        // When the token request goes to the identity provider because no cached access token exists
        NO_CACHED_ACCESS_TOKEN: "2",
        // When the token request goes to the identity provider because cached access token expired
        CACHED_ACCESS_TOKEN_EXPIRED: "3",
        // When the token request goes to the identity provider because refresh_in was used and the existing token needs to be refreshed
        PROACTIVELY_REFRESHED: "4"
      };
      var JsonWebTokenTypes = {
        Jwt: "JWT",
        Jwk: "JWK",
        Pop: "pop"
      };
      var DEFAULT_TOKEN_RENEWAL_OFFSET_SEC = 300;
      var unexpectedError = "unexpected_error";
      var postRequestFailed$1 = "post_request_failed";
      var AuthErrorCodes = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        postRequestFailed: postRequestFailed$1,
        unexpectedError
      });
      var AuthErrorMessages = {
        [unexpectedError]: "Unexpected error in authentication.",
        [postRequestFailed$1]: "Post request failed from the network, could be a 4xx/5xx or a network unavailability. Please check the exact error code for details."
      };
      var AuthErrorMessage = {
        unexpectedError: {
          code: unexpectedError,
          desc: AuthErrorMessages[unexpectedError]
        },
        postRequestFailed: {
          code: postRequestFailed$1,
          desc: AuthErrorMessages[postRequestFailed$1]
        }
      };
      var AuthError = class _AuthError extends Error {
        constructor(errorCode, errorMessage, suberror) {
          const errorString = errorMessage ? `${errorCode}: ${errorMessage}` : errorCode;
          super(errorString);
          Object.setPrototypeOf(this, _AuthError.prototype);
          this.errorCode = errorCode || Constants.EMPTY_STRING;
          this.errorMessage = errorMessage || Constants.EMPTY_STRING;
          this.subError = suberror || Constants.EMPTY_STRING;
          this.name = "AuthError";
        }
        setCorrelationId(correlationId) {
          this.correlationId = correlationId;
        }
      };
      function createAuthError(code, additionalMessage) {
        return new AuthError(code, additionalMessage ? `${AuthErrorMessages[code]} ${additionalMessage}` : AuthErrorMessages[code]);
      }
      var clientInfoDecodingError = "client_info_decoding_error";
      var clientInfoEmptyError = "client_info_empty_error";
      var tokenParsingError = "token_parsing_error";
      var nullOrEmptyToken = "null_or_empty_token";
      var endpointResolutionError = "endpoints_resolution_error";
      var networkError = "network_error";
      var openIdConfigError = "openid_config_error";
      var hashNotDeserialized = "hash_not_deserialized";
      var invalidState = "invalid_state";
      var stateMismatch = "state_mismatch";
      var stateNotFound = "state_not_found";
      var nonceMismatch = "nonce_mismatch";
      var authTimeNotFound = "auth_time_not_found";
      var maxAgeTranspired = "max_age_transpired";
      var multipleMatchingTokens = "multiple_matching_tokens";
      var multipleMatchingAccounts = "multiple_matching_accounts";
      var multipleMatchingAppMetadata = "multiple_matching_appMetadata";
      var requestCannotBeMade = "request_cannot_be_made";
      var cannotRemoveEmptyScope = "cannot_remove_empty_scope";
      var cannotAppendScopeSet = "cannot_append_scopeset";
      var emptyInputScopeSet = "empty_input_scopeset";
      var deviceCodePollingCancelled = "device_code_polling_cancelled";
      var deviceCodeExpired = "device_code_expired";
      var deviceCodeUnknownError = "device_code_unknown_error";
      var noAccountInSilentRequest = "no_account_in_silent_request";
      var invalidCacheRecord = "invalid_cache_record";
      var invalidCacheEnvironment = "invalid_cache_environment";
      var noAccountFound = "no_account_found";
      var noCryptoObject = "no_crypto_object";
      var unexpectedCredentialType = "unexpected_credential_type";
      var invalidAssertion = "invalid_assertion";
      var invalidClientCredential = "invalid_client_credential";
      var tokenRefreshRequired = "token_refresh_required";
      var userTimeoutReached = "user_timeout_reached";
      var tokenClaimsCnfRequiredForSignedJwt = "token_claims_cnf_required_for_signedjwt";
      var authorizationCodeMissingFromServerResponse = "authorization_code_missing_from_server_response";
      var bindingKeyNotRemoved = "binding_key_not_removed";
      var endSessionEndpointNotSupported = "end_session_endpoint_not_supported";
      var keyIdMissing = "key_id_missing";
      var noNetworkConnectivity$1 = "no_network_connectivity";
      var userCanceled = "user_canceled";
      var missingTenantIdError = "missing_tenant_id_error";
      var methodNotImplemented = "method_not_implemented";
      var nestedAppAuthBridgeDisabled = "nested_app_auth_bridge_disabled";
      var ClientAuthErrorCodes = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        authTimeNotFound,
        authorizationCodeMissingFromServerResponse,
        bindingKeyNotRemoved,
        cannotAppendScopeSet,
        cannotRemoveEmptyScope,
        clientInfoDecodingError,
        clientInfoEmptyError,
        deviceCodeExpired,
        deviceCodePollingCancelled,
        deviceCodeUnknownError,
        emptyInputScopeSet,
        endSessionEndpointNotSupported,
        endpointResolutionError,
        hashNotDeserialized,
        invalidAssertion,
        invalidCacheEnvironment,
        invalidCacheRecord,
        invalidClientCredential,
        invalidState,
        keyIdMissing,
        maxAgeTranspired,
        methodNotImplemented,
        missingTenantIdError,
        multipleMatchingAccounts,
        multipleMatchingAppMetadata,
        multipleMatchingTokens,
        nestedAppAuthBridgeDisabled,
        networkError,
        noAccountFound,
        noAccountInSilentRequest,
        noCryptoObject,
        noNetworkConnectivity: noNetworkConnectivity$1,
        nonceMismatch,
        nullOrEmptyToken,
        openIdConfigError,
        requestCannotBeMade,
        stateMismatch,
        stateNotFound,
        tokenClaimsCnfRequiredForSignedJwt,
        tokenParsingError,
        tokenRefreshRequired,
        unexpectedCredentialType,
        userCanceled,
        userTimeoutReached
      });
      var ClientAuthErrorMessages = {
        [clientInfoDecodingError]: "The client info could not be parsed/decoded correctly",
        [clientInfoEmptyError]: "The client info was empty",
        [tokenParsingError]: "Token cannot be parsed",
        [nullOrEmptyToken]: "The token is null or empty",
        [endpointResolutionError]: "Endpoints cannot be resolved",
        [networkError]: "Network request failed",
        [openIdConfigError]: "Could not retrieve endpoints. Check your authority and verify the .well-known/openid-configuration endpoint returns the required endpoints.",
        [hashNotDeserialized]: "The hash parameters could not be deserialized",
        [invalidState]: "State was not the expected format",
        [stateMismatch]: "State mismatch error",
        [stateNotFound]: "State not found",
        [nonceMismatch]: "Nonce mismatch error",
        [authTimeNotFound]: "Max Age was requested and the ID token is missing the auth_time variable. auth_time is an optional claim and is not enabled by default - it must be enabled. See https://aka.ms/msaljs/optional-claims for more information.",
        [maxAgeTranspired]: "Max Age is set to 0, or too much time has elapsed since the last end-user authentication.",
        [multipleMatchingTokens]: "The cache contains multiple tokens satisfying the requirements. Call AcquireToken again providing more requirements such as authority or account.",
        [multipleMatchingAccounts]: "The cache contains multiple accounts satisfying the given parameters. Please pass more info to obtain the correct account",
        [multipleMatchingAppMetadata]: "The cache contains multiple appMetadata satisfying the given parameters. Please pass more info to obtain the correct appMetadata",
        [requestCannotBeMade]: "Token request cannot be made without authorization code or refresh token.",
        [cannotRemoveEmptyScope]: "Cannot remove null or empty scope from ScopeSet",
        [cannotAppendScopeSet]: "Cannot append ScopeSet",
        [emptyInputScopeSet]: "Empty input ScopeSet cannot be processed",
        [deviceCodePollingCancelled]: "Caller has cancelled token endpoint polling during device code flow by setting DeviceCodeRequest.cancel = true.",
        [deviceCodeExpired]: "Device code is expired.",
        [deviceCodeUnknownError]: "Device code stopped polling for unknown reasons.",
        [noAccountInSilentRequest]: "Please pass an account object, silent flow is not supported without account information",
        [invalidCacheRecord]: "Cache record object was null or undefined.",
        [invalidCacheEnvironment]: "Invalid environment when attempting to create cache entry",
        [noAccountFound]: "No account found in cache for given key.",
        [noCryptoObject]: "No crypto object detected.",
        [unexpectedCredentialType]: "Unexpected credential type.",
        [invalidAssertion]: "Client assertion must meet requirements described in https://tools.ietf.org/html/rfc7515",
        [invalidClientCredential]: "Client credential (secret, certificate, or assertion) must not be empty when creating a confidential client. An application should at most have one credential",
        [tokenRefreshRequired]: "Cannot return token from cache because it must be refreshed. This may be due to one of the following reasons: forceRefresh parameter is set to true, claims have been requested, there is no cached access token or it is expired.",
        [userTimeoutReached]: "User defined timeout for device code polling reached",
        [tokenClaimsCnfRequiredForSignedJwt]: "Cannot generate a POP jwt if the token_claims are not populated",
        [authorizationCodeMissingFromServerResponse]: "Server response does not contain an authorization code to proceed",
        [bindingKeyNotRemoved]: "Could not remove the credential's binding key from storage.",
        [endSessionEndpointNotSupported]: "The provided authority does not support logout",
        [keyIdMissing]: "A keyId value is missing from the requested bound token's cache record and is required to match the token to it's stored binding key.",
        [noNetworkConnectivity$1]: "No network connectivity. Check your internet connection.",
        [userCanceled]: "User cancelled the flow.",
        [missingTenantIdError]: "A tenant id - not common, organizations, or consumers - must be specified when using the client_credentials flow.",
        [methodNotImplemented]: "This method has not been implemented",
        [nestedAppAuthBridgeDisabled]: "The nested app auth bridge is disabled"
      };
      var ClientAuthErrorMessage = {
        clientInfoDecodingError: {
          code: clientInfoDecodingError,
          desc: ClientAuthErrorMessages[clientInfoDecodingError]
        },
        clientInfoEmptyError: {
          code: clientInfoEmptyError,
          desc: ClientAuthErrorMessages[clientInfoEmptyError]
        },
        tokenParsingError: {
          code: tokenParsingError,
          desc: ClientAuthErrorMessages[tokenParsingError]
        },
        nullOrEmptyToken: {
          code: nullOrEmptyToken,
          desc: ClientAuthErrorMessages[nullOrEmptyToken]
        },
        endpointResolutionError: {
          code: endpointResolutionError,
          desc: ClientAuthErrorMessages[endpointResolutionError]
        },
        networkError: {
          code: networkError,
          desc: ClientAuthErrorMessages[networkError]
        },
        unableToGetOpenidConfigError: {
          code: openIdConfigError,
          desc: ClientAuthErrorMessages[openIdConfigError]
        },
        hashNotDeserialized: {
          code: hashNotDeserialized,
          desc: ClientAuthErrorMessages[hashNotDeserialized]
        },
        invalidStateError: {
          code: invalidState,
          desc: ClientAuthErrorMessages[invalidState]
        },
        stateMismatchError: {
          code: stateMismatch,
          desc: ClientAuthErrorMessages[stateMismatch]
        },
        stateNotFoundError: {
          code: stateNotFound,
          desc: ClientAuthErrorMessages[stateNotFound]
        },
        nonceMismatchError: {
          code: nonceMismatch,
          desc: ClientAuthErrorMessages[nonceMismatch]
        },
        authTimeNotFoundError: {
          code: authTimeNotFound,
          desc: ClientAuthErrorMessages[authTimeNotFound]
        },
        maxAgeTranspired: {
          code: maxAgeTranspired,
          desc: ClientAuthErrorMessages[maxAgeTranspired]
        },
        multipleMatchingTokens: {
          code: multipleMatchingTokens,
          desc: ClientAuthErrorMessages[multipleMatchingTokens]
        },
        multipleMatchingAccounts: {
          code: multipleMatchingAccounts,
          desc: ClientAuthErrorMessages[multipleMatchingAccounts]
        },
        multipleMatchingAppMetadata: {
          code: multipleMatchingAppMetadata,
          desc: ClientAuthErrorMessages[multipleMatchingAppMetadata]
        },
        tokenRequestCannotBeMade: {
          code: requestCannotBeMade,
          desc: ClientAuthErrorMessages[requestCannotBeMade]
        },
        removeEmptyScopeError: {
          code: cannotRemoveEmptyScope,
          desc: ClientAuthErrorMessages[cannotRemoveEmptyScope]
        },
        appendScopeSetError: {
          code: cannotAppendScopeSet,
          desc: ClientAuthErrorMessages[cannotAppendScopeSet]
        },
        emptyInputScopeSetError: {
          code: emptyInputScopeSet,
          desc: ClientAuthErrorMessages[emptyInputScopeSet]
        },
        DeviceCodePollingCancelled: {
          code: deviceCodePollingCancelled,
          desc: ClientAuthErrorMessages[deviceCodePollingCancelled]
        },
        DeviceCodeExpired: {
          code: deviceCodeExpired,
          desc: ClientAuthErrorMessages[deviceCodeExpired]
        },
        DeviceCodeUnknownError: {
          code: deviceCodeUnknownError,
          desc: ClientAuthErrorMessages[deviceCodeUnknownError]
        },
        NoAccountInSilentRequest: {
          code: noAccountInSilentRequest,
          desc: ClientAuthErrorMessages[noAccountInSilentRequest]
        },
        invalidCacheRecord: {
          code: invalidCacheRecord,
          desc: ClientAuthErrorMessages[invalidCacheRecord]
        },
        invalidCacheEnvironment: {
          code: invalidCacheEnvironment,
          desc: ClientAuthErrorMessages[invalidCacheEnvironment]
        },
        noAccountFound: {
          code: noAccountFound,
          desc: ClientAuthErrorMessages[noAccountFound]
        },
        noCryptoObj: {
          code: noCryptoObject,
          desc: ClientAuthErrorMessages[noCryptoObject]
        },
        unexpectedCredentialType: {
          code: unexpectedCredentialType,
          desc: ClientAuthErrorMessages[unexpectedCredentialType]
        },
        invalidAssertion: {
          code: invalidAssertion,
          desc: ClientAuthErrorMessages[invalidAssertion]
        },
        invalidClientCredential: {
          code: invalidClientCredential,
          desc: ClientAuthErrorMessages[invalidClientCredential]
        },
        tokenRefreshRequired: {
          code: tokenRefreshRequired,
          desc: ClientAuthErrorMessages[tokenRefreshRequired]
        },
        userTimeoutReached: {
          code: userTimeoutReached,
          desc: ClientAuthErrorMessages[userTimeoutReached]
        },
        tokenClaimsRequired: {
          code: tokenClaimsCnfRequiredForSignedJwt,
          desc: ClientAuthErrorMessages[tokenClaimsCnfRequiredForSignedJwt]
        },
        noAuthorizationCodeFromServer: {
          code: authorizationCodeMissingFromServerResponse,
          desc: ClientAuthErrorMessages[authorizationCodeMissingFromServerResponse]
        },
        bindingKeyNotRemovedError: {
          code: bindingKeyNotRemoved,
          desc: ClientAuthErrorMessages[bindingKeyNotRemoved]
        },
        logoutNotSupported: {
          code: endSessionEndpointNotSupported,
          desc: ClientAuthErrorMessages[endSessionEndpointNotSupported]
        },
        keyIdMissing: {
          code: keyIdMissing,
          desc: ClientAuthErrorMessages[keyIdMissing]
        },
        noNetworkConnectivity: {
          code: noNetworkConnectivity$1,
          desc: ClientAuthErrorMessages[noNetworkConnectivity$1]
        },
        userCanceledError: {
          code: userCanceled,
          desc: ClientAuthErrorMessages[userCanceled]
        },
        missingTenantIdError: {
          code: missingTenantIdError,
          desc: ClientAuthErrorMessages[missingTenantIdError]
        },
        nestedAppAuthBridgeDisabled: {
          code: nestedAppAuthBridgeDisabled,
          desc: ClientAuthErrorMessages[nestedAppAuthBridgeDisabled]
        }
      };
      var ClientAuthError = class _ClientAuthError extends AuthError {
        constructor(errorCode, additionalMessage) {
          super(errorCode, additionalMessage ? `${ClientAuthErrorMessages[errorCode]}: ${additionalMessage}` : ClientAuthErrorMessages[errorCode]);
          this.name = "ClientAuthError";
          Object.setPrototypeOf(this, _ClientAuthError.prototype);
        }
      };
      function createClientAuthError(errorCode, additionalMessage) {
        return new ClientAuthError(errorCode, additionalMessage);
      }
      var DEFAULT_CRYPTO_IMPLEMENTATION = {
        createNewGuid: () => {
          throw createClientAuthError(methodNotImplemented);
        },
        base64Decode: () => {
          throw createClientAuthError(methodNotImplemented);
        },
        base64Encode: () => {
          throw createClientAuthError(methodNotImplemented);
        },
        base64UrlEncode: () => {
          throw createClientAuthError(methodNotImplemented);
        },
        encodeKid: () => {
          throw createClientAuthError(methodNotImplemented);
        },
        async getPublicKeyThumbprint() {
          throw createClientAuthError(methodNotImplemented);
        },
        async removeTokenBindingKey() {
          throw createClientAuthError(methodNotImplemented);
        },
        async clearKeystore() {
          throw createClientAuthError(methodNotImplemented);
        },
        async signJwt() {
          throw createClientAuthError(methodNotImplemented);
        },
        async hashString() {
          throw createClientAuthError(methodNotImplemented);
        }
      };
      exports.LogLevel = void 0;
      (function(LogLevel) {
        LogLevel[LogLevel["Error"] = 0] = "Error";
        LogLevel[LogLevel["Warning"] = 1] = "Warning";
        LogLevel[LogLevel["Info"] = 2] = "Info";
        LogLevel[LogLevel["Verbose"] = 3] = "Verbose";
        LogLevel[LogLevel["Trace"] = 4] = "Trace";
      })(exports.LogLevel || (exports.LogLevel = {}));
      var Logger = class _Logger {
        constructor(loggerOptions, packageName, packageVersion) {
          this.level = exports.LogLevel.Info;
          const defaultLoggerCallback = () => {
            return;
          };
          const setLoggerOptions = loggerOptions || _Logger.createDefaultLoggerOptions();
          this.localCallback = setLoggerOptions.loggerCallback || defaultLoggerCallback;
          this.piiLoggingEnabled = setLoggerOptions.piiLoggingEnabled || false;
          this.level = typeof setLoggerOptions.logLevel === "number" ? setLoggerOptions.logLevel : exports.LogLevel.Info;
          this.correlationId = setLoggerOptions.correlationId || Constants.EMPTY_STRING;
          this.packageName = packageName || Constants.EMPTY_STRING;
          this.packageVersion = packageVersion || Constants.EMPTY_STRING;
        }
        static createDefaultLoggerOptions() {
          return {
            loggerCallback: () => {
            },
            piiLoggingEnabled: false,
            logLevel: exports.LogLevel.Info
          };
        }
        /**
         * Create new Logger with existing configurations.
         */
        clone(packageName, packageVersion, correlationId) {
          return new _Logger({
            loggerCallback: this.localCallback,
            piiLoggingEnabled: this.piiLoggingEnabled,
            logLevel: this.level,
            correlationId: correlationId || this.correlationId
          }, packageName, packageVersion);
        }
        /**
         * Log message with required options.
         */
        logMessage(logMessage, options) {
          if (options.logLevel > this.level || !this.piiLoggingEnabled && options.containsPii) {
            return;
          }
          const timestamp = (/* @__PURE__ */ new Date()).toUTCString();
          const logHeader = `[${timestamp}] : [${options.correlationId || this.correlationId || ""}]`;
          const log = `${logHeader} : ${this.packageName}@${this.packageVersion} : ${exports.LogLevel[options.logLevel]} - ${logMessage}`;
          this.executeCallback(options.logLevel, log, options.containsPii || false);
        }
        /**
         * Execute callback with message.
         */
        executeCallback(level, message, containsPii) {
          if (this.localCallback) {
            this.localCallback(level, message, containsPii);
          }
        }
        /**
         * Logs error messages.
         */
        error(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Error,
            containsPii: false,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Logs error messages with PII.
         */
        errorPii(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Error,
            containsPii: true,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Logs warning messages.
         */
        warning(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Warning,
            containsPii: false,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Logs warning messages with PII.
         */
        warningPii(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Warning,
            containsPii: true,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Logs info messages.
         */
        info(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Info,
            containsPii: false,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Logs info messages with PII.
         */
        infoPii(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Info,
            containsPii: true,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Logs verbose messages.
         */
        verbose(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Verbose,
            containsPii: false,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Logs verbose messages with PII.
         */
        verbosePii(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Verbose,
            containsPii: true,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Logs trace messages.
         */
        trace(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Trace,
            containsPii: false,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Logs trace messages with PII.
         */
        tracePii(message, correlationId) {
          this.logMessage(message, {
            logLevel: exports.LogLevel.Trace,
            containsPii: true,
            correlationId: correlationId || Constants.EMPTY_STRING
          });
        }
        /**
         * Returns whether PII Logging is enabled or not.
         */
        isPiiLoggingEnabled() {
          return this.piiLoggingEnabled || false;
        }
      };
      var name$1 = "@azure/msal-common";
      var version$1 = "15.13.0";
      var AzureCloudInstance = {
        // AzureCloudInstance is not specified.
        None: "none",
        // Microsoft Azure public cloud
        AzurePublic: "https://login.microsoftonline.com",
        // Microsoft PPE
        AzurePpe: "https://login.windows-ppe.net",
        // Microsoft Chinese national/regional cloud
        AzureChina: "https://login.chinacloudapi.cn",
        // Microsoft German national/regional cloud ("Black Forest")
        AzureGermany: "https://login.microsoftonline.de",
        // US Government cloud
        AzureUsGovernment: "https://login.microsoftonline.us"
      };
      var redirectUriEmpty = "redirect_uri_empty";
      var claimsRequestParsingError = "claims_request_parsing_error";
      var authorityUriInsecure = "authority_uri_insecure";
      var urlParseError = "url_parse_error";
      var urlEmptyError = "empty_url_error";
      var emptyInputScopesError = "empty_input_scopes_error";
      var invalidClaims = "invalid_claims";
      var tokenRequestEmpty = "token_request_empty";
      var logoutRequestEmpty = "logout_request_empty";
      var invalidCodeChallengeMethod = "invalid_code_challenge_method";
      var pkceParamsMissing = "pkce_params_missing";
      var invalidCloudDiscoveryMetadata = "invalid_cloud_discovery_metadata";
      var invalidAuthorityMetadata = "invalid_authority_metadata";
      var untrustedAuthority = "untrusted_authority";
      var missingSshJwk = "missing_ssh_jwk";
      var missingSshKid = "missing_ssh_kid";
      var missingNonceAuthenticationHeader = "missing_nonce_authentication_header";
      var invalidAuthenticationHeader = "invalid_authentication_header";
      var cannotSetOIDCOptions = "cannot_set_OIDCOptions";
      var cannotAllowPlatformBroker = "cannot_allow_platform_broker";
      var authorityMismatch = "authority_mismatch";
      var invalidRequestMethodForEAR = "invalid_request_method_for_EAR";
      var invalidAuthorizePostBodyParameters = "invalid_authorize_post_body_parameters";
      var ClientConfigurationErrorCodes = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        authorityMismatch,
        authorityUriInsecure,
        cannotAllowPlatformBroker,
        cannotSetOIDCOptions,
        claimsRequestParsingError,
        emptyInputScopesError,
        invalidAuthenticationHeader,
        invalidAuthorityMetadata,
        invalidAuthorizePostBodyParameters,
        invalidClaims,
        invalidCloudDiscoveryMetadata,
        invalidCodeChallengeMethod,
        invalidRequestMethodForEAR,
        logoutRequestEmpty,
        missingNonceAuthenticationHeader,
        missingSshJwk,
        missingSshKid,
        pkceParamsMissing,
        redirectUriEmpty,
        tokenRequestEmpty,
        untrustedAuthority,
        urlEmptyError,
        urlParseError
      });
      var ClientConfigurationErrorMessages = {
        [redirectUriEmpty]: "A redirect URI is required for all calls, and none has been set.",
        [claimsRequestParsingError]: "Could not parse the given claims request object.",
        [authorityUriInsecure]: "Authority URIs must use https.  Please see here for valid authority configuration options: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications#configuration-options",
        [urlParseError]: "URL could not be parsed into appropriate segments.",
        [urlEmptyError]: "URL was empty or null.",
        [emptyInputScopesError]: "Scopes cannot be passed as null, undefined or empty array because they are required to obtain an access token.",
        [invalidClaims]: "Given claims parameter must be a stringified JSON object.",
        [tokenRequestEmpty]: "Token request was empty and not found in cache.",
        [logoutRequestEmpty]: "The logout request was null or undefined.",
        [invalidCodeChallengeMethod]: 'code_challenge_method passed is invalid. Valid values are "plain" and "S256".',
        [pkceParamsMissing]: "Both params: code_challenge and code_challenge_method are to be passed if to be sent in the request",
        [invalidCloudDiscoveryMetadata]: "Invalid cloudDiscoveryMetadata provided. Must be a stringified JSON object containing tenant_discovery_endpoint and metadata fields",
        [invalidAuthorityMetadata]: "Invalid authorityMetadata provided. Must by a stringified JSON object containing authorization_endpoint, token_endpoint, issuer fields.",
        [untrustedAuthority]: "The provided authority is not a trusted authority. Please include this authority in the knownAuthorities config parameter.",
        [missingSshJwk]: "Missing sshJwk in SSH certificate request. A stringified JSON Web Key is required when using the SSH authentication scheme.",
        [missingSshKid]: "Missing sshKid in SSH certificate request. A string that uniquely identifies the public SSH key is required when using the SSH authentication scheme.",
        [missingNonceAuthenticationHeader]: "Unable to find an authentication header containing server nonce. Either the Authentication-Info or WWW-Authenticate headers must be present in order to obtain a server nonce.",
        [invalidAuthenticationHeader]: "Invalid authentication header provided",
        [cannotSetOIDCOptions]: "Cannot set OIDCOptions parameter. Please change the protocol mode to OIDC or use a non-Microsoft authority.",
        [cannotAllowPlatformBroker]: "Cannot set allowPlatformBroker parameter to true when not in AAD protocol mode.",
        [authorityMismatch]: "Authority mismatch error. Authority provided in login request or PublicClientApplication config does not match the environment of the provided account. Please use a matching account or make an interactive request to login to this authority.",
        [invalidAuthorizePostBodyParameters]: "Invalid authorize post body parameters provided. If you are using authorizePostBodyParameters, the request method must be POST. Please check the request method and parameters.",
        [invalidRequestMethodForEAR]: "Invalid request method for EAR protocol mode. The request method cannot be GET when using EAR protocol mode. Please change the request method to POST."
      };
      var ClientConfigurationErrorMessage = {
        redirectUriNotSet: {
          code: redirectUriEmpty,
          desc: ClientConfigurationErrorMessages[redirectUriEmpty]
        },
        claimsRequestParsingError: {
          code: claimsRequestParsingError,
          desc: ClientConfigurationErrorMessages[claimsRequestParsingError]
        },
        authorityUriInsecure: {
          code: authorityUriInsecure,
          desc: ClientConfigurationErrorMessages[authorityUriInsecure]
        },
        urlParseError: {
          code: urlParseError,
          desc: ClientConfigurationErrorMessages[urlParseError]
        },
        urlEmptyError: {
          code: urlEmptyError,
          desc: ClientConfigurationErrorMessages[urlEmptyError]
        },
        emptyScopesError: {
          code: emptyInputScopesError,
          desc: ClientConfigurationErrorMessages[emptyInputScopesError]
        },
        invalidClaimsRequest: {
          code: invalidClaims,
          desc: ClientConfigurationErrorMessages[invalidClaims]
        },
        tokenRequestEmptyError: {
          code: tokenRequestEmpty,
          desc: ClientConfigurationErrorMessages[tokenRequestEmpty]
        },
        logoutRequestEmptyError: {
          code: logoutRequestEmpty,
          desc: ClientConfigurationErrorMessages[logoutRequestEmpty]
        },
        invalidCodeChallengeMethod: {
          code: invalidCodeChallengeMethod,
          desc: ClientConfigurationErrorMessages[invalidCodeChallengeMethod]
        },
        invalidCodeChallengeParams: {
          code: pkceParamsMissing,
          desc: ClientConfigurationErrorMessages[pkceParamsMissing]
        },
        invalidCloudDiscoveryMetadata: {
          code: invalidCloudDiscoveryMetadata,
          desc: ClientConfigurationErrorMessages[invalidCloudDiscoveryMetadata]
        },
        invalidAuthorityMetadata: {
          code: invalidAuthorityMetadata,
          desc: ClientConfigurationErrorMessages[invalidAuthorityMetadata]
        },
        untrustedAuthority: {
          code: untrustedAuthority,
          desc: ClientConfigurationErrorMessages[untrustedAuthority]
        },
        missingSshJwk: {
          code: missingSshJwk,
          desc: ClientConfigurationErrorMessages[missingSshJwk]
        },
        missingSshKid: {
          code: missingSshKid,
          desc: ClientConfigurationErrorMessages[missingSshKid]
        },
        missingNonceAuthenticationHeader: {
          code: missingNonceAuthenticationHeader,
          desc: ClientConfigurationErrorMessages[missingNonceAuthenticationHeader]
        },
        invalidAuthenticationHeader: {
          code: invalidAuthenticationHeader,
          desc: ClientConfigurationErrorMessages[invalidAuthenticationHeader]
        },
        cannotSetOIDCOptions: {
          code: cannotSetOIDCOptions,
          desc: ClientConfigurationErrorMessages[cannotSetOIDCOptions]
        },
        cannotAllowPlatformBroker: {
          code: cannotAllowPlatformBroker,
          desc: ClientConfigurationErrorMessages[cannotAllowPlatformBroker]
        },
        authorityMismatch: {
          code: authorityMismatch,
          desc: ClientConfigurationErrorMessages[authorityMismatch]
        },
        invalidAuthorizePostBodyParameters: {
          code: invalidAuthorizePostBodyParameters,
          desc: ClientConfigurationErrorMessages[invalidAuthorizePostBodyParameters]
        },
        invalidRequestMethodForEAR: {
          code: invalidRequestMethodForEAR,
          desc: ClientConfigurationErrorMessages[invalidRequestMethodForEAR]
        }
      };
      var ClientConfigurationError = class _ClientConfigurationError extends AuthError {
        constructor(errorCode) {
          super(errorCode, ClientConfigurationErrorMessages[errorCode]);
          this.name = "ClientConfigurationError";
          Object.setPrototypeOf(this, _ClientConfigurationError.prototype);
        }
      };
      function createClientConfigurationError(errorCode) {
        return new ClientConfigurationError(errorCode);
      }
      var StringUtils = class {
        /**
         * Check if stringified object is empty
         * @param strObj
         */
        static isEmptyObj(strObj) {
          if (strObj) {
            try {
              const obj = JSON.parse(strObj);
              return Object.keys(obj).length === 0;
            } catch (e) {
            }
          }
          return true;
        }
        static startsWith(str, search) {
          return str.indexOf(search) === 0;
        }
        static endsWith(str, search) {
          return str.length >= search.length && str.lastIndexOf(search) === str.length - search.length;
        }
        /**
         * Parses string into an object.
         *
         * @param query
         */
        static queryStringToObject(query) {
          const obj = {};
          const params = query.split("&");
          const decode = (s) => decodeURIComponent(s.replace(/\+/g, " "));
          params.forEach((pair) => {
            if (pair.trim()) {
              const [key, value] = pair.split(/=(.+)/g, 2);
              if (key && value) {
                obj[decode(key)] = decode(value);
              }
            }
          });
          return obj;
        }
        /**
         * Trims entries in an array.
         *
         * @param arr
         */
        static trimArrayEntries(arr) {
          return arr.map((entry) => entry.trim());
        }
        /**
         * Removes empty strings from array
         * @param arr
         */
        static removeEmptyStringsFromArray(arr) {
          return arr.filter((entry) => {
            return !!entry;
          });
        }
        /**
         * Attempts to parse a string into JSON
         * @param str
         */
        static jsonParseHelper(str) {
          try {
            return JSON.parse(str);
          } catch (e) {
            return null;
          }
        }
        /**
         * Tests if a given string matches a given pattern, with support for wildcards and queries.
         * @param pattern Wildcard pattern to string match. Supports "*" for wildcards and "?" for queries
         * @param input String to match against
         */
        static matchPattern(pattern, input) {
          const regex = new RegExp(pattern.replace(/\\/g, "\\\\").replace(/\*/g, "[^ ]*").replace(/\?/g, "\\?"));
          return regex.test(input);
        }
      };
      var ScopeSet = class _ScopeSet {
        constructor(inputScopes) {
          const scopeArr = inputScopes ? StringUtils.trimArrayEntries([...inputScopes]) : [];
          const filteredInput = scopeArr ? StringUtils.removeEmptyStringsFromArray(scopeArr) : [];
          if (!filteredInput || !filteredInput.length) {
            throw createClientConfigurationError(emptyInputScopesError);
          }
          this.scopes = /* @__PURE__ */ new Set();
          filteredInput.forEach((scope) => this.scopes.add(scope));
        }
        /**
         * Factory method to create ScopeSet from space-delimited string
         * @param inputScopeString
         * @param appClientId
         * @param scopesRequired
         */
        static fromString(inputScopeString) {
          const scopeString = inputScopeString || Constants.EMPTY_STRING;
          const inputScopes = scopeString.split(" ");
          return new _ScopeSet(inputScopes);
        }
        /**
         * Creates the set of scopes to search for in cache lookups
         * @param inputScopeString
         * @returns
         */
        static createSearchScopes(inputScopeString) {
          const scopesToUse = inputScopeString && inputScopeString.length > 0 ? inputScopeString : [...OIDC_DEFAULT_SCOPES];
          const scopeSet = new _ScopeSet(scopesToUse);
          if (!scopeSet.containsOnlyOIDCScopes()) {
            scopeSet.removeOIDCScopes();
          } else {
            scopeSet.removeScope(Constants.OFFLINE_ACCESS_SCOPE);
          }
          return scopeSet;
        }
        /**
         * Check if a given scope is present in this set of scopes.
         * @param scope
         */
        containsScope(scope) {
          const lowerCaseScopes = this.printScopesLowerCase().split(" ");
          const lowerCaseScopesSet = new _ScopeSet(lowerCaseScopes);
          return scope ? lowerCaseScopesSet.scopes.has(scope.toLowerCase()) : false;
        }
        /**
         * Check if a set of scopes is present in this set of scopes.
         * @param scopeSet
         */
        containsScopeSet(scopeSet) {
          if (!scopeSet || scopeSet.scopes.size <= 0) {
            return false;
          }
          return this.scopes.size >= scopeSet.scopes.size && scopeSet.asArray().every((scope) => this.containsScope(scope));
        }
        /**
         * Check if set of scopes contains only the defaults
         */
        containsOnlyOIDCScopes() {
          let defaultScopeCount = 0;
          OIDC_SCOPES.forEach((defaultScope) => {
            if (this.containsScope(defaultScope)) {
              defaultScopeCount += 1;
            }
          });
          return this.scopes.size === defaultScopeCount;
        }
        /**
         * Appends single scope if passed
         * @param newScope
         */
        appendScope(newScope) {
          if (newScope) {
            this.scopes.add(newScope.trim());
          }
        }
        /**
         * Appends multiple scopes if passed
         * @param newScopes
         */
        appendScopes(newScopes) {
          try {
            newScopes.forEach((newScope) => this.appendScope(newScope));
          } catch (e) {
            throw createClientAuthError(cannotAppendScopeSet);
          }
        }
        /**
         * Removes element from set of scopes.
         * @param scope
         */
        removeScope(scope) {
          if (!scope) {
            throw createClientAuthError(cannotRemoveEmptyScope);
          }
          this.scopes.delete(scope.trim());
        }
        /**
         * Removes default scopes from set of scopes
         * Primarily used to prevent cache misses if the default scopes are not returned from the server
         */
        removeOIDCScopes() {
          OIDC_SCOPES.forEach((defaultScope) => {
            this.scopes.delete(defaultScope);
          });
        }
        /**
         * Combines an array of scopes with the current set of scopes.
         * @param otherScopes
         */
        unionScopeSets(otherScopes) {
          if (!otherScopes) {
            throw createClientAuthError(emptyInputScopeSet);
          }
          const unionScopes = /* @__PURE__ */ new Set();
          otherScopes.scopes.forEach((scope) => unionScopes.add(scope.toLowerCase()));
          this.scopes.forEach((scope) => unionScopes.add(scope.toLowerCase()));
          return unionScopes;
        }
        /**
         * Check if scopes intersect between this set and another.
         * @param otherScopes
         */
        intersectingScopeSets(otherScopes) {
          if (!otherScopes) {
            throw createClientAuthError(emptyInputScopeSet);
          }
          if (!otherScopes.containsOnlyOIDCScopes()) {
            otherScopes.removeOIDCScopes();
          }
          const unionScopes = this.unionScopeSets(otherScopes);
          const sizeOtherScopes = otherScopes.getScopeCount();
          const sizeThisScopes = this.getScopeCount();
          const sizeUnionScopes = unionScopes.size;
          return sizeUnionScopes < sizeThisScopes + sizeOtherScopes;
        }
        /**
         * Returns size of set of scopes.
         */
        getScopeCount() {
          return this.scopes.size;
        }
        /**
         * Returns the scopes as an array of string values
         */
        asArray() {
          const array = [];
          this.scopes.forEach((val) => array.push(val));
          return array;
        }
        /**
         * Prints scopes into a space-delimited string
         */
        printScopes() {
          if (this.scopes) {
            const scopeArr = this.asArray();
            return scopeArr.join(" ");
          }
          return Constants.EMPTY_STRING;
        }
        /**
         * Prints scopes into a space-delimited lower-case string (used for caching)
         */
        printScopesLowerCase() {
          return this.printScopes().toLowerCase();
        }
      };
      function tenantIdMatchesHomeTenant(tenantId, homeAccountId) {
        return !!tenantId && !!homeAccountId && tenantId === homeAccountId.split(".")[1];
      }
      function buildTenantProfile(homeAccountId, localAccountId, tenantId, idTokenClaims) {
        if (idTokenClaims) {
          const { oid, sub, tid, name: name2, tfp, acr, preferred_username, upn, login_hint } = idTokenClaims;
          const tenantId2 = tid || tfp || acr || "";
          return {
            tenantId: tenantId2,
            localAccountId: oid || sub || "",
            name: name2,
            username: preferred_username || upn || "",
            loginHint: login_hint,
            isHomeTenant: tenantIdMatchesHomeTenant(tenantId2, homeAccountId)
          };
        } else {
          return {
            tenantId,
            localAccountId,
            username: "",
            isHomeTenant: tenantIdMatchesHomeTenant(tenantId, homeAccountId)
          };
        }
      }
      function updateAccountTenantProfileData(baseAccountInfo, tenantProfile, idTokenClaims, idTokenSecret) {
        let updatedAccountInfo = baseAccountInfo;
        if (tenantProfile) {
          const { isHomeTenant, ...tenantProfileOverride } = tenantProfile;
          updatedAccountInfo = { ...baseAccountInfo, ...tenantProfileOverride };
        }
        if (idTokenClaims) {
          const { isHomeTenant, ...claimsSourcedTenantProfile } = buildTenantProfile(baseAccountInfo.homeAccountId, baseAccountInfo.localAccountId, baseAccountInfo.tenantId, idTokenClaims);
          updatedAccountInfo = {
            ...updatedAccountInfo,
            ...claimsSourcedTenantProfile,
            idTokenClaims,
            idToken: idTokenSecret
          };
          return updatedAccountInfo;
        }
        return updatedAccountInfo;
      }
      function extractTokenClaims(encodedToken, base64Decode2) {
        const jswPayload = getJWSPayload(encodedToken);
        try {
          const base64Decoded = base64Decode2(jswPayload);
          return JSON.parse(base64Decoded);
        } catch (err) {
          throw createClientAuthError(tokenParsingError);
        }
      }
      function getJWSPayload(authToken) {
        if (!authToken) {
          throw createClientAuthError(nullOrEmptyToken);
        }
        const tokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;
        const matches = tokenPartsRegex.exec(authToken);
        if (!matches || matches.length < 4) {
          throw createClientAuthError(tokenParsingError);
        }
        return matches[2];
      }
      function checkMaxAge(authTime, maxAge) {
        const fiveMinuteSkew = 3e5;
        if (maxAge === 0 || Date.now() - fiveMinuteSkew > authTime + maxAge) {
          throw createClientAuthError(maxAgeTranspired);
        }
      }
      function canonicalizeUrl(url) {
        if (!url) {
          return url;
        }
        let lowerCaseUrl = url.toLowerCase();
        if (StringUtils.endsWith(lowerCaseUrl, "?")) {
          lowerCaseUrl = lowerCaseUrl.slice(0, -1);
        } else if (StringUtils.endsWith(lowerCaseUrl, "?/")) {
          lowerCaseUrl = lowerCaseUrl.slice(0, -2);
        }
        if (!StringUtils.endsWith(lowerCaseUrl, "/")) {
          lowerCaseUrl += "/";
        }
        return lowerCaseUrl;
      }
      function stripLeadingHashOrQuery(responseString) {
        if (responseString.startsWith("#/")) {
          return responseString.substring(2);
        } else if (responseString.startsWith("#") || responseString.startsWith("?")) {
          return responseString.substring(1);
        }
        return responseString;
      }
      function getDeserializedResponse(responseString) {
        if (!responseString || responseString.indexOf("=") < 0) {
          return null;
        }
        try {
          const normalizedResponse = stripLeadingHashOrQuery(responseString);
          const deserializedHash = Object.fromEntries(new URLSearchParams(normalizedResponse));
          if (deserializedHash.code || deserializedHash.ear_jwe || deserializedHash.error || deserializedHash.error_description || deserializedHash.state) {
            return deserializedHash;
          }
        } catch (e) {
          throw createClientAuthError(hashNotDeserialized);
        }
        return null;
      }
      function mapToQueryString(parameters, encodeExtraParams = true, extraQueryParameters) {
        const queryParameterArray = new Array();
        parameters.forEach((value, key) => {
          if (!encodeExtraParams && extraQueryParameters && key in extraQueryParameters) {
            queryParameterArray.push(`${key}=${value}`);
          } else {
            queryParameterArray.push(`${key}=${encodeURIComponent(value)}`);
          }
        });
        return queryParameterArray.join("&");
      }
      function normalizeUrlForComparison(url) {
        if (!url) {
          return url;
        }
        const urlWithoutHash = url.split("#")[0];
        try {
          const urlObj = new URL(urlWithoutHash);
          const normalizedUrl = urlObj.origin + urlObj.pathname + urlObj.search;
          return canonicalizeUrl(normalizedUrl);
        } catch (e) {
          return canonicalizeUrl(urlWithoutHash);
        }
      }
      var UrlString = class _UrlString {
        get urlString() {
          return this._urlString;
        }
        constructor(url) {
          this._urlString = url;
          if (!this._urlString) {
            throw createClientConfigurationError(urlEmptyError);
          }
          if (!url.includes("#")) {
            this._urlString = _UrlString.canonicalizeUri(url);
          }
        }
        /**
         * Ensure urls are lower case and end with a / character.
         * @param url
         */
        static canonicalizeUri(url) {
          if (url) {
            let lowerCaseUrl = url.toLowerCase();
            if (StringUtils.endsWith(lowerCaseUrl, "?")) {
              lowerCaseUrl = lowerCaseUrl.slice(0, -1);
            } else if (StringUtils.endsWith(lowerCaseUrl, "?/")) {
              lowerCaseUrl = lowerCaseUrl.slice(0, -2);
            }
            if (!StringUtils.endsWith(lowerCaseUrl, "/")) {
              lowerCaseUrl += "/";
            }
            return lowerCaseUrl;
          }
          return url;
        }
        /**
         * Throws if urlString passed is not a valid authority URI string.
         */
        validateAsUri() {
          let components;
          try {
            components = this.getUrlComponents();
          } catch (e) {
            throw createClientConfigurationError(urlParseError);
          }
          if (!components.HostNameAndPort || !components.PathSegments) {
            throw createClientConfigurationError(urlParseError);
          }
          if (!components.Protocol || components.Protocol.toLowerCase() !== "https:") {
            throw createClientConfigurationError(authorityUriInsecure);
          }
        }
        /**
         * Given a url and a query string return the url with provided query string appended
         * @param url
         * @param queryString
         */
        static appendQueryString(url, queryString) {
          if (!queryString) {
            return url;
          }
          return url.indexOf("?") < 0 ? `${url}?${queryString}` : `${url}&${queryString}`;
        }
        /**
         * Returns a url with the hash removed
         * @param url
         */
        static removeHashFromUrl(url) {
          return _UrlString.canonicalizeUri(url.split("#")[0]);
        }
        /**
         * Given a url like https://a:b/common/d?e=f#g, and a tenantId, returns https://a:b/tenantId/d
         * @param href The url
         * @param tenantId The tenant id to replace
         */
        replaceTenantPath(tenantId) {
          const urlObject = this.getUrlComponents();
          const pathArray = urlObject.PathSegments;
          if (tenantId && pathArray.length !== 0 && (pathArray[0] === AADAuthorityConstants.COMMON || pathArray[0] === AADAuthorityConstants.ORGANIZATIONS)) {
            pathArray[0] = tenantId;
          }
          return _UrlString.constructAuthorityUriFromObject(urlObject);
        }
        /**
         * Parses out the components from a url string.
         * @returns An object with the various components. Please cache this value insted of calling this multiple times on the same url.
         */
        getUrlComponents() {
          const regEx = RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
          const match = this.urlString.match(regEx);
          if (!match) {
            throw createClientConfigurationError(urlParseError);
          }
          const urlComponents = {
            Protocol: match[1],
            HostNameAndPort: match[4],
            AbsolutePath: match[5],
            QueryString: match[7]
          };
          let pathSegments = urlComponents.AbsolutePath.split("/");
          pathSegments = pathSegments.filter((val) => val && val.length > 0);
          urlComponents.PathSegments = pathSegments;
          if (urlComponents.QueryString && urlComponents.QueryString.endsWith("/")) {
            urlComponents.QueryString = urlComponents.QueryString.substring(0, urlComponents.QueryString.length - 1);
          }
          return urlComponents;
        }
        static getDomainFromUrl(url) {
          const regEx = RegExp("^([^:/?#]+://)?([^/?#]*)");
          const match = url.match(regEx);
          if (!match) {
            throw createClientConfigurationError(urlParseError);
          }
          return match[2];
        }
        static getAbsoluteUrl(relativeUrl, baseUrl) {
          if (relativeUrl[0] === Constants.FORWARD_SLASH) {
            const url = new _UrlString(baseUrl);
            const baseComponents = url.getUrlComponents();
            return baseComponents.Protocol + "//" + baseComponents.HostNameAndPort + relativeUrl;
          }
          return relativeUrl;
        }
        static constructAuthorityUriFromObject(urlObject) {
          return new _UrlString(urlObject.Protocol + "//" + urlObject.HostNameAndPort + "/" + urlObject.PathSegments.join("/"));
        }
        /**
         * Check if the hash of the URL string contains known properties
         * @deprecated This API will be removed in a future version
         */
        static hashContainsKnownProperties(response) {
          return !!getDeserializedResponse(response);
        }
      };
      var rawMetdataJSON = {
        endpointMetadata: {
          "login.microsoftonline.com": {
            token_endpoint: "https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/token",
            jwks_uri: "https://login.microsoftonline.com/{tenantid}/discovery/v2.0/keys",
            issuer: "https://login.microsoftonline.com/{tenantid}/v2.0",
            authorization_endpoint: "https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/authorize",
            end_session_endpoint: "https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/logout"
          },
          "login.chinacloudapi.cn": {
            token_endpoint: "https://login.chinacloudapi.cn/{tenantid}/oauth2/v2.0/token",
            jwks_uri: "https://login.chinacloudapi.cn/{tenantid}/discovery/v2.0/keys",
            issuer: "https://login.partner.microsoftonline.cn/{tenantid}/v2.0",
            authorization_endpoint: "https://login.chinacloudapi.cn/{tenantid}/oauth2/v2.0/authorize",
            end_session_endpoint: "https://login.chinacloudapi.cn/{tenantid}/oauth2/v2.0/logout"
          },
          "login.microsoftonline.us": {
            token_endpoint: "https://login.microsoftonline.us/{tenantid}/oauth2/v2.0/token",
            jwks_uri: "https://login.microsoftonline.us/{tenantid}/discovery/v2.0/keys",
            issuer: "https://login.microsoftonline.us/{tenantid}/v2.0",
            authorization_endpoint: "https://login.microsoftonline.us/{tenantid}/oauth2/v2.0/authorize",
            end_session_endpoint: "https://login.microsoftonline.us/{tenantid}/oauth2/v2.0/logout"
          }
        },
        instanceDiscoveryMetadata: {
          metadata: [
            {
              preferred_network: "login.microsoftonline.com",
              preferred_cache: "login.windows.net",
              aliases: [
                "login.microsoftonline.com",
                "login.windows.net",
                "login.microsoft.com",
                "sts.windows.net"
              ]
            },
            {
              preferred_network: "login.partner.microsoftonline.cn",
              preferred_cache: "login.partner.microsoftonline.cn",
              aliases: [
                "login.partner.microsoftonline.cn",
                "login.chinacloudapi.cn"
              ]
            },
            {
              preferred_network: "login.microsoftonline.de",
              preferred_cache: "login.microsoftonline.de",
              aliases: ["login.microsoftonline.de"]
            },
            {
              preferred_network: "login.microsoftonline.us",
              preferred_cache: "login.microsoftonline.us",
              aliases: [
                "login.microsoftonline.us",
                "login.usgovcloudapi.net"
              ]
            },
            {
              preferred_network: "login-us.microsoftonline.com",
              preferred_cache: "login-us.microsoftonline.com",
              aliases: ["login-us.microsoftonline.com"]
            }
          ]
        }
      };
      var EndpointMetadata = rawMetdataJSON.endpointMetadata;
      var InstanceDiscoveryMetadata = rawMetdataJSON.instanceDiscoveryMetadata;
      var InstanceDiscoveryMetadataAliases = /* @__PURE__ */ new Set();
      InstanceDiscoveryMetadata.metadata.forEach((metadataEntry) => {
        metadataEntry.aliases.forEach((alias) => {
          InstanceDiscoveryMetadataAliases.add(alias);
        });
      });
      function getAliasesFromStaticSources(staticAuthorityOptions, logger) {
        let staticAliases;
        const canonicalAuthority = staticAuthorityOptions.canonicalAuthority;
        if (canonicalAuthority) {
          const authorityHost = new UrlString(canonicalAuthority).getUrlComponents().HostNameAndPort;
          staticAliases = getAliasesFromMetadata(authorityHost, staticAuthorityOptions.cloudDiscoveryMetadata?.metadata, AuthorityMetadataSource.CONFIG, logger) || getAliasesFromMetadata(authorityHost, InstanceDiscoveryMetadata.metadata, AuthorityMetadataSource.HARDCODED_VALUES, logger) || staticAuthorityOptions.knownAuthorities;
        }
        return staticAliases || [];
      }
      function getAliasesFromMetadata(authorityHost, cloudDiscoveryMetadata, source, logger) {
        logger?.trace(`getAliasesFromMetadata called with source: ${source}`);
        if (authorityHost && cloudDiscoveryMetadata) {
          const metadata = getCloudDiscoveryMetadataFromNetworkResponse(cloudDiscoveryMetadata, authorityHost);
          if (metadata) {
            logger?.trace(`getAliasesFromMetadata: found cloud discovery metadata in ${source}, returning aliases`);
            return metadata.aliases;
          } else {
            logger?.trace(`getAliasesFromMetadata: did not find cloud discovery metadata in ${source}`);
          }
        }
        return null;
      }
      function getCloudDiscoveryMetadataFromHardcodedValues(authorityHost) {
        const metadata = getCloudDiscoveryMetadataFromNetworkResponse(InstanceDiscoveryMetadata.metadata, authorityHost);
        return metadata;
      }
      function getCloudDiscoveryMetadataFromNetworkResponse(response, authorityHost) {
        for (let i = 0; i < response.length; i++) {
          const metadata = response[i];
          if (metadata.aliases.includes(authorityHost)) {
            return metadata;
          }
        }
        return null;
      }
      var cacheQuotaExceeded = "cache_quota_exceeded";
      var cacheErrorUnknown = "cache_error_unknown";
      var CacheErrorMessages = {
        [cacheQuotaExceeded]: "Exceeded cache storage capacity.",
        [cacheErrorUnknown]: "Unexpected error occurred when using cache storage."
      };
      var CacheError = class _CacheError extends AuthError {
        constructor(errorCode, errorMessage) {
          const message = errorMessage || (CacheErrorMessages[errorCode] ? CacheErrorMessages[errorCode] : CacheErrorMessages[cacheErrorUnknown]);
          super(`${errorCode}: ${message}`);
          Object.setPrototypeOf(this, _CacheError.prototype);
          this.name = "CacheError";
          this.errorCode = errorCode;
          this.errorMessage = message;
        }
      };
      function createCacheError(e) {
        if (!(e instanceof Error)) {
          return new CacheError(cacheErrorUnknown);
        }
        if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.message.includes("exceeded the quota")) {
          return new CacheError(cacheQuotaExceeded);
        } else {
          return new CacheError(e.name, e.message);
        }
      }
      var CacheManager = class {
        constructor(clientId, cryptoImpl, logger, performanceClient, staticAuthorityOptions) {
          this.clientId = clientId;
          this.cryptoImpl = cryptoImpl;
          this.commonLogger = logger.clone(name$1, version$1);
          this.staticAuthorityOptions = staticAuthorityOptions;
          this.performanceClient = performanceClient;
        }
        /**
         * Returns all the accounts in the cache that match the optional filter. If no filter is provided, all accounts are returned.
         * @param accountFilter - (Optional) filter to narrow down the accounts returned
         * @returns Array of AccountInfo objects in cache
         */
        getAllAccounts(accountFilter, correlationId) {
          return this.buildTenantProfiles(this.getAccountsFilteredBy(accountFilter, correlationId), correlationId, accountFilter);
        }
        /**
         * Gets first tenanted AccountInfo object found based on provided filters
         */
        getAccountInfoFilteredBy(accountFilter, correlationId) {
          if (Object.keys(accountFilter).length === 0 || Object.values(accountFilter).every((value) => !value)) {
            this.commonLogger.warning("getAccountInfoFilteredBy: Account filter is empty or invalid, returning null");
            return null;
          }
          const allAccounts = this.getAllAccounts(accountFilter, correlationId);
          if (allAccounts.length > 1) {
            const sortedAccounts = allAccounts.sort((account2) => {
              return account2.idTokenClaims ? -1 : 1;
            });
            return sortedAccounts[0];
          } else if (allAccounts.length === 1) {
            return allAccounts[0];
          } else {
            return null;
          }
        }
        /**
         * Returns a single matching
         * @param accountFilter
         * @returns
         */
        getBaseAccountInfo(accountFilter, correlationId) {
          const accountEntities = this.getAccountsFilteredBy(accountFilter, correlationId);
          if (accountEntities.length > 0) {
            return accountEntities[0].getAccountInfo();
          } else {
            return null;
          }
        }
        /**
         * Matches filtered account entities with cached ID tokens that match the tenant profile-specific account filters
         * and builds the account info objects from the matching ID token's claims
         * @param cachedAccounts
         * @param accountFilter
         * @returns Array of AccountInfo objects that match account and tenant profile filters
         */
        buildTenantProfiles(cachedAccounts, correlationId, accountFilter) {
          return cachedAccounts.flatMap((accountEntity) => {
            return this.getTenantProfilesFromAccountEntity(accountEntity, correlationId, accountFilter?.tenantId, accountFilter);
          });
        }
        getTenantedAccountInfoByFilter(accountInfo, tokenKeys, tenantProfile, correlationId, tenantProfileFilter) {
          let tenantedAccountInfo = null;
          let idTokenClaims;
          if (tenantProfileFilter) {
            if (!this.tenantProfileMatchesFilter(tenantProfile, tenantProfileFilter)) {
              return null;
            }
          }
          const idToken = this.getIdToken(accountInfo, correlationId, tokenKeys, tenantProfile.tenantId);
          if (idToken) {
            idTokenClaims = extractTokenClaims(idToken.secret, this.cryptoImpl.base64Decode);
            if (!this.idTokenClaimsMatchTenantProfileFilter(idTokenClaims, tenantProfileFilter)) {
              return null;
            }
          }
          tenantedAccountInfo = updateAccountTenantProfileData(accountInfo, tenantProfile, idTokenClaims, idToken?.secret);
          return tenantedAccountInfo;
        }
        getTenantProfilesFromAccountEntity(accountEntity, correlationId, targetTenantId, tenantProfileFilter) {
          const accountInfo = accountEntity.getAccountInfo();
          let searchTenantProfiles = accountInfo.tenantProfiles || /* @__PURE__ */ new Map();
          const tokenKeys = this.getTokenKeys();
          if (targetTenantId) {
            const tenantProfile = searchTenantProfiles.get(targetTenantId);
            if (tenantProfile) {
              searchTenantProfiles = /* @__PURE__ */ new Map([
                [targetTenantId, tenantProfile]
              ]);
            } else {
              return [];
            }
          }
          const matchingTenantProfiles = [];
          searchTenantProfiles.forEach((tenantProfile) => {
            const tenantedAccountInfo = this.getTenantedAccountInfoByFilter(accountInfo, tokenKeys, tenantProfile, correlationId, tenantProfileFilter);
            if (tenantedAccountInfo) {
              matchingTenantProfiles.push(tenantedAccountInfo);
            }
          });
          return matchingTenantProfiles;
        }
        tenantProfileMatchesFilter(tenantProfile, tenantProfileFilter) {
          if (!!tenantProfileFilter.localAccountId && !this.matchLocalAccountIdFromTenantProfile(tenantProfile, tenantProfileFilter.localAccountId)) {
            return false;
          }
          if (!!tenantProfileFilter.name && !(tenantProfile.name === tenantProfileFilter.name)) {
            return false;
          }
          if (tenantProfileFilter.isHomeTenant !== void 0 && !(tenantProfile.isHomeTenant === tenantProfileFilter.isHomeTenant)) {
            return false;
          }
          return true;
        }
        idTokenClaimsMatchTenantProfileFilter(idTokenClaims, tenantProfileFilter) {
          if (tenantProfileFilter) {
            if (!!tenantProfileFilter.localAccountId && !this.matchLocalAccountIdFromTokenClaims(idTokenClaims, tenantProfileFilter.localAccountId)) {
              return false;
            }
            if (!!tenantProfileFilter.loginHint && !this.matchLoginHintFromTokenClaims(idTokenClaims, tenantProfileFilter.loginHint)) {
              return false;
            }
            if (!!tenantProfileFilter.username && !this.matchUsername(idTokenClaims.preferred_username, tenantProfileFilter.username)) {
              return false;
            }
            if (!!tenantProfileFilter.name && !this.matchName(idTokenClaims, tenantProfileFilter.name)) {
              return false;
            }
            if (!!tenantProfileFilter.sid && !this.matchSid(idTokenClaims, tenantProfileFilter.sid)) {
              return false;
            }
          }
          return true;
        }
        /**
         * saves a cache record
         * @param cacheRecord {CacheRecord}
         * @param storeInCache {?StoreInCache}
         * @param correlationId {?string} correlation id
         */
        async saveCacheRecord(cacheRecord, correlationId, storeInCache) {
          if (!cacheRecord) {
            throw createClientAuthError(invalidCacheRecord);
          }
          try {
            if (!!cacheRecord.account) {
              await this.setAccount(cacheRecord.account, correlationId);
            }
            if (!!cacheRecord.idToken && storeInCache?.idToken !== false) {
              await this.setIdTokenCredential(cacheRecord.idToken, correlationId);
            }
            if (!!cacheRecord.accessToken && storeInCache?.accessToken !== false) {
              await this.saveAccessToken(cacheRecord.accessToken, correlationId);
            }
            if (!!cacheRecord.refreshToken && storeInCache?.refreshToken !== false) {
              await this.setRefreshTokenCredential(cacheRecord.refreshToken, correlationId);
            }
            if (!!cacheRecord.appMetadata) {
              this.setAppMetadata(cacheRecord.appMetadata, correlationId);
            }
          } catch (e) {
            this.commonLogger?.error(`CacheManager.saveCacheRecord: failed`);
            if (e instanceof AuthError) {
              throw e;
            } else {
              throw createCacheError(e);
            }
          }
        }
        /**
         * saves access token credential
         * @param credential
         */
        async saveAccessToken(credential, correlationId) {
          const accessTokenFilter = {
            clientId: credential.clientId,
            credentialType: credential.credentialType,
            environment: credential.environment,
            homeAccountId: credential.homeAccountId,
            realm: credential.realm,
            tokenType: credential.tokenType,
            requestedClaimsHash: credential.requestedClaimsHash
          };
          const tokenKeys = this.getTokenKeys();
          const currentScopes = ScopeSet.fromString(credential.target);
          tokenKeys.accessToken.forEach((key) => {
            if (!this.accessTokenKeyMatchesFilter(key, accessTokenFilter, false)) {
              return;
            }
            const tokenEntity = this.getAccessTokenCredential(key, correlationId);
            if (tokenEntity && this.credentialMatchesFilter(tokenEntity, accessTokenFilter)) {
              const tokenScopeSet = ScopeSet.fromString(tokenEntity.target);
              if (tokenScopeSet.intersectingScopeSets(currentScopes)) {
                this.removeAccessToken(key, correlationId);
              }
            }
          });
          await this.setAccessTokenCredential(credential, correlationId);
        }
        /**
         * Retrieve account entities matching all provided tenant-agnostic filters; if no filter is set, get all account entities in the cache
         * Not checking for casing as keys are all generated in lower case, remember to convert to lower case if object properties are compared
         * @param accountFilter - An object containing Account properties to filter by
         */
        getAccountsFilteredBy(accountFilter, correlationId) {
          const allAccountKeys = this.getAccountKeys();
          const matchingAccounts = [];
          allAccountKeys.forEach((cacheKey) => {
            const entity = this.getAccount(cacheKey, correlationId);
            if (!entity) {
              return;
            }
            if (!!accountFilter.homeAccountId && !this.matchHomeAccountId(entity, accountFilter.homeAccountId)) {
              return;
            }
            if (!!accountFilter.username && !this.matchUsername(entity.username, accountFilter.username)) {
              return;
            }
            if (!!accountFilter.environment && !this.matchEnvironment(entity, accountFilter.environment)) {
              return;
            }
            if (!!accountFilter.realm && !this.matchRealm(entity, accountFilter.realm)) {
              return;
            }
            if (!!accountFilter.nativeAccountId && !this.matchNativeAccountId(entity, accountFilter.nativeAccountId)) {
              return;
            }
            if (!!accountFilter.authorityType && !this.matchAuthorityType(entity, accountFilter.authorityType)) {
              return;
            }
            const tenantProfileFilter = {
              localAccountId: accountFilter?.localAccountId,
              name: accountFilter?.name
            };
            const matchingTenantProfiles = entity.tenantProfiles?.filter((tenantProfile) => {
              return this.tenantProfileMatchesFilter(tenantProfile, tenantProfileFilter);
            });
            if (matchingTenantProfiles && matchingTenantProfiles.length === 0) {
              return;
            }
            matchingAccounts.push(entity);
          });
          return matchingAccounts;
        }
        /**
         * Returns whether or not the given credential entity matches the filter
         * @param entity
         * @param filter
         * @returns
         */
        credentialMatchesFilter(entity, filter) {
          if (!!filter.clientId && !this.matchClientId(entity, filter.clientId)) {
            return false;
          }
          if (!!filter.userAssertionHash && !this.matchUserAssertionHash(entity, filter.userAssertionHash)) {
            return false;
          }
          if (typeof filter.homeAccountId === "string" && !this.matchHomeAccountId(entity, filter.homeAccountId)) {
            return false;
          }
          if (!!filter.environment && !this.matchEnvironment(entity, filter.environment)) {
            return false;
          }
          if (!!filter.realm && !this.matchRealm(entity, filter.realm)) {
            return false;
          }
          if (!!filter.credentialType && !this.matchCredentialType(entity, filter.credentialType)) {
            return false;
          }
          if (!!filter.familyId && !this.matchFamilyId(entity, filter.familyId)) {
            return false;
          }
          if (!!filter.target && !this.matchTarget(entity, filter.target)) {
            return false;
          }
          if (filter.requestedClaimsHash || entity.requestedClaimsHash) {
            if (entity.requestedClaimsHash !== filter.requestedClaimsHash) {
              return false;
            }
          }
          if (entity.credentialType === CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME) {
            if (!!filter.tokenType && !this.matchTokenType(entity, filter.tokenType)) {
              return false;
            }
            if (filter.tokenType === AuthenticationScheme.SSH) {
              if (filter.keyId && !this.matchKeyId(entity, filter.keyId)) {
                return false;
              }
            }
          }
          return true;
        }
        /**
         * retrieve appMetadata matching all provided filters; if no filter is set, get all appMetadata
         * @param filter
         */
        getAppMetadataFilteredBy(filter) {
          const allCacheKeys = this.getKeys();
          const matchingAppMetadata = {};
          allCacheKeys.forEach((cacheKey) => {
            if (!this.isAppMetadata(cacheKey)) {
              return;
            }
            const entity = this.getAppMetadata(cacheKey);
            if (!entity) {
              return;
            }
            if (!!filter.environment && !this.matchEnvironment(entity, filter.environment)) {
              return;
            }
            if (!!filter.clientId && !this.matchClientId(entity, filter.clientId)) {
              return;
            }
            matchingAppMetadata[cacheKey] = entity;
          });
          return matchingAppMetadata;
        }
        /**
         * retrieve authorityMetadata that contains a matching alias
         * @param filter
         */
        getAuthorityMetadataByAlias(host) {
          const allCacheKeys = this.getAuthorityMetadataKeys();
          let matchedEntity = null;
          allCacheKeys.forEach((cacheKey) => {
            if (!this.isAuthorityMetadata(cacheKey) || cacheKey.indexOf(this.clientId) === -1) {
              return;
            }
            const entity = this.getAuthorityMetadata(cacheKey);
            if (!entity) {
              return;
            }
            if (entity.aliases.indexOf(host) === -1) {
              return;
            }
            matchedEntity = entity;
          });
          return matchedEntity;
        }
        /**
         * Removes all accounts and related tokens from cache.
         */
        removeAllAccounts(correlationId) {
          const accounts = this.getAllAccounts({}, correlationId);
          accounts.forEach((account2) => {
            this.removeAccount(account2, correlationId);
          });
        }
        /**
         * Removes the account and related tokens for a given account key
         * @param account
         */
        removeAccount(account2, correlationId) {
          this.removeAccountContext(account2, correlationId);
          const accountKeys = this.getAccountKeys();
          const keyFilter = (key) => {
            return key.includes(account2.homeAccountId) && key.includes(account2.environment);
          };
          accountKeys.filter(keyFilter).forEach((key) => {
            this.removeItem(key, correlationId);
            this.performanceClient.incrementFields({ accountsRemoved: 1 }, correlationId);
          });
        }
        /**
         * Removes credentials associated with the provided account
         * @param account
         */
        removeAccountContext(account2, correlationId) {
          const allTokenKeys = this.getTokenKeys();
          const keyFilter = (key) => {
            return key.includes(account2.homeAccountId) && key.includes(account2.environment);
          };
          allTokenKeys.idToken.filter(keyFilter).forEach((key) => {
            this.removeIdToken(key, correlationId);
          });
          allTokenKeys.accessToken.filter(keyFilter).forEach((key) => {
            this.removeAccessToken(key, correlationId);
          });
          allTokenKeys.refreshToken.filter(keyFilter).forEach((key) => {
            this.removeRefreshToken(key, correlationId);
          });
        }
        /**
         * Removes accessToken from the cache
         * @param key
         * @param correlationId
         */
        removeAccessToken(key, correlationId) {
          const credential = this.getAccessTokenCredential(key, correlationId);
          this.removeItem(key, correlationId);
          this.performanceClient.incrementFields({ accessTokensRemoved: 1 }, correlationId);
          if (!credential || credential.credentialType.toLowerCase() !== CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME.toLowerCase() || credential.tokenType !== AuthenticationScheme.POP) {
            return;
          }
          const kid = credential.keyId;
          if (kid) {
            void this.cryptoImpl.removeTokenBindingKey(kid).catch(() => {
              this.commonLogger.error(`Failed to remove token binding key ${kid}`, correlationId);
              this.performanceClient?.incrementFields({ removeTokenBindingKeyFailure: 1 }, correlationId);
            });
          }
        }
        /**
         * Removes all app metadata objects from cache.
         */
        removeAppMetadata(correlationId) {
          const allCacheKeys = this.getKeys();
          allCacheKeys.forEach((cacheKey) => {
            if (this.isAppMetadata(cacheKey)) {
              this.removeItem(cacheKey, correlationId);
            }
          });
          return true;
        }
        /**
         * Retrieve IdTokenEntity from cache
         * @param account {AccountInfo}
         * @param tokenKeys {?TokenKeys}
         * @param targetRealm {?string}
         * @param performanceClient {?IPerformanceClient}
         * @param correlationId {?string}
         */
        getIdToken(account2, correlationId, tokenKeys, targetRealm, performanceClient) {
          this.commonLogger.trace("CacheManager - getIdToken called");
          const idTokenFilter = {
            homeAccountId: account2.homeAccountId,
            environment: account2.environment,
            credentialType: CredentialType.ID_TOKEN,
            clientId: this.clientId,
            realm: targetRealm
          };
          const idTokenMap = this.getIdTokensByFilter(idTokenFilter, correlationId, tokenKeys);
          const numIdTokens = idTokenMap.size;
          if (numIdTokens < 1) {
            this.commonLogger.info("CacheManager:getIdToken - No token found");
            return null;
          } else if (numIdTokens > 1) {
            let tokensToBeRemoved = idTokenMap;
            if (!targetRealm) {
              const homeIdTokenMap = /* @__PURE__ */ new Map();
              idTokenMap.forEach((idToken, key) => {
                if (idToken.realm === account2.tenantId) {
                  homeIdTokenMap.set(key, idToken);
                }
              });
              const numHomeIdTokens = homeIdTokenMap.size;
              if (numHomeIdTokens < 1) {
                this.commonLogger.info("CacheManager:getIdToken - Multiple ID tokens found for account but none match account entity tenant id, returning first result");
                return idTokenMap.values().next().value;
              } else if (numHomeIdTokens === 1) {
                this.commonLogger.info("CacheManager:getIdToken - Multiple ID tokens found for account, defaulting to home tenant profile");
                return homeIdTokenMap.values().next().value;
              } else {
                tokensToBeRemoved = homeIdTokenMap;
              }
            }
            this.commonLogger.info("CacheManager:getIdToken - Multiple matching ID tokens found, clearing them");
            tokensToBeRemoved.forEach((idToken, key) => {
              this.removeIdToken(key, correlationId);
            });
            if (performanceClient && correlationId) {
              performanceClient.addFields({ multiMatchedID: idTokenMap.size }, correlationId);
            }
            return null;
          }
          this.commonLogger.info("CacheManager:getIdToken - Returning ID token");
          return idTokenMap.values().next().value;
        }
        /**
         * Gets all idTokens matching the given filter
         * @param filter
         * @returns
         */
        getIdTokensByFilter(filter, correlationId, tokenKeys) {
          const idTokenKeys = tokenKeys && tokenKeys.idToken || this.getTokenKeys().idToken;
          const idTokens = /* @__PURE__ */ new Map();
          idTokenKeys.forEach((key) => {
            if (!this.idTokenKeyMatchesFilter(key, {
              clientId: this.clientId,
              ...filter
            })) {
              return;
            }
            const idToken = this.getIdTokenCredential(key, correlationId);
            if (idToken && this.credentialMatchesFilter(idToken, filter)) {
              idTokens.set(key, idToken);
            }
          });
          return idTokens;
        }
        /**
         * Validate the cache key against filter before retrieving and parsing cache value
         * @param key
         * @param filter
         * @returns
         */
        idTokenKeyMatchesFilter(inputKey, filter) {
          const key = inputKey.toLowerCase();
          if (filter.clientId && key.indexOf(filter.clientId.toLowerCase()) === -1) {
            return false;
          }
          if (filter.homeAccountId && key.indexOf(filter.homeAccountId.toLowerCase()) === -1) {
            return false;
          }
          return true;
        }
        /**
         * Removes idToken from the cache
         * @param key
         */
        removeIdToken(key, correlationId) {
          this.removeItem(key, correlationId);
        }
        /**
         * Removes refresh token from the cache
         * @param key
         */
        removeRefreshToken(key, correlationId) {
          this.removeItem(key, correlationId);
        }
        /**
         * Retrieve AccessTokenEntity from cache
         * @param account {AccountInfo}
         * @param request {BaseAuthRequest}
         * @param correlationId {?string}
         * @param tokenKeys {?TokenKeys}
         * @param performanceClient {?IPerformanceClient}
         */
        getAccessToken(account2, request, tokenKeys, targetRealm) {
          const correlationId = request.correlationId;
          this.commonLogger.trace("CacheManager - getAccessToken called", correlationId);
          const scopes = ScopeSet.createSearchScopes(request.scopes);
          const authScheme = request.authenticationScheme || AuthenticationScheme.BEARER;
          const credentialType = authScheme && authScheme.toLowerCase() !== AuthenticationScheme.BEARER.toLowerCase() ? CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME : CredentialType.ACCESS_TOKEN;
          const accessTokenFilter = {
            homeAccountId: account2.homeAccountId,
            environment: account2.environment,
            credentialType,
            clientId: this.clientId,
            realm: targetRealm || account2.tenantId,
            target: scopes,
            tokenType: authScheme,
            keyId: request.sshKid,
            requestedClaimsHash: request.requestedClaimsHash
          };
          const accessTokenKeys = tokenKeys && tokenKeys.accessToken || this.getTokenKeys().accessToken;
          const accessTokens = [];
          accessTokenKeys.forEach((key) => {
            if (this.accessTokenKeyMatchesFilter(key, accessTokenFilter, true)) {
              const accessToken = this.getAccessTokenCredential(key, correlationId);
              if (accessToken && this.credentialMatchesFilter(accessToken, accessTokenFilter)) {
                accessTokens.push(accessToken);
              }
            }
          });
          const numAccessTokens = accessTokens.length;
          if (numAccessTokens < 1) {
            this.commonLogger.info("CacheManager:getAccessToken - No token found", correlationId);
            return null;
          } else if (numAccessTokens > 1) {
            this.commonLogger.info("CacheManager:getAccessToken - Multiple access tokens found, clearing them", correlationId);
            accessTokens.forEach((accessToken) => {
              this.removeAccessToken(this.generateCredentialKey(accessToken), correlationId);
            });
            this.performanceClient.addFields({ multiMatchedAT: accessTokens.length }, correlationId);
            return null;
          }
          this.commonLogger.info("CacheManager:getAccessToken - Returning access token", correlationId);
          return accessTokens[0];
        }
        /**
         * Validate the cache key against filter before retrieving and parsing cache value
         * @param key
         * @param filter
         * @param keyMustContainAllScopes
         * @returns
         */
        accessTokenKeyMatchesFilter(inputKey, filter, keyMustContainAllScopes) {
          const key = inputKey.toLowerCase();
          if (filter.clientId && key.indexOf(filter.clientId.toLowerCase()) === -1) {
            return false;
          }
          if (filter.homeAccountId && key.indexOf(filter.homeAccountId.toLowerCase()) === -1) {
            return false;
          }
          if (filter.realm && key.indexOf(filter.realm.toLowerCase()) === -1) {
            return false;
          }
          if (filter.requestedClaimsHash && key.indexOf(filter.requestedClaimsHash.toLowerCase()) === -1) {
            return false;
          }
          if (filter.target) {
            const scopes = filter.target.asArray();
            for (let i = 0; i < scopes.length; i++) {
              if (keyMustContainAllScopes && !key.includes(scopes[i].toLowerCase())) {
                return false;
              } else if (!keyMustContainAllScopes && key.includes(scopes[i].toLowerCase())) {
                return true;
              }
            }
          }
          return true;
        }
        /**
         * Gets all access tokens matching the filter
         * @param filter
         * @returns
         */
        getAccessTokensByFilter(filter, correlationId) {
          const tokenKeys = this.getTokenKeys();
          const accessTokens = [];
          tokenKeys.accessToken.forEach((key) => {
            if (!this.accessTokenKeyMatchesFilter(key, filter, true)) {
              return;
            }
            const accessToken = this.getAccessTokenCredential(key, correlationId);
            if (accessToken && this.credentialMatchesFilter(accessToken, filter)) {
              accessTokens.push(accessToken);
            }
          });
          return accessTokens;
        }
        /**
         * Helper to retrieve the appropriate refresh token from cache
         * @param account {AccountInfo}
         * @param familyRT {boolean}
         * @param correlationId {?string}
         * @param tokenKeys {?TokenKeys}
         * @param performanceClient {?IPerformanceClient}
         */
        getRefreshToken(account2, familyRT, correlationId, tokenKeys, performanceClient) {
          this.commonLogger.trace("CacheManager - getRefreshToken called");
          const id = familyRT ? THE_FAMILY_ID : void 0;
          const refreshTokenFilter = {
            homeAccountId: account2.homeAccountId,
            environment: account2.environment,
            credentialType: CredentialType.REFRESH_TOKEN,
            clientId: this.clientId,
            familyId: id
          };
          const refreshTokenKeys = tokenKeys && tokenKeys.refreshToken || this.getTokenKeys().refreshToken;
          const refreshTokens = [];
          refreshTokenKeys.forEach((key) => {
            if (this.refreshTokenKeyMatchesFilter(key, refreshTokenFilter)) {
              const refreshToken = this.getRefreshTokenCredential(key, correlationId);
              if (refreshToken && this.credentialMatchesFilter(refreshToken, refreshTokenFilter)) {
                refreshTokens.push(refreshToken);
              }
            }
          });
          const numRefreshTokens = refreshTokens.length;
          if (numRefreshTokens < 1) {
            this.commonLogger.info("CacheManager:getRefreshToken - No refresh token found.");
            return null;
          }
          if (numRefreshTokens > 1 && performanceClient && correlationId) {
            performanceClient.addFields({ multiMatchedRT: numRefreshTokens }, correlationId);
          }
          this.commonLogger.info("CacheManager:getRefreshToken - returning refresh token");
          return refreshTokens[0];
        }
        /**
         * Validate the cache key against filter before retrieving and parsing cache value
         * @param key
         * @param filter
         */
        refreshTokenKeyMatchesFilter(inputKey, filter) {
          const key = inputKey.toLowerCase();
          if (filter.familyId && key.indexOf(filter.familyId.toLowerCase()) === -1) {
            return false;
          }
          if (!filter.familyId && filter.clientId && key.indexOf(filter.clientId.toLowerCase()) === -1) {
            return false;
          }
          if (filter.homeAccountId && key.indexOf(filter.homeAccountId.toLowerCase()) === -1) {
            return false;
          }
          return true;
        }
        /**
         * Retrieve AppMetadataEntity from cache
         */
        readAppMetadataFromCache(environment) {
          const appMetadataFilter = {
            environment,
            clientId: this.clientId
          };
          const appMetadata = this.getAppMetadataFilteredBy(appMetadataFilter);
          const appMetadataEntries = Object.keys(appMetadata).map((key) => appMetadata[key]);
          const numAppMetadata = appMetadataEntries.length;
          if (numAppMetadata < 1) {
            return null;
          } else if (numAppMetadata > 1) {
            throw createClientAuthError(multipleMatchingAppMetadata);
          }
          return appMetadataEntries[0];
        }
        /**
         * Return the family_id value associated  with FOCI
         * @param environment
         * @param clientId
         */
        isAppMetadataFOCI(environment) {
          const appMetadata = this.readAppMetadataFromCache(environment);
          return !!(appMetadata && appMetadata.familyId === THE_FAMILY_ID);
        }
        /**
         * helper to match account ids
         * @param value
         * @param homeAccountId
         */
        matchHomeAccountId(entity, homeAccountId) {
          return !!(typeof entity.homeAccountId === "string" && homeAccountId === entity.homeAccountId);
        }
        /**
         * helper to match account ids
         * @param entity
         * @param localAccountId
         * @returns
         */
        matchLocalAccountIdFromTokenClaims(tokenClaims, localAccountId) {
          const idTokenLocalAccountId = tokenClaims.oid || tokenClaims.sub;
          return localAccountId === idTokenLocalAccountId;
        }
        matchLocalAccountIdFromTenantProfile(tenantProfile, localAccountId) {
          return tenantProfile.localAccountId === localAccountId;
        }
        /**
         * helper to match names
         * @param entity
         * @param name
         * @returns true if the downcased name properties are present and match in the filter and the entity
         */
        matchName(claims, name2) {
          return !!(name2.toLowerCase() === claims.name?.toLowerCase());
        }
        /**
         * helper to match usernames
         * @param entity
         * @param username
         * @returns
         */
        matchUsername(cachedUsername, filterUsername) {
          return !!(cachedUsername && typeof cachedUsername === "string" && filterUsername?.toLowerCase() === cachedUsername.toLowerCase());
        }
        /**
         * helper to match assertion
         * @param value
         * @param oboAssertion
         */
        matchUserAssertionHash(entity, userAssertionHash) {
          return !!(entity.userAssertionHash && userAssertionHash === entity.userAssertionHash);
        }
        /**
         * helper to match environment
         * @param value
         * @param environment
         */
        matchEnvironment(entity, environment) {
          if (this.staticAuthorityOptions) {
            const staticAliases = getAliasesFromStaticSources(this.staticAuthorityOptions, this.commonLogger);
            if (staticAliases.includes(environment) && staticAliases.includes(entity.environment)) {
              return true;
            }
          }
          const cloudMetadata = this.getAuthorityMetadataByAlias(environment);
          if (cloudMetadata && cloudMetadata.aliases.indexOf(entity.environment) > -1) {
            return true;
          }
          return false;
        }
        /**
         * helper to match credential type
         * @param entity
         * @param credentialType
         */
        matchCredentialType(entity, credentialType) {
          return entity.credentialType && credentialType.toLowerCase() === entity.credentialType.toLowerCase();
        }
        /**
         * helper to match client ids
         * @param entity
         * @param clientId
         */
        matchClientId(entity, clientId) {
          return !!(entity.clientId && clientId === entity.clientId);
        }
        /**
         * helper to match family ids
         * @param entity
         * @param familyId
         */
        matchFamilyId(entity, familyId) {
          return !!(entity.familyId && familyId === entity.familyId);
        }
        /**
         * helper to match realm
         * @param entity
         * @param realm
         */
        matchRealm(entity, realm) {
          return !!(entity.realm?.toLowerCase() === realm.toLowerCase());
        }
        /**
         * helper to match nativeAccountId
         * @param entity
         * @param nativeAccountId
         * @returns boolean indicating the match result
         */
        matchNativeAccountId(entity, nativeAccountId) {
          return !!(entity.nativeAccountId && nativeAccountId === entity.nativeAccountId);
        }
        /**
         * helper to match loginHint which can be either:
         * 1. login_hint ID token claim
         * 2. username in cached account object
         * 3. upn in ID token claims
         * @param entity
         * @param loginHint
         * @returns
         */
        matchLoginHintFromTokenClaims(tokenClaims, loginHint) {
          if (tokenClaims.login_hint === loginHint) {
            return true;
          }
          if (tokenClaims.preferred_username === loginHint) {
            return true;
          }
          if (tokenClaims.upn === loginHint) {
            return true;
          }
          return false;
        }
        /**
         * Helper to match sid
         * @param entity
         * @param sid
         * @returns true if the sid claim is present and matches the filter
         */
        matchSid(idTokenClaims, sid) {
          return idTokenClaims.sid === sid;
        }
        matchAuthorityType(entity, authorityType) {
          return !!(entity.authorityType && authorityType.toLowerCase() === entity.authorityType.toLowerCase());
        }
        /**
         * Returns true if the target scopes are a subset of the current entity's scopes, false otherwise.
         * @param entity
         * @param target
         */
        matchTarget(entity, target) {
          const isNotAccessTokenCredential = entity.credentialType !== CredentialType.ACCESS_TOKEN && entity.credentialType !== CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME;
          if (isNotAccessTokenCredential || !entity.target) {
            return false;
          }
          const entityScopeSet = ScopeSet.fromString(entity.target);
          return entityScopeSet.containsScopeSet(target);
        }
        /**
         * Returns true if the credential's tokenType or Authentication Scheme matches the one in the request, false otherwise
         * @param entity
         * @param tokenType
         */
        matchTokenType(entity, tokenType) {
          return !!(entity.tokenType && entity.tokenType === tokenType);
        }
        /**
         * Returns true if the credential's keyId matches the one in the request, false otherwise
         * @param entity
         * @param keyId
         */
        matchKeyId(entity, keyId) {
          return !!(entity.keyId && entity.keyId === keyId);
        }
        /**
         * returns if a given cache entity is of the type appmetadata
         * @param key
         */
        isAppMetadata(key) {
          return key.indexOf(APP_METADATA) !== -1;
        }
        /**
         * returns if a given cache entity is of the type authoritymetadata
         * @param key
         */
        isAuthorityMetadata(key) {
          return key.indexOf(AUTHORITY_METADATA_CONSTANTS.CACHE_KEY) !== -1;
        }
        /**
         * returns cache key used for cloud instance metadata
         */
        generateAuthorityMetadataCacheKey(authority) {
          return `${AUTHORITY_METADATA_CONSTANTS.CACHE_KEY}-${this.clientId}-${authority}`;
        }
        /**
         * Helper to convert serialized data to object
         * @param obj
         * @param json
         */
        static toObject(obj, json) {
          for (const propertyName in json) {
            obj[propertyName] = json[propertyName];
          }
          return obj;
        }
      };
      var DefaultStorageClass = class extends CacheManager {
        async setAccount() {
          throw createClientAuthError(methodNotImplemented);
        }
        getAccount() {
          throw createClientAuthError(methodNotImplemented);
        }
        async setIdTokenCredential() {
          throw createClientAuthError(methodNotImplemented);
        }
        getIdTokenCredential() {
          throw createClientAuthError(methodNotImplemented);
        }
        async setAccessTokenCredential() {
          throw createClientAuthError(methodNotImplemented);
        }
        getAccessTokenCredential() {
          throw createClientAuthError(methodNotImplemented);
        }
        async setRefreshTokenCredential() {
          throw createClientAuthError(methodNotImplemented);
        }
        getRefreshTokenCredential() {
          throw createClientAuthError(methodNotImplemented);
        }
        setAppMetadata() {
          throw createClientAuthError(methodNotImplemented);
        }
        getAppMetadata() {
          throw createClientAuthError(methodNotImplemented);
        }
        setServerTelemetry() {
          throw createClientAuthError(methodNotImplemented);
        }
        getServerTelemetry() {
          throw createClientAuthError(methodNotImplemented);
        }
        setAuthorityMetadata() {
          throw createClientAuthError(methodNotImplemented);
        }
        getAuthorityMetadata() {
          throw createClientAuthError(methodNotImplemented);
        }
        getAuthorityMetadataKeys() {
          throw createClientAuthError(methodNotImplemented);
        }
        setThrottlingCache() {
          throw createClientAuthError(methodNotImplemented);
        }
        getThrottlingCache() {
          throw createClientAuthError(methodNotImplemented);
        }
        removeItem() {
          throw createClientAuthError(methodNotImplemented);
        }
        getKeys() {
          throw createClientAuthError(methodNotImplemented);
        }
        getAccountKeys() {
          throw createClientAuthError(methodNotImplemented);
        }
        getTokenKeys() {
          throw createClientAuthError(methodNotImplemented);
        }
        generateCredentialKey() {
          throw createClientAuthError(methodNotImplemented);
        }
        generateAccountKey() {
          throw createClientAuthError(methodNotImplemented);
        }
      };
      var ProtocolMode = {
        /**
         * Auth Code + PKCE with Entra ID (formerly AAD) specific optimizations and features
         */
        AAD: "AAD",
        /**
         * Auth Code + PKCE without Entra ID specific optimizations and features. For use only with non-Microsoft owned authorities.
         * Support is limited for this mode.
         */
        OIDC: "OIDC",
        /**
         * Encrypted Authorize Response (EAR) with Entra ID specific optimizations and features
         */
        EAR: "EAR"
      };
      var PerformanceEvents = {
        /**
         * acquireTokenByCode API (msal-browser and msal-node).
         * Used to acquire tokens by trading an authorization code against the token endpoint.
         */
        AcquireTokenByCode: "acquireTokenByCode",
        /**
         * acquireTokenByRefreshToken API (msal-browser and msal-node).
         * Used to renew an access token using a refresh token against the token endpoint.
         */
        AcquireTokenByRefreshToken: "acquireTokenByRefreshToken",
        /**
         * acquireTokenSilent API (msal-browser and msal-node).
         * Used to silently acquire a new access token (from the cache or the network).
         */
        AcquireTokenSilent: "acquireTokenSilent",
        /**
         * acquireTokenSilentAsync (msal-browser).
         * Internal API for acquireTokenSilent.
         */
        AcquireTokenSilentAsync: "acquireTokenSilentAsync",
        /**
         * acquireTokenPopup (msal-browser).
         * Used to acquire a new access token interactively through pop ups
         */
        AcquireTokenPopup: "acquireTokenPopup",
        /**
         * acquireTokenPreRedirect (msal-browser).
         * First part of the redirect flow.
         * Used to acquire a new access token interactively through redirects.
         */
        AcquireTokenPreRedirect: "acquireTokenPreRedirect",
        /**
         * acquireTokenRedirect (msal-browser).
         * Second part of the redirect flow.
         * Used to acquire a new access token interactively through redirects.
         */
        AcquireTokenRedirect: "acquireTokenRedirect",
        /**
         * getPublicKeyThumbprint API in CryptoOpts class (msal-browser).
         * Used to generate a public/private keypair and generate a public key thumbprint for pop requests.
         */
        CryptoOptsGetPublicKeyThumbprint: "cryptoOptsGetPublicKeyThumbprint",
        /**
         * signJwt API in CryptoOpts class (msal-browser).
         * Used to signed a pop token.
         */
        CryptoOptsSignJwt: "cryptoOptsSignJwt",
        /**
         * acquireToken API in the SilentCacheClient class (msal-browser).
         * Used to read access tokens from the cache.
         */
        SilentCacheClientAcquireToken: "silentCacheClientAcquireToken",
        /**
         * acquireToken API in the SilentIframeClient class (msal-browser).
         * Used to acquire a new set of tokens from the authorize endpoint in a hidden iframe.
         */
        SilentIframeClientAcquireToken: "silentIframeClientAcquireToken",
        AwaitConcurrentIframe: "awaitConcurrentIframe",
        /**
         * acquireToken API in SilentRereshClient (msal-browser).
         * Used to acquire a new set of tokens from the token endpoint using a refresh token.
         */
        SilentRefreshClientAcquireToken: "silentRefreshClientAcquireToken",
        /**
         * ssoSilent API (msal-browser).
         * Used to silently acquire an authorization code and set of tokens using a hidden iframe.
         */
        SsoSilent: "ssoSilent",
        /**
         * getDiscoveredAuthority API in StandardInteractionClient class (msal-browser).
         * Used to load authority metadata for a request.
         */
        StandardInteractionClientGetDiscoveredAuthority: "standardInteractionClientGetDiscoveredAuthority",
        /**
         * acquireToken APIs in msal-browser.
         * Used to make an /authorize endpoint call with native brokering enabled.
         */
        FetchAccountIdWithNativeBroker: "fetchAccountIdWithNativeBroker",
        /**
         * acquireToken API in NativeInteractionClient class (msal-browser).
         * Used to acquire a token from Native component when native brokering is enabled.
         */
        NativeInteractionClientAcquireToken: "nativeInteractionClientAcquireToken",
        /**
         * Time spent creating default headers for requests to token endpoint
         */
        BaseClientCreateTokenRequestHeaders: "baseClientCreateTokenRequestHeaders",
        /**
         * Time spent sending/waiting for the response of a request to the token endpoint
         */
        NetworkClientSendPostRequestAsync: "networkClientSendPostRequestAsync",
        RefreshTokenClientExecutePostToTokenEndpoint: "refreshTokenClientExecutePostToTokenEndpoint",
        AuthorizationCodeClientExecutePostToTokenEndpoint: "authorizationCodeClientExecutePostToTokenEndpoint",
        /**
         * Used to measure the time taken for completing embedded-broker handshake (PW-Broker).
         */
        BrokerHandhshake: "brokerHandshake",
        /**
         * acquireTokenByRefreshToken API in BrokerClientApplication (PW-Broker) .
         */
        AcquireTokenByRefreshTokenInBroker: "acquireTokenByRefreshTokenInBroker",
        /**
         * Time taken for token acquisition by broker
         */
        AcquireTokenByBroker: "acquireTokenByBroker",
        /**
         * Time spent on the network for refresh token acquisition
         */
        RefreshTokenClientExecuteTokenRequest: "refreshTokenClientExecuteTokenRequest",
        /**
         * Time taken for acquiring refresh token , records RT size
         */
        RefreshTokenClientAcquireToken: "refreshTokenClientAcquireToken",
        /**
         * Time taken for acquiring cached refresh token
         */
        RefreshTokenClientAcquireTokenWithCachedRefreshToken: "refreshTokenClientAcquireTokenWithCachedRefreshToken",
        /**
         * acquireTokenByRefreshToken API in RefreshTokenClient (msal-common).
         */
        RefreshTokenClientAcquireTokenByRefreshToken: "refreshTokenClientAcquireTokenByRefreshToken",
        /**
         * Helper function to create token request body in RefreshTokenClient (msal-common).
         */
        RefreshTokenClientCreateTokenRequestBody: "refreshTokenClientCreateTokenRequestBody",
        /**
         * acquireTokenFromCache (msal-browser).
         * Internal API for acquiring token from cache
         */
        AcquireTokenFromCache: "acquireTokenFromCache",
        SilentFlowClientAcquireCachedToken: "silentFlowClientAcquireCachedToken",
        SilentFlowClientGenerateResultFromCacheRecord: "silentFlowClientGenerateResultFromCacheRecord",
        /**
         * acquireTokenBySilentIframe (msal-browser).
         * Internal API for acquiring token by silent Iframe
         */
        AcquireTokenBySilentIframe: "acquireTokenBySilentIframe",
        /**
         * Internal API for initializing base request in BaseInteractionClient (msal-browser)
         */
        InitializeBaseRequest: "initializeBaseRequest",
        /**
         * Internal API for initializing silent request in SilentCacheClient (msal-browser)
         */
        InitializeSilentRequest: "initializeSilentRequest",
        InitializeClientApplication: "initializeClientApplication",
        InitializeCache: "initializeCache",
        /**
         * Helper function in SilentIframeClient class (msal-browser).
         */
        SilentIframeClientTokenHelper: "silentIframeClientTokenHelper",
        /**
         * SilentHandler
         */
        SilentHandlerInitiateAuthRequest: "silentHandlerInitiateAuthRequest",
        SilentHandlerMonitorIframeForHash: "silentHandlerMonitorIframeForHash",
        SilentHandlerLoadFrame: "silentHandlerLoadFrame",
        SilentHandlerLoadFrameSync: "silentHandlerLoadFrameSync",
        /**
         * Helper functions in StandardInteractionClient class (msal-browser)
         */
        StandardInteractionClientCreateAuthCodeClient: "standardInteractionClientCreateAuthCodeClient",
        StandardInteractionClientGetClientConfiguration: "standardInteractionClientGetClientConfiguration",
        StandardInteractionClientInitializeAuthorizationRequest: "standardInteractionClientInitializeAuthorizationRequest",
        /**
         * getAuthCodeUrl API (msal-browser and msal-node).
         */
        GetAuthCodeUrl: "getAuthCodeUrl",
        GetStandardParams: "getStandardParams",
        /**
         * Functions from InteractionHandler (msal-browser)
         */
        HandleCodeResponseFromServer: "handleCodeResponseFromServer",
        HandleCodeResponse: "handleCodeResponse",
        HandleResponseEar: "handleResponseEar",
        HandleResponsePlatformBroker: "handleResponsePlatformBroker",
        HandleResponseCode: "handleResponseCode",
        UpdateTokenEndpointAuthority: "updateTokenEndpointAuthority",
        /**
         * APIs in Authorization Code Client (msal-common)
         */
        AuthClientAcquireToken: "authClientAcquireToken",
        AuthClientExecuteTokenRequest: "authClientExecuteTokenRequest",
        AuthClientCreateTokenRequestBody: "authClientCreateTokenRequestBody",
        /**
         * Generate functions in PopTokenGenerator (msal-common)
         */
        PopTokenGenerateCnf: "popTokenGenerateCnf",
        PopTokenGenerateKid: "popTokenGenerateKid",
        /**
         * handleServerTokenResponse API in ResponseHandler (msal-common)
         */
        HandleServerTokenResponse: "handleServerTokenResponse",
        DeserializeResponse: "deserializeResponse",
        /**
         * Authority functions
         */
        AuthorityFactoryCreateDiscoveredInstance: "authorityFactoryCreateDiscoveredInstance",
        AuthorityResolveEndpointsAsync: "authorityResolveEndpointsAsync",
        AuthorityResolveEndpointsFromLocalSources: "authorityResolveEndpointsFromLocalSources",
        AuthorityGetCloudDiscoveryMetadataFromNetwork: "authorityGetCloudDiscoveryMetadataFromNetwork",
        AuthorityUpdateCloudDiscoveryMetadata: "authorityUpdateCloudDiscoveryMetadata",
        AuthorityGetEndpointMetadataFromNetwork: "authorityGetEndpointMetadataFromNetwork",
        AuthorityUpdateEndpointMetadata: "authorityUpdateEndpointMetadata",
        AuthorityUpdateMetadataWithRegionalInformation: "authorityUpdateMetadataWithRegionalInformation",
        /**
         * Region Discovery functions
         */
        RegionDiscoveryDetectRegion: "regionDiscoveryDetectRegion",
        RegionDiscoveryGetRegionFromIMDS: "regionDiscoveryGetRegionFromIMDS",
        RegionDiscoveryGetCurrentVersion: "regionDiscoveryGetCurrentVersion",
        AcquireTokenByCodeAsync: "acquireTokenByCodeAsync",
        GetEndpointMetadataFromNetwork: "getEndpointMetadataFromNetwork",
        GetCloudDiscoveryMetadataFromNetworkMeasurement: "getCloudDiscoveryMetadataFromNetworkMeasurement",
        HandleRedirectPromiseMeasurement: "handleRedirectPromise",
        HandleNativeRedirectPromiseMeasurement: "handleNativeRedirectPromise",
        UpdateCloudDiscoveryMetadataMeasurement: "updateCloudDiscoveryMetadataMeasurement",
        UsernamePasswordClientAcquireToken: "usernamePasswordClientAcquireToken",
        NativeMessageHandlerHandshake: "nativeMessageHandlerHandshake",
        NativeGenerateAuthResult: "nativeGenerateAuthResult",
        RemoveHiddenIframe: "removeHiddenIframe",
        /**
         * Cache operations
         */
        ClearTokensAndKeysWithClaims: "clearTokensAndKeysWithClaims",
        CacheManagerGetRefreshToken: "cacheManagerGetRefreshToken",
        ImportExistingCache: "importExistingCache",
        SetUserData: "setUserData",
        LocalStorageUpdated: "localStorageUpdated",
        /**
         * Crypto Operations
         */
        GeneratePkceCodes: "generatePkceCodes",
        GenerateCodeVerifier: "generateCodeVerifier",
        GenerateCodeChallengeFromVerifier: "generateCodeChallengeFromVerifier",
        Sha256Digest: "sha256Digest",
        GetRandomValues: "getRandomValues",
        GenerateHKDF: "generateHKDF",
        GenerateBaseKey: "generateBaseKey",
        Base64Decode: "base64Decode",
        UrlEncodeArr: "urlEncodeArr",
        Encrypt: "encrypt",
        Decrypt: "decrypt",
        GenerateEarKey: "generateEarKey",
        DecryptEarResponse: "decryptEarResponse"
      };
      var PerformanceEventAbbreviations = /* @__PURE__ */ new Map([
        [PerformanceEvents.AcquireTokenByCode, "ATByCode"],
        [PerformanceEvents.AcquireTokenByRefreshToken, "ATByRT"],
        [PerformanceEvents.AcquireTokenSilent, "ATS"],
        [PerformanceEvents.AcquireTokenSilentAsync, "ATSAsync"],
        [PerformanceEvents.AcquireTokenPopup, "ATPopup"],
        [PerformanceEvents.AcquireTokenRedirect, "ATRedirect"],
        [
          PerformanceEvents.CryptoOptsGetPublicKeyThumbprint,
          "CryptoGetPKThumb"
        ],
        [PerformanceEvents.CryptoOptsSignJwt, "CryptoSignJwt"],
        [PerformanceEvents.SilentCacheClientAcquireToken, "SltCacheClientAT"],
        [PerformanceEvents.SilentIframeClientAcquireToken, "SltIframeClientAT"],
        [PerformanceEvents.SilentRefreshClientAcquireToken, "SltRClientAT"],
        [PerformanceEvents.SsoSilent, "SsoSlt"],
        [
          PerformanceEvents.StandardInteractionClientGetDiscoveredAuthority,
          "StdIntClientGetDiscAuth"
        ],
        [
          PerformanceEvents.FetchAccountIdWithNativeBroker,
          "FetchAccIdWithNtvBroker"
        ],
        [
          PerformanceEvents.NativeInteractionClientAcquireToken,
          "NtvIntClientAT"
        ],
        [
          PerformanceEvents.BaseClientCreateTokenRequestHeaders,
          "BaseClientCreateTReqHead"
        ],
        [
          PerformanceEvents.NetworkClientSendPostRequestAsync,
          "NetClientSendPost"
        ],
        [
          PerformanceEvents.RefreshTokenClientExecutePostToTokenEndpoint,
          "RTClientExecPost"
        ],
        [
          PerformanceEvents.AuthorizationCodeClientExecutePostToTokenEndpoint,
          "AuthCodeClientExecPost"
        ],
        [PerformanceEvents.BrokerHandhshake, "BrokerHandshake"],
        [
          PerformanceEvents.AcquireTokenByRefreshTokenInBroker,
          "ATByRTInBroker"
        ],
        [PerformanceEvents.AcquireTokenByBroker, "ATByBroker"],
        [
          PerformanceEvents.RefreshTokenClientExecuteTokenRequest,
          "RTClientExecTReq"
        ],
        [PerformanceEvents.RefreshTokenClientAcquireToken, "RTClientAT"],
        [
          PerformanceEvents.RefreshTokenClientAcquireTokenWithCachedRefreshToken,
          "RTClientATWithCachedRT"
        ],
        [
          PerformanceEvents.RefreshTokenClientAcquireTokenByRefreshToken,
          "RTClientATByRT"
        ],
        [
          PerformanceEvents.RefreshTokenClientCreateTokenRequestBody,
          "RTClientCreateTReqBody"
        ],
        [PerformanceEvents.AcquireTokenFromCache, "ATFromCache"],
        [
          PerformanceEvents.SilentFlowClientAcquireCachedToken,
          "SltFlowClientATCached"
        ],
        [
          PerformanceEvents.SilentFlowClientGenerateResultFromCacheRecord,
          "SltFlowClientGenResFromCache"
        ],
        [PerformanceEvents.AcquireTokenBySilentIframe, "ATBySltIframe"],
        [PerformanceEvents.InitializeBaseRequest, "InitBaseReq"],
        [PerformanceEvents.InitializeSilentRequest, "InitSltReq"],
        [
          PerformanceEvents.InitializeClientApplication,
          "InitClientApplication"
        ],
        [PerformanceEvents.InitializeCache, "InitCache"],
        [PerformanceEvents.ImportExistingCache, "importCache"],
        [PerformanceEvents.SetUserData, "setUserData"],
        [PerformanceEvents.LocalStorageUpdated, "localStorageUpdated"],
        [PerformanceEvents.SilentIframeClientTokenHelper, "SIClientTHelper"],
        [
          PerformanceEvents.SilentHandlerInitiateAuthRequest,
          "SHandlerInitAuthReq"
        ],
        [
          PerformanceEvents.SilentHandlerMonitorIframeForHash,
          "SltHandlerMonitorIframeForHash"
        ],
        [PerformanceEvents.SilentHandlerLoadFrame, "SHandlerLoadFrame"],
        [PerformanceEvents.SilentHandlerLoadFrameSync, "SHandlerLoadFrameSync"],
        [
          PerformanceEvents.StandardInteractionClientCreateAuthCodeClient,
          "StdIntClientCreateAuthCodeClient"
        ],
        [
          PerformanceEvents.StandardInteractionClientGetClientConfiguration,
          "StdIntClientGetClientConf"
        ],
        [
          PerformanceEvents.StandardInteractionClientInitializeAuthorizationRequest,
          "StdIntClientInitAuthReq"
        ],
        [PerformanceEvents.GetAuthCodeUrl, "GetAuthCodeUrl"],
        [
          PerformanceEvents.HandleCodeResponseFromServer,
          "HandleCodeResFromServer"
        ],
        [PerformanceEvents.HandleCodeResponse, "HandleCodeResp"],
        [PerformanceEvents.HandleResponseEar, "HandleRespEar"],
        [PerformanceEvents.HandleResponseCode, "HandleRespCode"],
        [
          PerformanceEvents.HandleResponsePlatformBroker,
          "HandleRespPlatBroker"
        ],
        [PerformanceEvents.UpdateTokenEndpointAuthority, "UpdTEndpointAuth"],
        [PerformanceEvents.AuthClientAcquireToken, "AuthClientAT"],
        [PerformanceEvents.AuthClientExecuteTokenRequest, "AuthClientExecTReq"],
        [
          PerformanceEvents.AuthClientCreateTokenRequestBody,
          "AuthClientCreateTReqBody"
        ],
        [PerformanceEvents.PopTokenGenerateCnf, "PopTGenCnf"],
        [PerformanceEvents.PopTokenGenerateKid, "PopTGenKid"],
        [PerformanceEvents.HandleServerTokenResponse, "HandleServerTRes"],
        [PerformanceEvents.DeserializeResponse, "DeserializeRes"],
        [
          PerformanceEvents.AuthorityFactoryCreateDiscoveredInstance,
          "AuthFactCreateDiscInst"
        ],
        [
          PerformanceEvents.AuthorityResolveEndpointsAsync,
          "AuthResolveEndpointsAsync"
        ],
        [
          PerformanceEvents.AuthorityResolveEndpointsFromLocalSources,
          "AuthResolveEndpointsFromLocal"
        ],
        [
          PerformanceEvents.AuthorityGetCloudDiscoveryMetadataFromNetwork,
          "AuthGetCDMetaFromNet"
        ],
        [
          PerformanceEvents.AuthorityUpdateCloudDiscoveryMetadata,
          "AuthUpdCDMeta"
        ],
        [
          PerformanceEvents.AuthorityGetEndpointMetadataFromNetwork,
          "AuthUpdCDMetaFromNet"
        ],
        [
          PerformanceEvents.AuthorityUpdateEndpointMetadata,
          "AuthUpdEndpointMeta"
        ],
        [
          PerformanceEvents.AuthorityUpdateMetadataWithRegionalInformation,
          "AuthUpdMetaWithRegInfo"
        ],
        [PerformanceEvents.RegionDiscoveryDetectRegion, "RegDiscDetectReg"],
        [
          PerformanceEvents.RegionDiscoveryGetRegionFromIMDS,
          "RegDiscGetRegFromIMDS"
        ],
        [
          PerformanceEvents.RegionDiscoveryGetCurrentVersion,
          "RegDiscGetCurrentVer"
        ],
        [PerformanceEvents.AcquireTokenByCodeAsync, "ATByCodeAsync"],
        [
          PerformanceEvents.GetEndpointMetadataFromNetwork,
          "GetEndpointMetaFromNet"
        ],
        [
          PerformanceEvents.GetCloudDiscoveryMetadataFromNetworkMeasurement,
          "GetCDMetaFromNet"
        ],
        [
          PerformanceEvents.HandleRedirectPromiseMeasurement,
          "HandleRedirectPromise"
        ],
        [
          PerformanceEvents.HandleNativeRedirectPromiseMeasurement,
          "HandleNtvRedirectPromise"
        ],
        [
          PerformanceEvents.UpdateCloudDiscoveryMetadataMeasurement,
          "UpdateCDMeta"
        ],
        [
          PerformanceEvents.UsernamePasswordClientAcquireToken,
          "UserPassClientAT"
        ],
        [
          PerformanceEvents.NativeMessageHandlerHandshake,
          "NtvMsgHandlerHandshake"
        ],
        [PerformanceEvents.NativeGenerateAuthResult, "NtvGenAuthRes"],
        [PerformanceEvents.RemoveHiddenIframe, "RemoveHiddenIframe"],
        [
          PerformanceEvents.ClearTokensAndKeysWithClaims,
          "ClearTAndKeysWithClaims"
        ],
        [PerformanceEvents.CacheManagerGetRefreshToken, "CacheManagerGetRT"],
        [PerformanceEvents.GeneratePkceCodes, "GenPkceCodes"],
        [PerformanceEvents.GenerateCodeVerifier, "GenCodeVerifier"],
        [
          PerformanceEvents.GenerateCodeChallengeFromVerifier,
          "GenCodeChallengeFromVerifier"
        ],
        [PerformanceEvents.Sha256Digest, "Sha256Digest"],
        [PerformanceEvents.GetRandomValues, "GetRandomValues"],
        [PerformanceEvents.GenerateHKDF, "genHKDF"],
        [PerformanceEvents.GenerateBaseKey, "genBaseKey"],
        [PerformanceEvents.Base64Decode, "b64Decode"],
        [PerformanceEvents.UrlEncodeArr, "urlEncArr"],
        [PerformanceEvents.Encrypt, "encrypt"],
        [PerformanceEvents.Decrypt, "decrypt"],
        [PerformanceEvents.GenerateEarKey, "genEarKey"],
        [PerformanceEvents.DecryptEarResponse, "decryptEarResp"]
      ]);
      var PerformanceEventStatus = {
        InProgress: 1,
        Completed: 2
      };
      var IntFields = /* @__PURE__ */ new Set([
        "accessTokenSize",
        "durationMs",
        "idTokenSize",
        "matsSilentStatus",
        "matsHttpStatus",
        "refreshTokenSize",
        "queuedTimeMs",
        "startTimeMs",
        "status",
        "multiMatchedAT",
        "multiMatchedID",
        "multiMatchedRT",
        "unencryptedCacheCount",
        "encryptedCacheExpiredCount",
        "oldAccountCount",
        "oldAccessCount",
        "oldIdCount",
        "oldRefreshCount",
        "currAccountCount",
        "currAccessCount",
        "currIdCount",
        "currRefreshCount",
        "expiredCacheRemovedCount",
        "upgradedCacheCount"
      ]);
      var StubPerformanceMeasurement = class {
        startMeasurement() {
          return;
        }
        endMeasurement() {
          return;
        }
        flushMeasurement() {
          return null;
        }
      };
      var StubPerformanceClient = class {
        generateId() {
          return "callback-id";
        }
        startMeasurement(measureName, correlationId) {
          return {
            end: () => null,
            discard: () => {
            },
            add: () => {
            },
            increment: () => {
            },
            event: {
              eventId: this.generateId(),
              status: PerformanceEventStatus.InProgress,
              authority: "",
              libraryName: "",
              libraryVersion: "",
              clientId: "",
              name: measureName,
              startTimeMs: Date.now(),
              correlationId: correlationId || ""
            },
            measurement: new StubPerformanceMeasurement()
          };
        }
        startPerformanceMeasurement() {
          return new StubPerformanceMeasurement();
        }
        calculateQueuedTime() {
          return 0;
        }
        addQueueMeasurement() {
          return;
        }
        setPreQueueTime() {
          return;
        }
        endMeasurement() {
          return null;
        }
        discardMeasurements() {
          return;
        }
        removePerformanceCallback() {
          return true;
        }
        addPerformanceCallback() {
          return "";
        }
        emitEvents() {
          return;
        }
        addFields() {
          return;
        }
        incrementFields() {
          return;
        }
        cacheEventByCorrelationId() {
          return;
        }
      };
      var DEFAULT_SYSTEM_OPTIONS = {
        tokenRenewalOffsetSeconds: DEFAULT_TOKEN_RENEWAL_OFFSET_SEC,
        preventCorsPreflight: false
      };
      var DEFAULT_LOGGER_IMPLEMENTATION = {
        loggerCallback: () => {
        },
        piiLoggingEnabled: false,
        logLevel: exports.LogLevel.Info,
        correlationId: Constants.EMPTY_STRING
      };
      var DEFAULT_CACHE_OPTIONS = {
        claimsBasedCachingEnabled: false
      };
      var DEFAULT_NETWORK_IMPLEMENTATION = {
        async sendGetRequestAsync() {
          throw createClientAuthError(methodNotImplemented);
        },
        async sendPostRequestAsync() {
          throw createClientAuthError(methodNotImplemented);
        }
      };
      var DEFAULT_LIBRARY_INFO = {
        sku: Constants.SKU,
        version: version$1,
        cpu: Constants.EMPTY_STRING,
        os: Constants.EMPTY_STRING
      };
      var DEFAULT_CLIENT_CREDENTIALS = {
        clientSecret: Constants.EMPTY_STRING,
        clientAssertion: void 0
      };
      var DEFAULT_AZURE_CLOUD_OPTIONS = {
        azureCloudInstance: AzureCloudInstance.None,
        tenant: `${Constants.DEFAULT_COMMON_TENANT}`
      };
      var DEFAULT_TELEMETRY_OPTIONS = {
        application: {
          appName: "",
          appVersion: ""
        }
      };
      function buildClientConfiguration({ authOptions: userAuthOptions, systemOptions: userSystemOptions, loggerOptions: userLoggerOption, cacheOptions: userCacheOptions, storageInterface: storageImplementation, networkInterface: networkImplementation, cryptoInterface: cryptoImplementation, clientCredentials, libraryInfo, telemetry, serverTelemetryManager, persistencePlugin, serializableCache }) {
        const loggerOptions = {
          ...DEFAULT_LOGGER_IMPLEMENTATION,
          ...userLoggerOption
        };
        return {
          authOptions: buildAuthOptions(userAuthOptions),
          systemOptions: { ...DEFAULT_SYSTEM_OPTIONS, ...userSystemOptions },
          loggerOptions,
          cacheOptions: { ...DEFAULT_CACHE_OPTIONS, ...userCacheOptions },
          storageInterface: storageImplementation || new DefaultStorageClass(userAuthOptions.clientId, DEFAULT_CRYPTO_IMPLEMENTATION, new Logger(loggerOptions), new StubPerformanceClient()),
          networkInterface: networkImplementation || DEFAULT_NETWORK_IMPLEMENTATION,
          cryptoInterface: cryptoImplementation || DEFAULT_CRYPTO_IMPLEMENTATION,
          clientCredentials: clientCredentials || DEFAULT_CLIENT_CREDENTIALS,
          libraryInfo: { ...DEFAULT_LIBRARY_INFO, ...libraryInfo },
          telemetry: { ...DEFAULT_TELEMETRY_OPTIONS, ...telemetry },
          serverTelemetryManager: serverTelemetryManager || null,
          persistencePlugin: persistencePlugin || null,
          serializableCache: serializableCache || null
        };
      }
      function buildAuthOptions(authOptions) {
        return {
          clientCapabilities: [],
          azureCloudOptions: DEFAULT_AZURE_CLOUD_OPTIONS,
          skipAuthorityMetadataCache: false,
          instanceAware: false,
          encodeExtraQueryParams: false,
          ...authOptions
        };
      }
      function isOidcProtocolMode(config2) {
        return config2.authOptions.authority.options.protocolMode === ProtocolMode.OIDC;
      }
      var CcsCredentialType = {
        HOME_ACCOUNT_ID: "home_account_id",
        UPN: "UPN"
      };
      function buildClientInfo(rawClientInfo, base64Decode2) {
        if (!rawClientInfo) {
          throw createClientAuthError(clientInfoEmptyError);
        }
        try {
          const decodedClientInfo = base64Decode2(rawClientInfo);
          return JSON.parse(decodedClientInfo);
        } catch (e) {
          throw createClientAuthError(clientInfoDecodingError);
        }
      }
      function buildClientInfoFromHomeAccountId(homeAccountId) {
        if (!homeAccountId) {
          throw createClientAuthError(clientInfoDecodingError);
        }
        const clientInfoParts = homeAccountId.split(Separators.CLIENT_INFO_SEPARATOR, 2);
        return {
          uid: clientInfoParts[0],
          utid: clientInfoParts.length < 2 ? Constants.EMPTY_STRING : clientInfoParts[1]
        };
      }
      var CLIENT_ID = "client_id";
      var REDIRECT_URI = "redirect_uri";
      var RESPONSE_TYPE = "response_type";
      var RESPONSE_MODE = "response_mode";
      var GRANT_TYPE = "grant_type";
      var CLAIMS = "claims";
      var SCOPE = "scope";
      var REFRESH_TOKEN = "refresh_token";
      var STATE = "state";
      var NONCE = "nonce";
      var PROMPT = "prompt";
      var CODE = "code";
      var CODE_CHALLENGE = "code_challenge";
      var CODE_CHALLENGE_METHOD = "code_challenge_method";
      var CODE_VERIFIER = "code_verifier";
      var CLIENT_REQUEST_ID = "client-request-id";
      var X_CLIENT_SKU = "x-client-SKU";
      var X_CLIENT_VER = "x-client-VER";
      var X_CLIENT_OS = "x-client-OS";
      var X_CLIENT_CPU = "x-client-CPU";
      var X_CLIENT_CURR_TELEM = "x-client-current-telemetry";
      var X_CLIENT_LAST_TELEM = "x-client-last-telemetry";
      var X_MS_LIB_CAPABILITY = "x-ms-lib-capability";
      var X_APP_NAME = "x-app-name";
      var X_APP_VER = "x-app-ver";
      var POST_LOGOUT_URI = "post_logout_redirect_uri";
      var ID_TOKEN_HINT = "id_token_hint";
      var CLIENT_SECRET = "client_secret";
      var CLIENT_ASSERTION = "client_assertion";
      var CLIENT_ASSERTION_TYPE = "client_assertion_type";
      var TOKEN_TYPE = "token_type";
      var REQ_CNF = "req_cnf";
      var RETURN_SPA_CODE = "return_spa_code";
      var NATIVE_BROKER = "nativebroker";
      var LOGOUT_HINT = "logout_hint";
      var SID = "sid";
      var LOGIN_HINT = "login_hint";
      var DOMAIN_HINT = "domain_hint";
      var X_CLIENT_EXTRA_SKU = "x-client-xtra-sku";
      var BROKER_CLIENT_ID = "brk_client_id";
      var BROKER_REDIRECT_URI = "brk_redirect_uri";
      var INSTANCE_AWARE = "instance_aware";
      var EAR_JWK = "ear_jwk";
      var EAR_JWE_CRYPTO = "ear_jwe_crypto";
      function instrumentBrokerParams(parameters, correlationId, performanceClient) {
        if (!correlationId) {
          return;
        }
        const clientId = parameters.get(CLIENT_ID);
        if (clientId && parameters.has(BROKER_CLIENT_ID)) {
          performanceClient?.addFields({
            embeddedClientId: clientId,
            embeddedRedirectUri: parameters.get(REDIRECT_URI)
          }, correlationId);
        }
      }
      function addResponseType(parameters, responseType) {
        parameters.set(RESPONSE_TYPE, responseType);
      }
      function addResponseMode(parameters, responseMode) {
        parameters.set(RESPONSE_MODE, responseMode ? responseMode : ResponseMode.QUERY);
      }
      function addNativeBroker(parameters) {
        parameters.set(NATIVE_BROKER, "1");
      }
      function addScopes(parameters, scopes, addOidcScopes = true, defaultScopes = OIDC_DEFAULT_SCOPES) {
        if (addOidcScopes && !defaultScopes.includes("openid") && !scopes.includes("openid")) {
          defaultScopes.push("openid");
        }
        const requestScopes = addOidcScopes ? [...scopes || [], ...defaultScopes] : scopes || [];
        const scopeSet = new ScopeSet(requestScopes);
        parameters.set(SCOPE, scopeSet.printScopes());
      }
      function addClientId(parameters, clientId) {
        parameters.set(CLIENT_ID, clientId);
      }
      function addRedirectUri(parameters, redirectUri) {
        parameters.set(REDIRECT_URI, redirectUri);
      }
      function addPostLogoutRedirectUri(parameters, redirectUri) {
        parameters.set(POST_LOGOUT_URI, redirectUri);
      }
      function addIdTokenHint(parameters, idTokenHint) {
        parameters.set(ID_TOKEN_HINT, idTokenHint);
      }
      function addDomainHint(parameters, domainHint) {
        parameters.set(DOMAIN_HINT, domainHint);
      }
      function addLoginHint(parameters, loginHint) {
        parameters.set(LOGIN_HINT, loginHint);
      }
      function addCcsUpn(parameters, loginHint) {
        parameters.set(HeaderNames.CCS_HEADER, `UPN:${loginHint}`);
      }
      function addCcsOid(parameters, clientInfo) {
        parameters.set(HeaderNames.CCS_HEADER, `Oid:${clientInfo.uid}@${clientInfo.utid}`);
      }
      function addSid(parameters, sid) {
        parameters.set(SID, sid);
      }
      function addClaims(parameters, claims, clientCapabilities) {
        const mergedClaims = addClientCapabilitiesToClaims$1(claims, clientCapabilities);
        try {
          JSON.parse(mergedClaims);
        } catch (e) {
          throw createClientConfigurationError(invalidClaims);
        }
        parameters.set(CLAIMS, mergedClaims);
      }
      function addCorrelationId(parameters, correlationId) {
        parameters.set(CLIENT_REQUEST_ID, correlationId);
      }
      function addLibraryInfo(parameters, libraryInfo) {
        parameters.set(X_CLIENT_SKU, libraryInfo.sku);
        parameters.set(X_CLIENT_VER, libraryInfo.version);
        if (libraryInfo.os) {
          parameters.set(X_CLIENT_OS, libraryInfo.os);
        }
        if (libraryInfo.cpu) {
          parameters.set(X_CLIENT_CPU, libraryInfo.cpu);
        }
      }
      function addApplicationTelemetry(parameters, appTelemetry) {
        if (appTelemetry?.appName) {
          parameters.set(X_APP_NAME, appTelemetry.appName);
        }
        if (appTelemetry?.appVersion) {
          parameters.set(X_APP_VER, appTelemetry.appVersion);
        }
      }
      function addPrompt(parameters, prompt) {
        parameters.set(PROMPT, prompt);
      }
      function addState(parameters, state2) {
        if (state2) {
          parameters.set(STATE, state2);
        }
      }
      function addNonce(parameters, nonce) {
        parameters.set(NONCE, nonce);
      }
      function addCodeChallengeParams(parameters, codeChallenge, codeChallengeMethod) {
        if (codeChallenge && codeChallengeMethod) {
          parameters.set(CODE_CHALLENGE, codeChallenge);
          parameters.set(CODE_CHALLENGE_METHOD, codeChallengeMethod);
        } else {
          throw createClientConfigurationError(pkceParamsMissing);
        }
      }
      function addAuthorizationCode(parameters, code) {
        parameters.set(CODE, code);
      }
      function addRefreshToken(parameters, refreshToken) {
        parameters.set(REFRESH_TOKEN, refreshToken);
      }
      function addCodeVerifier(parameters, codeVerifier) {
        parameters.set(CODE_VERIFIER, codeVerifier);
      }
      function addClientSecret(parameters, clientSecret) {
        parameters.set(CLIENT_SECRET, clientSecret);
      }
      function addClientAssertion(parameters, clientAssertion) {
        if (clientAssertion) {
          parameters.set(CLIENT_ASSERTION, clientAssertion);
        }
      }
      function addClientAssertionType(parameters, clientAssertionType) {
        if (clientAssertionType) {
          parameters.set(CLIENT_ASSERTION_TYPE, clientAssertionType);
        }
      }
      function addGrantType(parameters, grantType) {
        parameters.set(GRANT_TYPE, grantType);
      }
      function addClientInfo(parameters) {
        parameters.set(CLIENT_INFO, "1");
      }
      function addInstanceAware(parameters) {
        if (!parameters.has(INSTANCE_AWARE)) {
          parameters.set(INSTANCE_AWARE, "true");
        }
      }
      function addExtraQueryParameters(parameters, eQParams) {
        Object.entries(eQParams).forEach(([key, value]) => {
          if (!parameters.has(key) && value) {
            parameters.set(key, value);
          }
        });
      }
      function addClientCapabilitiesToClaims$1(claims, clientCapabilities) {
        let mergedClaims;
        if (!claims) {
          mergedClaims = {};
        } else {
          try {
            mergedClaims = JSON.parse(claims);
          } catch (e) {
            throw createClientConfigurationError(invalidClaims);
          }
        }
        if (clientCapabilities && clientCapabilities.length > 0) {
          if (!mergedClaims.hasOwnProperty(ClaimsRequestKeys.ACCESS_TOKEN)) {
            mergedClaims[ClaimsRequestKeys.ACCESS_TOKEN] = {};
          }
          mergedClaims[ClaimsRequestKeys.ACCESS_TOKEN][ClaimsRequestKeys.XMS_CC] = {
            values: clientCapabilities
          };
        }
        return JSON.stringify(mergedClaims);
      }
      function addPopToken(parameters, cnfString) {
        if (cnfString) {
          parameters.set(TOKEN_TYPE, AuthenticationScheme.POP);
          parameters.set(REQ_CNF, cnfString);
        }
      }
      function addSshJwk(parameters, sshJwkString) {
        if (sshJwkString) {
          parameters.set(TOKEN_TYPE, AuthenticationScheme.SSH);
          parameters.set(REQ_CNF, sshJwkString);
        }
      }
      function addServerTelemetry(parameters, serverTelemetryManager) {
        parameters.set(X_CLIENT_CURR_TELEM, serverTelemetryManager.generateCurrentRequestHeaderValue());
        parameters.set(X_CLIENT_LAST_TELEM, serverTelemetryManager.generateLastRequestHeaderValue());
      }
      function addThrottling(parameters) {
        parameters.set(X_MS_LIB_CAPABILITY, ThrottlingConstants.X_MS_LIB_CAPABILITY_VALUE);
      }
      function addLogoutHint(parameters, logoutHint) {
        parameters.set(LOGOUT_HINT, logoutHint);
      }
      function addBrokerParameters(parameters, brokerClientId, brokerRedirectUri) {
        if (!parameters.has(BROKER_CLIENT_ID)) {
          parameters.set(BROKER_CLIENT_ID, brokerClientId);
        }
        if (!parameters.has(BROKER_REDIRECT_URI)) {
          parameters.set(BROKER_REDIRECT_URI, brokerRedirectUri);
        }
      }
      function addEARParameters(parameters, jwk) {
        parameters.set(EAR_JWK, encodeURIComponent(jwk));
        const jweCryptoB64Encoded = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0";
        parameters.set(EAR_JWE_CRYPTO, jweCryptoB64Encoded);
      }
      function addPostBodyParameters(parameters, bodyParameters) {
        Object.entries(bodyParameters).forEach(([key, value]) => {
          if (value) {
            parameters.set(key, value);
          }
        });
      }
      var AuthorityType = {
        Default: 0,
        Adfs: 1,
        Dsts: 2,
        Ciam: 3
      };
      function isOpenIdConfigResponse(response) {
        return response.hasOwnProperty("authorization_endpoint") && response.hasOwnProperty("token_endpoint") && response.hasOwnProperty("issuer") && response.hasOwnProperty("jwks_uri");
      }
      function isCloudInstanceDiscoveryResponse(response) {
        return response.hasOwnProperty("tenant_discovery_endpoint") && response.hasOwnProperty("metadata");
      }
      function isCloudInstanceDiscoveryErrorResponse(response) {
        return response.hasOwnProperty("error") && response.hasOwnProperty("error_description");
      }
      var invoke = (callback, eventName, logger, telemetryClient, correlationId) => {
        return (...args) => {
          logger.trace(`Executing function ${eventName}`);
          const inProgressEvent = telemetryClient?.startMeasurement(eventName, correlationId);
          if (correlationId) {
            const eventCount = eventName + "CallCount";
            telemetryClient?.incrementFields({ [eventCount]: 1 }, correlationId);
          }
          try {
            const result = callback(...args);
            inProgressEvent?.end({
              success: true
            });
            logger.trace(`Returning result from ${eventName}`);
            return result;
          } catch (e) {
            logger.trace(`Error occurred in ${eventName}`);
            try {
              logger.trace(JSON.stringify(e));
            } catch (e2) {
              logger.trace("Unable to print error message.");
            }
            inProgressEvent?.end({
              success: false
            }, e);
            throw e;
          }
        };
      };
      var invokeAsync = (callback, eventName, logger, telemetryClient, correlationId) => {
        return (...args) => {
          logger.trace(`Executing function ${eventName}`);
          const inProgressEvent = telemetryClient?.startMeasurement(eventName, correlationId);
          if (correlationId) {
            const eventCount = eventName + "CallCount";
            telemetryClient?.incrementFields({ [eventCount]: 1 }, correlationId);
          }
          telemetryClient?.setPreQueueTime(eventName, correlationId);
          return callback(...args).then((response) => {
            logger.trace(`Returning result from ${eventName}`);
            inProgressEvent?.end({
              success: true
            });
            return response;
          }).catch((e) => {
            logger.trace(`Error occurred in ${eventName}`);
            try {
              logger.trace(JSON.stringify(e));
            } catch (e2) {
              logger.trace("Unable to print error message.");
            }
            inProgressEvent?.end({
              success: false
            }, e);
            throw e;
          });
        };
      };
      var RegionDiscovery = class _RegionDiscovery {
        constructor(networkInterface, logger, performanceClient, correlationId) {
          this.networkInterface = networkInterface;
          this.logger = logger;
          this.performanceClient = performanceClient;
          this.correlationId = correlationId;
        }
        /**
         * Detect the region from the application's environment.
         *
         * @returns Promise<string | null>
         */
        async detectRegion(environmentRegion, regionDiscoveryMetadata) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.RegionDiscoveryDetectRegion, this.correlationId);
          let autodetectedRegionName = environmentRegion;
          if (!autodetectedRegionName) {
            const options = _RegionDiscovery.IMDS_OPTIONS;
            try {
              const localIMDSVersionResponse = await invokeAsync(this.getRegionFromIMDS.bind(this), PerformanceEvents.RegionDiscoveryGetRegionFromIMDS, this.logger, this.performanceClient, this.correlationId)(Constants.IMDS_VERSION, options);
              if (localIMDSVersionResponse.status === HttpStatus.SUCCESS) {
                autodetectedRegionName = localIMDSVersionResponse.body;
                regionDiscoveryMetadata.region_source = RegionDiscoverySources.IMDS;
              }
              if (localIMDSVersionResponse.status === HttpStatus.BAD_REQUEST) {
                const currentIMDSVersion = await invokeAsync(this.getCurrentVersion.bind(this), PerformanceEvents.RegionDiscoveryGetCurrentVersion, this.logger, this.performanceClient, this.correlationId)(options);
                if (!currentIMDSVersion) {
                  regionDiscoveryMetadata.region_source = RegionDiscoverySources.FAILED_AUTO_DETECTION;
                  return null;
                }
                const currentIMDSVersionResponse = await invokeAsync(this.getRegionFromIMDS.bind(this), PerformanceEvents.RegionDiscoveryGetRegionFromIMDS, this.logger, this.performanceClient, this.correlationId)(currentIMDSVersion, options);
                if (currentIMDSVersionResponse.status === HttpStatus.SUCCESS) {
                  autodetectedRegionName = currentIMDSVersionResponse.body;
                  regionDiscoveryMetadata.region_source = RegionDiscoverySources.IMDS;
                }
              }
            } catch (e) {
              regionDiscoveryMetadata.region_source = RegionDiscoverySources.FAILED_AUTO_DETECTION;
              return null;
            }
          } else {
            regionDiscoveryMetadata.region_source = RegionDiscoverySources.ENVIRONMENT_VARIABLE;
          }
          if (!autodetectedRegionName) {
            regionDiscoveryMetadata.region_source = RegionDiscoverySources.FAILED_AUTO_DETECTION;
          }
          return autodetectedRegionName || null;
        }
        /**
         * Make the call to the IMDS endpoint
         *
         * @param imdsEndpointUrl
         * @returns Promise<NetworkResponse<string>>
         */
        async getRegionFromIMDS(version2, options) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.RegionDiscoveryGetRegionFromIMDS, this.correlationId);
          return this.networkInterface.sendGetRequestAsync(`${Constants.IMDS_ENDPOINT}?api-version=${version2}&format=text`, options, Constants.IMDS_TIMEOUT);
        }
        /**
         * Get the most recent version of the IMDS endpoint available
         *
         * @returns Promise<string | null>
         */
        async getCurrentVersion(options) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.RegionDiscoveryGetCurrentVersion, this.correlationId);
          try {
            const response = await this.networkInterface.sendGetRequestAsync(`${Constants.IMDS_ENDPOINT}?format=json`, options);
            if (response.status === HttpStatus.BAD_REQUEST && response.body && response.body["newest-versions"] && response.body["newest-versions"].length > 0) {
              return response.body["newest-versions"][0];
            }
            return null;
          } catch (e) {
            return null;
          }
        }
      };
      RegionDiscovery.IMDS_OPTIONS = {
        headers: {
          Metadata: "true"
        }
      };
      function nowSeconds() {
        return Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
      }
      function toSecondsFromDate(date) {
        return date.getTime() / 1e3;
      }
      function toDateFromSeconds(seconds) {
        if (seconds) {
          return new Date(Number(seconds) * 1e3);
        }
        return /* @__PURE__ */ new Date();
      }
      function isTokenExpired(expiresOn, offset) {
        const expirationSec = Number(expiresOn) || 0;
        const offsetCurrentTimeSec = nowSeconds() + offset;
        return offsetCurrentTimeSec > expirationSec;
      }
      function isCacheExpired(lastUpdatedAt, cacheRetentionDays) {
        const cacheExpirationTimestamp = Number(lastUpdatedAt) + cacheRetentionDays * 24 * 60 * 60 * 1e3;
        return Date.now() > cacheExpirationTimestamp;
      }
      function wasClockTurnedBack(cachedAt) {
        const cachedAtSec = Number(cachedAt);
        return cachedAtSec > nowSeconds();
      }
      function createIdTokenEntity(homeAccountId, environment, idToken, clientId, tenantId) {
        const idTokenEntity = {
          credentialType: CredentialType.ID_TOKEN,
          homeAccountId,
          environment,
          clientId,
          secret: idToken,
          realm: tenantId,
          lastUpdatedAt: Date.now().toString()
          // Set the last updated time to now
        };
        return idTokenEntity;
      }
      function createAccessTokenEntity(homeAccountId, environment, accessToken, clientId, tenantId, scopes, expiresOn, extExpiresOn, base64Decode2, refreshOn, tokenType, userAssertionHash, keyId, requestedClaims, requestedClaimsHash) {
        const atEntity = {
          homeAccountId,
          credentialType: CredentialType.ACCESS_TOKEN,
          secret: accessToken,
          cachedAt: nowSeconds().toString(),
          expiresOn: expiresOn.toString(),
          extendedExpiresOn: extExpiresOn.toString(),
          environment,
          clientId,
          realm: tenantId,
          target: scopes,
          tokenType: tokenType || AuthenticationScheme.BEARER,
          lastUpdatedAt: Date.now().toString()
          // Set the last updated time to now
        };
        if (userAssertionHash) {
          atEntity.userAssertionHash = userAssertionHash;
        }
        if (refreshOn) {
          atEntity.refreshOn = refreshOn.toString();
        }
        if (requestedClaims) {
          atEntity.requestedClaims = requestedClaims;
          atEntity.requestedClaimsHash = requestedClaimsHash;
        }
        if (atEntity.tokenType?.toLowerCase() !== AuthenticationScheme.BEARER.toLowerCase()) {
          atEntity.credentialType = CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME;
          switch (atEntity.tokenType) {
            case AuthenticationScheme.POP:
              const tokenClaims = extractTokenClaims(accessToken, base64Decode2);
              if (!tokenClaims?.cnf?.kid) {
                throw createClientAuthError(tokenClaimsCnfRequiredForSignedJwt);
              }
              atEntity.keyId = tokenClaims.cnf.kid;
              break;
            case AuthenticationScheme.SSH:
              atEntity.keyId = keyId;
          }
        }
        return atEntity;
      }
      function createRefreshTokenEntity(homeAccountId, environment, refreshToken, clientId, familyId, userAssertionHash, expiresOn) {
        const rtEntity = {
          credentialType: CredentialType.REFRESH_TOKEN,
          homeAccountId,
          environment,
          clientId,
          secret: refreshToken,
          lastUpdatedAt: Date.now().toString()
        };
        if (userAssertionHash) {
          rtEntity.userAssertionHash = userAssertionHash;
        }
        if (familyId) {
          rtEntity.familyId = familyId;
        }
        if (expiresOn) {
          rtEntity.expiresOn = expiresOn.toString();
        }
        return rtEntity;
      }
      function isCredentialEntity(entity) {
        return entity.hasOwnProperty("homeAccountId") && entity.hasOwnProperty("environment") && entity.hasOwnProperty("credentialType") && entity.hasOwnProperty("clientId") && entity.hasOwnProperty("secret");
      }
      function isAccessTokenEntity(entity) {
        if (!entity) {
          return false;
        }
        return isCredentialEntity(entity) && entity.hasOwnProperty("realm") && entity.hasOwnProperty("target") && (entity["credentialType"] === CredentialType.ACCESS_TOKEN || entity["credentialType"] === CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME);
      }
      function isIdTokenEntity(entity) {
        if (!entity) {
          return false;
        }
        return isCredentialEntity(entity) && entity.hasOwnProperty("realm") && entity["credentialType"] === CredentialType.ID_TOKEN;
      }
      function isRefreshTokenEntity(entity) {
        if (!entity) {
          return false;
        }
        return isCredentialEntity(entity) && entity["credentialType"] === CredentialType.REFRESH_TOKEN;
      }
      function isServerTelemetryEntity(key, entity) {
        const validateKey = key.indexOf(SERVER_TELEM_CONSTANTS.CACHE_KEY) === 0;
        let validateEntity = true;
        if (entity) {
          validateEntity = entity.hasOwnProperty("failedRequests") && entity.hasOwnProperty("errors") && entity.hasOwnProperty("cacheHits");
        }
        return validateKey && validateEntity;
      }
      function isThrottlingEntity(key, entity) {
        let validateKey = false;
        if (key) {
          validateKey = key.indexOf(ThrottlingConstants.THROTTLING_PREFIX) === 0;
        }
        let validateEntity = true;
        if (entity) {
          validateEntity = entity.hasOwnProperty("throttleTime");
        }
        return validateKey && validateEntity;
      }
      function generateAppMetadataKey({ environment, clientId }) {
        const appMetaDataKeyArray = [
          APP_METADATA,
          environment,
          clientId
        ];
        return appMetaDataKeyArray.join(Separators.CACHE_KEY_SEPARATOR).toLowerCase();
      }
      function isAppMetadataEntity(key, entity) {
        if (!entity) {
          return false;
        }
        return key.indexOf(APP_METADATA) === 0 && entity.hasOwnProperty("clientId") && entity.hasOwnProperty("environment");
      }
      function isAuthorityMetadataEntity(key, entity) {
        if (!entity) {
          return false;
        }
        return key.indexOf(AUTHORITY_METADATA_CONSTANTS.CACHE_KEY) === 0 && entity.hasOwnProperty("aliases") && entity.hasOwnProperty("preferred_cache") && entity.hasOwnProperty("preferred_network") && entity.hasOwnProperty("canonical_authority") && entity.hasOwnProperty("authorization_endpoint") && entity.hasOwnProperty("token_endpoint") && entity.hasOwnProperty("issuer") && entity.hasOwnProperty("aliasesFromNetwork") && entity.hasOwnProperty("endpointsFromNetwork") && entity.hasOwnProperty("expiresAt") && entity.hasOwnProperty("jwks_uri");
      }
      function generateAuthorityMetadataExpiresAt() {
        return nowSeconds() + AUTHORITY_METADATA_CONSTANTS.REFRESH_TIME_SECONDS;
      }
      function updateAuthorityEndpointMetadata(authorityMetadata, updatedValues, fromNetwork) {
        authorityMetadata.authorization_endpoint = updatedValues.authorization_endpoint;
        authorityMetadata.token_endpoint = updatedValues.token_endpoint;
        authorityMetadata.end_session_endpoint = updatedValues.end_session_endpoint;
        authorityMetadata.issuer = updatedValues.issuer;
        authorityMetadata.endpointsFromNetwork = fromNetwork;
        authorityMetadata.jwks_uri = updatedValues.jwks_uri;
      }
      function updateCloudDiscoveryMetadata(authorityMetadata, updatedValues, fromNetwork) {
        authorityMetadata.aliases = updatedValues.aliases;
        authorityMetadata.preferred_cache = updatedValues.preferred_cache;
        authorityMetadata.preferred_network = updatedValues.preferred_network;
        authorityMetadata.aliasesFromNetwork = fromNetwork;
      }
      function isAuthorityMetadataExpired(metadata) {
        return metadata.expiresAt <= nowSeconds();
      }
      var Authority = class _Authority {
        constructor(authority, networkInterface, cacheManager, authorityOptions, logger, correlationId, performanceClient, managedIdentity) {
          this.canonicalAuthority = authority;
          this._canonicalAuthority.validateAsUri();
          this.networkInterface = networkInterface;
          this.cacheManager = cacheManager;
          this.authorityOptions = authorityOptions;
          this.regionDiscoveryMetadata = {
            region_used: void 0,
            region_source: void 0,
            region_outcome: void 0
          };
          this.logger = logger;
          this.performanceClient = performanceClient;
          this.correlationId = correlationId;
          this.managedIdentity = managedIdentity || false;
          this.regionDiscovery = new RegionDiscovery(networkInterface, this.logger, this.performanceClient, this.correlationId);
        }
        /**
         * Get {@link AuthorityType}
         * @param authorityUri {@link IUri}
         * @private
         */
        getAuthorityType(authorityUri) {
          if (authorityUri.HostNameAndPort.endsWith(Constants.CIAM_AUTH_URL)) {
            return AuthorityType.Ciam;
          }
          const pathSegments = authorityUri.PathSegments;
          if (pathSegments.length) {
            switch (pathSegments[0].toLowerCase()) {
              case Constants.ADFS:
                return AuthorityType.Adfs;
              case Constants.DSTS:
                return AuthorityType.Dsts;
            }
          }
          return AuthorityType.Default;
        }
        // See above for AuthorityType
        get authorityType() {
          return this.getAuthorityType(this.canonicalAuthorityUrlComponents);
        }
        /**
         * ProtocolMode enum representing the way endpoints are constructed.
         */
        get protocolMode() {
          return this.authorityOptions.protocolMode;
        }
        /**
         * Returns authorityOptions which can be used to reinstantiate a new authority instance
         */
        get options() {
          return this.authorityOptions;
        }
        /**
         * A URL that is the authority set by the developer
         */
        get canonicalAuthority() {
          return this._canonicalAuthority.urlString;
        }
        /**
         * Sets canonical authority.
         */
        set canonicalAuthority(url) {
          this._canonicalAuthority = new UrlString(url);
          this._canonicalAuthority.validateAsUri();
          this._canonicalAuthorityUrlComponents = null;
        }
        /**
         * Get authority components.
         */
        get canonicalAuthorityUrlComponents() {
          if (!this._canonicalAuthorityUrlComponents) {
            this._canonicalAuthorityUrlComponents = this._canonicalAuthority.getUrlComponents();
          }
          return this._canonicalAuthorityUrlComponents;
        }
        /**
         * Get hostname and port i.e. login.microsoftonline.com
         */
        get hostnameAndPort() {
          return this.canonicalAuthorityUrlComponents.HostNameAndPort.toLowerCase();
        }
        /**
         * Get tenant for authority.
         */
        get tenant() {
          return this.canonicalAuthorityUrlComponents.PathSegments[0];
        }
        /**
         * OAuth /authorize endpoint for requests
         */
        get authorizationEndpoint() {
          if (this.discoveryComplete()) {
            return this.replacePath(this.metadata.authorization_endpoint);
          } else {
            throw createClientAuthError(endpointResolutionError);
          }
        }
        /**
         * OAuth /token endpoint for requests
         */
        get tokenEndpoint() {
          if (this.discoveryComplete()) {
            return this.replacePath(this.metadata.token_endpoint);
          } else {
            throw createClientAuthError(endpointResolutionError);
          }
        }
        get deviceCodeEndpoint() {
          if (this.discoveryComplete()) {
            return this.replacePath(this.metadata.token_endpoint.replace("/token", "/devicecode"));
          } else {
            throw createClientAuthError(endpointResolutionError);
          }
        }
        /**
         * OAuth logout endpoint for requests
         */
        get endSessionEndpoint() {
          if (this.discoveryComplete()) {
            if (!this.metadata.end_session_endpoint) {
              throw createClientAuthError(endSessionEndpointNotSupported);
            }
            return this.replacePath(this.metadata.end_session_endpoint);
          } else {
            throw createClientAuthError(endpointResolutionError);
          }
        }
        /**
         * OAuth issuer for requests
         */
        get selfSignedJwtAudience() {
          if (this.discoveryComplete()) {
            return this.replacePath(this.metadata.issuer);
          } else {
            throw createClientAuthError(endpointResolutionError);
          }
        }
        /**
         * Jwks_uri for token signing keys
         */
        get jwksUri() {
          if (this.discoveryComplete()) {
            return this.replacePath(this.metadata.jwks_uri);
          } else {
            throw createClientAuthError(endpointResolutionError);
          }
        }
        /**
         * Returns a flag indicating that tenant name can be replaced in authority {@link IUri}
         * @param authorityUri {@link IUri}
         * @private
         */
        canReplaceTenant(authorityUri) {
          return authorityUri.PathSegments.length === 1 && !_Authority.reservedTenantDomains.has(authorityUri.PathSegments[0]) && this.getAuthorityType(authorityUri) === AuthorityType.Default && this.protocolMode !== ProtocolMode.OIDC;
        }
        /**
         * Replaces tenant in url path with current tenant. Defaults to common.
         * @param urlString
         */
        replaceTenant(urlString) {
          return urlString.replace(/{tenant}|{tenantid}/g, this.tenant);
        }
        /**
         * Replaces path such as tenant or policy with the current tenant or policy.
         * @param urlString
         */
        replacePath(urlString) {
          let endpoint = urlString;
          const cachedAuthorityUrl = new UrlString(this.metadata.canonical_authority);
          const cachedAuthorityUrlComponents = cachedAuthorityUrl.getUrlComponents();
          const cachedAuthorityParts = cachedAuthorityUrlComponents.PathSegments;
          const currentAuthorityParts = this.canonicalAuthorityUrlComponents.PathSegments;
          currentAuthorityParts.forEach((currentPart, index) => {
            let cachedPart = cachedAuthorityParts[index];
            if (index === 0 && this.canReplaceTenant(cachedAuthorityUrlComponents)) {
              const tenantId = new UrlString(this.metadata.authorization_endpoint).getUrlComponents().PathSegments[0];
              if (cachedPart !== tenantId) {
                this.logger.verbose(`Replacing tenant domain name ${cachedPart} with id ${tenantId}`);
                cachedPart = tenantId;
              }
            }
            if (currentPart !== cachedPart) {
              endpoint = endpoint.replace(`/${cachedPart}/`, `/${currentPart}/`);
            }
          });
          return this.replaceTenant(endpoint);
        }
        /**
         * The default open id configuration endpoint for any canonical authority.
         */
        get defaultOpenIdConfigurationEndpoint() {
          const canonicalAuthorityHost = this.hostnameAndPort;
          if (this.canonicalAuthority.endsWith("v2.0/") || this.authorityType === AuthorityType.Adfs || this.protocolMode === ProtocolMode.OIDC && !this.isAliasOfKnownMicrosoftAuthority(canonicalAuthorityHost)) {
            return `${this.canonicalAuthority}.well-known/openid-configuration`;
          }
          return `${this.canonicalAuthority}v2.0/.well-known/openid-configuration`;
        }
        /**
         * Boolean that returns whether or not tenant discovery has been completed.
         */
        discoveryComplete() {
          return !!this.metadata;
        }
        /**
         * Perform endpoint discovery to discover aliases, preferred_cache, preferred_network
         * and the /authorize, /token and logout endpoints.
         */
        async resolveEndpointsAsync() {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.AuthorityResolveEndpointsAsync, this.correlationId);
          const metadataEntity = this.getCurrentMetadataEntity();
          const cloudDiscoverySource = await invokeAsync(this.updateCloudDiscoveryMetadata.bind(this), PerformanceEvents.AuthorityUpdateCloudDiscoveryMetadata, this.logger, this.performanceClient, this.correlationId)(metadataEntity);
          this.canonicalAuthority = this.canonicalAuthority.replace(this.hostnameAndPort, metadataEntity.preferred_network);
          const endpointSource = await invokeAsync(this.updateEndpointMetadata.bind(this), PerformanceEvents.AuthorityUpdateEndpointMetadata, this.logger, this.performanceClient, this.correlationId)(metadataEntity);
          this.updateCachedMetadata(metadataEntity, cloudDiscoverySource, {
            source: endpointSource
          });
          this.performanceClient?.addFields({
            cloudDiscoverySource,
            authorityEndpointSource: endpointSource
          }, this.correlationId);
        }
        /**
         * Returns metadata entity from cache if it exists, otherwiser returns a new metadata entity built
         * from the configured canonical authority
         * @returns
         */
        getCurrentMetadataEntity() {
          let metadataEntity = this.cacheManager.getAuthorityMetadataByAlias(this.hostnameAndPort);
          if (!metadataEntity) {
            metadataEntity = {
              aliases: [],
              preferred_cache: this.hostnameAndPort,
              preferred_network: this.hostnameAndPort,
              canonical_authority: this.canonicalAuthority,
              authorization_endpoint: "",
              token_endpoint: "",
              end_session_endpoint: "",
              issuer: "",
              aliasesFromNetwork: false,
              endpointsFromNetwork: false,
              expiresAt: generateAuthorityMetadataExpiresAt(),
              jwks_uri: ""
            };
          }
          return metadataEntity;
        }
        /**
         * Updates cached metadata based on metadata source and sets the instance's metadata
         * property to the same value
         * @param metadataEntity
         * @param cloudDiscoverySource
         * @param endpointMetadataResult
         */
        updateCachedMetadata(metadataEntity, cloudDiscoverySource, endpointMetadataResult) {
          if (cloudDiscoverySource !== AuthorityMetadataSource.CACHE && endpointMetadataResult?.source !== AuthorityMetadataSource.CACHE) {
            metadataEntity.expiresAt = generateAuthorityMetadataExpiresAt();
            metadataEntity.canonical_authority = this.canonicalAuthority;
          }
          const cacheKey = this.cacheManager.generateAuthorityMetadataCacheKey(metadataEntity.preferred_cache);
          this.cacheManager.setAuthorityMetadata(cacheKey, metadataEntity);
          this.metadata = metadataEntity;
        }
        /**
         * Update AuthorityMetadataEntity with new endpoints and return where the information came from
         * @param metadataEntity
         */
        async updateEndpointMetadata(metadataEntity) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.AuthorityUpdateEndpointMetadata, this.correlationId);
          const localMetadata = this.updateEndpointMetadataFromLocalSources(metadataEntity);
          if (localMetadata) {
            if (localMetadata.source === AuthorityMetadataSource.HARDCODED_VALUES) {
              if (this.authorityOptions.azureRegionConfiguration?.azureRegion) {
                if (localMetadata.metadata) {
                  const hardcodedMetadata = await invokeAsync(this.updateMetadataWithRegionalInformation.bind(this), PerformanceEvents.AuthorityUpdateMetadataWithRegionalInformation, this.logger, this.performanceClient, this.correlationId)(localMetadata.metadata);
                  updateAuthorityEndpointMetadata(metadataEntity, hardcodedMetadata, false);
                  metadataEntity.canonical_authority = this.canonicalAuthority;
                }
              }
            }
            return localMetadata.source;
          }
          let metadata = await invokeAsync(this.getEndpointMetadataFromNetwork.bind(this), PerformanceEvents.AuthorityGetEndpointMetadataFromNetwork, this.logger, this.performanceClient, this.correlationId)();
          if (metadata) {
            if (this.authorityOptions.azureRegionConfiguration?.azureRegion) {
              metadata = await invokeAsync(this.updateMetadataWithRegionalInformation.bind(this), PerformanceEvents.AuthorityUpdateMetadataWithRegionalInformation, this.logger, this.performanceClient, this.correlationId)(metadata);
            }
            updateAuthorityEndpointMetadata(metadataEntity, metadata, true);
            return AuthorityMetadataSource.NETWORK;
          } else {
            throw createClientAuthError(openIdConfigError, this.defaultOpenIdConfigurationEndpoint);
          }
        }
        /**
         * Updates endpoint metadata from local sources and returns where the information was retrieved from and the metadata config
         * response if the source is hardcoded metadata
         * @param metadataEntity
         * @returns
         */
        updateEndpointMetadataFromLocalSources(metadataEntity) {
          this.logger.verbose("Attempting to get endpoint metadata from authority configuration");
          const configMetadata = this.getEndpointMetadataFromConfig();
          if (configMetadata) {
            this.logger.verbose("Found endpoint metadata in authority configuration");
            updateAuthorityEndpointMetadata(metadataEntity, configMetadata, false);
            return {
              source: AuthorityMetadataSource.CONFIG
            };
          }
          this.logger.verbose("Did not find endpoint metadata in the config... Attempting to get endpoint metadata from the hardcoded values.");
          if (this.authorityOptions.skipAuthorityMetadataCache) {
            this.logger.verbose("Skipping hardcoded metadata cache since skipAuthorityMetadataCache is set to true. Attempting to get endpoint metadata from the network metadata cache.");
          } else {
            const hardcodedMetadata = this.getEndpointMetadataFromHardcodedValues();
            if (hardcodedMetadata) {
              updateAuthorityEndpointMetadata(metadataEntity, hardcodedMetadata, false);
              return {
                source: AuthorityMetadataSource.HARDCODED_VALUES,
                metadata: hardcodedMetadata
              };
            } else {
              this.logger.verbose("Did not find endpoint metadata in hardcoded values... Attempting to get endpoint metadata from the network metadata cache.");
            }
          }
          const metadataEntityExpired = isAuthorityMetadataExpired(metadataEntity);
          if (this.isAuthoritySameType(metadataEntity) && metadataEntity.endpointsFromNetwork && !metadataEntityExpired) {
            this.logger.verbose("Found endpoint metadata in the cache.");
            return { source: AuthorityMetadataSource.CACHE };
          } else if (metadataEntityExpired) {
            this.logger.verbose("The metadata entity is expired.");
          }
          return null;
        }
        /**
         * Compares the number of url components after the domain to determine if the cached
         * authority metadata can be used for the requested authority. Protects against same domain different
         * authority such as login.microsoftonline.com/tenant and login.microsoftonline.com/tfp/tenant/policy
         * @param metadataEntity
         */
        isAuthoritySameType(metadataEntity) {
          const cachedAuthorityUrl = new UrlString(metadataEntity.canonical_authority);
          const cachedParts = cachedAuthorityUrl.getUrlComponents().PathSegments;
          return cachedParts.length === this.canonicalAuthorityUrlComponents.PathSegments.length;
        }
        /**
         * Parse authorityMetadata config option
         */
        getEndpointMetadataFromConfig() {
          if (this.authorityOptions.authorityMetadata) {
            try {
              return JSON.parse(this.authorityOptions.authorityMetadata);
            } catch (e) {
              throw createClientConfigurationError(invalidAuthorityMetadata);
            }
          }
          return null;
        }
        /**
         * Gets OAuth endpoints from the given OpenID configuration endpoint.
         *
         * @param hasHardcodedMetadata boolean
         */
        async getEndpointMetadataFromNetwork() {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.AuthorityGetEndpointMetadataFromNetwork, this.correlationId);
          const options = {};
          const openIdConfigurationEndpoint = this.defaultOpenIdConfigurationEndpoint;
          this.logger.verbose(`Authority.getEndpointMetadataFromNetwork: attempting to retrieve OAuth endpoints from ${openIdConfigurationEndpoint}`);
          try {
            const response = await this.networkInterface.sendGetRequestAsync(openIdConfigurationEndpoint, options);
            const isValidResponse = isOpenIdConfigResponse(response.body);
            if (isValidResponse) {
              return response.body;
            } else {
              this.logger.verbose(`Authority.getEndpointMetadataFromNetwork: could not parse response as OpenID configuration`);
              return null;
            }
          } catch (e) {
            this.logger.verbose(`Authority.getEndpointMetadataFromNetwork: ${e}`);
            return null;
          }
        }
        /**
         * Get OAuth endpoints for common authorities.
         */
        getEndpointMetadataFromHardcodedValues() {
          if (this.hostnameAndPort in EndpointMetadata) {
            return EndpointMetadata[this.hostnameAndPort];
          }
          return null;
        }
        /**
         * Update the retrieved metadata with regional information.
         * User selected Azure region will be used if configured.
         */
        async updateMetadataWithRegionalInformation(metadata) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.AuthorityUpdateMetadataWithRegionalInformation, this.correlationId);
          const userConfiguredAzureRegion = this.authorityOptions.azureRegionConfiguration?.azureRegion;
          if (userConfiguredAzureRegion) {
            if (userConfiguredAzureRegion !== Constants.AZURE_REGION_AUTO_DISCOVER_FLAG) {
              this.regionDiscoveryMetadata.region_outcome = RegionDiscoveryOutcomes.CONFIGURED_NO_AUTO_DETECTION;
              this.regionDiscoveryMetadata.region_used = userConfiguredAzureRegion;
              return _Authority.replaceWithRegionalInformation(metadata, userConfiguredAzureRegion);
            }
            const autodetectedRegionName = await invokeAsync(this.regionDiscovery.detectRegion.bind(this.regionDiscovery), PerformanceEvents.RegionDiscoveryDetectRegion, this.logger, this.performanceClient, this.correlationId)(this.authorityOptions.azureRegionConfiguration?.environmentRegion, this.regionDiscoveryMetadata);
            if (autodetectedRegionName) {
              this.regionDiscoveryMetadata.region_outcome = RegionDiscoveryOutcomes.AUTO_DETECTION_REQUESTED_SUCCESSFUL;
              this.regionDiscoveryMetadata.region_used = autodetectedRegionName;
              return _Authority.replaceWithRegionalInformation(metadata, autodetectedRegionName);
            }
            this.regionDiscoveryMetadata.region_outcome = RegionDiscoveryOutcomes.AUTO_DETECTION_REQUESTED_FAILED;
          }
          return metadata;
        }
        /**
         * Updates the AuthorityMetadataEntity with new aliases, preferred_network and preferred_cache
         * and returns where the information was retrieved from
         * @param metadataEntity
         * @returns AuthorityMetadataSource
         */
        async updateCloudDiscoveryMetadata(metadataEntity) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.AuthorityUpdateCloudDiscoveryMetadata, this.correlationId);
          const localMetadataSource = this.updateCloudDiscoveryMetadataFromLocalSources(metadataEntity);
          if (localMetadataSource) {
            return localMetadataSource;
          }
          const metadata = await invokeAsync(this.getCloudDiscoveryMetadataFromNetwork.bind(this), PerformanceEvents.AuthorityGetCloudDiscoveryMetadataFromNetwork, this.logger, this.performanceClient, this.correlationId)();
          if (metadata) {
            updateCloudDiscoveryMetadata(metadataEntity, metadata, true);
            return AuthorityMetadataSource.NETWORK;
          }
          throw createClientConfigurationError(untrustedAuthority);
        }
        updateCloudDiscoveryMetadataFromLocalSources(metadataEntity) {
          this.logger.verbose("Attempting to get cloud discovery metadata  from authority configuration");
          this.logger.verbosePii(`Known Authorities: ${this.authorityOptions.knownAuthorities || Constants.NOT_APPLICABLE}`);
          this.logger.verbosePii(`Authority Metadata: ${this.authorityOptions.authorityMetadata || Constants.NOT_APPLICABLE}`);
          this.logger.verbosePii(`Canonical Authority: ${metadataEntity.canonical_authority || Constants.NOT_APPLICABLE}`);
          const metadata = this.getCloudDiscoveryMetadataFromConfig();
          if (metadata) {
            this.logger.verbose("Found cloud discovery metadata in authority configuration");
            updateCloudDiscoveryMetadata(metadataEntity, metadata, false);
            return AuthorityMetadataSource.CONFIG;
          }
          this.logger.verbose("Did not find cloud discovery metadata in the config... Attempting to get cloud discovery metadata from the hardcoded values.");
          if (this.options.skipAuthorityMetadataCache) {
            this.logger.verbose("Skipping hardcoded cloud discovery metadata cache since skipAuthorityMetadataCache is set to true. Attempting to get cloud discovery metadata from the network metadata cache.");
          } else {
            const hardcodedMetadata = getCloudDiscoveryMetadataFromHardcodedValues(this.hostnameAndPort);
            if (hardcodedMetadata) {
              this.logger.verbose("Found cloud discovery metadata from hardcoded values.");
              updateCloudDiscoveryMetadata(metadataEntity, hardcodedMetadata, false);
              return AuthorityMetadataSource.HARDCODED_VALUES;
            }
            this.logger.verbose("Did not find cloud discovery metadata in hardcoded values... Attempting to get cloud discovery metadata from the network metadata cache.");
          }
          const metadataEntityExpired = isAuthorityMetadataExpired(metadataEntity);
          if (this.isAuthoritySameType(metadataEntity) && metadataEntity.aliasesFromNetwork && !metadataEntityExpired) {
            this.logger.verbose("Found cloud discovery metadata in the cache.");
            return AuthorityMetadataSource.CACHE;
          } else if (metadataEntityExpired) {
            this.logger.verbose("The metadata entity is expired.");
          }
          return null;
        }
        /**
         * Parse cloudDiscoveryMetadata config or check knownAuthorities
         */
        getCloudDiscoveryMetadataFromConfig() {
          if (this.authorityType === AuthorityType.Ciam) {
            this.logger.verbose("CIAM authorities do not support cloud discovery metadata, generate the aliases from authority host.");
            return _Authority.createCloudDiscoveryMetadataFromHost(this.hostnameAndPort);
          }
          if (this.authorityOptions.cloudDiscoveryMetadata) {
            this.logger.verbose("The cloud discovery metadata has been provided as a network response, in the config.");
            try {
              this.logger.verbose("Attempting to parse the cloud discovery metadata.");
              const parsedResponse = JSON.parse(this.authorityOptions.cloudDiscoveryMetadata);
              const metadata = getCloudDiscoveryMetadataFromNetworkResponse(parsedResponse.metadata, this.hostnameAndPort);
              this.logger.verbose("Parsed the cloud discovery metadata.");
              if (metadata) {
                this.logger.verbose("There is returnable metadata attached to the parsed cloud discovery metadata.");
                return metadata;
              } else {
                this.logger.verbose("There is no metadata attached to the parsed cloud discovery metadata.");
              }
            } catch (e) {
              this.logger.verbose("Unable to parse the cloud discovery metadata. Throwing Invalid Cloud Discovery Metadata Error.");
              throw createClientConfigurationError(invalidCloudDiscoveryMetadata);
            }
          }
          if (this.isInKnownAuthorities()) {
            this.logger.verbose("The host is included in knownAuthorities. Creating new cloud discovery metadata from the host.");
            return _Authority.createCloudDiscoveryMetadataFromHost(this.hostnameAndPort);
          }
          return null;
        }
        /**
         * Called to get metadata from network if CloudDiscoveryMetadata was not populated by config
         *
         * @param hasHardcodedMetadata boolean
         */
        async getCloudDiscoveryMetadataFromNetwork() {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.AuthorityGetCloudDiscoveryMetadataFromNetwork, this.correlationId);
          const instanceDiscoveryEndpoint = `${Constants.AAD_INSTANCE_DISCOVERY_ENDPT}${this.canonicalAuthority}oauth2/v2.0/authorize`;
          const options = {};
          let match = null;
          try {
            const response = await this.networkInterface.sendGetRequestAsync(instanceDiscoveryEndpoint, options);
            let typedResponseBody;
            let metadata;
            if (isCloudInstanceDiscoveryResponse(response.body)) {
              typedResponseBody = response.body;
              metadata = typedResponseBody.metadata;
              this.logger.verbosePii(`tenant_discovery_endpoint is: ${typedResponseBody.tenant_discovery_endpoint}`);
            } else if (isCloudInstanceDiscoveryErrorResponse(response.body)) {
              this.logger.warning(`A CloudInstanceDiscoveryErrorResponse was returned. The cloud instance discovery network request's status code is: ${response.status}`);
              typedResponseBody = response.body;
              if (typedResponseBody.error === Constants.INVALID_INSTANCE) {
                this.logger.error("The CloudInstanceDiscoveryErrorResponse error is invalid_instance.");
                return null;
              }
              this.logger.warning(`The CloudInstanceDiscoveryErrorResponse error is ${typedResponseBody.error}`);
              this.logger.warning(`The CloudInstanceDiscoveryErrorResponse error description is ${typedResponseBody.error_description}`);
              this.logger.warning("Setting the value of the CloudInstanceDiscoveryMetadata (returned from the network) to []");
              metadata = [];
            } else {
              this.logger.error("AAD did not return a CloudInstanceDiscoveryResponse or CloudInstanceDiscoveryErrorResponse");
              return null;
            }
            this.logger.verbose("Attempting to find a match between the developer's authority and the CloudInstanceDiscoveryMetadata returned from the network request.");
            match = getCloudDiscoveryMetadataFromNetworkResponse(metadata, this.hostnameAndPort);
          } catch (error) {
            if (error instanceof AuthError) {
              this.logger.error(`There was a network error while attempting to get the cloud discovery instance metadata.
Error: ${error.errorCode}
Error Description: ${error.errorMessage}`);
            } else {
              const typedError = error;
              this.logger.error(`A non-MSALJS error was thrown while attempting to get the cloud instance discovery metadata.
Error: ${typedError.name}
Error Description: ${typedError.message}`);
            }
            return null;
          }
          if (!match) {
            this.logger.warning("The developer's authority was not found within the CloudInstanceDiscoveryMetadata returned from the network request.");
            this.logger.verbose("Creating custom Authority for custom domain scenario.");
            match = _Authority.createCloudDiscoveryMetadataFromHost(this.hostnameAndPort);
          }
          return match;
        }
        /**
         * Helper function to determine if this host is included in the knownAuthorities config option
         */
        isInKnownAuthorities() {
          const matches = this.authorityOptions.knownAuthorities.filter((authority) => {
            return authority && UrlString.getDomainFromUrl(authority).toLowerCase() === this.hostnameAndPort;
          });
          return matches.length > 0;
        }
        /**
         * helper function to populate the authority based on azureCloudOptions
         * @param authorityString
         * @param azureCloudOptions
         */
        static generateAuthority(authorityString, azureCloudOptions) {
          let authorityAzureCloudInstance;
          if (azureCloudOptions && azureCloudOptions.azureCloudInstance !== AzureCloudInstance.None) {
            const tenant = azureCloudOptions.tenant ? azureCloudOptions.tenant : Constants.DEFAULT_COMMON_TENANT;
            authorityAzureCloudInstance = `${azureCloudOptions.azureCloudInstance}/${tenant}/`;
          }
          return authorityAzureCloudInstance ? authorityAzureCloudInstance : authorityString;
        }
        /**
         * Creates cloud discovery metadata object from a given host
         * @param host
         */
        static createCloudDiscoveryMetadataFromHost(host) {
          return {
            preferred_network: host,
            preferred_cache: host,
            aliases: [host]
          };
        }
        /**
         * helper function to generate environment from authority object
         */
        getPreferredCache() {
          if (this.managedIdentity) {
            return Constants.DEFAULT_AUTHORITY_HOST;
          } else if (this.discoveryComplete()) {
            return this.metadata.preferred_cache;
          } else {
            throw createClientAuthError(endpointResolutionError);
          }
        }
        /**
         * Returns whether or not the provided host is an alias of this authority instance
         * @param host
         */
        isAlias(host) {
          return this.metadata.aliases.indexOf(host) > -1;
        }
        /**
         * Returns whether or not the provided host is an alias of a known Microsoft authority for purposes of endpoint discovery
         * @param host
         */
        isAliasOfKnownMicrosoftAuthority(host) {
          return InstanceDiscoveryMetadataAliases.has(host);
        }
        /**
         * Checks whether the provided host is that of a public cloud authority
         *
         * @param authority string
         * @returns bool
         */
        static isPublicCloudAuthority(host) {
          return Constants.KNOWN_PUBLIC_CLOUDS.indexOf(host) >= 0;
        }
        /**
         * Rebuild the authority string with the region
         *
         * @param host string
         * @param region string
         */
        static buildRegionalAuthorityString(host, region, queryString) {
          const authorityUrlInstance = new UrlString(host);
          authorityUrlInstance.validateAsUri();
          const authorityUrlParts = authorityUrlInstance.getUrlComponents();
          let hostNameAndPort = `${region}.${authorityUrlParts.HostNameAndPort}`;
          if (this.isPublicCloudAuthority(authorityUrlParts.HostNameAndPort)) {
            hostNameAndPort = `${region}.${Constants.REGIONAL_AUTH_PUBLIC_CLOUD_SUFFIX}`;
          }
          const url = UrlString.constructAuthorityUriFromObject({
            ...authorityUrlInstance.getUrlComponents(),
            HostNameAndPort: hostNameAndPort
          }).urlString;
          if (queryString)
            return `${url}?${queryString}`;
          return url;
        }
        /**
         * Replace the endpoints in the metadata object with their regional equivalents.
         *
         * @param metadata OpenIdConfigResponse
         * @param azureRegion string
         */
        static replaceWithRegionalInformation(metadata, azureRegion) {
          const regionalMetadata = { ...metadata };
          regionalMetadata.authorization_endpoint = _Authority.buildRegionalAuthorityString(regionalMetadata.authorization_endpoint, azureRegion);
          regionalMetadata.token_endpoint = _Authority.buildRegionalAuthorityString(regionalMetadata.token_endpoint, azureRegion);
          if (regionalMetadata.end_session_endpoint) {
            regionalMetadata.end_session_endpoint = _Authority.buildRegionalAuthorityString(regionalMetadata.end_session_endpoint, azureRegion);
          }
          return regionalMetadata;
        }
        /**
         * Transform CIAM_AUTHORIY as per the below rules:
         * If no path segments found and it is a CIAM authority (hostname ends with .ciamlogin.com), then transform it
         *
         * NOTE: The transformation path should go away once STS supports CIAM with the format: `tenantIdorDomain.ciamlogin.com`
         * `ciamlogin.com` can also change in the future and we should accommodate the same
         *
         * @param authority
         */
        static transformCIAMAuthority(authority) {
          let ciamAuthority = authority;
          const authorityUrl = new UrlString(authority);
          const authorityUrlComponents = authorityUrl.getUrlComponents();
          if (authorityUrlComponents.PathSegments.length === 0 && authorityUrlComponents.HostNameAndPort.endsWith(Constants.CIAM_AUTH_URL)) {
            const tenantIdOrDomain = authorityUrlComponents.HostNameAndPort.split(".")[0];
            ciamAuthority = `${ciamAuthority}${tenantIdOrDomain}${Constants.AAD_TENANT_DOMAIN_SUFFIX}`;
          }
          return ciamAuthority;
        }
      };
      Authority.reservedTenantDomains = /* @__PURE__ */ new Set([
        "{tenant}",
        "{tenantid}",
        AADAuthorityConstants.COMMON,
        AADAuthorityConstants.CONSUMERS,
        AADAuthorityConstants.ORGANIZATIONS
      ]);
      function getTenantFromAuthorityString(authority) {
        const authorityUrl = new UrlString(authority);
        const authorityUrlComponents = authorityUrl.getUrlComponents();
        const tenantId = authorityUrlComponents.PathSegments.slice(-1)[0]?.toLowerCase();
        switch (tenantId) {
          case AADAuthorityConstants.COMMON:
          case AADAuthorityConstants.ORGANIZATIONS:
          case AADAuthorityConstants.CONSUMERS:
            return void 0;
          default:
            return tenantId;
        }
      }
      function formatAuthorityUri(authorityUri) {
        return authorityUri.endsWith(Constants.FORWARD_SLASH) ? authorityUri : `${authorityUri}${Constants.FORWARD_SLASH}`;
      }
      function buildStaticAuthorityOptions(authOptions) {
        const rawCloudDiscoveryMetadata = authOptions.cloudDiscoveryMetadata;
        let cloudDiscoveryMetadata = void 0;
        if (rawCloudDiscoveryMetadata) {
          try {
            cloudDiscoveryMetadata = JSON.parse(rawCloudDiscoveryMetadata);
          } catch (e) {
            throw createClientConfigurationError(invalidCloudDiscoveryMetadata);
          }
        }
        return {
          canonicalAuthority: authOptions.authority ? formatAuthorityUri(authOptions.authority) : void 0,
          knownAuthorities: authOptions.knownAuthorities,
          cloudDiscoveryMetadata
        };
      }
      async function createDiscoveredInstance(authorityUri, networkClient, cacheManager, authorityOptions, logger, correlationId, performanceClient) {
        performanceClient?.addQueueMeasurement(PerformanceEvents.AuthorityFactoryCreateDiscoveredInstance, correlationId);
        const authorityUriFinal = Authority.transformCIAMAuthority(formatAuthorityUri(authorityUri));
        const acquireTokenAuthority = new Authority(authorityUriFinal, networkClient, cacheManager, authorityOptions, logger, correlationId, performanceClient);
        try {
          await invokeAsync(acquireTokenAuthority.resolveEndpointsAsync.bind(acquireTokenAuthority), PerformanceEvents.AuthorityResolveEndpointsAsync, logger, performanceClient, correlationId)();
          return acquireTokenAuthority;
        } catch (e) {
          throw createClientAuthError(endpointResolutionError);
        }
      }
      var ServerError = class _ServerError extends AuthError {
        constructor(errorCode, errorMessage, subError, errorNo, status) {
          super(errorCode, errorMessage, subError);
          this.name = "ServerError";
          this.errorNo = errorNo;
          this.status = status;
          Object.setPrototypeOf(this, _ServerError.prototype);
        }
      };
      function getRequestThumbprint(clientId, request, homeAccountId) {
        return {
          clientId,
          authority: request.authority,
          scopes: request.scopes,
          homeAccountIdentifier: homeAccountId,
          claims: request.claims,
          authenticationScheme: request.authenticationScheme,
          resourceRequestMethod: request.resourceRequestMethod,
          resourceRequestUri: request.resourceRequestUri,
          shrClaims: request.shrClaims,
          sshKid: request.sshKid,
          embeddedClientId: request.embeddedClientId || request.tokenBodyParameters?.clientId
        };
      }
      var ThrottlingUtils = class _ThrottlingUtils {
        /**
         * Prepares a RequestThumbprint to be stored as a key.
         * @param thumbprint
         */
        static generateThrottlingStorageKey(thumbprint) {
          return `${ThrottlingConstants.THROTTLING_PREFIX}.${JSON.stringify(thumbprint)}`;
        }
        /**
         * Performs necessary throttling checks before a network request.
         * @param cacheManager
         * @param thumbprint
         */
        static preProcess(cacheManager, thumbprint, correlationId) {
          const key = _ThrottlingUtils.generateThrottlingStorageKey(thumbprint);
          const value = cacheManager.getThrottlingCache(key);
          if (value) {
            if (value.throttleTime < Date.now()) {
              cacheManager.removeItem(key, correlationId);
              return;
            }
            throw new ServerError(value.errorCodes?.join(" ") || Constants.EMPTY_STRING, value.errorMessage, value.subError);
          }
        }
        /**
         * Performs necessary throttling checks after a network request.
         * @param cacheManager
         * @param thumbprint
         * @param response
         */
        static postProcess(cacheManager, thumbprint, response, correlationId) {
          if (_ThrottlingUtils.checkResponseStatus(response) || _ThrottlingUtils.checkResponseForRetryAfter(response)) {
            const thumbprintValue = {
              throttleTime: _ThrottlingUtils.calculateThrottleTime(parseInt(response.headers[HeaderNames.RETRY_AFTER])),
              error: response.body.error,
              errorCodes: response.body.error_codes,
              errorMessage: response.body.error_description,
              subError: response.body.suberror
            };
            cacheManager.setThrottlingCache(_ThrottlingUtils.generateThrottlingStorageKey(thumbprint), thumbprintValue, correlationId);
          }
        }
        /**
         * Checks a NetworkResponse object's status codes against 429 or 5xx
         * @param response
         */
        static checkResponseStatus(response) {
          return response.status === 429 || response.status >= 500 && response.status < 600;
        }
        /**
         * Checks a NetworkResponse object's RetryAfter header
         * @param response
         */
        static checkResponseForRetryAfter(response) {
          if (response.headers) {
            return response.headers.hasOwnProperty(HeaderNames.RETRY_AFTER) && (response.status < 200 || response.status >= 300);
          }
          return false;
        }
        /**
         * Calculates the Unix-time value for a throttle to expire given throttleTime in seconds.
         * @param throttleTime
         */
        static calculateThrottleTime(throttleTime) {
          const time = throttleTime <= 0 ? 0 : throttleTime;
          const currentSeconds = Date.now() / 1e3;
          return Math.floor(Math.min(currentSeconds + (time || ThrottlingConstants.DEFAULT_THROTTLE_TIME_SECONDS), currentSeconds + ThrottlingConstants.DEFAULT_MAX_THROTTLE_TIME_SECONDS) * 1e3);
        }
        static removeThrottle(cacheManager, clientId, request, homeAccountIdentifier) {
          const thumbprint = getRequestThumbprint(clientId, request, homeAccountIdentifier);
          const key = this.generateThrottlingStorageKey(thumbprint);
          cacheManager.removeItem(key, request.correlationId);
        }
      };
      var NetworkError = class _NetworkError extends AuthError {
        constructor(error, httpStatus, responseHeaders) {
          super(error.errorCode, error.errorMessage, error.subError);
          Object.setPrototypeOf(this, _NetworkError.prototype);
          this.name = "NetworkError";
          this.error = error;
          this.httpStatus = httpStatus;
          this.responseHeaders = responseHeaders;
        }
      };
      function createNetworkError(error, httpStatus, responseHeaders, additionalError) {
        error.errorMessage = `${error.errorMessage}, additionalErrorInfo: error.name:${additionalError?.name}, error.message:${additionalError?.message}`;
        return new NetworkError(error, httpStatus, responseHeaders);
      }
      var BaseClient = class {
        constructor(configuration, performanceClient) {
          this.config = buildClientConfiguration(configuration);
          this.logger = new Logger(this.config.loggerOptions, name$1, version$1);
          this.cryptoUtils = this.config.cryptoInterface;
          this.cacheManager = this.config.storageInterface;
          this.networkClient = this.config.networkInterface;
          this.serverTelemetryManager = this.config.serverTelemetryManager;
          this.authority = this.config.authOptions.authority;
          this.performanceClient = performanceClient;
        }
        /**
         * Creates default headers for requests to token endpoint
         */
        createTokenRequestHeaders(ccsCred) {
          const headers = {};
          headers[HeaderNames.CONTENT_TYPE] = Constants.URL_FORM_CONTENT_TYPE;
          if (!this.config.systemOptions.preventCorsPreflight && ccsCred) {
            switch (ccsCred.type) {
              case CcsCredentialType.HOME_ACCOUNT_ID:
                try {
                  const clientInfo = buildClientInfoFromHomeAccountId(ccsCred.credential);
                  headers[HeaderNames.CCS_HEADER] = `Oid:${clientInfo.uid}@${clientInfo.utid}`;
                } catch (e) {
                  this.logger.verbose("Could not parse home account ID for CCS Header: " + e);
                }
                break;
              case CcsCredentialType.UPN:
                headers[HeaderNames.CCS_HEADER] = `UPN: ${ccsCred.credential}`;
                break;
            }
          }
          return headers;
        }
        /**
         * Http post to token endpoint
         * @param tokenEndpoint
         * @param queryString
         * @param headers
         * @param thumbprint
         */
        async executePostToTokenEndpoint(tokenEndpoint, queryString, headers, thumbprint, correlationId, queuedEvent) {
          if (queuedEvent) {
            this.performanceClient?.addQueueMeasurement(queuedEvent, correlationId);
          }
          const response = await this.sendPostRequest(thumbprint, tokenEndpoint, { body: queryString, headers }, correlationId);
          if (this.config.serverTelemetryManager && response.status < 500 && response.status !== 429) {
            this.config.serverTelemetryManager.clearTelemetryCache();
          }
          return response;
        }
        /**
         * Wraps sendPostRequestAsync with necessary preflight and postflight logic
         * @param thumbprint - Request thumbprint for throttling
         * @param tokenEndpoint - Endpoint to make the POST to
         * @param options - Body and Headers to include on the POST request
         * @param correlationId - CorrelationId for telemetry
         */
        async sendPostRequest(thumbprint, tokenEndpoint, options, correlationId) {
          ThrottlingUtils.preProcess(this.cacheManager, thumbprint, correlationId);
          let response;
          try {
            response = await invokeAsync(this.networkClient.sendPostRequestAsync.bind(this.networkClient), PerformanceEvents.NetworkClientSendPostRequestAsync, this.logger, this.performanceClient, correlationId)(tokenEndpoint, options);
            const responseHeaders = response.headers || {};
            this.performanceClient?.addFields({
              refreshTokenSize: response.body.refresh_token?.length || 0,
              httpVerToken: responseHeaders[HeaderNames.X_MS_HTTP_VERSION] || "",
              requestId: responseHeaders[HeaderNames.X_MS_REQUEST_ID] || ""
            }, correlationId);
          } catch (e) {
            if (e instanceof NetworkError) {
              const responseHeaders = e.responseHeaders;
              if (responseHeaders) {
                this.performanceClient?.addFields({
                  httpVerToken: responseHeaders[HeaderNames.X_MS_HTTP_VERSION] || "",
                  requestId: responseHeaders[HeaderNames.X_MS_REQUEST_ID] || "",
                  contentTypeHeader: responseHeaders[HeaderNames.CONTENT_TYPE] || void 0,
                  contentLengthHeader: responseHeaders[HeaderNames.CONTENT_LENGTH] || void 0,
                  httpStatus: e.httpStatus
                }, correlationId);
              }
              throw e.error;
            }
            if (e instanceof AuthError) {
              throw e;
            } else {
              throw createClientAuthError(networkError);
            }
          }
          ThrottlingUtils.postProcess(this.cacheManager, thumbprint, response, correlationId);
          return response;
        }
        /**
         * Updates the authority object of the client. Endpoint discovery must be completed.
         * @param updatedAuthority
         */
        async updateAuthority(cloudInstanceHostname, correlationId) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.UpdateTokenEndpointAuthority, correlationId);
          const cloudInstanceAuthorityUri = `https://${cloudInstanceHostname}/${this.authority.tenant}/`;
          const cloudInstanceAuthority = await createDiscoveredInstance(cloudInstanceAuthorityUri, this.networkClient, this.cacheManager, this.authority.options, this.logger, correlationId, this.performanceClient);
          this.authority = cloudInstanceAuthority;
        }
        /**
         * Creates query string for the /token request
         * @param request
         */
        createTokenQueryParameters(request) {
          const parameters = /* @__PURE__ */ new Map();
          if (request.embeddedClientId) {
            addBrokerParameters(parameters, this.config.authOptions.clientId, this.config.authOptions.redirectUri);
          }
          if (request.tokenQueryParameters) {
            addExtraQueryParameters(parameters, request.tokenQueryParameters);
          }
          addCorrelationId(parameters, request.correlationId);
          instrumentBrokerParams(parameters, request.correlationId, this.performanceClient);
          return mapToQueryString(parameters);
        }
      };
      function getTenantIdFromIdTokenClaims(idTokenClaims) {
        if (idTokenClaims) {
          const tenantId = idTokenClaims.tid || idTokenClaims.tfp || idTokenClaims.acr;
          return tenantId || null;
        }
        return null;
      }
      var AccountEntity = class _AccountEntity {
        /**
         * Returns the AccountInfo interface for this account.
         */
        getAccountInfo() {
          return {
            homeAccountId: this.homeAccountId,
            environment: this.environment,
            tenantId: this.realm,
            username: this.username,
            localAccountId: this.localAccountId,
            loginHint: this.loginHint,
            name: this.name,
            nativeAccountId: this.nativeAccountId,
            authorityType: this.authorityType,
            // Deserialize tenant profiles array into a Map
            tenantProfiles: new Map((this.tenantProfiles || []).map((tenantProfile) => {
              return [tenantProfile.tenantId, tenantProfile];
            })),
            dataBoundary: this.dataBoundary
          };
        }
        /**
         * Returns true if the account entity is in single tenant format (outdated), false otherwise
         */
        isSingleTenant() {
          return !this.tenantProfiles;
        }
        /**
         * Build Account cache from IdToken, clientInfo and authority/policy. Associated with AAD.
         * @param accountDetails
         */
        static createAccount(accountDetails, authority, base64Decode2) {
          const account2 = new _AccountEntity();
          if (authority.authorityType === AuthorityType.Adfs) {
            account2.authorityType = CacheAccountType.ADFS_ACCOUNT_TYPE;
          } else if (authority.protocolMode === ProtocolMode.OIDC) {
            account2.authorityType = CacheAccountType.GENERIC_ACCOUNT_TYPE;
          } else {
            account2.authorityType = CacheAccountType.MSSTS_ACCOUNT_TYPE;
          }
          let clientInfo;
          if (accountDetails.clientInfo && base64Decode2) {
            clientInfo = buildClientInfo(accountDetails.clientInfo, base64Decode2);
            if (clientInfo.xms_tdbr) {
              account2.dataBoundary = clientInfo.xms_tdbr === "EU" ? "EU" : "None";
            }
          }
          account2.clientInfo = accountDetails.clientInfo;
          account2.homeAccountId = accountDetails.homeAccountId;
          account2.nativeAccountId = accountDetails.nativeAccountId;
          const env = accountDetails.environment || authority && authority.getPreferredCache();
          if (!env) {
            throw createClientAuthError(invalidCacheEnvironment);
          }
          account2.environment = env;
          account2.realm = clientInfo?.utid || getTenantIdFromIdTokenClaims(accountDetails.idTokenClaims) || "";
          account2.localAccountId = clientInfo?.uid || accountDetails.idTokenClaims?.oid || accountDetails.idTokenClaims?.sub || "";
          const preferredUsername = accountDetails.idTokenClaims?.preferred_username || accountDetails.idTokenClaims?.upn;
          const email = accountDetails.idTokenClaims?.emails ? accountDetails.idTokenClaims.emails[0] : null;
          account2.username = preferredUsername || email || "";
          account2.loginHint = accountDetails.idTokenClaims?.login_hint;
          account2.name = accountDetails.idTokenClaims?.name || "";
          account2.cloudGraphHostName = accountDetails.cloudGraphHostName;
          account2.msGraphHost = accountDetails.msGraphHost;
          if (accountDetails.tenantProfiles) {
            account2.tenantProfiles = accountDetails.tenantProfiles;
          } else {
            const tenantProfile = buildTenantProfile(accountDetails.homeAccountId, account2.localAccountId, account2.realm, accountDetails.idTokenClaims);
            account2.tenantProfiles = [tenantProfile];
          }
          return account2;
        }
        /**
         * Creates an AccountEntity object from AccountInfo
         * @param accountInfo
         * @param cloudGraphHostName
         * @param msGraphHost
         * @returns
         */
        static createFromAccountInfo(accountInfo, cloudGraphHostName, msGraphHost) {
          const account2 = new _AccountEntity();
          account2.authorityType = accountInfo.authorityType || CacheAccountType.GENERIC_ACCOUNT_TYPE;
          account2.homeAccountId = accountInfo.homeAccountId;
          account2.localAccountId = accountInfo.localAccountId;
          account2.nativeAccountId = accountInfo.nativeAccountId;
          account2.realm = accountInfo.tenantId;
          account2.environment = accountInfo.environment;
          account2.username = accountInfo.username;
          account2.name = accountInfo.name;
          account2.loginHint = accountInfo.loginHint;
          account2.cloudGraphHostName = cloudGraphHostName;
          account2.msGraphHost = msGraphHost;
          account2.tenantProfiles = Array.from(accountInfo.tenantProfiles?.values() || []);
          account2.dataBoundary = accountInfo.dataBoundary;
          return account2;
        }
        /**
         * Generate HomeAccountId from server response
         * @param serverClientInfo
         * @param authType
         */
        static generateHomeAccountId(serverClientInfo, authType, logger, cryptoObj, idTokenClaims) {
          if (!(authType === AuthorityType.Adfs || authType === AuthorityType.Dsts)) {
            if (serverClientInfo) {
              try {
                const clientInfo = buildClientInfo(serverClientInfo, cryptoObj.base64Decode);
                if (clientInfo.uid && clientInfo.utid) {
                  return `${clientInfo.uid}.${clientInfo.utid}`;
                }
              } catch (e) {
              }
            }
            logger.warning("No client info in response");
          }
          return idTokenClaims?.sub || "";
        }
        /**
         * Validates an entity: checks for all expected params
         * @param entity
         */
        static isAccountEntity(entity) {
          if (!entity) {
            return false;
          }
          return entity.hasOwnProperty("homeAccountId") && entity.hasOwnProperty("environment") && entity.hasOwnProperty("realm") && entity.hasOwnProperty("localAccountId") && entity.hasOwnProperty("username") && entity.hasOwnProperty("authorityType");
        }
        /**
         * Helper function to determine whether 2 accountInfo objects represent the same account
         * @param accountA
         * @param accountB
         * @param compareClaims - If set to true idTokenClaims will also be compared to determine account equality
         */
        static accountInfoIsEqual(accountA, accountB, compareClaims) {
          if (!accountA || !accountB) {
            return false;
          }
          let claimsMatch = true;
          if (compareClaims) {
            const accountAClaims = accountA.idTokenClaims || {};
            const accountBClaims = accountB.idTokenClaims || {};
            claimsMatch = accountAClaims.iat === accountBClaims.iat && accountAClaims.nonce === accountBClaims.nonce;
          }
          return accountA.homeAccountId === accountB.homeAccountId && accountA.localAccountId === accountB.localAccountId && accountA.username === accountB.username && accountA.tenantId === accountB.tenantId && accountA.loginHint === accountB.loginHint && accountA.environment === accountB.environment && accountA.nativeAccountId === accountB.nativeAccountId && claimsMatch;
        }
      };
      var noTokensFound = "no_tokens_found";
      var nativeAccountUnavailable = "native_account_unavailable";
      var refreshTokenExpired = "refresh_token_expired";
      var uxNotAllowed = "ux_not_allowed";
      var interactionRequired = "interaction_required";
      var consentRequired = "consent_required";
      var loginRequired = "login_required";
      var badToken = "bad_token";
      var InteractionRequiredAuthErrorCodes = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        badToken,
        consentRequired,
        interactionRequired,
        loginRequired,
        nativeAccountUnavailable,
        noTokensFound,
        refreshTokenExpired,
        uxNotAllowed
      });
      var InteractionRequiredServerErrorMessage = [
        interactionRequired,
        consentRequired,
        loginRequired,
        badToken,
        uxNotAllowed
      ];
      var InteractionRequiredAuthSubErrorMessage = [
        "message_only",
        "additional_action",
        "basic_action",
        "user_password_expired",
        "consent_required",
        "bad_token"
      ];
      var InteractionRequiredAuthErrorMessages = {
        [noTokensFound]: "No refresh token found in the cache. Please sign-in.",
        [nativeAccountUnavailable]: "The requested account is not available in the native broker. It may have been deleted or logged out. Please sign-in again using an interactive API.",
        [refreshTokenExpired]: "Refresh token has expired.",
        [badToken]: "Identity provider returned bad_token due to an expired or invalid refresh token. Please invoke an interactive API to resolve.",
        [uxNotAllowed]: "`canShowUI` flag in Edge was set to false. User interaction required on web page. Please invoke an interactive API to resolve."
      };
      var InteractionRequiredAuthErrorMessage = {
        noTokensFoundError: {
          code: noTokensFound,
          desc: InteractionRequiredAuthErrorMessages[noTokensFound]
        },
        native_account_unavailable: {
          code: nativeAccountUnavailable,
          desc: InteractionRequiredAuthErrorMessages[nativeAccountUnavailable]
        },
        bad_token: {
          code: badToken,
          desc: InteractionRequiredAuthErrorMessages[badToken]
        }
      };
      var InteractionRequiredAuthError = class _InteractionRequiredAuthError extends AuthError {
        constructor(errorCode, errorMessage, subError, timestamp, traceId, correlationId, claims, errorNo) {
          super(errorCode, errorMessage, subError);
          Object.setPrototypeOf(this, _InteractionRequiredAuthError.prototype);
          this.timestamp = timestamp || Constants.EMPTY_STRING;
          this.traceId = traceId || Constants.EMPTY_STRING;
          this.correlationId = correlationId || Constants.EMPTY_STRING;
          this.claims = claims || Constants.EMPTY_STRING;
          this.name = "InteractionRequiredAuthError";
          this.errorNo = errorNo;
        }
      };
      function isInteractionRequiredError(errorCode, errorString, subError) {
        const isInteractionRequiredErrorCode = !!errorCode && InteractionRequiredServerErrorMessage.indexOf(errorCode) > -1;
        const isInteractionRequiredSubError = !!subError && InteractionRequiredAuthSubErrorMessage.indexOf(subError) > -1;
        const isInteractionRequiredErrorDesc = !!errorString && InteractionRequiredServerErrorMessage.some((irErrorCode) => {
          return errorString.indexOf(irErrorCode) > -1;
        });
        return isInteractionRequiredErrorCode || isInteractionRequiredErrorDesc || isInteractionRequiredSubError;
      }
      function createInteractionRequiredAuthError(errorCode) {
        return new InteractionRequiredAuthError(errorCode, InteractionRequiredAuthErrorMessages[errorCode]);
      }
      var ProtocolUtils = class _ProtocolUtils {
        /**
         * Appends user state with random guid, or returns random guid.
         * @param userState
         * @param randomGuid
         */
        static setRequestState(cryptoObj, userState, meta) {
          const libraryState = _ProtocolUtils.generateLibraryState(cryptoObj, meta);
          return userState ? `${libraryState}${Constants.RESOURCE_DELIM}${userState}` : libraryState;
        }
        /**
         * Generates the state value used by the common library.
         * @param randomGuid
         * @param cryptoObj
         */
        static generateLibraryState(cryptoObj, meta) {
          if (!cryptoObj) {
            throw createClientAuthError(noCryptoObject);
          }
          const stateObj = {
            id: cryptoObj.createNewGuid()
          };
          if (meta) {
            stateObj.meta = meta;
          }
          const stateString = JSON.stringify(stateObj);
          return cryptoObj.base64Encode(stateString);
        }
        /**
         * Parses the state into the RequestStateObject, which contains the LibraryState info and the state passed by the user.
         * @param state
         * @param cryptoObj
         */
        static parseRequestState(cryptoObj, state2) {
          if (!cryptoObj) {
            throw createClientAuthError(noCryptoObject);
          }
          if (!state2) {
            throw createClientAuthError(invalidState);
          }
          try {
            const splitState = state2.split(Constants.RESOURCE_DELIM);
            const libraryState = splitState[0];
            const userState = splitState.length > 1 ? splitState.slice(1).join(Constants.RESOURCE_DELIM) : Constants.EMPTY_STRING;
            const libraryStateString = cryptoObj.base64Decode(libraryState);
            const libraryStateObj = JSON.parse(libraryStateString);
            return {
              userRequestState: userState || Constants.EMPTY_STRING,
              libraryState: libraryStateObj
            };
          } catch (e) {
            throw createClientAuthError(invalidState);
          }
        }
      };
      var KeyLocation = {
        SW: "sw"
      };
      var PopTokenGenerator = class {
        constructor(cryptoUtils, performanceClient) {
          this.cryptoUtils = cryptoUtils;
          this.performanceClient = performanceClient;
        }
        /**
         * Generates the req_cnf validated at the RP in the POP protocol for SHR parameters
         * and returns an object containing the keyid, the full req_cnf string and the req_cnf string hash
         * @param request
         * @returns
         */
        async generateCnf(request, logger) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.PopTokenGenerateCnf, request.correlationId);
          const reqCnf = await invokeAsync(this.generateKid.bind(this), PerformanceEvents.PopTokenGenerateCnf, logger, this.performanceClient, request.correlationId)(request);
          const reqCnfString = this.cryptoUtils.base64UrlEncode(JSON.stringify(reqCnf));
          return {
            kid: reqCnf.kid,
            reqCnfString
          };
        }
        /**
         * Generates key_id for a SHR token request
         * @param request
         * @returns
         */
        async generateKid(request) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.PopTokenGenerateKid, request.correlationId);
          const kidThumbprint = await this.cryptoUtils.getPublicKeyThumbprint(request);
          return {
            kid: kidThumbprint,
            xms_ksl: KeyLocation.SW
          };
        }
        /**
         * Signs the POP access_token with the local generated key-pair
         * @param accessToken
         * @param request
         * @returns
         */
        async signPopToken(accessToken, keyId, request) {
          return this.signPayload(accessToken, keyId, request);
        }
        /**
         * Utility function to generate the signed JWT for an access_token
         * @param payload
         * @param kid
         * @param request
         * @param claims
         * @returns
         */
        async signPayload(payload, keyId, request, claims) {
          const { resourceRequestMethod, resourceRequestUri, shrClaims, shrNonce, shrOptions } = request;
          const resourceUrlString = resourceRequestUri ? new UrlString(resourceRequestUri) : void 0;
          const resourceUrlComponents = resourceUrlString?.getUrlComponents();
          return this.cryptoUtils.signJwt({
            at: payload,
            ts: nowSeconds(),
            m: resourceRequestMethod?.toUpperCase(),
            u: resourceUrlComponents?.HostNameAndPort,
            nonce: shrNonce || this.cryptoUtils.createNewGuid(),
            p: resourceUrlComponents?.AbsolutePath,
            q: resourceUrlComponents?.QueryString ? [[], resourceUrlComponents.QueryString] : void 0,
            client_claims: shrClaims || void 0,
            ...claims
          }, keyId, shrOptions, request.correlationId);
        }
      };
      var TokenCacheContext = class {
        constructor(tokenCache, hasChanged) {
          this.cache = tokenCache;
          this.hasChanged = hasChanged;
        }
        /**
         * boolean which indicates the changes in cache
         */
        get cacheHasChanged() {
          return this.hasChanged;
        }
        /**
         * function to retrieve the token cache
         */
        get tokenCache() {
          return this.cache;
        }
      };
      var ResponseHandler = class _ResponseHandler {
        constructor(clientId, cacheStorage, cryptoObj, logger, serializableCache, persistencePlugin, performanceClient) {
          this.clientId = clientId;
          this.cacheStorage = cacheStorage;
          this.cryptoObj = cryptoObj;
          this.logger = logger;
          this.serializableCache = serializableCache;
          this.persistencePlugin = persistencePlugin;
          this.performanceClient = performanceClient;
        }
        /**
         * Function which validates server authorization token response.
         * @param serverResponse
         * @param refreshAccessToken
         */
        validateTokenResponse(serverResponse, refreshAccessToken) {
          if (serverResponse.error || serverResponse.error_description || serverResponse.suberror) {
            const errString = `Error(s): ${serverResponse.error_codes || Constants.NOT_AVAILABLE} - Timestamp: ${serverResponse.timestamp || Constants.NOT_AVAILABLE} - Description: ${serverResponse.error_description || Constants.NOT_AVAILABLE} - Correlation ID: ${serverResponse.correlation_id || Constants.NOT_AVAILABLE} - Trace ID: ${serverResponse.trace_id || Constants.NOT_AVAILABLE}`;
            const serverErrorNo = serverResponse.error_codes?.length ? serverResponse.error_codes[0] : void 0;
            const serverError = new ServerError(serverResponse.error, errString, serverResponse.suberror, serverErrorNo, serverResponse.status);
            if (refreshAccessToken && serverResponse.status && serverResponse.status >= HttpStatus.SERVER_ERROR_RANGE_START && serverResponse.status <= HttpStatus.SERVER_ERROR_RANGE_END) {
              this.logger.warning(`executeTokenRequest:validateTokenResponse - AAD is currently unavailable and the access token is unable to be refreshed.
${serverError}`);
              return;
            } else if (refreshAccessToken && serverResponse.status && serverResponse.status >= HttpStatus.CLIENT_ERROR_RANGE_START && serverResponse.status <= HttpStatus.CLIENT_ERROR_RANGE_END) {
              this.logger.warning(`executeTokenRequest:validateTokenResponse - AAD is currently available but is unable to refresh the access token.
${serverError}`);
              return;
            }
            if (isInteractionRequiredError(serverResponse.error, serverResponse.error_description, serverResponse.suberror)) {
              throw new InteractionRequiredAuthError(serverResponse.error, serverResponse.error_description, serverResponse.suberror, serverResponse.timestamp || Constants.EMPTY_STRING, serverResponse.trace_id || Constants.EMPTY_STRING, serverResponse.correlation_id || Constants.EMPTY_STRING, serverResponse.claims || Constants.EMPTY_STRING, serverErrorNo);
            }
            throw serverError;
          }
        }
        /**
         * Returns a constructed token response based on given string. Also manages the cache updates and cleanups.
         * @param serverTokenResponse
         * @param authority
         */
        async handleServerTokenResponse(serverTokenResponse, authority, reqTimestamp, request, authCodePayload, userAssertionHash, handlingRefreshTokenResponse, forceCacheRefreshTokenResponse, serverRequestId) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.HandleServerTokenResponse, serverTokenResponse.correlation_id);
          let idTokenClaims;
          if (serverTokenResponse.id_token) {
            idTokenClaims = extractTokenClaims(serverTokenResponse.id_token || Constants.EMPTY_STRING, this.cryptoObj.base64Decode);
            if (authCodePayload && authCodePayload.nonce) {
              if (idTokenClaims.nonce !== authCodePayload.nonce) {
                throw createClientAuthError(nonceMismatch);
              }
            }
            if (request.maxAge || request.maxAge === 0) {
              const authTime = idTokenClaims.auth_time;
              if (!authTime) {
                throw createClientAuthError(authTimeNotFound);
              }
              checkMaxAge(authTime, request.maxAge);
            }
          }
          this.homeAccountIdentifier = AccountEntity.generateHomeAccountId(serverTokenResponse.client_info || Constants.EMPTY_STRING, authority.authorityType, this.logger, this.cryptoObj, idTokenClaims);
          let requestStateObj;
          if (!!authCodePayload && !!authCodePayload.state) {
            requestStateObj = ProtocolUtils.parseRequestState(this.cryptoObj, authCodePayload.state);
          }
          serverTokenResponse.key_id = serverTokenResponse.key_id || request.sshKid || void 0;
          const cacheRecord = this.generateCacheRecord(serverTokenResponse, authority, reqTimestamp, request, idTokenClaims, userAssertionHash, authCodePayload);
          let cacheContext;
          try {
            if (this.persistencePlugin && this.serializableCache) {
              this.logger.verbose("Persistence enabled, calling beforeCacheAccess");
              cacheContext = new TokenCacheContext(this.serializableCache, true);
              await this.persistencePlugin.beforeCacheAccess(cacheContext);
            }
            if (handlingRefreshTokenResponse && !forceCacheRefreshTokenResponse && cacheRecord.account) {
              const key = this.cacheStorage.generateAccountKey(cacheRecord.account.getAccountInfo());
              const account2 = this.cacheStorage.getAccount(key, request.correlationId);
              if (!account2) {
                this.logger.warning("Account used to refresh tokens not in persistence, refreshed tokens will not be stored in the cache");
                return await _ResponseHandler.generateAuthenticationResult(this.cryptoObj, authority, cacheRecord, false, request, idTokenClaims, requestStateObj, void 0, serverRequestId);
              }
            }
            await this.cacheStorage.saveCacheRecord(cacheRecord, request.correlationId, request.storeInCache);
          } finally {
            if (this.persistencePlugin && this.serializableCache && cacheContext) {
              this.logger.verbose("Persistence enabled, calling afterCacheAccess");
              await this.persistencePlugin.afterCacheAccess(cacheContext);
            }
          }
          return _ResponseHandler.generateAuthenticationResult(this.cryptoObj, authority, cacheRecord, false, request, idTokenClaims, requestStateObj, serverTokenResponse, serverRequestId);
        }
        /**
         * Generates CacheRecord
         * @param serverTokenResponse
         * @param idTokenObj
         * @param authority
         */
        generateCacheRecord(serverTokenResponse, authority, reqTimestamp, request, idTokenClaims, userAssertionHash, authCodePayload) {
          const env = authority.getPreferredCache();
          if (!env) {
            throw createClientAuthError(invalidCacheEnvironment);
          }
          const claimsTenantId = getTenantIdFromIdTokenClaims(idTokenClaims);
          let cachedIdToken;
          let cachedAccount;
          if (serverTokenResponse.id_token && !!idTokenClaims) {
            cachedIdToken = createIdTokenEntity(this.homeAccountIdentifier, env, serverTokenResponse.id_token, this.clientId, claimsTenantId || "");
            cachedAccount = buildAccountToCache(
              this.cacheStorage,
              authority,
              this.homeAccountIdentifier,
              this.cryptoObj.base64Decode,
              request.correlationId,
              idTokenClaims,
              serverTokenResponse.client_info,
              env,
              claimsTenantId,
              authCodePayload,
              void 0,
              // nativeAccountId
              this.logger
            );
          }
          let cachedAccessToken = null;
          if (serverTokenResponse.access_token) {
            const responseScopes = serverTokenResponse.scope ? ScopeSet.fromString(serverTokenResponse.scope) : new ScopeSet(request.scopes || []);
            const expiresIn = (typeof serverTokenResponse.expires_in === "string" ? parseInt(serverTokenResponse.expires_in, 10) : serverTokenResponse.expires_in) || 0;
            const extExpiresIn = (typeof serverTokenResponse.ext_expires_in === "string" ? parseInt(serverTokenResponse.ext_expires_in, 10) : serverTokenResponse.ext_expires_in) || 0;
            const refreshIn = (typeof serverTokenResponse.refresh_in === "string" ? parseInt(serverTokenResponse.refresh_in, 10) : serverTokenResponse.refresh_in) || void 0;
            const tokenExpirationSeconds = reqTimestamp + expiresIn;
            const extendedTokenExpirationSeconds = tokenExpirationSeconds + extExpiresIn;
            const refreshOnSeconds = refreshIn && refreshIn > 0 ? reqTimestamp + refreshIn : void 0;
            cachedAccessToken = createAccessTokenEntity(this.homeAccountIdentifier, env, serverTokenResponse.access_token, this.clientId, claimsTenantId || authority.tenant || "", responseScopes.printScopes(), tokenExpirationSeconds, extendedTokenExpirationSeconds, this.cryptoObj.base64Decode, refreshOnSeconds, serverTokenResponse.token_type, userAssertionHash, serverTokenResponse.key_id, request.claims, request.requestedClaimsHash);
          }
          let cachedRefreshToken = null;
          if (serverTokenResponse.refresh_token) {
            let rtExpiresOn;
            if (serverTokenResponse.refresh_token_expires_in) {
              const rtExpiresIn = typeof serverTokenResponse.refresh_token_expires_in === "string" ? parseInt(serverTokenResponse.refresh_token_expires_in, 10) : serverTokenResponse.refresh_token_expires_in;
              rtExpiresOn = reqTimestamp + rtExpiresIn;
            }
            cachedRefreshToken = createRefreshTokenEntity(this.homeAccountIdentifier, env, serverTokenResponse.refresh_token, this.clientId, serverTokenResponse.foci, userAssertionHash, rtExpiresOn);
          }
          let cachedAppMetadata = null;
          if (serverTokenResponse.foci) {
            cachedAppMetadata = {
              clientId: this.clientId,
              environment: env,
              familyId: serverTokenResponse.foci
            };
          }
          return {
            account: cachedAccount,
            idToken: cachedIdToken,
            accessToken: cachedAccessToken,
            refreshToken: cachedRefreshToken,
            appMetadata: cachedAppMetadata
          };
        }
        /**
         * Creates an @AuthenticationResult from @CacheRecord , @IdToken , and a boolean that states whether or not the result is from cache.
         *
         * Optionally takes a state string that is set as-is in the response.
         *
         * @param cacheRecord
         * @param idTokenObj
         * @param fromTokenCache
         * @param stateString
         */
        static async generateAuthenticationResult(cryptoObj, authority, cacheRecord, fromTokenCache, request, idTokenClaims, requestState, serverTokenResponse, requestId) {
          let accessToken = Constants.EMPTY_STRING;
          let responseScopes = [];
          let expiresOn = null;
          let extExpiresOn;
          let refreshOn;
          let familyId = Constants.EMPTY_STRING;
          if (cacheRecord.accessToken) {
            if (cacheRecord.accessToken.tokenType === AuthenticationScheme.POP && !request.popKid) {
              const popTokenGenerator = new PopTokenGenerator(cryptoObj);
              const { secret, keyId } = cacheRecord.accessToken;
              if (!keyId) {
                throw createClientAuthError(keyIdMissing);
              }
              accessToken = await popTokenGenerator.signPopToken(secret, keyId, request);
            } else {
              accessToken = cacheRecord.accessToken.secret;
            }
            responseScopes = ScopeSet.fromString(cacheRecord.accessToken.target).asArray();
            expiresOn = toDateFromSeconds(cacheRecord.accessToken.expiresOn);
            extExpiresOn = toDateFromSeconds(cacheRecord.accessToken.extendedExpiresOn);
            if (cacheRecord.accessToken.refreshOn) {
              refreshOn = toDateFromSeconds(cacheRecord.accessToken.refreshOn);
            }
          }
          if (cacheRecord.appMetadata) {
            familyId = cacheRecord.appMetadata.familyId === THE_FAMILY_ID ? THE_FAMILY_ID : "";
          }
          const uid = idTokenClaims?.oid || idTokenClaims?.sub || "";
          const tid = idTokenClaims?.tid || "";
          if (serverTokenResponse?.spa_accountid && !!cacheRecord.account) {
            cacheRecord.account.nativeAccountId = serverTokenResponse?.spa_accountid;
          }
          const accountInfo = cacheRecord.account ? updateAccountTenantProfileData(
            cacheRecord.account.getAccountInfo(),
            void 0,
            // tenantProfile optional
            idTokenClaims,
            cacheRecord.idToken?.secret
          ) : null;
          return {
            authority: authority.canonicalAuthority,
            uniqueId: uid,
            tenantId: tid,
            scopes: responseScopes,
            account: accountInfo,
            idToken: cacheRecord?.idToken?.secret || "",
            idTokenClaims: idTokenClaims || {},
            accessToken,
            fromCache: fromTokenCache,
            expiresOn,
            extExpiresOn,
            refreshOn,
            correlationId: request.correlationId,
            requestId: requestId || Constants.EMPTY_STRING,
            familyId,
            tokenType: cacheRecord.accessToken?.tokenType || Constants.EMPTY_STRING,
            state: requestState ? requestState.userRequestState : Constants.EMPTY_STRING,
            cloudGraphHostName: cacheRecord.account?.cloudGraphHostName || Constants.EMPTY_STRING,
            msGraphHost: cacheRecord.account?.msGraphHost || Constants.EMPTY_STRING,
            code: serverTokenResponse?.spa_code,
            fromNativeBroker: false
          };
        }
      };
      function buildAccountToCache(cacheStorage, authority, homeAccountId, base64Decode2, correlationId, idTokenClaims, clientInfo, environment, claimsTenantId, authCodePayload, nativeAccountId, logger) {
        logger?.verbose("setCachedAccount called");
        const accountKeys = cacheStorage.getAccountKeys();
        const baseAccountKey = accountKeys.find((accountKey) => {
          return accountKey.startsWith(homeAccountId);
        });
        let cachedAccount = null;
        if (baseAccountKey) {
          cachedAccount = cacheStorage.getAccount(baseAccountKey, correlationId);
        }
        const baseAccount = cachedAccount || AccountEntity.createAccount({
          homeAccountId,
          idTokenClaims,
          clientInfo,
          environment,
          cloudGraphHostName: authCodePayload?.cloud_graph_host_name,
          msGraphHost: authCodePayload?.msgraph_host,
          nativeAccountId
        }, authority, base64Decode2);
        const tenantProfiles = baseAccount.tenantProfiles || [];
        const tenantId = claimsTenantId || baseAccount.realm;
        if (tenantId && !tenantProfiles.find((tenantProfile) => {
          return tenantProfile.tenantId === tenantId;
        })) {
          const newTenantProfile = buildTenantProfile(homeAccountId, baseAccount.localAccountId, tenantId, idTokenClaims);
          tenantProfiles.push(newTenantProfile);
        }
        baseAccount.tenantProfiles = tenantProfiles;
        return baseAccount;
      }
      async function getClientAssertion(clientAssertion, clientId, tokenEndpoint) {
        if (typeof clientAssertion === "string") {
          return clientAssertion;
        } else {
          const config2 = {
            clientId,
            tokenEndpoint
          };
          return clientAssertion(config2);
        }
      }
      var AuthorizationCodeClient = class extends BaseClient {
        constructor(configuration, performanceClient) {
          super(configuration, performanceClient);
          this.includeRedirectUri = true;
          this.oidcDefaultScopes = this.config.authOptions.authority.options.OIDCOptions?.defaultScopes;
        }
        /**
         * API to acquire a token in exchange of 'authorization_code` acquired by the user in the first leg of the
         * authorization_code_grant
         * @param request
         */
        async acquireToken(request, authCodePayload) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.AuthClientAcquireToken, request.correlationId);
          if (!request.code) {
            throw createClientAuthError(requestCannotBeMade);
          }
          const reqTimestamp = nowSeconds();
          const response = await invokeAsync(this.executeTokenRequest.bind(this), PerformanceEvents.AuthClientExecuteTokenRequest, this.logger, this.performanceClient, request.correlationId)(this.authority, request);
          const requestId = response.headers?.[HeaderNames.X_MS_REQUEST_ID];
          const responseHandler = new ResponseHandler(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin, this.performanceClient);
          responseHandler.validateTokenResponse(response.body);
          return invokeAsync(responseHandler.handleServerTokenResponse.bind(responseHandler), PerformanceEvents.HandleServerTokenResponse, this.logger, this.performanceClient, request.correlationId)(response.body, this.authority, reqTimestamp, request, authCodePayload, void 0, void 0, void 0, requestId);
        }
        /**
         * Used to log out the current user, and redirect the user to the postLogoutRedirectUri.
         * Default behaviour is to redirect the user to `window.location.href`.
         * @param authorityUri
         */
        getLogoutUri(logoutRequest) {
          if (!logoutRequest) {
            throw createClientConfigurationError(logoutRequestEmpty);
          }
          const queryString = this.createLogoutUrlQueryString(logoutRequest);
          return UrlString.appendQueryString(this.authority.endSessionEndpoint, queryString);
        }
        /**
         * Executes POST request to token endpoint
         * @param authority
         * @param request
         */
        async executeTokenRequest(authority, request) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.AuthClientExecuteTokenRequest, request.correlationId);
          const queryParametersString = this.createTokenQueryParameters(request);
          const endpoint = UrlString.appendQueryString(authority.tokenEndpoint, queryParametersString);
          const requestBody = await invokeAsync(this.createTokenRequestBody.bind(this), PerformanceEvents.AuthClientCreateTokenRequestBody, this.logger, this.performanceClient, request.correlationId)(request);
          let ccsCredential = void 0;
          if (request.clientInfo) {
            try {
              const clientInfo = buildClientInfo(request.clientInfo, this.cryptoUtils.base64Decode);
              ccsCredential = {
                credential: `${clientInfo.uid}${Separators.CLIENT_INFO_SEPARATOR}${clientInfo.utid}`,
                type: CcsCredentialType.HOME_ACCOUNT_ID
              };
            } catch (e) {
              this.logger.verbose("Could not parse client info for CCS Header: " + e);
            }
          }
          const headers = this.createTokenRequestHeaders(ccsCredential || request.ccsCredential);
          const thumbprint = getRequestThumbprint(this.config.authOptions.clientId, request);
          return invokeAsync(this.executePostToTokenEndpoint.bind(this), PerformanceEvents.AuthorizationCodeClientExecutePostToTokenEndpoint, this.logger, this.performanceClient, request.correlationId)(endpoint, requestBody, headers, thumbprint, request.correlationId, PerformanceEvents.AuthorizationCodeClientExecutePostToTokenEndpoint);
        }
        /**
         * Generates a map for all the params to be sent to the service
         * @param request
         */
        async createTokenRequestBody(request) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.AuthClientCreateTokenRequestBody, request.correlationId);
          const parameters = /* @__PURE__ */ new Map();
          addClientId(parameters, request.embeddedClientId || request.tokenBodyParameters?.[CLIENT_ID] || this.config.authOptions.clientId);
          if (!this.includeRedirectUri) {
            if (!request.redirectUri) {
              throw createClientConfigurationError(redirectUriEmpty);
            }
          } else {
            addRedirectUri(parameters, request.redirectUri);
          }
          addScopes(parameters, request.scopes, true, this.oidcDefaultScopes);
          addAuthorizationCode(parameters, request.code);
          addLibraryInfo(parameters, this.config.libraryInfo);
          addApplicationTelemetry(parameters, this.config.telemetry.application);
          addThrottling(parameters);
          if (this.serverTelemetryManager && !isOidcProtocolMode(this.config)) {
            addServerTelemetry(parameters, this.serverTelemetryManager);
          }
          if (request.codeVerifier) {
            addCodeVerifier(parameters, request.codeVerifier);
          }
          if (this.config.clientCredentials.clientSecret) {
            addClientSecret(parameters, this.config.clientCredentials.clientSecret);
          }
          if (this.config.clientCredentials.clientAssertion) {
            const clientAssertion = this.config.clientCredentials.clientAssertion;
            addClientAssertion(parameters, await getClientAssertion(clientAssertion.assertion, this.config.authOptions.clientId, request.resourceRequestUri));
            addClientAssertionType(parameters, clientAssertion.assertionType);
          }
          addGrantType(parameters, GrantType.AUTHORIZATION_CODE_GRANT);
          addClientInfo(parameters);
          if (request.authenticationScheme === AuthenticationScheme.POP) {
            const popTokenGenerator = new PopTokenGenerator(this.cryptoUtils, this.performanceClient);
            let reqCnfData;
            if (!request.popKid) {
              const generatedReqCnfData = await invokeAsync(popTokenGenerator.generateCnf.bind(popTokenGenerator), PerformanceEvents.PopTokenGenerateCnf, this.logger, this.performanceClient, request.correlationId)(request, this.logger);
              reqCnfData = generatedReqCnfData.reqCnfString;
            } else {
              reqCnfData = this.cryptoUtils.encodeKid(request.popKid);
            }
            addPopToken(parameters, reqCnfData);
          } else if (request.authenticationScheme === AuthenticationScheme.SSH) {
            if (request.sshJwk) {
              addSshJwk(parameters, request.sshJwk);
            } else {
              throw createClientConfigurationError(missingSshJwk);
            }
          }
          if (!StringUtils.isEmptyObj(request.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
            addClaims(parameters, request.claims, this.config.authOptions.clientCapabilities);
          }
          let ccsCred = void 0;
          if (request.clientInfo) {
            try {
              const clientInfo = buildClientInfo(request.clientInfo, this.cryptoUtils.base64Decode);
              ccsCred = {
                credential: `${clientInfo.uid}${Separators.CLIENT_INFO_SEPARATOR}${clientInfo.utid}`,
                type: CcsCredentialType.HOME_ACCOUNT_ID
              };
            } catch (e) {
              this.logger.verbose("Could not parse client info for CCS Header: " + e);
            }
          } else {
            ccsCred = request.ccsCredential;
          }
          if (this.config.systemOptions.preventCorsPreflight && ccsCred) {
            switch (ccsCred.type) {
              case CcsCredentialType.HOME_ACCOUNT_ID:
                try {
                  const clientInfo = buildClientInfoFromHomeAccountId(ccsCred.credential);
                  addCcsOid(parameters, clientInfo);
                } catch (e) {
                  this.logger.verbose("Could not parse home account ID for CCS Header: " + e);
                }
                break;
              case CcsCredentialType.UPN:
                addCcsUpn(parameters, ccsCred.credential);
                break;
            }
          }
          if (request.embeddedClientId) {
            addBrokerParameters(parameters, this.config.authOptions.clientId, this.config.authOptions.redirectUri);
          }
          if (request.tokenBodyParameters) {
            addExtraQueryParameters(parameters, request.tokenBodyParameters);
          }
          if (request.enableSpaAuthorizationCode && (!request.tokenBodyParameters || !request.tokenBodyParameters[RETURN_SPA_CODE])) {
            addExtraQueryParameters(parameters, {
              [RETURN_SPA_CODE]: "1"
            });
          }
          instrumentBrokerParams(parameters, request.correlationId, this.performanceClient);
          return mapToQueryString(parameters);
        }
        /**
         * This API validates the `EndSessionRequest` and creates a URL
         * @param request
         */
        createLogoutUrlQueryString(request) {
          const parameters = /* @__PURE__ */ new Map();
          if (request.postLogoutRedirectUri) {
            addPostLogoutRedirectUri(parameters, request.postLogoutRedirectUri);
          }
          if (request.correlationId) {
            addCorrelationId(parameters, request.correlationId);
          }
          if (request.idTokenHint) {
            addIdTokenHint(parameters, request.idTokenHint);
          }
          if (request.state) {
            addState(parameters, request.state);
          }
          if (request.logoutHint) {
            addLogoutHint(parameters, request.logoutHint);
          }
          if (request.extraQueryParameters) {
            addExtraQueryParameters(parameters, request.extraQueryParameters);
          }
          if (this.config.authOptions.instanceAware) {
            addInstanceAware(parameters);
          }
          return mapToQueryString(parameters, this.config.authOptions.encodeExtraQueryParams, request.extraQueryParameters);
        }
      };
      var DEFAULT_REFRESH_TOKEN_EXPIRATION_OFFSET_SECONDS = 300;
      var RefreshTokenClient = class extends BaseClient {
        constructor(configuration, performanceClient) {
          super(configuration, performanceClient);
        }
        async acquireToken(request) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.RefreshTokenClientAcquireToken, request.correlationId);
          const reqTimestamp = nowSeconds();
          const response = await invokeAsync(this.executeTokenRequest.bind(this), PerformanceEvents.RefreshTokenClientExecuteTokenRequest, this.logger, this.performanceClient, request.correlationId)(request, this.authority);
          const requestId = response.headers?.[HeaderNames.X_MS_REQUEST_ID];
          const responseHandler = new ResponseHandler(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin);
          responseHandler.validateTokenResponse(response.body);
          return invokeAsync(responseHandler.handleServerTokenResponse.bind(responseHandler), PerformanceEvents.HandleServerTokenResponse, this.logger, this.performanceClient, request.correlationId)(response.body, this.authority, reqTimestamp, request, void 0, void 0, true, request.forceCache, requestId);
        }
        /**
         * Gets cached refresh token and attaches to request, then calls acquireToken API
         * @param request
         */
        async acquireTokenByRefreshToken(request) {
          if (!request) {
            throw createClientConfigurationError(tokenRequestEmpty);
          }
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.RefreshTokenClientAcquireTokenByRefreshToken, request.correlationId);
          if (!request.account) {
            throw createClientAuthError(noAccountInSilentRequest);
          }
          const isFOCI = this.cacheManager.isAppMetadataFOCI(request.account.environment);
          if (isFOCI) {
            try {
              return await invokeAsync(this.acquireTokenWithCachedRefreshToken.bind(this), PerformanceEvents.RefreshTokenClientAcquireTokenWithCachedRefreshToken, this.logger, this.performanceClient, request.correlationId)(request, true);
            } catch (e) {
              const noFamilyRTInCache = e instanceof InteractionRequiredAuthError && e.errorCode === noTokensFound;
              const clientMismatchErrorWithFamilyRT = e instanceof ServerError && e.errorCode === Errors.INVALID_GRANT_ERROR && e.subError === Errors.CLIENT_MISMATCH_ERROR;
              if (noFamilyRTInCache || clientMismatchErrorWithFamilyRT) {
                return invokeAsync(this.acquireTokenWithCachedRefreshToken.bind(this), PerformanceEvents.RefreshTokenClientAcquireTokenWithCachedRefreshToken, this.logger, this.performanceClient, request.correlationId)(request, false);
              } else {
                throw e;
              }
            }
          }
          return invokeAsync(this.acquireTokenWithCachedRefreshToken.bind(this), PerformanceEvents.RefreshTokenClientAcquireTokenWithCachedRefreshToken, this.logger, this.performanceClient, request.correlationId)(request, false);
        }
        /**
         * makes a network call to acquire tokens by exchanging RefreshToken available in userCache; throws if refresh token is not cached
         * @param request
         */
        async acquireTokenWithCachedRefreshToken(request, foci) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.RefreshTokenClientAcquireTokenWithCachedRefreshToken, request.correlationId);
          const refreshToken = invoke(this.cacheManager.getRefreshToken.bind(this.cacheManager), PerformanceEvents.CacheManagerGetRefreshToken, this.logger, this.performanceClient, request.correlationId)(request.account, foci, request.correlationId, void 0, this.performanceClient);
          if (!refreshToken) {
            throw createInteractionRequiredAuthError(noTokensFound);
          }
          if (refreshToken.expiresOn && isTokenExpired(refreshToken.expiresOn, request.refreshTokenExpirationOffsetSeconds || DEFAULT_REFRESH_TOKEN_EXPIRATION_OFFSET_SECONDS)) {
            this.performanceClient?.addFields({ rtExpiresOnMs: Number(refreshToken.expiresOn) }, request.correlationId);
            throw createInteractionRequiredAuthError(refreshTokenExpired);
          }
          const refreshTokenRequest = {
            ...request,
            refreshToken: refreshToken.secret,
            authenticationScheme: request.authenticationScheme || AuthenticationScheme.BEARER,
            ccsCredential: {
              credential: request.account.homeAccountId,
              type: CcsCredentialType.HOME_ACCOUNT_ID
            }
          };
          try {
            return await invokeAsync(this.acquireToken.bind(this), PerformanceEvents.RefreshTokenClientAcquireToken, this.logger, this.performanceClient, request.correlationId)(refreshTokenRequest);
          } catch (e) {
            if (e instanceof InteractionRequiredAuthError) {
              this.performanceClient?.addFields({ rtExpiresOnMs: Number(refreshToken.expiresOn) }, request.correlationId);
              if (e.subError === badToken) {
                this.logger.verbose("acquireTokenWithRefreshToken: bad refresh token, removing from cache");
                const badRefreshTokenKey = this.cacheManager.generateCredentialKey(refreshToken);
                this.cacheManager.removeRefreshToken(badRefreshTokenKey, request.correlationId);
              }
            }
            throw e;
          }
        }
        /**
         * Constructs the network message and makes a NW call to the underlying secure token service
         * @param request
         * @param authority
         */
        async executeTokenRequest(request, authority) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.RefreshTokenClientExecuteTokenRequest, request.correlationId);
          const queryParametersString = this.createTokenQueryParameters(request);
          const endpoint = UrlString.appendQueryString(authority.tokenEndpoint, queryParametersString);
          const requestBody = await invokeAsync(this.createTokenRequestBody.bind(this), PerformanceEvents.RefreshTokenClientCreateTokenRequestBody, this.logger, this.performanceClient, request.correlationId)(request);
          const headers = this.createTokenRequestHeaders(request.ccsCredential);
          const thumbprint = getRequestThumbprint(this.config.authOptions.clientId, request);
          return invokeAsync(this.executePostToTokenEndpoint.bind(this), PerformanceEvents.RefreshTokenClientExecutePostToTokenEndpoint, this.logger, this.performanceClient, request.correlationId)(endpoint, requestBody, headers, thumbprint, request.correlationId, PerformanceEvents.RefreshTokenClientExecutePostToTokenEndpoint);
        }
        /**
         * Helper function to create the token request body
         * @param request
         */
        async createTokenRequestBody(request) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.RefreshTokenClientCreateTokenRequestBody, request.correlationId);
          const parameters = /* @__PURE__ */ new Map();
          addClientId(parameters, request.embeddedClientId || request.tokenBodyParameters?.[CLIENT_ID] || this.config.authOptions.clientId);
          if (request.redirectUri) {
            addRedirectUri(parameters, request.redirectUri);
          }
          addScopes(parameters, request.scopes, true, this.config.authOptions.authority.options.OIDCOptions?.defaultScopes);
          addGrantType(parameters, GrantType.REFRESH_TOKEN_GRANT);
          addClientInfo(parameters);
          addLibraryInfo(parameters, this.config.libraryInfo);
          addApplicationTelemetry(parameters, this.config.telemetry.application);
          addThrottling(parameters);
          if (this.serverTelemetryManager && !isOidcProtocolMode(this.config)) {
            addServerTelemetry(parameters, this.serverTelemetryManager);
          }
          addRefreshToken(parameters, request.refreshToken);
          if (this.config.clientCredentials.clientSecret) {
            addClientSecret(parameters, this.config.clientCredentials.clientSecret);
          }
          if (this.config.clientCredentials.clientAssertion) {
            const clientAssertion = this.config.clientCredentials.clientAssertion;
            addClientAssertion(parameters, await getClientAssertion(clientAssertion.assertion, this.config.authOptions.clientId, request.resourceRequestUri));
            addClientAssertionType(parameters, clientAssertion.assertionType);
          }
          if (request.authenticationScheme === AuthenticationScheme.POP) {
            const popTokenGenerator = new PopTokenGenerator(this.cryptoUtils, this.performanceClient);
            let reqCnfData;
            if (!request.popKid) {
              const generatedReqCnfData = await invokeAsync(popTokenGenerator.generateCnf.bind(popTokenGenerator), PerformanceEvents.PopTokenGenerateCnf, this.logger, this.performanceClient, request.correlationId)(request, this.logger);
              reqCnfData = generatedReqCnfData.reqCnfString;
            } else {
              reqCnfData = this.cryptoUtils.encodeKid(request.popKid);
            }
            addPopToken(parameters, reqCnfData);
          } else if (request.authenticationScheme === AuthenticationScheme.SSH) {
            if (request.sshJwk) {
              addSshJwk(parameters, request.sshJwk);
            } else {
              throw createClientConfigurationError(missingSshJwk);
            }
          }
          if (!StringUtils.isEmptyObj(request.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
            addClaims(parameters, request.claims, this.config.authOptions.clientCapabilities);
          }
          if (this.config.systemOptions.preventCorsPreflight && request.ccsCredential) {
            switch (request.ccsCredential.type) {
              case CcsCredentialType.HOME_ACCOUNT_ID:
                try {
                  const clientInfo = buildClientInfoFromHomeAccountId(request.ccsCredential.credential);
                  addCcsOid(parameters, clientInfo);
                } catch (e) {
                  this.logger.verbose("Could not parse home account ID for CCS Header: " + e);
                }
                break;
              case CcsCredentialType.UPN:
                addCcsUpn(parameters, request.ccsCredential.credential);
                break;
            }
          }
          if (request.embeddedClientId) {
            addBrokerParameters(parameters, this.config.authOptions.clientId, this.config.authOptions.redirectUri);
          }
          if (request.tokenBodyParameters) {
            addExtraQueryParameters(parameters, request.tokenBodyParameters);
          }
          instrumentBrokerParams(parameters, request.correlationId, this.performanceClient);
          return mapToQueryString(parameters);
        }
      };
      var SilentFlowClient = class extends BaseClient {
        constructor(configuration, performanceClient) {
          super(configuration, performanceClient);
        }
        /**
         * Retrieves token from cache or throws an error if it must be refreshed.
         * @param request
         */
        async acquireCachedToken(request) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.SilentFlowClientAcquireCachedToken, request.correlationId);
          let lastCacheOutcome = CacheOutcome.NOT_APPLICABLE;
          if (request.forceRefresh || !this.config.cacheOptions.claimsBasedCachingEnabled && !StringUtils.isEmptyObj(request.claims)) {
            this.setCacheOutcome(CacheOutcome.FORCE_REFRESH_OR_CLAIMS, request.correlationId);
            throw createClientAuthError(tokenRefreshRequired);
          }
          if (!request.account) {
            throw createClientAuthError(noAccountInSilentRequest);
          }
          const requestTenantId = request.account.tenantId || getTenantFromAuthorityString(request.authority);
          const tokenKeys = this.cacheManager.getTokenKeys();
          const cachedAccessToken = this.cacheManager.getAccessToken(request.account, request, tokenKeys, requestTenantId);
          if (!cachedAccessToken) {
            this.setCacheOutcome(CacheOutcome.NO_CACHED_ACCESS_TOKEN, request.correlationId);
            throw createClientAuthError(tokenRefreshRequired);
          } else if (wasClockTurnedBack(cachedAccessToken.cachedAt) || isTokenExpired(cachedAccessToken.expiresOn, this.config.systemOptions.tokenRenewalOffsetSeconds)) {
            this.setCacheOutcome(CacheOutcome.CACHED_ACCESS_TOKEN_EXPIRED, request.correlationId);
            throw createClientAuthError(tokenRefreshRequired);
          } else if (cachedAccessToken.refreshOn && isTokenExpired(cachedAccessToken.refreshOn, 0)) {
            lastCacheOutcome = CacheOutcome.PROACTIVELY_REFRESHED;
          }
          const environment = request.authority || this.authority.getPreferredCache();
          const cacheRecord = {
            account: this.cacheManager.getAccount(this.cacheManager.generateAccountKey(request.account), request.correlationId),
            accessToken: cachedAccessToken,
            idToken: this.cacheManager.getIdToken(request.account, request.correlationId, tokenKeys, requestTenantId, this.performanceClient),
            refreshToken: null,
            appMetadata: this.cacheManager.readAppMetadataFromCache(environment)
          };
          this.setCacheOutcome(lastCacheOutcome, request.correlationId);
          if (this.config.serverTelemetryManager) {
            this.config.serverTelemetryManager.incrementCacheHits();
          }
          return [
            await invokeAsync(this.generateResultFromCacheRecord.bind(this), PerformanceEvents.SilentFlowClientGenerateResultFromCacheRecord, this.logger, this.performanceClient, request.correlationId)(cacheRecord, request),
            lastCacheOutcome
          ];
        }
        setCacheOutcome(cacheOutcome, correlationId) {
          this.serverTelemetryManager?.setCacheOutcome(cacheOutcome);
          this.performanceClient?.addFields({
            cacheOutcome
          }, correlationId);
          if (cacheOutcome !== CacheOutcome.NOT_APPLICABLE) {
            this.logger.info(`Token refresh is required due to cache outcome: ${cacheOutcome}`);
          }
        }
        /**
         * Helper function to build response object from the CacheRecord
         * @param cacheRecord
         */
        async generateResultFromCacheRecord(cacheRecord, request) {
          this.performanceClient?.addQueueMeasurement(PerformanceEvents.SilentFlowClientGenerateResultFromCacheRecord, request.correlationId);
          let idTokenClaims;
          if (cacheRecord.idToken) {
            idTokenClaims = extractTokenClaims(cacheRecord.idToken.secret, this.config.cryptoInterface.base64Decode);
          }
          if (request.maxAge || request.maxAge === 0) {
            const authTime = idTokenClaims?.auth_time;
            if (!authTime) {
              throw createClientAuthError(authTimeNotFound);
            }
            checkMaxAge(authTime, request.maxAge);
          }
          return ResponseHandler.generateAuthenticationResult(this.cryptoUtils, this.authority, cacheRecord, true, request, idTokenClaims);
        }
      };
      var StubbedNetworkModule = {
        sendGetRequestAsync: () => {
          return Promise.reject(createClientAuthError(methodNotImplemented));
        },
        sendPostRequestAsync: () => {
          return Promise.reject(createClientAuthError(methodNotImplemented));
        }
      };
      function getStandardAuthorizeRequestParameters(authOptions, request, logger, performanceClient) {
        const correlationId = request.correlationId;
        const parameters = /* @__PURE__ */ new Map();
        addClientId(parameters, request.embeddedClientId || request.extraQueryParameters?.[CLIENT_ID] || authOptions.clientId);
        const requestScopes = [
          ...request.scopes || [],
          ...request.extraScopesToConsent || []
        ];
        addScopes(parameters, requestScopes, true, authOptions.authority.options.OIDCOptions?.defaultScopes);
        addRedirectUri(parameters, request.redirectUri);
        addCorrelationId(parameters, correlationId);
        addResponseMode(parameters, request.responseMode);
        addClientInfo(parameters);
        if (request.prompt) {
          addPrompt(parameters, request.prompt);
          performanceClient?.addFields({ prompt: request.prompt }, correlationId);
        }
        if (request.domainHint) {
          addDomainHint(parameters, request.domainHint);
          performanceClient?.addFields({ domainHintFromRequest: true }, correlationId);
        }
        if (request.prompt !== PromptValue.SELECT_ACCOUNT) {
          if (request.sid && request.prompt === PromptValue.NONE) {
            logger.verbose("createAuthCodeUrlQueryString: Prompt is none, adding sid from request");
            addSid(parameters, request.sid);
            performanceClient?.addFields({ sidFromRequest: true }, correlationId);
          } else if (request.account) {
            const accountSid = extractAccountSid(request.account);
            let accountLoginHintClaim = extractLoginHint(request.account);
            if (accountLoginHintClaim && request.domainHint) {
              logger.warning(`AuthorizationCodeClient.createAuthCodeUrlQueryString: "domainHint" param is set, skipping opaque "login_hint" claim. Please consider not passing domainHint`);
              accountLoginHintClaim = null;
            }
            if (accountLoginHintClaim) {
              logger.verbose("createAuthCodeUrlQueryString: login_hint claim present on account");
              addLoginHint(parameters, accountLoginHintClaim);
              performanceClient?.addFields({ loginHintFromClaim: true }, correlationId);
              try {
                const clientInfo = buildClientInfoFromHomeAccountId(request.account.homeAccountId);
                addCcsOid(parameters, clientInfo);
              } catch (e) {
                logger.verbose("createAuthCodeUrlQueryString: Could not parse home account ID for CCS Header");
              }
            } else if (accountSid && request.prompt === PromptValue.NONE) {
              logger.verbose("createAuthCodeUrlQueryString: Prompt is none, adding sid from account");
              addSid(parameters, accountSid);
              performanceClient?.addFields({ sidFromClaim: true }, correlationId);
              try {
                const clientInfo = buildClientInfoFromHomeAccountId(request.account.homeAccountId);
                addCcsOid(parameters, clientInfo);
              } catch (e) {
                logger.verbose("createAuthCodeUrlQueryString: Could not parse home account ID for CCS Header");
              }
            } else if (request.loginHint) {
              logger.verbose("createAuthCodeUrlQueryString: Adding login_hint from request");
              addLoginHint(parameters, request.loginHint);
              addCcsUpn(parameters, request.loginHint);
              performanceClient?.addFields({ loginHintFromRequest: true }, correlationId);
            } else if (request.account.username) {
              logger.verbose("createAuthCodeUrlQueryString: Adding login_hint from account");
              addLoginHint(parameters, request.account.username);
              performanceClient?.addFields({ loginHintFromUpn: true }, correlationId);
              try {
                const clientInfo = buildClientInfoFromHomeAccountId(request.account.homeAccountId);
                addCcsOid(parameters, clientInfo);
              } catch (e) {
                logger.verbose("createAuthCodeUrlQueryString: Could not parse home account ID for CCS Header");
              }
            }
          } else if (request.loginHint) {
            logger.verbose("createAuthCodeUrlQueryString: No account, adding login_hint from request");
            addLoginHint(parameters, request.loginHint);
            addCcsUpn(parameters, request.loginHint);
            performanceClient?.addFields({ loginHintFromRequest: true }, correlationId);
          }
        } else {
          logger.verbose("createAuthCodeUrlQueryString: Prompt is select_account, ignoring account hints");
        }
        if (request.nonce) {
          addNonce(parameters, request.nonce);
        }
        if (request.state) {
          addState(parameters, request.state);
        }
        if (request.claims || authOptions.clientCapabilities && authOptions.clientCapabilities.length > 0) {
          addClaims(parameters, request.claims, authOptions.clientCapabilities);
        }
        if (request.embeddedClientId) {
          addBrokerParameters(parameters, authOptions.clientId, authOptions.redirectUri);
        }
        if (authOptions.instanceAware && (!request.extraQueryParameters || !Object.keys(request.extraQueryParameters).includes(INSTANCE_AWARE))) {
          addInstanceAware(parameters);
        }
        return parameters;
      }
      function getAuthorizeUrl(authority, requestParameters, encodeParams, extraQueryParameters) {
        const queryString = mapToQueryString(requestParameters, encodeParams, extraQueryParameters);
        return UrlString.appendQueryString(authority.authorizationEndpoint, queryString);
      }
      function getAuthorizationCodePayload(serverParams, cachedState) {
        validateAuthorizationResponse(serverParams, cachedState);
        if (!serverParams.code) {
          throw createClientAuthError(authorizationCodeMissingFromServerResponse);
        }
        return serverParams;
      }
      function validateAuthorizationResponse(serverResponse, requestState) {
        if (!serverResponse.state || !requestState) {
          throw serverResponse.state ? createClientAuthError(stateNotFound, "Cached State") : createClientAuthError(stateNotFound, "Server State");
        }
        let decodedServerResponseState;
        let decodedRequestState;
        try {
          decodedServerResponseState = decodeURIComponent(serverResponse.state);
        } catch (e) {
          throw createClientAuthError(invalidState, serverResponse.state);
        }
        try {
          decodedRequestState = decodeURIComponent(requestState);
        } catch (e) {
          throw createClientAuthError(invalidState, serverResponse.state);
        }
        if (decodedServerResponseState !== decodedRequestState) {
          throw createClientAuthError(stateMismatch);
        }
        if (serverResponse.error || serverResponse.error_description || serverResponse.suberror) {
          const serverErrorNo = parseServerErrorNo(serverResponse);
          if (isInteractionRequiredError(serverResponse.error, serverResponse.error_description, serverResponse.suberror)) {
            throw new InteractionRequiredAuthError(serverResponse.error || "", serverResponse.error_description, serverResponse.suberror, serverResponse.timestamp || "", serverResponse.trace_id || "", serverResponse.correlation_id || "", serverResponse.claims || "", serverErrorNo);
          }
          throw new ServerError(serverResponse.error || "", serverResponse.error_description, serverResponse.suberror, serverErrorNo);
        }
      }
      function parseServerErrorNo(serverResponse) {
        const errorCodePrefix = "code=";
        const errorCodePrefixIndex = serverResponse.error_uri?.lastIndexOf(errorCodePrefix);
        return errorCodePrefixIndex && errorCodePrefixIndex >= 0 ? serverResponse.error_uri?.substring(errorCodePrefixIndex + errorCodePrefix.length) : void 0;
      }
      function extractAccountSid(account2) {
        return account2.idTokenClaims?.sid || null;
      }
      function extractLoginHint(account2) {
        return account2.loginHint || account2.idTokenClaims?.login_hint || null;
      }
      var AuthenticationHeaderParser = class {
        constructor(headers) {
          this.headers = headers;
        }
        /**
         * This method parses the SHR nonce value out of either the Authentication-Info or WWW-Authenticate authentication headers.
         * @returns
         */
        getShrNonce() {
          const authenticationInfo = this.headers[HeaderNames.AuthenticationInfo];
          if (authenticationInfo) {
            const authenticationInfoChallenges = this.parseChallenges(authenticationInfo);
            if (authenticationInfoChallenges.nextnonce) {
              return authenticationInfoChallenges.nextnonce;
            }
            throw createClientConfigurationError(invalidAuthenticationHeader);
          }
          const wwwAuthenticate = this.headers[HeaderNames.WWWAuthenticate];
          if (wwwAuthenticate) {
            const wwwAuthenticateChallenges = this.parseChallenges(wwwAuthenticate);
            if (wwwAuthenticateChallenges.nonce) {
              return wwwAuthenticateChallenges.nonce;
            }
            throw createClientConfigurationError(invalidAuthenticationHeader);
          }
          throw createClientConfigurationError(missingNonceAuthenticationHeader);
        }
        /**
         * Parses an HTTP header's challenge set into a key/value map.
         * @param header
         * @returns
         */
        parseChallenges(header) {
          const schemeSeparator = header.indexOf(" ");
          const challenges = header.substr(schemeSeparator + 1).split(",");
          const challengeMap = {};
          challenges.forEach((challenge) => {
            const [key, value] = challenge.split("=");
            challengeMap[key] = unescape(value.replace(/['"]+/g, Constants.EMPTY_STRING));
          });
          return challengeMap;
        }
      };
      var skuGroupSeparator = ",";
      var skuValueSeparator = "|";
      function makeExtraSkuString(params) {
        const { skus, libraryName, libraryVersion, extensionName, extensionVersion } = params;
        const skuMap = /* @__PURE__ */ new Map([
          [0, [libraryName, libraryVersion]],
          [2, [extensionName, extensionVersion]]
        ]);
        let skuArr = [];
        if (skus?.length) {
          skuArr = skus.split(skuGroupSeparator);
          if (skuArr.length < 4) {
            return skus;
          }
        } else {
          skuArr = Array.from({ length: 4 }, () => skuValueSeparator);
        }
        skuMap.forEach((value, key) => {
          if (value.length === 2 && value[0]?.length && value[1]?.length) {
            setSku({
              skuArr,
              index: key,
              skuName: value[0],
              skuVersion: value[1]
            });
          }
        });
        return skuArr.join(skuGroupSeparator);
      }
      function setSku(params) {
        const { skuArr, index, skuName, skuVersion } = params;
        if (index >= skuArr.length) {
          return;
        }
        skuArr[index] = [skuName, skuVersion].join(skuValueSeparator);
      }
      var ServerTelemetryManager = class _ServerTelemetryManager {
        constructor(telemetryRequest, cacheManager) {
          this.cacheOutcome = CacheOutcome.NOT_APPLICABLE;
          this.cacheManager = cacheManager;
          this.apiId = telemetryRequest.apiId;
          this.correlationId = telemetryRequest.correlationId;
          this.wrapperSKU = telemetryRequest.wrapperSKU || Constants.EMPTY_STRING;
          this.wrapperVer = telemetryRequest.wrapperVer || Constants.EMPTY_STRING;
          this.telemetryCacheKey = SERVER_TELEM_CONSTANTS.CACHE_KEY + Separators.CACHE_KEY_SEPARATOR + telemetryRequest.clientId;
        }
        /**
         * API to add MSER Telemetry to request
         */
        generateCurrentRequestHeaderValue() {
          const request = `${this.apiId}${SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR}${this.cacheOutcome}`;
          const platformFieldsArr = [this.wrapperSKU, this.wrapperVer];
          const nativeBrokerErrorCode = this.getNativeBrokerErrorCode();
          if (nativeBrokerErrorCode?.length) {
            platformFieldsArr.push(`broker_error=${nativeBrokerErrorCode}`);
          }
          const platformFields = platformFieldsArr.join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
          const regionDiscoveryFields = this.getRegionDiscoveryFields();
          const requestWithRegionDiscoveryFields = [
            request,
            regionDiscoveryFields
          ].join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
          return [
            SERVER_TELEM_CONSTANTS.SCHEMA_VERSION,
            requestWithRegionDiscoveryFields,
            platformFields
          ].join(SERVER_TELEM_CONSTANTS.CATEGORY_SEPARATOR);
        }
        /**
         * API to add MSER Telemetry for the last failed request
         */
        generateLastRequestHeaderValue() {
          const lastRequests = this.getLastRequests();
          const maxErrors = _ServerTelemetryManager.maxErrorsToSend(lastRequests);
          const failedRequests = lastRequests.failedRequests.slice(0, 2 * maxErrors).join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
          const errors = lastRequests.errors.slice(0, maxErrors).join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
          const errorCount = lastRequests.errors.length;
          const overflow = maxErrors < errorCount ? SERVER_TELEM_CONSTANTS.OVERFLOW_TRUE : SERVER_TELEM_CONSTANTS.OVERFLOW_FALSE;
          const platformFields = [errorCount, overflow].join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
          return [
            SERVER_TELEM_CONSTANTS.SCHEMA_VERSION,
            lastRequests.cacheHits,
            failedRequests,
            errors,
            platformFields
          ].join(SERVER_TELEM_CONSTANTS.CATEGORY_SEPARATOR);
        }
        /**
         * API to cache token failures for MSER data capture
         * @param error
         */
        cacheFailedRequest(error) {
          const lastRequests = this.getLastRequests();
          if (lastRequests.errors.length >= SERVER_TELEM_CONSTANTS.MAX_CACHED_ERRORS) {
            lastRequests.failedRequests.shift();
            lastRequests.failedRequests.shift();
            lastRequests.errors.shift();
          }
          lastRequests.failedRequests.push(this.apiId, this.correlationId);
          if (error instanceof Error && !!error && error.toString()) {
            if (error instanceof AuthError) {
              if (error.subError) {
                lastRequests.errors.push(error.subError);
              } else if (error.errorCode) {
                lastRequests.errors.push(error.errorCode);
              } else {
                lastRequests.errors.push(error.toString());
              }
            } else {
              lastRequests.errors.push(error.toString());
            }
          } else {
            lastRequests.errors.push(SERVER_TELEM_CONSTANTS.UNKNOWN_ERROR);
          }
          this.cacheManager.setServerTelemetry(this.telemetryCacheKey, lastRequests, this.correlationId);
          return;
        }
        /**
         * Update server telemetry cache entry by incrementing cache hit counter
         */
        incrementCacheHits() {
          const lastRequests = this.getLastRequests();
          lastRequests.cacheHits += 1;
          this.cacheManager.setServerTelemetry(this.telemetryCacheKey, lastRequests, this.correlationId);
          return lastRequests.cacheHits;
        }
        /**
         * Get the server telemetry entity from cache or initialize a new one
         */
        getLastRequests() {
          const initialValue = {
            failedRequests: [],
            errors: [],
            cacheHits: 0
          };
          const lastRequests = this.cacheManager.getServerTelemetry(this.telemetryCacheKey);
          return lastRequests || initialValue;
        }
        /**
         * Remove server telemetry cache entry
         */
        clearTelemetryCache() {
          const lastRequests = this.getLastRequests();
          const numErrorsFlushed = _ServerTelemetryManager.maxErrorsToSend(lastRequests);
          const errorCount = lastRequests.errors.length;
          if (numErrorsFlushed === errorCount) {
            this.cacheManager.removeItem(this.telemetryCacheKey, this.correlationId);
          } else {
            const serverTelemEntity = {
              failedRequests: lastRequests.failedRequests.slice(numErrorsFlushed * 2),
              errors: lastRequests.errors.slice(numErrorsFlushed),
              cacheHits: 0
            };
            this.cacheManager.setServerTelemetry(this.telemetryCacheKey, serverTelemEntity, this.correlationId);
          }
        }
        /**
         * Returns the maximum number of errors that can be flushed to the server in the next network request
         * @param serverTelemetryEntity
         */
        static maxErrorsToSend(serverTelemetryEntity) {
          let i;
          let maxErrors = 0;
          let dataSize = 0;
          const errorCount = serverTelemetryEntity.errors.length;
          for (i = 0; i < errorCount; i++) {
            const apiId = serverTelemetryEntity.failedRequests[2 * i] || Constants.EMPTY_STRING;
            const correlationId = serverTelemetryEntity.failedRequests[2 * i + 1] || Constants.EMPTY_STRING;
            const errorCode = serverTelemetryEntity.errors[i] || Constants.EMPTY_STRING;
            dataSize += apiId.toString().length + correlationId.toString().length + errorCode.length + 3;
            if (dataSize < SERVER_TELEM_CONSTANTS.MAX_LAST_HEADER_BYTES) {
              maxErrors += 1;
            } else {
              break;
            }
          }
          return maxErrors;
        }
        /**
         * Get the region discovery fields
         *
         * @returns string
         */
        getRegionDiscoveryFields() {
          const regionDiscoveryFields = [];
          regionDiscoveryFields.push(this.regionUsed || Constants.EMPTY_STRING);
          regionDiscoveryFields.push(this.regionSource || Constants.EMPTY_STRING);
          regionDiscoveryFields.push(this.regionOutcome || Constants.EMPTY_STRING);
          return regionDiscoveryFields.join(",");
        }
        /**
         * Update the region discovery metadata
         *
         * @param regionDiscoveryMetadata
         * @returns void
         */
        updateRegionDiscoveryMetadata(regionDiscoveryMetadata) {
          this.regionUsed = regionDiscoveryMetadata.region_used;
          this.regionSource = regionDiscoveryMetadata.region_source;
          this.regionOutcome = regionDiscoveryMetadata.region_outcome;
        }
        /**
         * Set cache outcome
         */
        setCacheOutcome(cacheOutcome) {
          this.cacheOutcome = cacheOutcome;
        }
        setNativeBrokerErrorCode(errorCode) {
          const lastRequests = this.getLastRequests();
          lastRequests.nativeBrokerErrorCode = errorCode;
          this.cacheManager.setServerTelemetry(this.telemetryCacheKey, lastRequests, this.correlationId);
        }
        getNativeBrokerErrorCode() {
          return this.getLastRequests().nativeBrokerErrorCode;
        }
        clearNativeBrokerErrorCode() {
          const lastRequests = this.getLastRequests();
          delete lastRequests.nativeBrokerErrorCode;
          this.cacheManager.setServerTelemetry(this.telemetryCacheKey, lastRequests, this.correlationId);
        }
        static makeExtraSkuString(params) {
          return makeExtraSkuString(params);
        }
      };
      var missingKidError = "missing_kid_error";
      var missingAlgError = "missing_alg_error";
      var JoseHeaderErrorMessages = {
        [missingKidError]: "The JOSE Header for the requested JWT, JWS or JWK object requires a keyId to be configured as the 'kid' header claim. No 'kid' value was provided.",
        [missingAlgError]: "The JOSE Header for the requested JWT, JWS or JWK object requires an algorithm to be specified as the 'alg' header claim. No 'alg' value was provided."
      };
      var JoseHeaderError = class _JoseHeaderError extends AuthError {
        constructor(errorCode, errorMessage) {
          super(errorCode, errorMessage);
          this.name = "JoseHeaderError";
          Object.setPrototypeOf(this, _JoseHeaderError.prototype);
        }
      };
      function createJoseHeaderError(code) {
        return new JoseHeaderError(code, JoseHeaderErrorMessages[code]);
      }
      var JoseHeader = class _JoseHeader {
        constructor(options) {
          this.typ = options.typ;
          this.alg = options.alg;
          this.kid = options.kid;
        }
        /**
         * Builds SignedHttpRequest formatted JOSE Header from the
         * JOSE Header options provided or previously set on the object and returns
         * the stringified header object.
         * Throws if keyId or algorithm aren't provided since they are required for Access Token Binding.
         * @param shrHeaderOptions
         * @returns
         */
        static getShrHeaderString(shrHeaderOptions) {
          if (!shrHeaderOptions.kid) {
            throw createJoseHeaderError(missingKidError);
          }
          if (!shrHeaderOptions.alg) {
            throw createJoseHeaderError(missingAlgError);
          }
          const shrHeader = new _JoseHeader({
            // Access Token PoP headers must have type pop, but the type header can be overriden for special cases
            typ: shrHeaderOptions.typ || JsonWebTokenTypes.Pop,
            kid: shrHeaderOptions.kid,
            alg: shrHeaderOptions.alg
          });
          return JSON.stringify(shrHeader);
        }
      };
      function startContext(event, abbreviations, stack) {
        if (!stack) {
          return;
        }
        stack.push({
          name: abbreviations.get(event.name) || event.name
        });
      }
      function endContext(event, abbreviations, stack, error) {
        if (!stack?.length) {
          return;
        }
        const peek = (stack2) => {
          return stack2.length ? stack2[stack2.length - 1] : void 0;
        };
        const abbrEventName = abbreviations.get(event.name) || event.name;
        const top = peek(stack);
        if (top?.name !== abbrEventName) {
          return;
        }
        const current = stack?.pop();
        if (!current) {
          return;
        }
        const errorCode = error instanceof AuthError ? error.errorCode : error instanceof Error ? error.name : void 0;
        const subErr = error instanceof AuthError ? error.subError : void 0;
        if (errorCode && current.childErr !== errorCode) {
          current.err = errorCode;
          if (subErr) {
            current.subErr = subErr;
          }
        }
        delete current.name;
        delete current.childErr;
        const context = {
          ...current,
          dur: event.durationMs
        };
        if (!event.success) {
          context.fail = 1;
        }
        const parent = peek(stack);
        if (!parent) {
          return { [abbrEventName]: context };
        }
        if (errorCode) {
          parent.childErr = errorCode;
        }
        let childName;
        if (!parent[abbrEventName]) {
          childName = abbrEventName;
        } else {
          const siblings = Object.keys(parent).filter((key) => key.startsWith(abbrEventName)).length;
          childName = `${abbrEventName}_${siblings + 1}`;
        }
        parent[childName] = context;
        return parent;
      }
      function addError(error, logger, event, stackMaxSize = 5) {
        if (!(error instanceof Error)) {
          logger.trace("PerformanceClient.addErrorStack: Input error is not instance of Error", event.correlationId);
          return;
        } else if (error instanceof AuthError) {
          event.errorCode = error.errorCode;
          event.subErrorCode = error.subError;
          if (error instanceof ServerError || error instanceof InteractionRequiredAuthError) {
            event.serverErrorNo = error.errorNo;
          }
          return;
        } else if (error instanceof CacheError) {
          event.errorCode = error.errorCode;
          return;
        } else if (event.errorStack?.length) {
          logger.trace("PerformanceClient.addErrorStack: Stack already exist", event.correlationId);
          return;
        } else if (!error.stack?.length) {
          logger.trace("PerformanceClient.addErrorStack: Input stack is empty", event.correlationId);
          return;
        }
        if (error.stack) {
          event.errorStack = compactStack(error.stack, stackMaxSize);
        }
        event.errorName = error.name;
      }
      function compactStack(stack, stackMaxSize) {
        if (stackMaxSize < 0) {
          return [];
        }
        const stackArr = stack.split("\n") || [];
        const res = [];
        const firstLine = stackArr[0];
        if (firstLine.startsWith("TypeError: Cannot read property") || firstLine.startsWith("TypeError: Cannot read properties of") || firstLine.startsWith("TypeError: Cannot set property") || firstLine.startsWith("TypeError: Cannot set properties of") || firstLine.endsWith("is not a function")) {
          res.push(compactStackLine(firstLine));
        } else if (firstLine.startsWith("SyntaxError") || firstLine.startsWith("TypeError")) {
          res.push(compactStackLine(
            // Example: SyntaxError: Unexpected token 'e', "test" is not valid JSON -> SyntaxError: Unexpected token <redacted>, <redacted> is not valid JSON
            firstLine.replace(/['].*[']|["].*["]/g, "<redacted>")
          ));
        }
        for (let ix = 1; ix < stackArr.length; ix++) {
          if (res.length >= stackMaxSize) {
            break;
          }
          const line = stackArr[ix];
          res.push(compactStackLine(line));
        }
        return res;
      }
      function compactStackLine(line) {
        const filePathIx = line.lastIndexOf(" ") + 1;
        if (filePathIx < 1) {
          return line;
        }
        const filePath = line.substring(filePathIx);
        let fileNameIx = filePath.lastIndexOf("/");
        fileNameIx = fileNameIx < 0 ? filePath.lastIndexOf("\\") : fileNameIx;
        if (fileNameIx >= 0) {
          return (line.substring(0, filePathIx) + "(" + filePath.substring(fileNameIx + 1) + (filePath.charAt(filePath.length - 1) === ")" ? "" : ")")).trimStart();
        }
        return line.trimStart();
      }
      function getAccountType(account2) {
        const idTokenClaims = account2?.idTokenClaims;
        if (idTokenClaims?.tfp || idTokenClaims?.acr) {
          return "B2C";
        }
        if (!idTokenClaims?.tid) {
          return void 0;
        } else if (idTokenClaims?.tid === "9188040d-6c67-4c5b-b112-36a304b66dad") {
          return "MSA";
        }
        return "AAD";
      }
      var PerformanceClient = class {
        /**
         * Creates an instance of PerformanceClient,
         * an abstract class containing core performance telemetry logic.
         *
         * @constructor
         * @param {string} clientId Client ID of the application
         * @param {string} authority Authority used by the application
         * @param {Logger} logger Logger used by the application
         * @param {string} libraryName Name of the library
         * @param {string} libraryVersion Version of the library
         * @param {ApplicationTelemetry} applicationTelemetry application name and version
         * @param {Set<String>} intFields integer fields to be truncated
         * @param {Map<string, string>} abbreviations event name abbreviations
         */
        constructor(clientId, authority, logger, libraryName, libraryVersion, applicationTelemetry, intFields, abbreviations) {
          this.authority = authority;
          this.libraryName = libraryName;
          this.libraryVersion = libraryVersion;
          this.applicationTelemetry = applicationTelemetry;
          this.clientId = clientId;
          this.logger = logger;
          this.callbacks = /* @__PURE__ */ new Map();
          this.eventsByCorrelationId = /* @__PURE__ */ new Map();
          this.eventStack = /* @__PURE__ */ new Map();
          this.queueMeasurements = /* @__PURE__ */ new Map();
          this.preQueueTimeByCorrelationId = /* @__PURE__ */ new Map();
          this.intFields = intFields || /* @__PURE__ */ new Set();
          for (const item of IntFields) {
            this.intFields.add(item);
          }
          this.abbreviations = abbreviations || /* @__PURE__ */ new Map();
          for (const [key, value] of PerformanceEventAbbreviations) {
            this.abbreviations.set(key, value);
          }
        }
        /**
         * Starts and returns an platform-specific implementation of IPerformanceMeasurement.
         * Note: this function can be changed to abstract at the next major version bump.
         *
         * @param {string} measureName
         * @param {string} correlationId
         * @returns {IPerformanceMeasurement}
         * @deprecated This method will be removed in the next major version
         */
        startPerformanceMeasurement(measureName, correlationId) {
          return {};
        }
        /**
         * Gets map of pre-queue times by correlation Id
         *
         * @param {PerformanceEvents} eventName
         * @param {string} correlationId
         * @returns {number}
         */
        getPreQueueTime(eventName, correlationId) {
          const preQueueEvent = this.preQueueTimeByCorrelationId.get(correlationId);
          if (!preQueueEvent) {
            this.logger.trace(`PerformanceClient.getPreQueueTime: no pre-queue times found for correlationId: ${correlationId}, unable to add queue measurement`);
            return;
          } else if (preQueueEvent.name !== eventName) {
            this.logger.trace(`PerformanceClient.getPreQueueTime: no pre-queue time found for ${eventName}, unable to add queue measurement`);
            return;
          }
          return preQueueEvent.time;
        }
        /**
         * Calculates the difference between current time and time when function was queued.
         * Note: It is possible to have 0 as the queue time if the current time and the queued time was the same.
         *
         * @param {number} preQueueTime
         * @param {number} currentTime
         * @returns {number}
         */
        calculateQueuedTime(preQueueTime, currentTime) {
          if (preQueueTime < 1) {
            this.logger.trace(`PerformanceClient: preQueueTime should be a positive integer and not ${preQueueTime}`);
            return 0;
          }
          if (currentTime < 1) {
            this.logger.trace(`PerformanceClient: currentTime should be a positive integer and not ${currentTime}`);
            return 0;
          }
          if (currentTime < preQueueTime) {
            this.logger.trace("PerformanceClient: currentTime is less than preQueueTime, check how time is being retrieved");
            return 0;
          }
          return currentTime - preQueueTime;
        }
        /**
         * Adds queue measurement time to QueueMeasurements array for given correlation ID.
         *
         * @param {PerformanceEvents} eventName
         * @param {?string} correlationId
         * @param {?number} queueTime
         * @param {?boolean} manuallyCompleted - indicator for manually completed queue measurements
         * @returns
         */
        addQueueMeasurement(eventName, correlationId, queueTime, manuallyCompleted) {
          if (!correlationId) {
            this.logger.trace(`PerformanceClient.addQueueMeasurement: correlationId not provided for ${eventName}, cannot add queue measurement`);
            return;
          }
          if (queueTime === 0) {
            this.logger.trace(`PerformanceClient.addQueueMeasurement: queue time provided for ${eventName} is ${queueTime}`);
          } else if (!queueTime) {
            this.logger.trace(`PerformanceClient.addQueueMeasurement: no queue time provided for ${eventName}`);
            return;
          }
          const queueMeasurement = {
            eventName,
            // Always default queue time to 0 for manually completed (improperly instrumented)
            queueTime: manuallyCompleted ? 0 : queueTime,
            manuallyCompleted
          };
          const existingMeasurements = this.queueMeasurements.get(correlationId);
          if (existingMeasurements) {
            existingMeasurements.push(queueMeasurement);
            this.queueMeasurements.set(correlationId, existingMeasurements);
          } else {
            this.logger.trace(`PerformanceClient.addQueueMeasurement: adding correlationId ${correlationId} to queue measurements`);
            const measurementArray = [queueMeasurement];
            this.queueMeasurements.set(correlationId, measurementArray);
          }
          this.preQueueTimeByCorrelationId.delete(correlationId);
        }
        /**
         * Starts measuring performance for a given operation. Returns a function that should be used to end the measurement.
         *
         * @param {PerformanceEvents} measureName
         * @param {?string} [correlationId]
         * @returns {InProgressPerformanceEvent}
         */
        startMeasurement(measureName, correlationId) {
          const eventCorrelationId = correlationId || this.generateId();
          if (!correlationId) {
            this.logger.info(`PerformanceClient: No correlation id provided for ${measureName}, generating`, eventCorrelationId);
          }
          this.logger.trace(`PerformanceClient: Performance measurement started for ${measureName}`, eventCorrelationId);
          const inProgressEvent = {
            eventId: this.generateId(),
            status: PerformanceEventStatus.InProgress,
            authority: this.authority,
            libraryName: this.libraryName,
            libraryVersion: this.libraryVersion,
            clientId: this.clientId,
            name: measureName,
            startTimeMs: Date.now(),
            correlationId: eventCorrelationId,
            appName: this.applicationTelemetry?.appName,
            appVersion: this.applicationTelemetry?.appVersion
          };
          this.cacheEventByCorrelationId(inProgressEvent);
          startContext(inProgressEvent, this.abbreviations, this.eventStack.get(eventCorrelationId));
          return {
            end: (event, error, account2) => {
              return this.endMeasurement({
                // Initial set of event properties
                ...inProgressEvent,
                // Properties set when event ends
                ...event
              }, error, account2);
            },
            discard: () => {
              return this.discardMeasurements(inProgressEvent.correlationId);
            },
            add: (fields) => {
              return this.addFields(fields, inProgressEvent.correlationId);
            },
            increment: (fields) => {
              return this.incrementFields(fields, inProgressEvent.correlationId);
            },
            event: inProgressEvent,
            measurement: new StubPerformanceMeasurement()
          };
        }
        /**
         * Stops measuring the performance for an operation. Should only be called directly by PerformanceClient classes,
         * as consumers should instead use the function returned by startMeasurement.
         * Adds a new field named as "[event name]DurationMs" for sub-measurements, completes and emits an event
         * otherwise.
         *
         * @param {PerformanceEvent} event
         * @param {unknown} error
         * @param {AccountInfo?} account
         * @returns {(PerformanceEvent | null)}
         */
        endMeasurement(event, error, account2) {
          const rootEvent = this.eventsByCorrelationId.get(event.correlationId);
          if (!rootEvent) {
            this.logger.trace(`PerformanceClient: Measurement not found for ${event.eventId}`, event.correlationId);
            return null;
          }
          const isRoot = event.eventId === rootEvent.eventId;
          let queueInfo = {
            totalQueueTime: 0,
            totalQueueCount: 0,
            manuallyCompletedCount: 0
          };
          event.durationMs = Math.round(event.durationMs || this.getDurationMs(event.startTimeMs));
          const context = JSON.stringify(endContext(event, this.abbreviations, this.eventStack.get(rootEvent.correlationId), error));
          if (isRoot) {
            queueInfo = this.getQueueInfo(event.correlationId);
            this.discardMeasurements(rootEvent.correlationId);
          } else {
            rootEvent.incompleteSubMeasurements?.delete(event.eventId);
          }
          this.logger.trace(`PerformanceClient: Performance measurement ended for ${event.name}: ${event.durationMs} ms`, event.correlationId);
          if (error) {
            addError(error, this.logger, rootEvent);
          }
          if (!isRoot) {
            rootEvent[event.name + "DurationMs"] = Math.floor(event.durationMs);
            return { ...rootEvent };
          }
          if (isRoot && !error && (rootEvent.errorCode || rootEvent.subErrorCode)) {
            this.logger.trace(`PerformanceClient: Remove error and sub-error codes for root event ${event.name} as intermediate error was successfully handled`, event.correlationId);
            rootEvent.errorCode = void 0;
            rootEvent.subErrorCode = void 0;
          }
          let finalEvent = { ...rootEvent, ...event };
          let incompleteSubsCount = 0;
          finalEvent.incompleteSubMeasurements?.forEach((subMeasurement) => {
            this.logger.trace(`PerformanceClient: Incomplete submeasurement ${subMeasurement.name} found for ${event.name}`, finalEvent.correlationId);
            incompleteSubsCount++;
          });
          finalEvent.incompleteSubMeasurements = void 0;
          finalEvent = {
            ...finalEvent,
            queuedTimeMs: queueInfo.totalQueueTime,
            queuedCount: queueInfo.totalQueueCount,
            queuedManuallyCompletedCount: queueInfo.manuallyCompletedCount,
            status: PerformanceEventStatus.Completed,
            incompleteSubsCount,
            context
          };
          if (account2) {
            finalEvent.accountType = getAccountType(account2);
            finalEvent.dataBoundary = account2.dataBoundary;
          }
          this.truncateIntegralFields(finalEvent);
          this.emitEvents([finalEvent], event.correlationId);
          return finalEvent;
        }
        /**
         * Saves extra information to be emitted when the measurements are flushed
         * @param fields
         * @param correlationId
         */
        addFields(fields, correlationId) {
          this.logger.trace("PerformanceClient: Updating static fields");
          const event = this.eventsByCorrelationId.get(correlationId);
          if (event) {
            this.eventsByCorrelationId.set(correlationId, {
              ...event,
              ...fields
            });
          } else {
            this.logger.trace("PerformanceClient: Event not found for", correlationId);
          }
        }
        /**
         * Increment counters to be emitted when the measurements are flushed
         * @param fields {string[]}
         * @param correlationId {string} correlation identifier
         */
        incrementFields(fields, correlationId) {
          this.logger.trace("PerformanceClient: Updating counters");
          const event = this.eventsByCorrelationId.get(correlationId);
          if (event) {
            for (const counter in fields) {
              if (!event.hasOwnProperty(counter)) {
                event[counter] = 0;
              } else if (isNaN(Number(event[counter]))) {
                return;
              }
              event[counter] += fields[counter];
            }
          } else {
            this.logger.trace("PerformanceClient: Event not found for", correlationId);
          }
        }
        /**
         * Upserts event into event cache.
         * First key is the correlation id, second key is the event id.
         * Allows for events to be grouped by correlation id,
         * and to easily allow for properties on them to be updated.
         *
         * @private
         * @param {PerformanceEvent} event
         */
        cacheEventByCorrelationId(event) {
          const rootEvent = this.eventsByCorrelationId.get(event.correlationId);
          if (rootEvent) {
            this.logger.trace(`PerformanceClient: Performance measurement for ${event.name} added/updated`, event.correlationId);
            rootEvent.incompleteSubMeasurements = rootEvent.incompleteSubMeasurements || /* @__PURE__ */ new Map();
            rootEvent.incompleteSubMeasurements.set(event.eventId, {
              name: event.name,
              startTimeMs: event.startTimeMs
            });
          } else {
            this.logger.trace(`PerformanceClient: Performance measurement for ${event.name} started`, event.correlationId);
            this.eventsByCorrelationId.set(event.correlationId, { ...event });
            this.eventStack.set(event.correlationId, []);
          }
        }
        getQueueInfo(correlationId) {
          const queueMeasurementForCorrelationId = this.queueMeasurements.get(correlationId);
          if (!queueMeasurementForCorrelationId) {
            this.logger.trace(`PerformanceClient: no queue measurements found for for correlationId: ${correlationId}`);
          }
          let totalQueueTime = 0;
          let totalQueueCount = 0;
          let manuallyCompletedCount = 0;
          queueMeasurementForCorrelationId?.forEach((measurement) => {
            totalQueueTime += measurement.queueTime;
            totalQueueCount++;
            manuallyCompletedCount += measurement.manuallyCompleted ? 1 : 0;
          });
          return {
            totalQueueTime,
            totalQueueCount,
            manuallyCompletedCount
          };
        }
        /**
         * Removes measurements and aux data for a given correlation id.
         *
         * @param {string} correlationId
         */
        discardMeasurements(correlationId) {
          this.logger.trace("PerformanceClient: Performance measurements discarded", correlationId);
          this.eventsByCorrelationId.delete(correlationId);
          this.logger.trace("PerformanceClient: QueueMeasurements discarded", correlationId);
          this.queueMeasurements.delete(correlationId);
          this.logger.trace("PerformanceClient: Pre-queue times discarded", correlationId);
          this.preQueueTimeByCorrelationId.delete(correlationId);
          this.logger.trace("PerformanceClient: Event stack discarded", correlationId);
          this.eventStack.delete(correlationId);
        }
        /**
         * Registers a callback function to receive performance events.
         *
         * @param {PerformanceCallbackFunction} callback
         * @returns {string}
         */
        addPerformanceCallback(callback) {
          for (const [id, cb] of this.callbacks) {
            if (cb.toString() === callback.toString()) {
              this.logger.warning(`PerformanceClient: Performance callback is already registered with id: ${id}`);
              return id;
            }
          }
          const callbackId = this.generateId();
          this.callbacks.set(callbackId, callback);
          this.logger.verbose(`PerformanceClient: Performance callback registered with id: ${callbackId}`);
          return callbackId;
        }
        /**
         * Removes a callback registered with addPerformanceCallback.
         *
         * @param {string} callbackId
         * @returns {boolean}
         */
        removePerformanceCallback(callbackId) {
          const result = this.callbacks.delete(callbackId);
          if (result) {
            this.logger.verbose(`PerformanceClient: Performance callback ${callbackId} removed.`);
          } else {
            this.logger.verbose(`PerformanceClient: Performance callback ${callbackId} not removed.`);
          }
          return result;
        }
        /**
         * Emits events to all registered callbacks.
         *
         * @param {PerformanceEvent[]} events
         * @param {?string} [correlationId]
         */
        emitEvents(events, correlationId) {
          this.logger.verbose("PerformanceClient: Emitting performance events", correlationId);
          this.callbacks.forEach((callback, callbackId) => {
            this.logger.trace(`PerformanceClient: Emitting event to callback ${callbackId}`, correlationId);
            callback.apply(null, [events]);
          });
        }
        /**
         * Enforce truncation of integral fields in performance event.
         * @param {PerformanceEvent} event performance event to update.
         */
        truncateIntegralFields(event) {
          this.intFields.forEach((key) => {
            if (key in event && typeof event[key] === "number") {
              event[key] = Math.floor(event[key]);
            }
          });
        }
        /**
         * Returns event duration in milliseconds
         * @param startTimeMs {number}
         * @returns {number}
         */
        getDurationMs(startTimeMs) {
          const durationMs = Date.now() - startTimeMs;
          return durationMs < 0 ? durationMs : 0;
        }
      };
      var pkceNotCreated = "pkce_not_created";
      var earJwkEmpty = "ear_jwk_empty";
      var earJweEmpty = "ear_jwe_empty";
      var cryptoNonExistent = "crypto_nonexistent";
      var emptyNavigateUri = "empty_navigate_uri";
      var hashEmptyError = "hash_empty_error";
      var noStateInHash = "no_state_in_hash";
      var hashDoesNotContainKnownProperties = "hash_does_not_contain_known_properties";
      var unableToParseState = "unable_to_parse_state";
      var stateInteractionTypeMismatch = "state_interaction_type_mismatch";
      var interactionInProgress = "interaction_in_progress";
      var popupWindowError = "popup_window_error";
      var emptyWindowError = "empty_window_error";
      var userCancelled = "user_cancelled";
      var monitorPopupTimeout = "monitor_popup_timeout";
      var monitorWindowTimeout = "monitor_window_timeout";
      var redirectInIframe = "redirect_in_iframe";
      var blockIframeReload = "block_iframe_reload";
      var blockNestedPopups = "block_nested_popups";
      var iframeClosedPrematurely = "iframe_closed_prematurely";
      var silentLogoutUnsupported = "silent_logout_unsupported";
      var noAccountError = "no_account_error";
      var silentPromptValueError = "silent_prompt_value_error";
      var noTokenRequestCacheError = "no_token_request_cache_error";
      var unableToParseTokenRequestCacheError = "unable_to_parse_token_request_cache_error";
      var authRequestNotSetError = "auth_request_not_set_error";
      var invalidCacheType = "invalid_cache_type";
      var nonBrowserEnvironment = "non_browser_environment";
      var databaseNotOpen = "database_not_open";
      var noNetworkConnectivity = "no_network_connectivity";
      var postRequestFailed = "post_request_failed";
      var getRequestFailed = "get_request_failed";
      var failedToParseResponse = "failed_to_parse_response";
      var unableToLoadToken = "unable_to_load_token";
      var cryptoKeyNotFound = "crypto_key_not_found";
      var authCodeRequired = "auth_code_required";
      var authCodeOrNativeAccountIdRequired = "auth_code_or_nativeAccountId_required";
      var spaCodeAndNativeAccountIdPresent = "spa_code_and_nativeAccountId_present";
      var databaseUnavailable = "database_unavailable";
      var unableToAcquireTokenFromNativePlatform = "unable_to_acquire_token_from_native_platform";
      var nativeHandshakeTimeout = "native_handshake_timeout";
      var nativeExtensionNotInstalled = "native_extension_not_installed";
      var nativeConnectionNotEstablished = "native_connection_not_established";
      var uninitializedPublicClientApplication = "uninitialized_public_client_application";
      var nativePromptNotSupported = "native_prompt_not_supported";
      var invalidBase64String = "invalid_base64_string";
      var invalidPopTokenRequest = "invalid_pop_token_request";
      var failedToBuildHeaders = "failed_to_build_headers";
      var failedToParseHeaders = "failed_to_parse_headers";
      var failedToDecryptEarResponse = "failed_to_decrypt_ear_response";
      var timedOut = "timed_out";
      var BrowserAuthErrorCodes = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        authCodeOrNativeAccountIdRequired,
        authCodeRequired,
        authRequestNotSetError,
        blockIframeReload,
        blockNestedPopups,
        cryptoKeyNotFound,
        cryptoNonExistent,
        databaseNotOpen,
        databaseUnavailable,
        earJweEmpty,
        earJwkEmpty,
        emptyNavigateUri,
        emptyWindowError,
        failedToBuildHeaders,
        failedToDecryptEarResponse,
        failedToParseHeaders,
        failedToParseResponse,
        getRequestFailed,
        hashDoesNotContainKnownProperties,
        hashEmptyError,
        iframeClosedPrematurely,
        interactionInProgress,
        invalidBase64String,
        invalidCacheType,
        invalidPopTokenRequest,
        monitorPopupTimeout,
        monitorWindowTimeout,
        nativeConnectionNotEstablished,
        nativeExtensionNotInstalled,
        nativeHandshakeTimeout,
        nativePromptNotSupported,
        noAccountError,
        noNetworkConnectivity,
        noStateInHash,
        noTokenRequestCacheError,
        nonBrowserEnvironment,
        pkceNotCreated,
        popupWindowError,
        postRequestFailed,
        redirectInIframe,
        silentLogoutUnsupported,
        silentPromptValueError,
        spaCodeAndNativeAccountIdPresent,
        stateInteractionTypeMismatch,
        timedOut,
        unableToAcquireTokenFromNativePlatform,
        unableToLoadToken,
        unableToParseState,
        unableToParseTokenRequestCacheError,
        uninitializedPublicClientApplication,
        userCancelled
      });
      var ErrorLink = "For more visit: aka.ms/msaljs/browser-errors";
      var BrowserAuthErrorMessages = {
        [pkceNotCreated]: "The PKCE code challenge and verifier could not be generated.",
        [earJwkEmpty]: "No EAR encryption key provided. This is unexpected.",
        [earJweEmpty]: "Server response does not contain ear_jwe property. This is unexpected.",
        [cryptoNonExistent]: "The crypto object or function is not available.",
        [emptyNavigateUri]: "Navigation URI is empty. Please check stack trace for more info.",
        [hashEmptyError]: `Hash value cannot be processed because it is empty. Please verify that your redirectUri is not clearing the hash. ${ErrorLink}`,
        [noStateInHash]: "Hash does not contain state. Please verify that the request originated from msal.",
        [hashDoesNotContainKnownProperties]: `Hash does not contain known properites. Please verify that your redirectUri is not changing the hash.  ${ErrorLink}`,
        [unableToParseState]: "Unable to parse state. Please verify that the request originated from msal.",
        [stateInteractionTypeMismatch]: "Hash contains state but the interaction type does not match the caller.",
        [interactionInProgress]: `Interaction is currently in progress. Please ensure that this interaction has been completed before calling an interactive API.   ${ErrorLink}`,
        [popupWindowError]: "Error opening popup window. This can happen if you are using IE or if popups are blocked in the browser.",
        [emptyWindowError]: "window.open returned null or undefined window object.",
        [userCancelled]: "User cancelled the flow.",
        [monitorPopupTimeout]: `Token acquisition in popup failed due to timeout.  ${ErrorLink}`,
        [monitorWindowTimeout]: `Token acquisition in iframe failed due to timeout.  ${ErrorLink}`,
        [redirectInIframe]: "Redirects are not supported for iframed or brokered applications. Please ensure you are using MSAL.js in a top frame of the window if using the redirect APIs, or use the popup APIs.",
        [blockIframeReload]: `Request was blocked inside an iframe because MSAL detected an authentication response.  ${ErrorLink}`,
        [blockNestedPopups]: "Request was blocked inside a popup because MSAL detected it was running in a popup.",
        [iframeClosedPrematurely]: "The iframe being monitored was closed prematurely.",
        [silentLogoutUnsupported]: "Silent logout not supported. Please call logoutRedirect or logoutPopup instead.",
        [noAccountError]: "No account object provided to acquireTokenSilent and no active account has been set. Please call setActiveAccount or provide an account on the request.",
        [silentPromptValueError]: "The value given for the prompt value is not valid for silent requests - must be set to 'none' or 'no_session'.",
        [noTokenRequestCacheError]: "No token request found in cache.",
        [unableToParseTokenRequestCacheError]: "The cached token request could not be parsed.",
        [authRequestNotSetError]: "Auth Request not set. Please ensure initiateAuthRequest was called from the InteractionHandler",
        [invalidCacheType]: "Invalid cache type",
        [nonBrowserEnvironment]: "Login and token requests are not supported in non-browser environments.",
        [databaseNotOpen]: "Database is not open!",
        [noNetworkConnectivity]: "No network connectivity. Check your internet connection.",
        [postRequestFailed]: "Network request failed: If the browser threw a CORS error, check that the redirectUri is registered in the Azure App Portal as type 'SPA'",
        [getRequestFailed]: "Network request failed. Please check the network trace to determine root cause.",
        [failedToParseResponse]: "Failed to parse network response. Check network trace.",
        [unableToLoadToken]: "Error loading token to cache.",
        [cryptoKeyNotFound]: "Cryptographic Key or Keypair not found in browser storage.",
        [authCodeRequired]: "An authorization code must be provided (as the `code` property on the request) to this flow.",
        [authCodeOrNativeAccountIdRequired]: "An authorization code or nativeAccountId must be provided to this flow.",
        [spaCodeAndNativeAccountIdPresent]: "Request cannot contain both spa code and native account id.",
        [databaseUnavailable]: "IndexedDB, which is required for persistent cryptographic key storage, is unavailable. This may be caused by browser privacy features which block persistent storage in third-party contexts.",
        [unableToAcquireTokenFromNativePlatform]: `Unable to acquire token from native platform.  ${ErrorLink}`,
        [nativeHandshakeTimeout]: "Timed out while attempting to establish connection to browser extension",
        [nativeExtensionNotInstalled]: "Native extension is not installed. If you think this is a mistake call the initialize function.",
        [nativeConnectionNotEstablished]: `Connection to native platform has not been established. Please install a compatible browser extension and run initialize().  ${ErrorLink}`,
        [uninitializedPublicClientApplication]: `You must call and await the initialize function before attempting to call any other MSAL API.  ${ErrorLink}`,
        [nativePromptNotSupported]: "The provided prompt is not supported by the native platform. This request should be routed to the web based flow.",
        [invalidBase64String]: "Invalid base64 encoded string.",
        [invalidPopTokenRequest]: "Invalid PoP token request. The request should not have both a popKid value and signPopToken set to true.",
        [failedToBuildHeaders]: "Failed to build request headers object.",
        [failedToParseHeaders]: "Failed to parse response headers",
        [failedToDecryptEarResponse]: "Failed to decrypt ear response",
        [timedOut]: "The request timed out."
      };
      var BrowserAuthErrorMessage = {
        pkceNotGenerated: {
          code: pkceNotCreated,
          desc: BrowserAuthErrorMessages[pkceNotCreated]
        },
        cryptoDoesNotExist: {
          code: cryptoNonExistent,
          desc: BrowserAuthErrorMessages[cryptoNonExistent]
        },
        emptyNavigateUriError: {
          code: emptyNavigateUri,
          desc: BrowserAuthErrorMessages[emptyNavigateUri]
        },
        hashEmptyError: {
          code: hashEmptyError,
          desc: BrowserAuthErrorMessages[hashEmptyError]
        },
        hashDoesNotContainStateError: {
          code: noStateInHash,
          desc: BrowserAuthErrorMessages[noStateInHash]
        },
        hashDoesNotContainKnownPropertiesError: {
          code: hashDoesNotContainKnownProperties,
          desc: BrowserAuthErrorMessages[hashDoesNotContainKnownProperties]
        },
        unableToParseStateError: {
          code: unableToParseState,
          desc: BrowserAuthErrorMessages[unableToParseState]
        },
        stateInteractionTypeMismatchError: {
          code: stateInteractionTypeMismatch,
          desc: BrowserAuthErrorMessages[stateInteractionTypeMismatch]
        },
        interactionInProgress: {
          code: interactionInProgress,
          desc: BrowserAuthErrorMessages[interactionInProgress]
        },
        popupWindowError: {
          code: popupWindowError,
          desc: BrowserAuthErrorMessages[popupWindowError]
        },
        emptyWindowError: {
          code: emptyWindowError,
          desc: BrowserAuthErrorMessages[emptyWindowError]
        },
        userCancelledError: {
          code: userCancelled,
          desc: BrowserAuthErrorMessages[userCancelled]
        },
        monitorPopupTimeoutError: {
          code: monitorPopupTimeout,
          desc: BrowserAuthErrorMessages[monitorPopupTimeout]
        },
        monitorIframeTimeoutError: {
          code: monitorWindowTimeout,
          desc: BrowserAuthErrorMessages[monitorWindowTimeout]
        },
        redirectInIframeError: {
          code: redirectInIframe,
          desc: BrowserAuthErrorMessages[redirectInIframe]
        },
        blockTokenRequestsInHiddenIframeError: {
          code: blockIframeReload,
          desc: BrowserAuthErrorMessages[blockIframeReload]
        },
        blockAcquireTokenInPopupsError: {
          code: blockNestedPopups,
          desc: BrowserAuthErrorMessages[blockNestedPopups]
        },
        iframeClosedPrematurelyError: {
          code: iframeClosedPrematurely,
          desc: BrowserAuthErrorMessages[iframeClosedPrematurely]
        },
        silentLogoutUnsupportedError: {
          code: silentLogoutUnsupported,
          desc: BrowserAuthErrorMessages[silentLogoutUnsupported]
        },
        noAccountError: {
          code: noAccountError,
          desc: BrowserAuthErrorMessages[noAccountError]
        },
        silentPromptValueError: {
          code: silentPromptValueError,
          desc: BrowserAuthErrorMessages[silentPromptValueError]
        },
        noTokenRequestCacheError: {
          code: noTokenRequestCacheError,
          desc: BrowserAuthErrorMessages[noTokenRequestCacheError]
        },
        unableToParseTokenRequestCacheError: {
          code: unableToParseTokenRequestCacheError,
          desc: BrowserAuthErrorMessages[unableToParseTokenRequestCacheError]
        },
        authRequestNotSet: {
          code: authRequestNotSetError,
          desc: BrowserAuthErrorMessages[authRequestNotSetError]
        },
        invalidCacheType: {
          code: invalidCacheType,
          desc: BrowserAuthErrorMessages[invalidCacheType]
        },
        notInBrowserEnvironment: {
          code: nonBrowserEnvironment,
          desc: BrowserAuthErrorMessages[nonBrowserEnvironment]
        },
        databaseNotOpen: {
          code: databaseNotOpen,
          desc: BrowserAuthErrorMessages[databaseNotOpen]
        },
        noNetworkConnectivity: {
          code: noNetworkConnectivity,
          desc: BrowserAuthErrorMessages[noNetworkConnectivity]
        },
        postRequestFailed: {
          code: postRequestFailed,
          desc: BrowserAuthErrorMessages[postRequestFailed]
        },
        getRequestFailed: {
          code: getRequestFailed,
          desc: BrowserAuthErrorMessages[getRequestFailed]
        },
        failedToParseNetworkResponse: {
          code: failedToParseResponse,
          desc: BrowserAuthErrorMessages[failedToParseResponse]
        },
        unableToLoadTokenError: {
          code: unableToLoadToken,
          desc: BrowserAuthErrorMessages[unableToLoadToken]
        },
        signingKeyNotFoundInStorage: {
          code: cryptoKeyNotFound,
          desc: BrowserAuthErrorMessages[cryptoKeyNotFound]
        },
        authCodeRequired: {
          code: authCodeRequired,
          desc: BrowserAuthErrorMessages[authCodeRequired]
        },
        authCodeOrNativeAccountRequired: {
          code: authCodeOrNativeAccountIdRequired,
          desc: BrowserAuthErrorMessages[authCodeOrNativeAccountIdRequired]
        },
        spaCodeAndNativeAccountPresent: {
          code: spaCodeAndNativeAccountIdPresent,
          desc: BrowserAuthErrorMessages[spaCodeAndNativeAccountIdPresent]
        },
        databaseUnavailable: {
          code: databaseUnavailable,
          desc: BrowserAuthErrorMessages[databaseUnavailable]
        },
        unableToAcquireTokenFromNativePlatform: {
          code: unableToAcquireTokenFromNativePlatform,
          desc: BrowserAuthErrorMessages[unableToAcquireTokenFromNativePlatform]
        },
        nativeHandshakeTimeout: {
          code: nativeHandshakeTimeout,
          desc: BrowserAuthErrorMessages[nativeHandshakeTimeout]
        },
        nativeExtensionNotInstalled: {
          code: nativeExtensionNotInstalled,
          desc: BrowserAuthErrorMessages[nativeExtensionNotInstalled]
        },
        nativeConnectionNotEstablished: {
          code: nativeConnectionNotEstablished,
          desc: BrowserAuthErrorMessages[nativeConnectionNotEstablished]
        },
        uninitializedPublicClientApplication: {
          code: uninitializedPublicClientApplication,
          desc: BrowserAuthErrorMessages[uninitializedPublicClientApplication]
        },
        nativePromptNotSupported: {
          code: nativePromptNotSupported,
          desc: BrowserAuthErrorMessages[nativePromptNotSupported]
        },
        invalidBase64StringError: {
          code: invalidBase64String,
          desc: BrowserAuthErrorMessages[invalidBase64String]
        },
        invalidPopTokenRequest: {
          code: invalidPopTokenRequest,
          desc: BrowserAuthErrorMessages[invalidPopTokenRequest]
        }
      };
      var BrowserAuthError = class _BrowserAuthError extends AuthError {
        constructor(errorCode, subError) {
          super(errorCode, BrowserAuthErrorMessages[errorCode], subError);
          Object.setPrototypeOf(this, _BrowserAuthError.prototype);
          this.name = "BrowserAuthError";
        }
      };
      function createBrowserAuthError(errorCode, subError) {
        return new BrowserAuthError(errorCode, subError);
      }
      var BrowserConstants = {
        /**
         * Invalid grant error code
         */
        INVALID_GRANT_ERROR: "invalid_grant",
        /**
         * Default popup window width
         */
        POPUP_WIDTH: 483,
        /**
         * Default popup window height
         */
        POPUP_HEIGHT: 600,
        /**
         * Name of the popup window starts with
         */
        POPUP_NAME_PREFIX: "msal",
        /**
         * Default popup monitor poll interval in milliseconds
         */
        DEFAULT_POLL_INTERVAL_MS: 30,
        /**
         * Msal-browser SKU
         */
        MSAL_SKU: "msal.js.browser"
      };
      var PlatformAuthConstants = {
        CHANNEL_ID: "53ee284d-920a-4b59-9d30-a60315b26836",
        PREFERRED_EXTENSION_ID: "ppnbnpeolgkicgegkbkbjmhlideopiji",
        MATS_TELEMETRY: "MATS",
        MICROSOFT_ENTRA_BROKERID: "MicrosoftEntra",
        DOM_API_NAME: "DOM API",
        PLATFORM_DOM_APIS: "get-token-and-sign-out",
        PLATFORM_DOM_PROVIDER: "PlatformAuthDOMHandler",
        PLATFORM_EXTENSION_PROVIDER: "PlatformAuthExtensionHandler"
      };
      var NativeExtensionMethod = {
        HandshakeRequest: "Handshake",
        HandshakeResponse: "HandshakeResponse",
        GetToken: "GetToken",
        Response: "Response"
      };
      var BrowserCacheLocation = {
        LocalStorage: "localStorage",
        SessionStorage: "sessionStorage",
        MemoryStorage: "memoryStorage"
      };
      var HTTP_REQUEST_TYPE = {
        GET: "GET",
        POST: "POST"
      };
      var INTERACTION_TYPE = {
        SIGNIN: "signin",
        SIGNOUT: "signout"
      };
      var TemporaryCacheKeys = {
        ORIGIN_URI: "request.origin",
        URL_HASH: "urlHash",
        REQUEST_PARAMS: "request.params",
        VERIFIER: "code.verifier",
        INTERACTION_STATUS_KEY: "interaction.status",
        NATIVE_REQUEST: "request.native"
      };
      var InMemoryCacheKeys = {
        WRAPPER_SKU: "wrapper.sku",
        WRAPPER_VER: "wrapper.version"
      };
      var ApiId = {
        acquireTokenRedirect: 861,
        acquireTokenPopup: 862,
        ssoSilent: 863,
        acquireTokenSilent_authCode: 864,
        handleRedirectPromise: 865,
        acquireTokenByCode: 866,
        acquireTokenSilent_silentFlow: 61,
        logout: 961,
        logoutPopup: 962
      };
      exports.InteractionType = void 0;
      (function(InteractionType) {
        InteractionType["Redirect"] = "redirect";
        InteractionType["Popup"] = "popup";
        InteractionType["Silent"] = "silent";
        InteractionType["None"] = "none";
      })(exports.InteractionType || (exports.InteractionType = {}));
      var InteractionStatus = {
        /**
         * Initial status before interaction occurs
         */
        Startup: "startup",
        /**
         * Status set when all login calls occuring
         */
        Login: "login",
        /**
         * Status set when logout call occuring
         */
        Logout: "logout",
        /**
         * Status set for acquireToken calls
         */
        AcquireToken: "acquireToken",
        /**
         * Status set for ssoSilent calls
         */
        SsoSilent: "ssoSilent",
        /**
         * Status set when handleRedirect in progress
         */
        HandleRedirect: "handleRedirect",
        /**
         * Status set when interaction is complete
         */
        None: "none"
      };
      var DEFAULT_REQUEST = {
        scopes: OIDC_DEFAULT_SCOPES
      };
      var KEY_FORMAT_JWK = "jwk";
      var WrapperSKU = {
        React: "@azure/msal-react",
        Angular: "@azure/msal-angular"
      };
      var DB_NAME = "msal.db";
      var DB_VERSION = 1;
      var DB_TABLE_NAME = `${DB_NAME}.keys`;
      var CacheLookupPolicy = {
        /*
         * acquireTokenSilent will attempt to retrieve an access token from the cache. If the access token is expired
         * or cannot be found the refresh token will be used to acquire a new one. Finally, if the refresh token
         * is expired acquireTokenSilent will attempt to acquire new access and refresh tokens.
         */
        Default: 0,
        /*
         * acquireTokenSilent will only look for access tokens in the cache. It will not attempt to renew access or
         * refresh tokens.
         */
        AccessToken: 1,
        /*
         * acquireTokenSilent will attempt to retrieve an access token from the cache. If the access token is expired or
         * cannot be found, the refresh token will be used to acquire a new one. If the refresh token is expired, it
         * will not be renewed and acquireTokenSilent will fail.
         */
        AccessTokenAndRefreshToken: 2,
        /*
         * acquireTokenSilent will not attempt to retrieve access tokens from the cache and will instead attempt to
         * exchange the cached refresh token for a new access token. If the refresh token is expired, it will not be
         * renewed and acquireTokenSilent will fail.
         */
        RefreshToken: 3,
        /*
         * acquireTokenSilent will not look in the cache for the access token. It will go directly to network with the
         * cached refresh token. If the refresh token is expired an attempt will be made to renew it. This is equivalent to
         * setting "forceRefresh: true".
         */
        RefreshTokenAndNetwork: 4,
        /*
         * acquireTokenSilent will attempt to renew both access and refresh tokens. It will not look in the cache. This will
         * always fail if 3rd party cookies are blocked by the browser.
         */
        Skip: 5
      };
      var iFrameRenewalPolicies = [
        CacheLookupPolicy.Default,
        CacheLookupPolicy.Skip,
        CacheLookupPolicy.RefreshTokenAndNetwork
      ];
      function urlEncode(input) {
        return encodeURIComponent(base64Encode(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"));
      }
      function urlEncodeArr(inputArr) {
        return base64EncArr(inputArr).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      function base64Encode(input) {
        return base64EncArr(new TextEncoder().encode(input));
      }
      function base64EncArr(aBytes) {
        const binString = Array.from(aBytes, (x) => String.fromCodePoint(x)).join("");
        return btoa(binString);
      }
      function base64Decode(input) {
        return new TextDecoder().decode(base64DecToArr(input));
      }
      function base64DecToArr(base64String) {
        let encodedString = base64String.replace(/-/g, "+").replace(/_/g, "/");
        switch (encodedString.length % 4) {
          case 0:
            break;
          case 2:
            encodedString += "==";
            break;
          case 3:
            encodedString += "=";
            break;
          default:
            throw createBrowserAuthError(invalidBase64String);
        }
        const binString = atob(encodedString);
        return Uint8Array.from(binString, (m) => m.codePointAt(0) || 0);
      }
      var PKCS1_V15_KEYGEN_ALG = "RSASSA-PKCS1-v1_5";
      var AES_GCM = "AES-GCM";
      var HKDF = "HKDF";
      var S256_HASH_ALG = "SHA-256";
      var MODULUS_LENGTH = 2048;
      var PUBLIC_EXPONENT = new Uint8Array([1, 0, 1]);
      var UUID_CHARS = "0123456789abcdef";
      var UINT32_ARR = new Uint32Array(1);
      var RAW = "raw";
      var ENCRYPT = "encrypt";
      var DECRYPT = "decrypt";
      var DERIVE_KEY = "deriveKey";
      var SUBTLE_SUBERROR = "crypto_subtle_undefined";
      var keygenAlgorithmOptions = {
        name: PKCS1_V15_KEYGEN_ALG,
        hash: S256_HASH_ALG,
        modulusLength: MODULUS_LENGTH,
        publicExponent: PUBLIC_EXPONENT
      };
      function validateCryptoAvailable(skipValidateSubtleCrypto) {
        if (!window) {
          throw createBrowserAuthError(nonBrowserEnvironment);
        }
        if (!window.crypto) {
          throw createBrowserAuthError(cryptoNonExistent);
        }
        if (!skipValidateSubtleCrypto && !window.crypto.subtle) {
          throw createBrowserAuthError(cryptoNonExistent, SUBTLE_SUBERROR);
        }
      }
      async function sha256Digest(dataString, performanceClient, correlationId) {
        performanceClient?.addQueueMeasurement(PerformanceEvents.Sha256Digest, correlationId);
        const encoder = new TextEncoder();
        const data = encoder.encode(dataString);
        return window.crypto.subtle.digest(S256_HASH_ALG, data);
      }
      function getRandomValues(dataBuffer) {
        return window.crypto.getRandomValues(dataBuffer);
      }
      function getRandomUint32() {
        window.crypto.getRandomValues(UINT32_ARR);
        return UINT32_ARR[0];
      }
      function createNewGuid() {
        const currentTimestamp = Date.now();
        const baseRand = getRandomUint32() * 1024 + (getRandomUint32() & 1023);
        const bytes = new Uint8Array(16);
        const randA = Math.trunc(baseRand / 2 ** 30);
        const randBHi = baseRand & 2 ** 30 - 1;
        const randBLo = getRandomUint32();
        bytes[0] = currentTimestamp / 2 ** 40;
        bytes[1] = currentTimestamp / 2 ** 32;
        bytes[2] = currentTimestamp / 2 ** 24;
        bytes[3] = currentTimestamp / 2 ** 16;
        bytes[4] = currentTimestamp / 2 ** 8;
        bytes[5] = currentTimestamp;
        bytes[6] = 112 | randA >>> 8;
        bytes[7] = randA;
        bytes[8] = 128 | randBHi >>> 24;
        bytes[9] = randBHi >>> 16;
        bytes[10] = randBHi >>> 8;
        bytes[11] = randBHi;
        bytes[12] = randBLo >>> 24;
        bytes[13] = randBLo >>> 16;
        bytes[14] = randBLo >>> 8;
        bytes[15] = randBLo;
        let text = "";
        for (let i = 0; i < bytes.length; i++) {
          text += UUID_CHARS.charAt(bytes[i] >>> 4);
          text += UUID_CHARS.charAt(bytes[i] & 15);
          if (i === 3 || i === 5 || i === 7 || i === 9) {
            text += "-";
          }
        }
        return text;
      }
      async function generateKeyPair(extractable, usages) {
        return window.crypto.subtle.generateKey(keygenAlgorithmOptions, extractable, usages);
      }
      async function exportJwk(key) {
        return window.crypto.subtle.exportKey(KEY_FORMAT_JWK, key);
      }
      async function importJwk(key, extractable, usages) {
        return window.crypto.subtle.importKey(KEY_FORMAT_JWK, key, keygenAlgorithmOptions, extractable, usages);
      }
      async function sign(key, data) {
        return window.crypto.subtle.sign(keygenAlgorithmOptions, key, data);
      }
      async function generateEarKey() {
        const key = await generateBaseKey();
        const keyStr = urlEncodeArr(new Uint8Array(key));
        const jwk = {
          alg: "dir",
          kty: "oct",
          k: keyStr
        };
        return base64Encode(JSON.stringify(jwk));
      }
      async function importEarKey(earJwk) {
        const b64DecodedJwk = base64Decode(earJwk);
        const jwkJson = JSON.parse(b64DecodedJwk);
        const rawKey = jwkJson.k;
        const keyBuffer = base64DecToArr(rawKey);
        return window.crypto.subtle.importKey(RAW, keyBuffer, AES_GCM, false, [
          DECRYPT
        ]);
      }
      async function decryptEarResponse(earJwk, earJwe) {
        const earJweParts = earJwe.split(".");
        if (earJweParts.length !== 5) {
          throw createBrowserAuthError(failedToDecryptEarResponse, "jwe_length");
        }
        const key = await importEarKey(earJwk).catch(() => {
          throw createBrowserAuthError(failedToDecryptEarResponse, "import_key");
        });
        try {
          const header = new TextEncoder().encode(earJweParts[0]);
          const iv = base64DecToArr(earJweParts[2]);
          const ciphertext = base64DecToArr(earJweParts[3]);
          const tag = base64DecToArr(earJweParts[4]);
          const tagLengthBits = tag.byteLength * 8;
          const encryptedData = new Uint8Array(ciphertext.length + tag.length);
          encryptedData.set(ciphertext);
          encryptedData.set(tag, ciphertext.length);
          const decryptedData = await window.crypto.subtle.decrypt({
            name: AES_GCM,
            iv,
            tagLength: tagLengthBits,
            additionalData: header
          }, key, encryptedData);
          return new TextDecoder().decode(decryptedData);
        } catch (e) {
          throw createBrowserAuthError(failedToDecryptEarResponse, "decrypt");
        }
      }
      async function generateBaseKey() {
        const key = await window.crypto.subtle.generateKey({
          name: AES_GCM,
          length: 256
        }, true, [ENCRYPT, DECRYPT]);
        return window.crypto.subtle.exportKey(RAW, key);
      }
      async function generateHKDF(baseKey) {
        return window.crypto.subtle.importKey(RAW, baseKey, HKDF, false, [
          DERIVE_KEY
        ]);
      }
      async function deriveKey(baseKey, nonce, context) {
        return window.crypto.subtle.deriveKey({
          name: HKDF,
          salt: nonce,
          hash: S256_HASH_ALG,
          info: new TextEncoder().encode(context)
        }, baseKey, { name: AES_GCM, length: 256 }, false, [ENCRYPT, DECRYPT]);
      }
      async function encrypt(baseKey, rawData, context) {
        const encodedData = new TextEncoder().encode(rawData);
        const nonce = window.crypto.getRandomValues(new Uint8Array(16));
        const derivedKey = await deriveKey(baseKey, nonce, context);
        const encryptedData = await window.crypto.subtle.encrypt({
          name: AES_GCM,
          iv: new Uint8Array(12)
          // New key is derived for every encrypt so we don't need a new nonce
        }, derivedKey, encodedData);
        return {
          data: urlEncodeArr(new Uint8Array(encryptedData)),
          nonce: urlEncodeArr(nonce)
        };
      }
      async function decrypt(baseKey, nonce, context, encryptedData) {
        const encodedData = base64DecToArr(encryptedData);
        const derivedKey = await deriveKey(baseKey, base64DecToArr(nonce), context);
        const decryptedData = await window.crypto.subtle.decrypt({
          name: AES_GCM,
          iv: new Uint8Array(12)
          // New key is derived for every encrypt so we don't need a new nonce
        }, derivedKey, encodedData);
        return new TextDecoder().decode(decryptedData);
      }
      async function hashString(plainText) {
        const hashBuffer = await sha256Digest(plainText);
        const hashBytes = new Uint8Array(hashBuffer);
        return urlEncodeArr(hashBytes);
      }
      var storageNotSupported = "storage_not_supported";
      var stubbedPublicClientApplicationCalled = "stubbed_public_client_application_called";
      var inMemRedirectUnavailable = "in_mem_redirect_unavailable";
      var BrowserConfigurationAuthErrorCodes = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        inMemRedirectUnavailable,
        storageNotSupported,
        stubbedPublicClientApplicationCalled
      });
      var BrowserConfigurationAuthErrorMessages = {
        [storageNotSupported]: "Given storage configuration option was not supported.",
        [stubbedPublicClientApplicationCalled]: "Stub instance of Public Client Application was called. If using msal-react, please ensure context is not used without a provider. For more visit: aka.ms/msaljs/browser-errors",
        [inMemRedirectUnavailable]: "Redirect cannot be supported. In-memory storage was selected and storeAuthStateInCookie=false, which would cause the library to be unable to handle the incoming hash. If you would like to use the redirect API, please use session/localStorage or set storeAuthStateInCookie=true."
      };
      var BrowserConfigurationAuthErrorMessage = {
        storageNotSupportedError: {
          code: storageNotSupported,
          desc: BrowserConfigurationAuthErrorMessages[storageNotSupported]
        },
        stubPcaInstanceCalled: {
          code: stubbedPublicClientApplicationCalled,
          desc: BrowserConfigurationAuthErrorMessages[stubbedPublicClientApplicationCalled]
        },
        inMemRedirectUnavailable: {
          code: inMemRedirectUnavailable,
          desc: BrowserConfigurationAuthErrorMessages[inMemRedirectUnavailable]
        }
      };
      var BrowserConfigurationAuthError = class _BrowserConfigurationAuthError extends AuthError {
        constructor(errorCode, errorMessage) {
          super(errorCode, errorMessage);
          this.name = "BrowserConfigurationAuthError";
          Object.setPrototypeOf(this, _BrowserConfigurationAuthError.prototype);
        }
      };
      function createBrowserConfigurationAuthError(errorCode) {
        return new BrowserConfigurationAuthError(errorCode, BrowserConfigurationAuthErrorMessages[errorCode]);
      }
      function clearHash(contentWindow) {
        contentWindow.location.hash = "";
        if (typeof contentWindow.history.replaceState === "function") {
          contentWindow.history.replaceState(null, "", `${contentWindow.location.origin}${contentWindow.location.pathname}${contentWindow.location.search}`);
        }
      }
      function replaceHash(url) {
        const urlParts = url.split("#");
        urlParts.shift();
        window.location.hash = urlParts.length > 0 ? urlParts.join("#") : "";
      }
      function isInIframe() {
        return window.parent !== window;
      }
      function isInPopup() {
        return typeof window !== "undefined" && !!window.opener && window.opener !== window && typeof window.name === "string" && window.name.indexOf(`${BrowserConstants.POPUP_NAME_PREFIX}.`) === 0;
      }
      function getCurrentUri() {
        return typeof window !== "undefined" && window.location ? window.location.href.split("?")[0].split("#")[0] : "";
      }
      function getHomepage() {
        const currentUrl = new UrlString(window.location.href);
        const urlComponents = currentUrl.getUrlComponents();
        return `${urlComponents.Protocol}//${urlComponents.HostNameAndPort}/`;
      }
      function blockReloadInHiddenIframes() {
        const isResponseHash = UrlString.hashContainsKnownProperties(window.location.hash);
        if (isResponseHash && isInIframe()) {
          throw createBrowserAuthError(blockIframeReload);
        }
      }
      function blockRedirectInIframe(allowRedirectInIframe) {
        if (isInIframe() && !allowRedirectInIframe) {
          throw createBrowserAuthError(redirectInIframe);
        }
      }
      function blockAcquireTokenInPopups() {
        if (isInPopup()) {
          throw createBrowserAuthError(blockNestedPopups);
        }
      }
      function blockNonBrowserEnvironment() {
        if (typeof window === "undefined") {
          throw createBrowserAuthError(nonBrowserEnvironment);
        }
      }
      function blockAPICallsBeforeInitialize(initialized) {
        if (!initialized) {
          throw createBrowserAuthError(uninitializedPublicClientApplication);
        }
      }
      function preflightCheck$1(initialized) {
        blockNonBrowserEnvironment();
        blockReloadInHiddenIframes();
        blockAcquireTokenInPopups();
        blockAPICallsBeforeInitialize(initialized);
      }
      function redirectPreflightCheck(initialized, config2) {
        preflightCheck$1(initialized);
        blockRedirectInIframe(config2.system.allowRedirectInIframe);
        if (config2.cache.cacheLocation === BrowserCacheLocation.MemoryStorage && !config2.cache.storeAuthStateInCookie) {
          throw createBrowserConfigurationAuthError(inMemRedirectUnavailable);
        }
      }
      function preconnect(authority) {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = new URL(authority).origin;
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
        window.setTimeout(() => {
          try {
            document.head.removeChild(link);
          } catch {
          }
        }, 1e4);
      }
      function createGuid() {
        return createNewGuid();
      }
      var addClientCapabilitiesToClaims = addClientCapabilitiesToClaims$1;
      var BrowserUtils = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        addClientCapabilitiesToClaims,
        blockAPICallsBeforeInitialize,
        blockAcquireTokenInPopups,
        blockNonBrowserEnvironment,
        blockRedirectInIframe,
        blockReloadInHiddenIframes,
        clearHash,
        createGuid,
        getCurrentUri,
        getHomepage,
        invoke,
        invokeAsync,
        isInIframe,
        isInPopup,
        preconnect,
        preflightCheck: preflightCheck$1,
        redirectPreflightCheck,
        replaceHash
      });
      var NavigationClient = class _NavigationClient {
        /**
         * Navigates to other pages within the same web application
         * @param url
         * @param options
         */
        navigateInternal(url, options) {
          return _NavigationClient.defaultNavigateWindow(url, options);
        }
        /**
         * Navigates to other pages outside the web application i.e. the Identity Provider
         * @param url
         * @param options
         */
        navigateExternal(url, options) {
          return _NavigationClient.defaultNavigateWindow(url, options);
        }
        /**
         * Default navigation implementation invoked by the internal and external functions
         * @param url
         * @param options
         */
        static defaultNavigateWindow(url, options) {
          if (options.noHistory) {
            window.location.replace(url);
          } else {
            window.location.assign(url);
          }
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(createBrowserAuthError(timedOut, "failed_to_redirect"));
            }, options.timeout);
          });
        }
      };
      var FetchClient = class {
        /**
         * Fetch Client for REST endpoints - Get request
         * @param url
         * @param headers
         * @param body
         */
        async sendGetRequestAsync(url, options) {
          let response;
          let responseHeaders = {};
          let responseStatus = 0;
          const reqHeaders = getFetchHeaders(options);
          try {
            response = await fetch(url, {
              method: HTTP_REQUEST_TYPE.GET,
              headers: reqHeaders
            });
          } catch (e) {
            throw createNetworkError(createBrowserAuthError(window.navigator.onLine ? getRequestFailed : noNetworkConnectivity), void 0, void 0, e);
          }
          responseHeaders = getHeaderDict(response.headers);
          try {
            responseStatus = response.status;
            return {
              headers: responseHeaders,
              body: await response.json(),
              status: responseStatus
            };
          } catch (e) {
            throw createNetworkError(createBrowserAuthError(failedToParseResponse), responseStatus, responseHeaders, e);
          }
        }
        /**
         * Fetch Client for REST endpoints - Post request
         * @param url
         * @param headers
         * @param body
         */
        async sendPostRequestAsync(url, options) {
          const reqBody = options && options.body || "";
          const reqHeaders = getFetchHeaders(options);
          let response;
          let responseStatus = 0;
          let responseHeaders = {};
          try {
            response = await fetch(url, {
              method: HTTP_REQUEST_TYPE.POST,
              headers: reqHeaders,
              body: reqBody
            });
          } catch (e) {
            throw createNetworkError(createBrowserAuthError(window.navigator.onLine ? postRequestFailed : noNetworkConnectivity), void 0, void 0, e);
          }
          responseHeaders = getHeaderDict(response.headers);
          try {
            responseStatus = response.status;
            return {
              headers: responseHeaders,
              body: await response.json(),
              status: responseStatus
            };
          } catch (e) {
            throw createNetworkError(createBrowserAuthError(failedToParseResponse), responseStatus, responseHeaders, e);
          }
        }
      };
      function getFetchHeaders(options) {
        try {
          const headers = new Headers();
          if (!(options && options.headers)) {
            return headers;
          }
          const optionsHeaders = options.headers;
          Object.entries(optionsHeaders).forEach(([key, value]) => {
            headers.append(key, value);
          });
          return headers;
        } catch (e) {
          throw createNetworkError(createBrowserAuthError(failedToBuildHeaders), void 0, void 0, e);
        }
      }
      function getHeaderDict(headers) {
        try {
          const headerDict = {};
          headers.forEach((value, key) => {
            headerDict[key] = value;
          });
          return headerDict;
        } catch (e) {
          throw createBrowserAuthError(failedToParseHeaders);
        }
      }
      var DEFAULT_POPUP_TIMEOUT_MS = 6e4;
      var DEFAULT_IFRAME_TIMEOUT_MS = 1e4;
      var DEFAULT_REDIRECT_TIMEOUT_MS = 3e4;
      var DEFAULT_NATIVE_BROKER_HANDSHAKE_TIMEOUT_MS = 2e3;
      function buildConfiguration({ auth: userInputAuth, cache: userInputCache, system: userInputSystem, telemetry: userInputTelemetry }, isBrowserEnvironment) {
        const DEFAULT_AUTH_OPTIONS = {
          clientId: Constants.EMPTY_STRING,
          authority: `${Constants.DEFAULT_AUTHORITY}`,
          knownAuthorities: [],
          cloudDiscoveryMetadata: Constants.EMPTY_STRING,
          authorityMetadata: Constants.EMPTY_STRING,
          redirectUri: typeof window !== "undefined" ? getCurrentUri() : "",
          postLogoutRedirectUri: Constants.EMPTY_STRING,
          navigateToLoginRequestUrl: true,
          clientCapabilities: [],
          protocolMode: ProtocolMode.AAD,
          OIDCOptions: {
            serverResponseType: ServerResponseType.FRAGMENT,
            defaultScopes: [
              Constants.OPENID_SCOPE,
              Constants.PROFILE_SCOPE,
              Constants.OFFLINE_ACCESS_SCOPE
            ]
          },
          azureCloudOptions: {
            azureCloudInstance: AzureCloudInstance.None,
            tenant: Constants.EMPTY_STRING
          },
          skipAuthorityMetadataCache: false,
          supportsNestedAppAuth: false,
          instanceAware: false,
          encodeExtraQueryParams: false
        };
        const DEFAULT_CACHE_OPTIONS2 = {
          cacheLocation: BrowserCacheLocation.SessionStorage,
          cacheRetentionDays: 5,
          temporaryCacheLocation: BrowserCacheLocation.SessionStorage,
          storeAuthStateInCookie: false,
          secureCookies: false,
          // Default cache migration to true if cache location is localStorage since entries are preserved across tabs/windows. Migration has little to no benefit in sessionStorage and memoryStorage
          cacheMigrationEnabled: userInputCache && userInputCache.cacheLocation === BrowserCacheLocation.LocalStorage ? true : false,
          claimsBasedCachingEnabled: false
        };
        const DEFAULT_LOGGER_OPTIONS = {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          loggerCallback: () => {
          },
          logLevel: exports.LogLevel.Info,
          piiLoggingEnabled: false
        };
        const DEFAULT_BROWSER_SYSTEM_OPTIONS = {
          ...DEFAULT_SYSTEM_OPTIONS,
          loggerOptions: DEFAULT_LOGGER_OPTIONS,
          networkClient: isBrowserEnvironment ? new FetchClient() : StubbedNetworkModule,
          navigationClient: new NavigationClient(),
          loadFrameTimeout: 0,
          // If loadFrameTimeout is provided, use that as default.
          windowHashTimeout: userInputSystem?.loadFrameTimeout || DEFAULT_POPUP_TIMEOUT_MS,
          iframeHashTimeout: userInputSystem?.loadFrameTimeout || DEFAULT_IFRAME_TIMEOUT_MS,
          navigateFrameWait: 0,
          redirectNavigationTimeout: DEFAULT_REDIRECT_TIMEOUT_MS,
          asyncPopups: false,
          allowRedirectInIframe: false,
          allowPlatformBroker: false,
          nativeBrokerHandshakeTimeout: userInputSystem?.nativeBrokerHandshakeTimeout || DEFAULT_NATIVE_BROKER_HANDSHAKE_TIMEOUT_MS,
          pollIntervalMilliseconds: BrowserConstants.DEFAULT_POLL_INTERVAL_MS
        };
        const providedSystemOptions = {
          ...DEFAULT_BROWSER_SYSTEM_OPTIONS,
          ...userInputSystem,
          loggerOptions: userInputSystem?.loggerOptions || DEFAULT_LOGGER_OPTIONS
        };
        const DEFAULT_TELEMETRY_OPTIONS2 = {
          application: {
            appName: Constants.EMPTY_STRING,
            appVersion: Constants.EMPTY_STRING
          },
          client: new StubPerformanceClient()
        };
        if (userInputAuth?.protocolMode !== ProtocolMode.OIDC && userInputAuth?.OIDCOptions) {
          const logger = new Logger(providedSystemOptions.loggerOptions);
          logger.warning(JSON.stringify(createClientConfigurationError(cannotSetOIDCOptions)));
        }
        if (userInputAuth?.protocolMode && userInputAuth.protocolMode === ProtocolMode.OIDC && providedSystemOptions?.allowPlatformBroker) {
          throw createClientConfigurationError(cannotAllowPlatformBroker);
        }
        const overlayedConfig = {
          auth: {
            ...DEFAULT_AUTH_OPTIONS,
            ...userInputAuth,
            OIDCOptions: {
              ...DEFAULT_AUTH_OPTIONS.OIDCOptions,
              ...userInputAuth?.OIDCOptions
            }
          },
          cache: { ...DEFAULT_CACHE_OPTIONS2, ...userInputCache },
          system: providedSystemOptions,
          telemetry: { ...DEFAULT_TELEMETRY_OPTIONS2, ...userInputTelemetry }
        };
        return overlayedConfig;
      }
      var name = "@azure/msal-browser";
      var version = "4.25.0";
      var PREFIX = "msal";
      var BROWSER_PREFIX = "browser";
      var CACHE_KEY_SEPARATOR = "-";
      var CREDENTIAL_SCHEMA_VERSION = 1;
      var ACCOUNT_SCHEMA_VERSION = 1;
      var LOG_LEVEL_CACHE_KEY = `${PREFIX}.${BROWSER_PREFIX}.log.level`;
      var LOG_PII_CACHE_KEY = `${PREFIX}.${BROWSER_PREFIX}.log.pii`;
      var BROWSER_PERF_ENABLED_KEY = `${PREFIX}.${BROWSER_PREFIX}.performance.enabled`;
      var PLATFORM_AUTH_DOM_SUPPORT = `${PREFIX}.${BROWSER_PREFIX}.platform.auth.dom`;
      var VERSION_CACHE_KEY = `${PREFIX}.version`;
      var ACCOUNT_KEYS = "account.keys";
      var TOKEN_KEYS = "token.keys";
      function getAccountKeysCacheKey(schema = ACCOUNT_SCHEMA_VERSION) {
        if (schema < 1) {
          return `${PREFIX}.${ACCOUNT_KEYS}`;
        }
        return `${PREFIX}.${schema}.${ACCOUNT_KEYS}`;
      }
      function getTokenKeysCacheKey(clientId, schema = CREDENTIAL_SCHEMA_VERSION) {
        if (schema < 1) {
          return `${PREFIX}.${TOKEN_KEYS}.${clientId}`;
        }
        return `${PREFIX}.${schema}.${TOKEN_KEYS}.${clientId}`;
      }
      var BaseOperatingContext = class _BaseOperatingContext {
        static loggerCallback(level, message) {
          switch (level) {
            case exports.LogLevel.Error:
              console.error(message);
              return;
            case exports.LogLevel.Info:
              console.info(message);
              return;
            case exports.LogLevel.Verbose:
              console.debug(message);
              return;
            case exports.LogLevel.Warning:
              console.warn(message);
              return;
            default:
              console.log(message);
              return;
          }
        }
        constructor(config2) {
          this.browserEnvironment = typeof window !== "undefined";
          this.config = buildConfiguration(config2, this.browserEnvironment);
          let sessionStorage;
          try {
            sessionStorage = window[BrowserCacheLocation.SessionStorage];
          } catch (e) {
          }
          const logLevelKey = sessionStorage?.getItem(LOG_LEVEL_CACHE_KEY);
          const piiLoggingKey = sessionStorage?.getItem(LOG_PII_CACHE_KEY)?.toLowerCase();
          const piiLoggingEnabled = piiLoggingKey === "true" ? true : piiLoggingKey === "false" ? false : void 0;
          const loggerOptions = { ...this.config.system.loggerOptions };
          const logLevel = logLevelKey && Object.keys(exports.LogLevel).includes(logLevelKey) ? exports.LogLevel[logLevelKey] : void 0;
          if (logLevel) {
            loggerOptions.loggerCallback = _BaseOperatingContext.loggerCallback;
            loggerOptions.logLevel = logLevel;
          }
          if (piiLoggingEnabled !== void 0) {
            loggerOptions.piiLoggingEnabled = piiLoggingEnabled;
          }
          this.logger = new Logger(loggerOptions, name, version);
          this.available = false;
        }
        /**
         * Return the MSAL config
         * @returns BrowserConfiguration
         */
        getConfig() {
          return this.config;
        }
        /**
         * Returns the MSAL Logger
         * @returns Logger
         */
        getLogger() {
          return this.logger;
        }
        isAvailable() {
          return this.available;
        }
        isBrowserEnvironment() {
          return this.browserEnvironment;
        }
      };
      var BridgeStatusCode = {
        UserInteractionRequired: "USER_INTERACTION_REQUIRED",
        UserCancel: "USER_CANCEL",
        NoNetwork: "NO_NETWORK",
        TransientError: "TRANSIENT_ERROR",
        PersistentError: "PERSISTENT_ERROR",
        Disabled: "DISABLED",
        AccountUnavailable: "ACCOUNT_UNAVAILABLE",
        NestedAppAuthUnavailable: "NESTED_APP_AUTH_UNAVAILABLE"
        // NAA is unavailable in the current context, can retry with standard browser based auth
      };
      var BridgeProxy = class _BridgeProxy {
        /**
         * initializeNestedAppAuthBridge - Initializes the bridge to the host app
         * @returns a promise that resolves to an InitializeBridgeResponse or rejects with an Error
         * @remarks This method will be called by the create factory method
         * @remarks If the bridge is not available, this method will throw an error
         */
        static async initializeNestedAppAuthBridge() {
          if (window === void 0) {
            throw new Error("window is undefined");
          }
          if (window.nestedAppAuthBridge === void 0) {
            throw new Error("window.nestedAppAuthBridge is undefined");
          }
          try {
            window.nestedAppAuthBridge.addEventListener("message", (response) => {
              const responsePayload = typeof response === "string" ? response : response.data;
              const responseEnvelope = JSON.parse(responsePayload);
              const request = _BridgeProxy.bridgeRequests.find((element) => element.requestId === responseEnvelope.requestId);
              if (request !== void 0) {
                _BridgeProxy.bridgeRequests.splice(_BridgeProxy.bridgeRequests.indexOf(request), 1);
                if (responseEnvelope.success) {
                  request.resolve(responseEnvelope);
                } else {
                  request.reject(responseEnvelope.error);
                }
              }
            });
            const bridgeResponse = await new Promise((resolve, reject) => {
              const message = _BridgeProxy.buildRequest("GetInitContext");
              const request = {
                requestId: message.requestId,
                method: message.method,
                resolve,
                reject
              };
              _BridgeProxy.bridgeRequests.push(request);
              window.nestedAppAuthBridge.postMessage(JSON.stringify(message));
            });
            return _BridgeProxy.validateBridgeResultOrThrow(bridgeResponse.initContext);
          } catch (error) {
            window.console.log(error);
            throw error;
          }
        }
        /**
         * getTokenInteractive - Attempts to get a token interactively from the bridge
         * @param request A token request
         * @returns a promise that resolves to an auth result or rejects with a BridgeError
         */
        getTokenInteractive(request) {
          return this.getToken("GetTokenPopup", request);
        }
        /**
         * getTokenSilent Attempts to get a token silently from the bridge
         * @param request A token request
         * @returns a promise that resolves to an auth result or rejects with a BridgeError
         */
        getTokenSilent(request) {
          return this.getToken("GetToken", request);
        }
        async getToken(requestType, request) {
          const result = await this.sendRequest(requestType, {
            tokenParams: request
          });
          return {
            token: _BridgeProxy.validateBridgeResultOrThrow(result.token),
            account: _BridgeProxy.validateBridgeResultOrThrow(result.account)
          };
        }
        getHostCapabilities() {
          return this.capabilities ?? null;
        }
        getAccountContext() {
          return this.accountContext ? this.accountContext : null;
        }
        static buildRequest(method, requestParams) {
          return {
            messageType: "NestedAppAuthRequest",
            method,
            requestId: createNewGuid(),
            sendTime: Date.now(),
            clientLibrary: BrowserConstants.MSAL_SKU,
            clientLibraryVersion: version,
            ...requestParams
          };
        }
        /**
         * A method used to send a request to the bridge
         * @param request A token request
         * @returns a promise that resolves to a response of provided type or rejects with a BridgeError
         */
        sendRequest(method, requestParams) {
          const message = _BridgeProxy.buildRequest(method, requestParams);
          const promise = new Promise((resolve, reject) => {
            const request = {
              requestId: message.requestId,
              method: message.method,
              resolve,
              reject
            };
            _BridgeProxy.bridgeRequests.push(request);
            window.nestedAppAuthBridge.postMessage(JSON.stringify(message));
          });
          return promise;
        }
        static validateBridgeResultOrThrow(input) {
          if (input === void 0) {
            const bridgeError = {
              status: BridgeStatusCode.NestedAppAuthUnavailable
            };
            throw bridgeError;
          }
          return input;
        }
        /**
         * Private constructor for BridgeProxy
         * @param sdkName The name of the SDK being used to make requests on behalf of the app
         * @param sdkVersion The version of the SDK being used to make requests on behalf of the app
         * @param capabilities The capabilities of the bridge / SDK / platform broker
         */
        constructor(sdkName, sdkVersion, accountContext, capabilities) {
          this.sdkName = sdkName;
          this.sdkVersion = sdkVersion;
          this.accountContext = accountContext;
          this.capabilities = capabilities;
        }
        /**
         * Factory method for creating an implementation of IBridgeProxy
         * @returns A promise that resolves to a BridgeProxy implementation
         */
        static async create() {
          const response = await _BridgeProxy.initializeNestedAppAuthBridge();
          return new _BridgeProxy(response.sdkName, response.sdkVersion, response.accountContext, response.capabilities);
        }
      };
      BridgeProxy.bridgeRequests = [];
      var NestedAppOperatingContext = class _NestedAppOperatingContext extends BaseOperatingContext {
        constructor() {
          super(...arguments);
          this.bridgeProxy = void 0;
          this.accountContext = null;
        }
        /**
         * Return the module name.  Intended for use with import() to enable dynamic import
         * of the implementation associated with this operating context
         * @returns
         */
        getModuleName() {
          return _NestedAppOperatingContext.MODULE_NAME;
        }
        /**
         * Returns the unique identifier for this operating context
         * @returns string
         */
        getId() {
          return _NestedAppOperatingContext.ID;
        }
        /**
         * Returns the current BridgeProxy
         * @returns IBridgeProxy | undefined
         */
        getBridgeProxy() {
          return this.bridgeProxy;
        }
        /**
         * Checks whether the operating context is available.
         * Confirms that the code is running a browser rather.  This is required.
         * @returns Promise<boolean> indicating whether this operating context is currently available.
         */
        async initialize() {
          try {
            if (typeof window !== "undefined") {
              if (typeof window.__initializeNestedAppAuth === "function") {
                await window.__initializeNestedAppAuth();
              }
              const bridgeProxy = await BridgeProxy.create();
              this.accountContext = bridgeProxy.getAccountContext();
              this.bridgeProxy = bridgeProxy;
              this.available = bridgeProxy !== void 0;
            }
          } catch (ex) {
            this.logger.infoPii(`Could not initialize Nested App Auth bridge (${ex})`);
          }
          this.logger.info(`Nested App Auth Bridge available: ${this.available}`);
          return this.available;
        }
      };
      NestedAppOperatingContext.MODULE_NAME = "";
      NestedAppOperatingContext.ID = "NestedAppOperatingContext";
      var StandardOperatingContext = class _StandardOperatingContext extends BaseOperatingContext {
        /**
         * Return the module name.  Intended for use with import() to enable dynamic import
         * of the implementation associated with this operating context
         * @returns
         */
        getModuleName() {
          return _StandardOperatingContext.MODULE_NAME;
        }
        /**
         * Returns the unique identifier for this operating context
         * @returns string
         */
        getId() {
          return _StandardOperatingContext.ID;
        }
        /**
         * Checks whether the operating context is available.
         * Confirms that the code is running a browser rather.  This is required.
         * @returns Promise<boolean> indicating whether this operating context is currently available.
         */
        async initialize() {
          this.available = typeof window !== "undefined";
          return this.available;
        }
      };
      StandardOperatingContext.MODULE_NAME = "";
      StandardOperatingContext.ID = "StandardOperatingContext";
      var DatabaseStorage = class {
        constructor() {
          this.dbName = DB_NAME;
          this.version = DB_VERSION;
          this.tableName = DB_TABLE_NAME;
          this.dbOpen = false;
        }
        /**
         * Opens IndexedDB instance.
         */
        async open() {
          return new Promise((resolve, reject) => {
            const openDB = window.indexedDB.open(this.dbName, this.version);
            openDB.addEventListener("upgradeneeded", (e) => {
              const event = e;
              event.target.result.createObjectStore(this.tableName);
            });
            openDB.addEventListener("success", (e) => {
              const event = e;
              this.db = event.target.result;
              this.dbOpen = true;
              resolve();
            });
            openDB.addEventListener("error", () => reject(createBrowserAuthError(databaseUnavailable)));
          });
        }
        /**
         * Closes the connection to IndexedDB database when all pending transactions
         * complete.
         */
        closeConnection() {
          const db = this.db;
          if (db && this.dbOpen) {
            db.close();
            this.dbOpen = false;
          }
        }
        /**
         * Opens database if it's not already open
         */
        async validateDbIsOpen() {
          if (!this.dbOpen) {
            return this.open();
          }
        }
        /**
         * Retrieves item from IndexedDB instance.
         * @param key
         */
        async getItem(key) {
          await this.validateDbIsOpen();
          return new Promise((resolve, reject) => {
            if (!this.db) {
              return reject(createBrowserAuthError(databaseNotOpen));
            }
            const transaction = this.db.transaction([this.tableName], "readonly");
            const objectStore = transaction.objectStore(this.tableName);
            const dbGet = objectStore.get(key);
            dbGet.addEventListener("success", (e) => {
              const event = e;
              this.closeConnection();
              resolve(event.target.result);
            });
            dbGet.addEventListener("error", (e) => {
              this.closeConnection();
              reject(e);
            });
          });
        }
        /**
         * Adds item to IndexedDB under given key
         * @param key
         * @param payload
         */
        async setItem(key, payload) {
          await this.validateDbIsOpen();
          return new Promise((resolve, reject) => {
            if (!this.db) {
              return reject(createBrowserAuthError(databaseNotOpen));
            }
            const transaction = this.db.transaction([this.tableName], "readwrite");
            const objectStore = transaction.objectStore(this.tableName);
            const dbPut = objectStore.put(payload, key);
            dbPut.addEventListener("success", () => {
              this.closeConnection();
              resolve();
            });
            dbPut.addEventListener("error", (e) => {
              this.closeConnection();
              reject(e);
            });
          });
        }
        /**
         * Removes item from IndexedDB under given key
         * @param key
         */
        async removeItem(key) {
          await this.validateDbIsOpen();
          return new Promise((resolve, reject) => {
            if (!this.db) {
              return reject(createBrowserAuthError(databaseNotOpen));
            }
            const transaction = this.db.transaction([this.tableName], "readwrite");
            const objectStore = transaction.objectStore(this.tableName);
            const dbDelete = objectStore.delete(key);
            dbDelete.addEventListener("success", () => {
              this.closeConnection();
              resolve();
            });
            dbDelete.addEventListener("error", (e) => {
              this.closeConnection();
              reject(e);
            });
          });
        }
        /**
         * Get all the keys from the storage object as an iterable array of strings.
         */
        async getKeys() {
          await this.validateDbIsOpen();
          return new Promise((resolve, reject) => {
            if (!this.db) {
              return reject(createBrowserAuthError(databaseNotOpen));
            }
            const transaction = this.db.transaction([this.tableName], "readonly");
            const objectStore = transaction.objectStore(this.tableName);
            const dbGetKeys = objectStore.getAllKeys();
            dbGetKeys.addEventListener("success", (e) => {
              const event = e;
              this.closeConnection();
              resolve(event.target.result);
            });
            dbGetKeys.addEventListener("error", (e) => {
              this.closeConnection();
              reject(e);
            });
          });
        }
        /**
         *
         * Checks whether there is an object under the search key in the object store
         */
        async containsKey(key) {
          await this.validateDbIsOpen();
          return new Promise((resolve, reject) => {
            if (!this.db) {
              return reject(createBrowserAuthError(databaseNotOpen));
            }
            const transaction = this.db.transaction([this.tableName], "readonly");
            const objectStore = transaction.objectStore(this.tableName);
            const dbContainsKey = objectStore.count(key);
            dbContainsKey.addEventListener("success", (e) => {
              const event = e;
              this.closeConnection();
              resolve(event.target.result === 1);
            });
            dbContainsKey.addEventListener("error", (e) => {
              this.closeConnection();
              reject(e);
            });
          });
        }
        /**
         * Deletes the MSAL database. The database is deleted rather than cleared to make it possible
         * for client applications to downgrade to a previous MSAL version without worrying about forward compatibility issues
         * with IndexedDB database versions.
         */
        async deleteDatabase() {
          if (this.db && this.dbOpen) {
            this.closeConnection();
          }
          return new Promise((resolve, reject) => {
            const deleteDbRequest = window.indexedDB.deleteDatabase(DB_NAME);
            const id = setTimeout(() => reject(false), 200);
            deleteDbRequest.addEventListener("success", () => {
              clearTimeout(id);
              return resolve(true);
            });
            deleteDbRequest.addEventListener("blocked", () => {
              clearTimeout(id);
              return resolve(true);
            });
            deleteDbRequest.addEventListener("error", () => {
              clearTimeout(id);
              return reject(false);
            });
          });
        }
      };
      var MemoryStorage = class {
        constructor() {
          this.cache = /* @__PURE__ */ new Map();
        }
        async initialize() {
        }
        getItem(key) {
          return this.cache.get(key) || null;
        }
        getUserData(key) {
          return this.getItem(key);
        }
        setItem(key, value) {
          this.cache.set(key, value);
        }
        async setUserData(key, value) {
          this.setItem(key, value);
        }
        removeItem(key) {
          this.cache.delete(key);
        }
        getKeys() {
          const cacheKeys = [];
          this.cache.forEach((value, key) => {
            cacheKeys.push(key);
          });
          return cacheKeys;
        }
        containsKey(key) {
          return this.cache.has(key);
        }
        clear() {
          this.cache.clear();
        }
        decryptData() {
          return Promise.resolve(null);
        }
      };
      var AsyncMemoryStorage = class {
        constructor(logger) {
          this.inMemoryCache = new MemoryStorage();
          this.indexedDBCache = new DatabaseStorage();
          this.logger = logger;
        }
        handleDatabaseAccessError(error) {
          if (error instanceof BrowserAuthError && error.errorCode === databaseUnavailable) {
            this.logger.error("Could not access persistent storage. This may be caused by browser privacy features which block persistent storage in third-party contexts.");
          } else {
            throw error;
          }
        }
        /**
         * Get the item matching the given key. Tries in-memory cache first, then in the asynchronous
         * storage object if item isn't found in-memory.
         * @param key
         */
        async getItem(key) {
          const item = this.inMemoryCache.getItem(key);
          if (!item) {
            try {
              this.logger.verbose("Queried item not found in in-memory cache, now querying persistent storage.");
              return await this.indexedDBCache.getItem(key);
            } catch (e) {
              this.handleDatabaseAccessError(e);
            }
          }
          return item;
        }
        /**
         * Sets the item in the in-memory cache and then tries to set it in the asynchronous
         * storage object with the given key.
         * @param key
         * @param value
         */
        async setItem(key, value) {
          this.inMemoryCache.setItem(key, value);
          try {
            await this.indexedDBCache.setItem(key, value);
          } catch (e) {
            this.handleDatabaseAccessError(e);
          }
        }
        /**
         * Removes the item matching the key from the in-memory cache, then tries to remove it from the asynchronous storage object.
         * @param key
         */
        async removeItem(key) {
          this.inMemoryCache.removeItem(key);
          try {
            await this.indexedDBCache.removeItem(key);
          } catch (e) {
            this.handleDatabaseAccessError(e);
          }
        }
        /**
         * Get all the keys from the in-memory cache as an iterable array of strings. If no keys are found, query the keys in the
         * asynchronous storage object.
         */
        async getKeys() {
          const cacheKeys = this.inMemoryCache.getKeys();
          if (cacheKeys.length === 0) {
            try {
              this.logger.verbose("In-memory cache is empty, now querying persistent storage.");
              return await this.indexedDBCache.getKeys();
            } catch (e) {
              this.handleDatabaseAccessError(e);
            }
          }
          return cacheKeys;
        }
        /**
         * Returns true or false if the given key is present in the cache.
         * @param key
         */
        async containsKey(key) {
          const containsKey = this.inMemoryCache.containsKey(key);
          if (!containsKey) {
            try {
              this.logger.verbose("Key not found in in-memory cache, now querying persistent storage.");
              return await this.indexedDBCache.containsKey(key);
            } catch (e) {
              this.handleDatabaseAccessError(e);
            }
          }
          return containsKey;
        }
        /**
         * Clears in-memory Map
         */
        clearInMemory() {
          this.logger.verbose(`Deleting in-memory keystore`);
          this.inMemoryCache.clear();
          this.logger.verbose(`In-memory keystore deleted`);
        }
        /**
         * Tries to delete the IndexedDB database
         * @returns
         */
        async clearPersistent() {
          try {
            this.logger.verbose("Deleting persistent keystore");
            const dbDeleted = await this.indexedDBCache.deleteDatabase();
            if (dbDeleted) {
              this.logger.verbose("Persistent keystore deleted");
            }
            return dbDeleted;
          } catch (e) {
            this.handleDatabaseAccessError(e);
            return false;
          }
        }
      };
      var CryptoOps = class _CryptoOps {
        constructor(logger, performanceClient, skipValidateSubtleCrypto) {
          this.logger = logger;
          validateCryptoAvailable(skipValidateSubtleCrypto ?? false);
          this.cache = new AsyncMemoryStorage(this.logger);
          this.performanceClient = performanceClient;
        }
        /**
         * Creates a new random GUID - used to populate state and nonce.
         * @returns string (GUID)
         */
        createNewGuid() {
          return createNewGuid();
        }
        /**
         * Encodes input string to base64.
         * @param input
         */
        base64Encode(input) {
          return base64Encode(input);
        }
        /**
         * Decodes input string from base64.
         * @param input
         */
        base64Decode(input) {
          return base64Decode(input);
        }
        /**
         * Encodes input string to base64 URL safe string.
         * @param input
         */
        base64UrlEncode(input) {
          return urlEncode(input);
        }
        /**
         * Stringifies and base64Url encodes input public key
         * @param inputKid
         * @returns Base64Url encoded public key
         */
        encodeKid(inputKid) {
          return this.base64UrlEncode(JSON.stringify({ kid: inputKid }));
        }
        /**
         * Generates a keypair, stores it and returns a thumbprint
         * @param request
         */
        async getPublicKeyThumbprint(request) {
          const publicKeyThumbMeasurement = this.performanceClient?.startMeasurement(PerformanceEvents.CryptoOptsGetPublicKeyThumbprint, request.correlationId);
          const keyPair = await generateKeyPair(_CryptoOps.EXTRACTABLE, _CryptoOps.POP_KEY_USAGES);
          const publicKeyJwk = await exportJwk(keyPair.publicKey);
          const pubKeyThumprintObj = {
            e: publicKeyJwk.e,
            kty: publicKeyJwk.kty,
            n: publicKeyJwk.n
          };
          const publicJwkString = getSortedObjectString(pubKeyThumprintObj);
          const publicJwkHash = await this.hashString(publicJwkString);
          const privateKeyJwk = await exportJwk(keyPair.privateKey);
          const unextractablePrivateKey = await importJwk(privateKeyJwk, false, ["sign"]);
          await this.cache.setItem(publicJwkHash, {
            privateKey: unextractablePrivateKey,
            publicKey: keyPair.publicKey,
            requestMethod: request.resourceRequestMethod,
            requestUri: request.resourceRequestUri
          });
          if (publicKeyThumbMeasurement) {
            publicKeyThumbMeasurement.end({
              success: true
            });
          }
          return publicJwkHash;
        }
        /**
         * Removes cryptographic keypair from key store matching the keyId passed in
         * @param kid
         */
        async removeTokenBindingKey(kid) {
          await this.cache.removeItem(kid);
          const keyFound = await this.cache.containsKey(kid);
          if (keyFound) {
            throw createClientAuthError(bindingKeyNotRemoved);
          }
        }
        /**
         * Removes all cryptographic keys from IndexedDB storage
         */
        async clearKeystore() {
          this.cache.clearInMemory();
          try {
            await this.cache.clearPersistent();
            return true;
          } catch (e) {
            if (e instanceof Error) {
              this.logger.error(`Clearing keystore failed with error: ${e.message}`);
            } else {
              this.logger.error("Clearing keystore failed with unknown error");
            }
            return false;
          }
        }
        /**
         * Signs the given object as a jwt payload with private key retrieved by given kid.
         * @param payload
         * @param kid
         */
        async signJwt(payload, kid, shrOptions, correlationId) {
          const signJwtMeasurement = this.performanceClient?.startMeasurement(PerformanceEvents.CryptoOptsSignJwt, correlationId);
          const cachedKeyPair = await this.cache.getItem(kid);
          if (!cachedKeyPair) {
            throw createBrowserAuthError(cryptoKeyNotFound);
          }
          const publicKeyJwk = await exportJwk(cachedKeyPair.publicKey);
          const publicKeyJwkString = getSortedObjectString(publicKeyJwk);
          const encodedKeyIdThumbprint = urlEncode(JSON.stringify({ kid }));
          const shrHeader = JoseHeader.getShrHeaderString({
            ...shrOptions?.header,
            alg: publicKeyJwk.alg,
            kid: encodedKeyIdThumbprint
          });
          const encodedShrHeader = urlEncode(shrHeader);
          payload.cnf = {
            jwk: JSON.parse(publicKeyJwkString)
          };
          const encodedPayload = urlEncode(JSON.stringify(payload));
          const tokenString = `${encodedShrHeader}.${encodedPayload}`;
          const encoder = new TextEncoder();
          const tokenBuffer = encoder.encode(tokenString);
          const signatureBuffer = await sign(cachedKeyPair.privateKey, tokenBuffer);
          const encodedSignature = urlEncodeArr(new Uint8Array(signatureBuffer));
          const signedJwt = `${tokenString}.${encodedSignature}`;
          if (signJwtMeasurement) {
            signJwtMeasurement.end({
              success: true
            });
          }
          return signedJwt;
        }
        /**
         * Returns the SHA-256 hash of an input string
         * @param plainText
         */
        async hashString(plainText) {
          return hashString(plainText);
        }
      };
      CryptoOps.POP_KEY_USAGES = ["sign", "verify"];
      CryptoOps.EXTRACTABLE = true;
      function getSortedObjectString(obj) {
        return JSON.stringify(obj, Object.keys(obj).sort());
      }
      var COOKIE_LIFE_MULTIPLIER = 24 * 60 * 60 * 1e3;
      var SameSiteOptions = {
        Lax: "Lax",
        None: "None"
      };
      var CookieStorage = class {
        initialize() {
          return Promise.resolve();
        }
        getItem(key) {
          const name2 = `${encodeURIComponent(key)}`;
          const cookieList = document.cookie.split(";");
          for (let i = 0; i < cookieList.length; i++) {
            const cookie = cookieList[i];
            const [key2, ...rest] = decodeURIComponent(cookie).trim().split("=");
            const value = rest.join("=");
            if (key2 === name2) {
              return value;
            }
          }
          return "";
        }
        getUserData() {
          throw createClientAuthError(methodNotImplemented);
        }
        setItem(key, value, cookieLifeDays, secure = true, sameSite = SameSiteOptions.Lax) {
          let cookieStr = `${encodeURIComponent(key)}=${encodeURIComponent(value)};path=/;SameSite=${sameSite};`;
          if (cookieLifeDays) {
            const expireTime = getCookieExpirationTime(cookieLifeDays);
            cookieStr += `expires=${expireTime};`;
          }
          if (secure || sameSite === SameSiteOptions.None) {
            cookieStr += "Secure;";
          }
          document.cookie = cookieStr;
        }
        async setUserData() {
          return Promise.reject(createClientAuthError(methodNotImplemented));
        }
        removeItem(key) {
          this.setItem(key, "", -1);
        }
        getKeys() {
          const cookieList = document.cookie.split(";");
          const keys = [];
          cookieList.forEach((cookie) => {
            const cookieParts = decodeURIComponent(cookie).trim().split("=");
            keys.push(cookieParts[0]);
          });
          return keys;
        }
        containsKey(key) {
          return this.getKeys().includes(key);
        }
        decryptData() {
          return Promise.resolve(null);
        }
      };
      function getCookieExpirationTime(cookieLifeDays) {
        const today2 = /* @__PURE__ */ new Date();
        const expr = new Date(today2.getTime() + cookieLifeDays * COOKIE_LIFE_MULTIPLIER);
        return expr.toUTCString();
      }
      function getAccountKeys(storage, schemaVersion) {
        const accountKeys = storage.getItem(getAccountKeysCacheKey(schemaVersion));
        if (accountKeys) {
          return JSON.parse(accountKeys);
        }
        return [];
      }
      function getTokenKeys(clientId, storage, schemaVersion) {
        const item = storage.getItem(getTokenKeysCacheKey(clientId, schemaVersion));
        if (item) {
          const tokenKeys = JSON.parse(item);
          if (tokenKeys && tokenKeys.hasOwnProperty("idToken") && tokenKeys.hasOwnProperty("accessToken") && tokenKeys.hasOwnProperty("refreshToken")) {
            return tokenKeys;
          }
        }
        return {
          idToken: [],
          accessToken: [],
          refreshToken: []
        };
      }
      function isEncrypted(data) {
        return data.hasOwnProperty("id") && data.hasOwnProperty("nonce") && data.hasOwnProperty("data");
      }
      var ENCRYPTION_KEY = "msal.cache.encryption";
      var BROADCAST_CHANNEL_NAME$1 = "msal.broadcast.cache";
      var LocalStorage = class {
        constructor(clientId, logger, performanceClient) {
          if (!window.localStorage) {
            throw createBrowserConfigurationAuthError(storageNotSupported);
          }
          this.memoryStorage = new MemoryStorage();
          this.initialized = false;
          this.clientId = clientId;
          this.logger = logger;
          this.performanceClient = performanceClient;
          this.broadcast = new BroadcastChannel(BROADCAST_CHANNEL_NAME$1);
        }
        async initialize(correlationId) {
          const cookies = new CookieStorage();
          const cookieString = cookies.getItem(ENCRYPTION_KEY);
          let parsedCookie = { key: "", id: "" };
          if (cookieString) {
            try {
              parsedCookie = JSON.parse(cookieString);
            } catch (e) {
            }
          }
          if (parsedCookie.key && parsedCookie.id) {
            const baseKey = invoke(base64DecToArr, PerformanceEvents.Base64Decode, this.logger, this.performanceClient, correlationId)(parsedCookie.key);
            this.encryptionCookie = {
              id: parsedCookie.id,
              key: await invokeAsync(generateHKDF, PerformanceEvents.GenerateHKDF, this.logger, this.performanceClient, correlationId)(baseKey)
            };
          } else {
            const id = createNewGuid();
            const baseKey = await invokeAsync(generateBaseKey, PerformanceEvents.GenerateBaseKey, this.logger, this.performanceClient, correlationId)();
            const keyStr = invoke(urlEncodeArr, PerformanceEvents.UrlEncodeArr, this.logger, this.performanceClient, correlationId)(new Uint8Array(baseKey));
            this.encryptionCookie = {
              id,
              key: await invokeAsync(generateHKDF, PerformanceEvents.GenerateHKDF, this.logger, this.performanceClient, correlationId)(baseKey)
            };
            const cookieData = {
              id,
              key: keyStr
            };
            cookies.setItem(
              ENCRYPTION_KEY,
              JSON.stringify(cookieData),
              0,
              // Expiration - 0 means cookie will be cleared at the end of the browser session
              true,
              // Secure flag
              SameSiteOptions.None
              // SameSite must be None to support iframed apps
            );
          }
          await invokeAsync(this.importExistingCache.bind(this), PerformanceEvents.ImportExistingCache, this.logger, this.performanceClient, correlationId)(correlationId);
          this.broadcast.addEventListener("message", this.updateCache.bind(this));
          this.initialized = true;
        }
        getItem(key) {
          return window.localStorage.getItem(key);
        }
        getUserData(key) {
          if (!this.initialized) {
            throw createBrowserAuthError(uninitializedPublicClientApplication);
          }
          return this.memoryStorage.getItem(key);
        }
        async decryptData(key, data, correlationId) {
          if (!this.initialized || !this.encryptionCookie) {
            throw createBrowserAuthError(uninitializedPublicClientApplication);
          }
          if (data.id !== this.encryptionCookie.id) {
            this.performanceClient.incrementFields({ encryptedCacheExpiredCount: 1 }, correlationId);
            return null;
          }
          const decryptedData = await invokeAsync(decrypt, PerformanceEvents.Decrypt, this.logger, this.performanceClient, correlationId)(this.encryptionCookie.key, data.nonce, this.getContext(key), data.data);
          if (!decryptedData) {
            return null;
          }
          try {
            return JSON.parse(decryptedData);
          } catch (e) {
            this.performanceClient.incrementFields({ encryptedCacheCorruptionCount: 1 }, correlationId);
            return null;
          }
        }
        setItem(key, value) {
          window.localStorage.setItem(key, value);
        }
        async setUserData(key, value, correlationId, timestamp) {
          if (!this.initialized || !this.encryptionCookie) {
            throw createBrowserAuthError(uninitializedPublicClientApplication);
          }
          const { data, nonce } = await invokeAsync(encrypt, PerformanceEvents.Encrypt, this.logger, this.performanceClient, correlationId)(this.encryptionCookie.key, value, this.getContext(key));
          const encryptedData = {
            id: this.encryptionCookie.id,
            nonce,
            data,
            lastUpdatedAt: timestamp
          };
          this.memoryStorage.setItem(key, value);
          this.setItem(key, JSON.stringify(encryptedData));
          this.broadcast.postMessage({
            key,
            value,
            context: this.getContext(key)
          });
        }
        removeItem(key) {
          if (this.memoryStorage.containsKey(key)) {
            this.memoryStorage.removeItem(key);
            this.broadcast.postMessage({
              key,
              value: null,
              context: this.getContext(key)
            });
          }
          window.localStorage.removeItem(key);
        }
        getKeys() {
          return Object.keys(window.localStorage);
        }
        containsKey(key) {
          return window.localStorage.hasOwnProperty(key);
        }
        /**
         * Removes all known MSAL keys from the cache
         */
        clear() {
          this.memoryStorage.clear();
          const accountKeys = getAccountKeys(this);
          accountKeys.forEach((key) => this.removeItem(key));
          const tokenKeys = getTokenKeys(this.clientId, this);
          tokenKeys.idToken.forEach((key) => this.removeItem(key));
          tokenKeys.accessToken.forEach((key) => this.removeItem(key));
          tokenKeys.refreshToken.forEach((key) => this.removeItem(key));
          this.getKeys().forEach((cacheKey) => {
            if (cacheKey.startsWith(PREFIX) || cacheKey.indexOf(this.clientId) !== -1) {
              this.removeItem(cacheKey);
            }
          });
        }
        /**
         * Helper to decrypt all known MSAL keys in localStorage and save them to inMemory storage
         * @returns
         */
        async importExistingCache(correlationId) {
          if (!this.encryptionCookie) {
            return;
          }
          let accountKeys = getAccountKeys(this);
          accountKeys = await this.importArray(accountKeys, correlationId);
          if (accountKeys.length) {
            this.setItem(getAccountKeysCacheKey(), JSON.stringify(accountKeys));
          } else {
            this.removeItem(getAccountKeysCacheKey());
          }
          const tokenKeys = getTokenKeys(this.clientId, this);
          tokenKeys.idToken = await this.importArray(tokenKeys.idToken, correlationId);
          tokenKeys.accessToken = await this.importArray(tokenKeys.accessToken, correlationId);
          tokenKeys.refreshToken = await this.importArray(tokenKeys.refreshToken, correlationId);
          if (tokenKeys.idToken.length || tokenKeys.accessToken.length || tokenKeys.refreshToken.length) {
            this.setItem(getTokenKeysCacheKey(this.clientId), JSON.stringify(tokenKeys));
          } else {
            this.removeItem(getTokenKeysCacheKey(this.clientId));
          }
        }
        /**
         * Helper to decrypt and save cache entries
         * @param key
         * @returns
         */
        async getItemFromEncryptedCache(key, correlationId) {
          if (!this.encryptionCookie) {
            return null;
          }
          const rawCache = this.getItem(key);
          if (!rawCache) {
            return null;
          }
          let encObj;
          try {
            encObj = JSON.parse(rawCache);
          } catch (e) {
            return null;
          }
          if (!isEncrypted(encObj)) {
            this.performanceClient.incrementFields({ unencryptedCacheCount: 1 }, correlationId);
            return encObj;
          }
          if (encObj.id !== this.encryptionCookie.id) {
            this.performanceClient.incrementFields({ encryptedCacheExpiredCount: 1 }, correlationId);
            return null;
          }
          return invokeAsync(decrypt, PerformanceEvents.Decrypt, this.logger, this.performanceClient, correlationId)(this.encryptionCookie.key, encObj.nonce, this.getContext(key), encObj.data);
        }
        /**
         * Helper to decrypt and save an array of cache keys
         * @param arr
         * @returns Array of keys successfully imported
         */
        async importArray(arr, correlationId) {
          const importedArr = [];
          const promiseArr = [];
          arr.forEach((key) => {
            const promise = this.getItemFromEncryptedCache(key, correlationId).then((value) => {
              if (value) {
                this.memoryStorage.setItem(key, value);
                importedArr.push(key);
              } else {
                this.removeItem(key);
              }
            });
            promiseArr.push(promise);
          });
          await Promise.all(promiseArr);
          return importedArr;
        }
        /**
         * Gets encryption context for a given cache entry. This is clientId for app specific entries, empty string for shared entries
         * @param key
         * @returns
         */
        getContext(key) {
          let context = "";
          if (key.includes(this.clientId)) {
            context = this.clientId;
          }
          return context;
        }
        updateCache(event) {
          this.logger.trace("Updating internal cache from broadcast event");
          const perfMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.LocalStorageUpdated);
          perfMeasurement.add({ isBackground: true });
          const { key, value, context } = event.data;
          if (!key) {
            this.logger.error("Broadcast event missing key");
            perfMeasurement.end({ success: false, errorCode: "noKey" });
            return;
          }
          if (context && context !== this.clientId) {
            this.logger.trace(`Ignoring broadcast event from clientId: ${context}`);
            perfMeasurement.end({
              success: false,
              errorCode: "contextMismatch"
            });
            return;
          }
          if (!value) {
            this.memoryStorage.removeItem(key);
            this.logger.verbose("Removed item from internal cache");
          } else {
            this.memoryStorage.setItem(key, value);
            this.logger.verbose("Updated item in internal cache");
          }
          perfMeasurement.end({ success: true });
        }
      };
      var SessionStorage = class {
        constructor() {
          if (!window.sessionStorage) {
            throw createBrowserConfigurationAuthError(storageNotSupported);
          }
        }
        async initialize() {
        }
        getItem(key) {
          return window.sessionStorage.getItem(key);
        }
        getUserData(key) {
          return this.getItem(key);
        }
        setItem(key, value) {
          window.sessionStorage.setItem(key, value);
        }
        async setUserData(key, value) {
          this.setItem(key, value);
        }
        removeItem(key) {
          window.sessionStorage.removeItem(key);
        }
        getKeys() {
          return Object.keys(window.sessionStorage);
        }
        containsKey(key) {
          return window.sessionStorage.hasOwnProperty(key);
        }
        decryptData() {
          return Promise.resolve(null);
        }
      };
      var EventType = {
        INITIALIZE_START: "msal:initializeStart",
        INITIALIZE_END: "msal:initializeEnd",
        ACCOUNT_ADDED: "msal:accountAdded",
        ACCOUNT_REMOVED: "msal:accountRemoved",
        ACTIVE_ACCOUNT_CHANGED: "msal:activeAccountChanged",
        LOGIN_START: "msal:loginStart",
        LOGIN_SUCCESS: "msal:loginSuccess",
        LOGIN_FAILURE: "msal:loginFailure",
        ACQUIRE_TOKEN_START: "msal:acquireTokenStart",
        ACQUIRE_TOKEN_SUCCESS: "msal:acquireTokenSuccess",
        ACQUIRE_TOKEN_FAILURE: "msal:acquireTokenFailure",
        ACQUIRE_TOKEN_NETWORK_START: "msal:acquireTokenFromNetworkStart",
        SSO_SILENT_START: "msal:ssoSilentStart",
        SSO_SILENT_SUCCESS: "msal:ssoSilentSuccess",
        SSO_SILENT_FAILURE: "msal:ssoSilentFailure",
        ACQUIRE_TOKEN_BY_CODE_START: "msal:acquireTokenByCodeStart",
        ACQUIRE_TOKEN_BY_CODE_SUCCESS: "msal:acquireTokenByCodeSuccess",
        ACQUIRE_TOKEN_BY_CODE_FAILURE: "msal:acquireTokenByCodeFailure",
        HANDLE_REDIRECT_START: "msal:handleRedirectStart",
        HANDLE_REDIRECT_END: "msal:handleRedirectEnd",
        POPUP_OPENED: "msal:popupOpened",
        LOGOUT_START: "msal:logoutStart",
        LOGOUT_SUCCESS: "msal:logoutSuccess",
        LOGOUT_FAILURE: "msal:logoutFailure",
        LOGOUT_END: "msal:logoutEnd",
        RESTORE_FROM_BFCACHE: "msal:restoreFromBFCache",
        BROKER_CONNECTION_ESTABLISHED: "msal:brokerConnectionEstablished"
      };
      function removeElementFromArray(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
          array.splice(index, 1);
        }
      }
      var BrowserCacheManager = class extends CacheManager {
        constructor(clientId, cacheConfig, cryptoImpl, logger, performanceClient, eventHandler, staticAuthorityOptions) {
          super(clientId, cryptoImpl, logger, performanceClient, staticAuthorityOptions);
          this.cacheConfig = cacheConfig;
          this.logger = logger;
          this.internalStorage = new MemoryStorage();
          this.browserStorage = getStorageImplementation(clientId, cacheConfig.cacheLocation, logger, performanceClient);
          this.temporaryCacheStorage = getStorageImplementation(clientId, cacheConfig.temporaryCacheLocation, logger, performanceClient);
          this.cookieStorage = new CookieStorage();
          this.eventHandler = eventHandler;
        }
        async initialize(correlationId) {
          this.performanceClient.addFields({
            cacheLocation: this.cacheConfig.cacheLocation,
            cacheRetentionDays: this.cacheConfig.cacheRetentionDays
          }, correlationId);
          await this.browserStorage.initialize(correlationId);
          await this.migrateExistingCache(correlationId);
          this.trackVersionChanges(correlationId);
        }
        /**
         * Migrates any existing cache data from previous versions of MSAL.js into the current cache structure.
         */
        async migrateExistingCache(correlationId) {
          const accountKeys0 = getAccountKeys(this.browserStorage, 0);
          const tokenKeys0 = getTokenKeys(this.clientId, this.browserStorage, 0);
          this.performanceClient.addFields({
            oldAccountCount: accountKeys0.length,
            oldAccessCount: tokenKeys0.accessToken.length,
            oldIdCount: tokenKeys0.idToken.length,
            oldRefreshCount: tokenKeys0.refreshToken.length
          }, correlationId);
          const accountKeys1 = getAccountKeys(this.browserStorage, 1);
          const tokenKeys1 = getTokenKeys(this.clientId, this.browserStorage, 1);
          this.performanceClient.addFields({
            currAccountCount: accountKeys1.length,
            currAccessCount: tokenKeys1.accessToken.length,
            currIdCount: tokenKeys1.idToken.length,
            currRefreshCount: tokenKeys1.refreshToken.length
          }, correlationId);
          await Promise.all([
            this.updateV0ToCurrent(ACCOUNT_SCHEMA_VERSION, accountKeys0, accountKeys1, correlationId),
            this.updateV0ToCurrent(CREDENTIAL_SCHEMA_VERSION, tokenKeys0.idToken, tokenKeys1.idToken, correlationId),
            this.updateV0ToCurrent(CREDENTIAL_SCHEMA_VERSION, tokenKeys0.accessToken, tokenKeys1.accessToken, correlationId),
            this.updateV0ToCurrent(CREDENTIAL_SCHEMA_VERSION, tokenKeys0.refreshToken, tokenKeys1.refreshToken, correlationId)
          ]);
          if (accountKeys0.length > 0) {
            this.browserStorage.setItem(getAccountKeysCacheKey(0), JSON.stringify(accountKeys0));
          } else {
            this.browserStorage.removeItem(getAccountKeysCacheKey(0));
          }
          if (accountKeys1.length > 0) {
            this.browserStorage.setItem(getAccountKeysCacheKey(1), JSON.stringify(accountKeys1));
          } else {
            this.browserStorage.removeItem(getAccountKeysCacheKey(1));
          }
          this.setTokenKeys(tokenKeys0, correlationId, 0);
          this.setTokenKeys(tokenKeys1, correlationId, 1);
        }
        async updateV0ToCurrent(currentSchema, v0Keys, v1Keys, correlationId) {
          const upgradePromises = [];
          for (const v0Key of [...v0Keys]) {
            const rawV0Value = this.browserStorage.getItem(v0Key);
            const parsedV0Value = this.validateAndParseJson(rawV0Value || "");
            if (!parsedV0Value) {
              removeElementFromArray(v0Keys, v0Key);
              continue;
            }
            if (!parsedV0Value.lastUpdatedAt) {
              parsedV0Value.lastUpdatedAt = Date.now().toString();
              this.setItem(v0Key, JSON.stringify(parsedV0Value), correlationId);
            }
            const decryptedData = isEncrypted(parsedV0Value) ? await this.browserStorage.decryptData(v0Key, parsedV0Value, correlationId) : parsedV0Value;
            let expirationTime;
            if (decryptedData) {
              if (isAccessTokenEntity(decryptedData)) {
                expirationTime = decryptedData.expiresOn;
              } else if (isRefreshTokenEntity(decryptedData)) {
                expirationTime = decryptedData.expiresOn;
              }
            }
            if (!decryptedData || isCacheExpired(parsedV0Value.lastUpdatedAt, this.cacheConfig.cacheRetentionDays) || expirationTime && isTokenExpired(expirationTime, DEFAULT_TOKEN_RENEWAL_OFFSET_SEC)) {
              this.browserStorage.removeItem(v0Key);
              removeElementFromArray(v0Keys, v0Key);
              this.performanceClient.incrementFields({ expiredCacheRemovedCount: 1 }, correlationId);
              continue;
            }
            if (this.cacheConfig.cacheLocation !== BrowserCacheLocation.LocalStorage || isEncrypted(parsedV0Value)) {
              const v1Key = `${PREFIX}.${currentSchema}${CACHE_KEY_SEPARATOR}${v0Key}`;
              const rawV1Entry = this.browserStorage.getItem(v1Key);
              if (!rawV1Entry) {
                upgradePromises.push(this.setUserData(v1Key, JSON.stringify(decryptedData), correlationId, parsedV0Value.lastUpdatedAt).then(() => {
                  v1Keys.push(v1Key);
                  this.performanceClient.incrementFields({ upgradedCacheCount: 1 }, correlationId);
                }));
                continue;
              } else {
                const parsedV1Entry = this.validateAndParseJson(rawV1Entry);
                if (Number(parsedV0Value.lastUpdatedAt) > Number(parsedV1Entry.lastUpdatedAt)) {
                  upgradePromises.push(this.setUserData(v1Key, JSON.stringify(decryptedData), correlationId, parsedV0Value.lastUpdatedAt).then(() => {
                    this.performanceClient.incrementFields({ updatedCacheFromV0Count: 1 }, correlationId);
                  }));
                  continue;
                }
              }
            }
          }
          return Promise.all(upgradePromises);
        }
        /**
         * Tracks upgrades and downgrades for telemetry and debugging purposes
         */
        trackVersionChanges(correlationId) {
          const previousVersion = this.browserStorage.getItem(VERSION_CACHE_KEY);
          if (previousVersion) {
            this.logger.info(`MSAL.js was last initialized by version: ${previousVersion}`);
            this.performanceClient.addFields({ previousLibraryVersion: previousVersion }, correlationId);
          }
          if (previousVersion !== version) {
            this.setItem(VERSION_CACHE_KEY, version, correlationId);
          }
        }
        /**
         * Parses passed value as JSON object, JSON.parse() will throw an error.
         * @param input
         */
        validateAndParseJson(jsonValue) {
          if (!jsonValue) {
            return null;
          }
          try {
            const parsedJson = JSON.parse(jsonValue);
            return parsedJson && typeof parsedJson === "object" ? parsedJson : null;
          } catch (error) {
            return null;
          }
        }
        /**
         * Helper to setItem in browser storage, with cleanup in case of quota errors
         * @param key
         * @param value
         */
        setItem(key, value, correlationId) {
          let tokenKeysV0Count = 0;
          let accessTokenKeys = [];
          const maxRetries = 20;
          for (let i = 0; i <= maxRetries; i++) {
            try {
              this.browserStorage.setItem(key, value);
              if (i > 0) {
                if (i <= tokenKeysV0Count) {
                  this.removeAccessTokenKeys(accessTokenKeys.slice(0, i), correlationId, 0);
                } else {
                  this.removeAccessTokenKeys(accessTokenKeys.slice(0, tokenKeysV0Count), correlationId, 0);
                  this.removeAccessTokenKeys(accessTokenKeys.slice(tokenKeysV0Count, i), correlationId);
                }
              }
              break;
            } catch (e) {
              const cacheError = createCacheError(e);
              if (cacheError.errorCode === cacheQuotaExceeded && i < maxRetries) {
                if (!accessTokenKeys.length) {
                  const tokenKeys0 = key === getTokenKeysCacheKey(this.clientId, 0) ? JSON.parse(value).accessToken : this.getTokenKeys(0).accessToken;
                  const tokenKeys1 = key === getTokenKeysCacheKey(this.clientId) ? JSON.parse(value).accessToken : this.getTokenKeys().accessToken;
                  accessTokenKeys = [...tokenKeys0, ...tokenKeys1];
                  tokenKeysV0Count = tokenKeys0.length;
                }
                if (accessTokenKeys.length <= i) {
                  throw cacheError;
                }
                this.removeAccessToken(
                  accessTokenKeys[i],
                  correlationId,
                  false
                  // Don't save token keys yet, do it at the end
                );
              } else {
                throw cacheError;
              }
            }
          }
        }
        /**
         * Helper to setUserData in browser storage, with cleanup in case of quota errors
         * @param key
         * @param value
         * @param correlationId
         */
        async setUserData(key, value, correlationId, timestamp) {
          let tokenKeysV0Count = 0;
          let accessTokenKeys = [];
          const maxRetries = 20;
          for (let i = 0; i <= maxRetries; i++) {
            try {
              await invokeAsync(this.browserStorage.setUserData.bind(this.browserStorage), PerformanceEvents.SetUserData, this.logger, this.performanceClient)(key, value, correlationId, timestamp);
              if (i > 0) {
                if (i <= tokenKeysV0Count) {
                  this.removeAccessTokenKeys(accessTokenKeys.slice(0, i), correlationId, 0);
                } else {
                  this.removeAccessTokenKeys(accessTokenKeys.slice(0, tokenKeysV0Count), correlationId, 0);
                  this.removeAccessTokenKeys(accessTokenKeys.slice(tokenKeysV0Count, i), correlationId);
                }
              }
              break;
            } catch (e) {
              const cacheError = createCacheError(e);
              if (cacheError.errorCode === cacheQuotaExceeded && i < maxRetries) {
                if (!accessTokenKeys.length) {
                  const tokenKeys0 = this.getTokenKeys(0).accessToken;
                  const tokenKeys1 = this.getTokenKeys().accessToken;
                  accessTokenKeys = [...tokenKeys0, ...tokenKeys1];
                  tokenKeysV0Count = tokenKeys0.length;
                }
                if (accessTokenKeys.length <= i) {
                  throw cacheError;
                }
                this.removeAccessToken(
                  accessTokenKeys[i],
                  correlationId,
                  false
                  // Don't save token keys yet, do it at the end
                );
              } else {
                throw cacheError;
              }
            }
          }
        }
        /**
         * Reads account from cache, deserializes it into an account entity and returns it.
         * If account is not found from the key, returns null and removes key from map.
         * @param accountKey
         * @returns
         */
        getAccount(accountKey, correlationId) {
          this.logger.trace("BrowserCacheManager.getAccount called");
          const serializedAccount = this.browserStorage.getUserData(accountKey);
          if (!serializedAccount) {
            this.removeAccountKeyFromMap(accountKey, correlationId);
            return null;
          }
          const parsedAccount = this.validateAndParseJson(serializedAccount);
          if (!parsedAccount || !AccountEntity.isAccountEntity(parsedAccount)) {
            return null;
          }
          return CacheManager.toObject(new AccountEntity(), parsedAccount);
        }
        /**
         * set account entity in the platform cache
         * @param account
         */
        async setAccount(account2, correlationId) {
          this.logger.trace("BrowserCacheManager.setAccount called");
          const key = this.generateAccountKey(account2.getAccountInfo());
          const timestamp = Date.now().toString();
          account2.lastUpdatedAt = timestamp;
          await this.setUserData(key, JSON.stringify(account2), correlationId, timestamp);
          const wasAdded = this.addAccountKeyToMap(key, correlationId);
          if (this.cacheConfig.cacheLocation === BrowserCacheLocation.LocalStorage && wasAdded) {
            this.eventHandler.emitEvent(EventType.ACCOUNT_ADDED, void 0, account2.getAccountInfo());
          }
        }
        /**
         * Returns the array of account keys currently cached
         * @returns
         */
        getAccountKeys() {
          return getAccountKeys(this.browserStorage);
        }
        /**
         * Add a new account to the key map
         * @param key
         */
        addAccountKeyToMap(key, correlationId) {
          this.logger.trace("BrowserCacheManager.addAccountKeyToMap called");
          this.logger.tracePii(`BrowserCacheManager.addAccountKeyToMap called with key: ${key}`);
          const accountKeys = this.getAccountKeys();
          if (accountKeys.indexOf(key) === -1) {
            accountKeys.push(key);
            this.setItem(getAccountKeysCacheKey(), JSON.stringify(accountKeys), correlationId);
            this.logger.verbose("BrowserCacheManager.addAccountKeyToMap account key added");
            return true;
          } else {
            this.logger.verbose("BrowserCacheManager.addAccountKeyToMap account key already exists in map");
            return false;
          }
        }
        /**
         * Remove an account from the key map
         * @param key
         */
        removeAccountKeyFromMap(key, correlationId) {
          this.logger.trace("BrowserCacheManager.removeAccountKeyFromMap called");
          this.logger.tracePii(`BrowserCacheManager.removeAccountKeyFromMap called with key: ${key}`);
          const accountKeys = this.getAccountKeys();
          const removalIndex = accountKeys.indexOf(key);
          if (removalIndex > -1) {
            accountKeys.splice(removalIndex, 1);
            if (accountKeys.length === 0) {
              this.removeItem(getAccountKeysCacheKey());
              return;
            } else {
              this.setItem(getAccountKeysCacheKey(), JSON.stringify(accountKeys), correlationId);
            }
            this.logger.trace("BrowserCacheManager.removeAccountKeyFromMap account key removed");
          } else {
            this.logger.trace("BrowserCacheManager.removeAccountKeyFromMap key not found in existing map");
          }
        }
        /**
         * Extends inherited removeAccount function to include removal of the account key from the map
         * @param key
         */
        removeAccount(account2, correlationId) {
          const activeAccount = this.getActiveAccount(correlationId);
          if (activeAccount?.homeAccountId === account2.homeAccountId && activeAccount?.environment === account2.environment) {
            this.setActiveAccount(null, correlationId);
          }
          super.removeAccount(account2, correlationId);
          this.removeAccountKeyFromMap(this.generateAccountKey(account2), correlationId);
          this.browserStorage.getKeys().forEach((key) => {
            if (key.includes(account2.homeAccountId) && key.includes(account2.environment)) {
              this.browserStorage.removeItem(key);
            }
          });
          if (this.cacheConfig.cacheLocation === BrowserCacheLocation.LocalStorage) {
            this.eventHandler.emitEvent(EventType.ACCOUNT_REMOVED, void 0, account2);
          }
        }
        /**
         * Removes given idToken from the cache and from the key map
         * @param key
         */
        removeIdToken(key, correlationId) {
          super.removeIdToken(key, correlationId);
          const tokenKeys = this.getTokenKeys();
          const idRemoval = tokenKeys.idToken.indexOf(key);
          if (idRemoval > -1) {
            this.logger.info("idToken removed from tokenKeys map");
            tokenKeys.idToken.splice(idRemoval, 1);
            this.setTokenKeys(tokenKeys, correlationId);
          }
        }
        /**
         * Removes given accessToken from the cache and from the key map
         * @param key
         */
        removeAccessToken(key, correlationId, updateTokenKeys = true) {
          super.removeAccessToken(key, correlationId);
          updateTokenKeys && this.removeAccessTokenKeys([key], correlationId);
        }
        /**
         * Remove access token key from the key map
         * @param key
         * @param correlationId
         * @param tokenKeys
         */
        removeAccessTokenKeys(keys, correlationId, schemaVersion = CREDENTIAL_SCHEMA_VERSION) {
          this.logger.trace("removeAccessTokenKey called");
          const tokenKeys = this.getTokenKeys(schemaVersion);
          let keysRemoved = 0;
          keys.forEach((key) => {
            const accessRemoval = tokenKeys.accessToken.indexOf(key);
            if (accessRemoval > -1) {
              tokenKeys.accessToken.splice(accessRemoval, 1);
              keysRemoved++;
            }
          });
          if (keysRemoved > 0) {
            this.logger.info(`removed ${keysRemoved} accessToken keys from tokenKeys map`);
            this.setTokenKeys(tokenKeys, correlationId, schemaVersion);
            return;
          }
        }
        /**
         * Removes given refreshToken from the cache and from the key map
         * @param key
         */
        removeRefreshToken(key, correlationId) {
          super.removeRefreshToken(key, correlationId);
          const tokenKeys = this.getTokenKeys();
          const refreshRemoval = tokenKeys.refreshToken.indexOf(key);
          if (refreshRemoval > -1) {
            this.logger.info("refreshToken removed from tokenKeys map");
            tokenKeys.refreshToken.splice(refreshRemoval, 1);
            this.setTokenKeys(tokenKeys, correlationId);
          }
        }
        /**
         * Gets the keys for the cached tokens associated with this clientId
         * @returns
         */
        getTokenKeys(schemaVersion = CREDENTIAL_SCHEMA_VERSION) {
          return getTokenKeys(this.clientId, this.browserStorage, schemaVersion);
        }
        /**
         * Stores the token keys in the cache
         * @param tokenKeys
         * @param correlationId
         * @returns
         */
        setTokenKeys(tokenKeys, correlationId, schemaVersion = CREDENTIAL_SCHEMA_VERSION) {
          if (tokenKeys.idToken.length === 0 && tokenKeys.accessToken.length === 0 && tokenKeys.refreshToken.length === 0) {
            this.removeItem(getTokenKeysCacheKey(this.clientId, schemaVersion));
            return;
          } else {
            this.setItem(getTokenKeysCacheKey(this.clientId, schemaVersion), JSON.stringify(tokenKeys), correlationId);
          }
        }
        /**
         * generates idToken entity from a string
         * @param idTokenKey
         */
        getIdTokenCredential(idTokenKey, correlationId) {
          const value = this.browserStorage.getUserData(idTokenKey);
          if (!value) {
            this.logger.trace("BrowserCacheManager.getIdTokenCredential: called, no cache hit");
            this.removeIdToken(idTokenKey, correlationId);
            return null;
          }
          const parsedIdToken = this.validateAndParseJson(value);
          if (!parsedIdToken || !isIdTokenEntity(parsedIdToken)) {
            this.logger.trace("BrowserCacheManager.getIdTokenCredential: called, no cache hit");
            return null;
          }
          this.logger.trace("BrowserCacheManager.getIdTokenCredential: cache hit");
          return parsedIdToken;
        }
        /**
         * set IdToken credential to the platform cache
         * @param idToken
         */
        async setIdTokenCredential(idToken, correlationId) {
          this.logger.trace("BrowserCacheManager.setIdTokenCredential called");
          const idTokenKey = this.generateCredentialKey(idToken);
          const timestamp = Date.now().toString();
          idToken.lastUpdatedAt = timestamp;
          await this.setUserData(idTokenKey, JSON.stringify(idToken), correlationId, timestamp);
          const tokenKeys = this.getTokenKeys();
          if (tokenKeys.idToken.indexOf(idTokenKey) === -1) {
            this.logger.info("BrowserCacheManager: addTokenKey - idToken added to map");
            tokenKeys.idToken.push(idTokenKey);
            this.setTokenKeys(tokenKeys, correlationId);
          }
        }
        /**
         * generates accessToken entity from a string
         * @param key
         */
        getAccessTokenCredential(accessTokenKey, correlationId) {
          const value = this.browserStorage.getUserData(accessTokenKey);
          if (!value) {
            this.logger.trace("BrowserCacheManager.getAccessTokenCredential: called, no cache hit");
            this.removeAccessTokenKeys([accessTokenKey], correlationId);
            return null;
          }
          const parsedAccessToken = this.validateAndParseJson(value);
          if (!parsedAccessToken || !isAccessTokenEntity(parsedAccessToken)) {
            this.logger.trace("BrowserCacheManager.getAccessTokenCredential: called, no cache hit");
            return null;
          }
          this.logger.trace("BrowserCacheManager.getAccessTokenCredential: cache hit");
          return parsedAccessToken;
        }
        /**
         * set accessToken credential to the platform cache
         * @param accessToken
         */
        async setAccessTokenCredential(accessToken, correlationId) {
          this.logger.trace("BrowserCacheManager.setAccessTokenCredential called");
          const accessTokenKey = this.generateCredentialKey(accessToken);
          const timestamp = Date.now().toString();
          accessToken.lastUpdatedAt = timestamp;
          await this.setUserData(accessTokenKey, JSON.stringify(accessToken), correlationId, timestamp);
          const tokenKeys = this.getTokenKeys();
          const index = tokenKeys.accessToken.indexOf(accessTokenKey);
          if (index !== -1) {
            tokenKeys.accessToken.splice(index, 1);
          }
          this.logger.trace(`access token ${index === -1 ? "added to" : "updated in"} map`);
          tokenKeys.accessToken.push(accessTokenKey);
          this.setTokenKeys(tokenKeys, correlationId);
        }
        /**
         * generates refreshToken entity from a string
         * @param refreshTokenKey
         */
        getRefreshTokenCredential(refreshTokenKey, correlationId) {
          const value = this.browserStorage.getUserData(refreshTokenKey);
          if (!value) {
            this.logger.trace("BrowserCacheManager.getRefreshTokenCredential: called, no cache hit");
            this.removeRefreshToken(refreshTokenKey, correlationId);
            return null;
          }
          const parsedRefreshToken = this.validateAndParseJson(value);
          if (!parsedRefreshToken || !isRefreshTokenEntity(parsedRefreshToken)) {
            this.logger.trace("BrowserCacheManager.getRefreshTokenCredential: called, no cache hit");
            return null;
          }
          this.logger.trace("BrowserCacheManager.getRefreshTokenCredential: cache hit");
          return parsedRefreshToken;
        }
        /**
         * set refreshToken credential to the platform cache
         * @param refreshToken
         */
        async setRefreshTokenCredential(refreshToken, correlationId) {
          this.logger.trace("BrowserCacheManager.setRefreshTokenCredential called");
          const refreshTokenKey = this.generateCredentialKey(refreshToken);
          const timestamp = Date.now().toString();
          refreshToken.lastUpdatedAt = timestamp;
          await this.setUserData(refreshTokenKey, JSON.stringify(refreshToken), correlationId, timestamp);
          const tokenKeys = this.getTokenKeys();
          if (tokenKeys.refreshToken.indexOf(refreshTokenKey) === -1) {
            this.logger.info("BrowserCacheManager: addTokenKey - refreshToken added to map");
            tokenKeys.refreshToken.push(refreshTokenKey);
            this.setTokenKeys(tokenKeys, correlationId);
          }
        }
        /**
         * fetch appMetadata entity from the platform cache
         * @param appMetadataKey
         */
        getAppMetadata(appMetadataKey) {
          const value = this.browserStorage.getItem(appMetadataKey);
          if (!value) {
            this.logger.trace("BrowserCacheManager.getAppMetadata: called, no cache hit");
            return null;
          }
          const parsedMetadata = this.validateAndParseJson(value);
          if (!parsedMetadata || !isAppMetadataEntity(appMetadataKey, parsedMetadata)) {
            this.logger.trace("BrowserCacheManager.getAppMetadata: called, no cache hit");
            return null;
          }
          this.logger.trace("BrowserCacheManager.getAppMetadata: cache hit");
          return parsedMetadata;
        }
        /**
         * set appMetadata entity to the platform cache
         * @param appMetadata
         */
        setAppMetadata(appMetadata, correlationId) {
          this.logger.trace("BrowserCacheManager.setAppMetadata called");
          const appMetadataKey = generateAppMetadataKey(appMetadata);
          this.setItem(appMetadataKey, JSON.stringify(appMetadata), correlationId);
        }
        /**
         * fetch server telemetry entity from the platform cache
         * @param serverTelemetryKey
         */
        getServerTelemetry(serverTelemetryKey) {
          const value = this.browserStorage.getItem(serverTelemetryKey);
          if (!value) {
            this.logger.trace("BrowserCacheManager.getServerTelemetry: called, no cache hit");
            return null;
          }
          const parsedEntity = this.validateAndParseJson(value);
          if (!parsedEntity || !isServerTelemetryEntity(serverTelemetryKey, parsedEntity)) {
            this.logger.trace("BrowserCacheManager.getServerTelemetry: called, no cache hit");
            return null;
          }
          this.logger.trace("BrowserCacheManager.getServerTelemetry: cache hit");
          return parsedEntity;
        }
        /**
         * set server telemetry entity to the platform cache
         * @param serverTelemetryKey
         * @param serverTelemetry
         */
        setServerTelemetry(serverTelemetryKey, serverTelemetry, correlationId) {
          this.logger.trace("BrowserCacheManager.setServerTelemetry called");
          this.setItem(serverTelemetryKey, JSON.stringify(serverTelemetry), correlationId);
        }
        /**
         *
         */
        getAuthorityMetadata(key) {
          const value = this.internalStorage.getItem(key);
          if (!value) {
            this.logger.trace("BrowserCacheManager.getAuthorityMetadata: called, no cache hit");
            return null;
          }
          const parsedMetadata = this.validateAndParseJson(value);
          if (parsedMetadata && isAuthorityMetadataEntity(key, parsedMetadata)) {
            this.logger.trace("BrowserCacheManager.getAuthorityMetadata: cache hit");
            return parsedMetadata;
          }
          return null;
        }
        /**
         *
         */
        getAuthorityMetadataKeys() {
          const allKeys = this.internalStorage.getKeys();
          return allKeys.filter((key) => {
            return this.isAuthorityMetadata(key);
          });
        }
        /**
         * Sets wrapper metadata in memory
         * @param wrapperSKU
         * @param wrapperVersion
         */
        setWrapperMetadata(wrapperSKU, wrapperVersion) {
          this.internalStorage.setItem(InMemoryCacheKeys.WRAPPER_SKU, wrapperSKU);
          this.internalStorage.setItem(InMemoryCacheKeys.WRAPPER_VER, wrapperVersion);
        }
        /**
         * Returns wrapper metadata from in-memory storage
         */
        getWrapperMetadata() {
          const sku = this.internalStorage.getItem(InMemoryCacheKeys.WRAPPER_SKU) || Constants.EMPTY_STRING;
          const version2 = this.internalStorage.getItem(InMemoryCacheKeys.WRAPPER_VER) || Constants.EMPTY_STRING;
          return [sku, version2];
        }
        /**
         *
         * @param entity
         */
        setAuthorityMetadata(key, entity) {
          this.logger.trace("BrowserCacheManager.setAuthorityMetadata called");
          this.internalStorage.setItem(key, JSON.stringify(entity));
        }
        /**
         * Gets the active account
         */
        getActiveAccount(correlationId) {
          const activeAccountKeyFilters = this.generateCacheKey(PersistentCacheKeys.ACTIVE_ACCOUNT_FILTERS);
          const activeAccountValueFilters = this.browserStorage.getItem(activeAccountKeyFilters);
          if (!activeAccountValueFilters) {
            this.logger.trace("BrowserCacheManager.getActiveAccount: No active account filters found");
            return null;
          }
          const activeAccountValueObj = this.validateAndParseJson(activeAccountValueFilters);
          if (activeAccountValueObj) {
            this.logger.trace("BrowserCacheManager.getActiveAccount: Active account filters schema found");
            return this.getAccountInfoFilteredBy({
              homeAccountId: activeAccountValueObj.homeAccountId,
              localAccountId: activeAccountValueObj.localAccountId,
              tenantId: activeAccountValueObj.tenantId
            }, correlationId);
          }
          this.logger.trace("BrowserCacheManager.getActiveAccount: No active account found");
          return null;
        }
        /**
         * Sets the active account's localAccountId in cache
         * @param account
         */
        setActiveAccount(account2, correlationId) {
          const activeAccountKey = this.generateCacheKey(PersistentCacheKeys.ACTIVE_ACCOUNT_FILTERS);
          if (account2) {
            this.logger.verbose("setActiveAccount: Active account set");
            const activeAccountValue = {
              homeAccountId: account2.homeAccountId,
              localAccountId: account2.localAccountId,
              tenantId: account2.tenantId,
              lastUpdatedAt: nowSeconds().toString()
            };
            this.setItem(activeAccountKey, JSON.stringify(activeAccountValue), correlationId);
          } else {
            this.logger.verbose("setActiveAccount: No account passed, active account not set");
            this.browserStorage.removeItem(activeAccountKey);
          }
          this.eventHandler.emitEvent(EventType.ACTIVE_ACCOUNT_CHANGED);
        }
        /**
         * fetch throttling entity from the platform cache
         * @param throttlingCacheKey
         */
        getThrottlingCache(throttlingCacheKey) {
          const value = this.browserStorage.getItem(throttlingCacheKey);
          if (!value) {
            this.logger.trace("BrowserCacheManager.getThrottlingCache: called, no cache hit");
            return null;
          }
          const parsedThrottlingCache = this.validateAndParseJson(value);
          if (!parsedThrottlingCache || !isThrottlingEntity(throttlingCacheKey, parsedThrottlingCache)) {
            this.logger.trace("BrowserCacheManager.getThrottlingCache: called, no cache hit");
            return null;
          }
          this.logger.trace("BrowserCacheManager.getThrottlingCache: cache hit");
          return parsedThrottlingCache;
        }
        /**
         * set throttling entity to the platform cache
         * @param throttlingCacheKey
         * @param throttlingCache
         */
        setThrottlingCache(throttlingCacheKey, throttlingCache, correlationId) {
          this.logger.trace("BrowserCacheManager.setThrottlingCache called");
          this.setItem(throttlingCacheKey, JSON.stringify(throttlingCache), correlationId);
        }
        /**
         * Gets cache item with given key.
         * Will retrieve from cookies if storeAuthStateInCookie is set to true.
         * @param key
         */
        getTemporaryCache(cacheKey, generateKey) {
          const key = generateKey ? this.generateCacheKey(cacheKey) : cacheKey;
          if (this.cacheConfig.storeAuthStateInCookie) {
            const itemCookie = this.cookieStorage.getItem(key);
            if (itemCookie) {
              this.logger.trace("BrowserCacheManager.getTemporaryCache: storeAuthStateInCookies set to true, retrieving from cookies");
              return itemCookie;
            }
          }
          const value = this.temporaryCacheStorage.getItem(key);
          if (!value) {
            if (this.cacheConfig.cacheLocation === BrowserCacheLocation.LocalStorage) {
              const item = this.browserStorage.getItem(key);
              if (item) {
                this.logger.trace("BrowserCacheManager.getTemporaryCache: Temporary cache item found in local storage");
                return item;
              }
            }
            this.logger.trace("BrowserCacheManager.getTemporaryCache: No cache item found in local storage");
            return null;
          }
          this.logger.trace("BrowserCacheManager.getTemporaryCache: Temporary cache item returned");
          return value;
        }
        /**
         * Sets the cache item with the key and value given.
         * Stores in cookie if storeAuthStateInCookie is set to true.
         * This can cause cookie overflow if used incorrectly.
         * @param key
         * @param value
         */
        setTemporaryCache(cacheKey, value, generateKey) {
          const key = generateKey ? this.generateCacheKey(cacheKey) : cacheKey;
          this.temporaryCacheStorage.setItem(key, value);
          if (this.cacheConfig.storeAuthStateInCookie) {
            this.logger.trace("BrowserCacheManager.setTemporaryCache: storeAuthStateInCookie set to true, setting item cookie");
            this.cookieStorage.setItem(key, value, void 0, this.cacheConfig.secureCookies);
          }
        }
        /**
         * Removes the cache item with the given key.
         * @param key
         */
        removeItem(key) {
          this.browserStorage.removeItem(key);
        }
        /**
         * Removes the temporary cache item with the given key.
         * Will also clear the cookie item if storeAuthStateInCookie is set to true.
         * @param key
         */
        removeTemporaryItem(key) {
          this.temporaryCacheStorage.removeItem(key);
          if (this.cacheConfig.storeAuthStateInCookie) {
            this.logger.trace("BrowserCacheManager.removeItem: storeAuthStateInCookie is true, clearing item cookie");
            this.cookieStorage.removeItem(key);
          }
        }
        /**
         * Gets all keys in window.
         */
        getKeys() {
          return this.browserStorage.getKeys();
        }
        /**
         * Clears all cache entries created by MSAL.
         */
        clear(correlationId) {
          this.removeAllAccounts(correlationId);
          this.removeAppMetadata(correlationId);
          this.temporaryCacheStorage.getKeys().forEach((cacheKey) => {
            if (cacheKey.indexOf(PREFIX) !== -1 || cacheKey.indexOf(this.clientId) !== -1) {
              this.removeTemporaryItem(cacheKey);
            }
          });
          this.browserStorage.getKeys().forEach((cacheKey) => {
            if (cacheKey.indexOf(PREFIX) !== -1 || cacheKey.indexOf(this.clientId) !== -1) {
              this.browserStorage.removeItem(cacheKey);
            }
          });
          this.internalStorage.clear();
        }
        /**
         * Clears all access tokes that have claims prior to saving the current one
         * @param performanceClient {IPerformanceClient}
         * @param correlationId {string} correlation id
         * @returns
         */
        clearTokensAndKeysWithClaims(correlationId) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.ClearTokensAndKeysWithClaims, correlationId);
          const tokenKeys = this.getTokenKeys();
          let removedAccessTokens = 0;
          tokenKeys.accessToken.forEach((key) => {
            const credential = this.getAccessTokenCredential(key, correlationId);
            if (credential?.requestedClaimsHash && key.includes(credential.requestedClaimsHash.toLowerCase())) {
              this.removeAccessToken(key, correlationId);
              removedAccessTokens++;
            }
          });
          if (removedAccessTokens > 0) {
            this.logger.warning(`${removedAccessTokens} access tokens with claims in the cache keys have been removed from the cache.`);
          }
        }
        /**
         * Prepend msal.<client-id> to each key
         * @param key
         * @param addInstanceId
         */
        generateCacheKey(key) {
          if (StringUtils.startsWith(key, PREFIX)) {
            return key;
          }
          return `${PREFIX}.${this.clientId}.${key}`;
        }
        /**
         * Cache Key: msal.<schema_version>-<home_account_id>-<environment>-<credential_type>-<client_id or familyId>-<realm>-<scopes>-<claims hash>-<scheme>
         * IdToken Example: uid.utid-login.microsoftonline.com-idtoken-app_client_id-contoso.com
         * AccessToken Example: uid.utid-login.microsoftonline.com-accesstoken-app_client_id-contoso.com-scope1 scope2--pop
         * RefreshToken Example: uid.utid-login.microsoftonline.com-refreshtoken-1-contoso.com
         * @param credentialEntity
         * @returns
         */
        generateCredentialKey(credential) {
          const familyId = credential.credentialType === CredentialType.REFRESH_TOKEN && credential.familyId || credential.clientId;
          const scheme = credential.tokenType && credential.tokenType.toLowerCase() !== AuthenticationScheme.BEARER.toLowerCase() ? credential.tokenType.toLowerCase() : "";
          const credentialKey = [
            `${PREFIX}.${CREDENTIAL_SCHEMA_VERSION}`,
            credential.homeAccountId,
            credential.environment,
            credential.credentialType,
            familyId,
            credential.realm || "",
            credential.target || "",
            credential.requestedClaimsHash || "",
            scheme
          ];
          return credentialKey.join(CACHE_KEY_SEPARATOR).toLowerCase();
        }
        /**
         * Cache Key: msal.<schema_version>.<home_account_id>.<environment>.<tenant_id>
         * @param account
         * @returns
         */
        generateAccountKey(account2) {
          const homeTenantId = account2.homeAccountId.split(".")[1];
          const accountKey = [
            `${PREFIX}.${ACCOUNT_SCHEMA_VERSION}`,
            account2.homeAccountId,
            account2.environment,
            homeTenantId || account2.tenantId || ""
          ];
          return accountKey.join(CACHE_KEY_SEPARATOR).toLowerCase();
        }
        /**
         * Reset all temporary cache items
         * @param state
         */
        resetRequestCache() {
          this.logger.trace("BrowserCacheManager.resetRequestCache called");
          this.removeTemporaryItem(this.generateCacheKey(TemporaryCacheKeys.REQUEST_PARAMS));
          this.removeTemporaryItem(this.generateCacheKey(TemporaryCacheKeys.VERIFIER));
          this.removeTemporaryItem(this.generateCacheKey(TemporaryCacheKeys.ORIGIN_URI));
          this.removeTemporaryItem(this.generateCacheKey(TemporaryCacheKeys.URL_HASH));
          this.removeTemporaryItem(this.generateCacheKey(TemporaryCacheKeys.NATIVE_REQUEST));
          this.setInteractionInProgress(false);
        }
        cacheAuthorizeRequest(authCodeRequest, codeVerifier) {
          this.logger.trace("BrowserCacheManager.cacheAuthorizeRequest called");
          const encodedValue = base64Encode(JSON.stringify(authCodeRequest));
          this.setTemporaryCache(TemporaryCacheKeys.REQUEST_PARAMS, encodedValue, true);
          if (codeVerifier) {
            const encodedVerifier = base64Encode(codeVerifier);
            this.setTemporaryCache(TemporaryCacheKeys.VERIFIER, encodedVerifier, true);
          }
        }
        /**
         * Gets the token exchange parameters from the cache. Throws an error if nothing is found.
         */
        getCachedRequest() {
          this.logger.trace("BrowserCacheManager.getCachedRequest called");
          const encodedTokenRequest = this.getTemporaryCache(TemporaryCacheKeys.REQUEST_PARAMS, true);
          if (!encodedTokenRequest) {
            throw createBrowserAuthError(noTokenRequestCacheError);
          }
          const encodedVerifier = this.getTemporaryCache(TemporaryCacheKeys.VERIFIER, true);
          let parsedRequest;
          let verifier = "";
          try {
            parsedRequest = JSON.parse(base64Decode(encodedTokenRequest));
            if (encodedVerifier) {
              verifier = base64Decode(encodedVerifier);
            }
          } catch (e) {
            this.logger.errorPii(`Attempted to parse: ${encodedTokenRequest}`);
            this.logger.error(`Parsing cached token request threw with error: ${e}`);
            throw createBrowserAuthError(unableToParseTokenRequestCacheError);
          }
          return [parsedRequest, verifier];
        }
        /**
         * Gets cached native request for redirect flows
         */
        getCachedNativeRequest() {
          this.logger.trace("BrowserCacheManager.getCachedNativeRequest called");
          const cachedRequest = this.getTemporaryCache(TemporaryCacheKeys.NATIVE_REQUEST, true);
          if (!cachedRequest) {
            this.logger.trace("BrowserCacheManager.getCachedNativeRequest: No cached native request found");
            return null;
          }
          const parsedRequest = this.validateAndParseJson(cachedRequest);
          if (!parsedRequest) {
            this.logger.error("BrowserCacheManager.getCachedNativeRequest: Unable to parse native request");
            return null;
          }
          return parsedRequest;
        }
        isInteractionInProgress(matchClientId) {
          const clientId = this.getInteractionInProgress()?.clientId;
          if (matchClientId) {
            return clientId === this.clientId;
          } else {
            return !!clientId;
          }
        }
        getInteractionInProgress() {
          const key = `${PREFIX}.${TemporaryCacheKeys.INTERACTION_STATUS_KEY}`;
          const value = this.getTemporaryCache(key, false);
          try {
            return value ? JSON.parse(value) : null;
          } catch (e) {
            this.logger.error(`Cannot parse interaction status. Removing temporary cache items and clearing url hash. Retrying interaction should fix the error`);
            this.removeTemporaryItem(key);
            this.resetRequestCache();
            clearHash(window);
            return null;
          }
        }
        setInteractionInProgress(inProgress, type = INTERACTION_TYPE.SIGNIN) {
          const key = `${PREFIX}.${TemporaryCacheKeys.INTERACTION_STATUS_KEY}`;
          if (inProgress) {
            if (this.getInteractionInProgress()) {
              throw createBrowserAuthError(interactionInProgress);
            } else {
              this.setTemporaryCache(key, JSON.stringify({ clientId: this.clientId, type }), false);
            }
          } else if (!inProgress && this.getInteractionInProgress()?.clientId === this.clientId) {
            this.removeTemporaryItem(key);
          }
        }
        /**
         * Builds credential entities from AuthenticationResult object and saves the resulting credentials to the cache
         * @param result
         * @param request
         */
        async hydrateCache(result, request) {
          const idTokenEntity = createIdTokenEntity(result.account?.homeAccountId, result.account?.environment, result.idToken, this.clientId, result.tenantId);
          let claimsHash;
          if (request.claims) {
            claimsHash = await this.cryptoImpl.hashString(request.claims);
          }
          const accessTokenEntity = createAccessTokenEntity(
            result.account?.homeAccountId,
            result.account.environment,
            result.accessToken,
            this.clientId,
            result.tenantId,
            result.scopes.join(" "),
            // Access token expiresOn stored in seconds, converting from AuthenticationResult expiresOn stored as Date
            result.expiresOn ? toSecondsFromDate(result.expiresOn) : 0,
            result.extExpiresOn ? toSecondsFromDate(result.extExpiresOn) : 0,
            base64Decode,
            void 0,
            // refreshOn
            result.tokenType,
            void 0,
            // userAssertionHash
            request.sshKid,
            request.claims,
            claimsHash
          );
          const cacheRecord = {
            idToken: idTokenEntity,
            accessToken: accessTokenEntity
          };
          return this.saveCacheRecord(cacheRecord, result.correlationId);
        }
        /**
         * saves a cache record
         * @param cacheRecord {CacheRecord}
         * @param storeInCache {?StoreInCache}
         * @param correlationId {?string} correlation id
         */
        async saveCacheRecord(cacheRecord, correlationId, storeInCache) {
          try {
            await super.saveCacheRecord(cacheRecord, correlationId, storeInCache);
          } catch (e) {
            if (e instanceof CacheError && this.performanceClient && correlationId) {
              try {
                const tokenKeys = this.getTokenKeys();
                this.performanceClient.addFields({
                  cacheRtCount: tokenKeys.refreshToken.length,
                  cacheIdCount: tokenKeys.idToken.length,
                  cacheAtCount: tokenKeys.accessToken.length
                }, correlationId);
              } catch (e2) {
              }
            }
            throw e;
          }
        }
      };
      function getStorageImplementation(clientId, cacheLocation, logger, performanceClient) {
        try {
          switch (cacheLocation) {
            case BrowserCacheLocation.LocalStorage:
              return new LocalStorage(clientId, logger, performanceClient);
            case BrowserCacheLocation.SessionStorage:
              return new SessionStorage();
            case BrowserCacheLocation.MemoryStorage:
            default:
              break;
          }
        } catch (e) {
          logger.error(e);
        }
        return new MemoryStorage();
      }
      var DEFAULT_BROWSER_CACHE_MANAGER = (clientId, logger, performanceClient, eventHandler) => {
        const cacheOptions = {
          cacheLocation: BrowserCacheLocation.MemoryStorage,
          cacheRetentionDays: 5,
          temporaryCacheLocation: BrowserCacheLocation.MemoryStorage,
          storeAuthStateInCookie: false,
          secureCookies: false,
          cacheMigrationEnabled: false,
          claimsBasedCachingEnabled: false
        };
        return new BrowserCacheManager(clientId, cacheOptions, DEFAULT_CRYPTO_IMPLEMENTATION, logger, performanceClient, eventHandler);
      };
      function getAllAccounts(logger, browserStorage, isInBrowser, correlationId, accountFilter) {
        logger.verbose("getAllAccounts called");
        return isInBrowser ? browserStorage.getAllAccounts(accountFilter || {}, correlationId) : [];
      }
      function getAccount(accountFilter, logger, browserStorage, correlationId) {
        const account2 = browserStorage.getAccountInfoFilteredBy(accountFilter, correlationId);
        if (account2) {
          logger.verbose("getAccount: Account matching provided filter found, returning");
          return account2;
        } else {
          logger.verbose("getAccount: No matching account found, returning null");
          return null;
        }
      }
      function getAccountByUsername(username, logger, browserStorage, correlationId) {
        logger.trace("getAccountByUsername called");
        if (!username) {
          logger.warning("getAccountByUsername: No username provided");
          return null;
        }
        const account2 = browserStorage.getAccountInfoFilteredBy({
          username
        }, correlationId);
        if (account2) {
          logger.verbose("getAccountByUsername: Account matching username found, returning");
          logger.verbosePii(`getAccountByUsername: Returning signed-in accounts matching username: ${username}`);
          return account2;
        } else {
          logger.verbose("getAccountByUsername: No matching account found, returning null");
          return null;
        }
      }
      function getAccountByHomeId(homeAccountId, logger, browserStorage, correlationId) {
        logger.trace("getAccountByHomeId called");
        if (!homeAccountId) {
          logger.warning("getAccountByHomeId: No homeAccountId provided");
          return null;
        }
        const account2 = browserStorage.getAccountInfoFilteredBy({
          homeAccountId
        }, correlationId);
        if (account2) {
          logger.verbose("getAccountByHomeId: Account matching homeAccountId found, returning");
          logger.verbosePii(`getAccountByHomeId: Returning signed-in accounts matching homeAccountId: ${homeAccountId}`);
          return account2;
        } else {
          logger.verbose("getAccountByHomeId: No matching account found, returning null");
          return null;
        }
      }
      function getAccountByLocalId(localAccountId, logger, browserStorage, correlationId) {
        logger.trace("getAccountByLocalId called");
        if (!localAccountId) {
          logger.warning("getAccountByLocalId: No localAccountId provided");
          return null;
        }
        const account2 = browserStorage.getAccountInfoFilteredBy({
          localAccountId
        }, correlationId);
        if (account2) {
          logger.verbose("getAccountByLocalId: Account matching localAccountId found, returning");
          logger.verbosePii(`getAccountByLocalId: Returning signed-in accounts matching localAccountId: ${localAccountId}`);
          return account2;
        } else {
          logger.verbose("getAccountByLocalId: No matching account found, returning null");
          return null;
        }
      }
      function setActiveAccount(account2, browserStorage, correlationId) {
        browserStorage.setActiveAccount(account2, correlationId);
      }
      function getActiveAccount(browserStorage, correlationId) {
        return browserStorage.getActiveAccount(correlationId);
      }
      var BROADCAST_CHANNEL_NAME = "msal.broadcast.event";
      var EventHandler = class {
        constructor(logger) {
          this.eventCallbacks = /* @__PURE__ */ new Map();
          this.logger = logger || new Logger({});
          if (typeof BroadcastChannel !== "undefined") {
            this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          }
          this.invokeCrossTabCallbacks = this.invokeCrossTabCallbacks.bind(this);
        }
        /**
         * Adds event callbacks to array
         * @param callback - callback to be invoked when an event is raised
         * @param eventTypes - list of events that this callback will be invoked for, if not provided callback will be invoked for all events
         * @param callbackId - Identifier for the callback, used to locate and remove the callback when no longer required
         */
        addEventCallback(callback, eventTypes, callbackId) {
          if (typeof window !== "undefined") {
            const id = callbackId || createGuid();
            if (this.eventCallbacks.has(id)) {
              this.logger.error(`Event callback with id: ${id} is already registered. Please provide a unique id or remove the existing callback and try again.`);
              return null;
            }
            this.eventCallbacks.set(id, [callback, eventTypes || []]);
            this.logger.verbose(`Event callback registered with id: ${id}`);
            return id;
          }
          return null;
        }
        /**
         * Removes callback with provided id from callback array
         * @param callbackId
         */
        removeEventCallback(callbackId) {
          this.eventCallbacks.delete(callbackId);
          this.logger.verbose(`Event callback ${callbackId} removed.`);
        }
        /**
         * Emits events by calling callback with event message
         * @param eventType
         * @param interactionType
         * @param payload
         * @param error
         */
        emitEvent(eventType, interactionType, payload, error) {
          const message = {
            eventType,
            interactionType: interactionType || null,
            payload: payload || null,
            error: error || null,
            timestamp: Date.now()
          };
          switch (eventType) {
            case EventType.ACCOUNT_ADDED:
            case EventType.ACCOUNT_REMOVED:
            case EventType.ACTIVE_ACCOUNT_CHANGED:
              this.broadcastChannel?.postMessage(message);
              break;
            default:
              this.invokeCallbacks(message);
              break;
          }
        }
        /**
         * Invoke registered callbacks
         * @param message
         */
        invokeCallbacks(message) {
          this.eventCallbacks.forEach(([callback, eventTypes], callbackId) => {
            if (eventTypes.length === 0 || eventTypes.includes(message.eventType)) {
              this.logger.verbose(`Emitting event to callback ${callbackId}: ${message.eventType}`);
              callback.apply(null, [message]);
            }
          });
        }
        /**
         * Wrapper around invokeCallbacks to handle broadcast events received from other tabs/instances
         * @param event
         */
        invokeCrossTabCallbacks(event) {
          const message = event.data;
          this.invokeCallbacks(message);
        }
        /**
         * Listen for events broadcasted from other tabs/instances
         */
        subscribeCrossTab() {
          this.broadcastChannel?.addEventListener("message", this.invokeCrossTabCallbacks);
        }
        /**
         * Unsubscribe from broadcast events
         */
        unsubscribeCrossTab() {
          this.broadcastChannel?.removeEventListener("message", this.invokeCrossTabCallbacks);
        }
      };
      var BaseInteractionClient = class {
        constructor(config2, storageImpl, browserCrypto, logger, eventHandler, navigationClient, performanceClient, platformAuthProvider, correlationId) {
          this.config = config2;
          this.browserStorage = storageImpl;
          this.browserCrypto = browserCrypto;
          this.networkClient = this.config.system.networkClient;
          this.eventHandler = eventHandler;
          this.navigationClient = navigationClient;
          this.platformAuthProvider = platformAuthProvider;
          this.correlationId = correlationId || createNewGuid();
          this.logger = logger.clone(BrowserConstants.MSAL_SKU, version, this.correlationId);
          this.performanceClient = performanceClient;
        }
        async clearCacheOnLogout(correlationId, account2) {
          if (account2) {
            try {
              this.browserStorage.removeAccount(account2, correlationId);
              this.logger.verbose("Cleared cache items belonging to the account provided in the logout request.");
            } catch (error) {
              this.logger.error("Account provided in logout request was not found. Local cache unchanged.");
            }
          } else {
            try {
              this.logger.verbose("No account provided in logout request, clearing all cache items.", this.correlationId);
              this.browserStorage.clear(correlationId);
              await this.browserCrypto.clearKeystore();
            } catch (e) {
              this.logger.error("Attempted to clear all MSAL cache items and failed. Local cache unchanged.");
            }
          }
        }
        /**
         *
         * Use to get the redirect uri configured in MSAL or null.
         * @param requestRedirectUri
         * @returns Redirect URL
         *
         */
        getRedirectUri(requestRedirectUri) {
          this.logger.verbose("getRedirectUri called");
          const redirectUri = requestRedirectUri || this.config.auth.redirectUri;
          return UrlString.getAbsoluteUrl(redirectUri, getCurrentUri());
        }
        /**
         *
         * @param apiId
         * @param correlationId
         * @param forceRefresh
         */
        initializeServerTelemetryManager(apiId, forceRefresh) {
          this.logger.verbose("initializeServerTelemetryManager called");
          const telemetryPayload = {
            clientId: this.config.auth.clientId,
            correlationId: this.correlationId,
            apiId,
            forceRefresh: forceRefresh || false,
            wrapperSKU: this.browserStorage.getWrapperMetadata()[0],
            wrapperVer: this.browserStorage.getWrapperMetadata()[1]
          };
          return new ServerTelemetryManager(telemetryPayload, this.browserStorage);
        }
        /**
         * Used to get a discovered version of the default authority.
         * @param params {
         *         requestAuthority?: string;
         *         requestAzureCloudOptions?: AzureCloudOptions;
         *         requestExtraQueryParameters?: StringDict;
         *         account?: AccountInfo;
         *        }
         */
        async getDiscoveredAuthority(params) {
          const { account: account2 } = params;
          const instanceAwareEQ = params.requestExtraQueryParameters && params.requestExtraQueryParameters.hasOwnProperty("instance_aware") ? params.requestExtraQueryParameters["instance_aware"] : void 0;
          this.performanceClient.addQueueMeasurement(PerformanceEvents.StandardInteractionClientGetDiscoveredAuthority, this.correlationId);
          const authorityOptions = {
            protocolMode: this.config.auth.protocolMode,
            OIDCOptions: this.config.auth.OIDCOptions,
            knownAuthorities: this.config.auth.knownAuthorities,
            cloudDiscoveryMetadata: this.config.auth.cloudDiscoveryMetadata,
            authorityMetadata: this.config.auth.authorityMetadata,
            skipAuthorityMetadataCache: this.config.auth.skipAuthorityMetadataCache
          };
          const resolvedAuthority = params.requestAuthority || this.config.auth.authority;
          const resolvedInstanceAware = instanceAwareEQ?.length ? instanceAwareEQ === "true" : this.config.auth.instanceAware;
          const userAuthority = account2 && resolvedInstanceAware ? this.config.auth.authority.replace(UrlString.getDomainFromUrl(resolvedAuthority), account2.environment) : resolvedAuthority;
          const builtAuthority = Authority.generateAuthority(userAuthority, params.requestAzureCloudOptions || this.config.auth.azureCloudOptions);
          const discoveredAuthority = await invokeAsync(createDiscoveredInstance, PerformanceEvents.AuthorityFactoryCreateDiscoveredInstance, this.logger, this.performanceClient, this.correlationId)(builtAuthority, this.config.system.networkClient, this.browserStorage, authorityOptions, this.logger, this.correlationId, this.performanceClient);
          if (account2 && !discoveredAuthority.isAlias(account2.environment)) {
            throw createClientConfigurationError(authorityMismatch);
          }
          return discoveredAuthority;
        }
      };
      async function initializeBaseRequest(request, config2, performanceClient, logger) {
        performanceClient.addQueueMeasurement(PerformanceEvents.InitializeBaseRequest, request.correlationId);
        const authority = request.authority || config2.auth.authority;
        const scopes = [...request && request.scopes || []];
        const validatedRequest = {
          ...request,
          correlationId: request.correlationId,
          authority,
          scopes
        };
        if (!validatedRequest.authenticationScheme) {
          validatedRequest.authenticationScheme = AuthenticationScheme.BEARER;
          logger.verbose(`Authentication Scheme wasn't explicitly set in request, defaulting to "Bearer" request`);
        } else {
          if (validatedRequest.authenticationScheme === AuthenticationScheme.SSH) {
            if (!request.sshJwk) {
              throw createClientConfigurationError(missingSshJwk);
            }
            if (!request.sshKid) {
              throw createClientConfigurationError(missingSshKid);
            }
          }
          logger.verbose(`Authentication Scheme set to "${validatedRequest.authenticationScheme}" as configured in Auth request`);
        }
        if (config2.cache.claimsBasedCachingEnabled && request.claims && // Checks for empty stringified object "{}" which doesn't qualify as requested claims
        !StringUtils.isEmptyObj(request.claims)) {
          validatedRequest.requestedClaimsHash = await hashString(request.claims);
        }
        return validatedRequest;
      }
      async function initializeSilentRequest(request, account2, config2, performanceClient, logger) {
        performanceClient.addQueueMeasurement(PerformanceEvents.InitializeSilentRequest, request.correlationId);
        const baseRequest = await invokeAsync(initializeBaseRequest, PerformanceEvents.InitializeBaseRequest, logger, performanceClient, request.correlationId)(request, config2, performanceClient, logger);
        return {
          ...request,
          ...baseRequest,
          account: account2,
          forceRefresh: request.forceRefresh || false
        };
      }
      function validateRequestMethod(interactionRequest, protocolMode) {
        let httpMethod;
        const requestMethod = interactionRequest.httpMethod;
        if (protocolMode === ProtocolMode.EAR) {
          httpMethod = requestMethod || HttpMethod.POST;
          if (httpMethod !== HttpMethod.POST) {
            throw createClientConfigurationError(invalidRequestMethodForEAR);
          }
        } else {
          httpMethod = requestMethod || HttpMethod.GET;
        }
        if (interactionRequest.authorizePostBodyParameters && httpMethod !== HttpMethod.POST) {
          throw createClientConfigurationError(invalidAuthorizePostBodyParameters);
        }
        return httpMethod;
      }
      var StandardInteractionClient = class extends BaseInteractionClient {
        /**
         * Initializer for the logout request.
         * @param logoutRequest
         */
        initializeLogoutRequest(logoutRequest) {
          this.logger.verbose("initializeLogoutRequest called", logoutRequest?.correlationId);
          const validLogoutRequest = {
            correlationId: this.correlationId || createNewGuid(),
            ...logoutRequest
          };
          if (logoutRequest) {
            if (!logoutRequest.logoutHint) {
              if (logoutRequest.account) {
                const logoutHint = this.getLogoutHintFromIdTokenClaims(logoutRequest.account);
                if (logoutHint) {
                  this.logger.verbose("Setting logoutHint to login_hint ID Token Claim value for the account provided");
                  validLogoutRequest.logoutHint = logoutHint;
                }
              } else {
                this.logger.verbose("logoutHint was not set and account was not passed into logout request, logoutHint will not be set");
              }
            } else {
              this.logger.verbose("logoutHint has already been set in logoutRequest");
            }
          } else {
            this.logger.verbose("logoutHint will not be set since no logout request was configured");
          }
          if (!logoutRequest || logoutRequest.postLogoutRedirectUri !== null) {
            if (logoutRequest && logoutRequest.postLogoutRedirectUri) {
              this.logger.verbose("Setting postLogoutRedirectUri to uri set on logout request", validLogoutRequest.correlationId);
              validLogoutRequest.postLogoutRedirectUri = UrlString.getAbsoluteUrl(logoutRequest.postLogoutRedirectUri, getCurrentUri());
            } else if (this.config.auth.postLogoutRedirectUri === null) {
              this.logger.verbose("postLogoutRedirectUri configured as null and no uri set on request, not passing post logout redirect", validLogoutRequest.correlationId);
            } else if (this.config.auth.postLogoutRedirectUri) {
              this.logger.verbose("Setting postLogoutRedirectUri to configured uri", validLogoutRequest.correlationId);
              validLogoutRequest.postLogoutRedirectUri = UrlString.getAbsoluteUrl(this.config.auth.postLogoutRedirectUri, getCurrentUri());
            } else {
              this.logger.verbose("Setting postLogoutRedirectUri to current page", validLogoutRequest.correlationId);
              validLogoutRequest.postLogoutRedirectUri = UrlString.getAbsoluteUrl(getCurrentUri(), getCurrentUri());
            }
          } else {
            this.logger.verbose("postLogoutRedirectUri passed as null, not setting post logout redirect uri", validLogoutRequest.correlationId);
          }
          return validLogoutRequest;
        }
        /**
         * Parses login_hint ID Token Claim out of AccountInfo object to be used as
         * logout_hint in end session request.
         * @param account
         */
        getLogoutHintFromIdTokenClaims(account2) {
          const idTokenClaims = account2.idTokenClaims;
          if (idTokenClaims) {
            if (idTokenClaims.login_hint) {
              return idTokenClaims.login_hint;
            } else {
              this.logger.verbose("The ID Token Claims tied to the provided account do not contain a login_hint claim, logoutHint will not be added to logout request");
            }
          } else {
            this.logger.verbose("The provided account does not contain ID Token Claims, logoutHint will not be added to logout request");
          }
          return null;
        }
        /**
         * Creates an Authorization Code Client with the given authority, or the default authority.
         * @param params {
         *         serverTelemetryManager: ServerTelemetryManager;
         *         authorityUrl?: string;
         *         requestAzureCloudOptions?: AzureCloudOptions;
         *         requestExtraQueryParameters?: StringDict;
         *         account?: AccountInfo;
         *        }
         */
        async createAuthCodeClient(params) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.StandardInteractionClientCreateAuthCodeClient, this.correlationId);
          const clientConfig = await invokeAsync(this.getClientConfiguration.bind(this), PerformanceEvents.StandardInteractionClientGetClientConfiguration, this.logger, this.performanceClient, this.correlationId)(params);
          return new AuthorizationCodeClient(clientConfig, this.performanceClient);
        }
        /**
         * Creates a Client Configuration object with the given request authority, or the default authority.
         * @param params {
         *         serverTelemetryManager: ServerTelemetryManager;
         *         requestAuthority?: string;
         *         requestAzureCloudOptions?: AzureCloudOptions;
         *         requestExtraQueryParameters?: boolean;
         *         account?: AccountInfo;
         *        }
         */
        async getClientConfiguration(params) {
          const { serverTelemetryManager, requestAuthority, requestAzureCloudOptions, requestExtraQueryParameters, account: account2 } = params;
          this.performanceClient.addQueueMeasurement(PerformanceEvents.StandardInteractionClientGetClientConfiguration, this.correlationId);
          const discoveredAuthority = await invokeAsync(this.getDiscoveredAuthority.bind(this), PerformanceEvents.StandardInteractionClientGetDiscoveredAuthority, this.logger, this.performanceClient, this.correlationId)({
            requestAuthority,
            requestAzureCloudOptions,
            requestExtraQueryParameters,
            account: account2
          });
          const logger = this.config.system.loggerOptions;
          return {
            authOptions: {
              clientId: this.config.auth.clientId,
              authority: discoveredAuthority,
              clientCapabilities: this.config.auth.clientCapabilities,
              redirectUri: this.config.auth.redirectUri
            },
            systemOptions: {
              tokenRenewalOffsetSeconds: this.config.system.tokenRenewalOffsetSeconds,
              preventCorsPreflight: true
            },
            loggerOptions: {
              loggerCallback: logger.loggerCallback,
              piiLoggingEnabled: logger.piiLoggingEnabled,
              logLevel: logger.logLevel,
              correlationId: this.correlationId
            },
            cacheOptions: {
              claimsBasedCachingEnabled: this.config.cache.claimsBasedCachingEnabled
            },
            cryptoInterface: this.browserCrypto,
            networkInterface: this.networkClient,
            storageInterface: this.browserStorage,
            serverTelemetryManager,
            libraryInfo: {
              sku: BrowserConstants.MSAL_SKU,
              version,
              cpu: Constants.EMPTY_STRING,
              os: Constants.EMPTY_STRING
            },
            telemetry: this.config.telemetry
          };
        }
        /**
         * Helper to initialize required request parameters for interactive APIs and ssoSilent()
         * @param request
         * @param interactionType
         */
        async initializeAuthorizationRequest(request, interactionType) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.StandardInteractionClientInitializeAuthorizationRequest, this.correlationId);
          const redirectUri = this.getRedirectUri(request.redirectUri);
          const browserState = {
            interactionType
          };
          const state2 = ProtocolUtils.setRequestState(this.browserCrypto, request && request.state || Constants.EMPTY_STRING, browserState);
          const baseRequest = await invokeAsync(initializeBaseRequest, PerformanceEvents.InitializeBaseRequest, this.logger, this.performanceClient, this.correlationId)({ ...request, correlationId: this.correlationId }, this.config, this.performanceClient, this.logger);
          const interactionRequest = {
            ...baseRequest,
            redirectUri,
            state: state2,
            nonce: request.nonce || createNewGuid(),
            responseMode: this.config.auth.OIDCOptions.serverResponseType
          };
          const validatedRequest = {
            ...interactionRequest,
            httpMethod: validateRequestMethod(interactionRequest, this.config.auth.protocolMode)
          };
          if (request.loginHint || request.sid) {
            return validatedRequest;
          }
          const account2 = request.account || this.browserStorage.getActiveAccount(this.correlationId);
          if (account2) {
            this.logger.verbose("Setting validated request account", this.correlationId);
            this.logger.verbosePii(`Setting validated request account: ${account2.homeAccountId}`, this.correlationId);
            validatedRequest.account = account2;
          }
          return validatedRequest;
        }
      };
      function extractBrowserRequestState(browserCrypto, state2) {
        if (!state2) {
          return null;
        }
        try {
          const requestStateObj = ProtocolUtils.parseRequestState(browserCrypto, state2);
          return requestStateObj.libraryState.meta;
        } catch (e) {
          throw createClientAuthError(invalidState);
        }
      }
      function deserializeResponse(responseString, responseLocation, logger) {
        const serverParams = getDeserializedResponse(responseString);
        if (!serverParams) {
          if (!stripLeadingHashOrQuery(responseString)) {
            logger.error(`The request has returned to the redirectUri but a ${responseLocation} is not present. It's likely that the ${responseLocation} has been removed or the page has been redirected by code running on the redirectUri page.`);
            throw createBrowserAuthError(hashEmptyError);
          } else {
            logger.error(`A ${responseLocation} is present in the iframe but it does not contain known properties. It's likely that the ${responseLocation} has been replaced by code running on the redirectUri page.`);
            logger.errorPii(`The ${responseLocation} detected is: ${responseString}`);
            throw createBrowserAuthError(hashDoesNotContainKnownProperties);
          }
        }
        return serverParams;
      }
      function validateInteractionType(response, browserCrypto, interactionType) {
        if (!response.state) {
          throw createBrowserAuthError(noStateInHash);
        }
        const platformStateObj = extractBrowserRequestState(browserCrypto, response.state);
        if (!platformStateObj) {
          throw createBrowserAuthError(unableToParseState);
        }
        if (platformStateObj.interactionType !== interactionType) {
          throw createBrowserAuthError(stateInteractionTypeMismatch);
        }
      }
      var InteractionHandler = class {
        constructor(authCodeModule, storageImpl, authCodeRequest, logger, performanceClient) {
          this.authModule = authCodeModule;
          this.browserStorage = storageImpl;
          this.authCodeRequest = authCodeRequest;
          this.logger = logger;
          this.performanceClient = performanceClient;
        }
        /**
         * Function to handle response parameters from hash.
         * @param locationHash
         */
        async handleCodeResponse(response, request) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.HandleCodeResponse, request.correlationId);
          let authCodeResponse;
          try {
            authCodeResponse = getAuthorizationCodePayload(response, request.state);
          } catch (e) {
            if (e instanceof ServerError && e.subError === userCancelled) {
              throw createBrowserAuthError(userCancelled);
            } else {
              throw e;
            }
          }
          return invokeAsync(this.handleCodeResponseFromServer.bind(this), PerformanceEvents.HandleCodeResponseFromServer, this.logger, this.performanceClient, request.correlationId)(authCodeResponse, request);
        }
        /**
         * Process auth code response from AAD
         * @param authCodeResponse
         * @param state
         * @param authority
         * @param networkModule
         * @returns
         */
        async handleCodeResponseFromServer(authCodeResponse, request, validateNonce = true) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.HandleCodeResponseFromServer, request.correlationId);
          this.logger.trace("InteractionHandler.handleCodeResponseFromServer called");
          this.authCodeRequest.code = authCodeResponse.code;
          if (authCodeResponse.cloud_instance_host_name) {
            await invokeAsync(this.authModule.updateAuthority.bind(this.authModule), PerformanceEvents.UpdateTokenEndpointAuthority, this.logger, this.performanceClient, request.correlationId)(authCodeResponse.cloud_instance_host_name, request.correlationId);
          }
          if (validateNonce) {
            authCodeResponse.nonce = request.nonce || void 0;
          }
          authCodeResponse.state = request.state;
          if (authCodeResponse.client_info) {
            this.authCodeRequest.clientInfo = authCodeResponse.client_info;
          } else {
            const ccsCred = this.createCcsCredentials(request);
            if (ccsCred) {
              this.authCodeRequest.ccsCredential = ccsCred;
            }
          }
          const tokenResponse = await invokeAsync(this.authModule.acquireToken.bind(this.authModule), PerformanceEvents.AuthClientAcquireToken, this.logger, this.performanceClient, request.correlationId)(this.authCodeRequest, authCodeResponse);
          return tokenResponse;
        }
        /**
         * Build ccs creds if available
         */
        createCcsCredentials(request) {
          if (request.account) {
            return {
              credential: request.account.homeAccountId,
              type: CcsCredentialType.HOME_ACCOUNT_ID
            };
          } else if (request.loginHint) {
            return {
              credential: request.loginHint,
              type: CcsCredentialType.UPN
            };
          }
          return null;
        }
      };
      var contentError = "ContentError";
      var pageException = "PageException";
      var userSwitch = "user_switch";
      var USER_INTERACTION_REQUIRED = "USER_INTERACTION_REQUIRED";
      var USER_CANCEL = "USER_CANCEL";
      var NO_NETWORK = "NO_NETWORK";
      var DISABLED = "DISABLED";
      var ACCOUNT_UNAVAILABLE = "ACCOUNT_UNAVAILABLE";
      var UX_NOT_ALLOWED = "UX_NOT_ALLOWED";
      var INVALID_METHOD_ERROR = -2147186943;
      var NativeAuthErrorMessages = {
        [userSwitch]: "User attempted to switch accounts in the native broker, which is not allowed. All new accounts must sign-in through the standard web flow first, please try again."
      };
      var NativeAuthError = class _NativeAuthError extends AuthError {
        constructor(errorCode, description, ext) {
          super(errorCode, description);
          Object.setPrototypeOf(this, _NativeAuthError.prototype);
          this.name = "NativeAuthError";
          this.ext = ext;
        }
      };
      function isFatalNativeAuthError(error) {
        if (error.ext && error.ext.status && error.ext.status === DISABLED) {
          return true;
        }
        if (error.ext && error.ext.error && error.ext.error === INVALID_METHOD_ERROR) {
          return true;
        }
        switch (error.errorCode) {
          case contentError:
          case pageException:
            return true;
          default:
            return false;
        }
      }
      function createNativeAuthError(code, description, ext) {
        if (ext && ext.status) {
          switch (ext.status) {
            case ACCOUNT_UNAVAILABLE:
              return createInteractionRequiredAuthError(nativeAccountUnavailable);
            case USER_INTERACTION_REQUIRED:
              return new InteractionRequiredAuthError(code, description);
            case USER_CANCEL:
              return createBrowserAuthError(userCancelled);
            case NO_NETWORK:
              return createBrowserAuthError(noNetworkConnectivity);
            case UX_NOT_ALLOWED:
              return createInteractionRequiredAuthError(uxNotAllowed);
          }
        }
        return new NativeAuthError(code, NativeAuthErrorMessages[code] || description, ext);
      }
      var SilentCacheClient = class extends StandardInteractionClient {
        /**
         * Returns unexpired tokens from the cache, if available
         * @param silentRequest
         */
        async acquireToken(silentRequest) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.SilentCacheClientAcquireToken, silentRequest.correlationId);
          const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenSilent_silentFlow);
          const clientConfig = await invokeAsync(this.getClientConfiguration.bind(this), PerformanceEvents.StandardInteractionClientGetClientConfiguration, this.logger, this.performanceClient, this.correlationId)({
            serverTelemetryManager,
            requestAuthority: silentRequest.authority,
            requestAzureCloudOptions: silentRequest.azureCloudOptions,
            account: silentRequest.account
          });
          const silentAuthClient = new SilentFlowClient(clientConfig, this.performanceClient);
          this.logger.verbose("Silent auth client created");
          try {
            const response = await invokeAsync(silentAuthClient.acquireCachedToken.bind(silentAuthClient), PerformanceEvents.SilentFlowClientAcquireCachedToken, this.logger, this.performanceClient, silentRequest.correlationId)(silentRequest);
            const authResponse = response[0];
            this.performanceClient.addFields({
              fromCache: true
            }, silentRequest.correlationId);
            return authResponse;
          } catch (error) {
            if (error instanceof BrowserAuthError && error.errorCode === cryptoKeyNotFound) {
              this.logger.verbose("Signing keypair for bound access token not found. Refreshing bound access token and generating a new crypto keypair.");
            }
            throw error;
          }
        }
        /**
         * API to silenty clear the browser cache.
         * @param logoutRequest
         */
        logout(logoutRequest) {
          this.logger.verbose("logoutRedirect called");
          const validLogoutRequest = this.initializeLogoutRequest(logoutRequest);
          return this.clearCacheOnLogout(validLogoutRequest.correlationId, validLogoutRequest?.account);
        }
      };
      var PlatformAuthInteractionClient = class extends BaseInteractionClient {
        constructor(config2, browserStorage, browserCrypto, logger, eventHandler, navigationClient, apiId, performanceClient, provider, accountId, nativeStorageImpl, correlationId) {
          super(config2, browserStorage, browserCrypto, logger, eventHandler, navigationClient, performanceClient, provider, correlationId);
          this.apiId = apiId;
          this.accountId = accountId;
          this.platformAuthProvider = provider;
          this.nativeStorageManager = nativeStorageImpl;
          this.silentCacheClient = new SilentCacheClient(config2, this.nativeStorageManager, browserCrypto, logger, eventHandler, navigationClient, performanceClient, provider, correlationId);
          const extensionName = this.platformAuthProvider.getExtensionName();
          this.skus = ServerTelemetryManager.makeExtraSkuString({
            libraryName: BrowserConstants.MSAL_SKU,
            libraryVersion: version,
            extensionName,
            extensionVersion: this.platformAuthProvider.getExtensionVersion()
          });
        }
        /**
         * Adds SKUs to request extra query parameters
         * @param request {PlatformAuthRequest}
         * @private
         */
        addRequestSKUs(request) {
          request.extraParameters = {
            ...request.extraParameters,
            [X_CLIENT_EXTRA_SKU]: this.skus
          };
        }
        /**
         * Acquire token from native platform via browser extension
         * @param request
         */
        async acquireToken(request, cacheLookupPolicy) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.NativeInteractionClientAcquireToken, this.correlationId);
          this.logger.trace("NativeInteractionClient - acquireToken called.");
          const nativeATMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.NativeInteractionClientAcquireToken, this.correlationId);
          const reqTimestamp = nowSeconds();
          const serverTelemetryManager = this.initializeServerTelemetryManager(this.apiId);
          try {
            const nativeRequest = await this.initializeNativeRequest(request);
            try {
              const result = await this.acquireTokensFromCache(this.accountId, nativeRequest);
              nativeATMeasurement.end({
                success: true,
                isNativeBroker: false,
                fromCache: true
              });
              return result;
            } catch (e) {
              if (cacheLookupPolicy === CacheLookupPolicy.AccessToken) {
                this.logger.info("MSAL internal Cache does not contain tokens, return error as per cache policy");
                nativeATMeasurement.end({
                  success: false,
                  brokerErrorCode: "cache_request_failed"
                });
                throw e;
              }
              this.logger.info("MSAL internal Cache does not contain tokens, proceed to make a native call");
            }
            const validatedResponse = await this.platformAuthProvider.sendMessage(nativeRequest);
            return await this.handleNativeResponse(validatedResponse, nativeRequest, reqTimestamp).then((result) => {
              nativeATMeasurement.end({
                success: true,
                isNativeBroker: true,
                requestId: result.requestId
              });
              serverTelemetryManager.clearNativeBrokerErrorCode();
              return result;
            }).catch((error) => {
              nativeATMeasurement.end({
                success: false,
                errorCode: error.errorCode,
                subErrorCode: error.subError
              });
              throw error;
            });
          } catch (e) {
            if (e instanceof NativeAuthError) {
              serverTelemetryManager.setNativeBrokerErrorCode(e.errorCode);
            }
            nativeATMeasurement.end({
              success: false
            });
            throw e;
          }
        }
        /**
         * Creates silent flow request
         * @param request
         * @param cachedAccount
         * @returns CommonSilentFlowRequest
         */
        createSilentCacheRequest(request, cachedAccount) {
          return {
            authority: request.authority,
            correlationId: this.correlationId,
            scopes: ScopeSet.fromString(request.scope).asArray(),
            account: cachedAccount,
            forceRefresh: false
          };
        }
        /**
         * Fetches the tokens from the cache if un-expired
         * @param nativeAccountId
         * @param request
         * @returns authenticationResult
         */
        async acquireTokensFromCache(nativeAccountId, request) {
          if (!nativeAccountId) {
            this.logger.warning("NativeInteractionClient:acquireTokensFromCache - No nativeAccountId provided");
            throw createClientAuthError(noAccountFound);
          }
          const account2 = this.browserStorage.getBaseAccountInfo({
            nativeAccountId
          }, this.correlationId);
          if (!account2) {
            throw createClientAuthError(noAccountFound);
          }
          try {
            const silentRequest = this.createSilentCacheRequest(request, account2);
            const result = await this.silentCacheClient.acquireToken(silentRequest);
            const fullAccount = {
              ...account2,
              idTokenClaims: result?.idTokenClaims,
              idToken: result?.idToken
            };
            return {
              ...result,
              account: fullAccount
            };
          } catch (e) {
            throw e;
          }
        }
        /**
         * Acquires a token from native platform then redirects to the redirectUri instead of returning the response
         * @param {RedirectRequest} request
         * @param {InProgressPerformanceEvent} rootMeasurement
         */
        async acquireTokenRedirect(request, rootMeasurement) {
          this.logger.trace("NativeInteractionClient - acquireTokenRedirect called.");
          const { ...remainingParameters } = request;
          delete remainingParameters.onRedirectNavigate;
          const nativeRequest = await this.initializeNativeRequest(remainingParameters);
          try {
            await this.platformAuthProvider.sendMessage(nativeRequest);
          } catch (e) {
            if (e instanceof NativeAuthError) {
              const serverTelemetryManager = this.initializeServerTelemetryManager(this.apiId);
              serverTelemetryManager.setNativeBrokerErrorCode(e.errorCode);
              if (isFatalNativeAuthError(e)) {
                throw e;
              }
            }
          }
          this.browserStorage.setTemporaryCache(TemporaryCacheKeys.NATIVE_REQUEST, JSON.stringify(nativeRequest), true);
          const navigationOptions = {
            apiId: ApiId.acquireTokenRedirect,
            timeout: this.config.system.redirectNavigationTimeout,
            noHistory: false
          };
          const redirectUri = this.config.auth.navigateToLoginRequestUrl ? window.location.href : this.getRedirectUri(request.redirectUri);
          rootMeasurement.end({ success: true });
          await this.navigationClient.navigateExternal(redirectUri, navigationOptions);
        }
        /**
         * If the previous page called native platform for a token using redirect APIs, send the same request again and return the response
         * @param performanceClient {IPerformanceClient?}
         * @param correlationId {string?} correlation identifier
         */
        async handleRedirectPromise(performanceClient, correlationId) {
          this.logger.trace("NativeInteractionClient - handleRedirectPromise called.");
          if (!this.browserStorage.isInteractionInProgress(true)) {
            this.logger.info("handleRedirectPromise called but there is no interaction in progress, returning null.");
            return null;
          }
          const cachedRequest = this.browserStorage.getCachedNativeRequest();
          if (!cachedRequest) {
            this.logger.verbose("NativeInteractionClient - handleRedirectPromise called but there is no cached request, returning null.");
            if (performanceClient && correlationId) {
              performanceClient?.addFields({ errorCode: "no_cached_request" }, correlationId);
            }
            return null;
          }
          const { prompt, ...request } = cachedRequest;
          if (prompt) {
            this.logger.verbose("NativeInteractionClient - handleRedirectPromise called and prompt was included in the original request, removing prompt from cached request to prevent second interaction with native broker window.");
          }
          this.browserStorage.removeItem(this.browserStorage.generateCacheKey(TemporaryCacheKeys.NATIVE_REQUEST));
          const reqTimestamp = nowSeconds();
          try {
            this.logger.verbose("NativeInteractionClient - handleRedirectPromise sending message to native broker.");
            const response = await this.platformAuthProvider.sendMessage(request);
            const authResult = await this.handleNativeResponse(response, request, reqTimestamp);
            const serverTelemetryManager = this.initializeServerTelemetryManager(this.apiId);
            serverTelemetryManager.clearNativeBrokerErrorCode();
            if (performanceClient && this.correlationId) {
              this.performanceClient.addFields({ isNativeBroker: true }, this.correlationId);
            }
            return authResult;
          } catch (e) {
            throw e;
          }
        }
        /**
         * Logout from native platform via browser extension
         * @param request
         */
        logout() {
          this.logger.trace("NativeInteractionClient - logout called.");
          return Promise.reject("Logout not implemented yet");
        }
        /**
         * Transform response from native platform into AuthenticationResult object which will be returned to the end user
         * @param response
         * @param request
         * @param reqTimestamp
         */
        async handleNativeResponse(response, request, reqTimestamp) {
          this.logger.trace("NativeInteractionClient - handleNativeResponse called.");
          const idTokenClaims = extractTokenClaims(response.id_token, base64Decode);
          const homeAccountIdentifier = this.createHomeAccountIdentifier(response, idTokenClaims);
          const cachedhomeAccountId = this.browserStorage.getAccountInfoFilteredBy({
            nativeAccountId: request.accountId
          }, this.correlationId)?.homeAccountId;
          if (request.extraParameters?.child_client_id && response.account.id !== request.accountId) {
            this.logger.info("handleNativeServerResponse: Double broker flow detected, ignoring accountId mismatch");
          } else if (homeAccountIdentifier !== cachedhomeAccountId && response.account.id !== request.accountId) {
            throw createNativeAuthError(userSwitch);
          }
          const authority = await this.getDiscoveredAuthority({
            requestAuthority: request.authority
          });
          const baseAccount = buildAccountToCache(
            this.browserStorage,
            authority,
            homeAccountIdentifier,
            base64Decode,
            this.correlationId,
            idTokenClaims,
            response.client_info,
            void 0,
            // environment
            idTokenClaims.tid,
            void 0,
            // auth code payload
            response.account.id,
            this.logger
          );
          response.expires_in = Number(response.expires_in);
          const result = await this.generateAuthenticationResult(response, request, idTokenClaims, baseAccount, authority.canonicalAuthority, reqTimestamp);
          await this.cacheAccount(baseAccount, this.correlationId);
          await this.cacheNativeTokens(response, request, homeAccountIdentifier, idTokenClaims, response.access_token, result.tenantId, reqTimestamp);
          return result;
        }
        /**
         * creates an homeAccountIdentifier for the account
         * @param response
         * @param idTokenObj
         * @returns
         */
        createHomeAccountIdentifier(response, idTokenClaims) {
          const homeAccountIdentifier = AccountEntity.generateHomeAccountId(response.client_info || Constants.EMPTY_STRING, AuthorityType.Default, this.logger, this.browserCrypto, idTokenClaims);
          return homeAccountIdentifier;
        }
        /**
         * Helper to generate scopes
         * @param response
         * @param request
         * @returns
         */
        generateScopes(requestScopes, responseScopes) {
          return responseScopes ? ScopeSet.fromString(responseScopes) : ScopeSet.fromString(requestScopes);
        }
        /**
         * If PoP token is requesred, records the PoP token if returned from the WAM, else generates one in the browser
         * @param request
         * @param response
         */
        async generatePopAccessToken(response, request) {
          if (request.tokenType === AuthenticationScheme.POP && request.signPopToken) {
            if (response.shr) {
              this.logger.trace("handleNativeServerResponse: SHR is enabled in native layer");
              return response.shr;
            }
            const popTokenGenerator = new PopTokenGenerator(this.browserCrypto);
            const shrParameters = {
              resourceRequestMethod: request.resourceRequestMethod,
              resourceRequestUri: request.resourceRequestUri,
              shrClaims: request.shrClaims,
              shrNonce: request.shrNonce
            };
            if (!request.keyId) {
              throw createClientAuthError(keyIdMissing);
            }
            return popTokenGenerator.signPopToken(response.access_token, request.keyId, shrParameters);
          } else {
            return response.access_token;
          }
        }
        /**
         * Generates authentication result
         * @param response
         * @param request
         * @param idTokenObj
         * @param accountEntity
         * @param authority
         * @param reqTimestamp
         * @returns
         */
        async generateAuthenticationResult(response, request, idTokenClaims, accountEntity, authority, reqTimestamp) {
          const mats = this.addTelemetryFromNativeResponse(response.properties.MATS);
          const responseScopes = this.generateScopes(request.scope, response.scope);
          const accountProperties = response.account.properties || {};
          const uid = accountProperties["UID"] || idTokenClaims.oid || idTokenClaims.sub || Constants.EMPTY_STRING;
          const tid = accountProperties["TenantId"] || idTokenClaims.tid || Constants.EMPTY_STRING;
          const accountInfo = updateAccountTenantProfileData(
            accountEntity.getAccountInfo(),
            void 0,
            // tenantProfile optional
            idTokenClaims,
            response.id_token
          );
          if (accountInfo.nativeAccountId !== response.account.id) {
            accountInfo.nativeAccountId = response.account.id;
          }
          const responseAccessToken = await this.generatePopAccessToken(response, request);
          const tokenType = request.tokenType === AuthenticationScheme.POP ? AuthenticationScheme.POP : AuthenticationScheme.BEARER;
          const result = {
            authority,
            uniqueId: uid,
            tenantId: tid,
            scopes: responseScopes.asArray(),
            account: accountInfo,
            idToken: response.id_token,
            idTokenClaims,
            accessToken: responseAccessToken,
            fromCache: mats ? this.isResponseFromCache(mats) : false,
            // Request timestamp and NativeResponse expires_in are in seconds, converting to Date for AuthenticationResult
            expiresOn: toDateFromSeconds(reqTimestamp + response.expires_in),
            tokenType,
            correlationId: this.correlationId,
            state: response.state,
            fromNativeBroker: true
          };
          return result;
        }
        /**
         * cache the account entity in browser storage
         * @param accountEntity
         */
        async cacheAccount(accountEntity, correlationId) {
          await this.browserStorage.setAccount(accountEntity, this.correlationId);
          this.browserStorage.removeAccountContext(accountEntity.getAccountInfo(), correlationId);
        }
        /**
         * Stores the access_token and id_token in inmemory storage
         * @param response
         * @param request
         * @param homeAccountIdentifier
         * @param idTokenObj
         * @param responseAccessToken
         * @param tenantId
         * @param reqTimestamp
         */
        cacheNativeTokens(response, request, homeAccountIdentifier, idTokenClaims, responseAccessToken, tenantId, reqTimestamp) {
          const cachedIdToken = createIdTokenEntity(homeAccountIdentifier, request.authority, response.id_token || "", request.clientId, idTokenClaims.tid || "");
          const expiresIn = request.tokenType === AuthenticationScheme.POP ? Constants.SHR_NONCE_VALIDITY : (typeof response.expires_in === "string" ? parseInt(response.expires_in, 10) : response.expires_in) || 0;
          const tokenExpirationSeconds = reqTimestamp + expiresIn;
          const responseScopes = this.generateScopes(response.scope, request.scope);
          const cachedAccessToken = createAccessTokenEntity(homeAccountIdentifier, request.authority, responseAccessToken, request.clientId, idTokenClaims.tid || tenantId, responseScopes.printScopes(), tokenExpirationSeconds, 0, base64Decode, void 0, request.tokenType, void 0, request.keyId);
          const nativeCacheRecord = {
            idToken: cachedIdToken,
            accessToken: cachedAccessToken
          };
          return this.nativeStorageManager.saveCacheRecord(nativeCacheRecord, this.correlationId, request.storeInCache);
        }
        getExpiresInValue(tokenType, expiresIn) {
          return tokenType === AuthenticationScheme.POP ? Constants.SHR_NONCE_VALIDITY : (typeof expiresIn === "string" ? parseInt(expiresIn, 10) : expiresIn) || 0;
        }
        addTelemetryFromNativeResponse(matsResponse) {
          const mats = this.getMATSFromResponse(matsResponse);
          if (!mats) {
            return null;
          }
          this.performanceClient.addFields({
            extensionId: this.platformAuthProvider.getExtensionId(),
            extensionVersion: this.platformAuthProvider.getExtensionVersion(),
            matsBrokerVersion: mats.broker_version,
            matsAccountJoinOnStart: mats.account_join_on_start,
            matsAccountJoinOnEnd: mats.account_join_on_end,
            matsDeviceJoin: mats.device_join,
            matsPromptBehavior: mats.prompt_behavior,
            matsApiErrorCode: mats.api_error_code,
            matsUiVisible: mats.ui_visible,
            matsSilentCode: mats.silent_code,
            matsSilentBiSubCode: mats.silent_bi_sub_code,
            matsSilentMessage: mats.silent_message,
            matsSilentStatus: mats.silent_status,
            matsHttpStatus: mats.http_status,
            matsHttpEventCount: mats.http_event_count
          }, this.correlationId);
          return mats;
        }
        /**
         * Gets MATS telemetry from native response
         * @param response
         * @returns
         */
        getMATSFromResponse(matsResponse) {
          if (matsResponse) {
            try {
              return JSON.parse(matsResponse);
            } catch (e) {
              this.logger.error("NativeInteractionClient - Error parsing MATS telemetry, returning null instead");
            }
          }
          return null;
        }
        /**
         * Returns whether or not response came from native cache
         * @param response
         * @returns
         */
        isResponseFromCache(mats) {
          if (typeof mats.is_cached === "undefined") {
            this.logger.verbose("NativeInteractionClient - MATS telemetry does not contain field indicating if response was served from cache. Returning false.");
            return false;
          }
          return !!mats.is_cached;
        }
        /**
         * Translates developer provided request object into NativeRequest object
         * @param request
         */
        async initializeNativeRequest(request) {
          this.logger.trace("NativeInteractionClient - initializeNativeRequest called");
          const canonicalAuthority = await this.getCanonicalAuthority(request);
          const { scopes, ...remainingProperties } = request;
          const scopeSet = new ScopeSet(scopes || []);
          scopeSet.appendScopes(OIDC_DEFAULT_SCOPES);
          const validatedRequest = {
            ...remainingProperties,
            accountId: this.accountId,
            clientId: this.config.auth.clientId,
            authority: canonicalAuthority.urlString,
            scope: scopeSet.printScopes(),
            redirectUri: this.getRedirectUri(request.redirectUri),
            prompt: this.getPrompt(request.prompt),
            correlationId: this.correlationId,
            tokenType: request.authenticationScheme,
            windowTitleSubstring: document.title,
            extraParameters: {
              ...request.extraQueryParameters,
              ...request.tokenQueryParameters
            },
            extendedExpiryToken: false,
            keyId: request.popKid
          };
          if (validatedRequest.signPopToken && !!request.popKid) {
            throw createBrowserAuthError(invalidPopTokenRequest);
          }
          this.handleExtraBrokerParams(validatedRequest);
          validatedRequest.extraParameters = validatedRequest.extraParameters || {};
          validatedRequest.extraParameters.telemetry = PlatformAuthConstants.MATS_TELEMETRY;
          if (request.authenticationScheme === AuthenticationScheme.POP) {
            const shrParameters = {
              resourceRequestUri: request.resourceRequestUri,
              resourceRequestMethod: request.resourceRequestMethod,
              shrClaims: request.shrClaims,
              shrNonce: request.shrNonce
            };
            const popTokenGenerator = new PopTokenGenerator(this.browserCrypto);
            let reqCnfData;
            if (!validatedRequest.keyId) {
              const generatedReqCnfData = await invokeAsync(popTokenGenerator.generateCnf.bind(popTokenGenerator), PerformanceEvents.PopTokenGenerateCnf, this.logger, this.performanceClient, this.correlationId)(shrParameters, this.logger);
              reqCnfData = generatedReqCnfData.reqCnfString;
              validatedRequest.keyId = generatedReqCnfData.kid;
              validatedRequest.signPopToken = true;
            } else {
              reqCnfData = this.browserCrypto.base64UrlEncode(JSON.stringify({ kid: validatedRequest.keyId }));
              validatedRequest.signPopToken = false;
            }
            validatedRequest.reqCnf = reqCnfData;
          }
          this.addRequestSKUs(validatedRequest);
          return validatedRequest;
        }
        async getCanonicalAuthority(request) {
          const requestAuthority = request.authority || this.config.auth.authority;
          if (request.account) {
            await this.getDiscoveredAuthority({
              requestAuthority,
              requestAzureCloudOptions: request.azureCloudOptions,
              account: request.account
            });
          }
          const canonicalAuthority = new UrlString(requestAuthority);
          canonicalAuthority.validateAsUri();
          return canonicalAuthority;
        }
        getPrompt(prompt) {
          switch (this.apiId) {
            case ApiId.ssoSilent:
            case ApiId.acquireTokenSilent_silentFlow:
              this.logger.trace("initializeNativeRequest: silent request sets prompt to none");
              return PromptValue.NONE;
          }
          if (!prompt) {
            this.logger.trace("initializeNativeRequest: prompt was not provided");
            return void 0;
          }
          switch (prompt) {
            case PromptValue.NONE:
            case PromptValue.CONSENT:
            case PromptValue.LOGIN:
            case PromptValue.SELECT_ACCOUNT:
              this.logger.trace("initializeNativeRequest: prompt is compatible with native flow");
              return prompt;
            default:
              this.logger.trace(`initializeNativeRequest: prompt = ${prompt} is not compatible with native flow`);
              throw createBrowserAuthError(nativePromptNotSupported);
          }
        }
        /**
         * Handles extra broker request parameters
         * @param request {PlatformAuthRequest}
         * @private
         */
        handleExtraBrokerParams(request) {
          const hasExtraBrokerParams = request.extraParameters && request.extraParameters.hasOwnProperty(BROKER_CLIENT_ID) && request.extraParameters.hasOwnProperty(BROKER_REDIRECT_URI) && request.extraParameters.hasOwnProperty(CLIENT_ID);
          if (!request.embeddedClientId && !hasExtraBrokerParams) {
            return;
          }
          let child_client_id = "";
          const child_redirect_uri = request.redirectUri;
          if (request.embeddedClientId) {
            request.redirectUri = this.config.auth.redirectUri;
            child_client_id = request.embeddedClientId;
          } else if (request.extraParameters) {
            request.redirectUri = request.extraParameters[BROKER_REDIRECT_URI];
            child_client_id = request.extraParameters[CLIENT_ID];
          }
          request.extraParameters = {
            child_client_id,
            child_redirect_uri
          };
          this.performanceClient?.addFields({
            embeddedClientId: child_client_id,
            embeddedRedirectUri: child_redirect_uri
          }, this.correlationId);
        }
      };
      async function getStandardParameters(config2, authority, request, logger, performanceClient) {
        const parameters = getStandardAuthorizeRequestParameters({ ...config2.auth, authority }, request, logger, performanceClient);
        addLibraryInfo(parameters, {
          sku: BrowserConstants.MSAL_SKU,
          version,
          os: "",
          cpu: ""
        });
        if (config2.auth.protocolMode !== ProtocolMode.OIDC) {
          addApplicationTelemetry(parameters, config2.telemetry.application);
        }
        if (request.platformBroker) {
          addNativeBroker(parameters);
          performanceClient.addFields({
            isPlatformAuthorizeRequest: true
          }, request.correlationId);
          if (request.authenticationScheme === AuthenticationScheme.POP) {
            const cryptoOps = new CryptoOps(logger, performanceClient);
            const popTokenGenerator = new PopTokenGenerator(cryptoOps);
            let reqCnfData;
            if (!request.popKid) {
              const generatedReqCnfData = await invokeAsync(popTokenGenerator.generateCnf.bind(popTokenGenerator), PerformanceEvents.PopTokenGenerateCnf, logger, performanceClient, request.correlationId)(request, logger);
              reqCnfData = generatedReqCnfData.reqCnfString;
            } else {
              reqCnfData = cryptoOps.encodeKid(request.popKid);
            }
            addPopToken(parameters, reqCnfData);
          }
        }
        instrumentBrokerParams(parameters, request.correlationId, performanceClient);
        return parameters;
      }
      async function getAuthCodeRequestUrl(config2, authority, request, logger, performanceClient) {
        if (!request.codeChallenge) {
          throw createClientConfigurationError(pkceParamsMissing);
        }
        const parameters = await invokeAsync(getStandardParameters, PerformanceEvents.GetStandardParams, logger, performanceClient, request.correlationId)(config2, authority, request, logger, performanceClient);
        addResponseType(parameters, OAuthResponseType.CODE);
        addCodeChallengeParams(parameters, request.codeChallenge, Constants.S256_CODE_CHALLENGE_METHOD);
        addExtraQueryParameters(parameters, request.extraQueryParameters || {});
        return getAuthorizeUrl(authority, parameters, config2.auth.encodeExtraQueryParams, request.extraQueryParameters);
      }
      async function getEARForm(frame, config2, authority, request, logger, performanceClient) {
        if (!request.earJwk) {
          throw createBrowserAuthError(earJwkEmpty);
        }
        const parameters = await getStandardParameters(config2, authority, request, logger, performanceClient);
        addResponseType(parameters, OAuthResponseType.IDTOKEN_TOKEN_REFRESHTOKEN);
        addEARParameters(parameters, request.earJwk);
        const queryParams = /* @__PURE__ */ new Map();
        addExtraQueryParameters(queryParams, request.extraQueryParameters || {});
        const url = getAuthorizeUrl(authority, queryParams, config2.auth.encodeExtraQueryParams, request.extraQueryParameters);
        return createForm(frame, url, parameters);
      }
      async function getCodeForm(frame, config2, authority, request, logger, performanceClient) {
        const parameters = await getStandardParameters(config2, authority, request, logger, performanceClient);
        addResponseType(parameters, OAuthResponseType.CODE);
        addCodeChallengeParams(parameters, request.codeChallenge, request.codeChallengeMethod || Constants.S256_CODE_CHALLENGE_METHOD);
        addPostBodyParameters(parameters, request.authorizePostBodyParameters || {});
        const queryParams = /* @__PURE__ */ new Map();
        addExtraQueryParameters(queryParams, request.extraQueryParameters || {});
        const url = getAuthorizeUrl(authority, queryParams, config2.auth.encodeExtraQueryParams, request.extraQueryParameters);
        return createForm(frame, url, parameters);
      }
      function createForm(frame, authorizeUrl, parameters) {
        const form = frame.createElement("form");
        form.method = "post";
        form.action = authorizeUrl;
        parameters.forEach((value, key) => {
          const param = frame.createElement("input");
          param.hidden = true;
          param.name = key;
          param.value = value;
          form.appendChild(param);
        });
        frame.body.appendChild(form);
        return form;
      }
      async function handleResponsePlatformBroker(request, accountId, apiId, config2, browserStorage, nativeStorage, eventHandler, logger, performanceClient, platformAuthProvider) {
        logger.verbose("Account id found, calling WAM for token");
        if (!platformAuthProvider) {
          throw createBrowserAuthError(nativeConnectionNotEstablished);
        }
        const browserCrypto = new CryptoOps(logger, performanceClient);
        const nativeInteractionClient = new PlatformAuthInteractionClient(config2, browserStorage, browserCrypto, logger, eventHandler, config2.system.navigationClient, apiId, performanceClient, platformAuthProvider, accountId, nativeStorage, request.correlationId);
        const { userRequestState } = ProtocolUtils.parseRequestState(browserCrypto, request.state);
        return invokeAsync(nativeInteractionClient.acquireToken.bind(nativeInteractionClient), PerformanceEvents.NativeInteractionClientAcquireToken, logger, performanceClient, request.correlationId)({
          ...request,
          state: userRequestState,
          prompt: void 0
          // Server should handle the prompt, ideally native broker can do this part silently
        });
      }
      async function handleResponseCode(request, response, codeVerifier, apiId, config2, authClient, browserStorage, nativeStorage, eventHandler, logger, performanceClient, platformAuthProvider) {
        ThrottlingUtils.removeThrottle(browserStorage, config2.auth.clientId, request);
        if (response.accountId) {
          return invokeAsync(handleResponsePlatformBroker, PerformanceEvents.HandleResponsePlatformBroker, logger, performanceClient, request.correlationId)(request, response.accountId, apiId, config2, browserStorage, nativeStorage, eventHandler, logger, performanceClient, platformAuthProvider);
        }
        const authCodeRequest = {
          ...request,
          code: response.code || "",
          codeVerifier
        };
        const interactionHandler = new InteractionHandler(authClient, browserStorage, authCodeRequest, logger, performanceClient);
        const result = await invokeAsync(interactionHandler.handleCodeResponse.bind(interactionHandler), PerformanceEvents.HandleCodeResponse, logger, performanceClient, request.correlationId)(response, request);
        return result;
      }
      async function handleResponseEAR(request, response, apiId, config2, authority, browserStorage, nativeStorage, eventHandler, logger, performanceClient, platformAuthProvider) {
        ThrottlingUtils.removeThrottle(browserStorage, config2.auth.clientId, request);
        validateAuthorizationResponse(response, request.state);
        if (!response.ear_jwe) {
          throw createBrowserAuthError(earJweEmpty);
        }
        if (!request.earJwk) {
          throw createBrowserAuthError(earJwkEmpty);
        }
        const decryptedData = JSON.parse(await invokeAsync(decryptEarResponse, PerformanceEvents.DecryptEarResponse, logger, performanceClient, request.correlationId)(request.earJwk, response.ear_jwe));
        if (decryptedData.accountId) {
          return invokeAsync(handleResponsePlatformBroker, PerformanceEvents.HandleResponsePlatformBroker, logger, performanceClient, request.correlationId)(request, decryptedData.accountId, apiId, config2, browserStorage, nativeStorage, eventHandler, logger, performanceClient, platformAuthProvider);
        }
        const responseHandler = new ResponseHandler(config2.auth.clientId, browserStorage, new CryptoOps(logger, performanceClient), logger, null, null, performanceClient);
        responseHandler.validateTokenResponse(decryptedData);
        const additionalData = {
          code: "",
          state: request.state,
          nonce: request.nonce,
          client_info: decryptedData.client_info,
          cloud_graph_host_name: decryptedData.cloud_graph_host_name,
          cloud_instance_host_name: decryptedData.cloud_instance_host_name,
          cloud_instance_name: decryptedData.cloud_instance_name,
          msgraph_host: decryptedData.msgraph_host
        };
        return await invokeAsync(responseHandler.handleServerTokenResponse.bind(responseHandler), PerformanceEvents.HandleServerTokenResponse, logger, performanceClient, request.correlationId)(decryptedData, authority, nowSeconds(), request, additionalData, void 0, void 0, void 0, void 0);
      }
      var RANDOM_BYTE_ARR_LENGTH = 32;
      async function generatePkceCodes(performanceClient, logger, correlationId) {
        performanceClient.addQueueMeasurement(PerformanceEvents.GeneratePkceCodes, correlationId);
        const codeVerifier = invoke(generateCodeVerifier, PerformanceEvents.GenerateCodeVerifier, logger, performanceClient, correlationId)(performanceClient, logger, correlationId);
        const codeChallenge = await invokeAsync(generateCodeChallengeFromVerifier, PerformanceEvents.GenerateCodeChallengeFromVerifier, logger, performanceClient, correlationId)(codeVerifier, performanceClient, logger, correlationId);
        return {
          verifier: codeVerifier,
          challenge: codeChallenge
        };
      }
      function generateCodeVerifier(performanceClient, logger, correlationId) {
        try {
          const buffer = new Uint8Array(RANDOM_BYTE_ARR_LENGTH);
          invoke(getRandomValues, PerformanceEvents.GetRandomValues, logger, performanceClient, correlationId)(buffer);
          const pkceCodeVerifierB64 = urlEncodeArr(buffer);
          return pkceCodeVerifierB64;
        } catch (e) {
          throw createBrowserAuthError(pkceNotCreated);
        }
      }
      async function generateCodeChallengeFromVerifier(pkceCodeVerifier, performanceClient, logger, correlationId) {
        performanceClient.addQueueMeasurement(PerformanceEvents.GenerateCodeChallengeFromVerifier, correlationId);
        try {
          const pkceHashedCodeVerifier = await invokeAsync(sha256Digest, PerformanceEvents.Sha256Digest, logger, performanceClient, correlationId)(pkceCodeVerifier, performanceClient, correlationId);
          return urlEncodeArr(new Uint8Array(pkceHashedCodeVerifier));
        } catch (e) {
          throw createBrowserAuthError(pkceNotCreated);
        }
      }
      var PlatformAuthExtensionHandler = class _PlatformAuthExtensionHandler {
        constructor(logger, handshakeTimeoutMs, performanceClient, extensionId) {
          this.logger = logger;
          this.handshakeTimeoutMs = handshakeTimeoutMs;
          this.extensionId = extensionId;
          this.resolvers = /* @__PURE__ */ new Map();
          this.handshakeResolvers = /* @__PURE__ */ new Map();
          this.messageChannel = new MessageChannel();
          this.windowListener = this.onWindowMessage.bind(this);
          this.performanceClient = performanceClient;
          this.handshakeEvent = performanceClient.startMeasurement(PerformanceEvents.NativeMessageHandlerHandshake);
          this.platformAuthType = PlatformAuthConstants.PLATFORM_EXTENSION_PROVIDER;
        }
        /**
         * Sends a given message to the extension and resolves with the extension response
         * @param request
         */
        async sendMessage(request) {
          this.logger.trace(this.platformAuthType + " - sendMessage called.");
          const messageBody = {
            method: NativeExtensionMethod.GetToken,
            request
          };
          const req = {
            channel: PlatformAuthConstants.CHANNEL_ID,
            extensionId: this.extensionId,
            responseId: createNewGuid(),
            body: messageBody
          };
          this.logger.trace(this.platformAuthType + " - Sending request to browser extension");
          this.logger.tracePii(this.platformAuthType + ` - Sending request to browser extension: ${JSON.stringify(req)}`);
          this.messageChannel.port1.postMessage(req);
          const response = await new Promise((resolve, reject) => {
            this.resolvers.set(req.responseId, { resolve, reject });
          });
          const validatedResponse = this.validatePlatformBrokerResponse(response);
          return validatedResponse;
        }
        /**
         * Returns an instance of the MessageHandler that has successfully established a connection with an extension
         * @param {Logger} logger
         * @param {number} handshakeTimeoutMs
         * @param {IPerformanceClient} performanceClient
         * @param {ICrypto} crypto
         */
        static async createProvider(logger, handshakeTimeoutMs, performanceClient) {
          logger.trace("PlatformAuthExtensionHandler - createProvider called.");
          try {
            const preferredProvider = new _PlatformAuthExtensionHandler(logger, handshakeTimeoutMs, performanceClient, PlatformAuthConstants.PREFERRED_EXTENSION_ID);
            await preferredProvider.sendHandshakeRequest();
            return preferredProvider;
          } catch (e) {
            const backupProvider = new _PlatformAuthExtensionHandler(logger, handshakeTimeoutMs, performanceClient);
            await backupProvider.sendHandshakeRequest();
            return backupProvider;
          }
        }
        /**
         * Send handshake request helper.
         */
        async sendHandshakeRequest() {
          this.logger.trace(this.platformAuthType + " - sendHandshakeRequest called.");
          window.addEventListener("message", this.windowListener, false);
          const req = {
            channel: PlatformAuthConstants.CHANNEL_ID,
            extensionId: this.extensionId,
            responseId: createNewGuid(),
            body: {
              method: NativeExtensionMethod.HandshakeRequest
            }
          };
          this.handshakeEvent.add({
            extensionId: this.extensionId,
            extensionHandshakeTimeoutMs: this.handshakeTimeoutMs
          });
          this.messageChannel.port1.onmessage = (event) => {
            this.onChannelMessage(event);
          };
          window.postMessage(req, window.origin, [this.messageChannel.port2]);
          return new Promise((resolve, reject) => {
            this.handshakeResolvers.set(req.responseId, { resolve, reject });
            this.timeoutId = window.setTimeout(() => {
              window.removeEventListener("message", this.windowListener, false);
              this.messageChannel.port1.close();
              this.messageChannel.port2.close();
              this.handshakeEvent.end({
                extensionHandshakeTimedOut: true,
                success: false
              });
              reject(createBrowserAuthError(nativeHandshakeTimeout));
              this.handshakeResolvers.delete(req.responseId);
            }, this.handshakeTimeoutMs);
          });
        }
        /**
         * Invoked when a message is posted to the window. If a handshake request is received it means the extension is not installed.
         * @param event
         */
        onWindowMessage(event) {
          this.logger.trace(this.platformAuthType + " - onWindowMessage called");
          if (event.source !== window) {
            return;
          }
          const request = event.data;
          if (!request.channel || request.channel !== PlatformAuthConstants.CHANNEL_ID) {
            return;
          }
          if (request.extensionId && request.extensionId !== this.extensionId) {
            return;
          }
          if (request.body.method === NativeExtensionMethod.HandshakeRequest) {
            const handshakeResolver = this.handshakeResolvers.get(request.responseId);
            if (!handshakeResolver) {
              this.logger.trace(this.platformAuthType + `.onWindowMessage - resolver can't be found for request ${request.responseId}`);
              return;
            }
            this.logger.verbose(request.extensionId ? `Extension with id: ${request.extensionId} not installed` : "No extension installed");
            clearTimeout(this.timeoutId);
            this.messageChannel.port1.close();
            this.messageChannel.port2.close();
            window.removeEventListener("message", this.windowListener, false);
            this.handshakeEvent.end({
              success: false,
              extensionInstalled: false
            });
            handshakeResolver.reject(createBrowserAuthError(nativeExtensionNotInstalled));
          }
        }
        /**
         * Invoked when a message is received from the extension on the MessageChannel port
         * @param event
         */
        onChannelMessage(event) {
          this.logger.trace(this.platformAuthType + " - onChannelMessage called.");
          const request = event.data;
          const resolver = this.resolvers.get(request.responseId);
          const handshakeResolver = this.handshakeResolvers.get(request.responseId);
          try {
            const method = request.body.method;
            if (method === NativeExtensionMethod.Response) {
              if (!resolver) {
                return;
              }
              const response = request.body.response;
              this.logger.trace(this.platformAuthType + " - Received response from browser extension");
              this.logger.tracePii(this.platformAuthType + ` - Received response from browser extension: ${JSON.stringify(response)}`);
              if (response.status !== "Success") {
                resolver.reject(createNativeAuthError(response.code, response.description, response.ext));
              } else if (response.result) {
                if (response.result["code"] && response.result["description"]) {
                  resolver.reject(createNativeAuthError(response.result["code"], response.result["description"], response.result["ext"]));
                } else {
                  resolver.resolve(response.result);
                }
              } else {
                throw createAuthError(unexpectedError, "Event does not contain result.");
              }
              this.resolvers.delete(request.responseId);
            } else if (method === NativeExtensionMethod.HandshakeResponse) {
              if (!handshakeResolver) {
                this.logger.trace(this.platformAuthType + `.onChannelMessage - resolver can't be found for request ${request.responseId}`);
                return;
              }
              clearTimeout(this.timeoutId);
              window.removeEventListener("message", this.windowListener, false);
              this.extensionId = request.extensionId;
              this.extensionVersion = request.body.version;
              this.logger.verbose(this.platformAuthType + ` - Received HandshakeResponse from extension: ${this.extensionId}`);
              this.handshakeEvent.end({
                extensionInstalled: true,
                success: true
              });
              handshakeResolver.resolve();
              this.handshakeResolvers.delete(request.responseId);
            }
          } catch (err) {
            this.logger.error("Error parsing response from WAM Extension");
            this.logger.errorPii(`Error parsing response from WAM Extension: ${err}`);
            this.logger.errorPii(`Unable to parse ${event}`);
            if (resolver) {
              resolver.reject(err);
            } else if (handshakeResolver) {
              handshakeResolver.reject(err);
            }
          }
        }
        /**
         * Validates native platform response before processing
         * @param response
         */
        validatePlatformBrokerResponse(response) {
          if (response.hasOwnProperty("access_token") && response.hasOwnProperty("id_token") && response.hasOwnProperty("client_info") && response.hasOwnProperty("account") && response.hasOwnProperty("scope") && response.hasOwnProperty("expires_in")) {
            return response;
          } else {
            throw createAuthError(unexpectedError, "Response missing expected properties.");
          }
        }
        /**
         * Returns the Id for the browser extension this handler is communicating with
         * @returns
         */
        getExtensionId() {
          return this.extensionId;
        }
        /**
         * Returns the version for the browser extension this handler is communicating with
         * @returns
         */
        getExtensionVersion() {
          return this.extensionVersion;
        }
        getExtensionName() {
          return this.getExtensionId() === PlatformAuthConstants.PREFERRED_EXTENSION_ID ? "chrome" : this.getExtensionId()?.length ? "unknown" : void 0;
        }
      };
      var PlatformAuthDOMHandler = class _PlatformAuthDOMHandler {
        constructor(logger, performanceClient, correlationId) {
          this.logger = logger;
          this.performanceClient = performanceClient;
          this.correlationId = correlationId;
          this.platformAuthType = PlatformAuthConstants.PLATFORM_DOM_PROVIDER;
        }
        static async createProvider(logger, performanceClient, correlationId) {
          logger.trace("PlatformAuthDOMHandler: createProvider called");
          if (window.navigator?.platformAuthentication) {
            const supportedContracts = (
              // @ts-ignore
              await window.navigator.platformAuthentication.getSupportedContracts(PlatformAuthConstants.MICROSOFT_ENTRA_BROKERID)
            );
            if (supportedContracts?.includes(PlatformAuthConstants.PLATFORM_DOM_APIS)) {
              logger.trace("Platform auth api available in DOM");
              return new _PlatformAuthDOMHandler(logger, performanceClient, correlationId);
            }
          }
          return void 0;
        }
        /**
         * Returns the Id for the broker extension this handler is communicating with
         * @returns
         */
        getExtensionId() {
          return PlatformAuthConstants.MICROSOFT_ENTRA_BROKERID;
        }
        getExtensionVersion() {
          return "";
        }
        getExtensionName() {
          return PlatformAuthConstants.DOM_API_NAME;
        }
        /**
         * Send token request to platform broker via browser DOM API
         * @param request
         * @returns
         */
        async sendMessage(request) {
          this.logger.trace(this.platformAuthType + " - Sending request to browser DOM API");
          try {
            const platformDOMRequest = this.initializePlatformDOMRequest(request);
            const response = (
              // @ts-ignore
              await window.navigator.platformAuthentication.executeGetToken(platformDOMRequest)
            );
            return this.validatePlatformBrokerResponse(response);
          } catch (e) {
            this.logger.error(this.platformAuthType + " - executeGetToken DOM API error");
            throw e;
          }
        }
        initializePlatformDOMRequest(request) {
          this.logger.trace(this.platformAuthType + " - initializeNativeDOMRequest called");
          const { accountId, clientId, authority, scope, redirectUri, correlationId, state: state2, storeInCache, embeddedClientId, extraParameters, ...remainingProperties } = request;
          const validExtraParameters = this.getDOMExtraParams(remainingProperties);
          const platformDOMRequest = {
            accountId,
            brokerId: this.getExtensionId(),
            authority,
            clientId,
            correlationId: correlationId || this.correlationId,
            extraParameters: { ...extraParameters, ...validExtraParameters },
            isSecurityTokenService: false,
            redirectUri,
            scope,
            state: state2,
            storeInCache,
            embeddedClientId
          };
          return platformDOMRequest;
        }
        validatePlatformBrokerResponse(response) {
          if (response.hasOwnProperty("isSuccess")) {
            if (response.hasOwnProperty("accessToken") && response.hasOwnProperty("idToken") && response.hasOwnProperty("clientInfo") && response.hasOwnProperty("account") && response.hasOwnProperty("scopes") && response.hasOwnProperty("expiresIn")) {
              this.logger.trace(this.platformAuthType + " - platform broker returned successful and valid response");
              return this.convertToPlatformBrokerResponse(response);
            } else if (response.hasOwnProperty("error")) {
              const errorResponse = response;
              if (errorResponse.isSuccess === false && errorResponse.error && errorResponse.error.code) {
                this.logger.trace(this.platformAuthType + " - platform broker returned error response");
                throw createNativeAuthError(errorResponse.error.code, errorResponse.error.description, {
                  error: parseInt(errorResponse.error.errorCode),
                  protocol_error: errorResponse.error.protocolError,
                  status: errorResponse.error.status,
                  properties: errorResponse.error.properties
                });
              }
            }
          }
          throw createAuthError(unexpectedError, "Response missing expected properties.");
        }
        convertToPlatformBrokerResponse(response) {
          this.logger.trace(this.platformAuthType + " - convertToNativeResponse called");
          const nativeResponse = {
            access_token: response.accessToken,
            id_token: response.idToken,
            client_info: response.clientInfo,
            account: response.account,
            expires_in: response.expiresIn,
            scope: response.scopes,
            state: response.state || "",
            properties: response.properties || {},
            extendedLifetimeToken: response.extendedLifetimeToken ?? false,
            shr: response.proofOfPossessionPayload
          };
          return nativeResponse;
        }
        getDOMExtraParams(extraParameters) {
          const stringifiedParams = Object.entries(extraParameters).reduce((record, [key, value]) => {
            record[key] = String(value);
            return record;
          }, {});
          const validExtraParams = {
            ...stringifiedParams
          };
          return validExtraParams;
        }
      };
      async function isPlatformBrokerAvailable(loggerOptions, perfClient, correlationId) {
        const logger = new Logger(loggerOptions || {}, name, version);
        logger.trace("isPlatformBrokerAvailable called");
        const performanceClient = perfClient || new StubPerformanceClient();
        if (typeof window === "undefined") {
          logger.trace("Non-browser environment detected, returning false");
          return false;
        }
        return !!await getPlatformAuthProvider(logger, performanceClient, correlationId || createNewGuid());
      }
      async function getPlatformAuthProvider(logger, performanceClient, correlationId, nativeBrokerHandshakeTimeout) {
        logger.trace("getPlatformAuthProvider called", correlationId);
        const enablePlatformBrokerDOMSupport = isDomEnabledForPlatformAuth();
        logger.trace("Has client allowed platform auth via DOM API: " + enablePlatformBrokerDOMSupport);
        let platformAuthProvider;
        try {
          if (enablePlatformBrokerDOMSupport) {
            platformAuthProvider = await PlatformAuthDOMHandler.createProvider(logger, performanceClient, correlationId);
          }
          if (!platformAuthProvider) {
            logger.trace("Platform auth via DOM API not available, checking for extension");
            platformAuthProvider = await PlatformAuthExtensionHandler.createProvider(logger, nativeBrokerHandshakeTimeout || DEFAULT_NATIVE_BROKER_HANDSHAKE_TIMEOUT_MS, performanceClient);
          }
        } catch (e) {
          logger.trace("Platform auth not available", e);
        }
        return platformAuthProvider;
      }
      function isDomEnabledForPlatformAuth() {
        let sessionStorage;
        try {
          sessionStorage = window[BrowserCacheLocation.SessionStorage];
          return sessionStorage?.getItem(PLATFORM_AUTH_DOM_SUPPORT) === "true";
        } catch (e) {
          return false;
        }
      }
      function isPlatformAuthAllowed(config2, logger, platformAuthProvider, authenticationScheme) {
        logger.trace("isPlatformAuthAllowed called");
        if (!config2.system.allowPlatformBroker) {
          logger.trace("isPlatformAuthAllowed: allowPlatformBroker is not enabled, returning false");
          return false;
        }
        if (!platformAuthProvider) {
          logger.trace("isPlatformAuthAllowed: Platform auth provider is not initialized, returning false");
          return false;
        }
        if (authenticationScheme) {
          switch (authenticationScheme) {
            case AuthenticationScheme.BEARER:
            case AuthenticationScheme.POP:
              logger.trace("isPlatformAuthAllowed: authenticationScheme is supported, returning true");
              return true;
            default:
              logger.trace("isPlatformAuthAllowed: authenticationScheme is not supported, returning false");
              return false;
          }
        }
        return true;
      }
      var PopupClient = class extends StandardInteractionClient {
        constructor(config2, storageImpl, browserCrypto, logger, eventHandler, navigationClient, performanceClient, nativeStorageImpl, platformAuthHandler, correlationId) {
          super(config2, storageImpl, browserCrypto, logger, eventHandler, navigationClient, performanceClient, platformAuthHandler, correlationId);
          this.unloadWindow = this.unloadWindow.bind(this);
          this.nativeStorage = nativeStorageImpl;
          this.eventHandler = eventHandler;
        }
        /**
         * Acquires tokens by opening a popup window to the /authorize endpoint of the authority
         * @param request
         * @param pkceCodes
         */
        acquireToken(request, pkceCodes) {
          let popupParams = void 0;
          try {
            const popupName = this.generatePopupName(request.scopes || OIDC_DEFAULT_SCOPES, request.authority || this.config.auth.authority);
            popupParams = {
              popupName,
              popupWindowAttributes: request.popupWindowAttributes || {},
              popupWindowParent: request.popupWindowParent ?? window
            };
            this.performanceClient.addFields({ isAsyncPopup: this.config.system.asyncPopups }, this.correlationId);
            if (this.config.system.asyncPopups) {
              this.logger.verbose("asyncPopups set to true, acquiring token");
              return this.acquireTokenPopupAsync(request, popupParams, pkceCodes);
            } else {
              const validatedRequest = {
                ...request,
                httpMethod: validateRequestMethod(request, this.config.auth.protocolMode)
              };
              this.logger.verbose("asyncPopup set to false, opening popup before acquiring token");
              popupParams.popup = this.openSizedPopup("about:blank", popupParams);
              return this.acquireTokenPopupAsync(validatedRequest, popupParams, pkceCodes);
            }
          } catch (e) {
            return Promise.reject(e);
          }
        }
        /**
         * Clears local cache for the current user then opens a popup window prompting the user to sign-out of the server
         * @param logoutRequest
         */
        logout(logoutRequest) {
          try {
            this.logger.verbose("logoutPopup called");
            const validLogoutRequest = this.initializeLogoutRequest(logoutRequest);
            const popupParams = {
              popupName: this.generateLogoutPopupName(validLogoutRequest),
              popupWindowAttributes: logoutRequest?.popupWindowAttributes || {},
              popupWindowParent: logoutRequest?.popupWindowParent ?? window
            };
            const authority = logoutRequest && logoutRequest.authority;
            const mainWindowRedirectUri = logoutRequest && logoutRequest.mainWindowRedirectUri;
            if (this.config.system.asyncPopups) {
              this.logger.verbose("asyncPopups set to true");
              return this.logoutPopupAsync(validLogoutRequest, popupParams, authority, mainWindowRedirectUri);
            } else {
              this.logger.verbose("asyncPopup set to false, opening popup");
              popupParams.popup = this.openSizedPopup("about:blank", popupParams);
              return this.logoutPopupAsync(validLogoutRequest, popupParams, authority, mainWindowRedirectUri);
            }
          } catch (e) {
            return Promise.reject(e);
          }
        }
        /**
         * Helper which obtains an access_token for your API via opening a popup window in the user's browser
         * @param request
         * @param popupParams
         * @param pkceCodes
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        async acquireTokenPopupAsync(request, popupParams, pkceCodes) {
          this.logger.verbose("acquireTokenPopupAsync called");
          const validRequest = await invokeAsync(this.initializeAuthorizationRequest.bind(this), PerformanceEvents.StandardInteractionClientInitializeAuthorizationRequest, this.logger, this.performanceClient, this.correlationId)(request, exports.InteractionType.Popup);
          if (popupParams.popup) {
            preconnect(validRequest.authority);
          }
          const isPlatformBroker = isPlatformAuthAllowed(this.config, this.logger, this.platformAuthProvider, request.authenticationScheme);
          validRequest.platformBroker = isPlatformBroker;
          if (this.config.auth.protocolMode === ProtocolMode.EAR) {
            return this.executeEarFlow(validRequest, popupParams);
          } else {
            return this.executeCodeFlow(validRequest, popupParams, pkceCodes);
          }
        }
        /**
         * Executes auth code + PKCE flow
         * @param request
         * @param popupParams
         * @param pkceCodes
         * @returns
         */
        async executeCodeFlow(request, popupParams, pkceCodes) {
          const correlationId = request.correlationId;
          const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenPopup);
          const pkce = pkceCodes || await invokeAsync(generatePkceCodes, PerformanceEvents.GeneratePkceCodes, this.logger, this.performanceClient, correlationId)(this.performanceClient, this.logger, correlationId);
          const popupRequest = {
            ...request,
            codeChallenge: pkce.challenge
          };
          try {
            const authClient = await invokeAsync(this.createAuthCodeClient.bind(this), PerformanceEvents.StandardInteractionClientCreateAuthCodeClient, this.logger, this.performanceClient, correlationId)({
              serverTelemetryManager,
              requestAuthority: popupRequest.authority,
              requestAzureCloudOptions: popupRequest.azureCloudOptions,
              requestExtraQueryParameters: popupRequest.extraQueryParameters,
              account: popupRequest.account
            });
            if (popupRequest.httpMethod === HttpMethod.POST) {
              return await this.executeCodeFlowWithPost(popupRequest, popupParams, authClient, pkce.verifier);
            } else {
              const navigateUrl = await invokeAsync(getAuthCodeRequestUrl, PerformanceEvents.GetAuthCodeUrl, this.logger, this.performanceClient, correlationId)(this.config, authClient.authority, popupRequest, this.logger, this.performanceClient);
              const popupWindow = this.initiateAuthRequest(navigateUrl, popupParams);
              this.eventHandler.emitEvent(EventType.POPUP_OPENED, exports.InteractionType.Popup, { popupWindow }, null);
              const responseString = await this.monitorPopupForHash(popupWindow, popupParams.popupWindowParent);
              const serverParams = invoke(deserializeResponse, PerformanceEvents.DeserializeResponse, this.logger, this.performanceClient, this.correlationId)(responseString, this.config.auth.OIDCOptions.serverResponseType, this.logger);
              return await invokeAsync(handleResponseCode, PerformanceEvents.HandleResponseCode, this.logger, this.performanceClient, correlationId)(request, serverParams, pkce.verifier, ApiId.acquireTokenPopup, this.config, authClient, this.browserStorage, this.nativeStorage, this.eventHandler, this.logger, this.performanceClient, this.platformAuthProvider);
            }
          } catch (e) {
            popupParams.popup?.close();
            if (e instanceof AuthError) {
              e.setCorrelationId(this.correlationId);
              serverTelemetryManager.cacheFailedRequest(e);
            }
            throw e;
          }
        }
        /**
         * Executes EAR flow
         * @param request
         */
        async executeEarFlow(request, popupParams) {
          const correlationId = request.correlationId;
          const discoveredAuthority = await invokeAsync(this.getDiscoveredAuthority.bind(this), PerformanceEvents.StandardInteractionClientGetDiscoveredAuthority, this.logger, this.performanceClient, correlationId)({
            requestAuthority: request.authority,
            requestAzureCloudOptions: request.azureCloudOptions,
            requestExtraQueryParameters: request.extraQueryParameters,
            account: request.account
          });
          const earJwk = await invokeAsync(generateEarKey, PerformanceEvents.GenerateEarKey, this.logger, this.performanceClient, correlationId)();
          const popupRequest = {
            ...request,
            earJwk
          };
          const popupWindow = popupParams.popup || this.openPopup("about:blank", popupParams);
          const form = await getEARForm(popupWindow.document, this.config, discoveredAuthority, popupRequest, this.logger, this.performanceClient);
          form.submit();
          const responseString = await invokeAsync(this.monitorPopupForHash.bind(this), PerformanceEvents.SilentHandlerMonitorIframeForHash, this.logger, this.performanceClient, correlationId)(popupWindow, popupParams.popupWindowParent);
          const serverParams = invoke(deserializeResponse, PerformanceEvents.DeserializeResponse, this.logger, this.performanceClient, this.correlationId)(responseString, this.config.auth.OIDCOptions.serverResponseType, this.logger);
          return invokeAsync(handleResponseEAR, PerformanceEvents.HandleResponseEar, this.logger, this.performanceClient, correlationId)(popupRequest, serverParams, ApiId.acquireTokenPopup, this.config, discoveredAuthority, this.browserStorage, this.nativeStorage, this.eventHandler, this.logger, this.performanceClient, this.platformAuthProvider);
        }
        async executeCodeFlowWithPost(request, popupParams, authClient, pkceVerifier) {
          const correlationId = request.correlationId;
          const discoveredAuthority = await invokeAsync(this.getDiscoveredAuthority.bind(this), PerformanceEvents.StandardInteractionClientGetDiscoveredAuthority, this.logger, this.performanceClient, correlationId)({
            requestAuthority: request.authority,
            requestAzureCloudOptions: request.azureCloudOptions,
            requestExtraQueryParameters: request.extraQueryParameters,
            account: request.account
          });
          const popupWindow = popupParams.popup || this.openPopup("about:blank", popupParams);
          const form = await getCodeForm(popupWindow.document, this.config, discoveredAuthority, request, this.logger, this.performanceClient);
          form.submit();
          const responseString = await invokeAsync(this.monitorPopupForHash.bind(this), PerformanceEvents.SilentHandlerMonitorIframeForHash, this.logger, this.performanceClient, correlationId)(popupWindow, popupParams.popupWindowParent);
          const serverParams = invoke(deserializeResponse, PerformanceEvents.DeserializeResponse, this.logger, this.performanceClient, this.correlationId)(responseString, this.config.auth.OIDCOptions.serverResponseType, this.logger);
          return invokeAsync(handleResponseCode, PerformanceEvents.HandleResponseCode, this.logger, this.performanceClient, correlationId)(request, serverParams, pkceVerifier, ApiId.acquireTokenPopup, this.config, authClient, this.browserStorage, this.nativeStorage, this.eventHandler, this.logger, this.performanceClient, this.platformAuthProvider);
        }
        /**
         *
         * @param validRequest
         * @param popupName
         * @param requestAuthority
         * @param popup
         * @param mainWindowRedirectUri
         * @param popupWindowAttributes
         */
        async logoutPopupAsync(validRequest, popupParams, requestAuthority, mainWindowRedirectUri) {
          this.logger.verbose("logoutPopupAsync called");
          this.eventHandler.emitEvent(EventType.LOGOUT_START, exports.InteractionType.Popup, validRequest);
          const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.logoutPopup);
          try {
            await this.clearCacheOnLogout(this.correlationId, validRequest.account);
            const authClient = await invokeAsync(this.createAuthCodeClient.bind(this), PerformanceEvents.StandardInteractionClientCreateAuthCodeClient, this.logger, this.performanceClient, this.correlationId)({
              serverTelemetryManager,
              requestAuthority,
              account: validRequest.account || void 0
            });
            try {
              authClient.authority.endSessionEndpoint;
            } catch {
              if (validRequest.account?.homeAccountId && validRequest.postLogoutRedirectUri && authClient.authority.protocolMode === ProtocolMode.OIDC) {
                this.eventHandler.emitEvent(EventType.LOGOUT_SUCCESS, exports.InteractionType.Popup, validRequest);
                if (mainWindowRedirectUri) {
                  const navigationOptions = {
                    apiId: ApiId.logoutPopup,
                    timeout: this.config.system.redirectNavigationTimeout,
                    noHistory: false
                  };
                  const absoluteUrl = UrlString.getAbsoluteUrl(mainWindowRedirectUri, getCurrentUri());
                  await this.navigationClient.navigateInternal(absoluteUrl, navigationOptions);
                }
                popupParams.popup?.close();
                return;
              }
            }
            const logoutUri = authClient.getLogoutUri(validRequest);
            this.eventHandler.emitEvent(EventType.LOGOUT_SUCCESS, exports.InteractionType.Popup, validRequest);
            const popupWindow = this.openPopup(logoutUri, popupParams);
            this.eventHandler.emitEvent(EventType.POPUP_OPENED, exports.InteractionType.Popup, { popupWindow }, null);
            await this.monitorPopupForHash(popupWindow, popupParams.popupWindowParent).catch(() => {
            });
            if (mainWindowRedirectUri) {
              const navigationOptions = {
                apiId: ApiId.logoutPopup,
                timeout: this.config.system.redirectNavigationTimeout,
                noHistory: false
              };
              const absoluteUrl = UrlString.getAbsoluteUrl(mainWindowRedirectUri, getCurrentUri());
              this.logger.verbose("Redirecting main window to url specified in the request");
              this.logger.verbosePii(`Redirecting main window to: ${absoluteUrl}`);
              await this.navigationClient.navigateInternal(absoluteUrl, navigationOptions);
            } else {
              this.logger.verbose("No main window navigation requested");
            }
          } catch (e) {
            popupParams.popup?.close();
            if (e instanceof AuthError) {
              e.setCorrelationId(this.correlationId);
              serverTelemetryManager.cacheFailedRequest(e);
            }
            this.eventHandler.emitEvent(EventType.LOGOUT_FAILURE, exports.InteractionType.Popup, null, e);
            this.eventHandler.emitEvent(EventType.LOGOUT_END, exports.InteractionType.Popup);
            throw e;
          }
          this.eventHandler.emitEvent(EventType.LOGOUT_END, exports.InteractionType.Popup);
        }
        /**
         * Opens a popup window with given request Url.
         * @param requestUrl
         */
        initiateAuthRequest(requestUrl, params) {
          if (requestUrl) {
            this.logger.infoPii(`Navigate to: ${requestUrl}`);
            return this.openPopup(requestUrl, params);
          } else {
            this.logger.error("Navigate url is empty");
            throw createBrowserAuthError(emptyNavigateUri);
          }
        }
        /**
         * Monitors a window until it loads a url with the same origin.
         * @param popupWindow - window that is being monitored
         * @param timeout - timeout for processing hash once popup is redirected back to application
         */
        monitorPopupForHash(popupWindow, popupWindowParent) {
          return new Promise((resolve, reject) => {
            this.logger.verbose("PopupHandler.monitorPopupForHash - polling started");
            const intervalId = setInterval(() => {
              if (popupWindow.closed) {
                this.logger.error("PopupHandler.monitorPopupForHash - window closed");
                clearInterval(intervalId);
                reject(createBrowserAuthError(userCancelled));
                return;
              }
              let href = "";
              try {
                href = popupWindow.location.href;
              } catch (e) {
              }
              if (!href || href === "about:blank") {
                return;
              }
              clearInterval(intervalId);
              let responseString = "";
              const responseType = this.config.auth.OIDCOptions.serverResponseType;
              if (popupWindow) {
                if (responseType === ServerResponseType.QUERY) {
                  responseString = popupWindow.location.search;
                } else {
                  responseString = popupWindow.location.hash;
                }
              }
              this.logger.verbose("PopupHandler.monitorPopupForHash - popup window is on same origin as caller");
              resolve(responseString);
            }, this.config.system.pollIntervalMilliseconds);
          }).finally(() => {
            this.cleanPopup(popupWindow, popupWindowParent);
          });
        }
        /**
         * @hidden
         *
         * Configures popup window for login.
         *
         * @param urlNavigate
         * @param title
         * @param popUpWidth
         * @param popUpHeight
         * @param popupWindowAttributes
         * @ignore
         * @hidden
         */
        openPopup(urlNavigate, popupParams) {
          try {
            let popupWindow;
            if (popupParams.popup) {
              popupWindow = popupParams.popup;
              this.logger.verbosePii(`Navigating popup window to: ${urlNavigate}`);
              popupWindow.location.assign(urlNavigate);
            } else if (typeof popupParams.popup === "undefined") {
              this.logger.verbosePii(`Opening popup window to: ${urlNavigate}`);
              popupWindow = this.openSizedPopup(urlNavigate, popupParams);
            }
            if (!popupWindow) {
              throw createBrowserAuthError(emptyWindowError);
            }
            if (popupWindow.focus) {
              popupWindow.focus();
            }
            this.currentWindow = popupWindow;
            popupParams.popupWindowParent.addEventListener("beforeunload", this.unloadWindow);
            return popupWindow;
          } catch (e) {
            this.logger.error("error opening popup " + e.message);
            throw createBrowserAuthError(popupWindowError);
          }
        }
        /**
         * Helper function to set popup window dimensions and position
         * @param urlNavigate
         * @param popupName
         * @param popupWindowAttributes
         * @returns
         */
        openSizedPopup(urlNavigate, { popupName, popupWindowAttributes, popupWindowParent }) {
          const winLeft = popupWindowParent.screenLeft ? popupWindowParent.screenLeft : popupWindowParent.screenX;
          const winTop = popupWindowParent.screenTop ? popupWindowParent.screenTop : popupWindowParent.screenY;
          const winWidth = popupWindowParent.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
          const winHeight = popupWindowParent.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
          let width = popupWindowAttributes.popupSize?.width;
          let height = popupWindowAttributes.popupSize?.height;
          let top = popupWindowAttributes.popupPosition?.top;
          let left = popupWindowAttributes.popupPosition?.left;
          if (!width || width < 0 || width > winWidth) {
            this.logger.verbose("Default popup window width used. Window width not configured or invalid.");
            width = BrowserConstants.POPUP_WIDTH;
          }
          if (!height || height < 0 || height > winHeight) {
            this.logger.verbose("Default popup window height used. Window height not configured or invalid.");
            height = BrowserConstants.POPUP_HEIGHT;
          }
          if (!top || top < 0 || top > winHeight) {
            this.logger.verbose("Default popup window top position used. Window top not configured or invalid.");
            top = Math.max(0, winHeight / 2 - BrowserConstants.POPUP_HEIGHT / 2 + winTop);
          }
          if (!left || left < 0 || left > winWidth) {
            this.logger.verbose("Default popup window left position used. Window left not configured or invalid.");
            left = Math.max(0, winWidth / 2 - BrowserConstants.POPUP_WIDTH / 2 + winLeft);
          }
          return popupWindowParent.open(urlNavigate, popupName, `width=${width}, height=${height}, top=${top}, left=${left}, scrollbars=yes`);
        }
        /**
         * Event callback to unload main window.
         */
        unloadWindow(e) {
          if (this.currentWindow) {
            this.currentWindow.close();
          }
          e.preventDefault();
        }
        /**
         * Closes popup, removes any state vars created during popup calls.
         * @param popupWindow
         */
        cleanPopup(popupWindow, popupWindowParent) {
          popupWindow.close();
          popupWindowParent.removeEventListener("beforeunload", this.unloadWindow);
        }
        /**
         * Generates the name for the popup based on the client id and request
         * @param clientId
         * @param request
         */
        generatePopupName(scopes, authority) {
          return `${BrowserConstants.POPUP_NAME_PREFIX}.${this.config.auth.clientId}.${scopes.join("-")}.${authority}.${this.correlationId}`;
        }
        /**
         * Generates the name for the popup based on the client id and request for logouts
         * @param clientId
         * @param request
         */
        generateLogoutPopupName(request) {
          const homeAccountId = request.account && request.account.homeAccountId;
          return `${BrowserConstants.POPUP_NAME_PREFIX}.${this.config.auth.clientId}.${homeAccountId}.${this.correlationId}`;
        }
      };
      function getNavigationType() {
        if (typeof window === "undefined" || typeof window.performance === "undefined" || typeof window.performance.getEntriesByType !== "function") {
          return void 0;
        }
        const navigationEntries = window.performance.getEntriesByType("navigation");
        const navigation = navigationEntries.length ? navigationEntries[0] : void 0;
        return navigation?.type;
      }
      var RedirectClient = class extends StandardInteractionClient {
        constructor(config2, storageImpl, browserCrypto, logger, eventHandler, navigationClient, performanceClient, nativeStorageImpl, platformAuthHandler, correlationId) {
          super(config2, storageImpl, browserCrypto, logger, eventHandler, navigationClient, performanceClient, platformAuthHandler, correlationId);
          this.nativeStorage = nativeStorageImpl;
        }
        /**
         * Redirects the page to the /authorize endpoint of the IDP
         * @param request
         */
        async acquireToken(request) {
          const validRequest = await invokeAsync(this.initializeAuthorizationRequest.bind(this), PerformanceEvents.StandardInteractionClientInitializeAuthorizationRequest, this.logger, this.performanceClient, this.correlationId)(request, exports.InteractionType.Redirect);
          validRequest.platformBroker = isPlatformAuthAllowed(this.config, this.logger, this.platformAuthProvider, request.authenticationScheme);
          const handleBackButton = (event) => {
            if (event.persisted) {
              this.logger.verbose("Page was restored from back/forward cache. Clearing temporary cache.");
              this.browserStorage.resetRequestCache();
              this.eventHandler.emitEvent(EventType.RESTORE_FROM_BFCACHE, exports.InteractionType.Redirect);
            }
          };
          const redirectStartPage = this.getRedirectStartPage(request.redirectStartPage);
          this.logger.verbosePii(`Redirect start page: ${redirectStartPage}`);
          this.browserStorage.setTemporaryCache(TemporaryCacheKeys.ORIGIN_URI, redirectStartPage, true);
          window.addEventListener("pageshow", handleBackButton);
          try {
            if (this.config.auth.protocolMode === ProtocolMode.EAR) {
              await this.executeEarFlow(validRequest);
            } else {
              await this.executeCodeFlow(validRequest, request.onRedirectNavigate);
            }
          } catch (e) {
            if (e instanceof AuthError) {
              e.setCorrelationId(this.correlationId);
            }
            window.removeEventListener("pageshow", handleBackButton);
            throw e;
          }
        }
        /**
         * Executes auth code + PKCE flow
         * @param request
         * @returns
         */
        async executeCodeFlow(request, onRedirectNavigate) {
          const correlationId = request.correlationId;
          const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenRedirect);
          const pkceCodes = await invokeAsync(generatePkceCodes, PerformanceEvents.GeneratePkceCodes, this.logger, this.performanceClient, correlationId)(this.performanceClient, this.logger, correlationId);
          const redirectRequest = {
            ...request,
            codeChallenge: pkceCodes.challenge
          };
          this.browserStorage.cacheAuthorizeRequest(redirectRequest, pkceCodes.verifier);
          try {
            if (redirectRequest.httpMethod === HttpMethod.POST) {
              return await this.executeCodeFlowWithPost(redirectRequest);
            } else {
              const authClient = await invokeAsync(this.createAuthCodeClient.bind(this), PerformanceEvents.StandardInteractionClientCreateAuthCodeClient, this.logger, this.performanceClient, this.correlationId)({
                serverTelemetryManager,
                requestAuthority: redirectRequest.authority,
                requestAzureCloudOptions: redirectRequest.azureCloudOptions,
                requestExtraQueryParameters: redirectRequest.extraQueryParameters,
                account: redirectRequest.account
              });
              const navigateUrl = await invokeAsync(getAuthCodeRequestUrl, PerformanceEvents.GetAuthCodeUrl, this.logger, this.performanceClient, request.correlationId)(this.config, authClient.authority, redirectRequest, this.logger, this.performanceClient);
              return await this.initiateAuthRequest(navigateUrl, onRedirectNavigate);
            }
          } catch (e) {
            if (e instanceof AuthError) {
              e.setCorrelationId(this.correlationId);
              serverTelemetryManager.cacheFailedRequest(e);
            }
            throw e;
          }
        }
        /**
         * Executes EAR flow
         * @param request
         */
        async executeEarFlow(request) {
          const correlationId = request.correlationId;
          const discoveredAuthority = await invokeAsync(this.getDiscoveredAuthority.bind(this), PerformanceEvents.StandardInteractionClientGetDiscoveredAuthority, this.logger, this.performanceClient, correlationId)({
            requestAuthority: request.authority,
            requestAzureCloudOptions: request.azureCloudOptions,
            requestExtraQueryParameters: request.extraQueryParameters,
            account: request.account
          });
          const earJwk = await invokeAsync(generateEarKey, PerformanceEvents.GenerateEarKey, this.logger, this.performanceClient, correlationId)();
          const redirectRequest = {
            ...request,
            earJwk
          };
          this.browserStorage.cacheAuthorizeRequest(redirectRequest);
          const form = await getEARForm(document, this.config, discoveredAuthority, redirectRequest, this.logger, this.performanceClient);
          form.submit();
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(createBrowserAuthError(timedOut, "failed_to_redirect"));
            }, this.config.system.redirectNavigationTimeout);
          });
        }
        /**
         * Executes classic Authorization Code flow with a POST request.
         * @param request
         */
        async executeCodeFlowWithPost(request) {
          const correlationId = request.correlationId;
          const discoveredAuthority = await invokeAsync(this.getDiscoveredAuthority.bind(this), PerformanceEvents.StandardInteractionClientGetDiscoveredAuthority, this.logger, this.performanceClient, correlationId)({
            requestAuthority: request.authority,
            requestAzureCloudOptions: request.azureCloudOptions,
            requestExtraQueryParameters: request.extraQueryParameters,
            account: request.account
          });
          this.browserStorage.cacheAuthorizeRequest(request);
          const form = await getCodeForm(document, this.config, discoveredAuthority, request, this.logger, this.performanceClient);
          form.submit();
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(createBrowserAuthError(timedOut, "failed_to_redirect"));
            }, this.config.system.redirectNavigationTimeout);
          });
        }
        /**
         * Checks if navigateToLoginRequestUrl is set, and:
         * - if true, performs logic to cache and navigate
         * - if false, handles hash string and parses response
         * @param hash {string} url hash
         * @param parentMeasurement {InProgressPerformanceEvent} parent measurement
         */
        async handleRedirectPromise(hash = "", request, pkceVerifier, parentMeasurement) {
          const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.handleRedirectPromise);
          try {
            const [serverParams, responseString] = this.getRedirectResponse(hash || "");
            if (!serverParams) {
              this.logger.info("handleRedirectPromise did not detect a response as a result of a redirect. Cleaning temporary cache.");
              this.browserStorage.resetRequestCache();
              if (getNavigationType() !== "back_forward") {
                parentMeasurement.event.errorCode = "no_server_response";
              } else {
                this.logger.verbose("Back navigation event detected. Muting no_server_response error");
              }
              return null;
            }
            const loginRequestUrl = this.browserStorage.getTemporaryCache(TemporaryCacheKeys.ORIGIN_URI, true) || Constants.EMPTY_STRING;
            const loginRequestUrlNormalized = normalizeUrlForComparison(loginRequestUrl);
            const currentUrlNormalized = normalizeUrlForComparison(window.location.href);
            if (loginRequestUrlNormalized === currentUrlNormalized && this.config.auth.navigateToLoginRequestUrl) {
              this.logger.verbose("Current page is loginRequestUrl, handling response");
              if (loginRequestUrl.indexOf("#") > -1) {
                replaceHash(loginRequestUrl);
              }
              const handleHashResult = await this.handleResponse(serverParams, request, pkceVerifier, serverTelemetryManager);
              return handleHashResult;
            } else if (!this.config.auth.navigateToLoginRequestUrl) {
              this.logger.verbose("NavigateToLoginRequestUrl set to false, handling response");
              return await this.handleResponse(serverParams, request, pkceVerifier, serverTelemetryManager);
            } else if (!isInIframe() || this.config.system.allowRedirectInIframe) {
              this.browserStorage.setTemporaryCache(TemporaryCacheKeys.URL_HASH, responseString, true);
              const navigationOptions = {
                apiId: ApiId.handleRedirectPromise,
                timeout: this.config.system.redirectNavigationTimeout,
                noHistory: true
              };
              let processHashOnRedirect = true;
              if (!loginRequestUrl || loginRequestUrl === "null") {
                const homepage = getHomepage();
                this.browserStorage.setTemporaryCache(TemporaryCacheKeys.ORIGIN_URI, homepage, true);
                this.logger.warning("Unable to get valid login request url from cache, redirecting to home page");
                processHashOnRedirect = await this.navigationClient.navigateInternal(homepage, navigationOptions);
              } else {
                this.logger.verbose(`Navigating to loginRequestUrl: ${loginRequestUrl}`);
                processHashOnRedirect = await this.navigationClient.navigateInternal(loginRequestUrl, navigationOptions);
              }
              if (!processHashOnRedirect) {
                return await this.handleResponse(serverParams, request, pkceVerifier, serverTelemetryManager);
              }
            }
            return null;
          } catch (e) {
            if (e instanceof AuthError) {
              e.setCorrelationId(this.correlationId);
              serverTelemetryManager.cacheFailedRequest(e);
            }
            throw e;
          }
        }
        /**
         * Gets the response hash for a redirect request
         * Returns null if interactionType in the state value is not "redirect" or the hash does not contain known properties
         * @param hash
         */
        getRedirectResponse(userProvidedResponse) {
          this.logger.verbose("getRedirectResponseHash called");
          let responseString = userProvidedResponse;
          if (!responseString) {
            if (this.config.auth.OIDCOptions.serverResponseType === ServerResponseType.QUERY) {
              responseString = window.location.search;
            } else {
              responseString = window.location.hash;
            }
          }
          let response = getDeserializedResponse(responseString);
          if (response) {
            try {
              validateInteractionType(response, this.browserCrypto, exports.InteractionType.Redirect);
            } catch (e) {
              if (e instanceof AuthError) {
                this.logger.error(`Interaction type validation failed due to ${e.errorCode}: ${e.errorMessage}`);
              }
              return [null, ""];
            }
            clearHash(window);
            this.logger.verbose("Hash contains known properties, returning response hash");
            return [response, responseString];
          }
          const cachedHash = this.browserStorage.getTemporaryCache(TemporaryCacheKeys.URL_HASH, true);
          this.browserStorage.removeItem(this.browserStorage.generateCacheKey(TemporaryCacheKeys.URL_HASH));
          if (cachedHash) {
            response = getDeserializedResponse(cachedHash);
            if (response) {
              this.logger.verbose("Hash does not contain known properties, returning cached hash");
              return [response, cachedHash];
            }
          }
          return [null, ""];
        }
        /**
         * Checks if hash exists and handles in window.
         * @param hash
         * @param state
         */
        async handleResponse(serverParams, request, codeVerifier, serverTelemetryManager) {
          const state2 = serverParams.state;
          if (!state2) {
            throw createBrowserAuthError(noStateInHash);
          }
          if (serverParams.ear_jwe) {
            const discoveredAuthority = await invokeAsync(this.getDiscoveredAuthority.bind(this), PerformanceEvents.StandardInteractionClientGetDiscoveredAuthority, this.logger, this.performanceClient, request.correlationId)({
              requestAuthority: request.authority,
              requestAzureCloudOptions: request.azureCloudOptions,
              requestExtraQueryParameters: request.extraQueryParameters,
              account: request.account
            });
            return invokeAsync(handleResponseEAR, PerformanceEvents.HandleResponseEar, this.logger, this.performanceClient, request.correlationId)(request, serverParams, ApiId.acquireTokenRedirect, this.config, discoveredAuthority, this.browserStorage, this.nativeStorage, this.eventHandler, this.logger, this.performanceClient, this.platformAuthProvider);
          }
          const authClient = await invokeAsync(this.createAuthCodeClient.bind(this), PerformanceEvents.StandardInteractionClientCreateAuthCodeClient, this.logger, this.performanceClient, this.correlationId)({ serverTelemetryManager, requestAuthority: request.authority });
          return invokeAsync(handleResponseCode, PerformanceEvents.HandleResponseCode, this.logger, this.performanceClient, request.correlationId)(request, serverParams, codeVerifier, ApiId.acquireTokenRedirect, this.config, authClient, this.browserStorage, this.nativeStorage, this.eventHandler, this.logger, this.performanceClient, this.platformAuthProvider);
        }
        /**
         * Redirects window to given URL.
         * @param urlNavigate
         * @param onRedirectNavigateRequest - onRedirectNavigate callback provided on the request
         */
        async initiateAuthRequest(requestUrl, onRedirectNavigateRequest) {
          this.logger.verbose("RedirectHandler.initiateAuthRequest called");
          if (requestUrl) {
            this.logger.infoPii(`RedirectHandler.initiateAuthRequest: Navigate to: ${requestUrl}`);
            const navigationOptions = {
              apiId: ApiId.acquireTokenRedirect,
              timeout: this.config.system.redirectNavigationTimeout,
              noHistory: false
            };
            const onRedirectNavigate = onRedirectNavigateRequest || this.config.auth.onRedirectNavigate;
            if (typeof onRedirectNavigate === "function") {
              this.logger.verbose("RedirectHandler.initiateAuthRequest: Invoking onRedirectNavigate callback");
              const navigate2 = onRedirectNavigate(requestUrl);
              if (navigate2 !== false) {
                this.logger.verbose("RedirectHandler.initiateAuthRequest: onRedirectNavigate did not return false, navigating");
                await this.navigationClient.navigateExternal(requestUrl, navigationOptions);
                return;
              } else {
                this.logger.verbose("RedirectHandler.initiateAuthRequest: onRedirectNavigate returned false, stopping navigation");
                return;
              }
            } else {
              this.logger.verbose("RedirectHandler.initiateAuthRequest: Navigating window to navigate url");
              await this.navigationClient.navigateExternal(requestUrl, navigationOptions);
              return;
            }
          } else {
            this.logger.info("RedirectHandler.initiateAuthRequest: Navigate url is empty");
            throw createBrowserAuthError(emptyNavigateUri);
          }
        }
        /**
         * Use to log out the current user, and redirect the user to the postLogoutRedirectUri.
         * Default behaviour is to redirect the user to `window.location.href`.
         * @param logoutRequest
         */
        async logout(logoutRequest) {
          this.logger.verbose("logoutRedirect called");
          const validLogoutRequest = this.initializeLogoutRequest(logoutRequest);
          const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.logout);
          try {
            this.eventHandler.emitEvent(EventType.LOGOUT_START, exports.InteractionType.Redirect, logoutRequest);
            await this.clearCacheOnLogout(this.correlationId, validLogoutRequest.account);
            const navigationOptions = {
              apiId: ApiId.logout,
              timeout: this.config.system.redirectNavigationTimeout,
              noHistory: false
            };
            const authClient = await invokeAsync(this.createAuthCodeClient.bind(this), PerformanceEvents.StandardInteractionClientCreateAuthCodeClient, this.logger, this.performanceClient, this.correlationId)({
              serverTelemetryManager,
              requestAuthority: logoutRequest && logoutRequest.authority,
              requestExtraQueryParameters: logoutRequest?.extraQueryParameters,
              account: logoutRequest && logoutRequest.account || void 0
            });
            if (authClient.authority.protocolMode === ProtocolMode.OIDC) {
              try {
                authClient.authority.endSessionEndpoint;
              } catch {
                if (validLogoutRequest.account?.homeAccountId) {
                  this.eventHandler.emitEvent(EventType.LOGOUT_SUCCESS, exports.InteractionType.Redirect, validLogoutRequest);
                  return;
                }
              }
            }
            const logoutUri = authClient.getLogoutUri(validLogoutRequest);
            this.eventHandler.emitEvent(EventType.LOGOUT_SUCCESS, exports.InteractionType.Redirect, validLogoutRequest);
            if (logoutRequest && typeof logoutRequest.onRedirectNavigate === "function") {
              const navigate2 = logoutRequest.onRedirectNavigate(logoutUri);
              if (navigate2 !== false) {
                this.logger.verbose("Logout onRedirectNavigate did not return false, navigating");
                if (!this.browserStorage.getInteractionInProgress()) {
                  this.browserStorage.setInteractionInProgress(true, INTERACTION_TYPE.SIGNOUT);
                }
                await this.navigationClient.navigateExternal(logoutUri, navigationOptions);
                return;
              } else {
                this.browserStorage.setInteractionInProgress(false);
                this.logger.verbose("Logout onRedirectNavigate returned false, stopping navigation");
              }
            } else {
              if (!this.browserStorage.getInteractionInProgress()) {
                this.browserStorage.setInteractionInProgress(true, INTERACTION_TYPE.SIGNOUT);
              }
              await this.navigationClient.navigateExternal(logoutUri, navigationOptions);
              return;
            }
          } catch (e) {
            if (e instanceof AuthError) {
              e.setCorrelationId(this.correlationId);
              serverTelemetryManager.cacheFailedRequest(e);
            }
            this.eventHandler.emitEvent(EventType.LOGOUT_FAILURE, exports.InteractionType.Redirect, null, e);
            this.eventHandler.emitEvent(EventType.LOGOUT_END, exports.InteractionType.Redirect);
            throw e;
          }
          this.eventHandler.emitEvent(EventType.LOGOUT_END, exports.InteractionType.Redirect);
        }
        /**
         * Use to get the redirectStartPage either from request or use current window
         * @param requestStartPage
         */
        getRedirectStartPage(requestStartPage) {
          const redirectStartPage = requestStartPage || window.location.href;
          return UrlString.getAbsoluteUrl(redirectStartPage, getCurrentUri());
        }
      };
      async function initiateCodeRequest(requestUrl, performanceClient, logger, correlationId, navigateFrameWait) {
        performanceClient.addQueueMeasurement(PerformanceEvents.SilentHandlerInitiateAuthRequest, correlationId);
        if (!requestUrl) {
          logger.info("Navigate url is empty");
          throw createBrowserAuthError(emptyNavigateUri);
        }
        if (navigateFrameWait) {
          return invokeAsync(loadFrame, PerformanceEvents.SilentHandlerLoadFrame, logger, performanceClient, correlationId)(requestUrl, navigateFrameWait, performanceClient, correlationId);
        }
        return invoke(loadFrameSync, PerformanceEvents.SilentHandlerLoadFrameSync, logger, performanceClient, correlationId)(requestUrl);
      }
      async function initiateCodeFlowWithPost(config2, authority, request, logger, performanceClient) {
        const frame = createHiddenIframe();
        if (!frame.contentDocument) {
          throw "No document associated with iframe!";
        }
        const form = await getCodeForm(frame.contentDocument, config2, authority, request, logger, performanceClient);
        form.submit();
        return frame;
      }
      async function initiateEarRequest(config2, authority, request, logger, performanceClient) {
        const frame = createHiddenIframe();
        if (!frame.contentDocument) {
          throw "No document associated with iframe!";
        }
        const form = await getEARForm(frame.contentDocument, config2, authority, request, logger, performanceClient);
        form.submit();
        return frame;
      }
      async function monitorIframeForHash(iframe, timeout, pollIntervalMilliseconds, performanceClient, logger, correlationId, responseType) {
        performanceClient.addQueueMeasurement(PerformanceEvents.SilentHandlerMonitorIframeForHash, correlationId);
        return new Promise((resolve, reject) => {
          if (timeout < DEFAULT_IFRAME_TIMEOUT_MS) {
            logger.warning(`system.loadFrameTimeout or system.iframeHashTimeout set to lower (${timeout}ms) than the default (${DEFAULT_IFRAME_TIMEOUT_MS}ms). This may result in timeouts.`);
          }
          const timeoutId = window.setTimeout(() => {
            window.clearInterval(intervalId);
            reject(createBrowserAuthError(monitorWindowTimeout));
          }, timeout);
          const intervalId = window.setInterval(() => {
            let href = "";
            const contentWindow = iframe.contentWindow;
            try {
              href = contentWindow ? contentWindow.location.href : "";
            } catch (e) {
            }
            if (!href || href === "about:blank") {
              return;
            }
            let responseString = "";
            if (contentWindow) {
              if (responseType === ServerResponseType.QUERY) {
                responseString = contentWindow.location.search;
              } else {
                responseString = contentWindow.location.hash;
              }
            }
            window.clearTimeout(timeoutId);
            window.clearInterval(intervalId);
            resolve(responseString);
          }, pollIntervalMilliseconds);
        }).finally(() => {
          invoke(removeHiddenIframe, PerformanceEvents.RemoveHiddenIframe, logger, performanceClient, correlationId)(iframe);
        });
      }
      function loadFrame(urlNavigate, navigateFrameWait, performanceClient, correlationId) {
        performanceClient.addQueueMeasurement(PerformanceEvents.SilentHandlerLoadFrame, correlationId);
        return new Promise((resolve, reject) => {
          const frameHandle = createHiddenIframe();
          window.setTimeout(() => {
            if (!frameHandle) {
              reject("Unable to load iframe");
              return;
            }
            frameHandle.src = urlNavigate;
            resolve(frameHandle);
          }, navigateFrameWait);
        });
      }
      function loadFrameSync(urlNavigate) {
        const frameHandle = createHiddenIframe();
        frameHandle.src = urlNavigate;
        return frameHandle;
      }
      function createHiddenIframe() {
        const authFrame = document.createElement("iframe");
        authFrame.className = "msalSilentIframe";
        authFrame.style.visibility = "hidden";
        authFrame.style.position = "absolute";
        authFrame.style.width = authFrame.style.height = "0";
        authFrame.style.border = "0";
        authFrame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
        document.body.appendChild(authFrame);
        return authFrame;
      }
      function removeHiddenIframe(iframe) {
        if (document.body === iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }
      var SilentIframeClient = class extends StandardInteractionClient {
        constructor(config2, storageImpl, browserCrypto, logger, eventHandler, navigationClient, apiId, performanceClient, nativeStorageImpl, platformAuthProvider, correlationId) {
          super(config2, storageImpl, browserCrypto, logger, eventHandler, navigationClient, performanceClient, platformAuthProvider, correlationId);
          this.apiId = apiId;
          this.nativeStorage = nativeStorageImpl;
        }
        /**
         * Acquires a token silently by opening a hidden iframe to the /authorize endpoint with prompt=none or prompt=no_session
         * @param request
         */
        async acquireToken(request) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.SilentIframeClientAcquireToken, request.correlationId);
          if (!request.loginHint && !request.sid && (!request.account || !request.account.username)) {
            this.logger.warning("No user hint provided. The authorization server may need more information to complete this request.");
          }
          const inputRequest = { ...request };
          if (inputRequest.prompt) {
            if (inputRequest.prompt !== PromptValue.NONE && inputRequest.prompt !== PromptValue.NO_SESSION) {
              this.logger.warning(`SilentIframeClient. Replacing invalid prompt ${inputRequest.prompt} with ${PromptValue.NONE}`);
              inputRequest.prompt = PromptValue.NONE;
            }
          } else {
            inputRequest.prompt = PromptValue.NONE;
          }
          const silentRequest = await invokeAsync(this.initializeAuthorizationRequest.bind(this), PerformanceEvents.StandardInteractionClientInitializeAuthorizationRequest, this.logger, this.performanceClient, request.correlationId)(inputRequest, exports.InteractionType.Silent);
          silentRequest.platformBroker = isPlatformAuthAllowed(this.config, this.logger, this.platformAuthProvider, silentRequest.authenticationScheme);
          preconnect(silentRequest.authority);
          if (this.config.auth.protocolMode === ProtocolMode.EAR) {
            return this.executeEarFlow(silentRequest);
          } else {
            return this.executeCodeFlow(silentRequest);
          }
        }
        /**
         * Executes auth code + PKCE flow
         * @param request
         * @returns
         */
        async executeCodeFlow(request) {
          let authClient;
          const serverTelemetryManager = this.initializeServerTelemetryManager(this.apiId);
          try {
            authClient = await invokeAsync(this.createAuthCodeClient.bind(this), PerformanceEvents.StandardInteractionClientCreateAuthCodeClient, this.logger, this.performanceClient, request.correlationId)({
              serverTelemetryManager,
              requestAuthority: request.authority,
              requestAzureCloudOptions: request.azureCloudOptions,
              requestExtraQueryParameters: request.extraQueryParameters,
              account: request.account
            });
            return await invokeAsync(this.silentTokenHelper.bind(this), PerformanceEvents.SilentIframeClientTokenHelper, this.logger, this.performanceClient, request.correlationId)(authClient, request);
          } catch (e) {
            if (e instanceof AuthError) {
              e.setCorrelationId(this.correlationId);
              serverTelemetryManager.cacheFailedRequest(e);
            }
            if (!authClient || !(e instanceof AuthError) || e.errorCode !== BrowserConstants.INVALID_GRANT_ERROR) {
              throw e;
            }
            this.performanceClient.addFields({
              retryError: e.errorCode
            }, this.correlationId);
            return await invokeAsync(this.silentTokenHelper.bind(this), PerformanceEvents.SilentIframeClientTokenHelper, this.logger, this.performanceClient, this.correlationId)(authClient, request);
          }
        }
        /**
         * Executes EAR flow
         * @param request
         */
        async executeEarFlow(request) {
          const correlationId = request.correlationId;
          const discoveredAuthority = await invokeAsync(this.getDiscoveredAuthority.bind(this), PerformanceEvents.StandardInteractionClientGetDiscoveredAuthority, this.logger, this.performanceClient, correlationId)({
            requestAuthority: request.authority,
            requestAzureCloudOptions: request.azureCloudOptions,
            requestExtraQueryParameters: request.extraQueryParameters,
            account: request.account
          });
          const earJwk = await invokeAsync(generateEarKey, PerformanceEvents.GenerateEarKey, this.logger, this.performanceClient, correlationId)();
          const silentRequest = {
            ...request,
            earJwk
          };
          const msalFrame = await invokeAsync(initiateEarRequest, PerformanceEvents.SilentHandlerInitiateAuthRequest, this.logger, this.performanceClient, correlationId)(this.config, discoveredAuthority, silentRequest, this.logger, this.performanceClient);
          const responseType = this.config.auth.OIDCOptions.serverResponseType;
          const responseString = await invokeAsync(monitorIframeForHash, PerformanceEvents.SilentHandlerMonitorIframeForHash, this.logger, this.performanceClient, correlationId)(msalFrame, this.config.system.iframeHashTimeout, this.config.system.pollIntervalMilliseconds, this.performanceClient, this.logger, correlationId, responseType);
          const serverParams = invoke(deserializeResponse, PerformanceEvents.DeserializeResponse, this.logger, this.performanceClient, correlationId)(responseString, responseType, this.logger);
          return invokeAsync(handleResponseEAR, PerformanceEvents.HandleResponseEar, this.logger, this.performanceClient, correlationId)(silentRequest, serverParams, this.apiId, this.config, discoveredAuthority, this.browserStorage, this.nativeStorage, this.eventHandler, this.logger, this.performanceClient, this.platformAuthProvider);
        }
        /**
         * Currently Unsupported
         */
        logout() {
          return Promise.reject(createBrowserAuthError(silentLogoutUnsupported));
        }
        /**
         * Helper which acquires an authorization code silently using a hidden iframe from given url
         * using the scopes requested as part of the id, and exchanges the code for a set of OAuth tokens.
         * @param navigateUrl
         * @param userRequestScopes
         */
        async silentTokenHelper(authClient, request) {
          const correlationId = request.correlationId;
          this.performanceClient.addQueueMeasurement(PerformanceEvents.SilentIframeClientTokenHelper, correlationId);
          const pkceCodes = await invokeAsync(generatePkceCodes, PerformanceEvents.GeneratePkceCodes, this.logger, this.performanceClient, correlationId)(this.performanceClient, this.logger, correlationId);
          const silentRequest = {
            ...request,
            codeChallenge: pkceCodes.challenge
          };
          let msalFrame;
          if (request.httpMethod === HttpMethod.POST) {
            msalFrame = await invokeAsync(initiateCodeFlowWithPost, PerformanceEvents.SilentHandlerInitiateAuthRequest, this.logger, this.performanceClient, correlationId)(this.config, authClient.authority, silentRequest, this.logger, this.performanceClient);
          } else {
            const navigateUrl = await invokeAsync(getAuthCodeRequestUrl, PerformanceEvents.GetAuthCodeUrl, this.logger, this.performanceClient, correlationId)(this.config, authClient.authority, silentRequest, this.logger, this.performanceClient);
            msalFrame = await invokeAsync(initiateCodeRequest, PerformanceEvents.SilentHandlerInitiateAuthRequest, this.logger, this.performanceClient, correlationId)(navigateUrl, this.performanceClient, this.logger, correlationId, this.config.system.navigateFrameWait);
          }
          const responseType = this.config.auth.OIDCOptions.serverResponseType;
          const responseString = await invokeAsync(monitorIframeForHash, PerformanceEvents.SilentHandlerMonitorIframeForHash, this.logger, this.performanceClient, correlationId)(msalFrame, this.config.system.iframeHashTimeout, this.config.system.pollIntervalMilliseconds, this.performanceClient, this.logger, correlationId, responseType);
          const serverParams = invoke(deserializeResponse, PerformanceEvents.DeserializeResponse, this.logger, this.performanceClient, correlationId)(responseString, responseType, this.logger);
          return invokeAsync(handleResponseCode, PerformanceEvents.HandleResponseCode, this.logger, this.performanceClient, correlationId)(request, serverParams, pkceCodes.verifier, this.apiId, this.config, authClient, this.browserStorage, this.nativeStorage, this.eventHandler, this.logger, this.performanceClient, this.platformAuthProvider);
        }
      };
      var SilentRefreshClient = class extends StandardInteractionClient {
        /**
         * Exchanges the refresh token for new tokens
         * @param request
         */
        async acquireToken(request) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.SilentRefreshClientAcquireToken, request.correlationId);
          const baseRequest = await invokeAsync(initializeBaseRequest, PerformanceEvents.InitializeBaseRequest, this.logger, this.performanceClient, request.correlationId)(request, this.config, this.performanceClient, this.logger);
          const silentRequest = {
            ...request,
            ...baseRequest
          };
          if (request.redirectUri) {
            silentRequest.redirectUri = this.getRedirectUri(request.redirectUri);
          }
          const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenSilent_silentFlow);
          const refreshTokenClient = await this.createRefreshTokenClient({
            serverTelemetryManager,
            authorityUrl: silentRequest.authority,
            azureCloudOptions: silentRequest.azureCloudOptions,
            account: silentRequest.account
          });
          return invokeAsync(refreshTokenClient.acquireTokenByRefreshToken.bind(refreshTokenClient), PerformanceEvents.RefreshTokenClientAcquireTokenByRefreshToken, this.logger, this.performanceClient, request.correlationId)(silentRequest).catch((e) => {
            e.setCorrelationId(this.correlationId);
            serverTelemetryManager.cacheFailedRequest(e);
            throw e;
          });
        }
        /**
         * Currently Unsupported
         */
        logout() {
          return Promise.reject(createBrowserAuthError(silentLogoutUnsupported));
        }
        /**
         * Creates a Refresh Client with the given authority, or the default authority.
         * @param params {
         *         serverTelemetryManager: ServerTelemetryManager;
         *         authorityUrl?: string;
         *         azureCloudOptions?: AzureCloudOptions;
         *         extraQueryParams?: StringDict;
         *         account?: AccountInfo;
         *        }
         */
        async createRefreshTokenClient(params) {
          const clientConfig = await invokeAsync(this.getClientConfiguration.bind(this), PerformanceEvents.StandardInteractionClientGetClientConfiguration, this.logger, this.performanceClient, this.correlationId)({
            serverTelemetryManager: params.serverTelemetryManager,
            requestAuthority: params.authorityUrl,
            requestAzureCloudOptions: params.azureCloudOptions,
            requestExtraQueryParameters: params.extraQueryParameters,
            account: params.account
          });
          return new RefreshTokenClient(clientConfig, this.performanceClient);
        }
      };
      var TokenCache = class {
        constructor(configuration, storage, logger, cryptoObj) {
          this.isBrowserEnvironment = typeof window !== "undefined";
          this.config = configuration;
          this.storage = storage;
          this.logger = logger;
          this.cryptoObj = cryptoObj;
        }
        // Move getAllAccounts here and cache utility APIs
        /**
         * API to load tokens to msal-browser cache.
         * @param request
         * @param response
         * @param options
         * @returns `AuthenticationResult` for the response that was loaded.
         */
        async loadExternalTokens(request, response, options) {
          if (!this.isBrowserEnvironment) {
            throw createBrowserAuthError(nonBrowserEnvironment);
          }
          const correlationId = request.correlationId || createNewGuid();
          const idTokenClaims = response.id_token ? extractTokenClaims(response.id_token, base64Decode) : void 0;
          const authorityOptions = {
            protocolMode: this.config.auth.protocolMode,
            knownAuthorities: this.config.auth.knownAuthorities,
            cloudDiscoveryMetadata: this.config.auth.cloudDiscoveryMetadata,
            authorityMetadata: this.config.auth.authorityMetadata,
            skipAuthorityMetadataCache: this.config.auth.skipAuthorityMetadataCache
          };
          const authority = request.authority ? new Authority(Authority.generateAuthority(request.authority, request.azureCloudOptions), this.config.system.networkClient, this.storage, authorityOptions, this.logger, request.correlationId || createNewGuid()) : void 0;
          const cacheRecordAccount = await this.loadAccount(request, options.clientInfo || response.client_info || "", correlationId, idTokenClaims, authority);
          const idToken = await this.loadIdToken(response, cacheRecordAccount.homeAccountId, cacheRecordAccount.environment, cacheRecordAccount.realm, correlationId);
          const accessToken = await this.loadAccessToken(request, response, cacheRecordAccount.homeAccountId, cacheRecordAccount.environment, cacheRecordAccount.realm, options, correlationId);
          const refreshToken = await this.loadRefreshToken(response, cacheRecordAccount.homeAccountId, cacheRecordAccount.environment, correlationId);
          return this.generateAuthenticationResult(request, {
            account: cacheRecordAccount,
            idToken,
            accessToken,
            refreshToken
          }, idTokenClaims, authority);
        }
        /**
         * Helper function to load account to msal-browser cache
         * @param idToken
         * @param environment
         * @param clientInfo
         * @param authorityType
         * @param requestHomeAccountId
         * @returns `AccountEntity`
         */
        async loadAccount(request, clientInfo, correlationId, idTokenClaims, authority) {
          this.logger.verbose("TokenCache - loading account");
          if (request.account) {
            const accountEntity = AccountEntity.createFromAccountInfo(request.account);
            await this.storage.setAccount(accountEntity, correlationId);
            return accountEntity;
          } else if (!authority || !clientInfo && !idTokenClaims) {
            this.logger.error("TokenCache - if an account is not provided on the request, authority and either clientInfo or idToken must be provided instead.");
            throw createBrowserAuthError(unableToLoadToken);
          }
          const homeAccountId = AccountEntity.generateHomeAccountId(clientInfo, authority.authorityType, this.logger, this.cryptoObj, idTokenClaims);
          const claimsTenantId = idTokenClaims?.tid;
          const cachedAccount = buildAccountToCache(
            this.storage,
            authority,
            homeAccountId,
            base64Decode,
            correlationId,
            idTokenClaims,
            clientInfo,
            authority.hostnameAndPort,
            claimsTenantId,
            void 0,
            // authCodePayload
            void 0,
            // nativeAccountId
            this.logger
          );
          await this.storage.setAccount(cachedAccount, correlationId);
          return cachedAccount;
        }
        /**
         * Helper function to load id tokens to msal-browser cache
         * @param idToken
         * @param homeAccountId
         * @param environment
         * @param tenantId
         * @returns `IdTokenEntity`
         */
        async loadIdToken(response, homeAccountId, environment, tenantId, correlationId) {
          if (!response.id_token) {
            this.logger.verbose("TokenCache - no id token found in response");
            return null;
          }
          this.logger.verbose("TokenCache - loading id token");
          const idTokenEntity = createIdTokenEntity(homeAccountId, environment, response.id_token, this.config.auth.clientId, tenantId);
          await this.storage.setIdTokenCredential(idTokenEntity, correlationId);
          return idTokenEntity;
        }
        /**
         * Helper function to load access tokens to msal-browser cache
         * @param request
         * @param response
         * @param homeAccountId
         * @param environment
         * @param tenantId
         * @returns `AccessTokenEntity`
         */
        async loadAccessToken(request, response, homeAccountId, environment, tenantId, options, correlationId) {
          if (!response.access_token) {
            this.logger.verbose("TokenCache - no access token found in response");
            return null;
          } else if (!response.expires_in) {
            this.logger.error("TokenCache - no expiration set on the access token. Cannot add it to the cache.");
            return null;
          } else if (!response.scope && (!request.scopes || !request.scopes.length)) {
            this.logger.error("TokenCache - scopes not specified in the request or response. Cannot add token to the cache.");
            return null;
          }
          this.logger.verbose("TokenCache - loading access token");
          const scopes = response.scope ? ScopeSet.fromString(response.scope) : new ScopeSet(request.scopes);
          const expiresOn = options.expiresOn || response.expires_in + nowSeconds();
          const extendedExpiresOn = options.extendedExpiresOn || (response.ext_expires_in || response.expires_in) + nowSeconds();
          const accessTokenEntity = createAccessTokenEntity(homeAccountId, environment, response.access_token, this.config.auth.clientId, tenantId, scopes.printScopes(), expiresOn, extendedExpiresOn, base64Decode);
          await this.storage.setAccessTokenCredential(accessTokenEntity, correlationId);
          return accessTokenEntity;
        }
        /**
         * Helper function to load refresh tokens to msal-browser cache
         * @param request
         * @param response
         * @param homeAccountId
         * @param environment
         * @returns `RefreshTokenEntity`
         */
        async loadRefreshToken(response, homeAccountId, environment, correlationId) {
          if (!response.refresh_token) {
            this.logger.verbose("TokenCache - no refresh token found in response");
            return null;
          }
          this.logger.verbose("TokenCache - loading refresh token");
          const refreshTokenEntity = createRefreshTokenEntity(
            homeAccountId,
            environment,
            response.refresh_token,
            this.config.auth.clientId,
            response.foci,
            void 0,
            // userAssertionHash
            response.refresh_token_expires_in
          );
          await this.storage.setRefreshTokenCredential(refreshTokenEntity, correlationId);
          return refreshTokenEntity;
        }
        /**
         * Helper function to generate an `AuthenticationResult` for the result.
         * @param request
         * @param idTokenObj
         * @param cacheRecord
         * @param authority
         * @returns `AuthenticationResult`
         */
        generateAuthenticationResult(request, cacheRecord, idTokenClaims, authority) {
          let accessToken = "";
          let responseScopes = [];
          let expiresOn = null;
          let extExpiresOn;
          if (cacheRecord?.accessToken) {
            accessToken = cacheRecord.accessToken.secret;
            responseScopes = ScopeSet.fromString(cacheRecord.accessToken.target).asArray();
            expiresOn = toDateFromSeconds(cacheRecord.accessToken.expiresOn);
            extExpiresOn = toDateFromSeconds(cacheRecord.accessToken.extendedExpiresOn);
          }
          const accountEntity = cacheRecord.account;
          return {
            authority: authority ? authority.canonicalAuthority : "",
            uniqueId: cacheRecord.account.localAccountId,
            tenantId: cacheRecord.account.realm,
            scopes: responseScopes,
            account: accountEntity.getAccountInfo(),
            idToken: cacheRecord.idToken?.secret || "",
            idTokenClaims: idTokenClaims || {},
            accessToken,
            fromCache: true,
            expiresOn,
            correlationId: request.correlationId || "",
            requestId: "",
            extExpiresOn,
            familyId: cacheRecord.refreshToken?.familyId || "",
            tokenType: cacheRecord?.accessToken?.tokenType || "",
            state: request.state || "",
            cloudGraphHostName: accountEntity.cloudGraphHostName || "",
            msGraphHost: accountEntity.msGraphHost || "",
            fromNativeBroker: false
          };
        }
      };
      var HybridSpaAuthorizationCodeClient = class extends AuthorizationCodeClient {
        constructor(config2) {
          super(config2);
          this.includeRedirectUri = false;
        }
      };
      var SilentAuthCodeClient = class extends StandardInteractionClient {
        constructor(config2, storageImpl, browserCrypto, logger, eventHandler, navigationClient, apiId, performanceClient, platformAuthProvider, correlationId) {
          super(config2, storageImpl, browserCrypto, logger, eventHandler, navigationClient, performanceClient, platformAuthProvider, correlationId);
          this.apiId = apiId;
        }
        /**
         * Acquires a token silently by redeeming an authorization code against the /token endpoint
         * @param request
         */
        async acquireToken(request) {
          if (!request.code) {
            throw createBrowserAuthError(authCodeRequired);
          }
          const silentRequest = await invokeAsync(this.initializeAuthorizationRequest.bind(this), PerformanceEvents.StandardInteractionClientInitializeAuthorizationRequest, this.logger, this.performanceClient, request.correlationId)(request, exports.InteractionType.Silent);
          const serverTelemetryManager = this.initializeServerTelemetryManager(this.apiId);
          try {
            const authCodeRequest = {
              ...silentRequest,
              code: request.code
            };
            const clientConfig = await invokeAsync(this.getClientConfiguration.bind(this), PerformanceEvents.StandardInteractionClientGetClientConfiguration, this.logger, this.performanceClient, request.correlationId)({
              serverTelemetryManager,
              requestAuthority: silentRequest.authority,
              requestAzureCloudOptions: silentRequest.azureCloudOptions,
              requestExtraQueryParameters: silentRequest.extraQueryParameters,
              account: silentRequest.account
            });
            const authClient = new HybridSpaAuthorizationCodeClient(clientConfig);
            this.logger.verbose("Auth code client created");
            const interactionHandler = new InteractionHandler(authClient, this.browserStorage, authCodeRequest, this.logger, this.performanceClient);
            return await invokeAsync(interactionHandler.handleCodeResponseFromServer.bind(interactionHandler), PerformanceEvents.HandleCodeResponseFromServer, this.logger, this.performanceClient, request.correlationId)({
              code: request.code,
              msgraph_host: request.msGraphHost,
              cloud_graph_host_name: request.cloudGraphHostName,
              cloud_instance_host_name: request.cloudInstanceHostName
            }, silentRequest, false);
          } catch (e) {
            if (e instanceof AuthError) {
              e.setCorrelationId(this.correlationId);
              serverTelemetryManager.cacheFailedRequest(e);
            }
            throw e;
          }
        }
        /**
         * Currently Unsupported
         */
        logout() {
          return Promise.reject(createBrowserAuthError(silentLogoutUnsupported));
        }
      };
      function collectInstanceStats(currentClientId, performanceEvent, logger) {
        const frameInstances = (
          // @ts-ignore
          window.msal?.clientIds || []
        );
        const msalInstanceCount = frameInstances.length;
        const sameClientIdInstanceCount = frameInstances.filter((i) => i === currentClientId).length;
        if (sameClientIdInstanceCount > 1) {
          logger.warning("There is already an instance of MSAL.js in the window with the same client id.");
        }
        performanceEvent.add({
          msalInstanceCount,
          sameClientIdInstanceCount
        });
      }
      function preflightCheck(initialized, performanceEvent, account2) {
        try {
          preflightCheck$1(initialized);
        } catch (e) {
          performanceEvent.end({ success: false }, e, account2);
          throw e;
        }
      }
      var StandardController = class _StandardController {
        /**
         * @constructor
         * Constructor for the PublicClientApplication used to instantiate the PublicClientApplication object
         *
         * Important attributes in the Configuration object for auth are:
         * - clientID: the application ID of your application. You can obtain one by registering your application with our Application registration portal : https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredAppsPreview
         * - authority: the authority URL for your application.
         * - redirect_uri: the uri of your application registered in the portal.
         *
         * In Azure AD, authority is a URL indicating the Azure active directory that MSAL uses to obtain tokens.
         * It is of the form https://login.microsoftonline.com/{Enter_the_Tenant_Info_Here}
         * If your application supports Accounts in one organizational directory, replace "Enter_the_Tenant_Info_Here" value with the Tenant Id or Tenant name (for example, contoso.microsoft.com).
         * If your application supports Accounts in any organizational directory, replace "Enter_the_Tenant_Info_Here" value with organizations.
         * If your application supports Accounts in any organizational directory and personal Microsoft accounts, replace "Enter_the_Tenant_Info_Here" value with common.
         * To restrict support to Personal Microsoft accounts only, replace "Enter_the_Tenant_Info_Here" value with consumers.
         *
         * In Azure B2C, authority is of the form https://{instance}/tfp/{tenant}/{policyName}/
         * Full B2C functionality will be available in this library in future versions.
         *
         * @param configuration Object for the MSAL PublicClientApplication instance
         */
        constructor(operatingContext) {
          this.operatingContext = operatingContext;
          this.isBrowserEnvironment = this.operatingContext.isBrowserEnvironment();
          this.config = operatingContext.getConfig();
          this.initialized = false;
          this.logger = this.operatingContext.getLogger();
          this.networkClient = this.config.system.networkClient;
          this.navigationClient = this.config.system.navigationClient;
          this.redirectResponse = /* @__PURE__ */ new Map();
          this.hybridAuthCodeResponses = /* @__PURE__ */ new Map();
          this.performanceClient = this.config.telemetry.client;
          this.browserCrypto = this.isBrowserEnvironment ? new CryptoOps(this.logger, this.performanceClient) : DEFAULT_CRYPTO_IMPLEMENTATION;
          this.eventHandler = new EventHandler(this.logger);
          this.browserStorage = this.isBrowserEnvironment ? new BrowserCacheManager(this.config.auth.clientId, this.config.cache, this.browserCrypto, this.logger, this.performanceClient, this.eventHandler, buildStaticAuthorityOptions(this.config.auth)) : DEFAULT_BROWSER_CACHE_MANAGER(this.config.auth.clientId, this.logger, this.performanceClient, this.eventHandler);
          const nativeCacheOptions = {
            cacheLocation: BrowserCacheLocation.MemoryStorage,
            cacheRetentionDays: 5,
            temporaryCacheLocation: BrowserCacheLocation.MemoryStorage,
            storeAuthStateInCookie: false,
            secureCookies: false,
            cacheMigrationEnabled: false,
            claimsBasedCachingEnabled: false
          };
          this.nativeInternalStorage = new BrowserCacheManager(this.config.auth.clientId, nativeCacheOptions, this.browserCrypto, this.logger, this.performanceClient, this.eventHandler);
          this.tokenCache = new TokenCache(this.config, this.browserStorage, this.logger, this.browserCrypto);
          this.activeSilentTokenRequests = /* @__PURE__ */ new Map();
          this.trackPageVisibility = this.trackPageVisibility.bind(this);
          this.trackPageVisibilityWithMeasurement = this.trackPageVisibilityWithMeasurement.bind(this);
        }
        static async createController(operatingContext, request) {
          const controller = new _StandardController(operatingContext);
          await controller.initialize(request);
          return controller;
        }
        trackPageVisibility(correlationId) {
          if (!correlationId) {
            return;
          }
          this.logger.info("Perf: Visibility change detected");
          this.performanceClient.incrementFields({ visibilityChangeCount: 1 }, correlationId);
        }
        /**
         * Initializer function to perform async startup tasks such as connecting to WAM extension
         * @param request {?InitializeApplicationRequest} correlation id
         */
        async initialize(request, isBroker) {
          this.logger.trace("initialize called");
          if (this.initialized) {
            this.logger.info("initialize has already been called, exiting early.");
            return;
          }
          if (!this.isBrowserEnvironment) {
            this.logger.info("in non-browser environment, exiting early.");
            this.initialized = true;
            this.eventHandler.emitEvent(EventType.INITIALIZE_END);
            return;
          }
          const initCorrelationId = request?.correlationId || this.getRequestCorrelationId();
          const allowPlatformBroker = this.config.system.allowPlatformBroker;
          const initMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.InitializeClientApplication, initCorrelationId);
          this.eventHandler.emitEvent(EventType.INITIALIZE_START);
          if (!isBroker) {
            try {
              this.logMultipleInstances(initMeasurement);
            } catch {
            }
          }
          await invokeAsync(this.browserStorage.initialize.bind(this.browserStorage), PerformanceEvents.InitializeCache, this.logger, this.performanceClient, initCorrelationId)(initCorrelationId);
          if (allowPlatformBroker) {
            try {
              this.platformAuthProvider = await getPlatformAuthProvider(this.logger, this.performanceClient, initCorrelationId, this.config.system.nativeBrokerHandshakeTimeout);
            } catch (e) {
              this.logger.verbose(e);
            }
          }
          if (!this.config.cache.claimsBasedCachingEnabled) {
            this.logger.verbose("Claims-based caching is disabled. Clearing the previous cache with claims");
            invoke(this.browserStorage.clearTokensAndKeysWithClaims.bind(this.browserStorage), PerformanceEvents.ClearTokensAndKeysWithClaims, this.logger, this.performanceClient, initCorrelationId)(initCorrelationId);
          }
          this.config.system.asyncPopups && await this.preGeneratePkceCodes(initCorrelationId);
          this.initialized = true;
          this.eventHandler.emitEvent(EventType.INITIALIZE_END);
          initMeasurement.end({
            allowPlatformBroker,
            success: true
          });
        }
        // #region Redirect Flow
        /**
         * Event handler function which allows users to fire events after the PublicClientApplication object
         * has loaded during redirect flows. This should be invoked on all page loads involved in redirect
         * auth flows.
         * @param hash Hash to process. Defaults to the current value of window.location.hash. Only needs to be provided explicitly if the response to be handled is not contained in the current value.
         * @returns Token response or null. If the return value is null, then no auth redirect was detected.
         */
        async handleRedirectPromise(hash) {
          this.logger.verbose("handleRedirectPromise called");
          blockAPICallsBeforeInitialize(this.initialized);
          if (this.isBrowserEnvironment) {
            const redirectResponseKey = hash || "";
            let response = this.redirectResponse.get(redirectResponseKey);
            if (typeof response === "undefined") {
              response = this.handleRedirectPromiseInternal(hash);
              this.redirectResponse.set(redirectResponseKey, response);
              this.logger.verbose("handleRedirectPromise has been called for the first time, storing the promise");
            } else {
              this.logger.verbose("handleRedirectPromise has been called previously, returning the result from the first call");
            }
            return response;
          }
          this.logger.verbose("handleRedirectPromise returns null, not browser environment");
          return null;
        }
        /**
         * The internal details of handleRedirectPromise. This is separated out to a helper to allow handleRedirectPromise to memoize requests
         * @param hash
         * @returns
         */
        async handleRedirectPromiseInternal(hash) {
          if (!this.browserStorage.isInteractionInProgress(true)) {
            this.logger.info("handleRedirectPromise called but there is no interaction in progress, returning null.");
            return null;
          }
          const interactionType = this.browserStorage.getInteractionInProgress()?.type;
          if (interactionType === INTERACTION_TYPE.SIGNOUT) {
            this.logger.verbose("handleRedirectPromise removing interaction_in_progress flag and returning null after sign-out");
            this.browserStorage.setInteractionInProgress(false);
            return Promise.resolve(null);
          }
          const loggedInAccounts = this.getAllAccounts();
          const platformBrokerRequest = this.browserStorage.getCachedNativeRequest();
          const useNative = platformBrokerRequest && this.platformAuthProvider && !hash;
          let rootMeasurement;
          this.eventHandler.emitEvent(EventType.HANDLE_REDIRECT_START, exports.InteractionType.Redirect);
          let redirectResponse;
          try {
            if (useNative && this.platformAuthProvider) {
              rootMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenRedirect, platformBrokerRequest?.correlationId || "");
              this.logger.trace("handleRedirectPromise - acquiring token from native platform");
              rootMeasurement.add({
                isPlatformBrokerRequest: true
              });
              const nativeClient = new PlatformAuthInteractionClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ApiId.handleRedirectPromise, this.performanceClient, this.platformAuthProvider, platformBrokerRequest.accountId, this.nativeInternalStorage, platformBrokerRequest.correlationId);
              redirectResponse = invokeAsync(nativeClient.handleRedirectPromise.bind(nativeClient), PerformanceEvents.HandleNativeRedirectPromiseMeasurement, this.logger, this.performanceClient, rootMeasurement.event.correlationId)(this.performanceClient, rootMeasurement.event.correlationId);
            } else {
              const [standardRequest, codeVerifier] = this.browserStorage.getCachedRequest();
              const correlationId = standardRequest.correlationId;
              rootMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenRedirect, correlationId);
              this.logger.trace("handleRedirectPromise - acquiring token from web flow");
              const redirectClient = this.createRedirectClient(correlationId);
              redirectResponse = invokeAsync(redirectClient.handleRedirectPromise.bind(redirectClient), PerformanceEvents.HandleRedirectPromiseMeasurement, this.logger, this.performanceClient, rootMeasurement.event.correlationId)(hash, standardRequest, codeVerifier, rootMeasurement);
            }
          } catch (e) {
            this.browserStorage.resetRequestCache();
            throw e;
          }
          return redirectResponse.then((result) => {
            if (result) {
              this.browserStorage.resetRequestCache();
              const isLoggingIn = loggedInAccounts.length < this.getAllAccounts().length;
              if (isLoggingIn) {
                this.eventHandler.emitEvent(EventType.LOGIN_SUCCESS, exports.InteractionType.Redirect, result);
                this.logger.verbose("handleRedirectResponse returned result, login success");
              } else {
                this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, exports.InteractionType.Redirect, result);
                this.logger.verbose("handleRedirectResponse returned result, acquire token success");
              }
              rootMeasurement.end({
                success: true
              }, void 0, result.account);
            } else {
              if (rootMeasurement.event.errorCode) {
                rootMeasurement.end({ success: false }, void 0);
              } else {
                rootMeasurement.discard();
              }
            }
            this.eventHandler.emitEvent(EventType.HANDLE_REDIRECT_END, exports.InteractionType.Redirect);
            return result;
          }).catch((e) => {
            this.browserStorage.resetRequestCache();
            const eventError = e;
            if (loggedInAccounts.length > 0) {
              this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, exports.InteractionType.Redirect, null, eventError);
            } else {
              this.eventHandler.emitEvent(EventType.LOGIN_FAILURE, exports.InteractionType.Redirect, null, eventError);
            }
            this.eventHandler.emitEvent(EventType.HANDLE_REDIRECT_END, exports.InteractionType.Redirect);
            rootMeasurement.end({
              success: false
            }, eventError);
            throw e;
          });
        }
        /**
         * Use when you want to obtain an access_token for your API by redirecting the user's browser window to the authorization endpoint. This function redirects
         * the page, so any code that follows this function will not execute.
         *
         * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
         * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
         *
         * @param request
         */
        async acquireTokenRedirect(request) {
          const correlationId = this.getRequestCorrelationId(request);
          this.logger.verbose("acquireTokenRedirect called", correlationId);
          const atrMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenPreRedirect, correlationId);
          atrMeasurement.add({
            scenarioId: request.scenarioId
          });
          const onRedirectNavigateCb = request.onRedirectNavigate;
          if (onRedirectNavigateCb) {
            request.onRedirectNavigate = (url) => {
              const navigate2 = typeof onRedirectNavigateCb === "function" ? onRedirectNavigateCb(url) : void 0;
              atrMeasurement.add({
                navigateCallbackResult: navigate2 !== false
              });
              atrMeasurement.event = atrMeasurement.end({ success: true }, void 0, request.account) || atrMeasurement.event;
              return navigate2;
            };
          } else {
            const configOnRedirectNavigateCb = this.config.auth.onRedirectNavigate;
            this.config.auth.onRedirectNavigate = (url) => {
              const navigate2 = typeof configOnRedirectNavigateCb === "function" ? configOnRedirectNavigateCb(url) : void 0;
              atrMeasurement.add({
                navigateCallbackResult: navigate2 !== false
              });
              atrMeasurement.event = atrMeasurement.end({ success: true }, void 0, request.account) || atrMeasurement.event;
              return navigate2;
            };
          }
          const isLoggedIn = this.getAllAccounts().length > 0;
          try {
            redirectPreflightCheck(this.initialized, this.config);
            this.browserStorage.setInteractionInProgress(true, INTERACTION_TYPE.SIGNIN);
            if (isLoggedIn) {
              this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_START, exports.InteractionType.Redirect, request);
            } else {
              this.eventHandler.emitEvent(EventType.LOGIN_START, exports.InteractionType.Redirect, request);
            }
            let result;
            if (this.platformAuthProvider && this.canUsePlatformBroker(request)) {
              const nativeClient = new PlatformAuthInteractionClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ApiId.acquireTokenRedirect, this.performanceClient, this.platformAuthProvider, this.getNativeAccountId(request), this.nativeInternalStorage, correlationId);
              result = nativeClient.acquireTokenRedirect(request, atrMeasurement).catch((e) => {
                atrMeasurement.add({
                  brokerErrorName: e.name,
                  brokerErrorCode: e.errorCode
                });
                if (e instanceof NativeAuthError && isFatalNativeAuthError(e)) {
                  this.platformAuthProvider = void 0;
                  const redirectClient = this.createRedirectClient(correlationId);
                  return redirectClient.acquireToken(request);
                } else if (e instanceof InteractionRequiredAuthError) {
                  this.logger.verbose("acquireTokenRedirect - Resolving interaction required error thrown by native broker by falling back to web flow");
                  const redirectClient = this.createRedirectClient(correlationId);
                  return redirectClient.acquireToken(request);
                }
                throw e;
              });
            } else {
              const redirectClient = this.createRedirectClient(correlationId);
              result = redirectClient.acquireToken(request);
            }
            return await result;
          } catch (e) {
            this.browserStorage.resetRequestCache();
            if (atrMeasurement.event.status === 2) {
              this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenRedirect, correlationId).end({ success: false }, e, request.account);
            } else {
              atrMeasurement.end({ success: false }, e, request.account);
            }
            if (isLoggedIn) {
              this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, exports.InteractionType.Redirect, null, e);
            } else {
              this.eventHandler.emitEvent(EventType.LOGIN_FAILURE, exports.InteractionType.Redirect, null, e);
            }
            throw e;
          }
        }
        // #endregion
        // #region Popup Flow
        /**
         * Use when you want to obtain an access_token for your API via opening a popup window in the user's browser
         *
         * @param request
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        acquireTokenPopup(request) {
          const correlationId = this.getRequestCorrelationId(request);
          const atPopupMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenPopup, correlationId);
          atPopupMeasurement.add({
            scenarioId: request.scenarioId
          });
          try {
            this.logger.verbose("acquireTokenPopup called", correlationId);
            preflightCheck(this.initialized, atPopupMeasurement, request.account);
            this.browserStorage.setInteractionInProgress(true, INTERACTION_TYPE.SIGNIN);
          } catch (e) {
            return Promise.reject(e);
          }
          const loggedInAccounts = this.getAllAccounts();
          if (loggedInAccounts.length > 0) {
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_START, exports.InteractionType.Popup, request);
          } else {
            this.eventHandler.emitEvent(EventType.LOGIN_START, exports.InteractionType.Popup, request);
          }
          let result;
          const pkce = this.getPreGeneratedPkceCodes(correlationId);
          if (this.canUsePlatformBroker(request)) {
            atPopupMeasurement.add({
              isPlatformBrokerRequest: true
            });
            result = this.acquireTokenNative({
              ...request,
              correlationId
            }, ApiId.acquireTokenPopup).then((response) => {
              atPopupMeasurement.end({
                success: true
              }, void 0, response.account);
              return response;
            }).catch((e) => {
              atPopupMeasurement.add({
                brokerErrorName: e.name,
                brokerErrorCode: e.errorCode
              });
              if (e instanceof NativeAuthError && isFatalNativeAuthError(e)) {
                this.platformAuthProvider = void 0;
                const popupClient = this.createPopupClient(correlationId);
                return popupClient.acquireToken(request, pkce);
              } else if (e instanceof InteractionRequiredAuthError) {
                this.logger.verbose("acquireTokenPopup - Resolving interaction required error thrown by native broker by falling back to web flow");
                const popupClient = this.createPopupClient(correlationId);
                return popupClient.acquireToken(request, pkce);
              }
              throw e;
            });
          } else {
            const popupClient = this.createPopupClient(correlationId);
            result = popupClient.acquireToken(request, pkce);
          }
          return result.then((result2) => {
            const isLoggingIn = loggedInAccounts.length < this.getAllAccounts().length;
            if (isLoggingIn) {
              this.eventHandler.emitEvent(EventType.LOGIN_SUCCESS, exports.InteractionType.Popup, result2);
            } else {
              this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, exports.InteractionType.Popup, result2);
            }
            atPopupMeasurement.end({
              success: true,
              accessTokenSize: result2.accessToken.length,
              idTokenSize: result2.idToken.length
            }, void 0, result2.account);
            return result2;
          }).catch((e) => {
            if (loggedInAccounts.length > 0) {
              this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, exports.InteractionType.Popup, null, e);
            } else {
              this.eventHandler.emitEvent(EventType.LOGIN_FAILURE, exports.InteractionType.Popup, null, e);
            }
            atPopupMeasurement.end({
              success: false
            }, e, request.account);
            return Promise.reject(e);
          }).finally(async () => {
            this.browserStorage.setInteractionInProgress(false);
            if (this.config.system.asyncPopups) {
              await this.preGeneratePkceCodes(correlationId);
            }
          });
        }
        trackPageVisibilityWithMeasurement() {
          const measurement = this.ssoSilentMeasurement || this.acquireTokenByCodeAsyncMeasurement;
          if (!measurement) {
            return;
          }
          this.logger.info("Perf: Visibility change detected in ", measurement.event.name);
          measurement.increment({
            visibilityChangeCount: 1
          });
        }
        // #endregion
        // #region Silent Flow
        /**
         * This function uses a hidden iframe to fetch an authorization code from the eSTS. There are cases where this may not work:
         * - Any browser using a form of Intelligent Tracking Prevention
         * - If there is not an established session with the service
         *
         * In these cases, the request must be done inside a popup or full frame redirect.
         *
         * For the cases where interaction is required, you cannot send a request with prompt=none.
         *
         * If your refresh token has expired, you can use this function to fetch a new set of tokens silently as long as
         * you session on the server still exists.
         * @param request {@link SsoSilentRequest}
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        async ssoSilent(request) {
          const correlationId = this.getRequestCorrelationId(request);
          const validRequest = {
            ...request,
            // will be PromptValue.NONE or PromptValue.NO_SESSION
            prompt: request.prompt,
            correlationId
          };
          this.ssoSilentMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.SsoSilent, correlationId);
          this.ssoSilentMeasurement?.add({
            scenarioId: request.scenarioId
          });
          preflightCheck(this.initialized, this.ssoSilentMeasurement, request.account);
          this.ssoSilentMeasurement?.increment({
            visibilityChangeCount: 0
          });
          document.addEventListener("visibilitychange", this.trackPageVisibilityWithMeasurement);
          this.logger.verbose("ssoSilent called", correlationId);
          this.eventHandler.emitEvent(EventType.SSO_SILENT_START, exports.InteractionType.Silent, validRequest);
          let result;
          if (this.canUsePlatformBroker(validRequest)) {
            this.ssoSilentMeasurement?.add({
              isPlatformBrokerRequest: true
            });
            result = this.acquireTokenNative(validRequest, ApiId.ssoSilent).catch((e) => {
              this.ssoSilentMeasurement?.add({
                brokerErrorName: e.name,
                brokerErrorCode: e.errorCode
              });
              if (e instanceof NativeAuthError && isFatalNativeAuthError(e)) {
                this.platformAuthProvider = void 0;
                const silentIframeClient = this.createSilentIframeClient(validRequest.correlationId);
                return silentIframeClient.acquireToken(validRequest);
              }
              throw e;
            });
          } else {
            const silentIframeClient = this.createSilentIframeClient(validRequest.correlationId);
            result = silentIframeClient.acquireToken(validRequest);
          }
          return result.then((response) => {
            this.eventHandler.emitEvent(EventType.SSO_SILENT_SUCCESS, exports.InteractionType.Silent, response);
            this.ssoSilentMeasurement?.end({
              success: true,
              accessTokenSize: response.accessToken.length,
              idTokenSize: response.idToken.length
            }, void 0, response.account);
            return response;
          }).catch((e) => {
            this.eventHandler.emitEvent(EventType.SSO_SILENT_FAILURE, exports.InteractionType.Silent, null, e);
            this.ssoSilentMeasurement?.end({
              success: false
            }, e, request.account);
            throw e;
          }).finally(() => {
            document.removeEventListener("visibilitychange", this.trackPageVisibilityWithMeasurement);
          });
        }
        /**
         * This function redeems an authorization code (passed as code) from the eSTS token endpoint.
         * This authorization code should be acquired server-side using a confidential client to acquire a spa_code.
         * This API is not indended for normal authorization code acquisition and redemption.
         *
         * Redemption of this authorization code will not require PKCE, as it was acquired by a confidential client.
         *
         * @param request {@link AuthorizationCodeRequest}
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        async acquireTokenByCode(request) {
          const correlationId = this.getRequestCorrelationId(request);
          this.logger.trace("acquireTokenByCode called", correlationId);
          const atbcMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenByCode, correlationId);
          preflightCheck(this.initialized, atbcMeasurement);
          this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_BY_CODE_START, exports.InteractionType.Silent, request);
          atbcMeasurement.add({ scenarioId: request.scenarioId });
          try {
            if (request.code && request.nativeAccountId) {
              throw createBrowserAuthError(spaCodeAndNativeAccountIdPresent);
            } else if (request.code) {
              const hybridAuthCode = request.code;
              let response = this.hybridAuthCodeResponses.get(hybridAuthCode);
              if (!response) {
                this.logger.verbose("Initiating new acquireTokenByCode request", correlationId);
                response = this.acquireTokenByCodeAsync({
                  ...request,
                  correlationId
                }).then((result) => {
                  this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_BY_CODE_SUCCESS, exports.InteractionType.Silent, result);
                  this.hybridAuthCodeResponses.delete(hybridAuthCode);
                  atbcMeasurement.end({
                    success: true,
                    accessTokenSize: result.accessToken.length,
                    idTokenSize: result.idToken.length
                  }, void 0, result.account);
                  return result;
                }).catch((error) => {
                  this.hybridAuthCodeResponses.delete(hybridAuthCode);
                  this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_BY_CODE_FAILURE, exports.InteractionType.Silent, null, error);
                  atbcMeasurement.end({
                    success: false
                  }, error);
                  throw error;
                });
                this.hybridAuthCodeResponses.set(hybridAuthCode, response);
              } else {
                this.logger.verbose("Existing acquireTokenByCode request found", correlationId);
                atbcMeasurement.discard();
              }
              return await response;
            } else if (request.nativeAccountId) {
              if (this.canUsePlatformBroker(request, request.nativeAccountId)) {
                atbcMeasurement.add({
                  isPlatformBrokerRequest: true
                });
                const result = await this.acquireTokenNative({
                  ...request,
                  correlationId
                }, ApiId.acquireTokenByCode, request.nativeAccountId).catch((e) => {
                  if (e instanceof NativeAuthError && isFatalNativeAuthError(e)) {
                    this.platformAuthProvider = void 0;
                  }
                  atbcMeasurement.add({
                    brokerErrorName: e.name,
                    brokerErrorCode: e.errorCode
                  });
                  throw e;
                });
                atbcMeasurement.end({
                  success: true
                }, void 0, result.account);
                return result;
              } else {
                throw createBrowserAuthError(unableToAcquireTokenFromNativePlatform);
              }
            } else {
              throw createBrowserAuthError(authCodeOrNativeAccountIdRequired);
            }
          } catch (e) {
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_BY_CODE_FAILURE, exports.InteractionType.Silent, null, e);
            atbcMeasurement.end({
              success: false
            }, e);
            throw e;
          }
        }
        /**
         * Creates a SilentAuthCodeClient to redeem an authorization code.
         * @param request
         * @returns Result of the operation to redeem the authorization code
         */
        async acquireTokenByCodeAsync(request) {
          this.logger.trace("acquireTokenByCodeAsync called", request.correlationId);
          this.acquireTokenByCodeAsyncMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenByCodeAsync, request.correlationId);
          this.acquireTokenByCodeAsyncMeasurement?.increment({
            visibilityChangeCount: 0
          });
          document.addEventListener("visibilitychange", this.trackPageVisibilityWithMeasurement);
          const silentAuthCodeClient = this.createSilentAuthCodeClient(request.correlationId);
          const silentTokenResult = await silentAuthCodeClient.acquireToken(request).then((response) => {
            this.acquireTokenByCodeAsyncMeasurement?.end({
              success: true,
              fromCache: response.fromCache
            });
            return response;
          }).catch((tokenRenewalError) => {
            this.acquireTokenByCodeAsyncMeasurement?.end({
              success: false
            }, tokenRenewalError);
            throw tokenRenewalError;
          }).finally(() => {
            document.removeEventListener("visibilitychange", this.trackPageVisibilityWithMeasurement);
          });
          return silentTokenResult;
        }
        /**
         * Attempt to acquire an access token from the cache
         * @param silentCacheClient SilentCacheClient
         * @param commonRequest CommonSilentFlowRequest
         * @param silentRequest SilentRequest
         * @returns A promise that, when resolved, returns the access token
         */
        async acquireTokenFromCache(commonRequest, cacheLookupPolicy) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.AcquireTokenFromCache, commonRequest.correlationId);
          switch (cacheLookupPolicy) {
            case CacheLookupPolicy.Default:
            case CacheLookupPolicy.AccessToken:
            case CacheLookupPolicy.AccessTokenAndRefreshToken:
              const silentCacheClient = this.createSilentCacheClient(commonRequest.correlationId);
              return invokeAsync(silentCacheClient.acquireToken.bind(silentCacheClient), PerformanceEvents.SilentCacheClientAcquireToken, this.logger, this.performanceClient, commonRequest.correlationId)(commonRequest);
            default:
              throw createClientAuthError(tokenRefreshRequired);
          }
        }
        /**
         * Attempt to acquire an access token via a refresh token
         * @param commonRequest CommonSilentFlowRequest
         * @param cacheLookupPolicy CacheLookupPolicy
         * @returns A promise that, when resolved, returns the access token
         */
        async acquireTokenByRefreshToken(commonRequest, cacheLookupPolicy) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.AcquireTokenByRefreshToken, commonRequest.correlationId);
          switch (cacheLookupPolicy) {
            case CacheLookupPolicy.Default:
            case CacheLookupPolicy.AccessTokenAndRefreshToken:
            case CacheLookupPolicy.RefreshToken:
            case CacheLookupPolicy.RefreshTokenAndNetwork:
              const silentRefreshClient = this.createSilentRefreshClient(commonRequest.correlationId);
              return invokeAsync(silentRefreshClient.acquireToken.bind(silentRefreshClient), PerformanceEvents.SilentRefreshClientAcquireToken, this.logger, this.performanceClient, commonRequest.correlationId)(commonRequest);
            default:
              throw createClientAuthError(tokenRefreshRequired);
          }
        }
        /**
         * Attempt to acquire an access token via an iframe
         * @param request CommonSilentFlowRequest
         * @returns A promise that, when resolved, returns the access token
         */
        async acquireTokenBySilentIframe(request) {
          this.performanceClient.addQueueMeasurement(PerformanceEvents.AcquireTokenBySilentIframe, request.correlationId);
          const silentIframeClient = this.createSilentIframeClient(request.correlationId);
          return invokeAsync(silentIframeClient.acquireToken.bind(silentIframeClient), PerformanceEvents.SilentIframeClientAcquireToken, this.logger, this.performanceClient, request.correlationId)(request);
        }
        // #endregion
        // #region Logout
        /**
         * Deprecated logout function. Use logoutRedirect or logoutPopup instead
         * @param logoutRequest
         * @deprecated
         */
        async logout(logoutRequest) {
          const correlationId = this.getRequestCorrelationId(logoutRequest);
          this.logger.warning("logout API is deprecated and will be removed in msal-browser v3.0.0. Use logoutRedirect instead.", correlationId);
          return this.logoutRedirect({
            correlationId,
            ...logoutRequest
          });
        }
        /**
         * Use to log out the current user, and redirect the user to the postLogoutRedirectUri.
         * Default behaviour is to redirect the user to `window.location.href`.
         * @param logoutRequest
         */
        async logoutRedirect(logoutRequest) {
          const correlationId = this.getRequestCorrelationId(logoutRequest);
          redirectPreflightCheck(this.initialized, this.config);
          this.browserStorage.setInteractionInProgress(true, INTERACTION_TYPE.SIGNOUT);
          const redirectClient = this.createRedirectClient(correlationId);
          return redirectClient.logout(logoutRequest);
        }
        /**
         * Clears local cache for the current user then opens a popup window prompting the user to sign-out of the server
         * @param logoutRequest
         */
        logoutPopup(logoutRequest) {
          try {
            const correlationId = this.getRequestCorrelationId(logoutRequest);
            preflightCheck$1(this.initialized);
            this.browserStorage.setInteractionInProgress(true, INTERACTION_TYPE.SIGNOUT);
            const popupClient = this.createPopupClient(correlationId);
            return popupClient.logout(logoutRequest).finally(() => {
              this.browserStorage.setInteractionInProgress(false);
            });
          } catch (e) {
            return Promise.reject(e);
          }
        }
        /**
         * Creates a cache interaction client to clear broswer cache.
         * @param logoutRequest
         */
        async clearCache(logoutRequest) {
          if (!this.isBrowserEnvironment) {
            this.logger.info("in non-browser environment, returning early.");
            return;
          }
          const correlationId = this.getRequestCorrelationId(logoutRequest);
          const cacheClient = this.createSilentCacheClient(correlationId);
          return cacheClient.logout(logoutRequest);
        }
        // #endregion
        // #region Account APIs
        /**
         * Returns all the accounts in the cache that match the optional filter. If no filter is provided, all accounts are returned.
         * @param accountFilter - (Optional) filter to narrow down the accounts returned
         * @returns Array of AccountInfo objects in cache
         */
        getAllAccounts(accountFilter) {
          const correlationId = this.getRequestCorrelationId();
          return getAllAccounts(this.logger, this.browserStorage, this.isBrowserEnvironment, correlationId, accountFilter);
        }
        /**
         * Returns the first account found in the cache that matches the account filter passed in.
         * @param accountFilter
         * @returns The first account found in the cache matching the provided filter or null if no account could be found.
         */
        getAccount(accountFilter) {
          const correlationId = this.getRequestCorrelationId();
          return getAccount(accountFilter, this.logger, this.browserStorage, correlationId);
        }
        /**
         * Returns the signed in account matching username.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found.
         * This API is provided for convenience but getAccountById should be used for best reliability
         * @param username
         * @returns The account object stored in MSAL
         */
        getAccountByUsername(username) {
          const correlationId = this.getRequestCorrelationId();
          return getAccountByUsername(username, this.logger, this.browserStorage, correlationId);
        }
        /**
         * Returns the signed in account matching homeAccountId.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found
         * @param homeAccountId
         * @returns The account object stored in MSAL
         */
        getAccountByHomeId(homeAccountId) {
          const correlationId = this.getRequestCorrelationId();
          return getAccountByHomeId(homeAccountId, this.logger, this.browserStorage, correlationId);
        }
        /**
         * Returns the signed in account matching localAccountId.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found
         * @param localAccountId
         * @returns The account object stored in MSAL
         */
        getAccountByLocalId(localAccountId) {
          const correlationId = this.getRequestCorrelationId();
          return getAccountByLocalId(localAccountId, this.logger, this.browserStorage, correlationId);
        }
        /**
         * Sets the account to use as the active account. If no account is passed to the acquireToken APIs, then MSAL will use this active account.
         * @param account
         */
        setActiveAccount(account2) {
          const correlationId = this.getRequestCorrelationId();
          setActiveAccount(account2, this.browserStorage, correlationId);
        }
        /**
         * Gets the currently active account
         */
        getActiveAccount() {
          const correlationId = this.getRequestCorrelationId();
          return getActiveAccount(this.browserStorage, correlationId);
        }
        // #endregion
        /**
         * Hydrates the cache with the tokens from an AuthenticationResult
         * @param result
         * @param request
         * @returns
         */
        async hydrateCache(result, request) {
          this.logger.verbose("hydrateCache called");
          const accountEntity = AccountEntity.createFromAccountInfo(result.account, result.cloudGraphHostName, result.msGraphHost);
          await this.browserStorage.setAccount(accountEntity, result.correlationId);
          if (result.fromNativeBroker) {
            this.logger.verbose("Response was from native broker, storing in-memory");
            return this.nativeInternalStorage.hydrateCache(result, request);
          } else {
            return this.browserStorage.hydrateCache(result, request);
          }
        }
        // #region Helpers
        /**
         * Acquire a token from native device (e.g. WAM)
         * @param request
         */
        async acquireTokenNative(request, apiId, accountId, cacheLookupPolicy) {
          this.logger.trace("acquireTokenNative called");
          if (!this.platformAuthProvider) {
            throw createBrowserAuthError(nativeConnectionNotEstablished);
          }
          const nativeClient = new PlatformAuthInteractionClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, apiId, this.performanceClient, this.platformAuthProvider, accountId || this.getNativeAccountId(request), this.nativeInternalStorage, request.correlationId);
          return nativeClient.acquireToken(request, cacheLookupPolicy);
        }
        /**
         * Returns boolean indicating if this request can use the platform broker
         * @param request
         */
        canUsePlatformBroker(request, accountId) {
          this.logger.trace("canUsePlatformBroker called");
          if (!this.platformAuthProvider) {
            this.logger.trace("canUsePlatformBroker: platform broker unavilable, returning false");
            return false;
          }
          if (!isPlatformAuthAllowed(this.config, this.logger, this.platformAuthProvider, request.authenticationScheme)) {
            this.logger.trace("canUsePlatformBroker: isBrokerAvailable returned false, returning false");
            return false;
          }
          if (request.prompt) {
            switch (request.prompt) {
              case PromptValue.NONE:
              case PromptValue.CONSENT:
              case PromptValue.LOGIN:
              case PromptValue.SELECT_ACCOUNT:
                this.logger.trace("canUsePlatformBroker: prompt is compatible with platform broker flow");
                break;
              default:
                this.logger.trace(`canUsePlatformBroker: prompt = ${request.prompt} is not compatible with platform broker flow, returning false`);
                return false;
            }
          }
          if (!accountId && !this.getNativeAccountId(request)) {
            this.logger.trace("canUsePlatformBroker: nativeAccountId is not available, returning false");
            return false;
          }
          return true;
        }
        /**
         * Get the native accountId from the account
         * @param request
         * @returns
         */
        getNativeAccountId(request) {
          const account2 = request.account || this.getAccount({
            loginHint: request.loginHint,
            sid: request.sid
          }) || this.getActiveAccount();
          return account2 && account2.nativeAccountId || "";
        }
        /**
         * Returns new instance of the Popup Interaction Client
         * @param correlationId
         */
        createPopupClient(correlationId) {
          return new PopupClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.performanceClient, this.nativeInternalStorage, this.platformAuthProvider, correlationId);
        }
        /**
         * Returns new instance of the Redirect Interaction Client
         * @param correlationId
         */
        createRedirectClient(correlationId) {
          return new RedirectClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.performanceClient, this.nativeInternalStorage, this.platformAuthProvider, correlationId);
        }
        /**
         * Returns new instance of the Silent Iframe Interaction Client
         * @param correlationId
         */
        createSilentIframeClient(correlationId) {
          return new SilentIframeClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ApiId.ssoSilent, this.performanceClient, this.nativeInternalStorage, this.platformAuthProvider, correlationId);
        }
        /**
         * Returns new instance of the Silent Cache Interaction Client
         */
        createSilentCacheClient(correlationId) {
          return new SilentCacheClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.performanceClient, this.platformAuthProvider, correlationId);
        }
        /**
         * Returns new instance of the Silent Refresh Interaction Client
         */
        createSilentRefreshClient(correlationId) {
          return new SilentRefreshClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.performanceClient, this.platformAuthProvider, correlationId);
        }
        /**
         * Returns new instance of the Silent AuthCode Interaction Client
         */
        createSilentAuthCodeClient(correlationId) {
          return new SilentAuthCodeClient(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ApiId.acquireTokenByCode, this.performanceClient, this.platformAuthProvider, correlationId);
        }
        /**
         * Adds event callbacks to array
         * @param callback
         */
        addEventCallback(callback, eventTypes) {
          return this.eventHandler.addEventCallback(callback, eventTypes);
        }
        /**
         * Removes callback with provided id from callback array
         * @param callbackId
         */
        removeEventCallback(callbackId) {
          this.eventHandler.removeEventCallback(callbackId);
        }
        /**
         * Registers a callback to receive performance events.
         *
         * @param {PerformanceCallbackFunction} callback
         * @returns {string}
         */
        addPerformanceCallback(callback) {
          blockNonBrowserEnvironment();
          return this.performanceClient.addPerformanceCallback(callback);
        }
        /**
         * Removes a callback registered with addPerformanceCallback.
         *
         * @param {string} callbackId
         * @returns {boolean}
         */
        removePerformanceCallback(callbackId) {
          return this.performanceClient.removePerformanceCallback(callbackId);
        }
        /**
         * Adds event listener that emits an event when a user account is added or removed from localstorage in a different browser tab or window
         * @deprecated These events will be raised by default and this method will be removed in a future major version.
         */
        enableAccountStorageEvents() {
          if (this.config.cache.cacheLocation !== BrowserCacheLocation.LocalStorage) {
            this.logger.info("Account storage events are only available when cacheLocation is set to localStorage");
            return;
          }
          this.eventHandler.subscribeCrossTab();
        }
        /**
         * Removes event listener that emits an event when a user account is added or removed from localstorage in a different browser tab or window
         * @deprecated These events will be raised by default and this method will be removed in a future major version.
         */
        disableAccountStorageEvents() {
          if (this.config.cache.cacheLocation !== BrowserCacheLocation.LocalStorage) {
            this.logger.info("Account storage events are only available when cacheLocation is set to localStorage");
            return;
          }
          this.eventHandler.unsubscribeCrossTab();
        }
        /**
         * Gets the token cache for the application.
         */
        getTokenCache() {
          return this.tokenCache;
        }
        /**
         * Returns the logger instance
         */
        getLogger() {
          return this.logger;
        }
        /**
         * Replaces the default logger set in configurations with new Logger with new configurations
         * @param logger Logger instance
         */
        setLogger(logger) {
          this.logger = logger;
        }
        /**
         * Called by wrapper libraries (Angular & React) to set SKU and Version passed down to telemetry, logger, etc.
         * @param sku
         * @param version
         */
        initializeWrapperLibrary(sku, version2) {
          this.browserStorage.setWrapperMetadata(sku, version2);
        }
        /**
         * Sets navigation client
         * @param navigationClient
         */
        setNavigationClient(navigationClient) {
          this.navigationClient = navigationClient;
        }
        /**
         * Returns the configuration object
         */
        getConfiguration() {
          return this.config;
        }
        /**
         * Returns the performance client
         */
        getPerformanceClient() {
          return this.performanceClient;
        }
        /**
         * Returns the browser env indicator
         */
        isBrowserEnv() {
          return this.isBrowserEnvironment;
        }
        /**
         * Generates a correlation id for a request if none is provided.
         *
         * @protected
         * @param {?Partial<BaseAuthRequest>} [request]
         * @returns {string}
         */
        getRequestCorrelationId(request) {
          if (request?.correlationId) {
            return request.correlationId;
          }
          if (this.isBrowserEnvironment) {
            return createNewGuid();
          }
          return Constants.EMPTY_STRING;
        }
        // #endregion
        /**
         * Use when initiating the login process by redirecting the user's browser to the authorization endpoint. This function redirects the page, so
         * any code that follows this function will not execute.
         *
         * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
         * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
         *
         * @param request
         */
        async loginRedirect(request) {
          const correlationId = this.getRequestCorrelationId(request);
          this.logger.verbose("loginRedirect called", correlationId);
          return this.acquireTokenRedirect({
            correlationId,
            ...request || DEFAULT_REQUEST
          });
        }
        /**
         * Use when initiating the login process via opening a popup window in the user's browser
         *
         * @param request
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        loginPopup(request) {
          const correlationId = this.getRequestCorrelationId(request);
          this.logger.verbose("loginPopup called", correlationId);
          return this.acquireTokenPopup({
            correlationId,
            ...request || DEFAULT_REQUEST
          });
        }
        /**
         * Silently acquire an access token for a given set of scopes. Returns currently processing promise if parallel requests are made.
         *
         * @param {@link (SilentRequest:type)}
         * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
         */
        async acquireTokenSilent(request) {
          const correlationId = this.getRequestCorrelationId(request);
          const atsMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenSilent, correlationId);
          atsMeasurement.add({
            cacheLookupPolicy: request.cacheLookupPolicy,
            scenarioId: request.scenarioId
          });
          preflightCheck(this.initialized, atsMeasurement, request.account);
          this.logger.verbose("acquireTokenSilent called", correlationId);
          const account2 = request.account || this.getActiveAccount();
          if (!account2) {
            throw createBrowserAuthError(noAccountError);
          }
          return this.acquireTokenSilentDeduped(request, account2, correlationId).then((result) => {
            atsMeasurement.end({
              success: true,
              fromCache: result.fromCache,
              accessTokenSize: result.accessToken.length,
              idTokenSize: result.idToken.length
            }, void 0, result.account);
            return {
              ...result,
              state: request.state,
              correlationId
              // Ensures PWB scenarios can correctly match request to response
            };
          }).catch((error) => {
            if (error instanceof AuthError) {
              error.setCorrelationId(correlationId);
            }
            atsMeasurement.end({
              success: false
            }, error, account2);
            throw error;
          });
        }
        /**
         * Checks if identical request is already in flight and returns reference to the existing promise or fires off a new one if this is the first
         * @param request
         * @param account
         * @param correlationId
         * @returns
         */
        async acquireTokenSilentDeduped(request, account2, correlationId) {
          const thumbprint = getRequestThumbprint(this.config.auth.clientId, {
            ...request,
            authority: request.authority || this.config.auth.authority
          }, account2.homeAccountId);
          const silentRequestKey = JSON.stringify(thumbprint);
          const inProgressRequest = this.activeSilentTokenRequests.get(silentRequestKey);
          if (typeof inProgressRequest === "undefined") {
            this.logger.verbose("acquireTokenSilent called for the first time, storing active request", correlationId);
            this.performanceClient.addFields({ deduped: false }, correlationId);
            const activeRequest = invokeAsync(this.acquireTokenSilentAsync.bind(this), PerformanceEvents.AcquireTokenSilentAsync, this.logger, this.performanceClient, correlationId)({
              ...request,
              correlationId
            }, account2);
            this.activeSilentTokenRequests.set(silentRequestKey, activeRequest);
            return activeRequest.finally(() => {
              this.activeSilentTokenRequests.delete(silentRequestKey);
            });
          } else {
            this.logger.verbose("acquireTokenSilent has been called previously, returning the result from the first call", correlationId);
            this.performanceClient.addFields({ deduped: true }, correlationId);
            return inProgressRequest;
          }
        }
        /**
         * Silently acquire an access token for a given set of scopes. Will use cached token if available, otherwise will attempt to acquire a new token from the network via refresh token.
         * @param {@link (SilentRequest:type)}
         * @param {@link (AccountInfo:type)}
         * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse}
         */
        async acquireTokenSilentAsync(request, account2) {
          const trackPageVisibility = () => this.trackPageVisibility(request.correlationId);
          this.performanceClient.addQueueMeasurement(PerformanceEvents.AcquireTokenSilentAsync, request.correlationId);
          this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_START, exports.InteractionType.Silent, request);
          if (request.correlationId) {
            this.performanceClient.incrementFields({ visibilityChangeCount: 0 }, request.correlationId);
          }
          document.addEventListener("visibilitychange", trackPageVisibility);
          const silentRequest = await invokeAsync(initializeSilentRequest, PerformanceEvents.InitializeSilentRequest, this.logger, this.performanceClient, request.correlationId)(request, account2, this.config, this.performanceClient, this.logger);
          const cacheLookupPolicy = request.cacheLookupPolicy || CacheLookupPolicy.Default;
          const result = this.acquireTokenSilentNoIframe(silentRequest, cacheLookupPolicy).catch(async (refreshTokenError) => {
            const shouldTryToResolveSilently = checkIfRefreshTokenErrorCanBeResolvedSilently(refreshTokenError, cacheLookupPolicy);
            if (shouldTryToResolveSilently) {
              if (!this.activeIframeRequest) {
                let _resolve;
                this.activeIframeRequest = [
                  new Promise((resolve) => {
                    _resolve = resolve;
                  }),
                  silentRequest.correlationId
                ];
                this.logger.verbose("Refresh token expired/invalid or CacheLookupPolicy is set to Skip, attempting acquire token by iframe.", silentRequest.correlationId);
                return invokeAsync(this.acquireTokenBySilentIframe.bind(this), PerformanceEvents.AcquireTokenBySilentIframe, this.logger, this.performanceClient, silentRequest.correlationId)(silentRequest).then((iframeResult) => {
                  _resolve(true);
                  return iframeResult;
                }).catch((e) => {
                  _resolve(false);
                  throw e;
                }).finally(() => {
                  this.activeIframeRequest = void 0;
                });
              } else if (cacheLookupPolicy !== CacheLookupPolicy.Skip) {
                const [activePromise, activeCorrelationId] = this.activeIframeRequest;
                this.logger.verbose(`Iframe request is already in progress, awaiting resolution for request with correlationId: ${activeCorrelationId}`, silentRequest.correlationId);
                const awaitConcurrentIframeMeasure = this.performanceClient.startMeasurement(PerformanceEvents.AwaitConcurrentIframe, silentRequest.correlationId);
                awaitConcurrentIframeMeasure.add({
                  awaitIframeCorrelationId: activeCorrelationId
                });
                const activePromiseResult = await activePromise;
                awaitConcurrentIframeMeasure.end({
                  success: activePromiseResult
                });
                if (activePromiseResult) {
                  this.logger.verbose(`Parallel iframe request with correlationId: ${activeCorrelationId} succeeded. Retrying cache and/or RT redemption`, silentRequest.correlationId);
                  return this.acquireTokenSilentNoIframe(silentRequest, cacheLookupPolicy);
                } else {
                  this.logger.info(`Iframe request with correlationId: ${activeCorrelationId} failed. Interaction is required.`);
                  throw refreshTokenError;
                }
              } else {
                this.logger.warning("Another iframe request is currently in progress and CacheLookupPolicy is set to Skip. This may result in degraded performance and/or reliability for both calls. Please consider changing the CacheLookupPolicy to take advantage of request queuing and token cache.", silentRequest.correlationId);
                return invokeAsync(this.acquireTokenBySilentIframe.bind(this), PerformanceEvents.AcquireTokenBySilentIframe, this.logger, this.performanceClient, silentRequest.correlationId)(silentRequest);
              }
            } else {
              throw refreshTokenError;
            }
          });
          return result.then((response) => {
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, exports.InteractionType.Silent, response);
            this.performanceClient.addFields({
              fromCache: response.fromCache
            }, request.correlationId);
            return response;
          }).catch((tokenRenewalError) => {
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, exports.InteractionType.Silent, null, tokenRenewalError);
            throw tokenRenewalError;
          }).finally(() => {
            document.removeEventListener("visibilitychange", trackPageVisibility);
          });
        }
        /**
         * AcquireTokenSilent without the iframe fallback. This is used to enable the correct fallbacks in cases where there's a potential for multiple silent requests to be made in parallel and prevent those requests from making concurrent iframe requests.
         * @param silentRequest
         * @param cacheLookupPolicy
         * @returns
         */
        async acquireTokenSilentNoIframe(silentRequest, cacheLookupPolicy) {
          if (isPlatformAuthAllowed(this.config, this.logger, this.platformAuthProvider, silentRequest.authenticationScheme) && silentRequest.account.nativeAccountId) {
            this.logger.verbose("acquireTokenSilent - attempting to acquire token from native platform");
            this.performanceClient.addFields({ isPlatformBrokerRequest: true }, silentRequest.correlationId);
            return this.acquireTokenNative(silentRequest, ApiId.acquireTokenSilent_silentFlow, silentRequest.account.nativeAccountId, cacheLookupPolicy).catch(async (e) => {
              this.performanceClient.addFields({
                brokerErrorName: e.name,
                brokerErrorCode: e.errorCode
              }, silentRequest.correlationId);
              if (e instanceof NativeAuthError && isFatalNativeAuthError(e)) {
                this.logger.verbose("acquireTokenSilent - native platform unavailable, falling back to web flow");
                this.platformAuthProvider = void 0;
                throw createClientAuthError(tokenRefreshRequired);
              }
              throw e;
            });
          } else {
            this.logger.verbose("acquireTokenSilent - attempting to acquire token from web flow");
            if (cacheLookupPolicy === CacheLookupPolicy.AccessToken) {
              this.logger.verbose("acquireTokenSilent - cache lookup policy set to AccessToken, attempting to acquire token from local cache");
            }
            return invokeAsync(this.acquireTokenFromCache.bind(this), PerformanceEvents.AcquireTokenFromCache, this.logger, this.performanceClient, silentRequest.correlationId)(silentRequest, cacheLookupPolicy).catch((cacheError) => {
              if (cacheLookupPolicy === CacheLookupPolicy.AccessToken) {
                throw cacheError;
              }
              this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_NETWORK_START, exports.InteractionType.Silent, silentRequest);
              return invokeAsync(this.acquireTokenByRefreshToken.bind(this), PerformanceEvents.AcquireTokenByRefreshToken, this.logger, this.performanceClient, silentRequest.correlationId)(silentRequest, cacheLookupPolicy);
            });
          }
        }
        /**
         * Pre-generates PKCE codes and stores it in local variable
         * @param correlationId
         */
        async preGeneratePkceCodes(correlationId) {
          this.logger.verbose("Generating new PKCE codes");
          this.pkceCode = await invokeAsync(generatePkceCodes, PerformanceEvents.GeneratePkceCodes, this.logger, this.performanceClient, correlationId)(this.performanceClient, this.logger, correlationId);
          return Promise.resolve();
        }
        /**
         * Provides pre-generated PKCE codes, if any
         * @param correlationId
         */
        getPreGeneratedPkceCodes(correlationId) {
          this.logger.verbose("Attempting to pick up pre-generated PKCE codes");
          const res = this.pkceCode ? { ...this.pkceCode } : void 0;
          this.pkceCode = void 0;
          this.logger.verbose(`${res ? "Found" : "Did not find"} pre-generated PKCE codes`);
          this.performanceClient.addFields({ usePreGeneratedPkce: !!res }, correlationId);
          return res;
        }
        logMultipleInstances(performanceEvent) {
          const clientId = this.config.auth.clientId;
          if (!window)
            return;
          window.msal = window.msal || {};
          window.msal.clientIds = window.msal.clientIds || [];
          const clientIds = window.msal.clientIds;
          if (clientIds.length > 0) {
            this.logger.verbose("There is already an instance of MSAL.js in the window.");
          }
          window.msal.clientIds.push(clientId);
          collectInstanceStats(clientId, performanceEvent, this.logger);
        }
      };
      function checkIfRefreshTokenErrorCanBeResolvedSilently(refreshTokenError, cacheLookupPolicy) {
        const noInteractionRequired = !(refreshTokenError instanceof InteractionRequiredAuthError && // For refresh token errors, bad_token does not always require interaction (silently resolvable)
        refreshTokenError.subError !== badToken);
        const refreshTokenRefreshRequired = refreshTokenError.errorCode === BrowserConstants.INVALID_GRANT_ERROR || refreshTokenError.errorCode === tokenRefreshRequired;
        const isSilentlyResolvable = noInteractionRequired && refreshTokenRefreshRequired || refreshTokenError.errorCode === noTokensFound || refreshTokenError.errorCode === refreshTokenExpired;
        const tryIframeRenewal = iFrameRenewalPolicies.includes(cacheLookupPolicy);
        return isSilentlyResolvable && tryIframeRenewal;
      }
      function isBridgeError(error) {
        return error.status !== void 0;
      }
      var NestedAppAuthAdapter = class {
        constructor(clientId, clientCapabilities, crypto2, logger) {
          this.clientId = clientId;
          this.clientCapabilities = clientCapabilities;
          this.crypto = crypto2;
          this.logger = logger;
        }
        toNaaTokenRequest(request) {
          let extraParams;
          if (request.extraQueryParameters === void 0) {
            extraParams = /* @__PURE__ */ new Map();
          } else {
            extraParams = new Map(Object.entries(request.extraQueryParameters));
          }
          const correlationId = request.correlationId || this.crypto.createNewGuid();
          const claims = addClientCapabilitiesToClaims$1(request.claims, this.clientCapabilities);
          const scopes = request.scopes || OIDC_DEFAULT_SCOPES;
          const tokenRequest = {
            platformBrokerId: request.account?.homeAccountId,
            clientId: this.clientId,
            authority: request.authority,
            scope: scopes.join(" "),
            correlationId,
            claims: !StringUtils.isEmptyObj(claims) ? claims : void 0,
            state: request.state,
            authenticationScheme: request.authenticationScheme || AuthenticationScheme.BEARER,
            extraParameters: extraParams
          };
          return tokenRequest;
        }
        fromNaaTokenResponse(request, response, reqTimestamp) {
          if (!response.token.id_token || !response.token.access_token) {
            throw createClientAuthError(nullOrEmptyToken);
          }
          const expiresOn = toDateFromSeconds(reqTimestamp + (response.token.expires_in || 0));
          const idTokenClaims = extractTokenClaims(response.token.id_token, this.crypto.base64Decode);
          const account2 = this.fromNaaAccountInfo(response.account, response.token.id_token, idTokenClaims);
          const scopes = response.token.scope || request.scope;
          const authenticationResult = {
            authority: response.token.authority || account2.environment,
            uniqueId: account2.localAccountId,
            tenantId: account2.tenantId,
            scopes: scopes.split(" "),
            account: account2,
            idToken: response.token.id_token,
            idTokenClaims,
            accessToken: response.token.access_token,
            fromCache: false,
            expiresOn,
            tokenType: request.authenticationScheme || AuthenticationScheme.BEARER,
            correlationId: request.correlationId,
            extExpiresOn: expiresOn,
            state: request.state
          };
          return authenticationResult;
        }
        /*
         *  export type AccountInfo = {
         *     homeAccountId: string;
         *     environment: string;
         *     tenantId: string;
         *     username: string;
         *     localAccountId: string;
         *     name?: string;
         *     idToken?: string;
         *     idTokenClaims?: TokenClaims & {
         *         [key: string]:
         *             | string
         *             | number
         *             | string[]
         *             | object
         *             | undefined
         *             | unknown;
         *     };
         *     nativeAccountId?: string;
         *     authorityType?: string;
         * };
         */
        fromNaaAccountInfo(fromAccount, idToken, idTokenClaims) {
          const effectiveIdTokenClaims = idTokenClaims || fromAccount.idTokenClaims;
          const localAccountId = fromAccount.localAccountId || effectiveIdTokenClaims?.oid || effectiveIdTokenClaims?.sub || "";
          const tenantId = fromAccount.tenantId || effectiveIdTokenClaims?.tid || "";
          const homeAccountId = fromAccount.homeAccountId || `${localAccountId}.${tenantId}`;
          const username = fromAccount.username || effectiveIdTokenClaims?.preferred_username || "";
          const name2 = fromAccount.name || effectiveIdTokenClaims?.name;
          const loginHint = fromAccount.loginHint || effectiveIdTokenClaims?.login_hint;
          const tenantProfiles = /* @__PURE__ */ new Map();
          const tenantProfile = buildTenantProfile(homeAccountId, localAccountId, tenantId, effectiveIdTokenClaims);
          tenantProfiles.set(tenantId, tenantProfile);
          const account2 = {
            homeAccountId,
            environment: fromAccount.environment,
            tenantId,
            username,
            localAccountId,
            name: name2,
            loginHint,
            idToken,
            idTokenClaims: effectiveIdTokenClaims,
            tenantProfiles
          };
          return account2;
        }
        /**
         *
         * @param error BridgeError
         * @returns AuthError, ClientAuthError, ClientConfigurationError, ServerError, InteractionRequiredError
         */
        fromBridgeError(error) {
          if (isBridgeError(error)) {
            switch (error.status) {
              case BridgeStatusCode.UserCancel:
                return new ClientAuthError(userCanceled);
              case BridgeStatusCode.NoNetwork:
                return new ClientAuthError(noNetworkConnectivity$1);
              case BridgeStatusCode.AccountUnavailable:
                return new ClientAuthError(noAccountFound);
              case BridgeStatusCode.Disabled:
                return new ClientAuthError(nestedAppAuthBridgeDisabled);
              case BridgeStatusCode.NestedAppAuthUnavailable:
                return new ClientAuthError(error.code || nestedAppAuthBridgeDisabled, error.description);
              case BridgeStatusCode.TransientError:
              case BridgeStatusCode.PersistentError:
                return new ServerError(error.code, error.description);
              case BridgeStatusCode.UserInteractionRequired:
                return new InteractionRequiredAuthError(error.code, error.description);
              default:
                return new AuthError(error.code, error.description);
            }
          } else {
            return new AuthError("unknown_error", "An unknown error occurred");
          }
        }
        /**
         * Returns an AuthenticationResult from the given cache items
         *
         * @param account
         * @param idToken
         * @param accessToken
         * @param reqTimestamp
         * @returns
         */
        toAuthenticationResultFromCache(account2, idToken, accessToken, request, correlationId) {
          if (!idToken || !accessToken) {
            throw createClientAuthError(nullOrEmptyToken);
          }
          const idTokenClaims = extractTokenClaims(idToken.secret, this.crypto.base64Decode);
          const scopes = accessToken.target || request.scopes.join(" ");
          const authenticationResult = {
            authority: accessToken.environment || account2.environment,
            uniqueId: account2.localAccountId,
            tenantId: account2.tenantId,
            scopes: scopes.split(" "),
            account: account2,
            idToken: idToken.secret,
            idTokenClaims: idTokenClaims || {},
            accessToken: accessToken.secret,
            fromCache: true,
            expiresOn: toDateFromSeconds(accessToken.expiresOn),
            extExpiresOn: toDateFromSeconds(accessToken.extendedExpiresOn),
            tokenType: request.authenticationScheme || AuthenticationScheme.BEARER,
            correlationId,
            state: request.state
          };
          return authenticationResult;
        }
      };
      var NestedAppAuthErrorMessage = {
        unsupportedMethod: {
          code: "unsupported_method",
          desc: "This method is not supported in nested app environment."
        }
      };
      var NestedAppAuthError = class _NestedAppAuthError extends AuthError {
        constructor(errorCode, errorMessage) {
          super(errorCode, errorMessage);
          Object.setPrototypeOf(this, _NestedAppAuthError.prototype);
          this.name = "NestedAppAuthError";
        }
        static createUnsupportedError() {
          return new _NestedAppAuthError(NestedAppAuthErrorMessage.unsupportedMethod.code, NestedAppAuthErrorMessage.unsupportedMethod.desc);
        }
      };
      var NestedAppAuthController = class _NestedAppAuthController {
        constructor(operatingContext) {
          this.operatingContext = operatingContext;
          const proxy = this.operatingContext.getBridgeProxy();
          if (proxy !== void 0) {
            this.bridgeProxy = proxy;
          } else {
            throw new Error("unexpected: bridgeProxy is undefined");
          }
          this.config = operatingContext.getConfig();
          this.logger = this.operatingContext.getLogger();
          this.performanceClient = this.config.telemetry.client;
          this.browserCrypto = operatingContext.isBrowserEnvironment() ? new CryptoOps(this.logger, this.performanceClient, true) : DEFAULT_CRYPTO_IMPLEMENTATION;
          this.eventHandler = new EventHandler(this.logger);
          this.browserStorage = this.operatingContext.isBrowserEnvironment() ? new BrowserCacheManager(this.config.auth.clientId, this.config.cache, this.browserCrypto, this.logger, this.performanceClient, this.eventHandler, buildStaticAuthorityOptions(this.config.auth)) : DEFAULT_BROWSER_CACHE_MANAGER(this.config.auth.clientId, this.logger, this.performanceClient, this.eventHandler);
          this.nestedAppAuthAdapter = new NestedAppAuthAdapter(this.config.auth.clientId, this.config.auth.clientCapabilities, this.browserCrypto, this.logger);
          const accountContext = this.bridgeProxy.getAccountContext();
          this.currentAccountContext = accountContext ? accountContext : null;
        }
        /**
         * Factory function to create a new instance of NestedAppAuthController
         * @param operatingContext
         * @returns Promise<IController>
         */
        static async createController(operatingContext) {
          const controller = new _NestedAppAuthController(operatingContext);
          return Promise.resolve(controller);
        }
        /**
         * Specific implementation of initialize function for NestedAppAuthController
         * @returns
         */
        async initialize(request, isBroker) {
          const initCorrelationId = request?.correlationId || createNewGuid();
          await this.browserStorage.initialize(initCorrelationId);
          return Promise.resolve();
        }
        /**
         * Validate the incoming request and add correlationId if not present
         * @param request
         * @returns
         */
        ensureValidRequest(request) {
          if (request?.correlationId) {
            return request;
          }
          return {
            ...request,
            correlationId: this.browserCrypto.createNewGuid()
          };
        }
        /**
         * Internal implementation of acquireTokenInteractive flow
         * @param request
         * @returns
         */
        async acquireTokenInteractive(request) {
          const validRequest = this.ensureValidRequest(request);
          this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_START, exports.InteractionType.Popup, validRequest);
          const atPopupMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenPopup, validRequest.correlationId);
          atPopupMeasurement.add({ nestedAppAuthRequest: true });
          try {
            const naaRequest = this.nestedAppAuthAdapter.toNaaTokenRequest(validRequest);
            const reqTimestamp = nowSeconds();
            const response = await this.bridgeProxy.getTokenInteractive(naaRequest);
            const result = {
              ...this.nestedAppAuthAdapter.fromNaaTokenResponse(naaRequest, response, reqTimestamp)
            };
            try {
              await this.hydrateCache(result, request);
            } catch (error) {
              this.logger.warningPii(`Failed to hydrate cache. Error: ${error}`, validRequest.correlationId);
            }
            this.currentAccountContext = {
              homeAccountId: result.account.homeAccountId,
              environment: result.account.environment,
              tenantId: result.account.tenantId
            };
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, exports.InteractionType.Popup, result);
            atPopupMeasurement.add({
              accessTokenSize: result.accessToken.length,
              idTokenSize: result.idToken.length
            });
            atPopupMeasurement.end({
              success: true,
              requestId: result.requestId
            }, void 0, result.account);
            return result;
          } catch (e) {
            const error = e instanceof AuthError ? e : this.nestedAppAuthAdapter.fromBridgeError(e);
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, exports.InteractionType.Popup, null, e);
            atPopupMeasurement.end({
              success: false
            }, e, request.account);
            throw error;
          }
        }
        /**
         * Internal implementation of acquireTokenSilent flow
         * @param request
         * @returns
         */
        async acquireTokenSilentInternal(request) {
          const validRequest = this.ensureValidRequest(request);
          this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_START, exports.InteractionType.Silent, validRequest);
          const result = await this.acquireTokenFromCache(validRequest);
          if (result) {
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, exports.InteractionType.Silent, result);
            return result;
          }
          const ssoSilentMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.SsoSilent, validRequest.correlationId);
          ssoSilentMeasurement.increment({
            visibilityChangeCount: 0
          });
          ssoSilentMeasurement.add({
            nestedAppAuthRequest: true
          });
          try {
            const naaRequest = this.nestedAppAuthAdapter.toNaaTokenRequest(validRequest);
            naaRequest.forceRefresh = validRequest.forceRefresh;
            const reqTimestamp = nowSeconds();
            const response = await this.bridgeProxy.getTokenSilent(naaRequest);
            const result2 = this.nestedAppAuthAdapter.fromNaaTokenResponse(naaRequest, response, reqTimestamp);
            try {
              await this.hydrateCache(result2, request);
            } catch (error) {
              this.logger.warningPii(`Failed to hydrate cache. Error: ${error}`, validRequest.correlationId);
            }
            this.currentAccountContext = {
              homeAccountId: result2.account.homeAccountId,
              environment: result2.account.environment,
              tenantId: result2.account.tenantId
            };
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, exports.InteractionType.Silent, result2);
            ssoSilentMeasurement?.add({
              accessTokenSize: result2.accessToken.length,
              idTokenSize: result2.idToken.length
            });
            ssoSilentMeasurement?.end({
              success: true,
              requestId: result2.requestId
            }, void 0, result2.account);
            return result2;
          } catch (e) {
            const error = e instanceof AuthError ? e : this.nestedAppAuthAdapter.fromBridgeError(e);
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, exports.InteractionType.Silent, null, e);
            ssoSilentMeasurement?.end({
              success: false
            }, e, request.account);
            throw error;
          }
        }
        /**
         * acquires tokens from cache
         * @param request
         * @returns
         */
        async acquireTokenFromCache(request) {
          const atsMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenSilent, request.correlationId);
          atsMeasurement?.add({
            nestedAppAuthRequest: true
          });
          if (request.claims) {
            this.logger.verbose("Claims are present in the request, skipping cache lookup");
            return null;
          }
          if (request.forceRefresh) {
            this.logger.verbose("forceRefresh is set to true, skipping cache lookup");
            return null;
          }
          let result = null;
          if (!request.cacheLookupPolicy) {
            request.cacheLookupPolicy = CacheLookupPolicy.Default;
          }
          switch (request.cacheLookupPolicy) {
            case CacheLookupPolicy.Default:
            case CacheLookupPolicy.AccessToken:
            case CacheLookupPolicy.AccessTokenAndRefreshToken:
              result = await this.acquireTokenFromCacheInternal(request);
              break;
            default:
              return null;
          }
          if (result) {
            this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, exports.InteractionType.Silent, result);
            atsMeasurement.add({
              accessTokenSize: result.accessToken.length,
              idTokenSize: result.idToken.length
            });
            atsMeasurement.end({
              success: true
            }, void 0, result.account);
            return result;
          }
          this.logger.warning("Cached tokens are not found for the account, proceeding with silent token request.");
          this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, exports.InteractionType.Silent, null);
          atsMeasurement.end({
            success: false
          }, void 0, request.account);
          return null;
        }
        /**
         *
         * @param request
         * @returns
         */
        async acquireTokenFromCacheInternal(request) {
          const accountContext = this.bridgeProxy.getAccountContext() || this.currentAccountContext;
          let currentAccount = null;
          const correlationId = request.correlationId || this.browserCrypto.createNewGuid();
          if (accountContext) {
            currentAccount = getAccount(accountContext, this.logger, this.browserStorage, correlationId);
          }
          if (!currentAccount) {
            this.logger.verbose("No active account found, falling back to the host");
            return Promise.resolve(null);
          }
          this.logger.verbose("active account found, attempting to acquire token silently");
          const authRequest = {
            ...request,
            correlationId: request.correlationId || this.browserCrypto.createNewGuid(),
            authority: request.authority || currentAccount.environment,
            scopes: request.scopes?.length ? request.scopes : [...OIDC_DEFAULT_SCOPES]
          };
          const tokenKeys = this.browserStorage.getTokenKeys();
          const cachedAccessToken = this.browserStorage.getAccessToken(currentAccount, authRequest, tokenKeys, currentAccount.tenantId);
          if (!cachedAccessToken) {
            this.logger.verbose("No cached access token found");
            return Promise.resolve(null);
          } else if (wasClockTurnedBack(cachedAccessToken.cachedAt) || isTokenExpired(cachedAccessToken.expiresOn, this.config.system.tokenRenewalOffsetSeconds)) {
            this.logger.verbose("Cached access token has expired");
            return Promise.resolve(null);
          }
          const cachedIdToken = this.browserStorage.getIdToken(currentAccount, authRequest.correlationId, tokenKeys, currentAccount.tenantId, this.performanceClient);
          if (!cachedIdToken) {
            this.logger.verbose("No cached id token found");
            return Promise.resolve(null);
          }
          return this.nestedAppAuthAdapter.toAuthenticationResultFromCache(currentAccount, cachedIdToken, cachedAccessToken, authRequest, authRequest.correlationId);
        }
        /**
         * acquireTokenPopup flow implementation
         * @param request
         * @returns
         */
        async acquireTokenPopup(request) {
          return this.acquireTokenInteractive(request);
        }
        /**
         * acquireTokenRedirect flow is not supported in nested app auth
         * @param request
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        acquireTokenRedirect(request) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        /**
         * acquireTokenSilent flow implementation
         * @param silentRequest
         * @returns
         */
        async acquireTokenSilent(silentRequest) {
          return this.acquireTokenSilentInternal(silentRequest);
        }
        /**
         * Hybrid flow is not currently supported in nested app auth
         * @param request
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        acquireTokenByCode(request) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        /**
         * acquireTokenNative flow is not currently supported in nested app auth
         * @param request
         * @param apiId
         * @param accountId
         */
        acquireTokenNative(request, apiId, accountId) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        /**
         * acquireTokenByRefreshToken flow is not currently supported in nested app auth
         * @param commonRequest
         * @param silentRequest
         */
        acquireTokenByRefreshToken(commonRequest, silentRequest) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        /**
         * Adds event callbacks to array
         * @param callback
         * @param eventTypes
         */
        addEventCallback(callback, eventTypes) {
          return this.eventHandler.addEventCallback(callback, eventTypes);
        }
        /**
         * Removes callback with provided id from callback array
         * @param callbackId
         */
        removeEventCallback(callbackId) {
          this.eventHandler.removeEventCallback(callbackId);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        addPerformanceCallback(callback) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        removePerformanceCallback(callbackId) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        enableAccountStorageEvents() {
          throw NestedAppAuthError.createUnsupportedError();
        }
        disableAccountStorageEvents() {
          throw NestedAppAuthError.createUnsupportedError();
        }
        // #region Account APIs
        /**
         * Returns all the accounts in the cache that match the optional filter. If no filter is provided, all accounts are returned.
         * @param accountFilter - (Optional) filter to narrow down the accounts returned
         * @returns Array of AccountInfo objects in cache
         */
        getAllAccounts(accountFilter) {
          const correlationId = this.browserCrypto.createNewGuid();
          return getAllAccounts(this.logger, this.browserStorage, this.isBrowserEnv(), correlationId, accountFilter);
        }
        /**
         * Returns the first account found in the cache that matches the account filter passed in.
         * @param accountFilter
         * @returns The first account found in the cache matching the provided filter or null if no account could be found.
         */
        getAccount(accountFilter) {
          const correlationId = this.browserCrypto.createNewGuid();
          return getAccount(accountFilter, this.logger, this.browserStorage, correlationId);
        }
        /**
         * Returns the signed in account matching username.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found.
         * This API is provided for convenience but getAccountById should be used for best reliability
         * @param username
         * @returns The account object stored in MSAL
         */
        getAccountByUsername(username) {
          const correlationId = this.browserCrypto.createNewGuid();
          return getAccountByUsername(username, this.logger, this.browserStorage, correlationId);
        }
        /**
         * Returns the signed in account matching homeAccountId.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found
         * @param homeAccountId
         * @returns The account object stored in MSAL
         */
        getAccountByHomeId(homeAccountId) {
          const correlationId = this.browserCrypto.createNewGuid();
          return getAccountByHomeId(homeAccountId, this.logger, this.browserStorage, correlationId);
        }
        /**
         * Returns the signed in account matching localAccountId.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found
         * @param localAccountId
         * @returns The account object stored in MSAL
         */
        getAccountByLocalId(localAccountId) {
          const correlationId = this.browserCrypto.createNewGuid();
          return getAccountByLocalId(localAccountId, this.logger, this.browserStorage, correlationId);
        }
        /**
         * Sets the account to use as the active account. If no account is passed to the acquireToken APIs, then MSAL will use this active account.
         * @param account
         */
        setActiveAccount(account2) {
          const correlationId = this.browserCrypto.createNewGuid();
          return setActiveAccount(account2, this.browserStorage, correlationId);
        }
        /**
         * Gets the currently active account
         */
        getActiveAccount() {
          const correlationId = this.browserCrypto.createNewGuid();
          return getActiveAccount(this.browserStorage, correlationId);
        }
        // #endregion
        handleRedirectPromise(hash) {
          return Promise.resolve(null);
        }
        loginPopup(request) {
          return this.acquireTokenInteractive(request || DEFAULT_REQUEST);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loginRedirect(request) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logout(logoutRequest) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        logoutRedirect(logoutRequest) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        logoutPopup(logoutRequest) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        ssoSilent(request) {
          return this.acquireTokenSilentInternal(request);
        }
        getTokenCache() {
          throw NestedAppAuthError.createUnsupportedError();
        }
        /**
         * Returns the logger instance
         */
        getLogger() {
          return this.logger;
        }
        /**
         * Replaces the default logger set in configurations with new Logger with new configurations
         * @param logger Logger instance
         */
        setLogger(logger) {
          this.logger = logger;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        initializeWrapperLibrary(sku, version2) {
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setNavigationClient(navigationClient) {
          this.logger.warning("setNavigationClient is not supported in nested app auth");
        }
        getConfiguration() {
          return this.config;
        }
        isBrowserEnv() {
          return this.operatingContext.isBrowserEnvironment();
        }
        getBrowserCrypto() {
          return this.browserCrypto;
        }
        getPerformanceClient() {
          throw NestedAppAuthError.createUnsupportedError();
        }
        getRedirectResponse() {
          throw NestedAppAuthError.createUnsupportedError();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async clearCache(logoutRequest) {
          throw NestedAppAuthError.createUnsupportedError();
        }
        async hydrateCache(result, request) {
          this.logger.verbose("hydrateCache called");
          const accountEntity = AccountEntity.createFromAccountInfo(result.account, result.cloudGraphHostName, result.msGraphHost);
          await this.browserStorage.setAccount(accountEntity, result.correlationId);
          return this.browserStorage.hydrateCache(result, request);
        }
      };
      async function createV3Controller(config2, request) {
        const standard = new StandardOperatingContext(config2);
        await standard.initialize();
        return StandardController.createController(standard, request);
      }
      async function createController(config2) {
        const standard = new StandardOperatingContext(config2);
        const nestedApp = new NestedAppOperatingContext(config2);
        const operatingContexts = [standard.initialize(), nestedApp.initialize()];
        await Promise.all(operatingContexts);
        if (nestedApp.isAvailable() && config2.auth.supportsNestedAppAuth) {
          return NestedAppAuthController.createController(nestedApp);
        } else if (standard.isAvailable()) {
          return StandardController.createController(standard);
        } else {
          return null;
        }
      }
      var PublicClientApplication = class _PublicClientApplication {
        /**
         * Creates StandardController and passes it to the PublicClientApplication
         *
         * @param configuration {Configuration}
         */
        static async createPublicClientApplication(configuration) {
          const controller = await createV3Controller(configuration);
          const pca = new _PublicClientApplication(configuration, controller);
          return pca;
        }
        /**
         * @constructor
         * Constructor for the PublicClientApplication used to instantiate the PublicClientApplication object
         *
         * Important attributes in the Configuration object for auth are:
         * - clientID: the application ID of your application. You can obtain one by registering your application with our Application registration portal : https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredAppsPreview
         * - authority: the authority URL for your application.
         * - redirect_uri: the uri of your application registered in the portal.
         *
         * In Azure AD, authority is a URL indicating the Azure active directory that MSAL uses to obtain tokens.
         * It is of the form https://login.microsoftonline.com/{Enter_the_Tenant_Info_Here}
         * If your application supports Accounts in one organizational directory, replace "Enter_the_Tenant_Info_Here" value with the Tenant Id or Tenant name (for example, contoso.microsoft.com).
         * If your application supports Accounts in any organizational directory, replace "Enter_the_Tenant_Info_Here" value with organizations.
         * If your application supports Accounts in any organizational directory and personal Microsoft accounts, replace "Enter_the_Tenant_Info_Here" value with common.
         * To restrict support to Personal Microsoft accounts only, replace "Enter_the_Tenant_Info_Here" value with consumers.
         *
         * In Azure B2C, authority is of the form https://{instance}/tfp/{tenant}/{policyName}/
         * Full B2C functionality will be available in this library in future versions.
         *
         * @param configuration Object for the MSAL PublicClientApplication instance
         * @param IController Optional parameter to explictly set the controller. (Will be removed when we remove public constructor)
         */
        constructor(configuration, controller) {
          this.isBroker = false;
          this.controller = controller || new StandardController(new StandardOperatingContext(configuration));
        }
        /**
         * Initializer function to perform async startup tasks such as connecting to WAM extension
         * @param request {?InitializeApplicationRequest}
         */
        async initialize(request) {
          return this.controller.initialize(request, this.isBroker);
        }
        /**
         * Use when you want to obtain an access_token for your API via opening a popup window in the user's browser
         *
         * @param request
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        async acquireTokenPopup(request) {
          return this.controller.acquireTokenPopup(request);
        }
        /**
         * Use when you want to obtain an access_token for your API by redirecting the user's browser window to the authorization endpoint. This function redirects
         * the page, so any code that follows this function will not execute.
         *
         * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
         * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
         *
         * @param request
         */
        acquireTokenRedirect(request) {
          return this.controller.acquireTokenRedirect(request);
        }
        /**
         * Silently acquire an access token for a given set of scopes. Returns currently processing promise if parallel requests are made.
         *
         * @param {@link (SilentRequest:type)}
         * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthenticationResult} object
         */
        acquireTokenSilent(silentRequest) {
          return this.controller.acquireTokenSilent(silentRequest);
        }
        /**
         * This function redeems an authorization code (passed as code) from the eSTS token endpoint.
         * This authorization code should be acquired server-side using a confidential client to acquire a spa_code.
         * This API is not indended for normal authorization code acquisition and redemption.
         *
         * Redemption of this authorization code will not require PKCE, as it was acquired by a confidential client.
         *
         * @param request {@link AuthorizationCodeRequest}
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        acquireTokenByCode(request) {
          return this.controller.acquireTokenByCode(request);
        }
        /**
         * Adds event callbacks to array
         * @param callback
         * @param eventTypes
         */
        addEventCallback(callback, eventTypes) {
          return this.controller.addEventCallback(callback, eventTypes);
        }
        /**
         * Removes callback with provided id from callback array
         * @param callbackId
         */
        removeEventCallback(callbackId) {
          return this.controller.removeEventCallback(callbackId);
        }
        /**
         * Registers a callback to receive performance events.
         *
         * @param {PerformanceCallbackFunction} callback
         * @returns {string}
         */
        addPerformanceCallback(callback) {
          return this.controller.addPerformanceCallback(callback);
        }
        /**
         * Removes a callback registered with addPerformanceCallback.
         *
         * @param {string} callbackId
         * @returns {boolean}
         */
        removePerformanceCallback(callbackId) {
          return this.controller.removePerformanceCallback(callbackId);
        }
        /**
         * Adds event listener that emits an event when a user account is added or removed from localstorage in a different browser tab or window
         */
        enableAccountStorageEvents() {
          this.controller.enableAccountStorageEvents();
        }
        /**
         * Removes event listener that emits an event when a user account is added or removed from localstorage in a different browser tab or window
         */
        disableAccountStorageEvents() {
          this.controller.disableAccountStorageEvents();
        }
        /**
         * Returns the first account found in the cache that matches the account filter passed in.
         * @param accountFilter
         * @returns The first account found in the cache matching the provided filter or null if no account could be found.
         */
        getAccount(accountFilter) {
          return this.controller.getAccount(accountFilter);
        }
        /**
         * Returns the signed in account matching homeAccountId.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found
         * @param homeAccountId
         * @returns The account object stored in MSAL
         * @deprecated - Use getAccount instead
         */
        getAccountByHomeId(homeAccountId) {
          return this.controller.getAccountByHomeId(homeAccountId);
        }
        /**
         * Returns the signed in account matching localAccountId.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found
         * @param localAccountId
         * @returns The account object stored in MSAL
         * @deprecated - Use getAccount instead
         */
        getAccountByLocalId(localId) {
          return this.controller.getAccountByLocalId(localId);
        }
        /**
         * Returns the signed in account matching username.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found.
         * This API is provided for convenience but getAccountById should be used for best reliability
         * @param userName
         * @returns The account object stored in MSAL
         * @deprecated - Use getAccount instead
         */
        getAccountByUsername(userName) {
          return this.controller.getAccountByUsername(userName);
        }
        /**
         * Returns all the accounts in the cache that match the optional filter. If no filter is provided, all accounts are returned.
         * @param accountFilter - (Optional) filter to narrow down the accounts returned
         * @returns Array of AccountInfo objects in cache
         */
        getAllAccounts(accountFilter) {
          return this.controller.getAllAccounts(accountFilter);
        }
        /**
         * Event handler function which allows users to fire events after the PublicClientApplication object
         * has loaded during redirect flows. This should be invoked on all page loads involved in redirect
         * auth flows.
         * @param hash Hash to process. Defaults to the current value of window.location.hash. Only needs to be provided explicitly if the response to be handled is not contained in the current value.
         * @returns Token response or null. If the return value is null, then no auth redirect was detected.
         */
        handleRedirectPromise(hash) {
          return this.controller.handleRedirectPromise(hash);
        }
        /**
         * Use when initiating the login process via opening a popup window in the user's browser
         *
         * @param request
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        loginPopup(request) {
          return this.controller.loginPopup(request);
        }
        /**
         * Use when initiating the login process by redirecting the user's browser to the authorization endpoint. This function redirects the page, so
         * any code that follows this function will not execute.
         *
         * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
         * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
         *
         * @param request
         */
        loginRedirect(request) {
          return this.controller.loginRedirect(request);
        }
        /**
         * Deprecated logout function. Use logoutRedirect or logoutPopup instead
         * @param logoutRequest
         * @deprecated
         */
        logout(logoutRequest) {
          return this.controller.logout(logoutRequest);
        }
        /**
         * Use to log out the current user, and redirect the user to the postLogoutRedirectUri.
         * Default behaviour is to redirect the user to `window.location.href`.
         * @param logoutRequest
         */
        logoutRedirect(logoutRequest) {
          return this.controller.logoutRedirect(logoutRequest);
        }
        /**
         * Clears local cache for the current user then opens a popup window prompting the user to sign-out of the server
         * @param logoutRequest
         */
        logoutPopup(logoutRequest) {
          return this.controller.logoutPopup(logoutRequest);
        }
        /**
         * This function uses a hidden iframe to fetch an authorization code from the eSTS. There are cases where this may not work:
         * - Any browser using a form of Intelligent Tracking Prevention
         * - If there is not an established session with the service
         *
         * In these cases, the request must be done inside a popup or full frame redirect.
         *
         * For the cases where interaction is required, you cannot send a request with prompt=none.
         *
         * If your refresh token has expired, you can use this function to fetch a new set of tokens silently as long as
         * you session on the server still exists.
         * @param request {@link SsoSilentRequest}
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        ssoSilent(request) {
          return this.controller.ssoSilent(request);
        }
        /**
         * Gets the token cache for the application.
         */
        getTokenCache() {
          return this.controller.getTokenCache();
        }
        /**
         * Returns the logger instance
         */
        getLogger() {
          return this.controller.getLogger();
        }
        /**
         * Replaces the default logger set in configurations with new Logger with new configurations
         * @param logger Logger instance
         */
        setLogger(logger) {
          this.controller.setLogger(logger);
        }
        /**
         * Sets the account to use as the active account. If no account is passed to the acquireToken APIs, then MSAL will use this active account.
         * @param account
         */
        setActiveAccount(account2) {
          this.controller.setActiveAccount(account2);
        }
        /**
         * Gets the currently active account
         */
        getActiveAccount() {
          return this.controller.getActiveAccount();
        }
        /**
         * Called by wrapper libraries (Angular & React) to set SKU and Version passed down to telemetry, logger, etc.
         * @param sku
         * @param version
         */
        initializeWrapperLibrary(sku, version2) {
          return this.controller.initializeWrapperLibrary(sku, version2);
        }
        /**
         * Sets navigation client
         * @param navigationClient
         */
        setNavigationClient(navigationClient) {
          this.controller.setNavigationClient(navigationClient);
        }
        /**
         * Returns the configuration object
         * @internal
         */
        getConfiguration() {
          return this.controller.getConfiguration();
        }
        /**
         * Hydrates cache with the tokens and account in the AuthenticationResult object
         * @param result
         * @param request - The request object that was used to obtain the AuthenticationResult
         * @returns
         */
        async hydrateCache(result, request) {
          return this.controller.hydrateCache(result, request);
        }
        /**
         * Clears tokens and account from the browser cache.
         * @param logoutRequest
         */
        clearCache(logoutRequest) {
          return this.controller.clearCache(logoutRequest);
        }
      };
      async function createNestablePublicClientApplication(configuration) {
        const nestedAppAuth = new NestedAppOperatingContext(configuration);
        await nestedAppAuth.initialize();
        if (nestedAppAuth.isAvailable()) {
          const controller = new NestedAppAuthController(nestedAppAuth);
          const nestablePCA = new PublicClientApplication(configuration, controller);
          await nestablePCA.initialize();
          return nestablePCA;
        }
        return createStandardPublicClientApplication(configuration);
      }
      async function createStandardPublicClientApplication(configuration) {
        const pca = new PublicClientApplication(configuration);
        await pca.initialize();
        return pca;
      }
      var UnknownOperatingContextController = class {
        constructor(operatingContext) {
          this.initialized = false;
          this.operatingContext = operatingContext;
          this.isBrowserEnvironment = this.operatingContext.isBrowserEnvironment();
          this.config = operatingContext.getConfig();
          this.logger = operatingContext.getLogger();
          this.performanceClient = this.config.telemetry.client;
          this.browserCrypto = this.isBrowserEnvironment ? new CryptoOps(this.logger, this.performanceClient) : DEFAULT_CRYPTO_IMPLEMENTATION;
          this.eventHandler = new EventHandler(this.logger);
          this.browserStorage = this.isBrowserEnvironment ? new BrowserCacheManager(this.config.auth.clientId, this.config.cache, this.browserCrypto, this.logger, this.performanceClient, this.eventHandler, void 0) : DEFAULT_BROWSER_CACHE_MANAGER(this.config.auth.clientId, this.logger, this.performanceClient, this.eventHandler);
        }
        getBrowserStorage() {
          return this.browserStorage;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getAccount(accountFilter) {
          return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getAccountByHomeId(homeAccountId) {
          return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getAccountByLocalId(localAccountId) {
          return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getAccountByUsername(username) {
          return null;
        }
        getAllAccounts() {
          return [];
        }
        initialize() {
          this.initialized = true;
          return Promise.resolve();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        acquireTokenPopup(request) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        acquireTokenRedirect(request) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return Promise.resolve();
        }
        acquireTokenSilent(silentRequest) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        acquireTokenByCode(request) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        acquireTokenNative(request, apiId, accountId) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        acquireTokenByRefreshToken(commonRequest, silentRequest) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        addEventCallback(callback, eventTypes) {
          return null;
        }
        removeEventCallback(callbackId) {
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        addPerformanceCallback(callback) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return "";
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        removePerformanceCallback(callbackId) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return true;
        }
        enableAccountStorageEvents() {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
        }
        disableAccountStorageEvents() {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
        }
        handleRedirectPromise(hash) {
          blockAPICallsBeforeInitialize(this.initialized);
          return Promise.resolve(null);
        }
        loginPopup(request) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loginRedirect(request) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logout(logoutRequest) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        logoutRedirect(logoutRequest) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        logoutPopup(logoutRequest) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        ssoSilent(request) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        getTokenCache() {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        getLogger() {
          return this.logger;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setLogger(logger) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setActiveAccount(account2) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
        }
        getActiveAccount() {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        initializeWrapperLibrary(sku, version2) {
          this.browserStorage.setWrapperMetadata(sku, version2);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setNavigationClient(navigationClient) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
        }
        getConfiguration() {
          return this.config;
        }
        isBrowserEnv() {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return true;
        }
        getBrowserCrypto() {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        getPerformanceClient() {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        getRedirectResponse() {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
          return {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async clearCache(logoutRequest) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async hydrateCache(result, request) {
          blockAPICallsBeforeInitialize(this.initialized);
          blockNonBrowserEnvironment();
        }
      };
      var UnknownOperatingContext = class _UnknownOperatingContext extends BaseOperatingContext {
        /**
         * Returns the unique identifier for this operating context
         * @returns string
         */
        getId() {
          return _UnknownOperatingContext.ID;
        }
        /**
         * Return the module name.  Intended for use with import() to enable dynamic import
         * of the implementation associated with this operating context
         * @returns
         */
        getModuleName() {
          return _UnknownOperatingContext.MODULE_NAME;
        }
        /**
         * Checks whether the operating context is available.
         * Confirms that the code is running a browser rather.  This is required.
         * @returns Promise<boolean> indicating whether this operating context is currently available.
         */
        async initialize() {
          return true;
        }
      };
      UnknownOperatingContext.MODULE_NAME = "";
      UnknownOperatingContext.ID = "UnknownOperatingContext";
      var PublicClientNext = class _PublicClientNext {
        static async createPublicClientApplication(configuration) {
          const controller = await createController(configuration);
          let pca;
          if (controller !== null) {
            pca = new _PublicClientNext(configuration, controller);
          } else {
            pca = new _PublicClientNext(configuration);
          }
          return pca;
        }
        /**
         * @constructor
         * Constructor for the PublicClientNext used to instantiate the PublicClientNext object
         *
         * Important attributes in the Configuration object for auth are:
         * - clientID: the application ID of your application. You can obtain one by registering your application with our Application registration portal : https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredAppsPreview
         * - authority: the authority URL for your application.
         * - redirect_uri: the uri of your application registered in the portal.
         *
         * In Azure AD, authority is a URL indicating the Azure active directory that MSAL uses to obtain tokens.
         * It is of the form https://login.microsoftonline.com/{Enter_the_Tenant_Info_Here}
         * If your application supports Accounts in one organizational directory, replace "Enter_the_Tenant_Info_Here" value with the Tenant Id or Tenant name (for example, contoso.microsoft.com).
         * If your application supports Accounts in any organizational directory, replace "Enter_the_Tenant_Info_Here" value with organizations.
         * If your application supports Accounts in any organizational directory and personal Microsoft accounts, replace "Enter_the_Tenant_Info_Here" value with common.
         * To restrict support to Personal Microsoft accounts only, replace "Enter_the_Tenant_Info_Here" value with consumers.
         *
         * In Azure B2C, authority is of the form https://{instance}/tfp/{tenant}/{policyName}/
         * Full B2C functionality will be available in this library in future versions.
         *
         * @param configuration Object for the MSAL PublicClientApplication instance
         * @param IController Optional parameter to explictly set the controller. (Will be removed when we remove public constructor)
         */
        constructor(configuration, controller) {
          this.configuration = configuration;
          if (controller) {
            this.controller = controller;
          } else {
            const operatingContext = new UnknownOperatingContext(configuration);
            this.controller = new UnknownOperatingContextController(operatingContext);
          }
        }
        /**
         * Initializer function to perform async startup tasks such as connecting to WAM extension
         */
        async initialize() {
          if (this.controller instanceof UnknownOperatingContextController) {
            const result = await createController(this.configuration);
            if (result !== null) {
              this.controller = result;
            }
            return this.controller.initialize();
          }
          return Promise.resolve();
        }
        /**
         * Use when you want to obtain an access_token for your API via opening a popup window in the user's browser
         *
         * @param request
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        async acquireTokenPopup(request) {
          return this.controller.acquireTokenPopup(request);
        }
        /**
         * Use when you want to obtain an access_token for your API by redirecting the user's browser window to the authorization endpoint. This function redirects
         * the page, so any code that follows this function will not execute.
         *
         * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
         * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
         *
         * @param request
         */
        acquireTokenRedirect(request) {
          return this.controller.acquireTokenRedirect(request);
        }
        /**
         * Silently acquire an access token for a given set of scopes. Returns currently processing promise if parallel requests are made.
         *
         * @param {@link (SilentRequest:type)}
         * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthenticationResult} object
         */
        acquireTokenSilent(silentRequest) {
          return this.controller.acquireTokenSilent(silentRequest);
        }
        /**
         * This function redeems an authorization code (passed as code) from the eSTS token endpoint.
         * This authorization code should be acquired server-side using a confidential client to acquire a spa_code.
         * This API is not indended for normal authorization code acquisition and redemption.
         *
         * Redemption of this authorization code will not require PKCE, as it was acquired by a confidential client.
         *
         * @param request {@link AuthorizationCodeRequest}
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        acquireTokenByCode(request) {
          return this.controller.acquireTokenByCode(request);
        }
        /**
         * Adds event callbacks to array
         * @param callback
         */
        addEventCallback(callback, eventTypes) {
          return this.controller.addEventCallback(callback, eventTypes);
        }
        /**
         * Removes callback with provided id from callback array
         * @param callbackId
         */
        removeEventCallback(callbackId) {
          return this.controller.removeEventCallback(callbackId);
        }
        /**
         * Registers a callback to receive performance events.
         *
         * @param {PerformanceCallbackFunction} callback
         * @returns {string}
         */
        addPerformanceCallback(callback) {
          return this.controller.addPerformanceCallback(callback);
        }
        /**
         * Removes a callback registered with addPerformanceCallback.
         *
         * @param {string} callbackId
         * @returns {boolean}
         */
        removePerformanceCallback(callbackId) {
          return this.controller.removePerformanceCallback(callbackId);
        }
        /**
         * Adds event listener that emits an event when a user account is added or removed from localstorage in a different browser tab or window
         */
        enableAccountStorageEvents() {
          this.controller.enableAccountStorageEvents();
        }
        /**
         * Removes event listener that emits an event when a user account is added or removed from localstorage in a different browser tab or window
         */
        disableAccountStorageEvents() {
          this.controller.disableAccountStorageEvents();
        }
        /**
         * Returns the first account found in the cache that matches the account filter passed in.
         * @param accountFilter
         * @returns The first account found in the cache matching the provided filter or null if no account could be found.
         */
        getAccount(accountFilter) {
          return this.controller.getAccount(accountFilter);
        }
        /**
         * Returns the signed in account matching homeAccountId.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found
         * @param homeAccountId
         * @returns The account object stored in MSAL
         * @deprecated - Use getAccount instead
         */
        getAccountByHomeId(homeAccountId) {
          return this.controller.getAccountByHomeId(homeAccountId);
        }
        /**
         * Returns the signed in account matching localAccountId.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found
         * @param localAccountId
         * @returns The account object stored in MSAL
         * @deprecated - Use getAccount instead
         */
        getAccountByLocalId(localId) {
          return this.controller.getAccountByLocalId(localId);
        }
        /**
         * Returns the signed in account matching username.
         * (the account object is created at the time of successful login)
         * or null when no matching account is found.
         * This API is provided for convenience but getAccountById should be used for best reliability
         * @param userName
         * @returns The account object stored in MSAL
         * @deprecated - Use getAccount instead
         */
        getAccountByUsername(userName) {
          return this.controller.getAccountByUsername(userName);
        }
        /**
         * Returns all the accounts in the cache that match the optional filter. If no filter is provided, all accounts are returned.
         * @param accountFilter - (Optional) filter to narrow down the accounts returned
         * @returns Array of AccountInfo objects in cache
         */
        getAllAccounts(accountFilter) {
          return this.controller.getAllAccounts(accountFilter);
        }
        /**
         * Event handler function which allows users to fire events after the PublicClientApplication object
         * has loaded during redirect flows. This should be invoked on all page loads involved in redirect
         * auth flows.
         * @param hash Hash to process. Defaults to the current value of window.location.hash. Only needs to be provided explicitly if the response to be handled is not contained in the current value.
         * @returns Token response or null. If the return value is null, then no auth redirect was detected.
         */
        handleRedirectPromise(hash) {
          return this.controller.handleRedirectPromise(hash);
        }
        /**
         * Use when initiating the login process via opening a popup window in the user's browser
         *
         * @param request
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        loginPopup(request) {
          return this.controller.loginPopup(request);
        }
        /**
         * Use when initiating the login process by redirecting the user's browser to the authorization endpoint. This function redirects the page, so
         * any code that follows this function will not execute.
         *
         * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
         * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
         *
         * @param request
         */
        loginRedirect(request) {
          return this.controller.loginRedirect(request);
        }
        /**
         * Deprecated logout function. Use logoutRedirect or logoutPopup instead
         * @param logoutRequest
         * @deprecated
         */
        logout(logoutRequest) {
          return this.controller.logout(logoutRequest);
        }
        /**
         * Use to log out the current user, and redirect the user to the postLogoutRedirectUri.
         * Default behaviour is to redirect the user to `window.location.href`.
         * @param logoutRequest
         */
        logoutRedirect(logoutRequest) {
          return this.controller.logoutRedirect(logoutRequest);
        }
        /**
         * Clears local cache for the current user then opens a popup window prompting the user to sign-out of the server
         * @param logoutRequest
         */
        logoutPopup(logoutRequest) {
          return this.controller.logoutPopup(logoutRequest);
        }
        /**
         * This function uses a hidden iframe to fetch an authorization code from the eSTS. There are cases where this may not work:
         * - Any browser using a form of Intelligent Tracking Prevention
         * - If there is not an established session with the service
         *
         * In these cases, the request must be done inside a popup or full frame redirect.
         *
         * For the cases where interaction is required, you cannot send a request with prompt=none.
         *
         * If your refresh token has expired, you can use this function to fetch a new set of tokens silently as long as
         * you session on the server still exists.
         * @param request {@link SsoSilentRequest}
         *
         * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
         */
        ssoSilent(request) {
          return this.controller.ssoSilent(request);
        }
        /**
         * Gets the token cache for the application.
         */
        getTokenCache() {
          return this.controller.getTokenCache();
        }
        /**
         * Returns the logger instance
         */
        getLogger() {
          return this.controller.getLogger();
        }
        /**
         * Replaces the default logger set in configurations with new Logger with new configurations
         * @param logger Logger instance
         */
        setLogger(logger) {
          this.controller.setLogger(logger);
        }
        /**
         * Sets the account to use as the active account. If no account is passed to the acquireToken APIs, then MSAL will use this active account.
         * @param account
         */
        setActiveAccount(account2) {
          this.controller.setActiveAccount(account2);
        }
        /**
         * Gets the currently active account
         */
        getActiveAccount() {
          return this.controller.getActiveAccount();
        }
        /**
         * Called by wrapper libraries (Angular & React) to set SKU and Version passed down to telemetry, logger, etc.
         * @param sku
         * @param version
         */
        initializeWrapperLibrary(sku, version2) {
          return this.controller.initializeWrapperLibrary(sku, version2);
        }
        /**
         * Sets navigation client
         * @param navigationClient
         */
        setNavigationClient(navigationClient) {
          this.controller.setNavigationClient(navigationClient);
        }
        /**
         * Returns the configuration object
         * @internal
         */
        getConfiguration() {
          return this.controller.getConfiguration();
        }
        /**
         * Hydrates cache with the tokens and account in the AuthenticationResult object
         * @param result
         * @param request - The request object that was used to obtain the AuthenticationResult
         * @returns
         */
        async hydrateCache(result, request) {
          return this.controller.hydrateCache(result, request);
        }
        /**
         * Clears tokens and account from the browser cache.
         * @param logoutRequest
         */
        clearCache(logoutRequest) {
          return this.controller.clearCache(logoutRequest);
        }
      };
      var stubbedPublicClientApplication = {
        initialize: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        acquireTokenPopup: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        acquireTokenRedirect: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        acquireTokenSilent: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        acquireTokenByCode: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        getAllAccounts: () => {
          return [];
        },
        getAccount: () => {
          return null;
        },
        getAccountByHomeId: () => {
          return null;
        },
        getAccountByUsername: () => {
          return null;
        },
        getAccountByLocalId: () => {
          return null;
        },
        handleRedirectPromise: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        loginPopup: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        loginRedirect: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        logout: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        logoutRedirect: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        logoutPopup: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        ssoSilent: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        addEventCallback: () => {
          return null;
        },
        removeEventCallback: () => {
          return;
        },
        addPerformanceCallback: () => {
          return "";
        },
        removePerformanceCallback: () => {
          return false;
        },
        enableAccountStorageEvents: () => {
          return;
        },
        disableAccountStorageEvents: () => {
          return;
        },
        getTokenCache: () => {
          throw createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled);
        },
        getLogger: () => {
          throw createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled);
        },
        setLogger: () => {
          return;
        },
        setActiveAccount: () => {
          return;
        },
        getActiveAccount: () => {
          return null;
        },
        initializeWrapperLibrary: () => {
          return;
        },
        setNavigationClient: () => {
          return;
        },
        getConfiguration: () => {
          throw createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled);
        },
        hydrateCache: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        },
        clearCache: () => {
          return Promise.reject(createBrowserConfigurationAuthError(stubbedPublicClientApplicationCalled));
        }
      };
      var EventMessageUtils = class {
        /**
         * Gets interaction status from event message
         * @param message
         * @param currentStatus
         */
        static getInteractionStatusFromEvent(message, currentStatus) {
          switch (message.eventType) {
            case EventType.LOGIN_START:
              return InteractionStatus.Login;
            case EventType.SSO_SILENT_START:
              return InteractionStatus.SsoSilent;
            case EventType.ACQUIRE_TOKEN_START:
              if (message.interactionType === exports.InteractionType.Redirect || message.interactionType === exports.InteractionType.Popup) {
                return InteractionStatus.AcquireToken;
              }
              break;
            case EventType.HANDLE_REDIRECT_START:
              return InteractionStatus.HandleRedirect;
            case EventType.LOGOUT_START:
              return InteractionStatus.Logout;
            case EventType.SSO_SILENT_SUCCESS:
            case EventType.SSO_SILENT_FAILURE:
              if (currentStatus && currentStatus !== InteractionStatus.SsoSilent) {
                break;
              }
              return InteractionStatus.None;
            case EventType.LOGOUT_END:
              if (currentStatus && currentStatus !== InteractionStatus.Logout) {
                break;
              }
              return InteractionStatus.None;
            case EventType.HANDLE_REDIRECT_END:
              if (currentStatus && currentStatus !== InteractionStatus.HandleRedirect) {
                break;
              }
              return InteractionStatus.None;
            case EventType.LOGIN_SUCCESS:
            case EventType.LOGIN_FAILURE:
            case EventType.ACQUIRE_TOKEN_SUCCESS:
            case EventType.ACQUIRE_TOKEN_FAILURE:
            case EventType.RESTORE_FROM_BFCACHE:
              if (message.interactionType === exports.InteractionType.Redirect || message.interactionType === exports.InteractionType.Popup) {
                if (currentStatus && currentStatus !== InteractionStatus.Login && currentStatus !== InteractionStatus.AcquireToken) {
                  break;
                }
                return InteractionStatus.None;
              }
              break;
          }
          return null;
        }
      };
      var SignedHttpRequest = class {
        constructor(shrParameters, shrOptions) {
          const loggerOptions = shrOptions && shrOptions.loggerOptions || {};
          this.logger = new Logger(loggerOptions, name, version);
          this.cryptoOps = new CryptoOps(this.logger);
          this.popTokenGenerator = new PopTokenGenerator(this.cryptoOps);
          this.shrParameters = shrParameters;
        }
        /**
         * Generates and caches a keypair for the given request options.
         * @returns Public key digest, which should be sent to the token issuer.
         */
        async generatePublicKeyThumbprint() {
          const { kid } = await this.popTokenGenerator.generateKid(this.shrParameters);
          return kid;
        }
        /**
         * Generates a signed http request for the given payload with the given key.
         * @param payload Payload to sign (e.g. access token)
         * @param publicKeyThumbprint Public key digest (from generatePublicKeyThumbprint API)
         * @param claims Additional claims to include/override in the signed JWT
         * @returns Pop token signed with the corresponding private key
         */
        async signRequest(payload, publicKeyThumbprint, claims) {
          return this.popTokenGenerator.signPayload(payload, publicKeyThumbprint, this.shrParameters, claims);
        }
        /**
         * Removes cached keys from browser for given public key thumbprint
         * @param publicKeyThumbprint Public key digest (from generatePublicKeyThumbprint API)
         * @returns If keys are properly deleted
         */
        async removeKeys(publicKeyThumbprint) {
          return this.cryptoOps.removeTokenBindingKey(publicKeyThumbprint).then(() => true).catch((error) => {
            if (error instanceof ClientAuthError && error.errorCode === bindingKeyNotRemoved) {
              return false;
            }
            throw error;
          });
        }
      };
      function getPerfMeasurementModule() {
        let sessionStorage;
        try {
          sessionStorage = window[BrowserCacheLocation.SessionStorage];
          const perfEnabled = sessionStorage?.getItem(BROWSER_PERF_ENABLED_KEY);
          if (Number(perfEnabled) === 1) {
            return Promise.resolve().then(function() {
              return BrowserPerformanceMeasurement$1;
            });
          }
        } catch (e) {
        }
        return void 0;
      }
      function supportsBrowserPerformanceNow() {
        return typeof window !== "undefined" && typeof window.performance !== "undefined" && typeof window.performance.now === "function";
      }
      function getPerfDurationMs(startTime) {
        if (!startTime || !supportsBrowserPerformanceNow()) {
          return void 0;
        }
        return Math.round(window.performance.now() - startTime);
      }
      var BrowserPerformanceClient = class extends PerformanceClient {
        constructor(configuration, intFields, abbreviations) {
          super(configuration.auth.clientId, configuration.auth.authority || `${Constants.DEFAULT_AUTHORITY}`, new Logger(configuration.system?.loggerOptions || {}, name, version), name, version, configuration.telemetry?.application || {
            appName: "",
            appVersion: ""
          }, intFields, abbreviations);
        }
        generateId() {
          return createNewGuid();
        }
        getPageVisibility() {
          return document.visibilityState?.toString() || null;
        }
        deleteIncompleteSubMeasurements(inProgressEvent) {
          void getPerfMeasurementModule()?.then((module2) => {
            const rootEvent = this.eventsByCorrelationId.get(inProgressEvent.event.correlationId);
            const isRootEvent = rootEvent && rootEvent.eventId === inProgressEvent.event.eventId;
            const incompleteMeasurements = [];
            if (isRootEvent && rootEvent?.incompleteSubMeasurements) {
              rootEvent.incompleteSubMeasurements.forEach((subMeasurement) => {
                incompleteMeasurements.push({ ...subMeasurement });
              });
            }
            module2.BrowserPerformanceMeasurement.flushMeasurements(inProgressEvent.event.correlationId, incompleteMeasurements);
          });
        }
        /**
         * Starts measuring performance for a given operation. Returns a function that should be used to end the measurement.
         * Also captures browser page visibilityState.
         *
         * @param {PerformanceEvents} measureName
         * @param {?string} [correlationId]
         * @returns {((event?: Partial<PerformanceEvent>) => PerformanceEvent| null)}
         */
        startMeasurement(measureName, correlationId) {
          const startPageVisibility = this.getPageVisibility();
          const inProgressEvent = super.startMeasurement(measureName, correlationId);
          const startTime = supportsBrowserPerformanceNow() ? window.performance.now() : void 0;
          const browserMeasurement = getPerfMeasurementModule()?.then((module2) => {
            return new module2.BrowserPerformanceMeasurement(measureName, inProgressEvent.event.correlationId);
          });
          void browserMeasurement?.then((measurement) => measurement.startMeasurement());
          return {
            ...inProgressEvent,
            end: (event, error, account2) => {
              const res = inProgressEvent.end({
                ...event,
                startPageVisibility,
                endPageVisibility: this.getPageVisibility(),
                durationMs: getPerfDurationMs(startTime)
              }, error, account2);
              void browserMeasurement?.then((measurement) => measurement.endMeasurement());
              this.deleteIncompleteSubMeasurements(inProgressEvent);
              return res;
            },
            discard: () => {
              inProgressEvent.discard();
              void browserMeasurement?.then((measurement) => measurement.flushMeasurement());
              this.deleteIncompleteSubMeasurements(inProgressEvent);
            }
          };
        }
        /**
         * Adds pre-queue time to preQueueTimeByCorrelationId map.
         * @param {PerformanceEvents} eventName
         * @param {?string} correlationId
         * @returns
         */
        setPreQueueTime(eventName, correlationId) {
          if (!supportsBrowserPerformanceNow()) {
            this.logger.trace(`BrowserPerformanceClient: window performance API not available, unable to set telemetry queue time for ${eventName}`);
            return;
          }
          if (!correlationId) {
            this.logger.trace(`BrowserPerformanceClient: correlationId for ${eventName} not provided, unable to set telemetry queue time`);
            return;
          }
          const preQueueEvent = this.preQueueTimeByCorrelationId.get(correlationId);
          if (preQueueEvent) {
            this.logger.trace(`BrowserPerformanceClient: Incomplete pre-queue ${preQueueEvent.name} found`, correlationId);
            this.addQueueMeasurement(preQueueEvent.name, correlationId, void 0, true);
          }
          this.preQueueTimeByCorrelationId.set(correlationId, {
            name: eventName,
            time: window.performance.now()
          });
        }
        /**
         * Calculates and adds queue time measurement for given performance event.
         *
         * @param {PerformanceEvents} eventName
         * @param {?string} correlationId
         * @param {?number} queueTime
         * @param {?boolean} manuallyCompleted - indicator for manually completed queue measurements
         * @returns
         */
        addQueueMeasurement(eventName, correlationId, queueTime, manuallyCompleted) {
          if (!supportsBrowserPerformanceNow()) {
            this.logger.trace(`BrowserPerformanceClient: window performance API not available, unable to add queue measurement for ${eventName}`);
            return;
          }
          if (!correlationId) {
            this.logger.trace(`BrowserPerformanceClient: correlationId for ${eventName} not provided, unable to add queue measurement`);
            return;
          }
          const preQueueTime = super.getPreQueueTime(eventName, correlationId);
          if (!preQueueTime) {
            return;
          }
          const currentTime = window.performance.now();
          const resQueueTime = queueTime || super.calculateQueuedTime(preQueueTime, currentTime);
          return super.addQueueMeasurement(eventName, correlationId, resQueueTime, manuallyCompleted);
        }
      };
      var BrowserPerformanceMeasurement = class _BrowserPerformanceMeasurement {
        constructor(name2, correlationId) {
          this.correlationId = correlationId;
          this.measureName = _BrowserPerformanceMeasurement.makeMeasureName(name2, correlationId);
          this.startMark = _BrowserPerformanceMeasurement.makeStartMark(name2, correlationId);
          this.endMark = _BrowserPerformanceMeasurement.makeEndMark(name2, correlationId);
        }
        static makeMeasureName(name2, correlationId) {
          return `msal.measure.${name2}.${correlationId}`;
        }
        static makeStartMark(name2, correlationId) {
          return `msal.start.${name2}.${correlationId}`;
        }
        static makeEndMark(name2, correlationId) {
          return `msal.end.${name2}.${correlationId}`;
        }
        static supportsBrowserPerformance() {
          return typeof window !== "undefined" && typeof window.performance !== "undefined" && typeof window.performance.mark === "function" && typeof window.performance.measure === "function" && typeof window.performance.clearMarks === "function" && typeof window.performance.clearMeasures === "function" && typeof window.performance.getEntriesByName === "function";
        }
        /**
         * Flush browser marks and measurements.
         * @param {string} correlationId
         * @param {SubMeasurement} measurements
         */
        static flushMeasurements(correlationId, measurements) {
          if (_BrowserPerformanceMeasurement.supportsBrowserPerformance()) {
            try {
              measurements.forEach((measurement) => {
                const measureName = _BrowserPerformanceMeasurement.makeMeasureName(measurement.name, correlationId);
                const entriesForMeasurement = window.performance.getEntriesByName(measureName, "measure");
                if (entriesForMeasurement.length > 0) {
                  window.performance.clearMeasures(measureName);
                  window.performance.clearMarks(_BrowserPerformanceMeasurement.makeStartMark(measureName, correlationId));
                  window.performance.clearMarks(_BrowserPerformanceMeasurement.makeEndMark(measureName, correlationId));
                }
              });
            } catch (e) {
            }
          }
        }
        startMeasurement() {
          if (_BrowserPerformanceMeasurement.supportsBrowserPerformance()) {
            try {
              window.performance.mark(this.startMark);
            } catch (e) {
            }
          }
        }
        endMeasurement() {
          if (_BrowserPerformanceMeasurement.supportsBrowserPerformance()) {
            try {
              window.performance.mark(this.endMark);
              window.performance.measure(this.measureName, this.startMark, this.endMark);
            } catch (e) {
            }
          }
        }
        flushMeasurement() {
          if (_BrowserPerformanceMeasurement.supportsBrowserPerformance()) {
            try {
              const entriesForMeasurement = window.performance.getEntriesByName(this.measureName, "measure");
              if (entriesForMeasurement.length > 0) {
                const durationMs = entriesForMeasurement[0].duration;
                window.performance.clearMeasures(this.measureName);
                window.performance.clearMarks(this.startMark);
                window.performance.clearMarks(this.endMark);
                return durationMs;
              }
            } catch (e) {
            }
          }
          return null;
        }
      };
      var BrowserPerformanceMeasurement$1 = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        BrowserPerformanceMeasurement
      });
      exports.AccountEntity = AccountEntity;
      exports.ApiId = ApiId;
      exports.AuthError = AuthError;
      exports.AuthErrorCodes = AuthErrorCodes;
      exports.AuthErrorMessage = AuthErrorMessage;
      exports.AuthenticationHeaderParser = AuthenticationHeaderParser;
      exports.AuthenticationScheme = AuthenticationScheme;
      exports.AzureCloudInstance = AzureCloudInstance;
      exports.BrowserAuthError = BrowserAuthError;
      exports.BrowserAuthErrorCodes = BrowserAuthErrorCodes;
      exports.BrowserAuthErrorMessage = BrowserAuthErrorMessage;
      exports.BrowserCacheLocation = BrowserCacheLocation;
      exports.BrowserConfigurationAuthError = BrowserConfigurationAuthError;
      exports.BrowserConfigurationAuthErrorCodes = BrowserConfigurationAuthErrorCodes;
      exports.BrowserConfigurationAuthErrorMessage = BrowserConfigurationAuthErrorMessage;
      exports.BrowserPerformanceClient = BrowserPerformanceClient;
      exports.BrowserPerformanceMeasurement = BrowserPerformanceMeasurement;
      exports.BrowserUtils = BrowserUtils;
      exports.CacheLookupPolicy = CacheLookupPolicy;
      exports.ClientAuthError = ClientAuthError;
      exports.ClientAuthErrorCodes = ClientAuthErrorCodes;
      exports.ClientAuthErrorMessage = ClientAuthErrorMessage;
      exports.ClientConfigurationError = ClientConfigurationError;
      exports.ClientConfigurationErrorCodes = ClientConfigurationErrorCodes;
      exports.ClientConfigurationErrorMessage = ClientConfigurationErrorMessage;
      exports.DEFAULT_IFRAME_TIMEOUT_MS = DEFAULT_IFRAME_TIMEOUT_MS;
      exports.EventHandler = EventHandler;
      exports.EventMessageUtils = EventMessageUtils;
      exports.EventType = EventType;
      exports.InteractionRequiredAuthError = InteractionRequiredAuthError;
      exports.InteractionRequiredAuthErrorCodes = InteractionRequiredAuthErrorCodes;
      exports.InteractionRequiredAuthErrorMessage = InteractionRequiredAuthErrorMessage;
      exports.InteractionStatus = InteractionStatus;
      exports.JsonWebTokenTypes = JsonWebTokenTypes;
      exports.LocalStorage = LocalStorage;
      exports.Logger = Logger;
      exports.MemoryStorage = MemoryStorage;
      exports.NavigationClient = NavigationClient;
      exports.OIDC_DEFAULT_SCOPES = OIDC_DEFAULT_SCOPES;
      exports.PerformanceEvents = PerformanceEvents;
      exports.PromptValue = PromptValue;
      exports.ProtocolMode = ProtocolMode;
      exports.PublicClientApplication = PublicClientApplication;
      exports.PublicClientNext = PublicClientNext;
      exports.ServerError = ServerError;
      exports.ServerResponseType = ServerResponseType;
      exports.SessionStorage = SessionStorage;
      exports.SignedHttpRequest = SignedHttpRequest;
      exports.StringUtils = StringUtils;
      exports.StubPerformanceClient = StubPerformanceClient;
      exports.UrlString = UrlString;
      exports.WrapperSKU = WrapperSKU;
      exports.createNestablePublicClientApplication = createNestablePublicClientApplication;
      exports.createStandardPublicClientApplication = createStandardPublicClientApplication;
      exports.isPlatformBrokerAvailable = isPlatformBrokerAvailable;
      exports.stubbedPublicClientApplication = stubbedPublicClientApplication;
      exports.version = version;
    }
  });

  // pwa/src/auth.js
  var require_auth = __commonJS({
    "pwa/src/auth.js"(exports, module) {
      "use strict";
      var { PublicClientApplication, InteractionRequiredAuthError } = require_msal_browser();
      var SCOPES = ["Files.ReadWrite.AppFolder"];
      var MicrosoftAuth2 = class {
        constructor(clientId) {
          this.clientId = clientId;
          this.client = null;
          this.account = null;
        }
        get configured() {
          return Boolean(this.clientId && !this.clientId.startsWith("REPLACE_"));
        }
        async initialize() {
          if (!this.configured) return false;
          this.client = new PublicClientApplication({
            auth: {
              clientId: this.clientId,
              authority: "https://login.microsoftonline.com/consumers",
              redirectUri: `${location.origin}${location.pathname}`
            },
            cache: { cacheLocation: "localStorage" }
          });
          await this.client.initialize();
          const redirect = await this.client.handleRedirectPromise();
          this.account = redirect?.account || this.client.getAllAccounts()[0] || null;
          if (this.account) this.client.setActiveAccount(this.account);
          return Boolean(this.account);
        }
        async connect() {
          if (!this.configured) throw new Error("OneDrive \u5E94\u7528\u5C1A\u672A\u5B8C\u6210 Microsoft Client ID \u914D\u7F6E");
          await this.client.loginRedirect({ scopes: SCOPES, prompt: "select_account" });
        }
        async disconnect() {
          if (!this.account) return;
          await this.client.logoutRedirect({ account: this.account, postLogoutRedirectUri: `${location.origin}${location.pathname}` });
        }
        async token() {
          if (!this.account) throw new Error("\u8BF7\u5148\u8FDE\u63A5 OneDrive");
          try {
            return (await this.client.acquireTokenSilent({ account: this.account, scopes: SCOPES })).accessToken;
          } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
              await this.client.acquireTokenRedirect({ account: this.account, scopes: SCOPES });
            }
            throw error;
          }
        }
      };
      module.exports = { MicrosoftAuth: MicrosoftAuth2 };
    }
  });

  // asset-plugin/src/brands.json
  var require_brands = __commonJS({
    "asset-plugin/src/brands.json"(exports, module) {
      module.exports = { logos: { alipay: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMTY3N0ZGIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+QWxpcGF5PC90aXRsZT48cGF0aCBkPSJNMTkuNjk1IDE1LjA3YzMuNDI2IDEuMTU4IDQuMjAzIDEuMjIgNC4yMDMgMS4yMlYzLjg0NmMwLTIuMTI0LTEuNzA1LTMuODQ1LTMuODEtMy44NDVIMy45MTRDMS44MDguMDAxLjEwMiAxLjcyMi4xMDIgMy44NDZ2MTYuMzFjMCAyLjEyMyAxLjcwNiAzLjg0NSAzLjgxMyAzLjg0NWgxNi4xNzNjMi4xMDUgMCAzLjgxLTEuNzIyIDMuODEtMy44NDV2LS4xNTdzLTYuMTktMi42MDItOS4zMTUtNC4xMTljLTIuMDk2IDIuNjAyLTQuOCA0LjE4MS03LjYwNyA0LjE4MS00Ljc1IDAtNi4zNjEtNC4xOS00LjExMi02Ljk0OS40OS0uNjAyIDEuMzI0LTEuMTc1IDIuNjE3LTEuNDk3IDIuMDI1LS41MDIgNS4yNDcuMzEzIDguMjY2IDEuMzE3YTE2Ljc5NiAxNi43OTYgMCAwIDAgMS4zNDEtMy4zMDJINS43ODF2LS45NTJoNC43OTlWNi45NzVINC43N3YtLjk1M2g1LjgxVjMuNTkxczAtLjQwOS40MTEtLjQwOWgyLjM0N3YyLjg0aDUuNzQ0di45NTFoLTUuNzQ0djEuNzA0aDQuNjlhMTkuNDUzIDE5LjQ1MyAwIDAgMS0xLjk4NiA1LjA2YzEuNDI0LjUyIDIuNzAyIDEuMDExIDMuNjU0IDEuMzMzbS0xMy44MS0yLjAzMmMtLjU5Ni4wNi0xLjcxLjMyNS0yLjMyMS44NjktMS44MyAxLjYwOC0uNzM1IDQuNTUgMi45NjggNC41NSAyLjE1MSAwIDQuMzAxLTEuMzg4IDUuOTktMy42MS0yLjQwMy0xLjE4Mi00LjQzOC0yLjAyOC02LjYzNy0xLjgwOSIvPjwvc3ZnPg==", binance: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRDZBNTFFIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+QmluYW5jZTwvdGl0bGU+PHBhdGggZD0iTTE2LjYyNCAxMy45MjAybDIuNzE3NSAyLjcxNTQtNy4zNTMgNy4zNTMtNy4zNTMtNy4zNTIgMi43MTc1LTIuNzE2NCA0LjYzNTUgNC42NTk1IDQuNjM1Ni00LjY1OTV6bTQuNjM2Ni00LjYzNjZMMjQgMTJsLTIuNzE1NCAyLjcxNjRMMTguNTY4MiAxMmwyLjY5MjQtMi43MTY0em0tOS4yNzIuMDAxbDIuNzE2MyAyLjY5MTQtMi43MTY0IDIuNzE3NHYtLjAwMUw5LjI3MjEgMTJsMi43MTY0LTIuNzE1NHptLTkuMjcyMi0uMDAxTDUuNDA4OCAxMmwtMi42OTE0IDIuNjkyNEwwIDEybDIuNzE2NC0yLjcxNjR6TTExLjk4ODUuMDExNWw3LjM1MyA3LjMyOS0yLjcxNzQgMi43MTU0LTQuNjM1Ni00LjYzNTYtNC42MzU1IDQuNjU5NS0yLjcxNzQtMi43MTU0IDcuMzUzLTcuMzUzeiIvPjwvc3ZnPg==", bitcoin: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRjc5MzFBIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Qml0Y29pbjwvdGl0bGU+PHBhdGggZD0iTTIzLjYzOCAxNC45MDRjLTEuNjAyIDYuNDMtOC4xMTMgMTAuMzQtMTQuNTQyIDguNzM2QzIuNjcgMjIuMDUtMS4yNDQgMTUuNTI1LjM2MiA5LjEwNSAxLjk2MiAyLjY3IDguNDc1LTEuMjQzIDE0LjkuMzU4YzYuNDMgMS42MDUgMTAuMzQyIDguMTE1IDguNzM4IDE0LjU0OHYtLjAwMnptLTYuMzUtNC42MTNjLjI0LTEuNTktLjk3NC0yLjQ1LTIuNjQtMy4wM2wuNTQtMi4xNTMtMS4zMTUtLjMzLS41MjUgMi4xMDdjLS4zNDUtLjA4Ny0uNzA1LS4xNjctMS4wNjQtLjI1bC41MjYtMi4xMjctMS4zMi0uMzMtLjU0IDIuMTY1Yy0uMjg1LS4wNjctLjU2NS0uMTMyLS44NC0uMmwtMS44MTUtLjQ1LS4zNSAxLjQwN3MuOTc1LjIyNS45NTUuMjM2Yy41MzUuMTM2LjYzLjQ4Ni42MTUuNzY2bC0xLjQ3NyA1LjkyYy0uMDc1LjE2Ni0uMjQuNDA2LS42MTQuMzE0LjAxNS4wMi0uOTYtLjI0LS45Ni0uMjRsLS42NiAxLjUxIDEuNzEuNDI2LjkzLjI0Mi0uNTQgMi4xOSAxLjMyLjMyNy41NC0yLjE3Yy4zNi4xLjcwNS4xOSAxLjA1LjI3M2wtLjUxIDIuMTU0IDEuMzIuMzMuNTQ1LTIuMTljMi4yNC40MjcgMy45My4yNTcgNC42NC0xLjc3NC41Ny0xLjYzNy0uMDMtMi41OC0xLjIxNy0zLjE5Ni44NTQtLjE5MyAxLjUtLjc2IDEuNjgtMS45M2guMDF6bS0zLjAxIDQuMjJjLS40MDQgMS42NC0zLjE1Ny43NS00LjA1LjUzbC43Mi0yLjljLjg5Ni4yMyAzLjc1Ny42NyAzLjMzIDIuMzd6bS40MS00LjI0Yy0uMzcgMS40OS0yLjY2Mi43MzUtMy40MDUuNTVsLjY1NC0yLjY0Yy43NDQuMTggMy4xMzcuNTI0IDIuNzUgMi4wODR2LjAwNnoiLz48L3N2Zz4=", boc: "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAD/////////////////////9fX8/7yy6f97eMj/OSaw/y0WrP9dUrv/lo3Z/+nn+P/+/f////////////////////////7+/v/+/v//x7/s/0M+sP8MDJD/GRWc/w8OnP8EBJb/Hhuh/woJkf8aGJr/j4XU//Tz+////////v7+///////+/v//t7Tk/xsbnP8kIqH/j4XX/9zW9v9bWcT/DQ2X/8/J8P+7t+n/R0C1/wcHj/9hYL//8/P7////////////1c/x/x8bnv8qKqT/09Hw//7+/v//////YWHF/w0Nlv/f3/P///////Lw+/92dMn/BweQ/354zf/8+/7/+/n+/19Yvv8VEZb/xsDr///////z7/3/y7ry/0tEvP8NDZf/rJzm/9/U+P//////9vX8/1dQu/8REZX/2dTy/+Pg9v8QEJX/amLF//79/v/f2fb/KiKk/wYFj/8EA5H/AwOS/wUEj/8QD5b/j4DX///////Mxu//EQ6V/398zP+jleH/CQiO/7686f//////lZPY/wcFj/94bc//mZjY/5mY2f+YmNn/IRel/ywsrP/+/f//+/r+/zY0rv8xI6n/goHT/w8Ik//LwPD//v7+/46L1P8MCpD/2c73//7+/v///////v7+/0Uxsv8fH6f//fz///7+/v9MPb3/ExKc/4KB0/8OCJP/ysDw//////+NitX/DAqQ/9vQ+P////////////////9HNLL/Hx+o//79////////ST28/xQSnf+nmeL/CQiO/7u56P/+/v7/m5rb/wYGkf9eVMX/fnPP/31y0P99cs//GReh/ywsrf/+/f//+Pb+/zMyrP89MK7/5uP4/xIRmP9gVML//Pz+/+rl+v9AOa//EA+Y/wUFlP8DA5T/CAiV/xsboP+1ruX//////8C56/8NCpL/iILT//z7/v9va8f/DguU/7Kp5P/+/v7//v7+//f0/v9aV8P/DQ2Y/9jV8//9/P///v7+/+nl+P8+N6//HBme/+fj+P//////4t32/zIrqv8nJZ//vrXo//79/v///v//YWHF/w0Nl//f3/T//////+Hc9v9bUrr/EhCU/6GY3P/+/v////////7+/v/Cver/Lian/xMOlf9wacf/xb3s/0xIvP8NDZn/s6vo/5iO2f8sKKL/FBKW/4By0P/39v3//v7+/////////////////9vT9P9cVL7/CgmR/wwIj/8HBJL/BASS/w4Jkv8MDJD/NzKt/7Cs5P/59/3//////////////////v7+///////+/v7/+vj9/9jT8/+MhNf/cm7I/2plxP+Af9D/u63q//Py+////////v7+///////+/v7/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==", dbs: "data:image/x-icon;base64,AAABAAQAEBAAAAAAIABoBAAARgAAACAgAAAAACAAqBAAAK4EAAAwMAAAAAAgAKglAABWFQAAQEAAAAAAIAAoQgAA/joAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAD///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO0ZJBzt3yQc7dckHO1pJBztGyQc7QP///8BJBztGSQc7WckHO3TJBzt4yQc7R////8B////Af///wEkHO0dJBztfyQc7f8kHO3/JBzt/yQc7f8kHO33JBzt9SQc7f8kHO3/JBzt/yQc7f8kHO2FJBztIf///wH///8BJBzt2yQc7f8lH+3/Ixzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yMc7f8lH+3/JBzt/yQc7eH///8B////ASQc7cMkHO3/Ixvt/1ha8f8nIO3/JBzt/yQc7f8kHO3/JBzt/yUe7f9ZW/L/Ixvt/yQc7f8kHO3L////Af///wEkHO1VJBzt/yQc7f8iHO3/io32/zIt7v8kHO3/JBzt/y8r7v+KjPb/JB3t/yQc7f8kHO3/JBztXf///wH///8BJBztDSQc7fskHO3/JBzt/ykj7f+8v/n/UlDx/09N8f+9wPn/Kybt/yQc7f8kHO3/JBzt/yQc7RP///8B////Af///wEkHO3pJBzt/yQc7f8kHO3/Qj/v////////////R0Xw/yQc7f8kHO3/JBzt/yQc7fH///8B////Af///wH///8BJBzt6yQc7f8kHO3/JBzt/0lH8P/+/////v///09N8f8kHO3/JBzt/yQc7f8kHO3z////Af///wH///8BJB3tESQc7f0kHO3/JBzt/y8r7v+7vvn/QT7v/z887/+7vvn/MS3u/yQc7f8kHO3/JBzt/yQc7Rf///8B////ASQc7V0kHO3/JBzt/yUf7f+HifX/KiXt/yQc7f8kHO3/KSPt/4mL9f8nIO3/JBzt/yQc7f8kHO1l////Af///wEkHO3NJBzt/yMb7f9WWPH/Ix3t/yQc7f8kHO3/JBzt/yQc7f8iHOz/V1jx/yMc7f8kHO3/JBzt0////wH///8BJBzt0yQc7f8lHu3/Ixvt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yMb7f8lH+3/JBzt/yQc7dn///8B////ASQc7RMkHO1vJBzt/yQc7f8kHO3/JBzt+yQc7eckHO3lJBzt+SQc7f8kHO3/JBzt/yQc7XUlHe4T////Af///wH///8BJBztFSQc7c8kHO3DJBztVSQc7Q3///8B////ASQc7QskHO1RJBztwSQc7dEkHO0Z////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BAAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//ygAAAAgAAAAQAAAAAEAIAAAAAAAgBAAAAAAAAAAAAAAAAAAAAAAAAD///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJB3tjSQc7fMkHO3hJBzteyQc7RH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztDSQc7XMkHe3bJBzt9SQc7ZkkHe0D////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7WMkHO3/JBzt/yQc7f8kHO3/JBzt8SQc7aEkHO1PJB3tHSQc7QX///8B////ASQc7QUkHO0ZJBztSyQc7ZskHO3tJBzt/yQc7f8kHO3/JBzt/yQc7XP///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztkyQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt8yQc7eckHO3nJBzt8yQc7f8kHO3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBztof///wH///8B////Af///wH///8B////Af///wH///8BJBztcSQc7bEkHO25JBzt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3BJBztsSQc7XkkHO0F////Af///wH///8B////ASQc7YkkHO3/JBzt/yQc7f8kHO3/Ixvt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8jG+3/JBzt/yQc7f8kHO3/JBzt/yUd7pf///8B////Af///wH///8BJBzt4yQc7f8kHO3/JBzt/yMb7f8rLO7/Ihvt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/IRrs/ysr7v8jG+3/JBzt/yQc7f8kHO3/JBzt7////wH///8B////Af///wEkHO2/JBzt/yQc7f8kHO3/JBzt/x8W7P9vevT/KCft/yMb7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBvt/yMh7f90gPX/IBfs/yQc7f8kHO7/JBzt/yQc7f8kHO3R////Af///wH///8B////ASQc7U8kHe3/JBzt/yQc7f8kHO3/JR3t/xkT7P+vs/n/MzLu/yAY7P8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yEY7P8sKu7/sbT5/xsX7P8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7V////8B////Af///wH///8B////ASQc7dkkHO3/JBzt/yQc7f8kHO3/JBzt/xwc7P/M0fv/S0zx/xwV7P8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8dFuz/QUDw/8zR+/8jI+3/JRzt/yQc7f8kHO3/JBzt/yQc7f8kHO3lJBztBf///wH///8B////Af///wH///8BJBzteyQc7f8kHO3/JBzt/yQc7f8kHO3/JBvt/yoq7v/n7P3/b3T0/xcQ7P8lHe3/JBzt/yQc7f8kHe3/GRLs/2Rp8//p7v7/MjLv/yMb7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7Yf///8B////Af///wH///8B////Af///wEkHO0tJBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/IRjt/0ND8P/5/P7/kpf2/xMN7P8kHO3/JBzt/xML6/+Fi/X//f///09S8f8fFuz/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBztPf///wH///8B////Af///wH///8B////ASUd7gUkHO3zJBzt/yQd7f8kHO3/JBzt/yUc7v8kHO3/HBbs/2Zs8///////xcj6/0tO8P9ISvD/vsL6//////90efT/GxXs/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7fskHO0N////Af///wH///8B////Af///wH///8B////ASQc7dkkHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/GBDs/5ug9///////////////////////qa74/xUN7P8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt5f///wH///8B////Af///wH///8B////Af///wH///8BJBzt0SQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/MTHu//////////////////////87Pe//JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3j////Af///wH///8B////Af///wH///8B////Af///wEkHO3TJBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f85Ou///////////////////////0RG8P8kHO3/JBzt/yQc7f8kHO3/JBzt/yUc7v8kHe3/JBzt/yQc7eP///8B////Af///wH///8B////Af///wH///8B////ASQc7dkkHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/Ewvr/7S5+f///////v////3/////////wsf7/xMN6/8kHO3/JB3t/yQc7f8kHe3/JBzt/yQc7f8kHO3/JB3t5////wH///8B////Af///wH///8B////Af///wElHe4HJBzt9yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/xoS7P+EifX//////5yh9/8tLe7/Kyru/5OY9v//////kpf2/xcQ7P8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO39JR3uE////wH///8B////Af///wH///8B////ASQd7TkkHO3/JB3t/yQc7f8kHO3/JBzt/yQc7f8dFuz/YWbz//z9//9vc/P/Fg/s/yQc7f8kHe3/GBHs/2Rp8v/4+v7/b3Tz/xsV7P8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO1H////Af///wH///8B////Af///wH///8BJBzthyQc7f8kHO3/JBzt/yQc7f8kHO3/Ihnt/z097//n6/3/S07w/xsV7P8kHO3/JBzt/yQc7f8kHe3/HRbt/0FC8P/l6v3/Skvx/yAX7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7Zf///8B////Af///wH///8B////ASQc7QUkHO3nJBzt/yQc7f8kHO3/JBzt/yQc7f8rKu7/zM/7/y4u7v8gF+3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/IRjs/ygn7f/M0Pv/NDPu/yMb7f8kHO3/JBzt/yQc7f8kHO3/JBzt7yUd7gv///8B////Af///wH///8BJBztZSQc7f8kHO3/JBzt/yQc7f8kHO3/IiDt/6+z+f8hIe3/Ixvt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/xwb7P+vs/n/KCft/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBztc////wH///8B////Af///wEkHO3NJBzt/yQc7f8kHO3/JBzt/yEa7f9sePT/Gxbs/yUc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/xkT7P9qdfT/Ihvt/yQc7f8kHO3/JBzt/yQc7f8kHO3b////Af///wH///8B////ASQc7d0kHO3/JBzt/yQc7f8kHO3/KCbu/yAX7f8lHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JB3t/yAX7P8qKe7/JBvt/yQc7f8kHO3/JBzt/yQd7ev///8B////Af///wH///8BJBztbSQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQb7f8kHO3/JB3t/yQc7f8kHO3/JBzte////wH///8B////Af///wH///8BJBztRyQc7YUkHO2fJBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO2pJBzthSUd7k3///8B////Af///wH///8B////Af///wH///8B////ASQc7ZckHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt6yQc7c8kHO3LJBztyyQc7c8kHO3pJBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7aX///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztTSQc7f8kHO3/JBzt/yQc7f8kHO3XJBzteSQc7SskHe0D////Af///wH///8B////ASQc7QMkHO0nJB3tcSQc7dMkHO3/JBzt/yQc7f8kHO3/JBztX////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztayQc7dEkHO29JBztTyQc7QP///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7UkkHO25JBzt0SQc7XX///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAMAAAAGAAAAABACAAAAAAAIAlAAAAAAAAAAAAAAAAAAAAAAAA////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztSyQd7cEkHOzxJBzt3yQc7JMjHOw9JBvtDf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkG+wLJBztNyQc7YkkHOzZJBzt8yMc7MkkHO1VJBzsA////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO0xJBzt5yQc7f8kHO3/JBzt/yQc7f8kHOzhJBztkSQc7U0kHOwb////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJB3tFyMc7UkkHO2LJBzt2yQc7f8jHO3/JBzt/yQc7f8kHO3vJBzsRf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASUd7gckHO2nJBzt/yQc7f8kHO3/JBzt/yQc7f8kHOz/JBzt+yQc7eUjHOzJJBztgyUc7U8kHe0hJBztCSQc7QP///8B////ASQc7QMkHO0JJBztHyQc7UkkHO19JBztwyQc7eMkHO37JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzttSQd7Q3///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7RkkHO3LJB3t/yQc7f8kHO3/JBzt/yQc7f8kHOz/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzs8SQc7eUkHO3ZJBvt1yQc7OUkHO3vJBzt/SQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yMc7f8kHO3/JBzt0yUc7if///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO4PJBztMSQc7SkkHe23JBzt/yQc7f8kHO3/JBzt/yQc7f8kG+z/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHOz/JBzt/yQc7f8kHOz/JBzt/yQc7f8jHO3/JBzt/yQc7f8jHO3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8jHO3/JBztwyQc7TMlHO0xJB3tE////wH///8B////Af///wH///8B////Af///wH///8B////ASQd7j0kHO21JBzs1yQc7c8kHO3dJBzt/yQc7f8kHe3/JBzs/yQb7f8kG+3/JBzs/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt4yQc7c8kHO3XJBztuyMc7UskHOwF////Af///wH///8B////Af///wH///8BJBztRyQc7eckHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8jG+3/JBzs/yQc7f8kHOz/JBzs/yQc7f8kHOz/JBzs/yQc7f8kHOz/JBzs/yQc7f8kHOz/JBzt/yMc7f8kHe3/JBzt/yMc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/Ixvt/yMc7f8kHO3/JBzt/yQb7f8kHO3/JBzt/yQc7e8lHO5V////Af///wH///8B////Af///wH///8BJBztrSQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yUd7f8kHu3/IBfs/yQc7f8kHOz/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHOz/JBzt/yQc7f8kG+z/JBzt/yQc7f8jHO3/JBzt/yQc7f8jG+3/JBzt/yQc7f8kHO3/JBzt/yQc7f8gF+z/Ihzt/yQd7f8jG+3/JBzt/yQc7f8jHO3/JBzt/yQc7f8kHO3D////Af///wH///8B////Af///wH///8BJBzt1yQc7f8kHO3/JBzt/yQc7f8kHO3/Ixvt/yIa7f80PO//Kyru/xwR7P8kHe3/JBzs/yQc7f8kHO3/JBzs/yQc7f8kHOz/JBzs/yQb7f8kG+z/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/x0T7P8oJe3/Njzv/yIa7f8jG+3/JBzt/yQc7f8kHO3/JBzt/yQc7f8jHO3r////Af///wH///8B////Af///wH///8BJBztsSQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yIZ7P8gGO3/a3f0/0tQ8f8bFuz/JBzt/yUd7f8kHe3/JBzs/yQc7f8kHOz/JBzs/yQc7f8kHOz/JBzt/yMc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kG+3/Gxbs/0NG8P9wgPX/Ixvt/yEY7P8kHO3/JBzu/yQc7f8kHO3/JBzt/yMb7f8kHO3L////Af///wH///8B////Af///wH///8BJBztWyQc7fckHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8gFu3/MCzu/5Wg9/9lavP/Egvr/yIZ7f8kHez/JBzt/yQc7f8kHOz/JBvt/yQc7f8kHOz/JBzt/yQc7f8kHO3/JBzt/yQc7f8jG+3/JBzt/yMa7f8UDuv/WVzx/5qh9/83N+//HhXs/yUd7f8kHO3/JBzt/yQc7f8jHO3/JBzt/yQc7fsjHO1v////Af///wH///8B////Af///wH///8BJBztISQc7b8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/HBXs/zo57//Exvr/ZWjy/xEK6/8iGu3/JBzt/yQc7f8kHO3/JBzs/yQb7f8kG+z/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/Ihrs/xAJ6/9UVvH/xMb6/0VH8P8bFez/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7c0kHOwp////Af///wH///8B////Af///wH///8B////ASQc7WckHO3zJBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/xcS7P8uMu7/2dz8/4+T9v8fHez/Hxfs/yQc7f8kHO3/JBzs/yQc7f8kHO3/JBzt/yMc7f8kHO3/JBzt/yQc7f8gGO3/HBbs/3+E9f/Y3fz/PkLv/xcR6/8lHO3/JBzt/yMc7f8kHO3/JBzt/yMc7f8kHO3/Ixzt9yQc7XckHO0F////Af///wH///8B////Af///wH///8B////ASQc7SkkHO3TJBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8VD+z/W1/x/9ne/P+nrvj/ISPt/xoT7P8kHOz/JBvt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/xsU7P8bHOz/mJ73/9zg/P9obfP/FA3s/yQc7f8kHe3/JBzt/yQc7f8jHO3/JBzt/yQc7f8jG+3/JBzt2yQc7Tn///8B////Af///wH///8B////Af///wH///8B////ASUc7gUkHO2jJBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/GBLs/3N59P/t8f7/s7b5/y4w7v8XDuz/JR7t/yQc7f8kG+z/JBzt/yQc7f8lHu3/GhHs/yYo7f+orvj/7vL+/4SK9v8XEuz/Ixvt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBztsyQc7An///8B////Af///wH///8B////Af///wH///8B////Af///wEkG+xRJBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzs/yQc7f8kHOz/Ihrt/xIL7P9+g/X/+/z+/9bb/P9PUvH/FAvs/yAZ7f8kHe3/JBzt/yEZ7P8VDOz/REjw/83R+//+////kJX3/xQO7P8hGOz/JBzt/yMc7f8kHO3/JBzt/yMb7f8kHO3/JBzt/yQc7f8kHO3/JBztZf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO0bJBzt/SQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JR3t/x8W7P8UEuz/r7X5//7////i5f3/XmPy/xoY7P8TDuv/FA7s/xgW7P9UV/H/2d78//////+/xPr/Gxzs/x0W7P8kHO3/JBzt/yQc7f8jG+3/JBzt/yQc7f8jHO3/JBzt/yQc7f8kHO3/JBvtMf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO0DJBzt5SQc7f8kHO3/JB3t/yQc7f8kHO3/JBzs/yQc7f8kHO7/JBzs/yQc7f8eF+z/LTHu/8LH+v//////6uz9/6uu+P9kafP/YGXz/6ap+P/n6f3//////8zR+/83O+//HRXs/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO33JBvsDf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBvtySQc7f8kHO3/JBzt/yQc7f8kHO3/JBzs/yQc7f8kHOz/JBzt/yQc7f8kHO3/GxLs/zo87//S1vv///////////////////////7+/v//////29/8/0NG8P8YEOz/JB3t/yMc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yMc7f8kHO3/JBzt/yMc7f8kHOzb////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztwyQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/Ixvt/xIN7P97gvX////////////+/v7////////////+/v7/jZT2/xQP7P8jGu3/JBzt/yQc7f8jHe3/JBzt/yQc7f8jHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kG+zV////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBzttSQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQb7f8kHO3/JBzt/yQc7f8kHO3/JBzs/xYO6/9BP+////////7+/v//////////////////////TlPx/xUO7P8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3V////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztuyQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/xYP6/9JSvD/////////////////////////////////WF3y/xQO7P8kHOz/JBzt/yQc7f8kHOz/JBzt/yQc7f8kHO3/JRzu/yQc7f8kHez/JBzt/yQc7f8kHO3V////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztwyQc7f8kHO3/JBzt/yUc7v8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/Ihrs/xUR7P+Smfb///////7+/v///////v7+////////////o6n4/xkX7P8hGuz/JBvt/yQc7f8kHe3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3V////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztyyQc7f8kHO3/JBzt/yQc7f8kHO3/Ixzs/yQc7f8kHO3/JBzt/yQc7f8lHe3/FQzr/05Q8f/i5f3////////////9/////P////7+/v/+/v7/6ez9/11h8v8UC+v/JR3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHOz/JBzt/yQc7f8kHO3h////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wElHe4HJBzt7yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8aEev/Q0fw/9nd/P//////09b7/3l/9P84Oe//NjTu/3J38//N0Pv//////+Lm/f9PUfH/Fw/s/yQd7f8kHO3/JBzt/yQc7f8kHOz/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHOz7JRzuFf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wElHO0pJBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yMc7P8kHO3/JBzt/xwU7P8lJ+3/zM/7//7+/v/Hy/r/Oz3v/xIN7P8YEOz/GBDs/xEM6/8zNe7/wMP6//3////X3Pz/LjDu/xoT7P8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBztPf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO1hJBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/Ixzs/yQc7f8kHO3/IBjs/xkZ7f+lrPj//P7//7m++f8zNu7/GRHs/yMb7P8kHO3/JBzt/yMb7P8bFOz/LC7t/6uy+P/5+/7/s7b5/yEj7P8eF+z/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHOz/JBzt/yQc7f8kHO3/JBvsd////wH///8B////Af///wH///8B////Af///wH///8B////ASUc7gkkHO2zJBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8jGu3/GRTs/5aa9//t8P3/ipD2/xgZ7P8dFe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/Hxft/xUT7P96gPT/7O/9/6et+P8eG+3/Ihnt/yQd7f8kHO3/JBzt/yQc7f8kHOz/JBzt/yQc7f8kHOz/JBztwSUd7g////8B////Af///wH///8B////Af///wH///8B////ASQb7TkkHO3bJBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yMa7f8QCev/fYL0/9jd/P99g/T/FA7s/x4W7P8kHO3/JBzt/yMc7P8kHO3/JBzt/yQc7f8kHO3/JB3t/x8X7P8TDOv/bnTz/9jd/P+QlPf/Dwjr/yIa7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt4yQc7Uf///8B////Af///wH///8B////Af///wH///8BJBztBSQc7HkkHO35JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/xUP6/9TVvH/2Nv8/2No8v8YEuz/Ihnt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQb7f8kHO3/JBzt/yQc7f8iGuz/FxHr/1hc8f/Z3Pz/Z2vy/xMM6/8kG+3/JBzt/yQd7f8kHOz/JBzt/yQc7f8kHOz/JBzt+yQc7YkkHe4J////Af///wH///8B////Af///wH///8BJBztLSQc7dEkHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/Gxbs/1hd8f/Exvr/Oj7v/xQN7P8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHOz/JBzt/yQc7f8kHO3/JBzt/xYP6/8rL+7/xcb6/2Zq8v8cFuz/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHOz/JBzt/yQc7d0jHOw3////Af///wH///8B////Af///wH///8BJBztcyQc7f0kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8eFOz/QEPv/5Kc9/9CRO//FxHr/yQc7f8kHe3/JBzt/yMc7P8kHO3/JBzt/yMc7P8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8XEuv/OTnv/5Ke9/9JTvH/HRLs/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO2J////Af///wH///8B////Af///wH///8BIxztwSQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yIY7P8lI+3/Z3b0/zU07/8bFez/JBzs/yQc7f8kHe3/JBzs/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHOz/HBXs/y8r7v9lcvT/Kinu/yEX7P8kG+z/JBzt/yQc7f8kHOz/JBzt/yQc7f8jG+zX////Af///wH///8B////Af///wH///8BIxzt0yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yMb7f8vM+7/IRvt/x8W7f8lHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kG+3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yEX7f8gF+z/MTfu/yQd7f8kG+3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3n////Af///wH///8B////Af///wH///8BIxztlyQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8iGu3/Ihnt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8jGu3/Ihrt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO2r////Af///wH///8B////Af///wH///8BJBzsMyQc7c0kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7P8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBvt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yQc7dkkHO09////Af///wH///8B////Af///wH///8B////ASQc7SEkHO2BIxztvSQc7ackHO3JJBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kG+3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kG+3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt0SQc7aUkHO2/JR3uhyUd7iX///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBvtDSQc7BEjHO25JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBztxSQc7R0kHO0N////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7RckHO3LJBzs/yQc7P8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBvt/yQc7fkjHO3ZJBztuyQc7bEkHO2xJBztsSQc7bEkHO27JBzt1yQc7fckHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt0SQc7SX///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO2PJBzt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt8SMb7NUkHOybJBztSyQc7RkkHe0D////Af///wH///8B////Af///wH///8BJBzsAyQc7RUkHO1HJB3tlSQd7c8kHO3vJBzt/yMc7f8kHO3/JBzt/yMc7f8kHO3/JBztpSUd7gf///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO0fIxztzSQc7f8kHO3/JBzs/yQc7fMkHO2/JBztZyQc7SsjHO0F////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJB3sBSQd7SUkHO1hJBztuyMc7PEkG+z/JBzt/yQc7f8kHO3XIxzsLf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztMSQc7Y0kHO2/JBztqSQc7VskHO0hJBvtA////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztHyQc7VckHOylIxztvyQc7ZMkHO05////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BAAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//AAAAAAAA//8AAAAAAAD//wAAAAAAAP//KAAAAEAAAACAAAAAAQAgAAAAAAAAQgAAAAAAAAAAAAAAAAAAAAAAAP///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJR3ueyQd7d0kHO3zJBzt5yQc7Z8kHO0/////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wElHe4xJB3tkyQd7d8lHO7zJBzt4yQc7YkkHO0H////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJR3uvSQd7f8kHe3/JB3t/yQd7f8kHO3/JB3t/yQc7a8kHO1B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7TMlHe2fJBzu/yQd7f8kHe3/JRzu/yQc7f8kHe3/JR3u0yQd7Q3///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztgyQc7f8kHO3/JBzt/yQd7v8kHe3/JBzt/yQd7f8kHO3/JBzt/yQd7ckkHO1tJB3tIf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHe0ZJB3tZSQc7bskHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO2p////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJR3uDyQc7fckHe3/JBzt/yQc7f8kHO3/JB3t/yUd7v8kHe3/JBzt/yUd7v8kHO3/JBzt/yQd7fkkHO2/JR3ufyUd7lEkHe0hJB3tDyQc7QUlHe4D////Af///wH///8BJBztBSUd7g0lHe4dJBztSSQd7nckHO23JB3t8yQc7f8kHe3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQd7f8kHO3/JBzt/yQd7SP///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7TklHe7/JB3t/yQd7f8kHO3/JBzt/yQc7f8lHe7/JBzt/yQc7f8lHe7/JR3u/yQc7f8kHO3/JB3t/yQc7f8lHe7/JB3t/yQc7fEkHO3fJR3u2yQd7cckHO3FJBzt1yQc7d8kHe3tJR3u/SUd7v8kHO3/JB3t/yQc7f8kHO3/JR3u/yQd7f8kHe3/JB3t/yQc7f8lHe7/JB3t/yQd7f8kHe3/JBzt/yQc7f8lHe5V////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wElHe4VJR3u/yQd7f8kHe3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JR3u/yQc7f8lHe7/JBzt/yQd7v8kHO3/JBzt/yQd7f8kHO3/JB3t/yQd7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7v8kHO3/JBzt/yQd7f8lHe7/JB3t/yUd7v8lHe3/JBzt/yUd7v8lHe7/JB3t/yQc7f8kHO3/JB3t/yQd7f8kHO3/JRzuMf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJB3uKSQc7WMkHO1jJR3uLSQd7dEkHO3/JBzt/yUd7v8lHe7/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHe3/JB3t/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHe3/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHO3/JR3u/yQc7f8kHO3/JBzt/yQc7f8kHe3/JRzu5SQd7TclHe5jJRztYyQd7TH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wElHe4FJR3umyQc7f8kHO3/JBzt/yQd7fskHO3rJBzt/yQc7f8lHe7/JB3t/yQc7f8kHO3/JRzu/yQc7f8kHe3/JBzt/yQc7v8kHe3/JBzu/yQd7v8lHe7/JB3t/yQd7f8lHO7/JR3u/yQc7f8kHO3/JBzt/yQd7f8kHe3/JB3t/yUd7v8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JR3u/yUd7u8kHO33JBzt/yUd7f8lHO7/JBzusyQc7RX///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJR3uvSQd7f8kHO3/JBzt/yQd7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHe3/JBzt/yQd7f8kHO3/JRzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JR3u/yQd7f8kHO3/JB3t/yQd7f8kHe3/JBzt/yUd7v8kHe3/JB3t/yQd7f8kHO3/JBzt/yQc7f8kHe7/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8lHe7VJR3uB////wH///8B////Af///wH///8B////Af///wH///8BJBztZSUd7f8kHe3/JBzt/yQc7f8kHe3/JBzt/yQd7f8kHO3/JR3t/yQb7f8jGe3/JB3t/yUd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8lHe3/JBzt/yQc7f8kHO3/JB3t/yQd7f8kHO3/JBzt/yQc7f8kHe3/JB3t/yQd7f8kHe3/JBzt/yQc7v8kHO3/JB3t/yQc7f8kHO3/JBzt/yQd7f8lHe7/JBzt/yQd7f8jGu7/Ixvt/yQc7f8kHO3/JBzt/yUc7v8kHO3/JB3t/yQc7f8kHO3/JR3u/yUd7oH///8B////Af///wH///8B////Af///wH///8B////ASQd7cElHO7/JB3t/yUc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yMb7f8oI+7/JCPt/xsO7P8lHe3/JB3t/yQd7f8kHe3/JBzt/yQc7f8lHO7/JB3t/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8lHe7/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHO3/JR3u/yQc7f8kHO3/JBzt/yUe7f8bD+z/IR7t/ycj7f8kG+3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQd7f8kHO3b////Af///wH///8B////Af///wH///8B////Af///wEkHO3NJBzt/yQc7f8lHe7/JB3t/yQc7f8kHO3/JBzt/yQc7f8kGu3/Hxft/0NU8f88Q/D/DwDr/yUc7f8lHu7/JB3t/yQd7f8kHe3/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQd7f8lHe7/JB3t/yQd7f8kHO3/JBzt/yQc7f8kHe3/JB3t/yYe7f8PAuv/Njrv/0hW8f8fGO3/Ixvt/yQc7f8kHe3/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt5////wH///8B////Af///wH///8B////Af///wH///8BJB3trSQc7f8kHO3/JBzt/yQd7f8kHe3/JB3t/yQd7v8kHO3/JB3t/x8U7P8kHu7/fpH2/11l8/8DAOr/Ihnt/yYf7f8lHe7/JR3u/yQd7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQd7f8kHO3/JB3t/yUc7v8kHO3/JB3t/yUd7v8lHO7/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHO3/JR3t/yUc7f8DAOr/TVDx/4ef+P8rJu7/HRLs/yQd7f8kHe3/JR3u/yUd7v8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7c////8B////Af///wH///8B////Af///wH///8B////ASQd7VMkHO3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHe7/JB3t/yQc7f8lHu3/Fwrs/yUf7f+90/z/fIX2/wAA6v8dEuz/Jx/u/yQd7f8kHe3/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHe3/JBzt/yQd7f8lHe7/JBzt/yUd7v8kHO3/JBzt/yQd7f8lHO7/Jh7t/yEX7f8AAOr/Zmvz/8nc/P80NfD/Ewfs/yYe7f8lHO7/JB3t/yQc7v8lHe7/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO11////Af///wH///8B////Af///wH///8B////Af///wH///8BJB3t3SUd7v8kHe3/JBzt/yQd7f8kHO3/JRzt/yQd7f8lHe7/JBzt/ycf7v8OAuv/Kyvu//P///+Umvf/AADq/xYK7P8nIO3/JB3t/yQc7f8kHe3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHe3/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHO3/Jh7t/xwQ7P8AAOr/eX/1//3///8/QPD/CADr/yYf7f8lHe7/JR3u/yQc7f8kHO3/JBzt/yQd7f8kHO3/JB3t/yQc7f8kHO3xJB3tC////wH///8B////Af///wH///8B////Af///wH///8B////ASQc7V0lHe7/JB3u/yQc7f8kHO3/JB3t/yUd7v8kHe3/JBzt/yUd7v8kHO3/KCDu/wUA6/83Nu///////662+f8LCuz/DwPr/ygg7v8lHe7/JBzt/yQd7f8lHe7/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JB3u/yUd7v8kHO3/Jx/t/xQJ6/8CAOv/kpj3//////9PVPH/AADq/ycf7v8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQd7f8lHe7/JBztff///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBzt5yUc7v8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8lHe7/JR3u/yQc7f8nHu7/AADq/05X8v//////xc77/xsa7v8GAOr/Jx7t/yUd7f8lHe7/JR3u/yQc7f8kHe3/JBzt/yUd7v8kHe3/JBzt/yQd7f8kHe3/JBzt/yQd7f8lHe3/KB/u/wwA6/8QEOz/q7f6//////9sdPT/AADp/yYc7v8lHe7/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHe3/JBzt/yQc7f8kHO3/JB3t9yQc7RH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQd7YEkHe3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yUc7f8AAOr/b3j0///////a4f3/MTfv/wAA6v8kG+3/JR7t/yQc7f8kHO3/JBzt/yQd7f8lHe7/JBzt/yQc7f8kHO3/JBzt/yQc7f8lHe3/Jhzt/wIA6v8gI+7/yM/7//////+Ikvb/AADr/yMZ7f8lHe3/JB3t/yQd7f8kHe3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQd7aP///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wElHO4jJB3t/yUd7v8kHe3/JB3t/yQd7f8kHe3/JB3t/yUd7v8kHe3/JBzt/yUc7v8lHu7/IRbt/wAA6v+Nmff///////D6//9OVvL/AADq/yAV7f8mH+3/JBzt/yQc7f8kHO3/JBzt/yQc7f8lHe7/JR3u/yQd7f8mHu7/Ixnt/wAA6v87QvD/3+n+//////+qtPn/AADq/x0S7f8mH+7/JR3u/yUd7v8kHe3/JBzt/yQd7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yQd7f8kHO09////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7cckHO3/JBzt/yUc7v8kHO3/JBzt/yUd7v8kHO3/JBzt/yQc7f8kHe3/JB3t/yYe7f8bD+3/AADr/7C7+v///////////3F79f8AAOv/GQ3s/ycg7v8lHe7/JBzt/yQc7f8kHO3/JBzt/yQd7f8mH+3/HhLt/wAA6v9cZPP/+v/////////I0/z/Cwzt/xQJ7P8mH+3/JBzt/yQc7f8lHe7/JBzt/yQd7f8kHe3/JB3t/yQd7f8kHO3/JBzt/yQc7f8kHe3h////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO17JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQd7f8kHO3/JyDt/xIG7P8PD+z/z9j8////////////k6D3/wUC6/8RA+z/KCDu/yQd7f8lHe7/JBzt/yQd7f8nH+3/Fgns/wAA6v97hvX////////////j6/7/HBzu/wwA6/8nH+3/JBzt/yQc7f8kHe3/JB3t/yQc7f8kHO3/JBzt/yQd7f8kHe7/JBzt/yQc7f8kHO3/JBztl////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztOyQc7f8lHe7/JBzt/yQd7f8kHO3/JB3t/yQd7f8lHe7/JBzt/yQc7f8kHO3/JB3t/yUd7v8nIO3/CwDr/yMo7v/q8/7///////////+yvPr/ExTs/wEA6v8jGe3/Jh/u/yYf7v8lG+3/BgDq/wkH7P+bqPj////////////6////OkPw/wQA6v8nH+3/JBzt/yUc7v8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHe3/JB3u/yUd7v8lHe7/JBzt/yQc7Vn///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASUd7g8kHO33JB3t/yQc7f8kHO3/JB3t/yQd7f8lHO7/JR3u/yQc7f8kHe3/JR3u/yUc7v8lHe3/JBzt/ycf7f8DAOv/QEjx//z//////////////9Pc/P9DSPH/AQDr/wMA6v8EAOr/AADr/zc98P/Dzfv/////////////////WmLy/wAA6v8nHu3/JB3t/yQc7f8lHe7/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JR3u/yQc7f8kHO0r////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBzt1SQd7f8kHO3/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHe3/JB3t/yUc7v8lHe7/JBzt/yQc7f8kHe3/JRzt/wAA6v9favP//////////////////////7S7+f91ffX/cnn1/6ux+f//////////////////////eYX2/wAA6v8jGe3/JR7t/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7v8kHe3/JBzt/yQc7f8kHe3/JB3t/yQd7f8lHe7xJBztCf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7bkkHO3/JB3t/yUd7v8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yQc7f8lHe7/JB3u/yUd7f8iFu3/AADq/4+Z9///////////////////////////////////////////////////////prH5/wAA6v8dEu3/JR7t/yQd7f8kHO3/JBzu/yQc7f8lHe7/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JR3u/yQc7f8kHe3/JBzt0////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO2tJBzt/yQc7f8lHe7/JR3u/yQd7f8kHO3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHe3/JB3t/yQc7v8kHe3/Jh7u/xkM7f8LDOz/1dz8////////////////////////////////////////////5u7+/xod7f8SBOv/Jx/u/yUd7v8kHO3/JB3t/yQd7v8lHe7/JBzt/yQc7f8kHO3/JR3t/yQc7f8kHe3/JRzu/yQd7f8kHO3/JBzt/yQc7cX///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztryQc7f8kHO3/JR3u/yQd7f8kHO3/JBzt/yQc7f8kHe7/JBzt/yQc7f8lHe7/JR3u/yQc7f8lHO7/JB3t/yQc7f8nH+3/AADq/3B79f///////////////////////////////////////////4uU9/8AAOr/Jh7u/yUd7v8kHe3/JR3u/yQd7f8kHe3/JB3t/yQc7f8kHe3/JBzt/yUd7v8kHO3/JBzt/yUd7v8kHO3/JBzt/yQc7f8kHO3H////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7ZckHO3/JBzt/yQd7f8kHe3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8lHe7/JR3u/yQc7f8kHO3/JBzt/woB6/9LSPD///////////////////////////////////////////9aY/L/CADr/yQd7f8kHO3/JRzu/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHO3/JR3u/yQd7f8kHO3/JB3tx////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO2fJB3t/yQd7f8kHO3/JBzt/yQd7f8kHe3/JRzu/yQc7f8kHO3/JBzu/yQc7f8kHO3/JB3t/yQc7f8kHO3/JB3t/yUe7f8JAOv/UVLx////////////////////////////////////////////ZGz0/wYA6/8lHu3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8lHe7/JR3u/yUd7v8kHe3/JB3t/yQc7f8lHe7/JBzt/yQc7cf///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJR3usyQc7f8kHO3/JB3t/yQc7f8lHO7/JR3u/yQc7f8kHO3/JB3t/yUd7v8lHe7/JB3t/yQc7f8lHe7/JR3u/yQd7f8mHu3/AADq/4yX9////////////////////////////////////////////6ev+f8AAOv/JRvt/yQd7f8kHO3/JBzt/yQd7f8kHe3/JBzt/yQd7f8lHe7/JR3u/yUd7v8lHO7/JB3t/yQd7f8kHe3/JBzt/yUd7v8lHe7H////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7a0kHO3/JBzt/yQc7f8lHe7/JR3u/yUc7v8kHe3/JB3t/yQd7f8kHO3/JBzt/yQc7f8lHe7/JR3u/yQd7f8nH+3/DADr/yUp7v/u9f7////////////////////////////////////////////6/v//PEPx/wQA6v8nIO3/JBzt/yQc7f8kHe3/JR3u/yQd7f8kHO3/JR3u/yQd7f8lHO7/JB3t/yQc7f8kHO3/JR3u/yQc7f8kHe3/JR3ux////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO29JB3t/yQd7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8lHe7/JR3u/yQc7f8mH+3/Fwvs/wQD6/++x/v///////////////////////z////6/////////////////////////9Td/f8QEez/EQTr/ycf7f8kHO3/JB3t/yUd7v8lHe7/JBzt/yUd7v8kHe3/JBzt/yQc7f8kHO3/JB3t/yQd7v8lHe7/JB3t/yQd7dv///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJB3t4SQc7f8kHO3/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHO3/JR3u/yQd7f8lHu3/HhPs/wAA6v+bpvj/////////////////1Nz8/2t09P88PfD/OTfv/2Vr8//K0vv/////////////////tL76/wMA6/8ZDuz/Jh/u/yQd7f8kHO3/JBzt/yQd7f8kHe3/JB3t/yQc7f8lHe7/JRzu/yQd7f8kHO3/JR3u/yQd7f8kHO35JR3uEf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJR3uHSQd7f8kHO3/JBzt/yQc7f8kHe3/JB3t/yQc7f8lHe7/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JRru/wAA6v93gfX/////////////////kp33/w4N7P8AAOv/EAXr/xEG7P8AAOr/Bgbr/4CJ9v////////////////+Vovf/AADq/yAW7f8lHu7/JR3u/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHO3/JB3t/yQd7f8kHO3/JBzt/yUd7jf///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASUd7k8kHO3/JB3t/yQd7f8lHe7/JR3u/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yUd7v8lHe3/Jx3u/wAA6v9YYfP/////////////////bHX0/wAA6v8WCuz/Jx/t/yQc7f8kHe3/Jx/t/xoO7P8AAOr/W2Hy//r//////////////3F79f8AAOn/JBrt/yUd7v8kHO3/JB3t/yQc7f8lHe7/JR3u/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO1t////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHe2RJBzt/yQc7f8kHe3/JR3u/yUd7v8kHO3/JBzt/yQc7f8kHe3/JB3t/yQc7f8kHO3/Jx/t/wQA6/80O/D/+P/////////z+v//Ulnx/wAA6v8fFO3/Jh/t/yQc7f8kHO3/JBzt/yQc7f8lHu3/Ihjt/wAA6v89RPD/4+7+////////////TVbx/wAA6v8mHe3/JB3t/yQc7f8kHe3/JB3t/yQc7f8kHe3/JBzt/yQd7f8kHO3/JBzt/yUd7v8kHe3/JBztr////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBzt4SQc7f8kHO3/JB3t/yQc7f8kHe3/JBzt/yQc7f8lHe7/JBzt/yQd7f8kHO3/Jx/u/w0B6/8ZGu3/4uf9///////b5f3/Mznv/wAA6v8kGu7/JR3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yUd7f8mHO7/BADr/yQo7v/I0/v///////T8//8rMe//BwDr/ycf7v8kHO3/JR3u/yUc7v8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JB3t/yQc7fUlHe4L////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJRzuPSQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHe3/JB3t/yQc7f8lHO7/Jx/u/xYK7P8ICev/yNH7//////+9yfr/Ghrt/wYA6v8nHu3/JB3t/yQd7f8kHO3/JBzt/yQc7f8kHe3/JR3u/yUd7v8kHe3/JB3t/ygg7v8LAOv/Dw/s/6Wx+f//////4Of+/xYW7f8QBOz/JyDu/yQd7f8kHe3/JB3t/yQd7f8kHO3/JB3t/yQc7f8kHO3/JB3t/yQd7f8kHO3/JR3uW////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7aMlHe7/JBzt/yQd7f8kHO3/JB3t/yQd7f8kHO3/JB3t/yQc7f8lHe7/Jh/u/x4S7f8AAOr/sLj5//////+bqPj/CAjr/w4B6/8oIO7/JB3t/yQc7f8lHe7/JB3t/yQd7f8kHe3/JBzt/yQc7f8kHO3/JB3t/yQd7f8kHO3/JyDt/xMH6/8BAOr/hI/2///////L0/z/BATr/xgM7P8nH+7/JB3t/yQc7f8kHe3/JB3t/yQd7f8kHe3/JBzt/yQd7f8kHO3/JR3u/yQc7cH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7RMkHe35JB3u/yUc7f8kHO3/JBzt/yUd7v8kHe3/JBzt/yQc7f8kHO3/JR7u/yIY7P8AAOr/kZj3//////+Cifb/AADq/xcL7P8oIO7/JB3t/yQc7f8kHe3/JRzu/yQc7f8kHe3/JB3t/yQc7f8kHO3/JBzt/yUc7v8kHe3/JB3t/yQc7f8mH+3/GxDs/wAA6v9qcvT//////7S8+f8AAOr/HhPs/yYe7v8kHe3/JB3t/yQd7f8kHO3/JR3u/yQd7f8kHe3/JBzt/yQc7f8kHO3/JR3uK////wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO2JJR3u/yUc7v8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yUc7f8AAOr/fIL1//////9kbfP/AADq/x4T7f8mH+3/JB3t/yQd7f8kHO3/JB3t/yQc7f8kHO3/JR3u/yQd7f8kHO3/JB3t/yQd7f8kHO3/JBzt/yUd7v8lHe7/JBzt/yUf7f8iF+3/AADq/0pR8f//////mJz3/wAA6f8jGe3/JR3t/yQc7f8kHO3/JRzu/yQc7f8kHO3/JBzt/yQd7f8kHO3/JBzt/yQd7af///8B////Af///wH///8B////Af///wH///8B////Af///wElHe4TJBzt+SUc7v8kHO3/JB3t/yQd7f8kHO3/JR3u/yUd7v8kHO3/JBzt/yYe7f8EAOr/X2bz//P///9OT/H/AADq/yMZ7f8mHu7/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8lHe7/JB3t/yQd7f8kHO3/JB3t/yQd7f8lHO7/JBzt/yQc7f8kHO3/JR7t/yYc7f8AAOr/Njbv/+/8//98hfb/BADq/yUc7f8kHO3/JBzt/yQd7f8kHO3/JRzu/yQd7f8kHe3/JBzt/yQd7f8kHO3/JB3tKf///wH///8B////Af///wH///8B////Af///wH///8BJBztdyQd7f8lHO7/JB3t/yQd7f8kHO3/JB3t/yUc7v8kHe3/JBzt/yUe7f8SBOz/Sk3x/7zR/P86O+//AADq/ycd7f8lHe3/JB3u/yQd7f8lHe3/JB3t/yQc7f8kHe3/JBzt/yQd7f8kHO3/JR3u/yUc7v8kHO3/JBzt/yQc7f8kHe3/JBzt/yQd7f8kHe3/JBzt/yQd7f8kHe3/Jx/t/wYA6/8qK+//tsz7/1lg8/8RAuv/JR3t/yQc7f8kHO3/JRzt/yQd7f8kHO3/JBzt/yQd7f8kHe3/JBzt/yQc7Zn///8B////Af///wH///8B////Af///wH///8B////ASQd7b8kHO3/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8fEuz/LzTv/3mR9v8zMu//CwDr/ycf7v8kHO3/JBzt/yQd7v8kHe7/JBzt/yQd7f8kHe3/JB3t/yQc7f8lHe7/JR3u/yQc7f8lHO7/JB3t/yUd7v8lHO7/JBzt/yQd7f8lHe7/JBzt/yQc7f8kHO3/JBzt/yQc7f8oIO7/DgLr/yUf7f93ivf/OUDw/xwQ7P8kHO3/JBzt/yQd7f8kHe3/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHO3Z////Af///wH///8B////Af///wH///8B////Af///wEkHe3NJBzt/yQc7f8kHe7/JB3t/yUd7v8kHO3/JB3t/yQc7f8kG+3/IRvt/ztI8P8mI+7/FQns/ycf7v8lHO7/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3u/yQc7f8kHe3/JB3t/yQc7f8kHO3/JBzt/yQd7f8lHe7/JBzt/ycf7v8ZDOz/Ihzt/z1N8P8kIe3/JBnt/yQd7f8kHO3/JBzt/yQc7f8kHe3/JB3t/yUc7f8kHe3/JR3u5////wH///8B////Af///wH///8B////Af///wH///8BJBztrSQc7f8kHO3/JR3u/yUd7v8kHO3/JBzt/yUd7v8kHe3/JRzu/yYg7v8gF+3/HxTt/yYe7f8kHe3/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yUd7v8kHO3/JBzt/yQc7f8kHe3/JB3u/yUd7v8kHe3/JB3t/yQc7f8kHe3/JBzt/yQc7f8kHe3/JR3t/yQd7f8kHe3/JR7t/yEW7f8gF+3/JyLu/yQb7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yUd7sv///8B////Af///wH///8B////Af///wH///8B////ASQc7TskHO3/JR3u/yUc7v8lHe7/JBzt/yQc7f8lHe7/JR3u/yQc7f8kHO3/JBvt/yQd7f8kHe3/JBzt/yQd7f8kHO3/JBzt/yUc7v8lHe7/JB3t/yUd7v8kHO3/JB3t/yUd7v8kHO3/JBzt/yQc7f8kHO3/JR3u/yQc7f8kHO3/JR3u/yQc7f8kHO3/JBzt/yQc7f8lHe7/JB3t/yQc7f8kHe3/JBzt/yQc7f8lHe3/JBvt/yQb7f8kHe3/JB3t/yUd7v8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO1T////Af///wH///8B////Af///wH///8B////Af///wH///8BJBzteyQc7f8kHO3/JB3t/yUd7v8kHO3/JB3t/yQd7f8kHO3/JB3t/yUd7v8kHO3/JBzt/yQd7f8lHe7/JBzt/yQd7f8kHe3/JR3u/yQc7f8kHe3/JB3t/yQd7f8kHe3/JBzt/yQc7f8kHe7/JB3t/yQc7f8kHO3/JRzu/yQd7f8kHO3/JBzt/yQd7f8kHO3/JB3t/yQd7f8kHO3/JBzt/yUc7v8lHO3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHe3/JB3t/yQc7f8kHe3/JBzt/yQd7f8lHe6X////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO1VJBztxyQc7fUkHe3zJBztwyQc7dskHO3/JBzt/yQd7f8kHe3/JBzt/yQc7f8lHe7/JR3u/yQc7f8kHe3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHe3/JBzt/yQd7f8lHO7/JBzt/yQd7v8kHO3/JB3t/yUd7v8kHO3/JBzt/yQd7f8kHe3/JBzt/yQd7f8kHO3/JBzt/yQc7f8lHO7/JBzt/yQc7f8lHe7/JR3u/yQc7f8kHO3/JB3t4yQc7b8kHO3vJB3t9yUd7s8lHe5h////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO0ZJBztFSQd7QMkHe3dJB3t/yUd7v8kHO3/JBzt/yQd7f8kHO3/JB3u/yUd7f8kHO3/JBzt/yQc7f8kHO3/JB3t/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/JR3u/yQd7f8kHO3/JBzt/yUd7u8lHO0VJBztESQc7R3///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHO0vJB3t/yQc7f8kHO3/JB3t/yQc7v8kHO3/JBzt/yQc7f8kHO3/JBzt/yQd7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8lHe7/JB3u/yQc7f8kHe3/JBzt/yQc7f8kHO3/JBzt/yQc7f8kHO7/JB3t/yUd7v8kHO3/JR3u/yQd7f8kHO3/JBzt/yQc7f8kHO3/JBztS////wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJB3tLSQc7f8kHO3/JBzt/yQc7f8kHe3/JBzt/yUd7v8kHO3/JBzt/yQd7f8kHO3/JB3t/yUd7v8kHO3/JBzt/yQc7e0kHO3DJBztqSQc7ZckHO2XJR3ulyUd7pckHO2XJBztlyQc7ackHe2/JBzt6SQc7f8lHe7/JR3u/yQc7f8kHO3/JBzt/yQc7f8lHe7/JR3u/yUd7v8kHe3/JBzt/yQd7f8kHO3/JBzt/yQc7Uv///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQd7gMkHO3hJBzt/yUd7v8lHe7/JBzt/yQc7f8lHe7/JR3u/yQc7f8kHO3/JBzt/yQc7f8kHO27JBztcyQc7TckHe0N////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQc7QskHO0tJB3tbyQd7bElHe73JB3t/yUd7v8kHO3/JBzt/yQd7f8kHe7/JBzt/yQc7f8kHe3/JR3u/yQc7fslHe4P////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJBztUyQc7f8kHe3/JR3u/yQc7f8kHe3/JBzt/yQd7f8kHO3/JBzt3yQc7YEkHO0p////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BJB3tHyQd7XclHO7ZJB3t/yQc7f8kHO3/JBzt/yQd7f8kHO3/JBzt/yQc7f8kHO11////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEkHe55JBzt/yQc7f8lHe7/JB3t/yQc7f8kHO3TJBztZSQc7Qf///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASUd7lskHO3LJBzt/yQc7f8kHO3/JB3t/yQc7f8kHO2T////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQd7TckHe2XJB3tryQd7Z0kHO1X////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////ASQd7U0kHe2bJBztryQc7ZskHe1D////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==", ethereum: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjNjI3RUVBIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RXRoZXJldW08L3RpdGxlPjxwYXRoIGQ9Ik0xMS45NDQgMTcuOTdMNC41OCAxMy42MiAxMS45NDMgMjRsNy4zNy0xMC4zOC03LjM3MiA0LjM1aC4wMDN6TTEyLjA1NiAwTDQuNjkgMTIuMjIzbDcuMzY1IDQuMzU0IDcuMzY1LTQuMzVMMTIuMDU2IDB6Ii8+PC9zdmc+", futu: "data:image/x-icon;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wz///809/z/YmSl/5sAav+7AGn/uQBr/6sAav+LAGr/YABn/yQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Av///z7////L/f7///L3///g7f//frT/2QBp//8Aaf//AGn//wBp//8Aaf//AGn//wBq/9EAaf9oAG3/BgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///zD////j//////3+///y+P//4e3//9/s///Q5P/zosj//2el//8McP//AGn//wBp//8Aaf//AGn//wBp//8Aaf/hAGv/UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wL///+J///////////+////8vf//+30///7/f///////////////////////97r//8sgv//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGv/nwCA/wgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8E////u////////////v7///X5///6/P///////////////////////////////////////97r//8Ocf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGr/wwB3/w4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Av///73///////////7////7/f///////////////////////////////////////////////////////4u6//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGr/wwCA/wgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///+V/////////////////v7/////////////////////////////////////////////////////////////+fv//yR+//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGv/nwAAAAAAAAAAAAAAAAAAAAAAAAAA////PP//////////////////////////////////////////////////////////////////////////////////////////sND//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGv/UAAAAAAAAAAAAAAAAP///wT////v////////////////////////////////////////////////////////////////////////////////////////////////Q5D//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf/hAG3/BgAAAAAAAAAA////VP/////////////////////////////////////////////////////////////////////////////////////////////////////S5P//A2r//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf9oAAAAAAAAAAD////l//////////////////////////////////////////////////////j7//v9/f/9//////////////////////////////////////////9opv//AGn//wBp//8Pcf//AWn//wBp//8Aaf//AGn//wBq/9EAAAAA////Gv////////////////////////////////////////////////////9gov//AWn//wtv//+hx////////////////////////////////////////+vz//90rf//3uz////////u9f//hbf//wRr//8Aaf//AGn//wBn/yT///9Y////////////////////////////////////////////////ttP/8QBp//8Aaf//AGn//wdt///x9v///////////////////////////////////////93r///y+P//////////////////n8b//wBp//8Aaf//AGr/YP///5v///////////////////////////////////////////////+VwP/3AGn//wBp//8Aaf//AGn//93r////////////////////////////////////////5O////L3////////////////////////KoH//wBp//8Aav+LXqD/wWuo/9FrqP/Ra6j/0Wuo/9FrqP/Rd7D/1fz9//3//////////+Lu//0NcP//AGn//wBp//88jP///v7////////////////////////////////////////g7f//8vj///////////////////////9yrP//AGn//wBr/6sAaf/3AGn//wBp//8Aaf//AGn//wBp//8Aaf//jrz//////////////////9vp//9+s///j73///X5/////////////////////////////////////////f7//9Dj///A2v//f7P//8Ha/////////////5/G//8Aaf//AGn/uQBp//sAaf//AGn//wBp//8Aaf//AGn//wBp//8Pcf//6vL///////////////////////////////////////////////////////////////////////+31f//T5f//wBp//8Aaf//A2r//8Tc////////stH//wBp//8Aav+7AGr/7QBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//9mpf/////////////////////////////////////////////////////////////0+P//eK///wht//8Aaf//AGn//wBp//8Aaf//WZ3///////+rzf//AGn//wBq/60Aaf/NAGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wJq///P4v/////////////////////////////////////////////+/v//o8j//xt4//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Sc////v7//4q6//8Aaf//AGr/kQBr/58Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//A2r//5O/////////////////////////////////////////yd///ziJ//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp///l7///Tpb//wBp//8AbP9oAGv/XABp//8Aaf//AGn//wBp//8Aaf//AGn//y6E///S5P//////////////////////////////////5vD//1+g//8Baf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//8Pb//8Ibf//AGn//wBv/y4AcP8QAGr/+QBp//8Aaf//AGn//wBp//8aeP//7fT/////////////////////////////+Pr//4a3//8McP//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//XZ///wBp//8Aaf/fAAAAAAAAAAAAaf+jAGn//wBp//8Aaf//AGn//4i5/////////////////////////////67P//8iff//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Fa///AGn//wBr/3oAAAAAAAAAAABt/yoAaf/9AGn//wBp//8Aaf//t9T///////////////////P3//9Jk///AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aav/vAHf/DgAAAAAAAAAAAAAAAABr/5MAaf//AGn//wBp//+iyP//////////////////jrz//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBq/2oAAAAAAAAAAAAAAAAAAAAAAGr/DABp/9kAaf//AGn//0KP//////////////////+OvP//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aav+7AID/AgAAAAAAAAAAAAAAAAAAAAAAAAAAAGr/KABp/+8Aaf//AGn//4G0//////////////L3//8rgv//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn/2wBt/xQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGv/NgBp/+8Aaf//AGn//2un///4+v///////+Ht//8lfv//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp/90AcP8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGr/KABp/9kAaf//AGn//yZ///+oy///+/z//+71//9Znf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf/DAG//FgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGr/DABr/5MAaf/9AGn//wBp//8TdP//WJz//4W3//9jo///CG3//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf/1AGn/eACq/wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABt/yoAaf+jAGr/+QBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf//AGn//wBp//8Aaf/xAGr/kQBx/xoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcP8QAGn/XABr/58Aav/LAGr/7QBp//sAav/5AGr/6QBq/8UAaf+VAGv/UACA/wgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//wf///AA///AAD//AAAP/gAAB/wAAAP4AAAB+AAAAfAAAADwAAAA4AAAAGAAAABgAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAABgAAAAYAAAAPAAAADwAAAB+AAAAfwAAAP+AAAH/wAAD/+AAD//4AB///wD/8=", hsbc: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjREIwMDExIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+SFNCQzwvdGl0bGU+PHBhdGggZD0ibTI0IDEyLjAwNy01Ljk5NiA1Ljk5N1Y1Ljk5NkwyNCAxMi4wMDd6bS01Ljk5Ni02LjAxSDYuMDFsNS45OTYgNi4wMSA1Ljk5Ny02LjAxek0wIDEyLjAwNmw2LjAxIDUuOTk3VjUuOTk2TDAgMTIuMDA3em02LjAxIDUuOTk3aDExLjk5NGwtNS45OTctNS45OTctNS45OTYgNS45OTd6Ii8+PC9zdmc+", ibkr: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAAGqucvGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAHZBJREFUeNpiVFJSYoCB////Y2WgkVgFmRhwA6wacEkx4XIOfhKnizA9hRXsZeHGZRYT8Z4CmuL0+wuau+DqmYj0FMQtuJSBXETQU3BT4M7BF9h4VGyDuYWowMZlihQDIztYyu33F/xmMWFKI4ssYuaEiPzGphkZMGGGP1pkA8Hj//8IxgkTLrk9zFxwE+N+fyUqZeM3BS6YwMw+k40Hlw9YGAgBx1+fgeQBdj4I9xCngO2395hhyoQnN8EVwU2BgMNcgsR6DQ4cfn4ipmxAz2u4XBT78zN+76N7DQ3c/fd3LhsoBTz89xdZ3ObrO0xPsODx2m+G/6wMjEvYeaN/fLL7/gFr2YieILGQSIpWc/DhydLoYYRmz5V/f5A1bOISwF9a4iyPMMEObkE8Cpiwpv1z/35jNWs/jxCuMp5RRkaGmNoGfxUABAABGC2bFISBGArTcWoLouJhXIrgKRTdeBrBU7gTvEAXIngF1+7diq4K/oZKh3EmfclbBJqWaSaZyZcEcE20KhxpiIAACYIi7T0cBV9aNgqAo6b+LZTfeZamDUJGOAoeFyaN6YhIC+ioSrbI2EmEo/DS4sHh8E9H8EsDNuUQsH6WYmUb24gPkuL9EEckfqxZmUx5spkc+XaYtHwc/ZzHvA9qYjV09KFGlrimTXZAR42E8rOv+CECpPD8eWnWQsl22lRcIxY5z6iGWrCobdrItZqJSNusOy3v7ODA3P64B1zqhUi7vCcOGkakEIkO1TzNQefnSUs6RTiapbmFTVk4R76KzgAEZWPvuLxhzLH6CsCates0DENRPy7qg6aq+IAysPARsDF06sbGX6AOfAdiRnxAxQADAgQDM0IIISG+AVWiKWpTJQSnRq3jxO61lTPdWm5zcu/xfbi5umaXYjFkHnapf9VFcKXizQC5yFwdg2EgbZHti4ulO43dur1A4h1zCc02oVpxR3oLqgqTNDqEDiHL0oN46hdEqFC/y4r8kibPaeIh6oxQJWFSx3iB43jqLWrAPN7yEwNW63Ew1UAPWlChY1Q23ikA/PRbpFLKBk9rFTJX/d7xJjXP8k76LbUZfusuZfdWNqbsZ0meRRsbMq0HVNGfr/r3q1oQEJ2znMqRb+4cMg3nSTRe9DxiXrrN35osoXWt9mME+NJYxJikF3EkbRMb17cFP8f8BysKkTvx2Y7hq7cG0XXLSyC1HTNh72dk0bL6kXa7Xcy5eNhoqQ/4+I05pWzR33JCj6JQ/fpNo7NJM2mfzCZPydypDIBr+hJ4F2zyDhCzgFg5nI3lzp75WK1VBcP3UBJv+WstFcN6+7Qe2EVpZ1PyR4H9iL0abrWW2Gb8utnZYdwpTCpXwJeeT7NvNJw12oLRwWSEoWLsh+y0vtN0QlJOHPDY2hJ63w+/8F2yg6j7i4tnpxljrX5Ls8mfAKxav2sUQRTefZO92zMxh5DCf8AiBKxtDKawSaHiH6BVilRCsIm9kM4moIWgKFZiEAwRUcE/ICBErCxFU6SJP5Jwyd6OR3ZnnNuZ3X3vzTyuup27ezfve9/M+94LUJeFKoAcQjr13yDJvfnNaq+BSvbBC8XKU0D+odanzh9+qhpV+M2DUMGy31wT6e3skLp5ELyqL2w2BlMdxO8T4HmFBJ110bNLaRqoScFq9thu/5JBHTBYhTc3Tg6owSLwEKO8/x1JHkkCO8/tNdqb5/kxjyQju1HNJuVHBuU8UbdExmECQYJ1KRYX4vKr/tQHC7NP4E/Ko6+4L1L9znXVrg8Aah4pvx8XHjxPfvDM84oMosmQD2ofUrZFGRIp13ZyeKRse3PLIEM8qB1ZxgjWC5cY8l11WnjBKrOM4c1iLM7HVc3lraqQqGUn7fphW0fKFVf7smirMrYEdZY1fHLLpS5mHnlem2WY1XU62lUl6bGhg80yjDdsUnauwV7yG7xZGN+eRMpn3bMf0v5N0WEIsV4Kmr3SHM66k/RGr695tjz4S5CFPUXPFVVXVLzRNgcTm2kfT7nAA4S2z3nZ9flUL3pOK9IKk2UNtp1nyJV6sI6TZXjP7p6U8boIBKGm+ZID7GCZltCOZpY+1OqZHlUcPd2WGcMD5zEKVA1K2+POJH4nLiudutVRJqiLWZWHnTN65ZVG4Vyi8QCMA1n/QBrFq0lZ/eRSXnP5lBsyPua6DIzT56f8P1A6C2JBJMXKfSnnj/YfHJeptyvzkSvzFG+YoP4lpTAuaEsT6ZdhtqemnjeywcZpi4h6LW65oNWBeuDAQ7TenYrp3f4IM/PdCupv4wPA2l6m0/7etOhD1G1/3ev7yIG1+lADA+20dRfeqBFjtpYKmI+R9mnrdBKLGqwxUCNv5jttrSBt7ybPMYJFBvWQkr0fXWPYGP+woP4hh1RGeWVM0eGjjwX1rjGQiLSZGO51p0g6eFSMseNh5DOoh9wtAqjZIjopVf8JQM21hDYRhOGZzWTz2PRlKd5E8OrBgwcPpVDsoXhUa0EED4It9OrJgrZ3PQgFi1iUomALFaoeFCqlKOhBvUktevGm2Jclj012s+skIXGT2U0m89r0p4cyyezjyzf//PO/AuNlzGYkf+yGTQ1JGkQCoWFwUjIoY8WQocNOHPovi3TBCkQnKLOG/4WXUTLu+gMhCp3WDJK0rDjHx7XodU2fsnM54MpmEzpcyyoF4Go5EXm+mN+stz2UKunO1Me1MMZ7x16uN1yVKukOJM69SPxkNR9hx3VvFU0Z+th3EInVx0JQ8w6egpG7nrgpljE7o3LLRx2rjyEAa0R8hyFyymkxoM5cVi9RMklkY1Mm2QgcBGQxR+jLakrTz2tR8gtnlaNDZUmrJM4AgM+QfyRu3M648vWx7zjqEHR8i1UqMls0/wSY40qVdFhmzqNI4hgMPPGsONZGQBxOuD4GlFlwTU5Pze/X1q+EZRgiTJwm6Gy5zpxtyjhtsR811OhjfNc3qEV4LQ/AJJH8qHgLqztqKNM4GBoaJ8soUU0vWx8328XUoHM7EhuCVB6oYSXo0Dw/UqOPjwP4ENGm9jCjI8P9hmSfHoLqTYNXVjqsZdWGP0gUakuRRD+A9OhMWllvPDmsZdUCICHEGYNootqEh1Lmivmtqg8sFH1M5TDjv7QB4Kon751SsDW44ldHGRZxfM5iQvQxfZKlV/BJYqbcy4G87GkN3YkGXtMG4LJ58MsTZhVOKCTPDUgpeM4lT9uomjNovVWNdeXpK51wsOYaye4LeVSfNnMholPy8hD5xPO6QYOOV2IAvkv2XYnGmY8UQd9HopQZGzq1Xlg1WdCNEzDCdrWJaAK/z2PLFPgKGj9xeLhDzmVGpyLXookmxGH4gRHP8mGGBstFK+0Q00f8fIlChDm1S+PxVzDjNW1ltx2HnL5RXwsnChq2Pb5FmaYoQ4OUPeB+INL5KtMxPBng8sCxZhd4vFfkLK3dFcuJjgncbdd5oBsLuuF7o3PmgcmK0eeiNZNPcxqHDZ/+7zMihDgN7UgaBC+qH24Rls0cWGYvButGIUte8yjUvLmzNDKU2XUkuP00NcSpCNmGYwBqi7HUVRRvuPtv1xnK7eO/j8UWyaNPLXMwsztIgQ6bK7mOQfznnXW9K+gJNh27xBoIvQyq/lPyS88WMt+ITGxRxirbR4A+z5WTTV8pWrjM6MZSvDvmcY/wK0dm4lB5FFWiU5Mn8S6M0IXcX9kmPm31YVtmDuWgV747RYY96XmiZ7FeSYu1j+kD7po84oBSArrDvGd3Q/gi2TsdM9iIw4OOd7omkDgNI/uus9N+QnyDnIlEXyV7B5Eu1j6mP5TIUtIF4P5sv34hSG7GjNdGX49f1akk4lA5zHiCLVgxa0CwLCd7NU+PMhkax2cXk7G7f3EsCGTJ29QRC7ij6T0F6EhR0p+oC6eYBdtKG6n+++WaORnLKtAfxM8mshWlpHiebOL4ABR6XY1YRxc/NCxKunPiebKJU5N/ApB3daFxVFF45tyZnd1s/losRVI0gj5Ii9SCVkVRSsHf+hBFC61oBRu0Kgq2KkqDD2rrz4OmRh8kraJSTEspNuDfQ9WCPqjgk0pEWy0U0thI0k32Z3bHMdvUye6d3ftzzp2t3sdh587smfud+51z7/nuf6dejOgzA651cG9XFvzFemFLWTsQ12sSGQLlIiabU1xZbdViTLkRRAQuigUl/RfDrzhERJDUI661GV2CWNoHtRq4rrLZEV4qDhdxcI6Ca4llP828gBJcnFAjcXAJWi38qnudtvV+jhRcOBDDBZfgj6tioONGiL6WVlcipLmqovhcOW+GNIFh16P5+90sU5W8/CJmdR+9AYUJiEjzNvCqlS8H6lJOppk0YroAC1xrbOdGODOlDJYLSTLpFpzXe2x4hp2Rkx1TXSlRm+BA4XUNk+Zw2Lwb2Xi9xZ+hDuIVTwJIClzRyrJCRPbXTOwKLQ6umrq7fn+GFFyNSjJbkDS/z9pqmP7vqpvqWyVhhjivDzCvRnX81cjkZSwxJCopb5g03wZOfW3iaMMVN6IFBbBajzRfZMPjdRrxH0esYzKdppswQyfNoWHe5lVTvTSPL9M56VYjzVxF/+N6xy/o+HVoKXB9HlPdunm+moyUNIuGGkmB60OHf6RqeW77uQHSLM2kTYJrB0vHlf8+PEcOzYNLC2K4pPlucK+Ir4L6WSY6Rd8oANQIavpnLrVhc3x99JvlgjHSbCmfgUYHrnbL3tWwRHqkUkp2iZXkKEbxVznYUK/iq5gd6AZcj6IPwp3Xm0pWDJTzya5BKybMUOb1A820TiaSk+WKDTWMges1lu5spulxvyl1pcb/F8yDaxOkVjQrbQ7mT080QPG1yqHQSfNKm20UKG3eysscag4KNTYEFK4n7lW6LbtGmDWufSdWWUcKLtFZDIs0hy5nv5gI1Z6Fy17GSDO3OZYp0iyuQ/VOXfW8GdLMDzXMgOsjYQEzM+ASf3+gBld48S2WaRMW6tqqui5oehsw1ry+BVKX2KJkIpzaDRBnqQ9Mu7K62oI+Gb2SGnLYCkUhQAeu84IFp1SLtIkgSARcCPVisr1XtxFK9bNdMvGMTpqbx2KIU/6n8mpv0eRGIqSZJBbjXh+Vt85IhPu0CLg4EENxPcMs7ckjZaghezZDmrm/d5S74LYnIHWB/Mz4U6SAnPsaK8G5k6VWsZCM21NB8E3F/8Av/Kp06qzsdbu3txdx+KgJTa4tTpdj+nzDzS6PP6B4tFzcGZEfwtXgFIrmDVTj5K2Aa51rwDnsdS5veHzzrSz1ZaZ7qQ0WWckMWGQFA4LtgRIn9fOok37BFR2MI+nO1cwlInRoK6vKH/D4/EG/Z6/cxNw+Jqck/HIqu9QGig8JyeqU7vDz9Zh/yskodLUv06X5IRFiMfS8zCd1m8b2xYt8Nc8EpNrQg21IEFzVLXU1ty+21WU/bnc89DkHkgJX2F6pO1TkHuZpDskL42c9nJJMY1W2x3h7NjY4Kc1uNzpp3OVfozvMoq2/lKu/PW3pyupcjTTf86N5Y+AKY4Q8Te6wi+fCdPLuYB5cYXuwmCN60Gmk6UV3j6LmmBqLkTfTt9APwpWIgm+rsrKqaZ3X/Xzc7Ye09aRHSnkscDWPxYgWUnriY4LBUl6z82/LJSkECQWrJrnitBVcBiwu1CroLfuMVcq4b2vJrqzqj6kTc/TnFuZeCXzxq7sK08oG2hRRgMXS9gJNQ0hZJxp39Tter835PONB5euyio7ei4UcoutRCTX0228Lk6QDbqaetoRPf7KYOylZuXvYL476BVxwyTFpFIdd/6cHU/zj/O7IT30vLLI8XJp9Vk/K3tLcxIlinThp191eO7fPxwqnN+SnGvdZtIK1ucnh4iwFuDgGIt1zOxNPA9/zOrhP/yOoXDczuW72ryN1XumQX7ghd2pNblJQjll5QfRfTXsULbE4TfvQ9f5pVary9VFN+3lZezuE07288ZK4KiVguZ7Gj5mwmjjdkBcNeR0U1tF024DiZRr/UjCAXGzbz6ey6ExVc7cBWPQJVnHl7YuBPeJmEJ+uX24H1OCSVSW/nrnrnFTrCOIC9VaKMZkzI6rtPjd9OXNIx4j4Xei66rXNV7pru5ftAUgWXHKhhtrwORr4yq84lO5oE1D5pwOXCSY9pfcZ92a6wPi8TgixmmePax+qEbaDbd2IJlBQuAG64XMC6VyN0ewiaroolA/Cnc5yFlpY908VzMJxZAZczZm0zrN/qfiI4A299Z75zRuGD0mQ3h8k8qSKZaGnBc4H2JluNzCvi4YaOhd/RB0+Z9sq5j6UylDP67UGomDSRYsqr9Tnpm92PQOuh5BJH8U7FIrbtnnZFcwxAC4qJn0Kg/40brsynUtsoAYXCZM+SW+datuf7W66VwYlg4wpjxNePEaMr2j7rH2RRX+Gjb1s2TIirojFzpM9/wjOUesYAJcixBKvsqUjzdKhRuLSNMYi0iYG+l+BS7bbvwVo72pjrLjK8Dlnzp2ZO3vv7gLZSmODG8n+EWvkh8a22prYNMZQI7+MbaThw34YaBdjQipRElSo/YRWtAaiqLW0TUgrrjZpEdsm1YrxRys0IZYtIhTYxuwiez/nzDnO3nVv7+7emTkzdz7OnJkn/IDwzp259z73eZ/zzjvnxX7niyUiB4FfJOpCbUQ3hBKM9PuCOKdODOyROBLn7IlUS+Rjz4IwnFNH1rQVz6lxzp5ceHqJRJllj+eI8KjZsxYVrneYXxmbRPUeGdp8zN7ZE/hFAhwYqV/2DB6B6A+4jzL2Ot+dsVC+6YjoiLMmPMmmLQPAvYr+UYieo+YL1ExEeMJ1UTinTmzs2Yq0Na2Hv16h5MketmEVimQ4Z08MwTdC/D1Fm729+TazdnLMhk2Ls8ZZYE+CwrMcwn1KcXDu3vglxu7j2CQyRUt6nAtPdO7yAUVf3bFlfw2wTaRqybWkxzl7ogi+HRU2zB9SZEdvIjX3ht9UVB3BotHAOXXCZM/HofKIoi/+WLeS2gXXhjLx/TIIXInOhYcnuH9m+Jf+4W470u+26m85d9uluhKNJWNPIsJjO+T7Fe0LsPuH+XOr+bJzwTAVftklGOdpq8fIWyDe5rzd4xg1n6JN+YTHm0B52vIMXgHRE4pecm5fP86sRx0Khmn0y7wEyoXHM9gWnIeV4sdcB/C8y+j9DiWflPplLgLlwuMZfCdSv+o1nWgKsHtIlUmathwJlPtl9+BPQWWXons2MNiGeaNZbUrnl7tG4jxt8UQuA3AfLg7x7Wx9N6lOzi8Yyic8oPNWRp62XIJtvdmp6Nd5DRFuYzupj88vGErjl7tG4lAawWT1y2tRYTPyMXDgcavxl/l7I8nkl7sG41x4ugaPQLRHKfoaVXmINjt7xCROW6ERSEq/bAC4R9FXQn/Nvsco2e81jTHtfpm3DpRlvzyKtFuR78/kBLN+MNcjlhHh6YlAUqatz0G8Y65p0BcuMjo6VzCU2y+HQCAp/fKCpkFfqM70iNVoNvxyrwSST3gWNw36u0gAvkFqVcCylraCEEg+v7y4adAvRls9YtnxywEJJJ9fdmoa9IVdVv0fzMpm2uoMxplKWy5Ng75gr9hf5h5RJY1f7hqP5RaedrB706AvHKHm06E+Fpg64QGeT2VIJjzuTYO+8AYlj5F6ltnjfStDJr/s2TToC+POPWJZ8MvA81aGTH6Zp2nQF6YYu9us5MLjSCCZ0hZP06Av2IZ5PamYsrAnxF8vBnL5Zc6mQb+wtWeKsQwKj2c8lkZ4Wk2DxlBIdqcTtu8ZD+OhUmnSloeJTp1fhoztVPTrg96RcIe95nrDdR+x7PjlcAgkml/+CipsUVQQDX5jNY847yOW2bQVnEBCpa2VAO7Fhg6iwlFqHnAuGGY5bQUhkFDCYwD4GNJWwghH477FrB86FAxz4fFNIKGE5z6oBmga9IULjI6a1Vx4eA7BibOYP/6zUNmBNAiixUyPmFlluV/mOwQnKDz88ctbd9EHQdTkmZn5utGsVhftI5anLad4nBR7+FeJu5G2Opol+mLca1YvLir55GnL5RAssvDcDgvrQ70j4Y7vk9rJ+fuIcV7ntUj5EircpBQMPo08z+hLVvP3pDkRUn0y5rTVCTg8PCysXz6qGLGx52dW4xmryX+pQxBtwdqNPfO7AdivzcbTpE5SJTzdFSil8/16xwuWyc+edYq2AWthnVoDcFNBt/9cYWxbs3KiVfUW0y+7ESil8/1CwZ8p2duxdbzL2W3erFO0iC6jDOFPtJItSKP16ROMiMAe3nthKR2zFQpOM7q9o0fM6ezDED2p9unRLwNtQfqpXj5Jyeb6FSJq2uoESt2YrRAx2dEj5vK+vqyoB9VSDOxpYxXCLxqDyx1K7ZF+BX4PQZEKT7hjtsKFbXk2mBXi9b5s9nwL6yB22Hw9VBwYWsSh6L6CYIegDArPLO4yK1OtgqHL2VdCJRH2tO3F43pZTOHxR6Bk5/tFgW2kdqb1UKn72TdjDSSKayBa27qGGPxysC8Cha4lwq622niE1I9T4nn2qyBaHfFdWx58EasxpK1g1+bxZKo0ZZ5OPGU1x6jJc/aRKNtF+DGCot0AI/Cc2nl1IIkX6p14iZoH+B4LBCDGRZcrCoJRB3iOexJEeELn2ZvM2mX6eCzwPUpFINA5agnLni4eSBC/HDp73mN0a7Pi69SnmXWOJc+hV7x2cYjNL3c9EInml6NYlxEA7jEr1P917ufOdxGhAdjBZk0Qv+y2ChOkzBORPfo3sx4uGOuxWzdj10/A/vWPWc0ECfSd+nTdYUpmgmlrIYFEqC9HVxA6y/7/WNcNCO9X+25WCr4+oIfM2h+5twIKF99tTP+126ljqC/zH6gMDAwIKzx39PzA1wVGq4DBjlXVtUhZo6jjjL7PGOdFvkpnOuw/HWNNyFaddbX/vmkRYYXH0URL4JfbmGD0Sjf9VwD4NtafUI2ruJfqz5r1NfXLZ5kVA3ueNxs3VybPdlt8iSM8HxQ7VqxYIazjOVYoBf4aJhm9BChqUaRTgWDH7wbO2CO6q1mrck/jXg7Ro1rpmmhqjC+SxgONiiWw4wlCoAT9cmAC2cJz3v4FQ+BJoNl//o2SfWad+ll6fB3r6wp6KA3bl2wSNyp/t8wQqRDbnhkeBEr2MYNgBLINxLvMggzwE6j1F3iYNJ73P+9iFcJfw9oNSsHXgyOXGRsjjefM+n/C66uPmToeBEp8oW5H/kktByj5vEOJbZsDEGj2L3vM2nE/y67FldkPQfQRpCyFsASgAmGDsWnALlJ6hpLL4vVj9Hggjo0QMRSE2Ez5mPTiyW0CbS0U6wV9R6Ny1qsM3fUiaWvpd8GiPb6jxCuEnEDxLKDiKQidplYoy6QigA9qpT1aqR/CmH85QIz6ckACiZC2Ar+TfzGrAcKsCFwN0X6tvF01cG+/MSZd2upOoGTlpMdK9HlGp6OpJ30S4Wf0/jvmGltFE56oyzyeL4IiTVvx/BQmGJ2M+Lb5rVg9XOy/ifs5VOmFp/0iKPH6co/vZ5KxibiaLu5Vi88a/SNISdb/iiA8jiY6LX55FnbaOhfL7YU2VAAf0koHiuVlzg9tyeqXgcNY9FSmLdDqlRnnewQ4dAxB9Iti/269pHbcTctO2vJBIAH98ixs2fkntUCiWIXwYWNgi2pkxC9z1YHEER6XSPs/TlEiRMcyALdgdcwYXFPQMiU8HgRK1i97nv0dSkzAgEj4pmoc6VvyCSXkAX7CCo8bgRIvCLkHnGFWVTD2zMLmzo/08iFj4GqIpPTLXAQSvCB0nllTjAKBsQSig8bAj4v9BoSypq3uBErWL/NEvs/ohNjsaWMEKb81BrdrfUAiv+xGIPEr0bbwxFzy6R2fx+rR0tLb1KJ8wvMBgQT3y7OozpR8UsaeNjaqxWOlpZ/BBZmEh7cOlKxfnoW94DpFCUgzbDe0Wy//rm/JsMNtkNQJjz8CJShRtuU5SQkDMqAM4S+NwV8ZAwvajNLLHiB+JfptSgiQCrYIjfUtfVAvo9SmLV4CJe6sTzFSBwzIiOtw4bXSso2qEb9mhPgiIJT9gaKbYXNnoxI/cYG8/cvhUseRQPLNrk7L2IDUsacLgZJd0qeIOjl7FhIoF56cOsEJlIpvWoL5fpKxx8b/AMLAMvw/urWiAAAAAElFTkSuQmCC", paypal: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAzMDg3IiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+UGF5UGFsPC90aXRsZT48cGF0aCBkPSJNMTUuNjA3IDQuNjUzSDguOTQxTDYuNjQ1IDE5LjI1MUgxLjgyTDQuODYyIDBoNy45OTVjMy43NTQgMCA2LjM3NSAyLjI5NCA2LjQ3MyA1LjUxMy0uNjQ4LS40NzgtMi4xMDUtLjg2LTMuNzIyLS44Nm02LjU3IDUuNTQ2YzAgMy40MS0zLjAxIDYuODUzLTYuOTU4IDYuODUzaC0yLjQ5M0wxMS41OTUgMjRINi43NGwxLjg0NS0xMS41MzhoMy41OTJjNC4yMDggMCA3LjM0Ni0zLjYzNCA3LjE1My02Ljk0OWE1LjI0IDUuMjQgMCAwIDEgMi44NDggNC42ODZNOS42NTMgNS41NDZoNi40MDhjLjkwNyAwIDEuOTQyLjIyMiAyLjM2My41NDEtLjE5NSAyLjc0MS0yLjY1NSA1LjQ4My02LjQ0MSA1LjQ4M0g4LjcxNFoiLz48L3N2Zz4=", safepal: "data:image/x-icon;base64,AAABAAEAMDAAAAEAIACoJQAAFgAAACgAAAAwAAAAYAAAAAEAIAAAAAAAACQAAAAAAAAAAAAAAAAAAAAAAADvIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8iS//vIkv/7yJL/+8iS//vIkv/7yJL/+8iS//vIkv/7yJL/+8iS//vIkv/7yJL/+8iS//vIkv/7yJL/+8iSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yBJ/+8eR//vHkj/7x5I/+8eSP/vHkj/7x5I/+8eSP/vHkj/7x5I/+8eSP/vHkj/7x5I/+8eSP/vHkj/7x5I/+8gSf/vIkv/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yZO//ArUv/wKlH/8CpR//AqUf/wKlH/8CpR//AqUf/wKlH/8CpR//AqUf/wKlH/8CpR//AqUf/wKlH/8CpR/+8lTf/vHkj/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/8T1h//aAl//3k6f/94+k//eQpP/3kKT/95Ck//eQpP/3kKT/95Ck//eQpP/3kKT/95Ck//eQpP/3kKT/94+j//V3kf/xQ2X/7yFK/+8hSv/vIkr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8iS//vH0j/8CxT//aHnv/95uv///n6//719//+9vf//vb4//72+P/+9vj//vb4//72+P/+9vj//vb4//72+P/+9vj//vX3//7z9f/7yNL/81V0/+8gSf/vIUr/7yJK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7x9I//AzWf/3k6f//vL0////////////////////////////////////////////////////////////////////////////+8vV//NVc//vIEn/7yFK/+8iSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8dR//wMFb/94+k//7u8f////////3+///+/v///v7///7+///+/v///v7///7+///+/v///v7///7+///+/v////////////vM1f/zVXP/7yBJ/+8hSv/vIkr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8iS//vHkf/8DFX//eQpf/+7/L////////9/v///f3///3+///9/v///f7///3+///9/v///f7///3+///9/v///f3///3+///+/v/7ytT/81Rz/+8gSf/vIUr/7yJK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIkv/7x5H//AxV//3kKX//u/y////////////////////////////////////////////////////////////////////////////+8zV//NUc//vIEn/7yFK/+8iSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yJL/+8dR//wMVf/94+k//3g5f/96Oz//eXq//3m6//95uv//ebr//3m6//95uv//ebr//3m6//95uv//ebq//3n6//+9Pb///////vM1f/zVHP/7yBJ/+8hSv/vIkr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIEn/8ChQ//E4Xf/xO1//8Tpe//E6Xv/xOl7/8Tpe//E6Xv/xOl7/8Tpe//E6Xv/xO1//8Tld//E/Yv/3ip///vT2///////7ytT/81Vz/+8gSf/vIUr/7yJK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yVN/+8cRv/uGUT/7hpE/+4aRP/uGkT/7hpE/+4aRP/uGkT/7hpE/+4aRP/uGkT/7xtF/+4VQP/xP2L//efr/////////v7/+8zV//NVc//vIEn/7yBJ/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yJL/+8cRv/xOFz/9XmS//AzWP/vHkj/7yRM/+8jS//vI0z/7yNM/+8jTP/vI0z/7yNM/+8jTP/vI0v/7yVN/+8bRf/xOV3//ebq/////////f7///////vL1f/zVXT/7yJL/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIkv/7x5H//AvVf/4l6r//Nbd//E7YP/uGUT/7yNL/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yNL/+4aRP/xO1///ebr/////////f3////////////7ydP/8k1t/+8gSf/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8iS//vHkf/8DFX//eOo//+9vj//ent//E6Xv/uGkT/7yNM/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yNM/+4aRP/xOl7//ebr/////////f7///7+///////+9vj/9oCX/+8nT//vH0n/7yJL/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yJK/+8eR//wMVf/95Ck//7t8P///////eXq//E6Xv/uGkT/7yNL/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yNM/+4aRP/xOl7//ebr/////////f3///7+///////96e3/9GyI/+8kTP/vIEn/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7x5I//AxV//3kKT//u/y/////////////ebq//E6X//uGkT/7yNM/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yNM/+4aRP/xOl7//ebr/////////P3///////7v8v/3j6T/8C9W/+8fSf/vIkv/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8iS//vH0n/8C9W//ePpP/+7/L////////8/f///////ebr//E6Xv/uGkT/7yNM/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yNM/+4aRP/xOl///ebq/////////////u/y//eQpf/wMVf/7x5I/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8gSf/vJEz/9GyI//3p7f////////7+///9/f///////ebr//E6Xv/uGkT/7yNM/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yNL/+4aRP/xOl7//eXq///////+7fH/95Cl//AxV//vHkf/7yJK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yJL/+8fSf/vJ0//9oCX//72+P////////7+///9/v///////ebr//E6Xv/uGkT/7yNM/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yNM/+4aRP/xOl7//ent//72+P/3jqP/8DFX/+8eR//vIkv/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIEr/8k1u//vJ0//////////////9/f///////ebr//E7X//uGkT/7yNL/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yNL/+4ZRP/xO2D//Nbd//iXq//wL1b/7x5H/+8iS//vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yJL//NVdP/7y9X////////9/v///////ebq//E5Xf/vG0X/7yVN/+8jS//vI0z/7yNM/+8jTP/vI0z/7yNM/+8jTP/vI0v/7yRM/+8eSP/wM1j/9XmS//E4Xf/vHEb/7yJL/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yBJ/+8gSf/zVXT/+8zV///+/v///////efr//E/Yv/uFUD/7xtF/+4aRP/uGkT/7hpE/+4aRP/uGkT/7hpE/+4aRP/uGkT/7hpE/+4ZRP/vHEb/7yVN/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yJL/+8hSv/vIEr/81V0//vK1P///////vT2//eKn//xP2L/8Tld//E7X//xOl7/8Tpe//E6Xv/xOl7/8Tpe//E6Xv/xOl7/8Tpe//E7X//xOF3/8ChQ/+8gSf/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8iSv/vIUr/7yBK//NUdP/7zNX///////709v/95+v//ebq//3m6//95uv//ebr//3m6//95uv//ebr//3m6//95uv//eXq//3o7P/94OX/94+k//AxV//vHUf/7yJL/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIkr/7yFK/+8gSv/zVHT/+8zV/////////////////////////////////////////////////////////////////////////////u/y//eQpP/wMVf/7x5H/+8iS//vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yJK/+8hSv/vIEr/81R0//vK1P///v7///3+///9/f///f7///3+///9/v///f7///3+///9/v///f7///3+///9/f///f7///////7v8v/3kKT/8DFX/+8eR//vIkv/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8iSv/vIUr/7yBK//NVdP/7zNX//////////////v7///7+///+/v///v7///7+///+/v///v7///7+///+/v///v7///3+///////+7vH/94+j//AwVv/vHUf/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIkr/7yFK/+8gSv/zVXT/+8vV/////////////////////////////////////////////////////////////////////////////vL0//eTpv/wM1n/7x9I/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yJK/+8hSv/vIEn/81V0//vI0v/+8/X//vX3//72+P/+9vj//vb4//72+P/+9vj//vb4//72+P/+9vj//vb4//729//+9ff///n6//3m6v/2h53/8CxT/+8fSP/vIkv/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8iSv/vIUr/7yFK//FDZf/1d5H/94+j//eQpP/3kKT/95Ck//eQpP/3kKT/95Ck//eQpP/3kKT/95Ck//eQpP/3kKT/94+k//eTp//2gJf/8T1g/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8eSP/vJU3/8CpR//AqUf/wKlH/8CpR//AqUf/wKlH/8CpR//AqUf/wKlH/8CpR//AqUf/wKlH/8CpR//AqUf/wK1L/7yZO/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8iS//vIEn/7x5I/+8eSP/vHkj/7x5I/+8eSP/vHkj/7x5I/+8eSP/vHkj/7x5I/+8eSP/vHkj/7x5I/+8eSP/vHkf/7yBJ/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIkr/7yJL/+8iS//vIkv/7yJL/+8iS//vIkv/7yJL/+8iS//vIkv/7yJL/+8iS//vIkv/7yJL/+8iS//vIkv/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv/vIUr/7yFK/+8hSv8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", tether: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMjZBMTdCIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VGV0aGVyPC90aXRsZT48cGF0aCBkPSJNMTguNzUzOCAxMC41MTc2YzAgLjYyNTEtMi4yMzc5IDEuMTQ4My01LjIzODEgMS4yODEybC4wMDI4LjAwMDdjLS4wODQ4LjAwNjQtLjUyMzMuMDMyNS0xLjUwMTIuMDMyNS0uNzc3OCAwLTEuMzMtLjAyMzMtMS41MjM3LS4wMzI1LTMuMDA1OS0uMTMyMi01LjI0OTUtLjY1NTUtNS4yNDk1LTEuMjgxOXMyLjI0MzYtMS4xNDkgNS4yNDk1LTEuMjgzNHYyLjA0NDJjLjE5NjUuMDE0Mi43NTk0LjA0NzQgMS41MzcyLjA0NzQuOTMzNCAwIDEuNDAwOC0uMDM4OSAxLjQ4NDktLjA0NjZWOS4yMzU2YzIuOTk5NC4xMzM3IDUuMjM4MS42NTcgNS4yMzgxIDEuMjgyem01LjE5LjU0NjZMMTIuMTI0OCAyMi4zODlhLjE4MDMuMTgwMyAwIDAgMS0uMjQ5NiAwTC4wNTYyIDExLjA2MzVhLjE3ODEuMTc4MSAwIDAgMS0uMDM4Mi0uMjA3OWw0LjM3NjItOS4xOTIxYS4xNzY3LjE3NjcgMCAwIDEgLjE2MjYtLjEwMjZoMTQuODg3OGEuMTc2OC4xNzY4IDAgMCAxIC4xNjEyLjEwMzJsNC4zNzYyIDkuMTkyMmEuMTc4Mi4xNzgyIDAgMCAxLS4wMzgyLjIwNzl6bS00LjQ3OC0uNDAzOGMwLS44MDY4LTIuNTUxNS0xLjQ3OTktNS45NDczLTEuNjM2OVY3LjE5NWg0LjE4NlY0LjQwNTVINi4zMDc2VjcuMTk1aDQuMTg1MnYxLjgyODZjLTMuNDAxOC4xNTYyLTUuOTYwMS44My01Ljk2MDEgMS42Mzc2IDAgLjgwNzUgMi41NTgzIDEuNDgwNiA1Ljk2MDEgMS42Mzc2djUuODYxOGgzLjAyNXYtNS44NjM5YzMuMzk0LS4xNTYzIDUuOTQ4LS44Mjk1IDUuOTQ4LTEuNjM2M3oiLz48L3N2Zz4=", wechat: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDdDMTYwIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+V2VDaGF0PC90aXRsZT48cGF0aCBkPSJNOC42OTEgMi4xODhDMy44OTEgMi4xODggMCA1LjQ3NiAwIDkuNTNjMCAyLjIxMiAxLjE3IDQuMjAzIDMuMDAyIDUuNTVhLjU5LjU5IDAgMCAxIC4yMTMuNjY1bC0uMzkgMS40OGMtLjAxOS4wNy0uMDQ4LjE0MS0uMDQ4LjIxMyAwIC4xNjMuMTMuMjk1LjI5LjI5NWEuMzI2LjMyNiAwIDAgMCAuMTY3LS4wNTRsMS45MDMtMS4xMTRhLjg2NC44NjQgMCAwIDEgLjcxNy0uMDk4IDEwLjE2IDEwLjE2IDAgMCAwIDIuODM3LjQwM2MuMjc2IDAgLjU0My0uMDI3LjgxMS0uMDUtLjg1Ny0yLjU3OC4xNTctNC45NzIgMS45MzItNi40NDYgMS43MDMtMS40MTUgMy44ODItMS45OCA1Ljg1My0xLjgzOC0uNTc2LTMuNTgzLTQuMTk2LTYuMzQ4LTguNTk2LTYuMzQ4ek01Ljc4NSA1Ljk5MWMuNjQyIDAgMS4xNjIuNTI5IDEuMTYyIDEuMThhMS4xNyAxLjE3IDAgMCAxLTEuMTYyIDEuMTc4QTEuMTcgMS4xNyAwIDAgMSA0LjYyMyA3LjE3YzAtLjY1MS41Mi0xLjE4IDEuMTYyLTEuMTh6bTUuODEzIDBjLjY0MiAwIDEuMTYyLjUyOSAxLjE2MiAxLjE4YTEuMTcgMS4xNyAwIDAgMS0xLjE2MiAxLjE3OCAxLjE3IDEuMTcgMCAwIDEtMS4xNjItMS4xNzhjMC0uNjUxLjUyLTEuMTggMS4xNjItMS4xOHptNS4zNCAyLjg2N2MtMS43OTctLjA1Mi0zLjc0Ni41MTItNS4yOCAxLjc4Ni0xLjcyIDEuNDI4LTIuNjg3IDMuNzItMS43OCA2LjIyLjk0MiAyLjQ1MyAzLjY2NiA0LjIyOSA2Ljg4NCA0LjIyOS44MjYgMCAxLjYyMi0uMTIgMi4zNjEtLjMzNmEuNzIyLjcyMiAwIDAgMSAuNTk4LjA4MmwxLjU4NC45MjZhLjI3Mi4yNzIgMCAwIDAgLjE0LjA0N2MuMTM0IDAgLjI0LS4xMTEuMjQtLjI0NyAwLS4wNi0uMDIzLS4xMi0uMDM4LS4xNzdsLS4zMjctMS4yMzNhLjU4Mi41ODIgMCAwIDEtLjAyMy0uMTU2LjQ5LjQ5IDAgMCAxIC4yMDEtLjM5OEMyMy4wMjQgMTguNDggMjQgMTYuODIgMjQgMTQuOThjMC0zLjIxLTIuOTMxLTUuODM3LTYuNjU2LTYuMDg4VjguODljLS4xMzUtLjAxLS4yNy0uMDI3LS40MDctLjAzem0tMi41MyAzLjI3NGMuNTM1IDAgLjk2OS40NC45NjkuOTgyYS45NzYuOTc2IDAgMCAxLS45NjkuOTgzLjk3Ni45NzYgMCAwIDEtLjk2OS0uOTgzYzAtLjU0Mi40MzQtLjk4Mi45Ny0uOTgyem00Ljg0NCAwYy41MzUgMCAuOTY5LjQ0Ljk2OS45ODJhLjk3Ni45NzYgMCAwIDEtLjk2OS45ODMuOTc2Ljk3NiAwIDAgMS0uOTY5LS45ODNjMC0uNTQyLjQzNC0uOTgyLjk2OS0uOTgyeiIvPjwvc3ZnPg==", wise: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMTYzMzAwIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+V2lzZTwvdGl0bGU+PHBhdGggZD0iTTYuNDg4IDcuNDY5IDAgMTUuMDVoMTEuNTg1bDEuMzAxLTMuNTc2SDcuOTIybDMuMDMzLTMuNTA3LjAxLS4wOTJMOC45OTMgNC40OGg4Ljg3M2wtNi44NzggMTguOTI1aDQuNzA2TDI0IC41OTVIMi41NDNsMy45NDUgNi44NzRaIi8+PC9zdmc+", bochk: "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAD/////////////////////9fX8/7yy6f97eMj/OSaw/y0WrP9dUrv/lo3Z/+nn+P/+/f////////////////////////7+/v/+/v//x7/s/0M+sP8MDJD/GRWc/w8OnP8EBJb/Hhuh/woJkf8aGJr/j4XU//Tz+////////v7+///////+/v//t7Tk/xsbnP8kIqH/j4XX/9zW9v9bWcT/DQ2X/8/J8P+7t+n/R0C1/wcHj/9hYL//8/P7////////////1c/x/x8bnv8qKqT/09Hw//7+/v//////YWHF/w0Nlv/f3/P///////Lw+/92dMn/BweQ/354zf/8+/7/+/n+/19Yvv8VEZb/xsDr///////z7/3/y7ry/0tEvP8NDZf/rJzm/9/U+P//////9vX8/1dQu/8REZX/2dTy/+Pg9v8QEJX/amLF//79/v/f2fb/KiKk/wYFj/8EA5H/AwOS/wUEj/8QD5b/j4DX///////Mxu//EQ6V/398zP+jleH/CQiO/7686f//////lZPY/wcFj/94bc//mZjY/5mY2f+YmNn/IRel/ywsrP/+/f//+/r+/zY0rv8xI6n/goHT/w8Ik//LwPD//v7+/46L1P8MCpD/2c73//7+/v///////v7+/0Uxsv8fH6f//fz///7+/v9MPb3/ExKc/4KB0/8OCJP/ysDw//////+NitX/DAqQ/9vQ+P////////////////9HNLL/Hx+o//79////////ST28/xQSnf+nmeL/CQiO/7u56P/+/v7/m5rb/wYGkf9eVMX/fnPP/31y0P99cs//GReh/ywsrf/+/f//+Pb+/zMyrP89MK7/5uP4/xIRmP9gVML//Pz+/+rl+v9AOa//EA+Y/wUFlP8DA5T/CAiV/xsboP+1ruX//////8C56/8NCpL/iILT//z7/v9va8f/DguU/7Kp5P/+/v7//v7+//f0/v9aV8P/DQ2Y/9jV8//9/P///v7+/+nl+P8+N6//HBme/+fj+P//////4t32/zIrqv8nJZ//vrXo//79/v///v//YWHF/w0Nl//f3/T//////+Hc9v9bUrr/EhCU/6GY3P/+/v////////7+/v/Cver/Lian/xMOlf9wacf/xb3s/0xIvP8NDZn/s6vo/5iO2f8sKKL/FBKW/4By0P/39v3//v7+/////////////////9vT9P9cVL7/CgmR/wwIj/8HBJL/BASS/w4Jkv8MDJD/NzKt/7Cs5P/59/3//////////////////v7+///////+/v7/+vj9/9jT8/+MhNf/cm7I/2plxP+Af9D/u63q//Py+////////v7+///////+/v7/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==" }, providers: [{ id: "cmb", name: "\u62DB\u5546\u94F6\u884C" }, { id: "boc", name: "\u4E2D\u56FD\u94F6\u884C" }, { id: "abc", name: "\u519C\u4E1A\u94F6\u884C" }, { id: "citic", name: "\u4E2D\u4FE1\u94F6\u884C" }, { id: "ccb", name: "\u5EFA\u8BBE\u94F6\u884C" }, { id: "wechat", name: "\u5FAE\u4FE1\u652F\u4ED8" }, { id: "alipay", name: "\u652F\u4ED8\u5B9D" }, { id: "bochk", name: "\u4E2D\u94F6\u9999\u6E2F" }, { id: "hsbc", name: "\u6C47\u4E30\u9999\u6E2F" }, { id: "za", name: "\u4F17\u5B89\u94F6\u884C ZA" }, { id: "icbc", name: "\u5DE5\u94F6\u4E9A\u6D32" }, { id: "dbs", name: "DBS / POSB" }, { id: "wise", name: "Wise" }, { id: "paypal", name: "PayPal" }, { id: "virtual", name: "\u5176\u4ED6\u865A\u62DF\u5361" }, { id: "cnsecurities", name: "\u5185\u5730\u5238\u5546 / \u540C\u82B1\u987A" }, { id: "futu", name: "\u5BCC\u9014 Futu" }, { id: "ibkr", name: "Interactive Brokers" }, { id: "binance", name: "\u5E01\u5B89 Binance" }, { id: "safepal", name: "SafePal / \u94FE\u4E0A\u94B1\u5305" }, { id: "other", name: "\u5176\u4ED6\u8D44\u4EA7" }] };
    }
  });

  // pwa/src/app.js
  var C = require_core();
  var { demo } = require_demo();
  var { Ledger } = require_ledger();
  var { OneDriveLedger } = require_onedrive();
  var { MicrosoftAuth } = require_auth();
  var brands = require_brands();
  var root = document.getElementById("app");
  var ledger = new Ledger();
  var config = window.ASSET_APP_CONFIG || {};
  var auth = new MicrosoftAuth(config.microsoftClientId || "");
  var route = { name: "home" };
  var base = "CNY";
  var mask = false;
  var importPlan = null;
  var importInput = null;
  var syncing = false;
  var syncMessage = "\u4EC5\u672C\u673A";
  var esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
  var flags = { CNY: "\u{1F1E8}\u{1F1F3}", HKD: "\u{1F1ED}\u{1F1F0}", USD: "\u{1F1FA}\u{1F1F8}", SGD: "\u{1F1F8}\u{1F1EC}", EUR: "\u{1F1EA}\u{1F1FA}", GBP: "\u{1F1EC}\u{1F1E7}", JPY: "\u{1F1EF}\u{1F1F5}", AUD: "\u{1F1E6}\u{1F1FA}", CAD: "\u{1F1E8}\u{1F1E6}", CHF: "\u{1F1E8}\u{1F1ED}", "\u4E2D\u56FD\u5185\u5730": "\u{1F1E8}\u{1F1F3}", "\u4E2D\u56FD\u9999\u6E2F": "\u{1F1ED}\u{1F1F0}", "\u65B0\u52A0\u5761": "\u{1F1F8}\u{1F1EC}", "\u7F8E\u56FD": "\u{1F1FA}\u{1F1F8}", "\u82F1\u56FD": "\u{1F1EC}\u{1F1E7}" };
  var colors = { cash: "#4f7fec", deposit: "#9bb8ef", stock: "#69b5a8", fund: "#ad98dc", crypto: "#dbad5d", other: "#adb7c5", debt: "#df8e91" };
  var pageNames = { home: "\u603B\u89C8", assets: "\u8D44\u4EA7", insights: "\u5206\u6790", updates: "\u66F4\u65B0" };
  var icons = {
    home: "M4 11l8-7 8 7v9H4z M9 20v-6h6v6",
    assets: "M5 20V10 M12 20V4 M19 20v-7",
    insights: "M4 19V9 M10 19V5 M16 19v-7 M22 19H2",
    updates: "M12 3v12 M7 8l5-5 5 5 M4 14v6h16v-6",
    back: "M15 18l-6-6 6-6",
    plus: "M12 5v14 M5 12h14",
    more: "M5 12h.01 M12 12h.01 M19 12h.01",
    sync: "M20 7a9 9 0 00-15-2L2 8 M2 3v5h5 M4 17a9 9 0 0015 2l3-3 M22 21v-5h-5"
  };
  var icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[name] || icons.more}"/></svg>`;
  var amount = (n, currency = base) => mask ? "\u2022\u2022\u2022\u2022\u2022\u2022" : n === null ? "\u5F85\u6298\u7B97" : `${currency} ${C.money(n)}`;
  var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  var state = () => C.state(ledger.book);
  var summary = () => C.summary(ledger.book, base);
  var account = (id) => state().accounts.find((item) => item.id === id) || { name: "\u8D26\u6237\u5F85\u6838\u5B9E", institution: "\u672A\u77E5\u673A\u6784", region: "\u5176\u4ED6", logo: "other" };
  function logo(item) {
    const source = brands.logos[item?.logo];
    return `<span class="logo">${source ? `<img src="${source}" alt="">` : `<span>${esc((item?.institution || item?.name || "?").slice(0, 1))}</span>`}</span>`;
  }
  function button(action, text, className = "button", attrs = "") {
    return `<button type="button" class="${className}" data-action="${action}" ${attrs}>${text}</button>`;
  }
  function topbar(title, back = false, action = null) {
    const trailing = action !== null ? action : back ? "" : button("toggle-mask", mask ? "\u663E\u793A" : "\u9690\u85CF", "text-button");
    return `<header class="topbar">${back ? button("back", icon("back"), "icon-button", 'aria-label="\u8FD4\u56DE"') : '<span class="top-spacer"></span>'}<h1>${esc(title)}</h1><div class="top-actions">${trailing}</div></header>`;
  }
  function bottomNav() {
    return `<nav class="bottom-nav" aria-label="\u4E3B\u8981\u5BFC\u822A">${Object.entries(pageNames).map(([name, label]) => button("navigate", `${icon(name)}<span>${label}</span>`, route.name === name ? "active" : "", `data-route="${name}"`)).join("")}</nav>`;
  }
  function institutionRows(s) {
    if (!s.accounts.length) return '<div class="empty"><strong>\u8FD8\u6CA1\u6709\u8D26\u6237</strong><p>\u5BFC\u5165 AI \u66F4\u65B0\u5305\uFF0C\u6216\u5148\u6DFB\u52A0\u4E00\u4E2A\u8D26\u6237\u3002</p></div>';
    return s.accounts.map((item) => {
      const positions = s.assets.filter((position) => position.accountId === item.id);
      let total = 0n;
      let complete = true;
      for (const position of positions) {
        const converted = C.convert(C.decimal(position.amount), position.currency, base, s.rates);
        if (converted === null) complete = false;
        else total += position.category === "debt" ? -converted : converted;
      }
      return `<button class="list-row" data-action="open-account" data-id="${item.id}">${logo(item)}<span class="row-copy"><strong>${esc(item.name)}</strong><small>${flags[item.region] || "\u{1F310}"} ${esc(item.region)} \xB7 ${positions.length} \u9879</small></span><span class="row-value">${complete ? amount(total) : "\u6570\u636E\u672A\u9F50"}<small>${esc(positions.map((position) => position.date).sort().at(-1) || "\u6682\u65E0\u6570\u636E")}</small></span></button>`;
    }).join("");
  }
  function allocation(s) {
    const parts = Object.entries(s.groups).filter(([, value]) => value > 0n);
    if (!parts.length) return '<div class="empty compact">\u6682\u65E0\u53EF\u4F30\u503C\u8D44\u4EA7</div>';
    return `<div class="allocation-bar">${parts.map(([key, value]) => `<i style="width:${Number(value * 10000n / s.totalAssets) / 100}%;background:${colors[key]}"></i>`).join("")}</div><div class="legend">${parts.map(([key, value]) => `<div><i style="background:${colors[key]}"></i><span>${esc(C.CATEGORIES[key])}</span><b>${(Number(value * 1000n / s.totalAssets) / 10).toFixed(1)}%</b></div>`).join("")}</div>`;
  }
  function homePage() {
    const s = summary();
    const latest = s.assets.map((item) => item.date).sort().at(-1) || "\u5C1A\u672A\u5BFC\u5165";
    return `${topbar("\u8D44\u4EA7\u603B\u89C8")}<main class="page"><section class="hero-card"><div class="eyebrow"><span>\u51C0\u8D44\u4EA7</span><select data-change="base">${C.CURRENCIES.map((currency) => `<option ${currency === base ? "selected" : ""}>${currency}</option>`).join("")}</select></div><div class="net-value">${s.complete ? amount(s.net, "").trim() : "\u6570\u636E\u672A\u9F50"}</div><div class="freshness">\u622A\u81F3 ${esc(latest)} \xB7 ${esc(syncMessage)}</div><div class="metrics"><div><small>\u603B\u8D44\u4EA7</small><b>${amount(s.totalAssets, "").trim()}</b></div><div><small>\u8D1F\u503A</small><b>${amount(s.debt, "").trim()}</b></div><div><small>\u73B0\u91D1</small><b>${amount(s.cash, "").trim()}</b></div></div></section>${s.conflicts.length ? `<button class="notice" data-action="navigate" data-route="updates">${s.conflicts.length} \u9879\u540C\u6B65\u51B2\u7A81\u9700\u8981\u5904\u7406</button>` : ""}${s.missing.length ? `<div class="notice">${s.missing.length} \u9879\u7F3A\u5C11\u6C47\u7387\u6216\u8D26\u6237\uFF0C\u5408\u8BA1\u6682\u4E0D\u5B8C\u6574</div>` : ""}<section class="card"><div class="section-title"><h2>\u8D44\u4EA7\u5206\u5E03</h2><span>${s.complete ? "\u6309\u5F53\u524D\u4F30\u503C" : "\u5DF2\u4F30\u503C\u90E8\u5206"}</span></div>${allocation(s)}</section><section><div class="section-title"><h2>\u8D26\u6237</h2>${button("add-account", icon("plus"), "small-add", 'aria-label="\u6DFB\u52A0\u8D26\u6237"')}</div><div class="list">${institutionRows(s)}</div></section><section class="quick-actions">${button("navigate", `${icon("updates")}\u5BFC\u5165 AI \u66F4\u65B0\u5305`, "secondary-button", 'data-route="updates"')}${button("sync", `${icon("sync")}\u540C\u6B65 OneDrive`, "secondary-button")}</section>${!ledger.book.events.length ? `<section class="first-run"><h2>\u5F00\u59CB\u4F7F\u7528</h2><p>\u53EF\u4EE5\u5148\u67E5\u770B\u865A\u6784\u793A\u4F8B\uFF0C\u6216\u76F4\u63A5\u5BFC\u5165 AI \u66F4\u65B0\u5305\u3002</p>${button("load-demo", "\u67E5\u770B\u793A\u4F8B\u6570\u636E", "secondary-button")}</section>` : ""}</main>${bottomNav()}`;
  }
  function assetRow(position) {
    const owner = account(position.accountId);
    const converted = C.convert(C.decimal(position.amount), position.currency, base, state().rates);
    return `<button class="list-row" data-action="open-asset" data-id="${position.id}">${logo(owner)}<span class="row-copy"><strong>${esc(position.name)}</strong><small>${esc(owner.name)}${position.symbol ? ` \xB7 ${esc(position.symbol)}` : ""}</small></span><span class="row-value">${amount(converted)}<small>${amount(C.decimal(position.amount), position.currency)}</small></span></button>`;
  }
  function assetsPage() {
    const s = state();
    const groups = Object.entries(C.CATEGORIES).map(([key, label]) => {
      const positions = s.assets.filter((item) => item.category === key);
      if (!positions.length) return "";
      return `<section><div class="section-title"><h2>${esc(label)}</h2><span>${positions.length} \u9879</span></div><div class="list">${positions.map(assetRow).join("")}</div></section>`;
    }).join("");
    return `${topbar("\u8D44\u4EA7", false, button("add-asset", icon("plus"), "icon-button", 'aria-label="\u6DFB\u52A0\u8D44\u4EA7"'))}<main class="page">${groups || '<div class="empty"><strong>\u6682\u65E0\u8D44\u4EA7</strong><p>\u4ECE\u66F4\u65B0\u9875\u5BFC\u5165 AI \u66F4\u65B0\u5305\u3002</p></div>'}</main>${bottomNav()}`;
  }
  function barRows(items, total, formatter = (key) => key) {
    return items.map(([key, value]) => `<div class="bar-row"><span>${esc(formatter(key))}</span><div><i style="width:${total ? Number(value * 10000n / total) / 100 : 0}%"></i></div><b>${total ? (Number(value * 1000n / total) / 10).toFixed(1) : "0.0"}%</b></div>`).join("");
  }
  function insightsPage() {
    const s = summary();
    const maturities = s.assets.filter((item) => item.maturity).sort((a, b) => a.maturity.localeCompare(b.maturity));
    return `${topbar("\u5206\u6790")}<main class="page"><section class="card"><div class="section-title"><h2>\u5E01\u79CD\u655E\u53E3</h2><span>${base} \u6298\u7B97</span></div>${barRows(Object.entries(s.currencies), s.totalAssets, (key) => `${flags[key] || "\u{1F310}"} ${key}`) || '<div class="empty compact">\u6682\u65E0\u6570\u636E</div>'}</section><section class="card"><div class="section-title"><h2>\u8D44\u4EA7\u7C7B\u522B</h2><span>\u4E0D\u542B\u8D1F\u503A</span></div>${barRows(Object.entries(s.groups), s.totalAssets, (key) => C.CATEGORIES[key]) || '<div class="empty compact">\u6682\u65E0\u6570\u636E</div>'}</section><section><div class="section-title"><h2>\u5B9A\u5B58\u5230\u671F</h2><span>${maturities.length} \u9879</span></div><div class="list">${maturities.map((item) => `<button class="list-row" data-action="open-asset" data-id="${item.id}"><span class="date-box"><small>${item.maturity.slice(5, 7)}\u6708</small><b>${item.maturity.slice(8)}</b></span><span class="row-copy"><strong>${esc(item.name)}</strong><small>${esc(account(item.accountId).name)} \xB7 ${item.apr ? `${esc(item.apr)}%` : "\u5229\u7387\u672A\u5F55\u5165"}</small></span><span class="row-value">${amount(C.decimal(item.amount), item.currency)}</span></button>`).join("") || '<div class="empty compact">\u6682\u65E0\u5230\u671F\u8BB0\u5F55</div>'}</div></section><section class="card"><div class="section-title"><h2>\u6570\u636E\u8D28\u91CF</h2><span>${s.complete ? "\u5B8C\u6574" : "\u5F85\u8865\u5145"}</span></div><div class="quality"><div><b>${s.assets.length}</b><small>\u5F53\u524D\u8D44\u4EA7</small></div><div><b>${ledger.book.events.length}</b><small>\u5386\u53F2\u53D8\u52A8</small></div><div><b>${s.missing.length}</b><small>\u7F3A\u5931\u6298\u7B97</small></div></div><p class="hint">\u8D26\u672C\u53D8\u5316\u4E0D\u7B49\u4E8E\u6295\u8D44\u6536\u76CA\u3002\u53EA\u6709\u5B58\u5728\u4EFD\u989D\u548C\u5E73\u5747\u6210\u672C\u65F6\uFF0C\u624D\u8BA1\u7B97\u6301\u4ED3\u6D6E\u52A8\u76C8\u4E8F\u3002</p></section></main>${bottomNav()}`;
  }
  function updatesPage() {
    const history2 = ledger.book.events.slice().sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20);
    const isDemo = ledger.book.vaultId === "demo-ledger";
    return `${topbar("\u66F4\u65B0", false, button("sync", icon("sync"), "icon-button", 'aria-label="\u540C\u6B65 OneDrive"'))}<main class="page"><section class="update-card"><h2>AI \u66F4\u65B0\u5305</h2><p>\u4E0A\u4F20\u8D26\u5355\u7ED9 AI \u540E\uFF0C\u5C06\u751F\u6210\u7684 JSON \u6587\u4EF6\u5BFC\u5165\u3002\u786E\u8BA4\u540E\u624D\u5199\u5165\u6B63\u5F0F\u8D26\u672C\u3002</p>${button("open-import", "\u5BFC\u5165\u66F4\u65B0\u5305", "primary-button")}</section><section class="update-card"><h2>OneDrive</h2><p>${isDemo ? "\u5F53\u524D\u662F\u865A\u6784\u793A\u4F8B\uFF0C\u4E0D\u4F1A\u4E0A\u4F20\u3002\u9000\u51FA\u793A\u4F8B\u540E\u518D\u8FDE\u63A5\u771F\u5B9E\u8D26\u672C\u3002" : auth.account ? `\u5DF2\u8FDE\u63A5 ${esc(auth.account.username || "Microsoft \u8D26\u53F7")}\u3002\u4FDD\u5B58\u540E\u81EA\u52A8\u540C\u6B65\u5E94\u7528\u4E13\u7528\u6587\u4EF6\u5939\u3002` : auth.configured ? "\u9996\u6B21\u8FDE\u63A5\u53EA\u6388\u6743\u5E94\u7528\u4E13\u7528\u6587\u4EF6\u5939\u3002" : "\u524D\u7AEF\u5DF2\u51C6\u5907\u5B8C\u6210\uFF1B\u771F\u5B9E\u8FDE\u63A5\u8FD8\u9700\u8981\u914D\u7F6E Microsoft Client ID\u3002"}</p>${isDemo ? button("reset-demo", "\u9000\u51FA\u793A\u4F8B\uFF0C\u5F00\u59CB\u771F\u5B9E\u8D26\u672C", "secondary-button") : auth.account ? `${button("sync", syncing ? "\u6B63\u5728\u540C\u6B65\u2026" : "\u7ACB\u5373\u540C\u6B65", "secondary-button", syncing ? "disabled" : "")}${button("disconnect", "\u65AD\u5F00\u8FDE\u63A5", "text-button")}` : button("connect", "\u8FDE\u63A5 OneDrive", "secondary-button")}</section><section><div class="section-title"><h2>\u6700\u8FD1\u53D8\u52A8</h2><span>${ledger.book.events.length} \u6761</span></div><div class="list">${history2.map((event) => `<div class="list-row"><span class="event-dot"></span><span class="row-copy"><strong>${esc(event.value?.name || event.value?.id || "\u5DF2\u5F52\u6863")}</strong><small>${esc(event.at.slice(0, 16).replace("T", " "))} \xB7 ${event.source.startsWith("import:") ? "AI \u66F4\u65B0" : event.source === "demo" ? "\u793A\u4F8B" : "\u624B\u52A8\u4FEE\u6B63"}</small></span><span class="row-value">${event.type === "asset" && event.value ? amount(C.decimal(event.value.amount), event.value.currency) : event.type === "rate" && event.value ? `${esc(event.value.rate)} CNY` : event.value ? "\u5DF2\u66F4\u65B0" : "\u5DF2\u5F52\u6863"}</span></div>`).join("") || '<div class="empty compact">\u6682\u65E0\u53D8\u52A8</div>'}</div></section></main>${bottomNav()}`;
  }
  function accountPage(id) {
    const item = state().accounts.find((value) => value.id === id);
    if (!item) return notFound();
    const positions = state().assets.filter((position) => position.accountId === id);
    return `${topbar(item.name, true, button("edit-account", "\u7F16\u8F91", "text-button", `data-id="${id}"`))}<main class="detail-page"><section class="identity">${logo(item)}<div><h2>${esc(item.institution)}</h2><p>${flags[item.region] || "\u{1F310}"} ${esc(item.region)}</p></div></section><div class="list">${positions.map(assetRow).join("") || '<div class="empty compact">\u6682\u65E0\u8D44\u4EA7</div>'}</div>${button("add-asset", "\u6DFB\u52A0\u8D44\u4EA7", "secondary-button full", `data-account="${id}"`)}</main>`;
  }
  function assetPage(id) {
    const item = state().assets.find((value) => value.id === id);
    if (!item) return notFound();
    const owner = account(item.accountId);
    const converted = C.convert(C.decimal(item.amount), item.currency, base, state().rates);
    const fields = [["\u8D26\u6237", owner.name], ["\u7C7B\u578B", C.CATEGORIES[item.category]], ["\u539F\u5E01\u91D1\u989D", amount(C.decimal(item.amount), item.currency)], ["\u6570\u636E\u65E5\u671F", item.date]];
    if (item.quantity) fields.push(["\u4EFD\u989D", item.quantity], ["\u5355\u4EF7", `${item.unitPrice} ${item.currency}`]);
    if (item.unitCost) fields.push(["\u5E73\u5747\u6210\u672C", item.unitCost]);
    if (item.maturity) fields.push(["\u5230\u671F\u65E5", item.maturity]);
    if (item.apr) fields.push(["\u5E74\u5229\u7387", `${item.apr}%`]);
    return `${topbar(item.name, true, button("edit-asset", "\u7F16\u8F91", "text-button", `data-id="${id}"`))}<main class="detail-page"><section class="identity">${logo(owner)}<div><h2>${esc(item.symbol || owner.name)}</h2><p>${esc(C.CATEGORIES[item.category])}</p></div></section><div class="detail-value">${amount(converted)}</div><dl class="details">${fields.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>${item.note ? `<p class="note">${esc(item.note)}</p>` : ""}</main>`;
  }
  function select(name, choices, selected) {
    return `<select name="${name}">${choices.map(([value, label]) => `<option value="${esc(value)}" ${value === selected ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>`;
  }
  function field(name, label, value = "", type = "text", required = false) {
    return `<label><span>${esc(label)}</span><input name="${name}" type="${type}" value="${esc(value)}" ${required ? "required" : ""} ${["amount", "quantity", "unitPrice", "unitCost", "apr", "rate"].includes(name) ? 'inputmode="decimal"' : ""}></label>`;
  }
  function accountForm(id) {
    const item = id ? state().accounts.find((value) => value.id === id) : { id: `a-${C.newId()}`, region: "\u4E2D\u56FD\u5185\u5730", logo: "other" };
    return `${topbar(id ? "\u7F16\u8F91\u8D26\u6237" : "\u6DFB\u52A0\u8D26\u6237", true, '<button class="top-save" type="submit" form="account-form">\u4FDD\u5B58</button>')}<main class="form-page"><form id="account-form" data-form="account"><input type="hidden" name="id" value="${item.id}">${field("name", "\u8D26\u6237\u540D\u79F0", item.name, "text", true)}${field("institution", "\u673A\u6784", item.institution, "text", true)}<label><span>\u5730\u533A</span>${select("region", ["\u4E2D\u56FD\u5185\u5730", "\u4E2D\u56FD\u9999\u6E2F", "\u65B0\u52A0\u5761", "\u7F8E\u56FD", "\u82F1\u56FD", "\u5176\u4ED6"].map((value) => [value, value]), item.region)}</label><label><span>\u56FE\u6807</span>${select("logo", brands.providers.map((provider) => [provider.id, provider.name]), item.logo)}</label><button class="primary-button inline-save">\u4FDD\u5B58\u8D26\u6237</button><p class="form-error"></p></form></main>`;
  }
  function assetForm(id, accountId) {
    const s = state();
    if (!s.accounts.length) return accountForm();
    const item = id ? s.assets.find((value) => value.id === id) : { id: `p-${C.newId()}`, accountId: accountId || s.accounts[0].id, category: "cash", currency: base, date: today() };
    return `${topbar(id ? "\u7F16\u8F91\u8D44\u4EA7" : "\u6DFB\u52A0\u8D44\u4EA7", true, '<button class="top-save" type="submit" form="asset-form">\u4FDD\u5B58</button>')}<main class="form-page"><form id="asset-form" data-form="asset"><input type="hidden" name="id" value="${item.id}"><label><span>\u6240\u5C5E\u8D26\u6237</span>${select("accountId", s.accounts.map((value) => [value.id, value.name]), item.accountId)}</label>${field("name", "\u8D44\u4EA7\u540D\u79F0", item.name, "text", true)}<div class="form-grid"><label><span>\u7C7B\u578B</span>${select("category", Object.entries(C.CATEGORIES), item.category)}</label><label><span>\u5E01\u79CD</span>${select("currency", C.CURRENCIES.map((value) => [value, value]), item.currency)}</label></div><label><span>\u4F30\u503C\u65B9\u5F0F</span>${select("valuation", [["amount", "\u76F4\u63A5\u586B\u5199\u603B\u989D"], ["units", "\u4EFD\u989D \xD7 \u5355\u4EF7"]], item.quantity ? "units" : "amount")}</label><div data-valuation="amount" ${item.quantity ? "hidden" : ""}>${field("amount", "\u539F\u5E01\u91D1\u989D", item.amount, "text", true)}</div><div data-valuation="units" ${item.quantity ? "" : "hidden"}><div class="form-grid">${field("quantity", "\u4EFD\u989D / \u6570\u91CF", item.quantity)}${field("unitPrice", "\u5F53\u524D\u5355\u4EF7", item.unitPrice)}</div>${field("unitCost", "\u5E73\u5747\u6210\u672C\uFF08\u53EF\u9009\uFF09", item.unitCost)}</div><div class="form-grid">${field("date", "\u6570\u636E\u65E5\u671F", item.date, "date", true)}${field("maturity", "\u5230\u671F\u65E5\uFF08\u53EF\u9009\uFF09", item.maturity, "date")}</div><div class="form-grid">${field("symbol", "\u80A1\u7968 / \u4EE3\u5E01\u4EE3\u7801", item.symbol)}${field("apr", "\u5E74\u5229\u7387 %", item.apr)}</div>${field("note", "\u5907\u6CE8", item.note)}<button class="primary-button inline-save">\u4FDD\u5B58\u8D44\u4EA7</button><p class="form-error"></p></form></main>`;
  }
  function importPage() {
    return `${topbar("\u5BFC\u5165 AI \u66F4\u65B0\u5305", true)}<main class="form-page"><section class="import-intro"><h2>\u53EA\u5BFC\u5165\u7ED3\u6784\u5316\u7ED3\u679C</h2><p>\u4E0D\u4F1A\u4FDD\u5B58\u8D26\u5355\u3001\u622A\u56FE\u6216 OCR \u539F\u6587\u3002\u5BFC\u5165\u524D\u4F1A\u663E\u793A\u6240\u6709\u65B0\u589E\u548C\u53D8\u5316\u3002</p></section><label class="file-picker">\u9009\u62E9 JSON \u6587\u4EF6<input name="import-file" type="file" accept=".json,application/json"></label><form data-form="import"><label><span>\u6216\u7C98\u8D34\u66F4\u65B0\u5305</span><textarea name="json" rows="12" placeholder='{"version":1,"batchId":"...","assets":[]}' required></textarea></label><button class="primary-button inline-save">\u68C0\u67E5\u66F4\u65B0</button><p class="form-error"></p></form></main>`;
  }
  function reviewPage() {
    const plan = importPlan;
    return `${topbar("\u6838\u5BF9\u672C\u6279\u66F4\u65B0", true, '<button class="top-save" type="submit" form="confirm-import">\u786E\u8BA4\u5165\u8D26</button>')}<main class="form-page"><section class="review-summary"><b>${plan.changes.length}</b><span>\u9879\u53D8\u52A8</span><small>${plan.ignored} \u9879\u76F8\u540C\u8BB0\u5F55\u5DF2\u8DF3\u8FC7</small></section><div class="review-list">${plan.changes.map((change) => `<div class="review-row"><span><strong>${esc(change.value.name || change.value.id)}</strong><small>${change.type === "account" ? "\u8D26\u6237" : change.type === "rate" ? "\u6C47\u7387" : C.CATEGORIES[change.value.category]} \xB7 ${change.action}</small></span><b>${change.type === "asset" ? amount(C.decimal(change.value.amount), change.value.currency) : change.type === "rate" ? `${esc(change.value.rate)} CNY` : ""}</b></div>`).join("") || '<div class="empty compact">\u6CA1\u6709\u9700\u8981\u66F4\u65B0\u7684\u5185\u5BB9</div>'}</div><form id="confirm-import" data-form="confirm-import"><label class="check"><input type="checkbox" name="confirm" required><span>\u6211\u5DF2\u6838\u5BF9\u8D26\u6237\u3001\u91D1\u989D\u3001\u5E01\u79CD\u548C\u6570\u636E\u65E5\u671F</span></label><button class="primary-button inline-save" ${plan.changes.length ? "" : "disabled"}>\u786E\u8BA4\u5165\u8D26</button><p class="form-error"></p></form></main>`;
  }
  function notFound() {
    return `${topbar("\u8BB0\u5F55\u4E0D\u5B58\u5728", true)}<main class="page"><div class="empty">\u8FD9\u6761\u8BB0\u5F55\u5DF2\u53D8\u5316\u6216\u88AB\u5F52\u6863\u3002</div></main>`;
  }
  function render() {
    if (!ledger.book) {
      root.innerHTML = '<div class="loading">\u6B63\u5728\u6253\u5F00\u8D26\u672C\u2026</div>';
      return;
    }
    const views = {
      home: homePage,
      assets: assetsPage,
      insights: insightsPage,
      updates: updatesPage,
      account: () => accountPage(route.id),
      asset: () => assetPage(route.id),
      "account-form": () => accountForm(route.id),
      "asset-form": () => assetForm(route.id, route.accountId),
      import: importPage,
      review: reviewPage
    };
    root.innerHTML = `<div class="app-shell">${(views[route.name] || homePage)()}<div class="toast" role="status"></div></div>`;
  }
  function navigate(name, data = {}) {
    route = { name, ...data };
    history.pushState(route, "", `#${name}`);
    render();
    document.querySelector(".app-shell")?.scrollTo(0, 0);
  }
  function toast(message) {
    const node = root.querySelector(".toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3500);
  }
  async function syncNow() {
    if (ledger.book.vaultId === "demo-ledger") throw new Error("\u793A\u4F8B\u8D26\u672C\u4E0D\u4F1A\u540C\u6B65\uFF1B\u8BF7\u4ECE\u66F4\u65B0\u9875\u9000\u51FA\u793A\u4F8B");
    if (!auth.account) {
      if (!auth.configured) throw new Error("OneDrive \u5E94\u7528\u5C1A\u672A\u5B8C\u6210 Microsoft Client ID \u914D\u7F6E");
      return auth.connect();
    }
    if (syncing) return;
    syncing = true;
    syncMessage = "\u6B63\u5728\u540C\u6B65";
    render();
    try {
      const remote = new OneDriveLedger(() => auth.token());
      const result = await remote.sync(ledger.book, (book) => ledger.replace(book));
      syncMessage = result.status === "conflict" ? "\u5B58\u5728\u540C\u6B65\u51B2\u7A81" : "OneDrive \u5DF2\u540C\u6B65";
      toast(syncMessage);
    } finally {
      syncing = false;
      render();
    }
  }
  root.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    try {
      if (action === "navigate") return navigate(target.dataset.route);
      if (action === "back") {
        history.back();
        return;
      }
      if (action === "toggle-mask") {
        mask = !mask;
        render();
        return;
      }
      if (action === "open-account") return navigate("account", { id: target.dataset.id });
      if (action === "open-asset") return navigate("asset", { id: target.dataset.id });
      if (action === "add-account") return navigate("account-form");
      if (action === "edit-account") return navigate("account-form", { id: target.dataset.id });
      if (action === "add-asset") return navigate("asset-form", { accountId: target.dataset.account });
      if (action === "edit-asset") return navigate("asset-form", { id: target.dataset.id });
      if (action === "open-import") return navigate("import");
      if (action === "load-demo") {
        await ledger.replace(demo());
        syncMessage = "\u793A\u4F8B\u6570\u636E";
        render();
        return;
      }
      if (action === "reset-demo") {
        await ledger.replace(C.empty());
        syncMessage = "\u4EC5\u672C\u673A";
        navigate("home");
        return;
      }
      if (action === "connect") return auth.connect();
      if (action === "disconnect") return auth.disconnect();
      if (action === "sync") return syncNow();
    } catch (error) {
      toast(error.message);
    }
  });
  root.addEventListener("change", async (event) => {
    const target = event.target;
    try {
      if (target.dataset.change === "base") {
        base = target.value;
        render();
        return;
      }
      if (target.name === "valuation") {
        const form = target.closest("form");
        for (const node of form.querySelectorAll("[data-valuation]")) node.hidden = node.dataset.valuation !== target.value;
      }
      if (target.name === "import-file" && target.files[0]) {
        if (target.files[0].size > 4 * 1024 * 1024) throw new Error("\u66F4\u65B0\u5305\u4E0D\u80FD\u8D85\u8FC7 4 MiB");
        importInput = JSON.parse(await target.files[0].text());
        importPlan = C.prepareImport(ledger.book, importInput);
        navigate("review");
      }
    } catch (error) {
      toast(error.message);
    }
  });
  root.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-form]");
    if (!form) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const errorNode = form.querySelector(".form-error");
    try {
      if (form.dataset.form === "account") {
        const current = C.heads(ledger.book).get(`account:${data.id}`) || [];
        await ledger.update((book) => C.edit(book, "account", data, { expected: current.map((item) => item.id) }));
        navigate("account", { id: data.id });
        if (auth.account) syncNow().catch((error) => toast(error.message));
      }
      if (form.dataset.form === "asset") {
        const value = { ...data };
        if (data.valuation === "amount") {
          delete value.quantity;
          delete value.unitPrice;
          delete value.unitCost;
        } else delete value.amount;
        const current = C.heads(ledger.book).get(`asset:${data.id}`) || [];
        await ledger.update((book) => C.edit(book, "asset", value, { expected: current.map((item) => item.id) }));
        navigate("asset", { id: data.id });
        if (auth.account) syncNow().catch((error) => toast(error.message));
      }
      if (form.dataset.form === "import") {
        importInput = JSON.parse(data.json);
        importPlan = C.prepareImport(ledger.book, importInput);
        navigate("review");
      }
      if (form.dataset.form === "confirm-import") {
        if (!data.confirm) throw new Error("\u8BF7\u5148\u786E\u8BA4\u5DF2\u6838\u5BF9\u672C\u6279\u66F4\u65B0");
        await ledger.update((book) => C.applyImport(book, importPlan));
        importInput = null;
        importPlan = null;
        navigate("home");
        toast("\u66F4\u65B0\u5DF2\u5165\u8D26");
        if (auth.account) syncNow().catch((error) => toast(error.message));
      }
    } catch (error) {
      if (errorNode) errorNode.textContent = error.message;
      else toast(error.message);
    }
  });
  window.addEventListener("popstate", (event) => {
    route = event.state || { name: "home" };
    render();
  });
  window.addEventListener("online", () => {
    if (auth.account) syncNow().catch(() => {
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && auth.account) syncNow().catch(() => {
    });
  });
  (async () => {
    await ledger.load();
    ledger.subscribe(render);
    try {
      const connected = await auth.initialize();
      if (connected) await syncNow();
    } catch (error) {
      syncMessage = "OneDrive \u6682\u672A\u540C\u6B65";
      toast(error.message);
    }
    history.replaceState(route, "", "#home");
    render();
  })();
})();
/*! Bundled license information:

@azure/msal-browser/lib/msal-browser.cjs:
  (*! @azure/msal-browser v4.25.0 2025-10-09 *)
  (*! @azure/msal-common v15.13.0 2025-10-09 *)
*/
