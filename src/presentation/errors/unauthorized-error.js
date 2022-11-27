module.exports = class UnauthorizedError extends Error {
  constructor() {
    super(`unauthorized`);
    this.name = "UnauthorizedError";
  }
};
