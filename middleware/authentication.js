const CustomError = require("../errors");
const { isTokenValid } = require("../util/index.js");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError("Invalid authentication");
  }
  try {
    const { name, id, role } = isTokenValid({ token });

    req.user = { name, id, role };
    next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError("Invalid authentication");
  }
};

const authorizeUser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError("Access denied");
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeUser };
