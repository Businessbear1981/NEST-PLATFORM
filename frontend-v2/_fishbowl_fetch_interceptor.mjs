// FISHBOWL: prove the fetch interceptor logic from App.tsx works correctly.
// Run: node frontend-v2/_fishbowl_fetch_interceptor.mjs
//
// Hypothesis: installFetchAuthHeader() patches window.fetch so that:
//   (1) requests to /api/* get Authorization: Bearer <token> attached
//   (2) requests to /api/auth/login are NOT modified (would loop)
//   (3) requests to external URLs are NOT modified

// --- Mocks ---
const captured = [];
const baseFetch = async (input, init) => {
  // Normalize input.url to a plain object for capture
  const url = typeof input === "string" ? input : input.url ?? String(input);
  captured.push({ url, init });
  return { json: async () => ({}), ok: true, status: 200 };
};

const store = {};
globalThis.window = {
  fetch: baseFetch,
};
globalThis.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
};

// Pre-set a fake token
localStorage.setItem("nest_token", "TEST_JWT_TOKEN_123");

// --- Inline copy of the interceptor logic from App.tsx ---
function installFetchAuthHeader() {
  if (window.__nestFetchPatched) return;
  window.__nestFetchPatched = true;
  const origFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    let url = "";
    if (typeof input === "string") url = input;
    else if (input instanceof URL) url = input.toString();
    else url = input.url;
    const isApi = url.startsWith("/api/") || (url.includes("://") && url.includes("/api/"));
    const isLogin = url.includes("/api/auth/login");
    if (isApi && !isLogin) {
      const token = localStorage.getItem("nest_token");
      if (token) {
        const headers = new Headers(init?.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        return origFetch(input, { ...init, headers });
      }
    }
    return origFetch(input, init);
  };
}

// --- Tests ---
async function run() {
  installFetchAuthHeader();
  let pass = 0, fail = 0;

  function check(label, actual, expected) {
    const ok = actual === expected;
    console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
    console.log(`     actual:   ${actual}`);
    console.log(`     expected: ${expected}`);
    if (ok) pass++; else fail++;
  }

  // Test 1: /api/deals POST should get Authorization
  captured.length = 0;
  await window.fetch("/api/deals", { method: "POST", headers: { "Content-Type": "application/json" } });
  let last = captured.at(-1);
  let headers = new Headers(last.init?.headers || {});
  check("1) POST /api/deals attaches Bearer", headers.get("Authorization"), "Bearer TEST_JWT_TOKEN_123");

  // Test 2: /api/auth/login should NOT get Authorization
  captured.length = 0;
  await window.fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" } });
  last = captured.at(-1);
  headers = new Headers(last.init?.headers || {});
  check("2) POST /api/auth/login is NOT modified", headers.get("Authorization"), null);

  // Test 3: external URL should NOT get Authorization
  captured.length = 0;
  await window.fetch("https://other.com/path");
  last = captured.at(-1);
  headers = new Headers(last.init?.headers || {});
  check("3) external URL is NOT modified", headers.get("Authorization"), null);

  // Test 4: caller-provided Authorization is preserved (not overwritten)
  captured.length = 0;
  await window.fetch("/api/deals", { headers: { Authorization: "Bearer CALLER_PROVIDED" } });
  last = captured.at(-1);
  headers = new Headers(last.init?.headers || {});
  check("4) caller's existing Authorization is preserved", headers.get("Authorization"), "Bearer CALLER_PROVIDED");

  // Test 5: with no token, request goes through but without Authorization
  store.nest_token = undefined;
  delete store.nest_token;
  captured.length = 0;
  await window.fetch("/api/deals", { method: "GET" });
  last = captured.at(-1);
  headers = new Headers(last.init?.headers || {});
  check("5) no token → no Authorization added", headers.get("Authorization"), null);

  console.log(`\n=== ${pass} pass, ${fail} fail ===`);
  process.exit(fail > 0 ? 1 : 0);
}

run().catch((e) => { console.error("CRASH:", e); process.exit(2); });
