import http from "http";
import { parseArgs } from "node:util";
import fs from "fs";

function deepCompare(obj1, obj2, visited = new WeakMap()) {
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  if (typeof obj1 === "object") {
    if (
      Array.isArray(obj1) !== Array.isArray(obj2) ||
      obj1.length !== obj2.length
    ) {
      return false;
    }

    const obj1Visited = visited.get(obj1);
    const obj2Visited = visited.get(obj2);

    if (obj1Visited && obj2Visited) {
      return true; // Circular reference detected, consider them equal
    }

    visited.set(obj1, true);
    visited.set(obj2, true);

    if (Array.isArray(obj1)) {
      for (let i = 0; i < obj1.length; i++) {
        if (!deepCompare(obj1[i], obj2[i], visited)) {
          return false;
        }
      }
    } else {
      const keys1 = Object.keys(obj1);

      for (const key of keys1) {
        if (
          !Object.prototype.hasOwnProperty.call(obj2, key) ||
          !deepCompare(obj1[key], obj2[key], visited)
        ) {
          return false;
        }
      }
    }
  } else {
    if (obj1 !== obj2) {
      return false;
    }
  }

  return true;
}

const loadConfig = (config) => {
  const configObj = fs.readFileSync(config, "utf8");
  const configJson = JSON.parse(configObj);
  return configJson;
};


/**
 * @class CreateServer
 * @description Create a server with the given configuration
 * @param {Object} config
 * @param {number} config.port
 * @param {string} config.path
 * @param {string} config.type
 * @param {Object} config.input
 * @param {Object} config.output
 * @param {number} config.elseOutputErrorCode
 * @param {Object} config.elseOutput
 * @returns {void}
 */
class CreateServer {
  constructor({
    port,
    path,
    type,
    input,
    output,
    elseOutputErrorCode,
    elseOutput,
  }) {
    this.port = port;
    this.path = path;
    this.type = type;
    this.input = input;
    this.output = output;
    this.elseOutputErrorCode = elseOutputErrorCode;
    this.elseOutput = elseOutput;
    console.table({
      port,
      path,
      type,
      input: JSON.stringify(input),
      output: JSON.stringify(output),
      elseOutputErrorCode,
      elseOutput,
    });
  }

  createServer() {
    http
      .createServer((req, res) => {
        console.log(req.method, req.url);
        let body = ""; 
        if (req.method === "POST") {
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            req.body = JSON.parse(body);
            this.handleRequest(req, res); 
          });
        } else {
          req.query = req.url.split("?")[1];
          this.handleRequest(req, res); 
        }
      })
      .listen(this.port);
  }

  handleRequest(req, res) {
    let reqObj = req.body || {};
    if (req.query) {
      reqObj = { ...reqObj, ...parseQueryString(req.query) }; 
    }

    console.info("reqObj : ", reqObj);
    if (req.method === this.type && req.url === this.path) {
      
      if (this.input) {
        let canRes = deepCompare(this.input, reqObj);
        if (canRes) {
          if (this.output) {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(this.output);
          } else {
            res.writeHead(this.errorCodes, { "Content-Type": "text/plain" });
            res.end(this.errorMessages);
          }
        } else {
          res.writeHead(this.elseOutputErrorCode, {
            "Content-Type": "text/plain",
          });
          res.end(this.elseOutput);
        }
      } else if (this.output) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(this.output);
      } else if (this.errorCodes) {
        res.writeHead(this.errorCodes, { "Content-Type": "text/plain" });
        res.end(this.errorMessages);
      } else {
        // give internal server error
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      }
    } else if (this.errorCodes) {
      res.writeHead(this.errorCodes, { "Content-Type": "text/plain" });
      if (this.errorMessages) {
        res.end(this.errorMessages);
      } else {
        res.end("Internal Server Error");
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  }
}

const parseQueryString = (queryString) => {
  const queryObj = {};
  const keyValuePairs = queryString.split("&");
  keyValuePairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    queryObj[key] = value;
  });
  return queryObj;
};

const main = (config) => {
  for (const serverConfig of config) {
    const server = new CreateServer(serverConfig);
    server.createServer();
  }
};

const help = () => {
  console.log("Help : ");
  console.log(" -c, --config : config file path");
  console.log(" -h, --help : help");

  console.log("Example and Syntax of config File: ");
  let configParam = {
    name: "name of server",
    type: "method type",
    port: "port number",
    path: "path of server",
    input: "input for which output is to be generated",
    output: "output to be generated",
    elseOutputErrorCode: "error code for if input is not matched",
    elseOutput: "output for if input is not matched",
    // if output is not given then it will below error code and message
    errorCodes: "error code for if server is not found",
    errorMessages: "error message for if server is not found"
  }
  console.table(configParam);
  console.log("Happy Coding :) ");
};

const options = {
  config: {
    type: "string",
    short: "c",
  },
  help: {
    short: "h",
    type: "boolean",
  },
};

const { values } = parseArgs({
  args,
  options,
  allowPositionals: true,
});

if (values.help) {
  help();
  process.exit(0);
} else if (values.config) {
  console.log("Config file : ", values.config);
  let config = loadConfig(values.config);
  main(config);
} else {
  console.log("No config file passed");
  help();
  process.exit(0);
}
