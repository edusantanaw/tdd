const express = require("express");

module.exports = () => {
  const router = new SignupRouter();
  router.post("/signup", ExpressRouterAdapter.adapt(router));
};

class ExpressRouterAdapter {
  static adapt(router) {
    return async (req, res) => {
      const httpRequet = {
        body: req.body,
      };
      const httpResponse = await router.route(httpRequet);
      res.status(httpResponse.statusCode).json(httpResponse.body);
    };
  }
}
// presetantional
// signup router
class SignupRouter {
  async route(httpRequet) {
    const { email, password, repeatPassword } = httpRequet.body;
    const user = new SignupUserCase().signup(email, password, repeatPassword);
    return {
      statusCode: 200,
      body: user,
    };
  }
}

// Domain
// signup useCases
class SignupUserCase {
  async signup(email, password, repeatPassword) {
    if (password === repeatPassword) {
      new addAccountReposity().add(email, password);
    }
  }
}

// infra layer
// add account repo
const mongoose = require("mongoose");
const accountModel = mongoose.model("Account");

class addAccountReposity {
  async add(email, password) {
    const user = await accountModel.create({ email, password });
    return user;
  }
}
