# Plugin: mock-rest-api

This plugin allows you to easily create mock REST API servers for testing and development purposes. It provides a simple way to define server configurations, handle requests, and send mock responses.

## Installation

To install the mock-rest-api plugin, follow these steps:

- Make sure you have Node.js installed on your machine.
- Open a terminal or command prompt.
- Navigate to your project directory.
- Run the following command to install the plugin:

```bash
npx mock-rest-api -config config.json
```

```bash
npx mock-rest-api -c config.json
```

## Usage

To use the mock-rest-api plugin, follow these steps:

- Create a configuration file (e.g., config.json) with the server configurations.

```json
[
  {
    "name": "Server 1",
    "type": "GET",
    "port": 3000,
    "path": "/api/users",
    "input": { "name": "test" },
    "output": "Hello World",
    "elseOutputErrorCode": 400,
    "elseOutput": "Bad Request",
    "errorCodes": 404,
    "errorMessages": "Not Found"
  },
  {
    "name": "Server 2",
    "type": "POST",
    "port": 3001,
    "path": "/api/posts",
    "input": { "title": "Sample Post" },
    "output": "Post Created",
    "elseOutputErrorCode": 400,
    "elseOutput": "Bad Request",
    "errorCodes": 404,
    "errorMessages": "Not Found"
  }
]
```

In the configuration file, you can define multiple server configurations. Each configuration object should have the following properties:

- name: The name of the server.
- type: The HTTP request method (e.g., GET, POST, PUT, DELETE).
- port: The port number on which the server will listen.
- path: The API endpoint path for the server.
- input: The input for which the output is to be generated.
- output: The output to be generated for matching requests.
- elseOutputErrorCode: The error code to be returned if the - input is not matched.
- elseOutput: The output to be returned if the input is not matched.
- errorCodes: The error code to be returned if the server is not found.
- errorMessages: The error message to be returned if the server is not found.

### License

This plugin is released under the MIT License.
