/**
 * Automated permission test: verifies that a non-admin authenticated user
 * cannot read, write, or escalate via any admin-protected endpoint.
 *
 * Run with: deno run --allow-net --allow-env --allow-write scripts/test-admin-access.ts
 * Requires env: SUPABASE_URL, SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY),
 * SUPABASE_SERVICE_ROLE_KEY.
 *
 * Writes JSON + Markdown report to /mnt/documents/ (or ./reports/ if missing).
 */

const URL_ = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
if (!URL_ || !ANON || !SR) {
  console.error("Missing env vars"); Deno.exit(1);
}

type Result = {
  category: string;
  name: string;
  expected: string;
  status: number;
  body: string;
  pass: boolean;
};
const results: Result[] = [];

async function call(method: string, path: string, token: string, body?: unknown) {
  const headers: Record<string, string> = {
    apikey: ANON,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
  const res = await fetch(`${URL_}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: (await res.text()).slice(0, 300) };
}

async function srGet(path: string) {
  const r = await fetch(`${URL_}${path}`, {
    headers: { apikey: SR, Authorization: `Bearer ${SR}` },
  });
  return r.ok ? await r.json() : null;
}

function record(c: string, name: string, expected: string, status: number, body: string, pass: boolean) {
  results.push({ category: c, name, expected, status, body, pass });
  console.log(`${pass ? "✅" : "❌"} [${status}] ${c} / ${name}`);
}

async function main() {
  const email = `nonadmin-${Date.now()}@example.com`;
  const password = "TestPass123!xyz";

  console.log("→ Creating non-admin test user");
  const create = await fetch(`${URL_}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true }),
  }).then((r) => r.json());
  const userId = create.id;

  const login = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());
  const token = login.access_token;
  if (!token) throw new Error("Login failed: " + JSON.stringify(login));

  // Resolve real existing rows for write tests
  const cds = (await srGet("/rest/v1/course_dates?select=id,spots_available&limit=1")) || [];
  const bks = (await srGet("/rest/v1/bookings?select=id,status&limit=1")) || [];
  const realCd = cds[0];
  const realBk = bks[0];

  try {
    // === READ tests — must return [] (RLS filters) ===
    for (const t of ["bookings", "booking_items", "waitlist", "user_roles"]) {
      const r = await call("GET", `/rest/v1/${t}?select=*&limit=5`, token);
      const arr = (() => { try { return JSON.parse(r.body); } catch { return null; } })();
      const pass = r.status === 200 && Array.isArray(arr) && arr.length === 0;
      record("READ (admin-only)", t, "200 + []", r.status, r.body, pass);
    }

    // === Public read — must succeed ===
    const pub = await call("GET", "/rest/v1/course_dates?select=id&limit=1", token);
    record("READ (public)", "course_dates", "200 + rows", pub.status, pub.body, pub.status === 200);

    // === WRITE tests — must be blocked ===
    const ins = await call("POST", "/rest/v1/course_dates", token, {
      id: `hack-${Date.now()}`, part: 1, day: "Mo", date: "01.01.2099",
      time: "09:00", location: "Hack", price: 1, spots_available: 1,
    });
    record("WRITE (admin-only)", "INSERT course_dates", "403 RLS", ins.status, ins.body, ins.status === 403);

    const selfPromote = await call("POST", "/rest/v1/user_roles", token, { user_id: userId, role: "admin" });
    record("WRITE (privilege)", "INSERT user_roles (self-promote)", "403 RLS", selfPromote.status, selfPromote.body, selfPromote.status === 403);

    if (realCd) {
      const upd = await call("PATCH", `/rest/v1/course_dates?id=eq.${realCd.id}`, token, { spots_available: 999 });
      const after = await srGet(`/rest/v1/course_dates?id=eq.${realCd.id}&select=spots_available`);
      const unchanged = after?.[0]?.spots_available === realCd.spots_available;
      record("WRITE (admin-only)", "UPDATE existing course_date", "0 rows affected", upd.status, JSON.stringify({ resp: upd.body, after: after?.[0] }), unchanged);

      const del = await call("DELETE", `/rest/v1/course_dates?id=eq.${realCd.id}`, token);
      const still = await srGet(`/rest/v1/course_dates?id=eq.${realCd.id}&select=id`);
      record("WRITE (admin-only)", "DELETE existing course_date", "row still exists", del.status, JSON.stringify({ resp: del.body, after: still }), (still?.length ?? 0) === 1);
    }
    if (realBk) {
      const upd = await call("PATCH", `/rest/v1/bookings?id=eq.${realBk.id}`, token, { status: "paid" });
      const after = await srGet(`/rest/v1/bookings?id=eq.${realBk.id}&select=status`);
      const unchanged = after?.[0]?.status === realBk.status;
      record("WRITE (admin-only)", "UPDATE existing booking", "0 rows affected", upd.status, JSON.stringify({ resp: upd.body, after: after?.[0] }), unchanged);
    }

    // === Edge functions ===
    const ef = async (name: string, body: unknown) =>
      fetch(`${URL_}/functions/v1/${name}`, {
        method: "POST",
        headers: { apikey: ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async (r) => ({ status: r.status, body: (await r.text()).slice(0, 300) }));

    const efCases = [
      { name: "create-booking", body: {}, expectValidation: true },
      { name: "add-to-waitlist", body: {}, expectValidation: true },
      { name: "send-transactional-email", body: {}, expectValidation: true },
    ];
    for (const c of efCases) {
      const r = await ef(c.name, c.body);
      // pass = either explicit auth rejection OR validation error (i.e. no admin data leaked / accepted)
      const pass = r.status === 400 || r.status === 401 || r.status === 403 || r.status === 422;
      record("EDGE FUNCTION", c.name, "rejects empty/non-admin payload (400/401/403)", r.status, r.body, pass);
    }
  } finally {
    await fetch(`${URL_}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: { apikey: SR, Authorization: `Bearer ${SR}` },
    });
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  const summary = { generated_at: new Date().toISOString(), total: results.length, passed, failed, results };

  let outDir = "/mnt/documents";
  try { await Deno.stat(outDir); } catch { outDir = "./reports"; await Deno.mkdir(outDir, { recursive: true }); }
  const jsonPath = `${outDir}/admin-access-report.json`;
  await Deno.writeTextFile(jsonPath, JSON.stringify(summary, null, 2));

  const md = [
    `# Admin Access Permission Report`,
    ``,
    `**Generated:** ${summary.generated_at}`,
    `**Total:** ${summary.total} · **Passed:** ${summary.passed} · **Failed:** ${summary.failed}`,
    ``,
    `| ✓ | Category | Test | Expected | Status |`,
    `|---|---|---|---|---|`,
    ...results.map((r) =>
      `| ${r.pass ? "✅" : "❌"} | ${r.category} | ${r.name} | ${r.expected} | ${r.status} |`
    ),
    ``,
    `## Details`,
    ...results.map((r) => `### ${r.pass ? "✅" : "❌"} ${r.category} — ${r.name}\n- Status: \`${r.status}\`\n- Response: \`${r.body.replaceAll("`", "'")}\`\n`),
  ].join("\n");
  const mdPath = `${outDir}/admin-access-report.md`;
  await Deno.writeTextFile(mdPath, md);

  console.log(`\nReport: ${jsonPath}\nReport: ${mdPath}`);
  console.log(`Summary: ${passed}/${results.length} passed`);
  if (failed > 0) Deno.exit(2);
}

await main();
