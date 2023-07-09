const fs = require("fs");

const {
  deepCompare,
  loadConfig,
  clearUrl,
  parseQueryString,
  validateData,
  validateAndCheckMethod,
} = require("../utils");

describe("deepCompare", () => {
  it("should return true for equal primitive values", () => {
    expect(deepCompare(5, 5)).toBe(true);
    expect(deepCompare("hello", "hello")).toBe(true);
    expect(deepCompare(true, true)).toBe(true);
  });

  it("should return true for equal objects", () => {
    const obj1 = { name: "vinayak", age: 30 };
    const obj2 = { name: "vinayak", age: 30 };
    expect(deepCompare(obj1, obj2)).toBe(true);
  });

  it("should return false for different primitive values", () => {
    expect(deepCompare(5, 10)).toBe(false);
    expect(deepCompare("hello", "world")).toBe(false);
    expect(deepCompare(true, false)).toBe(false);
  });

  it("should return false for different objects", () => {
    const obj1 = { name: "vinayak", age: 30 };
    const obj2 = { name: "nammo", age: 25 };
    expect(deepCompare(obj1, obj2)).toBe(false);
  });

  it("should handle circular references correctly", () => {
    const obj1 = { name: "vinayak" };
    const obj2 = { name: "vinayak" };
    obj1.self = obj1;
    obj2.self = obj2;
    expect(deepCompare(obj1, obj2)).toBe(true);
  });
});

describe("loadConfig", () => {
  const testConfigPath = "test-config.json";

  beforeAll(() => {
    const configData = JSON.stringify({ port: 3000 });
    fs.writeFileSync(testConfigPath, configData);
  });

  afterAll(() => {
    fs.unlinkSync(testConfigPath);
  });

  it("should load the configuration from a file", () => {
    const config = loadConfig(testConfigPath);
    expect(config).toEqual({ port: 3000 });
  });

  it("should throw an error for invalid config file", () => {
    expect(() => {
      loadConfig("invalid-config.json");
    }).toThrow();
  });
});

describe("clearUrl", () => {
  it("should remove query parameters from the URL", () => {
    const url1 = "https://example.com/test?param1=value1&param2=value2";
    expect(clearUrl(url1)).toBe("https://example.com/test");

    const url2 = "https://example.com/page";
    expect(clearUrl(url2)).toBe("https://example.com/page");
  });
});

describe("parseQueryString", () => {
  it("should parse the query string into an object", () => {
    const queryString = "param1=value1&param2=value2&param3=value3";
    const parsedObj = parseQueryString(queryString);
    expect(parsedObj).toEqual({
      param1: "value1",
      param2: "value2",
      param3: "value3",
    });
  });

  it("should return an empty object for empty query string", () => {
    const queryString = "";
    const parsedObj = parseQueryString(queryString);
    expect(parsedObj).toEqual({});
  });
});

describe("validateData", () => {
  it("should throw an error if port is missing", () => {
    expect(() => {
      validateData({ method: "GET" });
    }).toThrow("Port is required");
  });

  it("should not throw an error if data is valid", () => {
    expect(() => {
      validateData({ port: 3000, method: "GET" });
    }).not.toThrow();
  });

  it("should not throw an error if invalid methods passed for string", () => {
    expect(() => {
      validateAndCheckMethod("GET");
    }).not.toThrow();
  });

  it("should not throw an error if invalid methods passed for array", () => {
    expect(() => {
      validateAndCheckMethod(["GET", "POST"]);
    }).not.toThrow();
  });
});
