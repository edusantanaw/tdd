const MissingParamError = require("../errors/missing-param-error");
const jwt = require("jsonwebtoken");
const TokenGenerator = require("./token-generator");


const makeSut = () => {
  return new TokenGenerator("secret");
};

describe("Token Generator", () => {
  test("Should return null if jwt returns null", async () => {
    const sut = makeSut();
    jwt.token = null;
    const token = await sut.generate("any_id");
    expect(token).toBeNull();
  });

  test("Should return a token if jwt returns token", async () => {
    const sut = makeSut();
    const token = await sut.generate("any_id");
    expect(token).toBe(jwt.token);
  });

  test("Should call with currect values", async () => {
    const sut = makeSut();
    await sut.generate("any_id");
    expect(jwt.id).toBe("any_id");
    expect(jwt.secret).toBe(sut.secret);
  });

  test("Should throw if no secret is provided", async () => {
    const sut = new TokenGenerator();
    const promise = sut.generate("any_id");
    expect(promise).rejects.toThrow(new MissingParamError("secret"));
  });

  test("Should throw if no id is provided", async () => {
    const sut =  makeSut();
    const promise = sut.generate();
    expect(promise).rejects.toThrow(new MissingParamError("id"));
  });
});
