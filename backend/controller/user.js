const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

async function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_KEY, { expiresIn: "3d" });
}

const registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Please Enter all the Feilds");
    }
    const user = await User.findOne({ email });

    if (user && user.matchPassword(password)) {
      let token = await generateToken(user._id);
      console.log(token);

      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: token,
      });
    }

    return res.status(401).send("Invalid Email or Password");
  } catch (error) {
    return res.status(401).send("Invalid Email or Pasword");
  }
};

// /api/user?search=par
const allUserController = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(keyword);
    res.status(200).send(users);
    // .find({_id:{$ne:req.user._id}})
    console.log(keyword);
  } catch (error) {}
};

module.exports = { registerUser, loginController, allUserController };
