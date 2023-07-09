const request = require("supertest");
const { startMultipleServer } = require("../index");

describe("API Tests", () => {
  let serverList;

  beforeAll(() => {
    // Start the server with the config.json file
    const config = require("../exampleConfig.json");
    serverList = startMultipleServer(config);
  });

  afterAll(() => {
    // Stop the server after all tests are finished
    for (const { server } of serverList) {
      server.server.close();
    }
  });

  it(`POST request on PORT 3000 from config for given input`, async () => {
    const serverConfig = serverList[0]["server"];
    const { port } = serverConfig;
    const url = `http://localhost:${port}`;
    const response = await request(url).post("/").send({ method: "text" });
    expect(response.status).toBe(200);
    expect(response.text).toBe("text");
  });

  it(`POST request on PORT 3000 from config without input`, async () => {
    const serverConfig = serverList[0]["server"];
    const { port } = serverConfig;
    const url = `http://localhost:${port}`;
    const response = await request(url).post("/");
    expect(response.status).toBe(500);
    expect(response.text).toBe("Internal Server Error");
  });

  it(`POST request on PORT 3000 from config for given input which didnt match input in config`, async () => {
    const serverConfig = serverList[0]["server"];
    const { port } = serverConfig;
    const url = `http://localhost:${port}`;
    const response = await request(url).post("/").send({ method: "text1" });
    expect(response.status).toBe(500);
    expect(response.text).toBe("Internal Server Error");
  });

  it(`GET request on PORT 3001 from config with incorrect path`, async () => {
    const serverConfig = serverList[1]["server"];
    const { port } = serverConfig;
    const path = serverConfig.path;
    const url = `http://localhost:${port}`;
    const response = await request(url).get(path);
    expect(response.status).toBe(404);
    expect(response.text).toBe("Not Found");
  });

  it(`GET request on PORT 3001 from config with correct path and input which didnt match input in config`, async () => {
    const serverConfig = serverList[1]["server"];
    const { port } = serverConfig;
    const path = serverConfig.path + "?method=text1";
    const url = `http://localhost:${port}`;

    const response = await request(url).get(path);
    expect(response.status).toBe(404);
    expect(response.text).toBe("Not Found");
  });

  it(`GET request on PORT 3002 from config with correct path and input`, async () => {
    const serverConfig = serverList[2]["server"];
    const { port } = serverConfig;
    const path = serverConfig.path + "?method=text";
    const url = `http://localhost:${port}`;

    const response = await request(url).get(path);
    expect(response.status).toBe(201);
    expect(response.text).toBe("text");
  });

  it(`GET request on PORT 3002 from config with correct path and config match all inputs`, async () => {
    const serverConfig = serverList[2]["server"];
    const { port } = serverConfig;
    const path = serverConfig.path;
    const url = `http://localhost:${port}`;
    const response = await request(url).get(path);
    expect(response.status).toBe(201);
    expect(response.text).toBe("text");
  });

  it(`PATCH request on PORT 3003 from config with correct path and input`, async () => {
    const serverConfig = serverList[3]["server"];
    const { port } = serverConfig;
    const path = serverConfig.path + "?method=json";
    const url = `http://localhost:${port}`;

    const response = await request(url).patch(path);
    expect(response.status).toBe(201);
    expect(response.text).toBe("Updated");
  });

  it(`PATCH request on PORT 3003 from config with correct path and input which didnt match input in config`, async () => {
    const serverConfig = serverList[3]["server"];
    const { port } = serverConfig;
    const path = serverConfig.path + "?method=json1";
    const url = `http://localhost:${port}`;

    const response = await request(url).patch(path);
    expect(response.status).toBe(500);
    expect(response.text).toBe("Internal Server Error");
  });
});
