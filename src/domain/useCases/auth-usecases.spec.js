const { MissingParamError } = require("../../utils/errors");
const AuthUseCase = require("./auth-usecase");

const makeEncrypt = () => {
  class EncrypterSpy {
    async compare(password, hashPassword) {
      this.hashPassword = hashPassword;
      this.password = password;
      return this.isValid;
    }
  }
  const encryptSpy = new EncrypterSpy();
  encryptSpy.isValid = true;
  return encryptSpy;
};

const makeEncryptWithError = () => {
  class EncrypterSpy {
    async compare() {
      throw new Error();
    }
  }
  return new EncrypterSpy();
};

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate(userId) {
      this.userId = userId;
      return this.accessToken;
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy();
  tokenGeneratorSpy.accessToken = "any_token";
  return tokenGeneratorSpy;
};

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorSpy {
    async generate() {
      throw new Error();
    }
  }

  return new TokenGeneratorSpy();
};

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load(email) {
      this.email = email;
      return this.user;
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
  loadUserByEmailRepositorySpy.user = {
    password: "hashed_password",
    id: "any_id",
  };
  return loadUserByEmailRepositorySpy;
};

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositorySpy {
    async load() {
      throw new Error();
    }
  }
  return new LoadUserByEmailRepositorySpy();
};
const makeUpdateAccessTokenRepositoryWithError = () => {
  class UpdateAccessTokenRepository {
    async update() {
      throw new Error();
    }
  }
  return new UpdateAccessTokenRepository();
};

const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepositorySpy {
    async update(userId, accessToken) {
      this.userId = userId;
      this.accessToken = accessToken;
    }
  }
  return new UpdateAccessTokenRepositorySpy();
};

const makeSut = () => {
  const encryptSpy = makeEncrypt();
  const tokenGeneratorSpy = makeTokenGenerator();
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository();
  const updateAccessTokenRepositorySpy =  makeUpdateAccessTokenRepository();
  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encryptSpy,
    tokenGenerator: tokenGeneratorSpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy,
  });
  return {
    sut,
    loadUserByEmailRepositorySpy,
    encryptSpy,
    tokenGeneratorSpy,
    updateAccessTokenRepositorySpy,
  };
};

describe("Auth useCase", () => {
  test("Should throw if no email is provided", async () => {
    const { sut } = makeSut();
    const promise = sut.auth();
    expect(promise).rejects.toThrow(new MissingParamError("email"));
  });

  test("Should throw if no password is provided", async () => {
    const { sut } = makeSut();
    const promise = sut.auth("any_email@email.com");
    expect(promise).rejects.toThrow(new MissingParamError("password"));
  });

  test("Should call LoadUserByEmailRepository with correct email", async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut();

    await sut.auth("any_email@email.com", "any_password");
    expect(loadUserByEmailRepositorySpy.email).toBe("any_email@email.com");
  });

  test("Should throw if no LoadUserByEmailRepository is provided", async () => {
    const sut = new AuthUseCase({});
    const promise = sut.auth("any_email@email.com", "any_password");
    expect(promise).rejects.toThrow();
  });
  test("Should throw if no dependece is provided", async () => {
    const sut = new AuthUseCase();
    const promise = sut.auth("any_email@email.com", "any_password");
    expect(promise).rejects.toThrow();
  });

  test("Should throw if no LoadUserByEmailRepository has no load method", async () => {
    const sut = new AuthUseCase({ loadUserByEmailRepository: {} });
    const promise = sut.auth("any_email@email.com", "any_password");
    expect(promise).rejects.toThrow();
  });

  test("Should return null if an invalid email is provided", async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut();
    loadUserByEmailRepositorySpy.user = null;
    const accessToken = await sut.auth(
      "invalid_email@email.com",
      "any_password"
    );
    expect(accessToken).toBeNull();
  });

  test("Should return null if an invalid password ia provided", async () => {
    const { sut, encryptSpy } = makeSut();
    encryptSpy.isValid = false;
    const accessToken = await sut.auth(
      "valid_email@email.com",
      "invalid_password"
    );
    expect(accessToken).toBeNull();
  });

  test("Should call Encrypter with correct values", async () => {
    const { sut, loadUserByEmailRepositorySpy, encryptSpy } = makeSut();
    await sut.auth("valid_email@email.com", "any_password");
    expect(encryptSpy.password).toBe("any_password");
    expect(encryptSpy.hashPassword).toBe(
      loadUserByEmailRepositorySpy.user.password
    );
  });

  test("Should call TokenGenerator with correct userId", async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut();
    await sut.auth("valid_email@email.com", "any_password");
    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id);
  });

  test("Should return an accessToken if correct credentials are provide", async () => {
    const { sut, tokenGeneratorSpy } = makeSut();
    const accessToken = await sut.auth("valid_email@email.com", "any_password");
    expect(accessToken).toBe(tokenGeneratorSpy.accessToken);
    expect(accessToken).toBeTruthy();
  });

  test("Should call UpdateAccessTokenRepository with correct values", async () => {
    const {
      sut,
      loadUserByEmailRepositorySpy,
      updateAccessTokenRepositorySpy,
      tokenGeneratorSpy,
    } = makeSut();
    await sut.auth("valid_email@email.com", "valid_password");
    expect(updateAccessTokenRepositorySpy.userId).toBe(
      loadUserByEmailRepositorySpy.user.id
    );
    expect(updateAccessTokenRepositorySpy.accessToken).toBe(
      tokenGeneratorSpy.accessToken
    );
  });

  test("Should throw if invalid dependeces are provided", async () => {
    const invalid = {};
    const loadUserByEmailRepository = makeLoadUserByEmailRepository();
    const tokenGenerator = makeTokenGenerator()
    const encrypt = makeEncrypt();
    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypt: invalid,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypt,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypt,
        tokenGenerator: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypt,
        tokenGenerator,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypt,
        tokenGenerator,
        updateAccessTokenRepository: invalid
      }),

    );
    for (const sut of suts) {
      const promise = sut.auth("any_email@email.com", "any_password");
      expect(promise).rejects.toThrow();
    }
  });

  test("Should throw if  dependecey throw", async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository();
    const encrypt = makeEncrypt();
    const tokenGenerator = makeTokenGenerator()
    const suts = [].concat(
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError(),
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypt: makeEncryptWithError(),
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypt,
        tokenGenerator: makeTokenGeneratorWithError(),
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypt,
        tokenGenerator,
        updateAccessTokenRepository: makeUpdateAccessTokenRepositoryWithError()
      })
    );
    for (const sut of suts) {
      const promise = sut.auth("any_email@email.com", "any_password");
      expect(promise).rejects.toThrow();
    }
  });
});
