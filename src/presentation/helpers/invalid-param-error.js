module.exports = class MissingParamError extends Error {
  constructor(paramName) {
    super(`Invalid param: ${paramName}`);
    this.name = "InvalidParamError";
  }
};
