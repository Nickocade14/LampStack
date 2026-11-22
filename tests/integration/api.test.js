/**
 * Integration tests for the PHP API.
 *
 * These call the real endpoints in api/ over HTTP, backed by a real MySQL
 * database. Node only sends the requests; the app itself runs on PHP + MySQL.
 * In CI the server is started with `php -S 127.0.0.1:8000 -t api`.
 */
const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

// Seeded by db/schema.sql
const TEST_LOGIN = "TestUser";
const TEST_PASSWORD = "Test";

async function post(endpoint, body) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(body),
  });
  const text = await response.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${endpoint} did not return valid JSON:\n${text}`);
  }

  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    json,
  };
}

describe("Login.php", () => {
  test("returns the user for valid credentials", async () => {
    const res = await post("Login.php", { login: TEST_LOGIN, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.contentType).toMatch(/application\/json/);
    expect(Object.keys(res.json).sort()).toEqual(["error", "firstName", "id", "lastName"]);
    expect(res.json.id).toBeGreaterThan(0);
    expect(res.json.firstName).toBe("Test");
    expect(res.json.lastName).toBe("User");
    expect(res.json.error).toBe("");
  });

  test("returns id 0 and an error for a wrong password", async () => {
    const res = await post("Login.php", { login: TEST_LOGIN, password: "wrong" });

    expect(res.status).toBe(200);
    expect(res.json).toEqual({
      id: 0,
      firstName: "",
      lastName: "",
      error: "No Records Found",
    });
  });
});

describe("AddColor.php and SearchColors.php", () => {
  let userId;
  // Unique per run so repeated runs against the same database still pass
  const colorName = `CITeal${Date.now()}`;

  beforeAll(async () => {
    const res = await post("Login.php", { login: TEST_LOGIN, password: TEST_PASSWORD });
    userId = res.json.id;
  });

  test("AddColor returns an empty error on success", async () => {
    const res = await post("AddColor.php", { color: colorName, userId });

    expect(res.status).toBe(200);
    expect(res.contentType).toMatch(/application\/json/);
    expect(res.json).toEqual({ error: "" });
  });

  test("SearchColors finds the color that was just added", async () => {
    const res = await post("SearchColors.php", { search: colorName.slice(0, 8), userId });

    expect(res.status).toBe(200);
    expect(res.contentType).toMatch(/application\/json/);
    expect(Object.keys(res.json).sort()).toEqual(["error", "results"]);
    expect(Array.isArray(res.json.results)).toBe(true);
    expect(res.json.results).toContain(colorName);
    res.json.results.forEach((color) => expect(typeof color).toBe("string"));
    expect(res.json.error).toBe("");
  });

  test("SearchColors only returns colors that belong to the user", async () => {
    const res = await post("SearchColors.php", { search: colorName, userId: userId + 1000 });

    expect(res.json.error).toBe("No Records Found");
    expect(res.json.results).toBeUndefined();
  });

  test("SearchColors returns an error when nothing matches", async () => {
    const res = await post("SearchColors.php", { search: "no-such-color-xyz", userId });

    expect(res.status).toBe(200);
    expect(res.json.error).toBe("No Records Found");
  });
});
