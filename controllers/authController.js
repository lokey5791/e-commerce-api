const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const {
  createJwt,
  addCookeisToResponse,
  createTokenUser,
} = require("../util/index.js");
const CustomError = require("../errors");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("email already in use");
  }

  const countUsers = await User.countDocuments({});
  let role = "user";
  if (countUsers === 0) {
    role = "admin";
  }

  const user = await User.create({ email, name, password, role });

  const tokenUser = createTokenUser(user);
  addCookeisToResponse({ res, user: tokenUser });
  //const token = createJwt({ payload: tokenUser });
  //console.log(req.signedCookies);
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  const tokenUser = createTokenUser(user);
  addCookeisToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out" });
};

module.exports = {
  register,
  login,
  logout,
};
