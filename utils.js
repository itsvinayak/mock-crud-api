const fs = require("fs");


const deepCompare = (obj1, obj2, visited = new WeakMap()) => {
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  if (typeof obj1 === "object" && typeof obj2 === "object") {
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
};

const loadConfig = (config) => {
  const configObj = fs.readFileSync(config, "utf8");
  const configJson = JSON.parse(configObj);
  return configJson;
};

const clearUrl = (url) => {
  let urlArr = url.split("?");
  return urlArr[0];
};

const parseQueryString = (queryString) => {
  const queryObj = {};
  const keyValuePairs = queryString.split("&");
  keyValuePairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    queryObj[key] = value;
  });
  return queryObj;
};


const validateData = (data) => {
  if(!data.port) {
    throw new Error("Port is required");
  }
  if(!data.type) {
    throw new Error("Type is required");
  }
};

/**
 *
 * @param {Object} res
 * @param {string} errorCode
 * @param {string} errorMessage
 * @returns {Object}
 * @description Returns an object with errorCode and errorMessage if they are present
 */
const httpErrorResponseIfPresent = (errorCode = 404, errorMessage = "Not Found") => {
  if(errorCode === null) {
    errorCode = 404;
  }
  if(errorMessage === null) {
    errorMessage = "Not Found";
  }
  return { errorCode, errorMessage };
};

const httpResponseIfPresent = (code = 200, output = "OK") => {
  if(code === null) {
    code = 200;
  }
  if(output === null) {
    output = "OK";
  }
  return { code, output };
};

module.exports = {
  deepCompare,
  loadConfig,
  clearUrl,
  parseQueryString,
  validateData,
  httpErrorResponseIfPresent,
  httpResponseIfPresent
};
