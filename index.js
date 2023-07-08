const http = require("http");
const chalk = require("chalk");
const process = require("node:process");

const {
  deepCompare,
  loadConfig,
  clearUrl,
  parseQueryString,
  validateData,
  httpErrorResponseIfPresent,
  httpResponseIfPresent
} = require("./utils");
const { parseArgs } = require("node:util");

/**
 * @class CreateServer
 * @description Create a server with the given configuration
 * @param {Object} config
 * @param {number} config.port
 * @param {string} config.path
 * @param {string} config.type
 * @param {Object} config.input
 * @param {number} config.code
 * @param {Object} config.output
 * @param {number} config.errorCode
 * @param {string} config.errorMessage
 * @returns {void}
 */
class CreateServer {
  constructor({
    name,
    port,
    path,
    type,
    input,
    code,
    output,
    errorCode,
    errorMessage,
  }) {
    this.port = port;
    this.path = path || "/";
    this.type = type;
    this.input = input || null;
    this.code = code || 200;
    this.output = output || null;
    this.errorCode = errorCode || null;
    this.errorMessage = errorMessage || null;
    this.server = this.createServer();
    try {
      validateData(this);
    } catch (error) {
      console.log(chalk.red(error.message, ` for server ${name}`));
      process.exit(1);
    }
    console.table([
      {
        "Server Name": name || "default",
        port,
        path,
        type,
        input: JSON.stringify(input) || "null",
        code,
        output: JSON.stringify(output) || "null",
        errorCode: JSON.stringify(errorCode) || "null",
        errorMessage: JSON.stringify(errorMessage) || "null",
      },
    ]);
  }

  createServer() {
    let server = http.createServer((req, res) => {
      console.log(chalk.green("Request Received : ", req.method, req.url));
      let body = "";
      if (req.method === "POST") {
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          if (body) {
            req.body = JSON.parse(body);
          } else {
            req.body = {};
          }
          this.handleRequest(req, res);
        });
      } else if (req.url.includes("?")) {
        req.query = req.url.split("?")[1];
        this.handleRequest(req, res);
      } else {
        this.handleRequest(req, res);
      }
    });
    server.listen(this.port);
    return server;
  }

  handleRequest(req, res) {
    let reqObj = req.body || null;
    if (req.query) {
      reqObj = { ...reqObj, ...parseQueryString(req.query) };
    }
    console.log(chalk.yellow("Requested Object  : ", JSON.stringify(reqObj)));
    let url = clearUrl(req.url);
    if (req.method === this.type && url === this.path) {
      if (this.input) {
        let canRes = false;
        if (reqObj) {
          canRes = deepCompare(this.input, reqObj);
        }
        if (canRes) {
          if (this.output) {
            let { code, output } = httpResponseIfPresent(this.code, this.output);
            res.writeHead(code, { "Content-Type": "text/plain" });
            console.log(chalk.blue("output : ", output));
            res.end(output);
          } else {
            let { errorCode, errorMessage } = httpErrorResponseIfPresent(
              this.errorCode,
              this.errorMessage
            );
            res.writeHead(errorCode, {
              "Content-Type": "text/plain",
            });
            console.log(chalk.red("errorMessage : ", errorMessage));
            res.end(errorMessage);
          }
        } else {
          let { errorCode, errorMessage } = httpErrorResponseIfPresent(
            this.errorCode,
            this.errorMessage
          );
          res.writeHead(errorCode, {
            "Content-Type": "text/plain",
          });
          console.log(chalk.red("errorMessage : ", errorMessage));
          res.end(errorMessage);
        }
      } else {
        let { errorCode, errorMessage } = httpErrorResponseIfPresent(
          this.errorCode,
          this.errorMessage
        );
        res.writeHead(errorCode, {
          "Content-Type": "text/plain",
        });
        console.log(chalk.red("errorMessage : ", errorMessage));
        res.end(errorMessage);
      }
    } else {
      let { errorCode, errorMessage } = httpErrorResponseIfPresent(
        this.errorCode,
        this.errorMessage
      );
      res.writeHead(errorCode, {
        "Content-Type": "text/plain",
      });
      console.log(chalk.red("errorMessage : ", errorMessage));
      res.end(errorMessage);
    }
  }

  close() {
    console.log(chalk.red("Server Closed : ", this.port, this.path, this.type));
    this.server.close();
  }
}

/**
 *
 * @param {Object} config
 * @returns array of server list
 * @description start multiple server with the given configuration
 * @example
 * let config = [
 * {
 * port: 3000,
 * path: "/test",
 * type: "GET",
 * input: {
 * name: "test"
 * },
 * output: "test"
 * }
 * ]
 * startMultipleServer(config);
 *  */
const startMultipleServer = (config) => {
  console.log(chalk.black.bgYellow("Starting Multiple Server"));
  if (!Array.isArray(config)) {
    config = [config];
  }
  let serverList = [];
  for (const serverConfig of config) {
    const server = new CreateServer(serverConfig);
    serverList.push(server);
  }
  return serverList;
};

/**
 * @param {void}
 * @returns {void}
 * @description get help for the cli
 */
const help = () => {
  console.log(chalk.black.bgYellow("Help : "));
  console.log(chalk.green(" -c, --config : config file path"));
  console.log(chalk.green(" -h, --help : help"));

  console.log(chalk.black.bgYellow("Example and Syntax of config File: "));
  let configParam = {
    name: "name of server",
    type: "method type",
    port: "port number",
    path: "path of server",
    input: "input for which output is to be generated",
    code: "code for if server is found",
    output: "output to be generated",
    errorCode: "error code for if server is not found",
    errorMessage: "error message for if server is not found",
  };
  console.table(configParam);
  console.log("Happy Coding :) ");
};

const main = () => {
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
  let args = process.argv;
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
    startMultipleServer(config);
  } else {
    console.log(chalk.red.bgGreen("No config file passed \n"));
    help();
    process.exit(0);
  }
};

if (require.main === module) {
  main();
}

module.exports = {
  CreateServer,
  startMultipleServer,
  help,
};
