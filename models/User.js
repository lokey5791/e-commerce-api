const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide name"],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "please provide email"],
    validate: {
      validator: validator.isEmail,
      messages: ["Please provide valid email"],
    },
  },
  password: {
    type: String,
    required: [true, "please provide password"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

UserSchema.pre("save", async function () {
  // console.log(this.modifiedPaths());
  // console.log(this.isModified('name'));
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
