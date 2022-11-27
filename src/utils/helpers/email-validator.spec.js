const EmailValidator = require("./email-validator");
const validator = require("validator");
const { MissingParamError } = require("../errors");

const makeSut = () => {
    return new EmailValidator()
}

describe("Email Validator", () => {
  test("Should return true if validator returns true", () => {
    const sut = new EmailValidator();
    const isEmailValid = sut.isValid("valid@email.com");
    expect(isEmailValid).toBe(true);
  });

  test("Should return false if validator r eturns false", () => {
    validator.isEmailValid = false;
    const sut = new EmailValidator();
    const isEmailValid = sut.isValid("invalid@email.com");
    expect(isEmailValid).toBe(false);
  });

  test("Should call validator with correct email", () => {
    const sut = makeSut()
    sut.isValid("any@email.com");
    expect(validator.email).toBe("any@email.com");
  });

  test("Should throw if no email is provided", async () => {
    const sut = makeSut();
    expect(() => sut.isValid()).toThrow(new MissingParamError("email"));
});
});
