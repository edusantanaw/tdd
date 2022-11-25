const LoginRouter = require("./login-router");
const MissingParamError = require("../helpers/missing-param-error");
const UnauthorizedError = require("../helpers/unauthorized-error");
const ServerError = require("../helpers/server-error");

const makeSut = () => {
  class AuthUseCaseSpy {
    auth(email, password) {
      this.email = email;
      this.password = password;
      return this.accessToken;
    }
  }
  const authUseCaseSpy = new AuthUseCaseSpy();
  authUseCaseSpy.accessToken = "valid_token";
  const sut = new LoginRouter(authUseCaseSpy);
  return { sut, authUseCaseSpy };
};

describe("Login Router", () => {
  test("Should return 400 if no email is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        password: "any_pafssword",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });

  test("Should return 400 if no password is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: "any_email@email.com",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    1;
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should return 500 if httpRequest is provided", () => {
    const { sut } = makeSut();
    const httpResponse = sut.route();
    expect(httpResponse.statusCode).toBe(500);
  });

  test("Should return 500 if httpRequest has no body", () => {
    const { sut } = makeSut();
    const httpResponse = sut.route({});
    expect(httpResponse.statusCode).toBe(500);
  });

  test("Should call AuthUseCase with correct params", () => {
    const { sut, authUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        password: "any_pafssword",
        email: "any_email@email.com",
      },
    };
    sut.route(httpRequest);
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email);
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password);
  });
  test("Should return 401 when invalid credentials are provider ", () => {
    const { sut, authUseCaseSpy } = makeSut();
    authUseCaseSpy.accessToken = null;
    const httpRequest = {
      body: {
        password: "invalid_pafssword",
        email: "invalid_email@email.com",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(401);
    expect(httpResponse.body).toEqual(new UnauthorizedError());
  });
  test("Should return 500 when  if no AuthUseCase is provider ", () => {
    const sut = new LoginRouter();

    const httpRequest = {
      body: {
        password: "any_pafssword",
        email: "any_email@email.com",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError())
  });

  test("Should return 500 when  if AuthUseCase has no auth method", () => {
    const sut = new LoginRouter({});

    const httpRequest = {
      body: {
        password: "any_pafssword",
        email: "any_email@email.com",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
  });
  test("Should return 200 when valid credentials is provided", () => {
    const { sut, authUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        password: "valid_pafssword",
        email: "valid_email@email.com",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
  });
});