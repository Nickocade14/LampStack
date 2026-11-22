/**
 * Front-end unit tests for public/js/code.js (runs in jsdom, no server needed).
 */
const { loadScript } = require("../helpers/loadScript");

// Minimal fake XMLHttpRequest so we can check what the page would send
class FakeXHR {
  constructor() {
    FakeXHR.instances.push(this);
    this.headers = {};
  }
  open(method, url) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(name, value) {
    this.headers[name] = value;
  }
  send(body) {
    this.body = body;
  }
  // Simulates the server answering the request
  respond(status, responseText) {
    this.readyState = 4;
    this.status = status;
    this.responseText = responseText;
    this.onreadystatechange.call(this);
  }
}
FakeXHR.instances = [];

beforeAll(() => {
  loadScript("public/js/code.js");
});

beforeEach(() => {
  FakeXHR.instances = [];
  window.XMLHttpRequest = FakeXHR;
  document.body.innerHTML = `
    <input type="text" id="searchText">
    <span id="colorSearchResult"></span>
    <p id="colorList"></p>
    <input type="text" id="colorText">
    <span id="colorAddResult"></span>
  `;
});

describe("validateColorName", () => {
  test("accepts a normal color name", () => {
    expect(window.validateColorName("Blue")).toBe("");
  });

  test("rejects an empty or whitespace-only name", () => {
    expect(window.validateColorName("")).toBe("Please enter a color name");
    expect(window.validateColorName("   ")).toBe("Please enter a color name");
  });

  test("rejects non-string input", () => {
    expect(window.validateColorName(undefined)).toBe("Please enter a color name");
    expect(window.validateColorName(null)).toBe("Please enter a color name");
  });

  test("enforces the 50 character database limit", () => {
    expect(window.validateColorName("a".repeat(50))).toBe("");
    expect(window.validateColorName("a".repeat(51))).toBe(
      "Color name must be 50 characters or fewer"
    );
  });
});

describe("formatColorList", () => {
  test("joins results with line breaks", () => {
    expect(window.formatColorList(["Red", "Green", "Blue"])).toBe(
      "Red<br />\r\nGreen<br />\r\nBlue"
    );
  });

  test("returns a single color without a trailing break", () => {
    expect(window.formatColorList(["Red"])).toBe("Red");
  });

  test("returns an empty string for missing or empty results", () => {
    expect(window.formatColorList([])).toBe("");
    expect(window.formatColorList(undefined)).toBe("");
  });

  test("escapes HTML so color names cannot inject markup", () => {
    expect(window.formatColorList(["<b>Red</b>"])).toBe("&lt;b&gt;Red&lt;/b&gt;");
  });
});

describe("addColor form", () => {
  test("shows a validation error and does not call the API for an empty name", () => {
    document.getElementById("colorText").value = "  ";

    window.addColor();

    expect(document.getElementById("colorAddResult").innerHTML).toBe(
      "Please enter a color name"
    );
    expect(FakeXHR.instances).toHaveLength(0);
  });

  test("sends a trimmed color as JSON to AddColor.php", () => {
    document.getElementById("colorText").value = "  Teal  ";

    window.addColor();

    expect(FakeXHR.instances).toHaveLength(1);
    const xhr = FakeXHR.instances[0];
    expect(xhr.method).toBe("POST");
    expect(xhr.url).toBe("/LAMPAPI/AddColor.php");
    expect(JSON.parse(xhr.body)).toEqual({ color: "Teal", userId: 0 });

    xhr.respond(200, '{"error":""}');
    expect(document.getElementById("colorAddResult").innerHTML).toBe("Color has been added");
  });
});

describe("searchColor", () => {
  test("renders the colors returned by the API", () => {
    document.getElementById("searchText").value = "re";

    window.searchColor();

    const xhr = FakeXHR.instances[0];
    expect(xhr.url).toBe("/LAMPAPI/SearchColors.php");
    expect(JSON.parse(xhr.body)).toEqual({ search: "re", userId: 0 });

    xhr.respond(200, '{"results":["Red","Green"],"error":""}');
    expect(document.getElementById("colorList").innerHTML).toBe("Red<br>\nGreen");
    expect(document.getElementById("colorSearchResult").innerHTML).toBe(
      "Color(s) has been retrieved"
    );
  });
});
