const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  addCookeisToResponse,
  checkPermissions,
} = require("../util");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const user = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ user });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id ${req.params.id}`);
  }

  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
// findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError("provide email and name");
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.id },
//     { email, name },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   const tokenUser = createTokenUser(user);
//   addCookeisToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ tokenUser });
// };

// user.save
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("provide email and name");
  }
  const user = await User.findOne({ _id: req.user.id });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  addCookeisToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide old and new password"
    );
  }
  const user = await User.findOne({ _id: req.user.id });
  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch) {
    throw new CustomError.UnauthenticatedError("Invalid password");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Password updated successfully" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
