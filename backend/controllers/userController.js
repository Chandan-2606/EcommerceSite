import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
  // res.send('Hello')
  const { username, email, password } = req.body;
  console.log(req.body);
  // some validation
  if (!username || !email || !password) {
    throw new Error("Please all the inputs");
  }
  // checking user either exists or not
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("user already exists");
  }

  // solting password by using bcryptjs
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ username, email, password: hashedPassword });

  //Inserting/ save data in database
  try {
    await newUser.save();
    //seting token for userId
    createToken(res, newUser._id);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(400);
    throw new Error("invalid user data");
  }
});

// LoginUser
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    // comparing password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (isPasswordValid) {
      createToken(res, existingUser._id);

      res.status(201).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      });
      return;
    }
  }
});

// LogoutUser
const logoutCurrentUser = asyncHandler(async (req, res) => {
  // res.send(Hello)
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ massage: "logged out user" });
});

// get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

//getCurrent Login profile
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

// update currnet login profile

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  // geting use from DB
  const user = await User.findById(req.user._id);
  // checking is user or not
  if (user) {
    // updating username, email
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    // updating user password
    if (req.body.password) {
      // solting password by using bcryptjs
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }
    // saving data in DB
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// delete user by id for admin
const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Connot delete admin user.");
    }
    await User.deleteOne({ _id: user._id });
    res.json({ massage: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// getUserById for admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

// updateUserById for admin
const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // updating username, email
    user.username = req.body.username || user.username;

    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);
    console.log(req.body.username, req.body.email, req.body.isAdmin);

    // // updating user password this code not for admin becouse admin cannot change user password

    // if (req.body.password) {
    //   // solting password by using bcryptjs
    //   const salt = await bcrypt.genSalt(10);
    //   const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //   user.password = hashedPassword;
    // }

    // saving data in DB
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};
