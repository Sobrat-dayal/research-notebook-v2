import test from "node:test";
import assert from "node:assert/strict";
import {
  arxivId,
  safeLink,
  constantEqual,
  passwordHash,
} from "../worker/security";
const base = process.env.TEST_URL || "http://127.0.0.1:8787";
async function request(path: string, body?: any, cookie = "", method?: string) {
  const r = await fetch(base + "/api" + path, {
    method: method || (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0] || "",
  };
}
test("paper identifiers reject unsafe URLs", () => {
  assert.equal(arxivId("https://arxiv.org/pdf/1706.03762.pdf"), "1706.03762");
  assert.equal(arxivId("1706.03762v2"), "1706.03762v2");
  for (const s of [
    "http://127.0.0.1/secret",
    "https://arxiv.org.evil.test/abs/1706.03762",
    "file:///etc/passwd",
    "../../x",
  ])
    assert.throws(() => arxivId(s));
  assert.equal(safeLink("javascript:alert(1)"), undefined);
});
test("passwords are salted and verify in constant comparison", async () => {
  const a = await passwordHash("long-test-password");
  const b = await passwordHash("long-test-password");
  assert.notEqual(a, b);
  assert.equal(
    constantEqual(a, await passwordHash("long-test-password", a.split(":")[0])),
    true,
  );
  assert.equal(constantEqual(a, b), false);
});
test("account isolation, persistence, conflict handling and recovery", async () => {
  const suffix = Date.now();
  const pass = "Test-password-" + crypto.randomUUID();
  const a = await request("/auth/signup", {
    name: "Integration A",
    email: `a${suffix}@example.test`,
    password: pass,
  });
  assert.equal(a.status, 200);
  assert.equal(a.data.user.role, "member");
  assert.ok(a.data.recoveryCode);
  assert.equal(a.data.user.password, undefined);
  const b = await request("/auth/signup", {
    name: "Integration B",
    email: `b${suffix}@example.test`,
    password: pass,
  });
  assert.equal(b.status, 200);
  assert.equal(
    (await request("/admin/users", undefined, a.cookie)).status,
    403,
  );
  assert.equal((await request("/notebooks")).status, 401);
  const created = await request(
    "/notebooks",
    { title: "Integration paper" },
    a.cookie,
  );
  assert.equal(created.status, 200);
  let n = created.data;
  n.sources = [
    {
      id: "source-test",
      title: "Test study",
      text: "This synthetic test study reports accuracy of 82 percent. The sample includes 100 examples. The limitation is that the evaluation used a single dataset.",
      coverage: "Synthetic integration-test text",
    },
  ];
  n.selected = ["source-test"];
  n.notes = [
    {
      id: "note-test",
      text: "A persistent test note",
      created: new Date().toISOString(),
    },
  ];
  n.deck = {
    title: "Test deck",
    theme: "editorial",
    audience: "Students",
    slides: [
      {
        id: "slide-test",
        title: "A saved slide",
        bullets: ["Saved across sessions"],
        notes: "Notes persist too",
        visual: "Input → analysis → result",
      },
    ],
  };
  const saved = await request("/notebooks/" + n.id, n, a.cookie, "PUT");
  assert.equal(saved.status, 200);
  assert.equal(saved.data.revision, 2);
  assert.equal(
    (await request("/notebooks/" + n.id, undefined, b.cookie)).status,
    404,
  );
  assert.equal(
    (await request("/notebooks/" + n.id, n, b.cookie, "PUT")).status,
    404,
  );
  assert.equal(
    (await request("/notebooks/" + n.id, n, a.cookie, "PUT")).status,
    409,
  );
  const reopened = await request("/notebooks/" + n.id, undefined, a.cookie);
  assert.equal(reopened.data.deck.slides[0].title, "A saved slide");
  assert.equal(reopened.data.notes[0].text, "A persistent test note");
  const recovered = await request("/auth/recover", {
    email: a.data.user.email,
    password: pass + "new",
    recoveryCode: a.data.recoveryCode,
  });
  assert.equal(recovered.status, 200);
  assert.equal((await request("/notebooks", undefined, a.cookie)).status, 401);
  const login = await request("/auth/login", {
    email: a.data.user.email,
    password: pass + "new",
  });
  assert.equal(login.status, 200);
  assert.equal(
    (await request("/notebooks/" + n.id, undefined, login.cookie)).data.sources
      .length,
    1,
  );
  if (process.env.LIVE_AI === "1") {
    const response = await request(
      "/ai",
      { notebookId: n.id, kind: "summary" },
      login.cookie,
    );
    assert.equal(response.status, 200, JSON.stringify(response.data));
    assert.ok(response.data.result.overview);
    assert.ok(Array.isArray(response.data.result.limitations));
  }
  assert.equal(
    (await request("/notebooks/" + n.id, undefined, login.cookie, "DELETE"))
      .status,
    200,
  );
  assert.equal(
    (await request("/notebooks/" + n.id, undefined, login.cookie)).status,
    404,
  );
  await request("/auth/logout", {}, login.cookie);
  await request("/auth/logout", {}, b.cookie);
});
