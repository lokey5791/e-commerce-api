const CustomError = require("../errors");

const checkPermissions = (requestUser, resourseID) => {
  // console.log(requestUser);
  // console.log(resourseID);
  // console.log(typeof resourseID);
  if (requestUser.role === "admin") return;
  if (requestUser.id === resourseID.toString()) return;
  throw new CustomError.UnauthorizedError("Do not have permission to access");
};

module.exports = checkPermissions;
