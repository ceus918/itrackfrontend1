const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phoneno: String,
  email: String,
  password: String,
  role: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;

